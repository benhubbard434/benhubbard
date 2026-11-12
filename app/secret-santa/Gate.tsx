"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "./Motifs";

/** The password screen. Nothing behind it is rendered until the server agrees. */
export default function Gate({ role }: { role: "member" | "admin" }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const res = await fetch("/api/secret-santa/unlock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, role }),
    }).catch(() => null);
    setBusy(false);

    if (res?.ok) return router.refresh();
    if (res?.status === 429) setError("Too many tries. Please wait 15 minutes and try again.");
    else if (res?.status === 401) setError("That's not the password.");
    else setError("Something went wrong. Please try again.");
  }

  return (
    <section className="santa-card santa-center">
      <Star />
      <p className="santa-eyebrow">{role === "admin" ? "Organiser" : "Family only"}</p>
      <h1 className="santa-title">Secret Santa</h1>
      <p className="santa-lede">
        {role === "admin" ? "Enter the organiser password." : "Enter the family password to come in."}
      </p>
      <form onSubmit={submit} className="santa-form">
        <label className="santa-field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={role === "admin" ? "current-password" : "off"}
            required
            autoFocus
          />
        </label>
        {error && <p className="santa-error" role="alert">{error}</p>}
        <button className="santa-button" disabled={busy}>
          {busy ? "Checking…" : "Come in"}
        </button>
      </form>
    </section>
  );
}
