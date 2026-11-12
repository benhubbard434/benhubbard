# Secret Santa Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A private, unlisted secret santa on benhubbard.co.uk: password-gated sign-up, a per-person draw page reached by emailed link, and an admin section where Ben assigns sides, marks couples and runs each draw.

**Architecture:** Pure logic (draw, signing) in `lib/secret-santa/` with unit tests. A small `Store` interface with a Supabase implementation (production) and an in-memory one (local dev only, so the flows can be exercised without touching the real database). Route handlers under `app/api/secret-santa/` do every check server side; pages under `app/secret-santa/` render nothing sensitive before those checks pass.

**Tech Stack:** Next.js 16.3.4 (App Router, async `cookies()`), React 19, Supabase JS (service role), Resend, Node 24 built-in test runner (`node --test`, native TypeScript).

**Spec:** `docs/superpowers/specs/2026-11-12-secret-santa-design.md`

## Global Constraints

- Read the relevant guide in `node_modules/next/dist/docs/` before writing Next code.
- Never `git push`. Commit locally.
- Env: `SANTA_PASSWORD`, `SANTA_ADMIN_PASSWORD`, `SANTA_SECRET`. No secret or password in git.
- Sides: `a` = "Hubbard", `b` = "Algar". Side size exactly 9. Max 12 participants.
- Input caps: name 80, email 254, items 200.
- Attempt limit: 5 wrong guesses per 15 minutes per salted IP hash.
- Cookies: `HttpOnly`, `Secure` (in production), `SameSite=Lax`, path `/`; 30 days shared, 8 hours admin. (Path is `/` not `/secret-santa` so the API routes under `/api/secret-santa` receive it; the names are `santa_session` and `santa_admin`.)
- Headers on `/secret-santa/:path*` and `/api/secret-santa/:path*`: `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer`, `Cache-Control: no-store`.
- The recipient's name never appears in an email. Participants never see anyone else's draw.
- Dev mode: `SANTA_DEV=1` with `NODE_ENV !== "production"` selects the memory store and logs emails to the console instead of sending. Ignored in production.

## Review Focus

1. Two clicks on "run the draw" (or two tabs): exactly one draw is saved; the second gets "already drawn".
2. A participant's link with a tampered id or token: refused, no data, counts as an attempt.
3. A draw that has no valid solution (e.g. constraints too tight): admin sees a clear message, nothing saved.
4. Resend fails for some people: draw still stands, admin sees who to resend to.
5. Someone signs up with different capitalisation or spaces around the same email: treated as the same person.

---

### Task 1: Draw logic and signing (pure, tested)

**Files:**
- Create: `lib/secret-santa/config.ts`, `lib/secret-santa/draw.ts`, `lib/secret-santa/tokens.ts`
- Test: `lib/secret-santa/draw.test.ts`, `lib/secret-santa/tokens.test.ts`
- Modify: `package.json` (script `"test": "node --test lib/secret-santa/"`), `tsconfig.json` (`allowImportingTsExtensions: true`)

**Interfaces (produces):**
- `config.ts`: `SIDES = { a: "Hubbard", b: "Algar" } as const`, `type Side = "a" | "b"`, `SIDE_SIZE = 9`, `MAX_PARTICIPANTS = 12`, `LIMITS = { name: 80, email: 254, item: 200 }`, `ATTEMPTS = { max: 5, windowMs: 15 * 60_000 }`.
- `draw.ts`: `drawSide(people: string[], partnerOf: Record<string, string>, alreadyHas: Record<string, string>, randomInt?: (max: number) => number): Record<string, string> | null` — giver id → receiver id. Fisher–Yates shuffle with `crypto.randomInt`, retry up to 5000 times, `null` if none valid. Valid means: a permutation, no self, receiver ≠ `partnerOf[giver]`, receiver ≠ `alreadyHas[giver]`.
- `tokens.ts` (node:crypto only, no project imports): `safeEqual(a: string, b: string): boolean`; `linkToken(secret, id): string` = `${id}.${hmac}`; `readLinkToken(secret, token): string | null` (the id); `makeSession(secret, role: "member" | "admin", ttlMs, now?): string`; `readSession(secret, value, role, now?): boolean`; `hashIp(secret, ip): string`.

- [ ] Tests for `drawSide`: 200 runs over 9 people with 3 couples and an `alreadyHas` map all satisfy every rule and are permutations; two people who are partners → `null`; 3 people where constraints leave no option → `null`; output differs across runs.
- [ ] Tests for tokens: round trip; tampered id, tampered mac, wrong secret, empty string → `null`/`false`; expired session → `false`; a member session is not accepted as admin; `safeEqual` on different lengths → `false`.
- [ ] Run `npm test`: fail, implement, pass. Commit.

### Task 2: Store, SQL and server helpers

**Files:**
- Create: `supabase/003-secret-santa.sql`, `lib/secret-santa/store.ts`, `lib/secret-santa/memory-store.ts`, `lib/secret-santa/supabase-store.ts`, `lib/secret-santa/server.ts`, `lib/secret-santa/mail.ts`
- Test: `lib/secret-santa/memory-store.test.ts`
- Modify: `.env.example`

**Interfaces (produces):**
- `store.ts`: `type Participant = { id; name; email; items: [string, string, string]; inA: boolean; inB: boolean; partnerId: string | null }`; `type Pair = { side: Side; giverId: string; receiverId: string }`;
  `interface Store { list(): Promise<Participant[]>; add(p: Omit<Participant, "id" | "inA" | "inB" | "partnerId">): Promise<"ok" | "duplicate" | "full">; update(id, patch: { inA?: boolean; inB?: boolean; partnerId?: string | null }): Promise<void>; remove(id): Promise<void>; pairs(): Promise<Pair[]>; saveDraw(side, pairs: Record<string, string>): Promise<"ok" | "already-drawn">; wipe(): Promise<void>; countAttempts(ipHash, sinceMs): Promise<number>; addAttempt(ipHash): Promise<void> }`; `getStore(): Store`.
- `update` keeps partners symmetric (setting A→B sets B→A and clears either's previous partner). `add` lowercases and trims the email.
- `saveDraw` in Supabase is one multi-row insert; the unique constraints make a second draw fail as a whole → `"already-drawn"`.
- `server.ts`: `env()` (throws a clear error if a var is missing), `isMember()`, `isAdmin()`, `setSession(role)`, `sameOrigin(req)`, `clientIp(req)`, `tooManyAttempts(req)`, `recordAttempt(req)`, `siteOrigin(req)`.
- `mail.ts`: `sendDrawEmail(to: { name; email }, link: string, sideNames: string[]): Promise<boolean>`.
- SQL: tables per the spec, RLS enabled with no policies, `partner_id` `on delete set null`, draws `on delete cascade`.

- [ ] Memory store tests: duplicate email with different case/spaces → `"duplicate"`; 13th add → `"full"`; partner symmetry including re-pairing; second `saveDraw` for a side → `"already-drawn"`; `wipe` empties everything.
- [ ] Implement, `npm test` passes. Commit.

### Task 3: API routes

**Files:**
- Create: `app/api/secret-santa/unlock/route.ts`, `signup/route.ts`, `my-draw/route.ts`, `admin/route.ts`
- Modify: `next.config.ts` (headers)

**Behaviour:**
- Every POST: `sameOrigin` or 403.
- `unlock` `{ password, role }`: 429 if over the limit; wrong → record attempt, 401; right → set cookie.
- `signup` `{ name, email, items[3] }`: needs member cookie; closed when 12 signed up or both sides drawn; validate, cap, store. 409 on duplicate.
- `my-draw` `{ token }`: 429 if over the limit; bad token or unknown id → record attempt, 401. Returns `{ name, sides: [{ side, label, drawn, recipient?: { name, items } }] }` for sides the person is in.
- `admin` GET (admin cookie): `{ participants: [{ id, name, email, inA, inB, partnerId }], sides: { a: { assigned, drawn }, b: {...} } }` — no items, no pairs. POST `{ action }`: `update`, `remove` (both refused if a side the person is in is drawn), `draw` (`{ side }`; exactly 9, undrawn; `drawSide` → `null` gives 409 with a message; save; email all; returns `{ failed: string[] }` names), `resend` (`{ id }`), `pairs` (`{ side }` → `[{ giver, receiver }]` names), `wipe` (`{ confirm: "DELETE" }`).

- [ ] Implement. With `SANTA_DEV=1`, exercise with curl: wrong password ×6 → 429 on the 6th; unlock; sign up; duplicate → 409; admin flow; draw twice → second 409; my-draw with good and tampered token. Commit.

### Task 4: Pages and design

**Files:**
- Create: `app/secret-santa/layout.tsx`, `page.tsx`, `Gate.tsx`, `SignupForm.tsx`, `draw/page.tsx`, `draw/DrawClient.tsx`, `admin/page.tsx`, `admin/AdminClient.tsx`, `santa.css`, `Motifs.tsx`
- Create: `components/SiteChrome.tsx` (client; renders children unless the pathname starts with `/secret-santa`)
- Modify: `app/layout.tsx` (wrap `GlobalTabRail` and `BottomNav` in `SiteChrome`)

**Behaviour:** per the spec's Pages section. Server pages check the cookie and render `Gate` or the content. `DrawClient` reads `location.hash`, posts it to `my-draw`, and without a hash falls back to the gated "not yet / check your email" state. Admin pairs are fetched only on the "show pairs" click and dropped on hide.

**Look:** modern Scandi Christmas per the spec; phone first.

- [ ] Build, then walk every flow in the browser at phone and desktop width in dev mode: gate, sign up 12 people, closed state, admin assign + couples, draw both sides, open a logged link, reveal pairs, wipe. `npm run lint` and `npm run build` pass. Commit.
