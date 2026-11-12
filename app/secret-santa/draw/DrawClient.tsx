"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import Gate from "../Gate";
import { Fir, Star } from "../Motifs";

type MyDraw = {
  name: string;
  sides: { side: string; label: string; recipient: { name: string; items: string[] } | null }[];
};

// The personal link's token sits after the # so it never reaches the server
// in a page request, and so never lands in a log.
const subscribe = (onChange: () => void) => {
  window.addEventListener("hashchange", onChange);
  return () => window.removeEventListener("hashchange", onChange);
};
const readHash = () => window.location.hash.slice(1);

export default function DrawClient({ status }: { status: "locked" | "waiting" | "drawn" }) {
  const token = useSyncExternalStore<string | null>(subscribe, readHash, () => null);
  const [result, setResult] = useState<{ token: string; draw: MyDraw | null; error: string } | null>(null);

  useEffect(() => {
    if (!token) return;
    let stale = false;
    fetch("/api/secret-santa/my-draw", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then(async (res) => {
        if (stale) return;
        if (res.ok) return setResult({ token, draw: await res.json(), error: "" });
        const error =
          res.status === 429
            ? "Too many tries. Please wait 15 minutes and open your link again."
            : "This link doesn't work. Open the link from your email again, or ask Ben to resend it.";
        setResult({ token, draw: null, error });
      })
      .catch(() => !stale && setResult({ token, draw: null, error: "Something went wrong. Please try again." }));
    return () => {
      stale = true;
    };
  }, [token]);

  // Before the browser has told us whether there is a link, show nothing.
  if (token === null) return null;

  if (token) {
    const current = result?.token === token ? result : null;
    if (!current) return <p className="santa-lede santa-center">Unwrapping…</p>;
    if (!current.draw) return <Message title="Hmm" body={current.error} />;
    return <Draw draw={current.draw} />;
  }

  if (status === "locked") return <Gate role="member" />;
  if (status === "waiting") {
    return (
      <Message
        title="Not yet"
        body="The names haven't been drawn. When they are, you'll get an email with your own private link."
      />
    );
  }
  return (
    <Message
      title="The names are drawn"
      body="Check your email for your own private link. It's the only way to see who you drew."
    />
  );
}

function Message({ title, body }: { title: string; body: string }) {
  return (
    <section className="santa-card santa-center">
      <Fir />
      <p className="santa-eyebrow">Secret Santa</p>
      <h1 className="santa-title">{title}</h1>
      <p className="santa-lede">{body}</p>
    </section>
  );
}

function Draw({ draw }: { draw: MyDraw }) {
  return (
    <section className="santa-draw">
      <div className="santa-center">
        <Star />
        <p className="santa-eyebrow">Your draw</p>
        <h1 className="santa-title">Hello, {draw.name.split(" ")[0]}</h1>
        <p className="santa-lede">Keep it to yourself. That&rsquo;s the whole game.</p>
      </div>
      {draw.sides.map((side) => (
        <Gift key={side.side} label={side.label} recipient={side.recipient} many={draw.sides.length > 1} />
      ))}
    </section>
  );
}

function Gift({
  label,
  recipient,
  many,
}: {
  label: string;
  recipient: { name: string; items: string[] } | null;
  many: boolean;
}) {
  const [open, setOpen] = useState(false);
  const heading = many ? `${label} side` : "You're buying for";

  if (!recipient) {
    return (
      <article className="santa-card santa-gift santa-center">
        <p className="santa-eyebrow">{heading}</p>
        <p className="santa-lede">Not drawn yet. You&rsquo;ll get another email when it is.</p>
      </article>
    );
  }

  return (
    <article className="santa-card santa-gift santa-center">
      <p className="santa-eyebrow">{heading}</p>
      {open ? (
        <>
          {many && <p className="santa-small">You&rsquo;re buying for</p>}
          <h2 className="santa-name">{recipient.name}</h2>
          <p className="santa-small">They&rsquo;d love</p>
          <ol className="santa-list">
            {recipient.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ol>
          <button className="santa-link" onClick={() => setOpen(false)}>
            Hide again
          </button>
        </>
      ) : (
        <button className="santa-button santa-reveal" onClick={() => setOpen(true)}>
          Tap to reveal
        </button>
      )}
    </article>
  );
}
