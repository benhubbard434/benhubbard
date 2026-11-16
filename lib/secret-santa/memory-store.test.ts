import { test } from "node:test";
import assert from "node:assert/strict";
import { createMemoryStore } from "./memory-store.ts";

const person = (n: number) => ({
  name: `Person ${n}`,
  email: `p${n}@example.com`,
  items: ["one", "two", "three"],
});

test("the same email in a different case or with spaces is a duplicate", async () => {
  const store = createMemoryStore();
  assert.equal(await store.add(person(1)), "ok");
  assert.equal(await store.add({ ...person(1), email: "  P1@Example.com " }), "duplicate");
  assert.equal((await store.list()).length, 1);
  assert.equal((await store.list())[0].email, "p1@example.com");
});

test("the thirteenth sign-up is refused", async () => {
  const store = createMemoryStore();
  for (let i = 1; i <= 12; i++) assert.equal(await store.add(person(i)), "ok");
  assert.equal(await store.add(person(13)), "full");
});

test("partners are kept symmetric, including when someone is re-paired", async () => {
  const store = createMemoryStore();
  for (let i = 1; i <= 3; i++) await store.add(person(i));
  const [a, b, c] = (await store.list()).map((p) => p.id);
  const partners = async () => Object.fromEntries((await store.list()).map((p) => [p.id, p.partnerId]));

  await store.update(a, { partnerId: b });
  assert.deepEqual(await partners(), { [a]: b, [b]: a, [c]: null });

  await store.update(a, { partnerId: c });
  assert.deepEqual(await partners(), { [a]: c, [b]: null, [c]: a });

  await store.update(c, { partnerId: null });
  assert.deepEqual(await partners(), { [a]: null, [b]: null, [c]: null });
});

test("removing someone frees their partner", async () => {
  const store = createMemoryStore();
  for (let i = 1; i <= 2; i++) await store.add(person(i));
  const [a, b] = (await store.list()).map((p) => p.id);
  await store.update(a, { partnerId: b, inA: true });
  await store.remove(a);
  const left = await store.list();
  assert.equal(left.length, 1);
  assert.equal(left[0].partnerId, null);
});

test("a side can only be drawn once", async () => {
  const store = createMemoryStore();
  assert.equal(await store.saveDraw("a", { x: "y", y: "x" }), "ok");
  assert.equal(await store.saveDraw("a", { x: "y", y: "x" }), "already-drawn");
  assert.equal(await store.saveDraw("b", { x: "y", y: "x" }), "ok");
  assert.equal((await store.pairs()).length, 4);
});

test("attempts are counted per visitor within the window", async () => {
  const store = createMemoryStore();
  await store.addAttempt("one");
  await store.addAttempt("one");
  await store.addAttempt("two");
  assert.equal(await store.countAttempts("one", Date.now() - 1000), 2);
  assert.equal(await store.countAttempts("one", Date.now() + 1000), 0);
});

test("wipe removes people, draws and attempts", async () => {
  const store = createMemoryStore();
  await store.add(person(1));
  await store.saveDraw("a", { x: "y", y: "x" });
  await store.addAttempt("one");
  await store.wipe();
  assert.equal((await store.list()).length, 0);
  assert.equal((await store.pairs()).length, 0);
  assert.equal(await store.countAttempts("one", 0), 0);
});

test("wishes beyond the first three are kept", async () => {
  const store = createMemoryStore();
  await store.add({ ...person(1), items: ["one", "two", "three", "four", "five"] });
  assert.deepEqual((await store.list())[0].items, ["one", "two", "three", "four", "five"]);
});
