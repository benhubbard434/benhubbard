import type { Side } from "./config.ts";

export type Participant = {
  id: string;
  name: string;
  email: string;
  /** At least three wishes, in the order they were given. */
  items: string[];
  inA: boolean;
  inB: boolean;
  partnerId: string | null;
};

export type NewParticipant = Pick<Participant, "name" | "email" | "items">;

export type Pair = { side: Side; giverId: string; receiverId: string };

export type ParticipantPatch = { inA?: boolean; inB?: boolean; partnerId?: string | null };

/** Everything the secret santa keeps. Nothing else is stored anywhere. */
export interface Store {
  list(): Promise<Participant[]>;
  /** Emails are compared trimmed and lowercased. */
  add(person: NewParticipant): Promise<"ok" | "duplicate" | "full">;
  /** Setting a partner sets it both ways and frees any previous partners. */
  update(id: string, patch: ParticipantPatch): Promise<void>;
  remove(id: string): Promise<void>;
  pairs(): Promise<Pair[]>;
  /** All or nothing: a side that already has a draw is left untouched. */
  saveDraw(side: Side, draw: Record<string, string>): Promise<"ok" | "already-drawn">;
  wipe(): Promise<void>;
  countAttempts(ipHash: string, sinceMs: number): Promise<number>;
  addAttempt(ipHash: string): Promise<void>;
}

export const normaliseEmail = (email: string) => email.trim().toLowerCase();
