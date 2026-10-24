"use client";

import { useEffect, useRef, useState } from "react";
import { briefSections, isAnswered, type BriefAnswers, type BriefField } from "@/lib/website-brief";

// A long form, so answers are kept in the browser between visits. Storage can
// be missing or blocked, in which case the form simply starts empty.
const DRAFT_KEY = "website-brief-draft";

const inputClass =
  "w-full border border-gray-300 rounded-lg px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-black";

export default function BriefForm() {
  // 0 = intro, 1..n = sections, n + 1 = thank you
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<BriefAnswers>({});
  const [website, setWebsite] = useState(""); // honeypot
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const loaded = useRef(false);
  const top = useRef<HTMLDivElement>(null);

  const total = briefSections.length;
  const section = briefSections[step - 1];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- restoring a draft only exists client-side
      if (saved) setAnswers(JSON.parse(saved));
    } catch {}
    loaded.current = true;
  }, []);

  useEffect(() => {
    if (!loaded.current) return;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(answers));
    } catch {}
  }, [answers]);

  function go(to: number) {
    setStep(to);
    setError("");
    top.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function set(id: string, value: string | string[]) {
    setAnswers((a) => ({ ...a, [id]: value }));
  }

  const missing = section?.fields.filter((f) => f.required && !isAnswered(answers[f.id])) ?? [];
  const emailInvalid =
    section?.fields.some((f) => f.type === "email") &&
    !!answers.email &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(answers.email));

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/website-brief", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers, website }),
      });
      if (!res.ok) throw new Error("Submission failed");
      try {
        localStorage.removeItem(DRAFT_KEY);
      } catch {}
      go(total + 1);
    } catch {
      setError("Something went wrong. Please try again — your answers are saved.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div ref={top} className="w-full max-w-2xl scroll-mt-8">
      <div className="rounded-2xl p-6 sm:p-10 shadow-2xl" style={{ backgroundColor: "rgba(245,243,255,0.97)" }}>
        {step === 0 && (
          <div>
            <h1 className="font-display text-h2 mb-3">Let&apos;s build your website</h1>
            <p className="text-gray-500 mb-4 leading-relaxed">
              This brief helps me understand your business, your audience and what you need the site to do,
              so our first conversation can get straight to the good stuff.
            </p>
            <p className="text-gray-500 mb-8 leading-relaxed">
              There are {total} short sections and it takes about 15 minutes. Only a few questions are required —
              answer what you can, and &ldquo;not sure&rdquo; is always fine. Your answers are saved in this
              browser as you go.
            </p>
            <button
              onClick={() => go(1)}
              className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {section && (
          <div>
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
                <span>
                  {step} of {total}
                </span>
                <span>{section.title}</span>
              </div>
              <div className="h-1 rounded-full bg-gray-200 overflow-hidden">
                <div
                  className="h-full bg-black transition-[width] duration-300"
                  style={{ width: `${(step / total) * 100}%` }}
                />
              </div>
            </div>

            <h2 className="font-subhead text-h3 mb-1">{section.title}</h2>
            <p className="text-gray-500 text-sm mb-8">{section.intro}</p>

            <div className="flex flex-col gap-7">
              {section.fields.map((field) => (
                <Field key={field.id} field={field} value={answers[field.id]} onChange={(v) => set(field.id, v)} />
              ))}
            </div>

            {/* Hidden from people; bots that fill every field give themselves away. */}
            {step === 1 && (
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="absolute -left-[9999px] h-0 w-0 opacity-0"
              />
            )}

            {emailInvalid && <p className="text-red-500 text-sm mt-4">That email address doesn&apos;t look right.</p>}
            {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

            <div className="flex gap-3 mt-10">
              <button
                onClick={() => go(step - 1)}
                className="px-6 py-3 rounded-xl border-2 border-gray-200 font-medium hover:border-gray-400 transition-colors"
              >
                Back
              </button>
              {step < total ? (
                <button
                  onClick={() => go(step + 1)}
                  disabled={missing.length > 0 || emailInvalid}
                  className="flex-1 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={submit}
                  disabled={missing.length > 0 || submitting}
                  className="flex-1 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending…" : "Send brief"}
                </button>
              )}
            </div>
            {missing.length > 0 && (
              <p className="text-gray-400 text-xs mt-3 text-center">Fill in the fields marked * to continue.</p>
            )}
          </div>
        )}

        {step === total + 1 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">🚀</div>
            <h2 className="font-subhead text-h3 mb-3">Brief received!</h2>
            <p className="text-gray-500">
              Thanks{answers.name ? ` ${String(answers.name).split(" ")[0]}` : ""}! I&apos;ll read through it and
              be in touch soon to talk next steps.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  field,
  value,
  onChange,
}: {
  field: BriefField;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
}) {
  const id = `brief-${field.id}`;
  const label = (
    <>
      {field.label}
      {field.required && <span className="text-[var(--color-tomato-jam)]"> *</span>}
    </>
  );
  const hint = field.hint && <p className="text-xs text-gray-400 mb-2">{field.hint}</p>;

  if (field.type === "choice" || field.type === "multi") {
    const selected = Array.isArray(value) ? value : value ? [value] : [];
    const toggle = (option: string) => {
      if (field.type === "choice") onChange(selected.includes(option) ? "" : option);
      else onChange(selected.includes(option) ? selected.filter((o) => o !== option) : [...selected, option]);
    };
    return (
      <fieldset>
        <legend className="block text-sm font-medium text-gray-700 mb-1">{label}</legend>
        {hint}
        <div className="flex flex-wrap gap-2 mt-2">
          {field.options.map((option) => {
            const on = selected.includes(option);
            return (
              <button
                key={option}
                type="button"
                role={field.type === "choice" ? "radio" : "checkbox"}
                aria-checked={on}
                onClick={() => toggle(option)}
                className={`px-4 py-2 rounded-full border-2 text-sm font-medium transition-colors ${
                  on ? "border-black bg-black text-white" : "border-gray-200 bg-white hover:border-gray-400"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </fieldset>
    );
  }

  const text = typeof value === "string" ? value : "";
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {hint}
      {field.type === "textarea" ? (
        <textarea
          id={id}
          rows={field.rows ?? 3}
          placeholder={field.placeholder}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={`${inputClass} resize-y`}
        />
      ) : (
        <input
          id={id}
          type={field.type}
          placeholder={"placeholder" in field ? field.placeholder : undefined}
          value={text}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      )}
    </div>
  );
}
