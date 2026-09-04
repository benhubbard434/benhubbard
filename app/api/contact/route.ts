import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, topic, message } = body;

  if (!name || !email || !topic || !message) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error: dbError } = await supabase.from("contact_submissions").insert({
    name,
    email,
    topic,
    message,
  });

  if (dbError) {
    console.error("Supabase insert error:", dbError);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  const resend = new Resend(process.env.RESEND_API_KEY!);
  // The SDK reports failures on the result rather than throwing, so an
  // unchecked call reports success however the send actually went.
  const { error: mailError } = await resend.emails.send({
    from: "Ben Hubbard <hello@email.benhubbard.co.uk>",
    to: process.env.CONTACT_EMAIL!,
    subject: `New contact: ${topic} from ${name}`,
    html: `
      <h2>New contact form submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Topic:</strong> ${topic}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
    `,
  });

  // The message is already saved, so the sender is told it arrived either
  // way — but the failure needs to reach the logs rather than vanish.
  if (mailError) {
    console.error("Resend send error:", mailError);
    return NextResponse.json({ ok: true, emailed: false });
  }

  return NextResponse.json({ ok: true, emailed: true });
}
