"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Inter_Tight } from "next/font/google";
import { GROUNDS } from "@/lib/side-quests";
import FlapTitle from "./FlapTitle";

// Laid out after graphicalui.com rather than this site's own design system:
// a pill-outlined wordmark, one big centred sentence with inline chips, and
// each project shown in a soft app-window mockup on near-white.
const interTight = Inter_Tight({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

const GROUND = "#f7f7f7";
const INK = "#111";
const MUTED = "#8a8a8a";
/** Grey at rest; on hover, a slow fade to one of the site's side quest colours. */
const PILL = "bg-[#ececec] transition-colors duration-700 ease-out hover:bg-(--pill)";
const pillColour = (i: number) => ({ "--pill": GROUNDS[i % GROUNDS.length] }) as React.CSSProperties;
const HAIRLINE = "#e4e4e4";

type Layout = "landing" | "app" | "editorial";

type Project = {
  name: string;
  summary: string;
  url: string;
  year: string;
  role: string;
  stack: string;
  accent: string;
  layout: Layout;
};

/** Placeholders until the real projects are written up. */
const PROJECTS: Project[] = [
  {
    name: "Project one",
    summary: "A line on what the site is, who it's for and what I did.",
    url: "project-one.com",
    year: "2026",
    role: "Design & build",
    stack: "Next.js",
    accent: "#e5383b",
    layout: "landing",
  },
  {
    name: "Project two",
    summary: "A line on what the site is, who it's for and what I did.",
    url: "project-two.com",
    year: "2025",
    role: "Design",
    stack: "Framer",
    accent: "#1f3f8f",
    layout: "app",
  },
  {
    name: "Project three",
    summary: "A line on what the site is, who it's for and what I did.",
    url: "project-three.com",
    year: "2024",
    role: "Build",
    stack: "Webflow",
    accent: "#f2b53a",
    layout: "editorial",
  },
];

/** Headings here opt out of the global caps and Instrument Serif. */
const heading = { fontFamily: "inherit", textTransform: "none" } as const;

function Chip({ icon, colour, children }: { icon: string; colour: number; children: React.ReactNode }) {
  return (
    <span
      className={`${PILL} inline-flex items-center gap-[0.25em] rounded-full py-[0.04em] pr-[0.4em] pl-[0.2em] align-baseline`}
      style={pillColour(colour)}
    >
      <span className="text-[0.85em]" aria-hidden="true">
        {icon}
      </span>
      {children}
    </span>
  );
}

/** A grey placeholder bar. */
function Bar({ w, h = 8, dark = false }: { w: string; h?: number; dark?: boolean }) {
  return (
    <span
      className="block rounded-full"
      style={{ width: w, height: h, background: dark ? "#d4d4d4" : "#ebebeb" }}
    />
  );
}

/** A stand-in for each project's screenshot, drawn in the site's own shapes. */
function Preview({ layout, accent }: { layout: Layout; accent: string }) {
  if (layout === "landing") {
    return (
      <div className="flex h-full flex-col gap-4 p-4 md:gap-6 md:p-8">
        <div className="flex items-center justify-between">
          <span className="h-4 w-16 rounded-full" style={{ background: INK }} />
          <div className="hidden gap-4 sm:flex">
            <Bar w="3rem" />
            <Bar w="3rem" />
            <Bar w="3rem" />
          </div>
        </div>
        <div
          className="flex flex-1 flex-col justify-end gap-3 rounded-xl p-4 md:p-8"
          style={{ background: accent }}
        >
          <span className="block h-3 w-3/4 rounded-full bg-white/90 md:h-5" />
          <span className="block h-3 w-1/2 rounded-full bg-white/60 md:h-5" />
          <span className="mt-2 block h-6 w-24 rounded-lg bg-white md:h-9 md:w-32" />
        </div>
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col gap-2 rounded-xl p-3 md:p-4" style={{ background: GROUND }}>
              <Bar w="60%" dark />
              <Bar w="90%" />
              <Bar w="75%" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (layout === "app") {
    return (
      <div className="flex h-full">
        <div className="hidden w-44 shrink-0 flex-col gap-1.5 p-4 sm:flex" style={{ borderRight: `1px solid ${HAIRLINE}` }}>
          <span className="mb-3 block h-3 w-16 rounded-full" style={{ background: INK }} />
          {[0, 1, 2, 3, 4].map((i) => (
            <span
              key={i}
              className="flex h-7 items-center rounded-lg px-2.5"
              style={{ background: i === 0 ? accent : "transparent" }}
            >
              <span
                className="block h-2 rounded-full"
                style={{ width: `${55 - i * 6}%`, background: i === 0 ? "rgba(255,255,255,0.85)" : "#dcdcdc" }}
              />
            </span>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-4 p-4 md:p-6">
          <div className="flex items-center justify-between">
            <Bar w="7rem" h={12} dark />
            <span className="h-6 w-16 rounded-lg" style={{ background: GROUND }} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex flex-col gap-2 rounded-xl p-3" style={{ background: GROUND }}>
                <Bar w="40%" />
                <span className="block h-4 w-2/3 rounded-full md:h-5" style={{ background: i === 0 ? accent : "#d4d4d4" }} />
              </div>
            ))}
          </div>
          <div className="flex flex-1 flex-col gap-2.5 rounded-xl p-3 md:p-4" style={{ border: `1px solid ${HAIRLINE}` }}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="h-5 w-5 shrink-0 rounded-full" style={{ background: "#e2e2e2" }} />
                <Bar w={`${70 - i * 10}%`} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-4 p-4 md:gap-6 md:p-8">
      <div className="flex items-center justify-between">
        <span className="h-4 w-20 rounded-full" style={{ background: INK }} />
        <Bar w="4rem" />
      </div>
      <div className="grid flex-1 gap-4 md:grid-cols-[1.4fr_1fr] md:gap-6">
        <div className="rounded-xl" style={{ background: accent, minHeight: "6rem" }} />
        <div className="hidden flex-col justify-center gap-3 md:flex">
          <Bar w="40%" />
          <Bar w="95%" h={16} dark />
          <Bar w="80%" h={16} dark />
          <div className="mt-2 flex flex-col gap-2">
            <Bar w="100%" />
            <Bar w="92%" />
            <Bar w="70%" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-2">
            <span className="block aspect-[4/3] rounded-lg" style={{ background: GROUND }} />
            <Bar w="80%" />
          </div>
        ))}
      </div>
    </div>
  );
}

function BrowserWindow({ project }: { project: Project }) {
  return (
    <div
      className="overflow-hidden rounded-2xl bg-white"
      style={{
        border: `1px solid ${HAIRLINE}`,
        boxShadow: "0 40px 80px -30px rgba(0,0,0,0.18), 0 12px 24px -12px rgba(0,0,0,0.08)",
      }}
    >
      <div
        className="relative flex h-10 items-center px-4"
        style={{ background: "#fafafa", borderBottom: `1px solid ${HAIRLINE}` }}
      >
        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <span key={i} className="h-3 w-3 rounded-full" style={{ background: "#dcdcdc" }} />
          ))}
        </div>
        <span className="absolute inset-x-0 text-center text-xs" style={{ color: MUTED }}>
          {project.url}
        </span>
      </div>
      <div className="aspect-[4/3] sm:aspect-[16/10]" aria-hidden="true">
        <Preview layout={project.layout} accent={project.accent} />
      </div>
    </div>
  );
}

export default function WebsiteProjects() {
  // Paint the document too, so overscroll matches the ground.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", GROUND);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, []);

  return (
    <main
      data-full-bleed
      className={`${interTight.className} w-full min-h-dvh pb-32`}
      style={{ backgroundColor: GROUND, color: INK }}
    >
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="flex min-h-[92dvh] flex-col items-center justify-center gap-14 px-4 pt-24 pb-16 text-center sm:px-8">
        <FlapTitle
          text="Website Projects"
          className="font-display text-[clamp(2rem,1rem+5vw,4rem)] leading-[1.1]"
        />
        <p className="max-w-4xl text-[clamp(1.6rem,1rem+2.6vw,3rem)] font-medium leading-[1.3] tracking-[-0.025em]">
          Sites I&apos;ve <Chip icon="✏️" colour={0}>designed</Chip>, <Chip icon="🛠️" colour={1}>built</Chip> and{" "}
          <Chip icon="🚀" colour={3}>shipped</Chip> for other people, outside the day job.
        </p>
      </section>

      {/* ── Projects ──────────────────────────────────────────────────────── */}
      {PROJECTS.map((project, i) => (
        <section
          key={project.name}
          className="mx-auto max-w-5xl px-4 pt-24 sm:px-8 md:pt-36"
          aria-labelledby={`wp-${i}`}
        >
          <div className="mb-12 text-center md:mb-16">
            <h2
              id={`wp-${i}`}
              className="text-[clamp(2rem,1.2rem+3vw,3.5rem)] font-medium leading-[1.1] tracking-[-0.035em]"
              style={heading}
            >
              {project.name}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg" style={{ color: MUTED }}>
              {project.summary}
            </p>
          </div>

          <BrowserWindow project={project} />

          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
            {[project.year, project.role, project.stack].map((tag, j) => (
              <span
                key={tag}
                className={`${PILL} rounded-full px-3.5 py-1.5`}
                style={pillColour(i * 3 + j)}
              >
                {tag}
              </span>
            ))}
            <span
              className="rounded-full px-3.5 py-1.5 text-white"
              style={{ background: INK }}
              title="Link coming soon"
            >
              Visit site ↗
            </span>
          </div>
        </section>
      ))}

      {/* ── Close ─────────────────────────────────────────────────────────── */}
      <section className="px-4 pt-32 text-center sm:px-8 md:pt-44">
        <p className="mx-auto max-w-2xl text-[clamp(1.5rem,1rem+2vw,2.5rem)] font-medium leading-[1.25] tracking-[-0.025em]">
          More <Chip icon="🌐" colour={2}>projects</Chip> on the way.
        </p>
        <div className="mt-10 flex flex-wrap justify-center gap-3 text-sm">
          <Link
            href="/work?tab=side-quests"
            className="rounded-full px-5 py-2.5 text-white transition-opacity hover:opacity-80"
            style={{ background: INK }}
          >
            Back to side quests
          </Link>
        </div>
      </section>
    </main>
  );
}
