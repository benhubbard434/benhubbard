"use client";

import { useEffect } from "react";
import Link from "next/link";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";

// Deliberately outside the site's design system: a plain technical document
// in IBM Plex, on warm grey paper, so it reads as notes about the site rather
// than another page of it.
const plexSans = IBM_Plex_Sans({ subsets: ["latin"], weight: ["400", "500", "600"] });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"] });

const PAPER = "#eeece7";
const INK = "#1b1b19";
const MUTED = "#6e6c66";
const RULE = "1px solid rgba(27,27,25,0.16)";
const HEAVY_RULE = `1px solid ${INK}`;

/** Headings here opt out of the global caps and Instrument Serif. */
const heading = { fontFamily: "inherit", textTransform: "none" } as const;

/** Taken from `git log` when this page was written (Oct 2026). */
const FACTS = [
  { label: "First commit", value: "10 Jan 2015" },
  { label: "Rebuilt", value: "24 Apr 2026" },
  { label: "Commits", value: "1,828" },
  { label: "Hosting", value: "Netlify" },
];

/** Years the site lived on Framer, with the repo left as an archive. */
const FRAMER_YEARS = new Set([2024, 2025]);

const COMMITS_BY_YEAR = [
  { year: 2015, count: 212 },
  { year: 2016, count: 228 },
  { year: 2017, count: 175 },
  { year: 2018, count: 45 },
  { year: 2019, count: 64 },
  { year: 2020, count: 229 },
  { year: 2021, count: 487 },
  { year: 2022, count: 1 },
  { year: 2023, count: 237 },
  { year: 2024, count: 0 },
  { year: 2025, count: 0 },
  { year: 2026, count: 150 },
];

const VERSIONS = [
  {
    version: "v1",
    when: "Jan 2015",
    title: "Hand-written HTML",
    body: "A homepage, a contact form, Google Analytics and a photo page from 26 hours in Venice. Every page was its own HTML file, and every bug fix was a commit called something like \"more bugs in photo page\".",
  },
  {
    version: "v2",
    when: "Aug 2015",
    title: "A new theme",
    body: "A proper theme, a profile picture and a menu. The yellow became orange, then a new orange, after a round of feedback from a friend.",
  },
  {
    version: "v3",
    when: "Dec 2015",
    title: "Moving to Jekyll",
    body: "Layouts and includes instead of copy and paste, and a blog written in files. It stayed a static site on GitHub Pages until 2024.",
  },
  {
    version: "v4",
    when: "2020 – 2023",
    title: "Lockdown edits",
    body: "The busiest years, mostly edited straight in GitHub's web editor: case studies, a WFH tips post, a doughball recipe, a new stylesheet tweaked dozens of times, and a new logo in 2023.",
  },
  {
    version: "v5",
    when: "2024 – 2025",
    title: "Off to Framer",
    body: "I moved the site to Framer and designed it visually instead of in code. The GitHub repo stayed put as an archive, which is why it has no commits for two years.",
  },
  {
    version: "v6",
    when: "Apr 2026",
    title: "Starting again",
    body: "Back to GitHub: the archive deleted in one commit, then the site rebuilt from scratch in Next.js by pairing with Claude Code. This is the version you're reading.",
  },
];

const STACK = [
  { layer: "Framework", tool: "Next.js 16, React 19", use: "App Router, mostly static pages refreshed in the background" },
  { layer: "Language", tool: "TypeScript", use: "Everything, including the data files" },
  { layer: "Styling", tool: "Tailwind CSS 4", use: "Plus a small set of brand tokens, documented on /style" },
  { layer: "Hosting", tool: "Netlify", use: "Builds and deploys on every push to master" },
  { layer: "Blog", tool: "Supabase", use: "Posts live in a Postgres table, not in the repo" },
  { layer: "Email", tool: "Resend", use: "Sends the contact form to my inbox" },
  { layer: "Running", tool: "Strava API", use: "Totals, parkrun stats and maps, refreshed every three hours" },
  { layer: "Music", tool: "Spotify API", use: "The Ten of the Month player" },
  { layer: "Maps", tool: "d3-geo, world-atlas", use: "The travel map and the parkrun venue map, drawn as SVG" },
];

const WORKFLOW = [
  {
    title: "Describe it",
    body: "I say what I want in plain English, usually one change at a time. For anything new, I share a design I've already made in Sketch.",
  },
  {
    title: "Build it",
    body: "Claude Code makes the change using the /style page as its theme, then checks it in a browser preview running on my machine.",
  },
  {
    title: "Review it",
    body: "I look at it, push back, and go round again until it's right. Most changes take two or three goes.",
  },
  {
    title: "Ship it",
    body: "Each change is committed on its own. Nothing is pushed until I say so, because a push is a deploy.",
  },
];

const LESSONS = [
  {
    title: "Stale CSS in production",
    body: "Netlify served a build with yesterday's styles. The fix was turning off Next.js's build cache altogether.",
  },
  {
    title: "Strava doesn't know what a parkrun is",
    body: "The parkrun stats come from runs with \"parkrun\" in the name, with the venue worked out from where the GPS track starts.",
  },
  {
    title: "Strava's times aren't official",
    body: "They run a few seconds off the results, so personal bests are typed in by hand.",
  },
  {
    title: "Say what AI did",
    body: "Every page has an AI tray that says how much of its code, words and images AI was involved in. On this one, it helped with the words too.",
  },
];

function SectionHead({ index, title, id }: { index: string; title: string; id: string }) {
  return (
    <div className="mb-8 flex items-baseline gap-4 pb-3" style={{ borderBottom: HEAVY_RULE }}>
      <span className={`${plexMono.className} text-xs`} style={{ color: MUTED }}>
        {index}
      </span>
      <h2 id={id} className="text-xl font-medium md:text-2xl" style={heading}>
        {title}
      </h2>
    </div>
  );
}

export default function BuildingThisWebsite() {
  // Paint the document too, so overscroll shows the paper rather than white.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", PAPER);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, []);

  const maxCommits = Math.max(...COMMITS_BY_YEAR.map((y) => y.count));

  return (
    <main
      data-full-bleed
      className={`${plexSans.className} w-full min-h-dvh pb-32`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <div className="mx-auto max-w-4xl px-4 sm:px-8">
        {/* ── Title block ─────────────────────────────────────────────────── */}
        <header className="pt-28 md:pt-36">
          <p className={`${plexMono.className} mb-6 text-xs`} style={{ color: MUTED }}>
            <Link
              href="/work?tab=side-quests"
              className="underline underline-offset-4 transition-colors hover:text-[#1b1b19]"
            >
              side-quests
            </Link>{" "}
            / building-this-website
          </p>
          <h1
            className="text-[clamp(2.5rem,1.5rem+4vw,4.25rem)] font-semibold leading-[1.02] tracking-[-0.03em]"
            style={heading}
          >
            Building this website
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
            I&apos;ve had a site at benhubbard.co.uk since 2015. It has been hand-written HTML, a
            Jekyll blog, a GitHub web editor project and a Framer site. In 2026 I deleted the lot
            and rebuilt it from scratch with AI. These are the notes on how.
          </p>

          <dl
            className={`${plexMono.className} mt-12 grid grid-cols-2 md:grid-cols-4`}
            style={{ borderTop: HEAVY_RULE, borderBottom: RULE }}
          >
            {/* Dividers between cells only: every other one on phones, all but the first above. */}
            {FACTS.map((fact) => (
              <div
                key={fact.label}
                className="border-l py-4 pr-4 pl-4 odd:border-l-0 odd:pl-0 md:odd:border-l md:odd:pl-4 md:first:border-l-0 md:first:pl-0"
                style={{ borderColor: "rgba(27,27,25,0.16)" }}
              >
                <dt className="text-[11px] uppercase tracking-[0.12em]" style={{ color: MUTED }}>
                  {fact.label}
                </dt>
                <dd className="mt-1 text-sm md:text-base">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </header>

        {/* ── Commit history ──────────────────────────────────────────────── */}
        <section className="pt-24" aria-labelledby="btw-history">
          <SectionHead index="01" title="Eleven years in one repo" id="btw-history" />
          <p className="mb-8 max-w-2xl leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
            Commits per year. It goes quiet whenever life got busy, loud in lockdown, and silent for the two years it lived on Framer.
          </p>
          <ul className={`${plexMono.className} flex flex-col gap-1.5 text-xs md:text-sm`}>
            {COMMITS_BY_YEAR.map(({ year, count }) => (
              <li
                key={year}
                className="grid grid-cols-[3rem_1fr_2.5rem] items-center gap-3 tabular-nums"
              >
                <span style={{ color: MUTED }}>{year}</span>
                {FRAMER_YEARS.has(year) ? (
                  <span className="leading-none" style={{ color: MUTED }}>
                    on Framer
                  </span>
                ) : (
                  <span className="h-2.5" style={{ background: "rgba(27,27,25,0.07)" }}>
                    <span
                      className="block h-full"
                      style={{ width: `${(count / maxCommits) * 100}%`, background: INK }}
                    />
                  </span>
                )}
                <span className="text-right" style={{ color: count ? INK : MUTED }}>
                  {FRAMER_YEARS.has(year) ? "—" : count}
                </span>
              </li>
            ))}
          </ul>
        </section>

        {/* ── Versions ────────────────────────────────────────────────────── */}
        <section className="pt-24" aria-labelledby="btw-versions">
          <SectionHead index="02" title="Six versions" id="btw-versions" />
          <ol>
            {VERSIONS.map((v) => (
              <li
                key={v.version}
                className="grid gap-2 py-6 md:grid-cols-[7rem_1fr] md:gap-8"
                style={{ borderBottom: RULE }}
              >
                <div className={`${plexMono.className} text-xs md:pt-1`} style={{ color: MUTED }}>
                  <span style={{ color: INK }}>{v.version}</span> · {v.when}
                </div>
                <div>
                  <h3 className="text-lg font-medium" style={heading}>
                    {v.title}
                  </h3>
                  <p className="mt-1.5 max-w-2xl leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
                    {v.body}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Stack ───────────────────────────────────────────────────────── */}
        <section className="pt-24" aria-labelledby="btw-stack">
          <SectionHead index="03" title="What it's built on" id="btw-stack" />
          <table className="w-full text-left text-sm">
            <thead className={plexMono.className}>
              <tr className="text-[11px] uppercase tracking-[0.12em]" style={{ color: MUTED }}>
                <th className="pb-3 pr-4 font-normal">Layer</th>
                <th className="pb-3 pr-4 font-normal">Tool</th>
                <th className="hidden pb-3 font-normal md:table-cell">What it does</th>
              </tr>
            </thead>
            <tbody>
              {STACK.map((row) => (
                <tr key={row.layer} style={{ borderTop: RULE }} className="align-top">
                  <td className={`${plexMono.className} py-3 pr-4 text-xs`} style={{ color: MUTED }}>
                    {row.layer}
                  </td>
                  <td className="py-3 pr-4">
                    <span className="font-medium">{row.tool}</span>
                    <span className="mt-1 block md:hidden" style={{ color: MUTED }}>
                      {row.use}
                    </span>
                  </td>
                  <td className="hidden py-3 md:table-cell" style={{ color: "rgba(27,27,25,0.75)" }}>
                    {row.use}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ── Workflow ────────────────────────────────────────────────────── */}
        <section className="pt-24" aria-labelledby="btw-workflow">
          <SectionHead index="04" title="How a change gets made" id="btw-workflow" />
          <p className="mb-4 max-w-2xl leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
            I don&apos;t write the code by hand. 145 of this year&apos;s 150 commits were made with
            Claude Code. I decide what to build, how it should look and what it should say.
          </p>
          <p className="mb-8 max-w-2xl leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
            The look comes from two places. I design pages in Sketch first and share them as the
            reference. And the{" "}
            <Link href="/style" className="underline underline-offset-4 hover:opacity-60">
              /style
            </Link>{" "}
            page sets out the site&apos;s colours, type and motion, so Claude uses it as the theme
            for anything it builds.
          </p>
          <ol className="grid gap-px md:grid-cols-4" style={{ background: "rgba(27,27,25,0.16)", border: RULE }}>
            {WORKFLOW.map((step, i) => (
              <li key={step.title} className="p-5" style={{ background: PAPER }}>
                <span className={`${plexMono.className} text-xs`} style={{ color: MUTED }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-6 font-medium" style={heading}>
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </section>

        {/* ── Lessons ─────────────────────────────────────────────────────── */}
        <section className="pt-24" aria-labelledby="btw-lessons">
          <SectionHead index="05" title="Things I learned the hard way" id="btw-lessons" />
          <dl>
            {LESSONS.map((lesson) => (
              <div
                key={lesson.title}
                className="grid gap-1.5 py-5 md:grid-cols-[16rem_1fr] md:gap-8"
                style={{ borderBottom: RULE }}
              >
                <dt className="font-medium">{lesson.title}</dt>
                <dd className="leading-relaxed" style={{ color: "rgba(27,27,25,0.75)" }}>
                  {lesson.body}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <footer className={`${plexMono.className} mt-24 flex flex-wrap items-center justify-between gap-4 pt-4 text-xs`} style={{ borderTop: HEAVY_RULE }}>
          <span style={{ color: MUTED }}>Last updated Oct 2026</span>
          <Link href="/work?tab=side-quests" className="underline underline-offset-4 hover:opacity-60">
            ← Back to side quests
          </Link>
        </footer>
      </div>
    </main>
  );
}
