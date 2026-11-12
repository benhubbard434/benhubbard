import { randomInt as cryptoRandomInt } from "node:crypto";

const MAX_TRIES = 5000;

/**
 * Draws one santa. Returns giver id → receiver id, or null when no draw can
 * satisfy the rules.
 *
 * Rules: everyone gives once and receives once; nobody draws themselves,
 * their partner (`partnerOf`), or the person they already have on the other
 * side (`alreadyHas`).
 *
 * Shuffles and retries rather than building a draw step by step, so every
 * valid draw is equally likely.
 */
export function drawSide(
  people: string[],
  partnerOf: Record<string, string>,
  alreadyHas: Record<string, string>,
  randomInt: (max: number) => number = cryptoRandomInt,
): Record<string, string> | null {
  if (people.length < 2) return null;

  for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
    const receivers = [...people];
    for (let i = receivers.length - 1; i > 0; i--) {
      const j = randomInt(i + 1);
      [receivers[i], receivers[j]] = [receivers[j], receivers[i]];
    }

    const valid = people.every((giver, i) => {
      const receiver = receivers[i];
      return receiver !== giver && receiver !== partnerOf[giver] && receiver !== alreadyHas[giver];
    });
    if (valid) return Object.fromEntries(people.map((giver, i) => [giver, receivers[i]]));
  }
  return null;
}
