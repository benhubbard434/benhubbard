import { test } from "node:test";
import assert from "node:assert/strict";
import { drawSide } from "./draw.ts";

const people = ["p1", "p2", "p3", "p4", "p5", "p6", "p7", "p8", "p9"];
const couples: Record<string, string> = {
  p1: "p2", p2: "p1",
  p3: "p4", p4: "p3",
  p5: "p6", p6: "p5",
};
// What six of them already drew on the other side.
const alreadyHas: Record<string, string> = {
  p1: "p3", p2: "p5", p3: "p6", p4: "p1", p5: "p2", p6: "p4",
};

test("every draw is a valid permutation that respects all the rules", () => {
  for (let i = 0; i < 200; i++) {
    const result = drawSide(people, couples, alreadyHas);
    assert.ok(result, "a draw should exist");
    assert.deepEqual(Object.keys(result).sort(), [...people].sort());
    assert.deepEqual(Object.values(result).sort(), [...people].sort());
    for (const [giver, receiver] of Object.entries(result)) {
      assert.notEqual(receiver, giver, "nobody draws themselves");
      assert.notEqual(receiver, couples[giver], "nobody draws their partner");
      assert.notEqual(receiver, alreadyHas[giver], "nobody draws the same person twice");
    }
  }
});

test("draws vary between runs", () => {
  const seen = new Set<string>();
  for (let i = 0; i < 30; i++) seen.add(JSON.stringify(drawSide(people, {}, {})));
  assert.ok(seen.size > 5);
});

test("two people who are a couple cannot be drawn", () => {
  assert.equal(drawSide(["a", "b"], { a: "b", b: "a" }, {}), null);
});

test("three people with no valid option left returns null", () => {
  // a and b are a couple, so both can only give to c.
  assert.equal(drawSide(["a", "b", "c"], { a: "b", b: "a" }, {}), null);
});

test("fewer than two people cannot be drawn", () => {
  assert.equal(drawSide(["a"], {}, {}), null);
  assert.equal(drawSide([], {}, {}), null);
});
