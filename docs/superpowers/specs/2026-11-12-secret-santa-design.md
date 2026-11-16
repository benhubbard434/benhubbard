# Secret Santa — design

Date: 2026-11-12

## Intent

Ben is running a family secret santa across two sides of the family. Twelve
people take part: six are in both santas, and each side has three more, so
each santa has nine people. He wants a small private app on benhubbard.co.uk
where family sign up with a wish list, and later see who they are buying for.

It must hold as little data as possible, be hard to get into, and stay out of
search engines.

## Goals

- Sign-up page: name, email, three wish list items, with the option to add
  up to five more (added 2026-11-16).
- Draw page: blank ("the draw hasn't happened yet") until Ben runs the draw,
  then shows each person only their own recipient(s) and that person's three
  items.
- Admin section for Ben: put people into one or both santas, mark couples,
  run each draw, wipe everything afterwards.
- The draw is random, never pairs a couple, never gives someone themselves.
- Look: modern Scandi Christmas.

## Non-goals

- Accounts, logins per person, or password resets.
- Editing a wish list after signing up. Before the draw, Ben removes the
  person in admin and they sign up again. (Claude's call.)
- Re-running a draw. Once drawn, a santa stays drawn until everything is
  deleted. (Claude's call.)
- Budgets, messaging, reminders, gift tracking.
- Reuse for other groups or other years without a wipe.

## Anti-goals

- A participant seeing anyone's draw but their own. (Ben, as admin, can
  reveal the pairs: his decision.)
- The drawn name appearing in an email.
- The pages turning up in search results, or the site nav linking to them.
- Passwords or secrets committed to the repo.

## Constraints

- Lives in this repo: Next.js 16.3.4 on Netlify. `AGENTS.md` applies: read the
  relevant guide in `node_modules/next/dist/docs/` before writing code.
- Uses what is already here: Supabase (service-role key, server side only) and
  Resend (`hello@email.benhubbard.co.uk`).
- Netlify functions keep no memory between requests, so anything that must
  persist (attempt limits, state) lives in Supabase or a signed cookie.
- Never `git push` without Ben saying so.
- One honest limit, already explained to Ben: the draw is stored in Supabase,
  so Ben could read it there anyway. Admin shows it only on an explicit click.

## Approaches considered

How each person sees their own draw:

1. **Emailed personal link (chosen by Ben).** After the draw each person gets
   an email with a long unguessable link. Only someone with their inbox can
   see their draw.
2. Type your email on the draw page. Rejected: anyone in the family who knows
   your address can look up your draw.
3. Email the result itself. Rejected: the name sits in inboxes, and Ben asked
   for a page.

## Design

### Pages

All under `app/secret-santa/`. None are linked from the nav or anywhere else.
The site's `BottomNav` and `GlobalTabRail` must not render on these pages.

- **`/secret-santa`** — shows only a password box until the shared password
  is entered. Then the sign-up form: name, email, item 1, item 2, item 3, all
  required. On success, a thank-you state saying the draw link will arrive by
  email. A one-line note says what is stored and that it is deleted after
  Christmas. When 12 people have signed up, or both draws are done, the form
  is replaced by "sign-ups are closed".
- **`/secret-santa/draw`** — opened without a personal link: behind the shared
  password, shows "the draw hasn't happened yet" before any draw, and "check
  your email for your personal link" after. Opened from a personal link: no
  password asked; shows the person's name, then one card per santa they are
  in that has been drawn, each with the recipient's name and three items. A
  santa they are in that is not drawn yet shows as "not drawn yet".
- **`/secret-santa/admin`** — its own password. Shows:
  - each participant: name, email, a tick box for each side, a partner picker,
    a remove button, a "resend link" button (after a draw). Wish list items
    are not shown.
  - per santa: "7 of 9 signed up and assigned" and a "run the draw" button,
    enabled only at exactly 9 and not yet drawn. After: "drawn, N emails
    sent", with any failed sends named so Ben can resend.
  - "delete everything", behind a typed confirmation.
  - per drawn santa: the pairs (giver → receiver), hidden by default behind
    a single "show pairs" click, and hidden again on reload. The pairs are
    fetched from the server only when that button is clicked. (Ben's
    decision.)

Only Ben runs the draws, from admin. The two santas are called **Hubbard**
(side `a`) and **Algar** (side `b`); the names live in one config constant.

### Access

- **Shared password**: env `SANTA_PASSWORD` (value "Christmas", set in
  Netlify, not in git). Compared case-insensitively after trimming, in
  constant time. (Claude's call: family will type "christmas".)
- **Admin password**: env `SANTA_ADMIN_PASSWORD`, a long random value,
  compared exactly.
- On success the server sets a signed cookie (`HttpOnly`, `Secure`,
  `SameSite=Lax`, path `/secret-santa`): 30 days for the shared one, 8 hours
  for admin. Signed with HMAC-SHA256 using env `SANTA_SECRET`; carries role
  and expiry only.
- **Attempt limit**: 5 wrong guesses per 15 minutes per visitor for either
  password, then refused until the window passes. Kept in a small Supabase
  table keyed by a salted hash of the IP, with rows deleted once stale. No
  raw IPs stored.
- **Personal links**: `/secret-santa/draw#<participant id>.<token>` where the
  token is HMAC-SHA256(`SANTA_SECRET`, participant id), base64url. Nothing
  about the link is stored, so the database cannot leak a working link, and
  links can be re-sent. It sits after the `#` so it never reaches server or
  Netlify logs; the page reads it and POSTs it to the API. Checked in
  constant time. Bad tokens count toward the attempt limit.
- Every mutating route checks the `Origin` header matches the site, validates
  and length-caps input (name 80, email 254, items 200), and escapes anything
  put into email HTML.
- No page content, form, or participant data is rendered or returned before
  the relevant check passes. All checks happen on the server.

### Hidden from crawlers

- `robots: { index: false, follow: false }` metadata on the section.
- `X-Robots-Tag: noindex, nofollow`, `Referrer-Policy: no-referrer` and
  `Cache-Control: no-store` headers on `/secret-santa/*` and its API routes.
- Not listed in a `robots.txt` (that would advertise the path and stop
  crawlers seeing the noindex). Not in any sitemap.
- No analytics or third-party scripts on these pages.

### Data

New SQL file `supabase/003-secret-santa.sql`, run by Ben in the Supabase SQL
editor. Row Level Security on, no policies: only the service-role key (server
side) can touch these tables.

- `santa_participants`: id (uuid), name, email (lowercased, unique), item_1,
  item_2, item_3, in_side_a (bool), in_side_b (bool), partner_id (nullable,
  references another participant, kept symmetric), created_at.
- `santa_draws`: side ('a' | 'b'), giver_id, receiver_id; unique on
  (side, giver_id) and (side, receiver_id).
- `santa_attempts`: ip_hash, attempted_at.

That is all that is stored. A duplicate email on sign-up is refused with
"you're already signed up".

### The draw

A pure function: given a side's nine people, the couples, and any pairs
already drawn on the other side, return a random assignment where nobody gets
themselves, nobody gets their partner, and nobody gets the same person they
already have on the other side (Claude's call, offered to Ben). Uses
cryptographic randomness. Shuffle and retry until valid, with a cap; if no
valid draw exists, fail with a clear message in admin and change nothing.

Running it: the server checks the side has exactly 9 and is undrawn, computes
the draw, and saves all nine rows in one atomic step (so two clicks cannot
produce two draws). Then it emails each of the nine their link via Resend.
The email says the draw is done and links to their page; it does not contain
the recipient. Send failures are reported back to admin by name, not stored.

Changing a person's sides or partner, or removing them, is blocked once a
side they are in has been drawn.

### Look

Modern Scandi Christmas: warm off-white ground, muted forest green and berry
red, plenty of space, simple geometric folk motifs (stars, firs, a patterned
border) drawn in SVG, calm type. It has its own look rather than the site's
blue/tomato brand. Works well on a phone, since most family will open the
email link there.

## Left to the builder

- Next 16 specifics (route handlers, cookies, headers, hiding the nav),
  following the bundled docs.
- File layout under `app/secret-santa/`, `app/api/secret-santa/` and
  `lib/secret-santa/`.
- Fonts, exact palette, motifs and copy, shown to Ben in the browser for
  feedback.
- How to run tests: the repo has no test runner. The draw function and the
  token/cookie signing are pure and should be tested.
- `.env.example` gains `SANTA_PASSWORD`, `SANTA_ADMIN_PASSWORD`,
  `SANTA_SECRET`.

## What Ben has to do

- Run `supabase/003-secret-santa.sql` in Supabase.
- Add the three env vars in Netlify.
- Say "push" when ready to go live.
