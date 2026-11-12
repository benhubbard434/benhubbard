import { Resend } from "resend";
import { isDev } from "./server.ts";

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export type DrawEmail = { name: string; email: string; link: string; sideNames: string[] };

function compose(m: DrawEmail) {
  const which = m.sideNames.join(" and ");
  const html = `
    <div style="background:#f6f1e7;padding:40px 16px;font-family:Georgia,'Times New Roman',serif;color:#22352b">
      <div style="max-width:480px;margin:0 auto;background:#fffdf8;border:1px solid #e3dccb;border-radius:4px;padding:40px 32px;text-align:center">
        <p style="margin:0 0 8px;font-size:28px;color:#a8322a;letter-spacing:6px">&#10022; &#10022; &#10022;</p>
        <h1 style="margin:0 0 16px;font-size:26px;font-weight:normal">The names are drawn</h1>
        <p style="margin:0 0 28px;font-size:16px;line-height:1.6">
          Hello ${escape(m.name)}. The ${escape(which)} secret santa has been drawn.
          Your name and their wish list are waiting behind the button below.
        </p>
        <a href="${escape(m.link)}" style="display:inline-block;background:#22352b;color:#fffdf8;text-decoration:none;font-family:Helvetica,Arial,sans-serif;font-size:15px;padding:14px 28px;border-radius:999px">See who you drew</a>
        <p style="margin:28px 0 0;font-size:13px;line-height:1.6;color:#6d7a70;font-family:Helvetica,Arial,sans-serif">
          This link is yours alone. Anyone who has it can see your draw, so please don't forward this email.
        </p>
      </div>
    </div>`;
  const text = `Hello ${m.name}. The ${which} secret santa has been drawn. See who you drew: ${m.link}\n\nThis link is yours alone, so please don't forward this email.`;
  return {
    from: "Secret Santa <hello@email.benhubbard.co.uk>",
    to: m.email,
    subject: "Your secret santa draw is ready",
    html,
    text,
  };
}

/**
 * Tells people their draw is ready. Each email carries only that person's
 * link, never the name they drew. Sent as one batch, since Resend limits how
 * many separate requests a second it accepts. Returns the names of anyone
 * whose email could not be sent.
 */
export async function sendDrawEmails(messages: DrawEmail[]): Promise<string[]> {
  if (messages.length === 0) return [];

  if (isDev()) {
    for (const m of messages) {
      console.log(`[secret santa] email for ${m.name} <${m.email}> (${m.sideNames.join(" and ")}): ${m.link}`);
    }
    return [];
  }

  const everyone = messages.map((m) => m.name);
  try {
    const resend = new Resend(process.env.RESEND_API_KEY!);
    const { error } = await resend.batch.send(messages.map(compose));
    if (error) console.error("Secret santa emails failed:", error.name);
    return error ? everyone : [];
  } catch {
    console.error("Secret santa emails failed to send");
    return everyone;
  }
}
