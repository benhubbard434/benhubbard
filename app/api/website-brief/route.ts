import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";
import { briefSections, isAnswered, type BriefAnswers } from "@/lib/website-brief";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const answers: BriefAnswers = body?.answers ?? {};

  // The honeypot was filled in, so this is a bot. Pretend it worked.
  if (body?.website) return NextResponse.json({ ok: true });

  // Only questions the brief actually asks are read, each capped in length.
  const clean: Record<string, string> = {};
  for (const field of briefSections.flatMap((s) => s.fields)) {
    const raw = answers[field.id];
    const value = Array.isArray(raw) ? raw.map(String).join(", ") : typeof raw === "string" ? raw : "";
    if (field.required && !isAnswered(value)) {
      return NextResponse.json({ error: `Missing ${field.id}` }, { status: 400 });
    }
    clean[field.id] = value.trim().slice(0, 5000);
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const html = briefSections
    .map((section) => {
      const rows = section.fields
        .filter((f) => clean[f.id])
        .map(
          (f) => `
            <p style="margin:0 0 4px;color:#666;font-size:13px">${escape(f.label)}</p>
            <p style="margin:0 0 16px">${escape(clean[f.id]).replace(/\n/g, "<br>")}</p>`
        )
        .join("");
      return rows ? `<h3 style="margin:28px 0 12px">${escape(section.title)}</h3>${rows}` : "";
    })
    .join("");

  const who = clean.organisation ? `${clean.name} (${clean.organisation})` : clean.name;

  const resend = new Resend(process.env.RESEND_API_KEY!);
  const { error } = await resend.emails.send({
    from: "Ben Hubbard <hello@email.benhubbard.co.uk>",
    to: process.env.CONTACT_EMAIL!,
    replyTo: clean.email,
    subject: `New website brief from ${who}`,
    html: `<h2>New website project brief</h2>${html}`,
  });

  // Nothing is stored, so if the email fails the brief is lost: tell the
  // client, whose answers are still saved in their browser to try again.
  if (error) {
    console.error("Resend send error:", error);
    return NextResponse.json({ error: "Email failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
