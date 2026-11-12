import { randomUUID } from "node:crypto";
import { MAX_PARTICIPANTS } from "./config.ts";
import { normaliseEmail, type Pair, type Participant, type Store } from "./store.ts";

/**
 * Keeps everything in memory. Used by the tests and by local development
 * (SANTA_DEV=1), never in production: it forgets everything on restart.
 */
export function createMemoryStore(): Store {
  let people: Participant[] = [];
  let pairs: Pair[] = [];
  let attempts: { ipHash: string; at: number }[] = [];

  const unpair = (ids: (string | null)[]) => {
    for (const p of people) {
      if (ids.includes(p.id) || ids.includes(p.partnerId)) p.partnerId = null;
    }
  };

  return {
    async list() {
      return people.map((p) => ({ ...p, items: [...p.items] }));
    },

    async add(person) {
      const email = normaliseEmail(person.email);
      if (people.some((p) => p.email === email)) return "duplicate";
      if (people.length >= MAX_PARTICIPANTS) return "full";
      people.push({ ...person, email, id: randomUUID(), inA: false, inB: false, partnerId: null });
      return "ok";
    },

    async update(id, patch) {
      const person = people.find((p) => p.id === id);
      if (!person) return;
      if (patch.inA !== undefined) person.inA = patch.inA;
      if (patch.inB !== undefined) person.inB = patch.inB;
      if (patch.partnerId !== undefined) {
        const partner = people.find((p) => p.id === patch.partnerId && p.id !== id);
        unpair([id, partner?.id ?? null].filter(Boolean));
        if (partner) {
          person.partnerId = partner.id;
          partner.partnerId = person.id;
        }
      }
    },

    async remove(id) {
      unpair([id]);
      people = people.filter((p) => p.id !== id);
      pairs = pairs.filter((p) => p.giverId !== id && p.receiverId !== id);
    },

    async pairs() {
      return pairs.map((p) => ({ ...p }));
    },

    async saveDraw(side, draw) {
      if (pairs.some((p) => p.side === side)) return "already-drawn";
      for (const [giverId, receiverId] of Object.entries(draw)) pairs.push({ side, giverId, receiverId });
      return "ok";
    },

    async wipe() {
      people = [];
      pairs = [];
      attempts = [];
    },

    async countAttempts(ipHash, sinceMs) {
      return attempts.filter((a) => a.ipHash === ipHash && a.at >= sinceMs).length;
    },

    async addAttempt(ipHash) {
      attempts.push({ ipHash, at: Date.now() });
    },
  };
}
