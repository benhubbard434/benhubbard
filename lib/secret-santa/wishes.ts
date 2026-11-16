import { LIMITS, WISHES } from "./config.ts";

/**
 * Tidies a submitted wish list. The first three wishes are required; any
 * further ones are optional, so blank extras are dropped rather than refused.
 * Returns null when the list isn't acceptable.
 */
export function cleanWishes(raw: unknown): string[] | null {
  if (!Array.isArray(raw)) return null;
  const tidy = raw
    .slice(0, WISHES.max)
    .map((wish) => (typeof wish === "string" ? wish.trim().replace(/\s+/g, " ").slice(0, LIMITS.item) : ""));
  if (tidy.length < WISHES.min || tidy.slice(0, WISHES.min).some((wish) => !wish)) return null;
  return [...tidy.slice(0, WISHES.min), ...tidy.slice(WISHES.min).filter(Boolean)];
}
