"use client";

import { useState } from "react";
import { LIMITS } from "@/lib/secret-santa/config";
import { Fir, Star } from "./Motifs";

const ERRORS: Record<string, string> = {
  duplicate: "That email is already signed up. If you need to change your list, ask Ben.",
  closed: "Sign-ups have just closed.",
  invalid: "Please fill in every box, with a valid email address.",
  locked: "Your visit has timed out. Refresh the page and enter the password again.",
};

export default function SignupForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [items, setItems] = useState(["", "", ""]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/secret-santa/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, items }),
    }).catch(() => null);
    setBusy(false);

    if (res?.ok) return setDone(true);
    const code = (await res?.json().catch(() => null))?.error;
    setError(ERRORS[code] ?? "Something went wrong. Please try again.");
  }

  if (done) {
    return (
      <section className="santa-card santa-center">
        <Fir />
        <p className="santa-eyebrow">You&rsquo;re in</p>
        <h1 className="santa-title">Thank you, {name.trim().split(" ")[0]}</h1>
        <p className="santa-lede">
          When the names are drawn, an email will arrive at <strong>{email.trim()}</strong> with your own private
          link. There&rsquo;s nothing more to do until then.
        </p>
      </section>
    );
  }

  return (
    <section className="santa-card">
      <div className="santa-center">
        <Star />
        <p className="santa-eyebrow">Christmas</p>
        <h1 className="santa-title">Secret Santa</h1>
        <p className="santa-lede">Add your name and three things you&rsquo;d be glad to unwrap.</p>
      </div>

      <form onSubmit={submit} className="santa-form">
        <label className="santa-field">
          <span>Your name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} maxLength={LIMITS.name} autoComplete="name" required />
        </label>
        <label className="santa-field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={LIMITS.email}
            autoComplete="email"
            required
          />
          <small>Only used to send you your draw.</small>
        </label>

        <fieldset className="santa-wishes">
          <legend>Your wish list</legend>
          {items.map((item, i) => (
            <label className="santa-field santa-wish" key={i}>
              <span aria-hidden="true">{i + 1}</span>
              <input
                aria-label={`Wish ${i + 1}`}
                value={item}
                onChange={(e) => setItems(items.map((old, j) => (j === i ? e.target.value : old)))}
                maxLength={LIMITS.item}
                required
              />
            </label>
          ))}
        </fieldset>

        {error && <p className="santa-error" role="alert">{error}</p>}
        <button className="santa-button" disabled={busy}>
          {busy ? "Adding you…" : "Add me to the hat"}
        </button>
        <p className="santa-note">
          We keep your name, email and these three wishes, and nothing else. It is all deleted after Christmas.
        </p>
      </form>
    </section>
  );
}
