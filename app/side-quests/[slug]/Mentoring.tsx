"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

const INK = "#111";

const TANGENT = {
  home: "https://www.jointangent.com",
  mentors: "https://www.jointangent.com/beamentor",
};

/** Tangent's own figures, from its jobseekers page. */
const STATS = [
  { figure: "9×", label: "More likely to be hired through a referral" },
  { figure: "82%", label: "Of companies rank referrals as their best hiring channel" },
  { figure: "70%", label: "Of people get hired through their professional connections" },
];

const HELP = [
  {
    title: "Intro calls",
    body: "A first chat about where they are, where they want to be, and what a CSM or BDR actually does all day.",
  },
  {
    title: "CV reviews",
    body: "What to cut, what to keep, and how to make experience from outside tech read as the real thing it is.",
  },
  {
    title: "Interview prep",
    body: "Practice runs for the questions CS hiring managers ask, from the side of the table that asks them.",
  },
  {
    title: "Referrals",
    body: "When the fit is right, putting someone forward to a recruiting team instead of into a pile of applications.",
  },
];

/** How mentoring on Tangent works, as its mentors page lays it out. */
const STEPS = [
  { title: "Sign up", body: "Every mentor is vetted: you have to work in tech and sign up with LinkedIn." },
  { title: "Discover", body: "Jobseekers post a short video intro instead of a cover letter. You browse the feed." },
  { title: "Connect", body: "Message someone whose story lands with you, and set up a call." },
  { title: "Support", body: "Mentor them until they're hired: CV, interviews, and a referral if you choose." },
];

const MARQUEE = ["Intro calls", "CV reviews", "Interview prep", "Referrals", "Paying it forward"];

const COMPASS = 148;

/**
 * An oversized compass whose needle swings round to point at the cursor,
 * the 404's googly eyes' cousin. Left alone, it settles back to north.
 */
function Compass() {
  const ref = useRef<HTMLDivElement>(null);
  // Accumulated rather than 0–360, so crossing south doesn't spin it the
  // long way round.
  const [angle, setAngle] = useState(0);
  const last = useRef(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let idle: ReturnType<typeof setTimeout>;

    const turnTo = (target: number) => {
      let delta = target - (last.current % 360);
      delta = ((delta + 540) % 360) - 180;
      last.current += delta;
      setAngle(last.current);
    };

    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      if (Math.hypot(dx, dy) < 4) return;
      // 0° is up, as the needle is drawn
      turnTo((Math.atan2(dy, dx) * 180) / Math.PI + 90);
      clearTimeout(idle);
      idle = setTimeout(() => turnTo(0), 2500);
    };

    window.addEventListener("mousemove", onMove);
    return () => {
      clearTimeout(idle);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    <div
      ref={ref}
      className="relative rounded-full bg-white"
      style={{ width: COMPASS, height: COMPASS, border: `6px solid ${INK}` }}
      aria-hidden="true"
    >
      {["N", "E", "S", "W"].map((point, i) => (
        <span
          key={point}
          className="font-display absolute inset-0 flex justify-center pt-1.5 text-xs"
          style={{ rotate: `${i * 90}deg` }}
        >
          {point}
        </span>
      ))}
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        style={{
          rotate: `${angle}deg`,
          transition: "rotate 700ms cubic-bezier(0.34, 1.45, 0.5, 1)",
        }}
      >
        <path d="M50 14 L59 50 L41 50 Z" fill="#c4392c" />
        <path d="M50 86 L59 50 L41 50 Z" fill={INK} />
        <circle cx="50" cy="50" r="6" fill="#fff" stroke={INK} strokeWidth="3" />
      </svg>
    </div>
  );
}

/**
 * The Tangent mentoring side quest, on its own side quest colour in this
 * site's type, like the Public Speaking page.
 */
export default function Mentoring({ ground }: { ground: string }) {
  // Paint the document too, so overscroll shows the quest's colour.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", ground);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, [ground]);

  return (
    <main
      data-full-bleed
      className="w-full min-h-dvh pb-24 overflow-hidden"
      style={{ backgroundColor: ground, color: INK, "--ground": ground } as React.CSSProperties}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex min-h-[88dvh] flex-col items-center justify-center gap-10 px-6 pt-32 pb-16 text-center">
        <Compass />

        <div>
          <p className="mb-6 text-sm uppercase tracking-[0.2em]">Side quest · Mentor at Tangent</p>
          <h1 className="font-display mx-auto max-w-5xl text-[clamp(3rem,1rem+7vw,7rem)] leading-[0.95]">
            Holding the door open
          </h1>
        </div>

        <p className="font-subhead max-w-2xl text-h3">
          I mentor aspiring CSMs and BDRs through Tangent: people with every bit of the drive for a
          career in tech, just not yet the network to get a foot in.
        </p>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="w-screen overflow-hidden py-3" style={{ borderBlock: `3px solid ${INK}` }}>
        <div className="flex w-max animate-marquee">
          {/* Twice over: the keyframe travels -50%, so the second copy is
              already in place when the first runs out. */}
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {MARQUEE.map((word) => (
                <span key={word} className="font-display text-h3 px-6 whitespace-nowrap">
                  {word} ✦
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Why referrals ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-28 md:px-10" aria-labelledby="mt-why">
        <p className="mb-3 text-sm uppercase tracking-[0.2em]">Don&apos;t apply</p>
        <h2 id="mt-why" className="font-display text-h2">
          Get referred
        </h2>
        <p className="font-subhead mt-4 max-w-2xl text-h4">
          A referral is someone on the inside putting your name forward. It changes everything,
          and it&apos;s the one thing you can&apos;t get without knowing someone.
        </p>

        {/* One per row, so the figures can run as big as the title */}
        <div className="mt-12" style={{ borderTop: `3px solid ${INK}` }}>
          {STATS.map((stat) => (
            <div
              key={stat.figure}
              className="ps-reveal grid items-end gap-4 py-8 md:grid-cols-2 md:gap-10"
              style={{ borderBottom: "1px solid rgba(17,17,17,0.3)" }}
            >
              <p className="font-display text-display leading-none whitespace-nowrap pr-[0.1em]">{stat.figure}</p>
              <p className="font-subhead text-h3 md:pb-2">{stat.label}</p>
            </div>
          ))}
        </div>
        <p className="mt-4 text-sm opacity-60">Figures from Tangent.</p>
      </section>

      {/* ── The gap ───────────────────────────────────────────────────────── */}
      <section className="px-6 pt-32 text-center md:px-10">
        <p className="font-display mx-auto max-w-4xl text-h1 uppercase">
          But what if you don&apos;t have those connections?
        </p>
        <p className="font-subhead mx-auto mt-6 max-w-xl text-h3">
          Where you grew up shouldn&apos;t decide who you know. That&apos;s the gap mentors fill.
        </p>
      </section>

      {/* ── What I help with ──────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10" aria-labelledby="mt-help">
        <h2 id="mt-help" className="font-display text-h2">
          What I help with
        </h2>

        <ol className="mt-12" style={{ borderTop: `3px solid ${INK}` }}>
          {HELP.map((item, i) => (
            <li
              key={item.title}
              className="mt-row grid gap-2 px-3 py-6 md:grid-cols-[4rem_1fr_1.4fr] md:items-baseline md:gap-8"
              style={{ borderBottom: "1px solid rgba(17,17,17,0.3)" }}
            >
              <span className="font-display text-sm opacity-60">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h2">{item.title}</h3>
              <p className="leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10" aria-labelledby="mt-how">
        <p className="mb-3 text-sm uppercase tracking-[0.2em]">On Tangent</p>
        <h2 id="mt-how" className="font-display text-h2">
          Four steps
        </h2>

        <ol className="mt-12 grid gap-10 md:grid-cols-4 md:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="ps-reveal pt-4" style={{ borderTop: `3px solid ${INK}` }}>
              <span className="font-display text-display leading-none">{i + 1}</span>
              <h3 className="text-h3 mt-4">{step.title}</h3>
              <p className="mt-2 leading-relaxed">{step.body}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Time ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10">
        <div className="grid items-end gap-6 md:grid-cols-[auto_1fr] md:gap-14" style={{ borderBlock: `3px solid ${INK}` }}>
          <p className="font-display py-6 text-[clamp(4rem,2rem+8vw,9rem)] leading-none whitespace-nowrap pr-[0.1em] uppercase">
            1–4 hrs
          </p>
          <div className="pb-8">
            <p className="font-display text-h3 uppercase">A month. That&apos;s it.</p>
            <p className="font-subhead mt-3 text-h4">
              Mentors on Tangent typically give an hour or a few a month, until the person
              they&apos;re supporting gets hired. Low time, huge swing.
            </p>
          </div>
        </div>
      </section>

      {/* ── Call to action ────────────────────────────────────────────────── */}
      <section className="px-6 pt-32 text-center md:px-10" aria-labelledby="mt-cta">
        <h2 id="mt-cta" className="font-display mx-auto max-w-3xl text-h1">
          Work in tech? Pay it forward.
        </h2>
        <p className="font-subhead mx-auto mt-6 max-w-xl text-h3">
          Applying to mentor takes a couple of minutes. And if you&apos;re the one looking for a way
          in, Tangent is free for jobseekers.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          {[
            { href: TANGENT.mentors, label: "Become a mentor" },
            { href: TANGENT.home, label: "Find a mentor" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="font-display px-7 py-3.5 text-white transition-opacity hover:opacity-80"
              style={{ backgroundColor: INK, borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
            >
              {link.label} ↗<span className="sr-only"> on Tangent (opens in a new tab)</span>
            </a>
          ))}
        </div>

        <div className="mt-20">
          <Link
            href="/work?tab=side-quests"
            className="font-display inline-block px-7 py-3.5 transition-colors hover:bg-[#111] hover:text-white"
            style={{ border: `3px solid ${INK}`, borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Back to side quests
          </Link>
        </div>
      </section>
    </main>
  );
}
