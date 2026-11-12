import { NextRequest, NextResponse } from "next/server";
import { LIMITS, MAX_PARTICIPANTS } from "@/lib/secret-santa/config";
import { getStore, hasSession, sameOrigin } from "@/lib/secret-santa/server";
import { drawnSides, SIDE_KEYS } from "@/lib/secret-santa/state";

const clean = (value: unknown, max: number) =>
  typeof value === "string" ? value.trim().replace(/\s+/g, " ").slice(0, max) : "";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  if (!(await hasSession("member"))) return NextResponse.json({ error: "locked" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const name = clean(body?.name, LIMITS.name);
  const email = clean(body?.email, LIMITS.email);
  const rawItems: unknown[] = Array.isArray(body?.items) ? body.items : [];
  const items = [0, 1, 2].map((i) => clean(rawItems[i], LIMITS.item)) as [string, string, string];

  if (!name || items.some((item) => !item) || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const store = getStore();
  const drawn = drawnSides(await store.pairs());
  if (SIDE_KEYS.every((side) => drawn.has(side)) || (await store.list()).length >= MAX_PARTICIPANTS) {
    return NextResponse.json({ error: "closed" }, { status: 409 });
  }

  const result = await store.add({ name, email, items });
  if (result === "duplicate") return NextResponse.json({ error: "duplicate" }, { status: 409 });
  if (result === "full") return NextResponse.json({ error: "closed" }, { status: 409 });
  return NextResponse.json({ ok: true });
}
