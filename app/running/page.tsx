import Image from "next/image";
import { getStravaStats } from "@/lib/strava";
import StravaStats from "./StravaStats";
import ParkrunSection from "./ParkrunSection";
import PersonalBests from "./PersonalBests";

/**
 * Stats are fetched at render time and the page is regenerated every three
 * hours, so visitors get them in the HTML and never wait on Strava.
 * `force-static` stops the uncached token POST from flipping the route to
 * dynamic rendering (see app/music/page.tsx).
 */
export const dynamic = "force-static";
export const revalidate = 10800;

const runningPhotos = [
  "/images/running-1.jpg",
  "/images/running-2.jpg",
  "/images/running-3.jpg",
  "/images/running-4.jpg",
  "/images/running-5.jpg",
  "/images/running-6.jpg",
  "/images/running-7.jpg",
  "/images/running-8.jpg",
];

const marqueePhotos = [...runningPhotos, ...runningPhotos];

const challenges = [
  {
    tag: "Challenge",
    stat: "×10",
    title: "5k on the hour, every hour",
    meta: "50km total · one Saturday · April 2025",
    description:
      "Ten 5k loops. One hour of rest between each.",
  },
  {
    tag: "Race",
    stat: "74km",
    title: "Isle of Wight Ultra",
    meta: "DNF · 73.7km of 100km · 12h 23m · May 2025",
    description:
      "Signed up for 100km. Made it to 73.7. Still proud of every single one of them.",
  },
  {
    tag: "Milestone",
    stat: "100",
    title: "100 races before 30",
    meta: "Parkruns, halfs, ultras · crossed the line March 2020",
    description: "",
  },
];

const story = [
  "Running was something that I fell into by accident. I started out trying to get fitter to play football and then entered a half marathon on a whim. When I moved to London, I started taking it a bit more seriously and based a lot of my social life around the running groups that I joined, eventually becoming leader of Track East.",
  "This led to a challenge that I set myself: completing 100 races before I turned 30, completing my 100th just a week before. Then COVID hit, and my rate of racing reduced somewhat. However, I've taken on more extreme challenges since then, including an ultra marathon around the Isle of Wight. Whilst I did not finish the Isle of Wight Ultra, I still managed to complete 74 km, which to this day is probably my greatest physical achievement.",
];

export default async function RunningPage() {
  const stats = await getStravaStats();
  return (
    <main data-full-bleed className="flex flex-col pb-24" style={{ background: "#f5f5f0", color: "#111" }}>

      {/* Hero */}
      <section className="px-8 pt-20 pb-10">
        <h1
          className="font-display leading-none"
          style={{ fontSize: "clamp(3.5rem, 17vw, 14rem)" }}
        >
          Running
        </h1>
        <p
          className="font-display mt-3"
          style={{ fontSize: "clamp(1.5rem, 4vw, 3rem)", color: "#fc4c02" }}
        >
          Fuelled by Margaritas
        </p>
      </section>

      {/* Photo marquee */}
      <div className="w-full overflow-hidden">
        <div className="flex h-[300px] w-max animate-marquee">
          {marqueePhotos.map((src, i) => (
            <div key={i} className="relative h-full w-[450px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Running photo ${(i % runningPhotos.length) + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Strava stats */}
      <StravaStats stats={stats} />

      {/* Profile banner */}
      <section
        className="relative flex items-end"
        style={{ minHeight: "420px", backgroundColor: "#e55012" }}
      >
        <div className="absolute inset-0">
          <Image
            src="/images/running-profile.jpg"
            alt="Ben running"
            fill
            className="object-cover object-top"
            sizes="100vw"
            style={{ opacity: 0.3, mixBlendMode: "multiply" }}
          />
        </div>
        <div className="relative z-10 px-8 py-12">
          <h2
            className="font-display leading-none text-white"
            style={{ fontSize: "clamp(3rem, 10vw, 9rem)" }}
          >
            Ben Hubbard
          </h2>
          <p
            className="mt-3 text-sm uppercase tracking-[0.25em]"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Runner, part time cyclist, more part time triathlete
          </p>
          <a
            href="https://www.strava.com/athletes/938645"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-6 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ color: "rgba(255,255,255,0.8)" }}
          >
            View on Strava
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169" />
            </svg>
          </a>
        </div>
      </section>

      {/* Parkrun */}
      <ParkrunSection stats={stats?.parkrun ?? null} />

      {/* Notable runs */}
      <section className="px-8 py-16" style={{ background: "#111", color: "#fff" }}>
        <h2
          className="font-display text-white mb-12"
          style={{ fontSize: "clamp(2rem, 6vw, 4rem)" }}
        >
          Notable runs
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-0 md:divide-x md:divide-white/10">
          {challenges.map((c) => (
            <div key={c.title} className="md:px-10 first:pl-0 last:pr-0">
              <p
                className="text-xs tracking-[0.2em] uppercase mb-5"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                {c.tag}
              </p>
              <p
                className="font-display leading-none mb-5"
                style={{ fontSize: "clamp(3rem, 8vw, 5rem)", color: "#fc4c02" }}
              >
                {c.stat}
              </p>
              <p className="font-medium text-lg mb-2 text-white">{c.title}</p>
              <p
                className="text-sm mb-4"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                {c.meta}
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "rgba(255,255,255,0.65)" }}
              >
                {c.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section
        className="py-16"
        style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="max-w-2xl mx-auto px-8 flex flex-col gap-6">
          {story.map((p, i) => (
            <p key={i} className="leading-relaxed" style={{ color: "rgba(0,0,0,0.6)" }}>
              {p}
            </p>
          ))}
        </div>
      </section>

      {/* Personal bests */}
      <PersonalBests />

    </main>
  );
}
