import { test } from "node:test";
import assert from "node:assert/strict";
import { cleanWishes } from "./wishes.ts";

test("three wishes are accepted and tidied", () => {
  assert.deepEqual(cleanWishes(["  socks ", "a   book", "tea"]), ["socks", "a book", "tea"]);
});

test("the first three are required", () => {
  assert.equal(cleanWishes(["socks", "book"]), null);
  assert.equal(cleanWishes(["socks", "  ", "tea"]), null);
  assert.equal(cleanWishes(["socks", "book", 3]), null);
  assert.equal(cleanWishes("socks"), null);
  assert.equal(cleanWishes(undefined), null);
});

test("extra wishes are kept, and empty extras are dropped", () => {
  assert.deepEqual(cleanWishes(["a", "b", "c", "", "d", "   ", "e"]), ["a", "b", "c", "d", "e"]);
});

test("no more than eight wishes are kept", () => {
  const twelve = Array.from({ length: 12 }, (_, i) => `wish ${i + 1}`);
  assert.deepEqual(cleanWishes(twelve), twelve.slice(0, 8));
});

test("each wish is capped at 200 characters", () => {
  const result = cleanWishes(["x".repeat(500), "b", "c"]);
  assert.equal(result?.[0].length, 200);
});
