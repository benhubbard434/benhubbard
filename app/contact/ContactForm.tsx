"use client";

import { useState } from "react";

const topics = [
  "Content Collaboration",
  "CX Consulting",
  "Let's Work Together",
];

type FormData = {
  name: string;
  email: string;
  topic: string;
  message: string;
};

export default function ContactForm() {
  const [step, setStep] = useState(1);
  const total = 5;
  const [form, setForm] = useState<FormData>({ name: "", email: "", topic: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, total));
  const prev = () => setStep((s) => Math.max(s - 1, 1));

  async function submit() {
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Submission failed");
      next(); // step 5 = thank you
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-lg">
      <div
        className="rounded-2xl p-8 shadow-2xl"
        style={{ backgroundColor: "rgba(245,243,255,0.95)" }}
      >
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 text-sm text-gray-400">
          <button
            onClick={prev}
            disabled={step === 1}
            aria-label="Previous step"
            className="w-6 h-6 flex items-center justify-center disabled:opacity-20 hover:text-black transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span>{step} of {total}</span>
          <button
            onClick={next}
            disabled={step >= total}
            aria-label="Next step"
            className="w-6 h-6 flex items-center justify-center disabled:opacity-20 hover:text-black transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M4 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Step 1 — intro */}
        {step === 1 && (
          <div>
            <h2 className="font-display text-h2 mb-3">Let&apos;s talk!</h2>
            <p className="text-gray-500 mb-8 leading-relaxed">
              Got a project, idea, or just want to connect? Fill in a few details and I&apos;ll get back to you.
            </p>
            <button
              onClick={next}
              className="w-full py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors"
            >
              Get Started
            </button>
          </div>
        )}

        {/* Step 2 — name + email */}
        {step === 2 && (
          <div>
            <h3 className="font-subhead text-h3 mb-6">I&apos;ll need a few details first...</h3>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="your@email.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                />
              </div>
            </div>
            <button
              onClick={next}
              disabled={!form.name || !form.email}
              className="w-full mt-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 3 — topic */}
        {step === 3 && (
          <div>
            <h3 className="font-subhead text-h3 mb-6">What shall we work together on?</h3>
            <div className="flex flex-col gap-3">
              {topics.map((t) => (
                <button
                  key={t}
                  onClick={() => setForm({ ...form, topic: t })}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left text-sm font-medium transition-colors ${
                    form.topic === t
                      ? "border-black bg-black text-white"
                      : "border-gray-200 hover:border-gray-400"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
            <button
              onClick={next}
              disabled={!form.topic}
              className="w-full mt-6 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}

        {/* Step 4 — message */}
        {step === 4 && (
          <div>
            <h3 className="font-subhead text-h3 mb-2">Tell me more</h3>
            <p className="text-gray-500 text-sm mb-6">
              What&apos;s on your mind? The more detail, the better.
            </p>
            <textarea
              rows={5}
              placeholder="Your message..."
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-black resize-none"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <button
              onClick={submit}
              disabled={!form.message || submitting}
              className="w-full mt-4 py-3 rounded-xl bg-black text-white font-medium hover:bg-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? "Sending…" : "Send Message"}
            </button>
          </div>
        )}

        {/* Step 5 — thank you */}
        {step === 5 && (
          <div className="text-center py-4">
            <div className="text-4xl mb-4">👋</div>
            <h3 className="font-subhead text-h3 mb-3">Message sent!</h3>
            <p className="text-gray-500">
              Thanks {form.name ? form.name.split(" ")[0] : ""}! I&apos;ll be in touch soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
