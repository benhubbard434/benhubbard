"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";

// Ashby purple, as on the Ashby section of the Work tab, and its accent
const PURPLE = "#473bce";
const LAVENDER = "hsl(252, 60%, 80%)";
const ONYX = "#111";

const VIDEO_ID = "-pOWksdHWFU";
const EMBED_ORIGIN = "https://www.youtube-nocookie.com";

const TALK = {
  title: "EMEA Talent Trends: Inside the Data Shaping Hiring Today",
  event: "Ashby One London",
  date: "September 2026",
  runtime: "29:57",
  recap: "https://www.ashbyhq.com/ashby-one/2026/london/talent-trends",
  report: "https://www.ashbyhq.com/talent-trends-report",
};

/** From the video's own chapter list on YouTube. */
const CHAPTERS: { at: string; title: string }[] = [
  { at: "0:00", title: "Introductions" },
  { at: "1:50", title: "The volume paradox: applications per hire versus recruiter capacity" },
  { at: "3:30", title: "Moss traces a final-round breakdown to an AI-fluency gap" },
  { at: "8:27", title: "DeepL’s inbound surge and the shift toward sourcing and referrals" },
  { at: "15:00", title: "Screening load, application friction, and auto-reject rules" },
  { at: "19:02", title: "Redesigning assessments: an AI-assisted coding round and an earlier bar raiser" },
  { at: "22:05", title: "Holding time to hire steady with SLAs and automation" },
  { at: "25:54", title: "Turning hiring speed into a leadership expectation" },
];

const STATS = [
  { figure: "2×", label: "Applications per hire in EMEA, 2021 to 2026" },
  { figure: "37–43", label: "Days to hire, held steady through all of it" },
  { figure: "0", label: "Extra recruiters needed to absorb the surge" },
];

const SPEAKERS = [
  { name: "Ben Hubbard", role: "Manager, Dedicated Customer Success EMEA", org: "Ashby", host: true },
  { name: "Amanda Johnson", role: "Sr. Director, Global Talent Acquisition", org: "DeepL" },
  { name: "Célia Sauthier", role: "Director, Talent Acquisition", org: "Moss" },
];

const MARQUEE = ["Ashby One London", "EMEA Talent Trends", "Host", "Three speakers", "Twenty-nine minutes", "One report"];

function seconds(at: string): number {
  return at.split(":").reduce((total, part) => total * 60 + Number(part), 0);
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("");
}

/**
 * The Public Speaking side quest. Laid out like a night at a venue: the
 * spotlights come up over the title, the talk plays on the big screen with
 * its chapters as the setlist beside it, then the numbers, the lineup and
 * the way out. The whole page sits on Ashby purple, since that's whose stage
 * it was.
 */
export default function PublicSpeaking() {
  // The video is a thumbnail until asked for, so the page doesn't pull in
  // YouTube's player (and its cookies) for anyone who only scrolls past.
  const [playing, setPlaying] = useState(false);
  const [start, setStart] = useState(0);
  const [current, setCurrent] = useState<string | null>(null);

  const stageRef = useRef<HTMLElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<HTMLIFrameElement>(null);

  // Paint the document too, so overscroll shows purple rather than white.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", PURPLE);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, []);

  // The follow-spot tracks the mouse across the title. Straight to a custom
  // property, so moving it never re-renders.
  const onStageMove = (e: React.PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse") return;
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    stage.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
    stage.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
  };

  const cue = (at: string) => {
    const t = seconds(at);
    setCurrent(at);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    // On narrow screens the setlist is below the video, so bring it back up.
    if (!window.matchMedia("(min-width: 1024px)").matches) {
      screenRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
    const player = frameRef.current?.contentWindow;
    if (playing && player) {
      // Already loaded: jump the player rather than reloading it.
      const send = (func: string, args: unknown[] = []) =>
        player.postMessage(JSON.stringify({ event: "command", func, args }), EMBED_ORIGIN);
      send("seekTo", [t, true]);
      send("playVideo");
    } else {
      setStart(t);
      setPlaying(true);
    }
  };

  return (
    <main
      data-full-bleed
      className="public-speaking w-full min-h-dvh pb-24 overflow-hidden text-white"
      style={{ backgroundColor: PURPLE }}
    >
      {/* ── The stage ─────────────────────────────────────────────────────── */}
      <section
        ref={stageRef}
        onPointerMove={onStageMove}
        className="ps-stage relative isolate flex min-h-[88dvh] flex-col justify-end px-6 pt-32 pb-16 md:px-10"
      >
        <div className="ps-beam ps-beam-left" aria-hidden="true" />
        <div className="ps-beam ps-beam-right" aria-hidden="true" />

        {/* A rotating stamp with the quest's mic at its centre */}
        <div
          className="absolute top-24 right-6 md:top-28 md:right-12 w-28 h-28 md:w-40 md:h-40"
          aria-hidden="true"
        >
          <svg viewBox="0 0 200 200" className="ps-stamp absolute inset-0 h-full w-full">
            <defs>
              <path id="ps-stamp-ring" d="M100,100 m-78,0 a78,78 0 1,1 156,0 a78,78 0 1,1 -156,0" />
            </defs>
            {/* textLength is the ring's circumference (2π × 78), so the
                words close up exactly where they started */}
            <text className="font-display" fill="currentColor" fontSize="19" textLength="489">
              <textPath href="#ps-stamp-ring" textLength="489">ON STAGE ✦ MIC CHECK ✦ ON STAGE ✦ MIC CHECK ✦</textPath>
            </text>
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-4xl md:text-6xl">🎤</span>
        </div>

        <div className="relative mx-auto w-full max-w-6xl">
          <p className="mb-6 flex items-center gap-3 text-sm uppercase tracking-[0.2em]" style={{ color: LAVENDER }}>
            <span className="ps-tally" aria-hidden="true" />
            Live from {TALK.event}
          </p>

          <h1 className="font-display text-[clamp(3.75rem,1rem+12vw,11rem)] leading-[0.85]">
            <span className="block">Public</span>
            <span className="ps-outline block">Speaking</span>
          </h1>

          <p className="font-subhead mt-8 max-w-xl text-h3">
            Stepping out from behind the account plan to{" "}
            <em style={{ color: LAVENDER }}>hand round the mic</em>, share the data, and ask the
            questions a room full of talent leaders came for.
          </p>
        </div>
      </section>

      {/* ── Marquee ───────────────────────────────────────────────────────── */}
      <div className="w-screen overflow-hidden py-3" style={{ borderBlock: "3px solid #fff" }}>
        <div className="flex w-max animate-marquee">
          {/* Twice over: the keyframe travels -50%, so the second copy is
              already in place when the first runs out. */}
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {MARQUEE.map((word) => (
                <span key={word} className="font-display text-h3 px-6 whitespace-nowrap">
                  {word} <span style={{ color: LAVENDER }}>✦</span>
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ── Screen and setlist ────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-24 md:px-10" aria-labelledby="ps-talk">
        <p className="mb-3 text-sm uppercase tracking-[0.2em]" style={{ color: LAVENDER }}>
          Now showing
        </p>
        <h2 id="ps-talk" className="font-display text-h2 max-w-4xl">
          {TALK.title}
        </h2>

        <div className="mt-12 grid gap-12 lg:grid-cols-12 lg:gap-10">
          <div className="lg:col-span-7">
            <div className="lg:sticky lg:top-24">
              <div
                ref={screenRef}
                className="ps-screen relative aspect-video overflow-hidden rounded-lg"
                style={{ border: "3px solid #fff", boxShadow: `12px 12px 0 ${ONYX}` }}
              >
                {playing ? (
                  <iframe
                    ref={frameRef}
                    className="absolute inset-0 h-full w-full"
                    src={`${EMBED_ORIGIN}/embed/${VIDEO_ID}?autoplay=1&rel=0&enablejsapi=1&start=${start}`}
                    title={TALK.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlaying(true)}
                    className="ps-poster group absolute inset-0 h-full w-full"
                    aria-label={`Play “${TALK.title}”`}
                  >
                    <Image
                      src={`https://i.ytimg.com/vi/${VIDEO_ID}/maxresdefault.jpg`}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 640px, 100vw"
                      className="object-cover"
                      priority
                    />
                    <span className="ps-poster-tint absolute inset-0" style={{ backgroundColor: PURPLE }} />
                    <span className="absolute inset-0 flex items-center justify-center">
                      <span className="ps-play relative flex h-20 w-20 items-center justify-center rounded-full bg-white md:h-28 md:w-28">
                        <svg viewBox="0 0 24 24" className="ml-1.5 h-8 w-8 md:h-11 md:w-11" fill={PURPLE} aria-hidden="true">
                          <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z" />
                        </svg>
                      </span>
                    </span>
                    <span className="font-display absolute bottom-4 left-4 rounded bg-white px-2.5 py-1 text-xs uppercase tracking-wider" style={{ color: PURPLE }}>
                      {TALK.runtime}
                    </span>
                  </button>
                )}
              </div>

              <dl className="mt-8 grid grid-cols-3 gap-4 text-sm">
                {[
                  ["Event", TALK.event],
                  ["When", TALK.date],
                  ["Role", "Host"],
                ].map(([term, detail]) => (
                  <div key={term}>
                    <dt className="uppercase tracking-[0.2em] text-xs" style={{ color: LAVENDER }}>
                      {term}
                    </dt>
                    <dd className="mt-1">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div className="lg:col-span-5">
            <h3 className="text-h3 mb-4 flex items-baseline justify-between">
              The setlist
              <span className="font-sans text-sm" style={{ color: LAVENDER }}>
                Tap to jump in
              </span>
            </h3>
            <ol className="border-t-2 border-white">
              {CHAPTERS.map((chapter, i) => (
                <li key={chapter.at} className="border-b border-white/30">
                  <button
                    type="button"
                    onClick={() => cue(chapter.at)}
                    data-active={current === chapter.at}
                    className="ps-cue group flex w-full items-baseline gap-4 px-3 py-4 text-left"
                  >
                    <span className="font-display w-7 shrink-0 text-sm opacity-60">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1 leading-snug">{chapter.title}</span>
                    <span className="font-display shrink-0 text-sm tabular-nums">{chapter.at}</span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── The numbers ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10" aria-labelledby="ps-numbers">
        <p className="mb-3 text-sm uppercase tracking-[0.2em]" style={{ color: LAVENDER }}>
          From Ashby’s first EMEA Talent Trends report
        </p>
        <h2 id="ps-numbers" className="font-display text-h2">
          The numbers on the slide
        </h2>

        {/* One per row, so the figures can run as big as the title */}
        <div className="mt-12 border-t-2 border-white">
          {STATS.map((stat) => (
            <div
              key={stat.figure}
              className="ps-reveal grid items-end gap-4 border-b border-white/30 py-8 md:grid-cols-2 md:gap-10"
            >
              <p className="font-display text-display leading-none whitespace-nowrap pr-[0.1em]">{stat.figure}</p>
              <p className="font-subhead text-h3 md:pb-2" style={{ color: LAVENDER }}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── The lineup ────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10" aria-labelledby="ps-lineup">
        <h2 id="ps-lineup" className="font-display text-h2">
          The lineup
        </h2>

        <ul className="mt-12 grid gap-6 md:grid-cols-3">
          {SPEAKERS.map((speaker, i) => (
            <li
              key={speaker.name}
              className="ps-reveal ps-ticket relative rounded-lg bg-white p-6"
              style={{ color: ONYX, "--tilt": `${[-1.5, 1, -0.5][i]}deg` } as React.CSSProperties}
            >
              <div className="flex items-start justify-between">
                <span
                  className="squircle font-display flex h-16 w-16 items-center justify-center text-xl text-white"
                  style={{ backgroundColor: speaker.host ? PURPLE : ONYX }}
                  aria-hidden="true"
                >
                  {initials(speaker.name)}
                </span>
                <span
                  className="font-display rounded-full px-3 py-1 text-xs uppercase tracking-wider"
                  style={
                    speaker.host
                      ? { backgroundColor: PURPLE, color: "#fff" }
                      : { border: `2px solid ${ONYX}` }
                  }
                >
                  {speaker.host ? "Host" : "Panel"}
                </span>
              </div>
              <h3 className="text-h3 mt-8">{speaker.name}</h3>
              <p className="mt-2 text-sm leading-relaxed opacity-70">{speaker.role}</p>
              {/* Perforation, so it reads as a ticket stub */}
              <div className="mt-6 border-t-2 border-dashed pt-4" style={{ borderColor: "rgba(17,17,17,0.2)" }}>
                <span className="font-display text-sm uppercase tracking-wider">{speaker.org}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Encore ────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10" aria-labelledby="ps-encore">
        <h2 id="ps-encore" className="font-display text-h2">
          Encore
        </h2>
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {[
            { href: TALK.recap, label: "Full session recap", note: "On ashbyhq.com" },
            { href: TALK.report, label: "The Talent Trends data", note: "Ashby’s EMEA report" },
          ].map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ps-encore group flex items-center justify-between gap-6 rounded-lg p-6 md:p-8"
              style={{ border: "3px solid #fff" }}
            >
              <span>
                <span className="font-display block text-h4 uppercase">{link.label}</span>
                <span className="mt-1 block text-sm opacity-70">
                  {link.note}
                  <span className="sr-only"> (opens in a new tab)</span>
                </span>
              </span>
              <span className="ps-encore-arrow text-h2 leading-none" aria-hidden="true">
                ↗
              </span>
            </a>
          ))}
        </div>

        <div className="mt-24 flex justify-center">
          <Link
            href="/work?tab=side-quests"
            className="font-display bg-white px-7 py-3.5 transition-opacity hover:opacity-80"
            style={{ color: PURPLE, borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
          >
            Back to side quests
          </Link>
        </div>
      </section>
    </main>
  );
}
