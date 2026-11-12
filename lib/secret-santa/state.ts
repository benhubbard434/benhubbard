import { SIDES, type Side } from "./config.ts";
import type { Pair, Participant } from "./store.ts";

export const SIDE_KEYS = Object.keys(SIDES) as Side[];

export const isSide = (value: unknown): value is Side => value === "a" || value === "b";

export const inSide = (p: Participant, side: Side) => (side === "a" ? p.inA : p.inB);

/** Which santas have been drawn. */
export function drawnSides(pairs: Pair[]): Set<Side> {
  return new Set(pairs.map((p) => p.side));
}

/** True when a santa this person is in has been drawn, which locks them. */
export function isLocked(p: Participant, drawn: Set<Side>): boolean {
  return SIDE_KEYS.some((side) => drawn.has(side) && inSide(p, side));
}
