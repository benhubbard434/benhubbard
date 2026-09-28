"use client";

import { useEffect } from "react";
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
];

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
        <div>
          <p className="mb-6 text-sm uppercase tracking-[0.2em]">Side quest · Mentor at Tangent</p>
          <h1 className="font-display mx-auto max-w-5xl text-[clamp(3rem,1rem+7vw,7rem)] leading-[0.95]">
            Getting people into tech
          </h1>
        </div>

        <p className="font-subhead max-w-2xl text-h3">
          I mentor aspiring CSMs through Tangent, to help people get jobs in tech from
          underrepresented backgrounds, who don&apos;t yet have the network to get a foot in.
        </p>
      </section>

      {/* ── Why I do it ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-28 md:px-10" aria-labelledby="mt-why">
        <p className="mb-3 text-sm uppercase tracking-[0.2em]">Why I do it</p>
        <h2 id="mt-why" className="font-display text-h2">
          CS is a great way in
        </h2>
        <p className="font-subhead mt-4 max-w-2xl text-h4">
          Customer success doesn&apos;t need a degree or a coding background. It needs curiosity,
          empathy and problem-solving, and plenty of people already have those. They just
          don&apos;t know the job exists, or how to get past the first screen. I&apos;d like to
          help with that. If you don&apos;t have a network in tech, you&apos;re up against it
          with just a CV.
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
              className="mt-row grid gap-2 px-3 py-6 md:grid-cols-[4rem_1fr_1.4fr] md:items-center md:gap-8"
              style={{ borderBottom: "1px solid rgba(17,17,17,0.3)" }}
            >
              <span className="font-display text-sm opacity-60">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="text-h2">{item.title}</h3>
              <p className="leading-relaxed">{item.body}</p>
            </li>
          ))}
        </ol>
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
