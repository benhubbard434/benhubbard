import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { ATTEMPTS, SESSION_MS } from "./config.ts";
import { createMemoryStore } from "./memory-store.ts";
import type { Store } from "./store.ts";
import { createSupabaseStore } from "./supabase-store.ts";
import { hashIp, makeSession, readSession, type Role } from "./tokens.ts";

const COOKIE: Record<Role, string> = { member: "santa_session", admin: "santa_admin" };

/**
 * Local development only: keeps everything in memory and prints emails to
 * the terminal instead of sending them. Has no effect in production.
 */
export const isDev = () => process.env.NODE_ENV !== "production" && process.env.SANTA_DEV === "1";

function need(name: string, devValue: string): string {
  const value = process.env[name];
  if (value) return value;
  if (isDev()) return devValue;
  throw new Error(`Secret santa: the ${name} environment variable is not set`);
}

export const env = () => ({
  password: need("SANTA_PASSWORD", "dev"),
  adminPassword: need("SANTA_ADMIN_PASSWORD", "dev-admin"),
  secret: need("SANTA_SECRET", "dev-secret-not-for-production"),
});

// Route handlers can be bundled separately in development, so the memory
// store hangs off globalThis to be shared between them.
const shared = globalThis as { __santaStore?: Store };

export function getStore(): Store {
  if (!shared.__santaStore) {
    shared.__santaStore = isDev()
      ? createMemoryStore()
      : createSupabaseStore(
          need("NEXT_PUBLIC_SUPABASE_URL", ""),
          need("SUPABASE_SERVICE_ROLE_KEY", ""),
        );
  }
  return shared.__santaStore;
}

export async function hasSession(role: Role): Promise<boolean> {
  const value = (await cookies()).get(COOKIE[role])?.value;
  return value ? readSession(env().secret, value, role) : false;
}

export async function setSession(role: Role): Promise<void> {
  const ttl = SESSION_MS[role];
  (await cookies()).set(COOKIE[role], makeSession(env().secret, role, ttl), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(ttl / 1000),
  });
}

/**
 * Refuses form posts that another website tricked a browser into sending:
 * the page that sent the request has to be this site.
 */
export function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get("origin");
  if (!origin) return false;
  let host: string;
  try {
    host = new URL(origin).host;
  } catch {
    return false;
  }
  // Behind Netlify the original host can arrive in either header, and URL is
  // the site's own address.
  const ours = [req.headers.get("host"), req.headers.get("x-forwarded-host")];
  if (process.env.URL) ours.push(new URL(process.env.URL).host);
  return ours.includes(host);
}

function visitor(req: NextRequest): string {
  const ip =
    req.headers.get("x-nf-client-connection-ip") ??
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown";
  return hashIp(env().secret, ip);
}

export async function tooManyAttempts(req: NextRequest): Promise<boolean> {
  const count = await getStore().countAttempts(visitor(req), Date.now() - ATTEMPTS.windowMs);
  return count >= ATTEMPTS.max;
}

export async function recordAttempt(req: NextRequest): Promise<void> {
  await getStore().addAttempt(visitor(req));
}

/** Where emailed links point. Netlify sets URL to the site's main address. */
export function siteOrigin(req: NextRequest): string {
  return isDev() ? req.nextUrl.origin : (process.env.URL ?? req.nextUrl.origin);
}
