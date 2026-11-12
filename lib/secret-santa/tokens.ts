import { createHmac, timingSafeEqual } from "node:crypto";

export type Role = "member" | "admin";

/** Each use gets its own prefix so one kind of token can't pass as another. */
const mac = (secret: string, purpose: string, value: string) =>
  createHmac("sha256", secret).update(`${purpose}:${value}`).digest("base64url");

/** Constant-time string comparison that tolerates different lengths. */
export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * A participant's personal link token. It is derived from the server secret
 * rather than stored, so the database holds nothing that could open a draw.
 */
export function linkToken(secret: string, id: string): string {
  return `${id}.${mac(secret, "link", id)}`;
}

/** Returns the participant id a link token belongs to, or null. */
export function readLinkToken(secret: string, token: string): string | null {
  const dot = token.indexOf(".");
  if (dot < 1) return null;
  const id = token.slice(0, dot);
  return safeEqual(token.slice(dot + 1), mac(secret, "link", id)) ? id : null;
}

/** A signed cookie value: role, expiry time and a signature over both. */
export function makeSession(secret: string, role: Role, ttlMs: number, now = Date.now()): string {
  const body = `${role}.${now + ttlMs}`;
  return `${body}.${mac(secret, "session", body)}`;
}

export function readSession(secret: string, value: string, role: Role, now = Date.now()): boolean {
  const parts = value.split(".");
  if (parts.length !== 3) return false;
  const [gotRole, expiry, signature] = parts;
  if (!safeEqual(signature, mac(secret, "session", `${gotRole}.${expiry}`))) return false;
  return gotRole === role && Number(expiry) > now;
}

/** Attempt limiting keys on this rather than the address itself. */
export function hashIp(secret: string, ip: string): string {
  return mac(secret, "ip", ip);
}
