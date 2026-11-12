"use client";

import { useEffect, useState } from "react";

type Person = {
  id: string;
  name: string;
  email: string;
  inA: boolean;
  inB: boolean;
  partnerId: string | null;
  locked: boolean;
};
type SideInfo = { label: string; assigned: number; size: number; drawn: boolean };
type Overview = { participants: Person[]; sides: Record<"a" | "b", SideInfo>; failed?: string[] };
type Pairs = { giver: string; receiver: string }[];

const ERRORS: Record<string, string> = {
  locked: "Your admin session has ended. Refresh the page and sign in again.",
  drawn: "That can't change: a santa this person is in has already been drawn.",
  "already-drawn": "That santa has already been drawn.",
  "wrong-size": "That santa doesn't have the right number of people yet.",
  impossible: "No draw fits these couples. Check who is marked as partners.",
  "not-drawn": "This person hasn't been drawn yet, so there is no link to send.",
};

export default function AdminClient() {
  const [data, setData] = useState<Overview | null>(null);
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [pairs, setPairs] = useState<Partial<Record<"a" | "b", Pairs>>>({});
  const [confirmText, setConfirmText] = useState("");

  async function call(body: object) {
    setBusy(true);
    const res = await fetch("/api/secret-santa/admin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }).catch(() => null);
    const json = await res?.json().catch(() => null);
    setBusy(false);
    if (!res?.ok) {
      setNotice(ERRORS[json?.error] ?? "Something went wrong. Please try again.");
      return null;
    }
    return json;
  }

  useEffect(() => {
    fetch("/api/secret-santa/admin")
      .then(async (res) => {
        if (res.ok) setData(await res.json());
        else setNotice(ERRORS.locked);
      })
      .catch(() => setNotice("Something went wrong. Please refresh the page."));
  }, []);

  /** Runs an action that answers with the refreshed overview. */
  async function act(body: object, success = "") {
    setNotice("");
    const json: Overview | null = await call(body);
    if (!json) return;
    setData(json);
    if (json.failed?.length) {
      setNotice(`Email didn't send for: ${json.failed.join(", ")}. Use "Resend link" for each of them.`);
    } else if (success) {
      setNotice(success);
    }
  }

  async function togglePairs(side: "a" | "b") {
    if (pairs[side]) return setPairs({ ...pairs, [side]: undefined });
    setNotice("");
    const json = await call({ action: "pairs", side });
    if (json) setPairs({ ...pairs, [side]: json.pairs });
  }

  if (!data) return <p className="santa-lede santa-center">{notice || "Loading…"}</p>;

  const people = data.participants;
  const anyDrawn = data.sides.a.drawn || data.sides.b.drawn;

  return (
    <section className="santa-admin">
      <header>
        <p className="santa-eyebrow">Organiser</p>
        <h1 className="santa-title">Secret Santa</h1>
        <p className="santa-lede">
          {people.length} of 12 signed up. Tick each person&rsquo;s side and mark the couples for everyone{" "}
          <strong>before</strong> running either draw. Once a santa is drawn, the people in it are locked.
        </p>
      </header>

      {notice && <p className="santa-notice" role="status">{notice}</p>}

      <div className="santa-sides">
        {(["a", "b"] as const).map((side) => {
          const info = data.sides[side];
          const ready = info.assigned === info.size;
          return (
            <article className="santa-card" key={side}>
              <p className="santa-eyebrow">{info.label} santa</p>
              {info.drawn ? (
                <>
                  <p className="santa-count">Drawn</p>
                  <p className="santa-small">Everyone has been emailed their link.</p>
                  <button className="santa-link" onClick={() => togglePairs(side)} disabled={busy}>
                    {pairs[side] ? "Hide pairs" : "Show pairs"}
                  </button>
                  {pairs[side] && (
                    <ul className="santa-pairs">
                      {pairs[side]!.map((p) => (
                        <li key={p.giver}>
                          <span>{p.giver}</span>
                          <span aria-label="buys for">→</span>
                          <span>{p.receiver}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <>
                  <p className="santa-count">
                    {info.assigned} <span>of {info.size}</span>
                  </p>
                  <p className="santa-small">
                    {ready ? "Ready to draw." : `Needs exactly ${info.size} people ticked.`}
                  </p>
                  <button
                    className="santa-button"
                    disabled={busy || !ready}
                    onClick={() => {
                      if (window.confirm(`Run the ${info.label} draw and email all ${info.size} people? This can't be undone.`)) {
                        act({ action: "draw", side }, `${info.label} is drawn and everyone has been emailed.`);
                      }
                    }}
                  >
                    Run the {info.label} draw
                  </button>
                </>
              )}
            </article>
          );
        })}
      </div>

      <div className="santa-card santa-people">
        {people.length === 0 && <p className="santa-small">Nobody has signed up yet.</p>}
        {people.map((p) => (
          <div className="santa-person" key={p.id}>
            <div className="santa-who">
              <strong>{p.name}</strong>
              <span>{p.email}</span>
            </div>
            <div className="santa-ticks">
              {(["a", "b"] as const).map((side) => {
                const key = side === "a" ? "inA" : "inB";
                return (
                  <label key={side}>
                    <input
                      type="checkbox"
                      checked={p[key]}
                      disabled={busy || p.locked || data.sides[side].drawn}
                      onChange={(e) => act({ action: "update", id: p.id, [key]: e.target.checked })}
                    />
                    {data.sides[side].label}
                  </label>
                );
              })}
            </div>
            <label className="santa-partner">
              <span>Partner</span>
              <select
                value={p.partnerId ?? ""}
                disabled={busy || p.locked}
                onChange={(e) => act({ action: "update", id: p.id, partnerId: e.target.value || null })}
              >
                <option value="">None</option>
                {people
                  .filter((other) => other.id !== p.id && (!other.locked || other.id === p.partnerId))
                  .map((other) => (
                    <option key={other.id} value={other.id}>
                      {other.name}
                    </option>
                  ))}
              </select>
            </label>
            <div className="santa-actions">
              {p.locked ? (
                <button
                  className="santa-link"
                  disabled={busy}
                  onClick={() => act({ action: "resend", id: p.id }, `Link resent to ${p.name}.`)}
                >
                  Resend link
                </button>
              ) : (
                <button
                  className="santa-link santa-danger"
                  disabled={busy}
                  onClick={() => {
                    if (window.confirm(`Remove ${p.name}? They would need to sign up again.`)) {
                      act({ action: "remove", id: p.id });
                    }
                  }}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="santa-card santa-wipe">
        <p className="santa-eyebrow">After Christmas</p>
        <p className="santa-small">
          Deletes every name, email, wish list and draw{anyDrawn ? ", and stops every emailed link working" : ""}. This
          can&rsquo;t be undone. Type DELETE to confirm.
        </p>
        <div className="santa-wipe-row">
          <input
            aria-label="Type DELETE to confirm"
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            placeholder="DELETE"
          />
          <button
            className="santa-button santa-button-danger"
            disabled={busy || confirmText !== "DELETE"}
            onClick={async () => {
              await act({ action: "wipe", confirm: "DELETE" }, "Everything has been deleted.");
              setConfirmText("");
              setPairs({});
            }}
          >
            Delete everything
          </button>
        </div>
      </div>
    </section>
  );
}
