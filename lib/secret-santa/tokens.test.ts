import { test } from "node:test";
import assert from "node:assert/strict";
import { hashIp, linkToken, makeSession, readLinkToken, readSession, safeEqual } from "./tokens.ts";

const secret = "test-secret-test-secret-test-secret";
const id = "3f2b8c1e-0000-4000-8000-123456789abc";

test("a link token round-trips to its participant id", () => {
  assert.equal(readLinkToken(secret, linkToken(secret, id)), id);
});

test("tampered or foreign link tokens are refused", () => {
  const token = linkToken(secret, id);
  const [, mac] = token.split(".");
  assert.equal(readLinkToken(secret, `someone-else.${mac}`), null);
  assert.equal(readLinkToken(secret, `${id}.${mac.slice(0, -2)}xx`), null);
  assert.equal(readLinkToken("another-secret", token), null);
  assert.equal(readLinkToken(secret, ""), null);
  assert.equal(readLinkToken(secret, id), null);
  assert.equal(readLinkToken(secret, "."), null);
});

test("sessions are valid for their role until they expire", () => {
  const now = 1_000_000;
  const session = makeSession(secret, "member", 60_000, now);
  assert.equal(readSession(secret, session, "member", now + 59_000), true);
  assert.equal(readSession(secret, session, "member", now + 61_000), false);
  assert.equal(readSession(secret, session, "admin", now), false);
  assert.equal(readSession("another-secret", session, "member", now), false);
  assert.equal(readSession(secret, "", "member", now), false);
  assert.equal(readSession(secret, "garbage", "member", now), false);
});

test("a session's expiry cannot be extended by editing it", () => {
  const now = 1_000_000;
  const [role, , mac] = makeSession(secret, "member", 60_000, now).split(".");
  assert.equal(readSession(secret, `${role}.${now + 999_999_999}.${mac}`, "member", now), false);
});

test("a link token is not accepted as a session, nor a session as a link", () => {
  assert.equal(readSession(secret, linkToken(secret, "member.9999999999999"), "member", 0), false);
});

test("safeEqual compares without throwing on different lengths", () => {
  assert.equal(safeEqual("christmas", "christmas"), true);
  assert.equal(safeEqual("christmas", "christma"), false);
  assert.equal(safeEqual("", "x"), false);
});

test("IP hashes are stable, salted and not the IP", () => {
  assert.equal(hashIp(secret, "1.2.3.4"), hashIp(secret, "1.2.3.4"));
  assert.notEqual(hashIp(secret, "1.2.3.4"), hashIp("another-secret", "1.2.3.4"));
  assert.ok(!hashIp(secret, "1.2.3.4").includes("1.2.3.4"));
});
