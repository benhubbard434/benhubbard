import { NextRequest, NextResponse } from "next/server";
import { env, recordAttempt, sameOrigin, setSession, tooManyAttempts } from "@/lib/secret-santa/server";
import { safeEqual } from "@/lib/secret-santa/tokens";

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null);
  const password = typeof body?.password === "string" ? body.password.slice(0, 200) : "";
  const role = body?.role === "admin" ? "admin" : "member";

  if (await tooManyAttempts(req)) return NextResponse.json({ error: "locked" }, { status: 429 });

  // Family will type the shared password in any capitalisation. The admin
  // password is long and random, so it has to match exactly.
  const ok =
    role === "admin"
      ? safeEqual(password, env().adminPassword)
      : safeEqual(password.trim().toLowerCase(), env().password.trim().toLowerCase());

  if (!ok) {
    await recordAttempt(req);
    return NextResponse.json({ error: "wrong" }, { status: 401 });
  }

  await setSession(role);
  return NextResponse.json({ ok: true });
}
