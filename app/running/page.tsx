import Image from "next/image";
import StravaStats from "./StravaStats";

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

const alphabetData: { letter: string; location: string | null }[] = [
  { letter: "A", location: "Aldenham" },
  { letter: "B", location: "Bury St Edmunds" },
  { letter: "C", location: "Canterbury" },
  { letter: "D", location: "Dulwich" },
  { letter: "E", location: "East Brighton" },
  { letter: "F", location: "Fulham Palace" },
  { letter: "G", location: "Gadebridge" },
  { letter: "H", location: "Hackney Marshes" },
  { letter: "I", location: null },
  { letter: "J", location: "Jersey Farm" },
  { letter: "K", location: null },
  { letter: "L", location: "Lanhydrock" },
  { letter: "M", location: "Mile End" },
  { letter: "N", location: "Nonsuch" },
  { letter: "O", location: "Oak Hill" },
  { letter: "P", location: "Parke" },
  { letter: "Q", location: null },
  { letter: "R", location: "Roding Valley" },
  { letter: "S", location: "Stevenage" },
  { letter: "T", location: "Tooting Common" },
  { letter: "U", location: "University of Northampton" },
  { letter: "V", location: "Victoria Dock" },
  { letter: "W", location: "Wimpole Estate" },
  { letter: "Y", location: null },
  { letter: "Z", location: null },
];

const challenges = [
  {
    tag: "Challenge",
    stat: "×10",
    title: "5k on the hour, every hour",
    meta: "50km total · one Saturday · April 2025",
    description:
      "Ten 5k loops. One hour of rest between each. By round seven, walking to the start line counted as strategy.",
  },
  {
    tag: "Race",
    stat: "DNF",
    title: "Isle of Wight Ultra",
    meta: "73.7km covered · 12h 23m · May 2025",
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

const lorem = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
  "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.",
  "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.",
];

export default function RunningPage() {
  return (
    <main className="flex flex-col" style={{ background: "#f5f5f0", color: "#111" }}>

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
      <StravaStats />

      {/* Parkrun alphabet */}
      <section
        className="px-8 py-16"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.08)" }}
      >
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-4xl md:text-5xl">Parkrun alphabet</h2>
          <span className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>
            20 of 25
          </span>
        </div>
        <p className="text-sm mb-10" style={{ color: "rgba(0,0,0,0.45)" }}>
          242 parkruns. PB 20:33. Visiting one in every letter of the alphabet.
        </p>

        <div
          className="grid grid-cols-5"
          style={{ border: "1px solid rgba(0,0,0,0.1)" }}
        >
          {alphabetData.map(({ letter, location }, i) => {
            const done = location !== null;
            const isLastInRow = (i + 1) % 5 === 0;
            const isLastRow = i >= 20;
            return (
              <div
                key={letter}
                className="p-4 md:p-6 flex flex-col"
                style={{
                  borderRight: isLastInRow ? "none" : "1px solid rgba(0,0,0,0.1)",
                  borderBottom: isLastRow ? "none" : "1px solid rgba(0,0,0,0.1)",
                  background: done ? "#fff" : "transparent",
                  minHeight: "5rem",
                }}
              >
                <span
                  className="font-display text-3xl md:text-4xl leading-none"
                  style={{ color: done ? "#fc4c02" : "rgba(0,0,0,0.18)" }}
                >
                  {letter}
                </span>
                {done && location && (
                  <span
                    className="mt-2 text-[10px] leading-tight uppercase tracking-wider"
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    {location}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </section>

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
          {lorem.map((p, i) => (
            <p key={i} className="leading-relaxed" style={{ color: "rgba(0,0,0,0.6)" }}>
              {p}
            </p>
          ))}
        </div>
      </section>

    </main>
  );
}
