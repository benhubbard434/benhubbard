import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { MAX_PARTICIPANTS, type Side } from "./config.ts";
import { normaliseEmail, type Participant, type Store } from "./store.ts";

type Row = {
  id: string;
  name: string;
  email: string;
  item_1: string;
  item_2: string;
  item_3: string;
  in_side_a: boolean;
  in_side_b: boolean;
  partner_id: string | null;
};

const UNIQUE_VIOLATION = "23505";
const DAY_MS = 24 * 60 * 60_000;

const toParticipant = (r: Row): Participant => ({
  id: r.id,
  name: r.name,
  email: r.email,
  items: [r.item_1, r.item_2, r.item_3],
  inA: r.in_side_a,
  inB: r.in_side_b,
  partnerId: r.partner_id,
});

/** Throws on any database error, so a failed write is never reported as done. */
function check<T extends { error: { message: string } | null }>(result: T, doing: string): T {
  if (result.error) throw new Error(`Secret santa: ${doing} failed: ${result.error.message}`);
  return result;
}

/**
 * The real store. Uses the service-role key, which must never reach the
 * browser: the tables have Row Level Security on and no public policies.
 */
export function createSupabaseStore(url: string, serviceRoleKey: string): Store {
  const db: SupabaseClient = createClient(url, serviceRoleKey, { auth: { persistSession: false } });
  const people = () => db.from("santa_participants");

  return {
    async list() {
      const { data } = check(await people().select("*").order("created_at"), "listing participants");
      return (data as Row[]).map(toParticipant);
    },

    async add(person) {
      const { count } = check(
        await people().select("id", { count: "exact", head: true }),
        "counting participants",
      );
      if ((count ?? 0) >= MAX_PARTICIPANTS) return "full";

      const { error } = await people().insert({
        name: person.name,
        email: normaliseEmail(person.email),
        item_1: person.items[0],
        item_2: person.items[1],
        item_3: person.items[2],
      });
      if (error?.code === UNIQUE_VIOLATION) return "duplicate";
      check({ error }, "saving a sign-up");
      return "ok";
    },

    async update(id, patch) {
      const sides: Partial<Row> = {};
      if (patch.inA !== undefined) sides.in_side_a = patch.inA;
      if (patch.inB !== undefined) sides.in_side_b = patch.inB;
      if (Object.keys(sides).length) check(await people().update(sides).eq("id", id), "updating sides");

      if (patch.partnerId !== undefined) {
        const partnerId = patch.partnerId && patch.partnerId !== id ? patch.partnerId : null;
        const involved = partnerId ? [id, partnerId] : [id];
        // Free both people, and whoever was paired with either of them.
        check(await people().update({ partner_id: null }).in("partner_id", involved), "clearing partners");
        check(await people().update({ partner_id: null }).in("id", involved), "clearing partners");
        if (partnerId) {
          check(await people().update({ partner_id: partnerId }).eq("id", id), "setting a partner");
          check(await people().update({ partner_id: id }).eq("id", partnerId), "setting a partner");
        }
      }
    },

    async remove(id) {
      // The partner link and any draw rows go with them (see the SQL file).
      check(await people().delete().eq("id", id), "removing a participant");
    },

    async pairs() {
      const { data } = check(await db.from("santa_draws").select("side, giver_id, receiver_id"), "reading draws");
      return (data as { side: Side; giver_id: string; receiver_id: string }[]).map((r) => ({
        side: r.side,
        giverId: r.giver_id,
        receiverId: r.receiver_id,
      }));
    },

    async saveDraw(side, draw) {
      // One statement, so it is all or nothing. The primary key on
      // (side, giver) makes a second draw for the same side fail entirely.
      const rows = Object.entries(draw).map(([giver_id, receiver_id]) => ({ side, giver_id, receiver_id }));
      const { error } = await db.from("santa_draws").insert(rows);
      if (error?.code === UNIQUE_VIOLATION) return "already-drawn";
      check({ error }, "saving the draw");
      return "ok";
    },

    async wipe() {
      check(await db.from("santa_draws").delete().in("side", ["a", "b"]), "deleting draws");
      check(await people().delete().not("id", "is", null), "deleting participants");
      check(await db.from("santa_attempts").delete().gte("id", 0), "deleting attempts");
    },

    async countAttempts(ipHash, sinceMs) {
      const { count } = check(
        await db
          .from("santa_attempts")
          .select("id", { count: "exact", head: true })
          .eq("ip_hash", ipHash)
          .gte("attempted_at", new Date(sinceMs).toISOString()),
        "counting attempts",
      );
      return count ?? 0;
    },

    async addAttempt(ipHash) {
      check(await db.from("santa_attempts").insert({ ip_hash: ipHash }), "recording an attempt");
      // Housekeeping: nothing older than a day is ever needed.
      await db.from("santa_attempts").delete().lt("attempted_at", new Date(Date.now() - DAY_MS).toISOString());
    },
  };
}
