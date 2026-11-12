import { NextRequest, NextResponse } from "next/server";
import { SIDES, SIDE_SIZE } from "@/lib/secret-santa/config";
import { drawSide } from "@/lib/secret-santa/draw";
import { sendDrawEmails, type DrawEmail } from "@/lib/secret-santa/mail";
import { env, getStore, hasSession, sameOrigin, siteOrigin } from "@/lib/secret-santa/server";
import { drawnSides, inSide, isLocked, isSide, SIDE_KEYS } from "@/lib/secret-santa/state";
import type { Participant } from "@/lib/secret-santa/store";
import { linkToken } from "@/lib/secret-santa/tokens";

const fail = (error: string, status: number) => NextResponse.json({ error }, { status });

/** What the admin screen shows. No wish lists and no pairings. */
async function overview() {
  const store = getStore();
  const [people, pairs] = await Promise.all([store.list(), store.pairs()]);
  const drawn = drawnSides(pairs);
  return {
    participants: people.map((p) => ({
      id: p.id,
      name: p.name,
      email: p.email,
      inA: p.inA,
      inB: p.inB,
      partnerId: p.partnerId,
      locked: isLocked(p, drawn),
    })),
    sides: Object.fromEntries(
      SIDE_KEYS.map((side) => [
        side,
        {
          label: SIDES[side],
          assigned: people.filter((p) => inSide(p, side)).length,
          size: SIDE_SIZE,
          drawn: drawn.has(side),
        },
      ]),
    ),
  };
}

export async function GET() {
  if (!(await hasSession("admin"))) return fail("locked", 401);
  return NextResponse.json(await overview());
}

function emailFor(req: NextRequest, p: Participant, drawn: Set<string>): DrawEmail {
  return {
    name: p.name,
    email: p.email,
    link: `${siteOrigin(req)}/secret-santa/draw#${linkToken(env().secret, p.id)}`,
    sideNames: SIDE_KEYS.filter((side) => drawn.has(side) && inSide(p, side)).map((side) => SIDES[side]),
  };
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return fail("forbidden", 403);
  if (!(await hasSession("admin"))) return fail("locked", 401);

  const body = await req.json().catch(() => null);
  const store = getStore();
  const [people, pairs] = await Promise.all([store.list(), store.pairs()]);
  const drawn = drawnSides(pairs);
  const person = people.find((p) => p.id === body?.id);

  switch (body?.action) {
    case "update": {
      if (!person) return fail("not-found", 404);
      const patch: { inA?: boolean; inB?: boolean; partnerId?: string | null } = {};
      if (typeof body.inA === "boolean") patch.inA = body.inA;
      if (typeof body.inB === "boolean") patch.inB = body.inB;
      if (body.partnerId === null || typeof body.partnerId === "string") patch.partnerId = body.partnerId;

      const partner = patch.partnerId ? people.find((p) => p.id === patch.partnerId) : null;
      if (patch.partnerId && (!partner || partner.id === person.id)) return fail("not-found", 404);

      // Once a santa is drawn, nobody in it can change, and nobody can join it.
      const previousPartner = people.find((p) => p.id === person.partnerId);
      const touched = [person, ...(patch.partnerId !== undefined ? [partner, previousPartner] : [])];
      const joinsDrawnSide = (patch.inA && drawn.has("a")) || (patch.inB && drawn.has("b"));
      if (joinsDrawnSide || touched.some((p) => p && isLocked(p, drawn))) return fail("drawn", 409);

      await store.update(person.id, patch);
      break;
    }

    case "remove": {
      if (!person) return fail("not-found", 404);
      if (isLocked(person, drawn)) return fail("drawn", 409);
      await store.remove(person.id);
      break;
    }

    case "draw": {
      const side = body.side;
      if (!isSide(side)) return fail("invalid", 400);
      if (drawn.has(side)) return fail("already-drawn", 409);

      const members = people.filter((p) => inSide(p, side));
      if (members.length !== SIDE_SIZE) return fail("wrong-size", 409);

      const partnerOf = Object.fromEntries(people.filter((p) => p.partnerId).map((p) => [p.id, p.partnerId!]));
      const alreadyHas = Object.fromEntries(pairs.map((p) => [p.giverId, p.receiverId]));
      const result = drawSide(members.map((p) => p.id), partnerOf, alreadyHas);
      if (!result) return fail("impossible", 409);

      if ((await store.saveDraw(side, result)) === "already-drawn") return fail("already-drawn", 409);

      const nowDrawn = new Set([...drawn, side]);
      const failed = await sendDrawEmails(members.map((p) => emailFor(req, p, nowDrawn)));
      return NextResponse.json({ ...(await overview()), failed });
    }

    case "resend": {
      if (!person) return fail("not-found", 404);
      if (!isLocked(person, drawn)) return fail("not-drawn", 409);
      const failed = await sendDrawEmails([emailFor(req, person, drawn)]);
      return NextResponse.json({ ...(await overview()), failed });
    }

    case "pairs": {
      if (!isSide(body.side)) return fail("invalid", 400);
      const nameOf = new Map(people.map((p) => [p.id, p.name]));
      return NextResponse.json({
        pairs: pairs
          .filter((p) => p.side === body.side)
          .map((p) => ({ giver: nameOf.get(p.giverId) ?? "?", receiver: nameOf.get(p.receiverId) ?? "?" }))
          .sort((x, y) => x.giver.localeCompare(y.giver)),
      });
    }

    case "wipe": {
      if (body.confirm !== "DELETE") return fail("invalid", 400);
      await store.wipe();
      break;
    }

    default:
      return fail("invalid", 400);
  }

  return NextResponse.json(await overview());
}
