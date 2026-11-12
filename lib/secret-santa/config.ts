/** The two santas. Six people are in both; each has nine in total. */
export const SIDES = { a: "Hubbard", b: "Algar" } as const;
export type Side = keyof typeof SIDES;

export const SIDE_SIZE = 9;
export const MAX_PARTICIPANTS = 12;

/** Longest accepted value for each sign-up field. */
export const LIMITS = { name: 80, email: 254, item: 200 } as const;

/** Wrong password or link guesses allowed per visitor before a lockout. */
export const ATTEMPTS = { max: 5, windowMs: 15 * 60_000 } as const;

export const SESSION_MS = { member: 30 * 24 * 60 * 60_000, admin: 8 * 60 * 60_000 } as const;
