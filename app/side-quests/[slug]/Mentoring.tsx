"use client";

import { useEffect } from "react";
import Link from "next/link";

// Tangent's palette, taken from jointangent.com: the peach of its buttons,
// its cream and sky grounds, the coral of its hand-drawn circles, and the
// pastels its illustrations are coloured in.
const PEACH = "#F5BF9E";
const CREAM = "#FFF9F7";
const SKY = "#EFF8FF";
const CORAL = "#E55858";
const INK = "#111";
const PASTEL = {
  yellow: "#FFDD6E",
  green: "#8FCAAB",
  lavender: "#A799EB",
  salmon: "#FFA88A",
  blue: "#97D0FF",
  teal: "#6EDCD2",
};

const TANGENT = {
  home: "https://www.jointangent.com",
  mentors: "https://www.jointangent.com/beamentor",
};

/** Tangent's own figures, from its jobseekers page. */
const STATS = [
  { figure: "9×", label: "more likely to be hired through a referral", fill: PASTEL.yellow, tilt: -2 },
  { figure: "82%", label: "of companies rank referrals as their best hiring channel", fill: PASTEL.green, tilt: 1.5 },
  { figure: "70%", label: "of people get hired through their professional connections", fill: PASTEL.lavender, tilt: -1 },
];

const HELP = [
  {
    emoji: "☕️",
    title: "Intro calls",
    body: "A first chat about where they are, where they want to be, and what a CSM or BDR actually does all day.",
    fill: PASTEL.salmon,
  },
  {
    emoji: "📝",
    title: "CV reviews",
    body: "What to cut, what to keep, and how to make experience from outside tech read as the real thing it is.",
    fill: PASTEL.blue,
  },
  {
    emoji: "🎯",
    title: "Interview prep",
    body: "Practice runs for the questions CS hiring managers ask, from the side of the table that asks them.",
    fill: PASTEL.yellow,
  },
  {
    emoji: "🤝",
    title: "Referrals",
    body: "When the fit is right, putting someone forward to a recruiting team instead of into a pile of applications.",
    fill: PASTEL.teal,
  },
];

/** How mentoring on Tangent works, as its mentors page lays it out. */
const STEPS = [
  { title: "Sign up", body: "Every mentor is vetted: you have to work in tech and sign up with LinkedIn.", fill: PASTEL.yellow },
  { title: "Discover", body: "Jobseekers post a short video intro instead of a cover letter. You browse the feed.", fill: PASTEL.green },
  { title: "Connect", body: "Message someone whose story lands with you, and set up a call.", fill: PASTEL.lavender },
  { title: "Support", body: "Mentor them until they're hired: CV, interviews, and a referral if you choose.", fill: PASTEL.salmon },
];

/**
 * A hand-drawn loop around a word, like the ones on jointangent.com. It
 * overshoots its own start so it reads as a pen stroke, and draws itself in
 * once on load.
 */
function Circled({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    // The loop reaches past the word; the margin keeps it off its neighbours
    <span className="relative mx-[0.2em] inline-block whitespace-nowrap">
      {children}
      <svg
        className="tg-scribble pointer-events-none absolute -inset-x-[12%] -inset-y-[30%] h-[160%] w-[124%] overflow-visible"
        viewBox="0 0 200 60"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M18 44 C6 34 14 14 60 8 C110 2 180 6 192 26 C200 44 150 56 96 56 C46 56 8 50 10 32 C12 18 40 10 80 8"
          fill="none"
          stroke={CORAL}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
          style={{ animationDelay: `${delay}ms` }}
        />
      </svg>
    </span>
  );
}

/** A loose underline, for the second of the hand-drawn marks. */
function Underlined({ children, color = CORAL }: { children: React.ReactNode; color?: string }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        className="tg-scribble pointer-events-none absolute -bottom-[0.28em] left-0 h-[0.4em] w-full overflow-visible"
        viewBox="0 0 200 14"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M4 9 C40 3 70 12 104 7 C136 2 168 10 196 5"
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
          pathLength={1}
        />
      </svg>
    </span>
  );
}

/** Tangent's button: peach, outlined, sitting on a hard shadow it presses into. */
function TangentButton({
  href,
  children,
  fill = PEACH,
  external = true,
}: {
  href: string;
  children: React.ReactNode;
  fill?: string;
  external?: boolean;
}) {
  const className = "tg-button inline-flex items-center gap-2 rounded-lg px-6 py-3.5 text-sm font-semibold uppercase tracking-wide";
  const style = { backgroundColor: fill, border: `2px solid ${INK}`, color: INK };
  if (!external) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className} style={style}>
      {children}
      <span aria-hidden="true">↗</span>
      <span className="sr-only"> (opens in a new tab)</span>
    </a>
  );
}

/**
 * The Tangent mentoring side quest, dressed in Tangent's own colours and
 * components (peach, cream, pastel shapes, outlined cards on hard shadows,
 * coral pen marks) but set in this site's type, since it's still my page.
 */
export default function Mentoring() {
  // Paint the document too, so overscroll shows cream rather than white.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", CREAM);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, []);

  return (
    <main
      data-full-bleed
      className="tangent w-full min-h-dvh pb-24 overflow-hidden"
      style={{ backgroundColor: CREAM, color: INK }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      {/* The curved bottom edge is Tangent's, as on every page of its site */}
      <section
        className="tg-hero relative isolate px-6 pt-32 pb-36 text-center md:px-10 md:pb-44"
        style={{ backgroundColor: PEACH }}
      >
        {/* Pastel shapes drifting about, after Tangent's illustrations */}
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
          <span className="tg-float absolute left-[6%] top-[22%] h-14 w-14 rounded-full md:h-20 md:w-20" style={{ backgroundColor: PASTEL.yellow, border: `2px solid ${INK}` }} />
          <span className="tg-float absolute right-[8%] top-[18%] h-12 w-12 rotate-12 rounded-xl md:h-16 md:w-16" style={{ backgroundColor: PASTEL.teal, border: `2px solid ${INK}`, animationDelay: "-2s" }} />
          <svg className="tg-float absolute left-[12%] bottom-[22%] h-14 w-14 md:h-20 md:w-20" viewBox="0 0 40 40" style={{ animationDelay: "-4s" }}>
            <path d="M20 2 L24 15 L38 16 L27 24 L31 38 L20 30 L9 38 L13 24 L2 16 L16 15 Z" fill={PASTEL.lavender} stroke={INK} strokeWidth="1.5" strokeLinejoin="round" />
          </svg>
          <svg className="tg-float absolute right-[10%] bottom-[26%] h-10 w-24 md:h-12 md:w-32" viewBox="0 0 100 30" style={{ animationDelay: "-1s" }}>
            <path d="M4 15 C16 2 24 28 36 15 S56 2 68 15 S88 28 96 15" fill="none" stroke={INK} strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>

        <p className="mx-auto mb-8 inline-flex -rotate-2 items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-semibold" style={{ border: `2px solid ${INK}` }}>
          🧭 Side quest · Mentor at Tangent
        </p>

        <h1 className="font-display mx-auto max-w-5xl text-[clamp(3rem,1rem+7vw,7rem)] leading-[0.95]">
          Holding the door <Circled delay={500}>open</Circled>
        </h1>

        <p className="font-subhead mx-auto mt-10 max-w-2xl text-h3">
          I mentor aspiring CSMs and BDRs through Tangent: people with every bit of the drive for a
          career in tech, just not yet the <Underlined>network</Underlined> to get a foot in.
        </p>

        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <TangentButton href={TANGENT.mentors} fill="#fff">
            Become a mentor
          </TangentButton>
        </div>
      </section>

      {/* ── Why referrals ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 md:px-10" aria-labelledby="tg-why">
        <h2 id="tg-why" className="font-display text-h2 max-w-3xl">
          Don&apos;t apply. Get <Underlined>referred</Underlined>.
        </h2>
        <p className="font-subhead mt-4 max-w-2xl text-h4 opacity-80">
          A referral is someone on the inside putting your name forward. It changes everything,
          and it&apos;s the one thing you can&apos;t get without knowing someone.
        </p>

        <ul className="mt-14 grid gap-6 md:grid-cols-3">
          {STATS.map((stat) => (
            <li
              key={stat.figure}
              className="tg-card tg-reveal rounded-2xl p-8"
              style={{ backgroundColor: stat.fill, border: `2px solid ${INK}`, "--tilt": `${stat.tilt}deg` } as React.CSSProperties}
            >
              <p className="font-display text-display leading-none">{stat.figure}</p>
              <p className="mt-5 text-lg font-medium leading-snug">{stat.label}</p>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm opacity-60">Figures from Tangent.</p>
      </section>

      {/* ── The gap ───────────────────────────────────────────────────────── */}
      <section className="px-6 pt-28 text-center md:px-10">
        <p className="font-display mx-auto max-w-4xl text-h1 leading-[1.05]">
          But what if you don&apos;t have <Circled>those</Circled> connections?
        </p>
        <p className="font-subhead mx-auto mt-6 max-w-xl text-h3">
          Where you grew up shouldn&apos;t decide who you know. That&apos;s the gap mentors fill.
        </p>
      </section>

      {/* ── What I help with ──────────────────────────────────────────────── */}
      <section className="mt-28 px-6 py-24 md:px-10" style={{ backgroundColor: SKY }} aria-labelledby="tg-help">
        <div className="mx-auto max-w-6xl">
          <h2 id="tg-help" className="font-display text-h2">
            What I help with
          </h2>

          <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {HELP.map((item) => (
              <li
                key={item.title}
                className="tg-card tg-reveal flex flex-col rounded-2xl bg-white p-6"
                style={{ border: `2px solid ${INK}` }}
              >
                <span
                  className="squircle flex h-16 w-16 items-center justify-center text-3xl"
                  style={{ backgroundColor: item.fill, border: `2px solid ${INK}` }}
                  aria-hidden="true"
                >
                  {item.emoji}
                </span>
                <h3 className="text-h3 mt-6">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed opacity-75">{item.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-28 md:px-10" aria-labelledby="tg-how">
        <h2 id="tg-how" className="font-display text-h2">
          How it works, in <Circled>four</Circled> steps
        </h2>

        <ol className="relative mt-16 grid gap-12 md:grid-cols-4 md:gap-8">
          {/* The dashed trail the numbers sit on: down on phones, across on
              anything wider */}
          <span
            className="absolute left-7 top-7 bottom-7 border-l-2 border-dashed md:left-7 md:right-7 md:bottom-auto md:border-l-0 md:border-t-2"
            style={{ borderColor: INK }}
            aria-hidden="true"
          />
          {STEPS.map((step, i) => (
            <li key={step.title} className="tg-reveal relative flex gap-6 md:block">
              <span
                className="tg-step font-display relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-xl"
                style={{ backgroundColor: step.fill, border: `2px solid ${INK}` }}
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="md:mt-6">
                <h3 className="text-h3">{step.title}</h3>
                <p className="mt-2 leading-relaxed opacity-75">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── Time ──────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-28 md:px-10">
        <div
          className="tg-card grid items-center gap-8 rounded-3xl p-8 md:grid-cols-[auto_1fr] md:gap-14 md:p-14"
          style={{ backgroundColor: PASTEL.green, border: `2px solid ${INK}` }}
        >
          <p className="font-display text-[clamp(4rem,2rem+8vw,9rem)] leading-none whitespace-nowrap pr-[0.1em]">
            1–4 hrs
          </p>
          <div>
            <p className="font-display text-h3 uppercase">A month. That&apos;s it.</p>
            <p className="font-subhead mt-3 text-h4">
              Mentors on Tangent typically give an hour or a few a month, until the person
              they&apos;re supporting gets hired. Low time, huge swing.
            </p>
          </div>
        </div>
      </section>

      {/* ── Call to action ────────────────────────────────────────────────── */}
      <section className="px-6 pt-28 text-center md:px-10" aria-labelledby="tg-cta">
        <h2 id="tg-cta" className="font-display mx-auto max-w-3xl text-h1">
          Work in tech? <Underlined>Pay it forward.</Underlined>
        </h2>
        <p className="font-subhead mx-auto mt-6 max-w-xl text-h3">
          Applying to mentor takes a couple of minutes. And if you&apos;re the one looking for a way
          in, Tangent is free for jobseekers.
        </p>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <TangentButton href={TANGENT.mentors}>Become a mentor</TangentButton>
          <TangentButton href={TANGENT.home} fill={PASTEL.blue}>
            Find a mentor
          </TangentButton>
        </div>

        <div className="mt-24">
          <Link
            href="/work?tab=side-quests"
            className="font-display px-7 py-3.5 text-white transition-opacity hover:opacity-80"
            style={{ backgroundColor: INK, borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Back to side quests
          </Link>
        </div>
      </section>
    </main>
  );
}
