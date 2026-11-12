import { NextRequest, NextResponse } from "next/server";
import { SIDES } from "@/lib/secret-santa/config";
import { env, getStore, recordAttempt, sameOrigin, tooManyAttempts } from "@/lib/secret-santa/server";
import { inSide, SIDE_KEYS } from "@/lib/secret-santa/state";
import { readLinkToken } from "@/lib/secret-santa/tokens";

/** Returns one person's own draw, and nothing about anyone else's. */
export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (await tooManyAttempts(req)) return NextResponse.json({ error: "locked" }, { status: 429 });

  const body = await req.json().catch(() => null);
  const token = typeof body?.token === "string" ? body.token.slice(0, 200) : "";
  const id = readLinkToken(env().secret, token);

  const store = getStore();
  const people = id ? await store.list() : [];
  const me = people.find((p) => p.id === id);
  if (!me) {
    await recordAttempt(req);
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const pairs = await store.pairs();
  const sides = SIDE_KEYS.filter((side) => inSide(me, side)).map((side) => {
    const pair = pairs.find((p) => p.side === side && p.giverId === me.id);
    const recipient = pair && people.find((p) => p.id === pair.receiverId);
    return {
      side,
      label: SIDES[side],
      recipient: recipient ? { name: recipient.name, items: recipient.items } : null,
    };
  });

  return NextResponse.json({ name: me.name, sides });
}
