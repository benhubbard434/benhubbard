import type { ParkrunStats } from "@/lib/parkrun";
import { StatCell } from "./StravaStats";
import ParkrunMap from "./ParkrunMap";
import { parkrunMapViews } from "./mapViews";

const ORANGE = "#fc4c02";
const RULE = "1px solid rgba(0,0,0,0.08)";

/**
 * Official PB, entered by hand. Strava's elapsed times run a few seconds off,
 * so its own fastest (20:28 at Coldham's Common) isn't the real one.
 */
const OFFICIAL_PB = {
  time: "20:33",
  venue: "Wanstead Flats",
  date: "6 Jun 2015",
  strava: "https://www.strava.com/activities/319303827",
};

const TOP_VENUES = 6;

const clock = (s: number | null) =>
  s == null ? "—" : `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

const monthYear = (iso: string) =>
  new Date(iso).toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

export default function ParkrunSection({ stats }: { stats: ParkrunStats | null }) {
  if (stats?.unplaced.length) {
    console.warn(
      `Parkruns with no known venue (add them to VENUES in lib/parkrun.ts): ${stats.unplaced.join(", ")}`
    );
  }

  return (
    <section className="py-16" style={{ borderBottom: RULE }}>
      <div className="px-8 mb-10">
        <h2 className="font-display text-4xl md:text-5xl mb-3">Parkrun</h2>
        <p className="text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>
          {stats
            ? `${stats.total} parkruns at ${stats.venues.length} venues. PB ${OFFICIAL_PB.time}.`
            : `PB ${OFFICIAL_PB.time}.`}
          {stats?.nextMilestone &&
            ` ${stats.nextMilestone.toGo} to go until the ${stats.nextMilestone.at} club.`}
        </p>
      </div>

      {stats ? <ParkrunStatsBody stats={stats} /> : (
        <p className="px-8 text-sm" style={{ color: "rgba(0,0,0,0.45)" }}>
          Parkrun stats are unavailable right now.
        </p>
      )}
    </section>
  );
}

function ParkrunStatsBody({ stats }: { stats: ParkrunStats }) {
  const home = stats.venues[0];
  const maxYear = Math.max(...stats.byYear.map((y) => y.count));
  const timedYears = stats.byYear.filter((y) => y.medianSeconds != null);
  const quickestYear = timedYears.reduce((a, b) => (b.medianSeconds! < a.medianSeconds! ? b : a));
  const topVenues = stats.venues.slice(0, TOP_VENUES);
  const otherVenues = stats.venues.length - topVenues.length;
  const oneOffs = stats.venues.filter((v) => v.count === 1).length;

  return (
    <>
      {/* Headline numbers */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ background: "#fff", borderTop: RULE, borderBottom: RULE }}
      >
        <StatCell label="Parkruns" value={String(stats.total)} unit="runs" />
        <StatCell
          label="Fastest"
          value={OFFICIAL_PB.time}
          unit="pb"
          note={
            <a
              href={OFFICIAL_PB.strava}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-black"
            >
              {OFFICIAL_PB.venue}, {OFFICIAL_PB.date}
            </a>
          }
          border
        />
        <StatCell label="Typical time" value={clock(stats.medianSeconds)} unit="median" border />
        <StatCell
          label="Longest streak"
          value={String(stats.longestStreak.weeks)}
          unit="weeks"
          border
        />
      </div>

      <div className="px-8 pt-16 grid gap-16 md:grid-cols-2">
        {/* Volume and pace by year */}
        <div>
          <h3 className="text-h3 mb-2">Year by year</h3>
          <p className="text-sm mb-6" style={{ color: "rgba(0,0,0,0.45)" }}>
            Parkruns each year, and the median time. Quickest year in orange.
          </p>
          <ul className="flex flex-col gap-1.5">
            {stats.byYear.map((y) => {
              const quickest = y.year === quickestYear.year;
              return (
                <li
                  key={y.year}
                  className="grid grid-cols-[3rem_1fr_2rem_3.25rem] items-center gap-3 text-sm tabular-nums"
                >
                  <span style={{ color: "rgba(0,0,0,0.5)" }}>{y.year}</span>
                  <span className="h-3" style={{ background: "rgba(0,0,0,0.06)" }}>
                    <span
                      className="block h-full"
                      style={{
                        width: `${(y.count / maxYear) * 100}%`,
                        background: quickest ? ORANGE : "#111",
                      }}
                    />
                  </span>
                  <span className="text-right">{y.count}</span>
                  <span
                    className="text-right"
                    style={{ color: quickest ? ORANGE : "rgba(0,0,0,0.45)" }}
                  >
                    {clock(y.medianSeconds)}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Venues */}
        <div>
          <h3 className="text-h3 mb-2">Where</h3>
          <p className="text-sm mb-6" style={{ color: "rgba(0,0,0,0.45)" }}>
            {home.name} is home: {Math.round((home.count / stats.total) * 100)}% of every
            parkrun I&apos;ve done.
          </p>
          <ul className="flex flex-col gap-1.5">
            {topVenues.map((v, i) => (
              <li
                key={v.name}
                className="grid grid-cols-[minmax(0,9rem)_1fr_2rem] items-center gap-3 text-sm tabular-nums"
              >
                <span className="truncate" style={{ color: "rgba(0,0,0,0.5)" }}>{v.name}</span>
                <span className="h-3" style={{ background: "rgba(0,0,0,0.06)" }}>
                  <span
                    className="block h-full"
                    style={{
                      width: `${(v.count / home.count) * 100}%`,
                      background: i === 0 ? ORANGE : "#111",
                    }}
                  />
                </span>
                <span className="text-right">{v.count}</span>
              </li>
            ))}
          </ul>
          {otherVenues > 0 && (
            <div className="text-sm mt-3" style={{ color: "rgba(0,0,0,0.4)" }}>
              And {otherVenues} more, {oneOffs} of them just once.
              <ParkrunMap views={parkrunMapViews(stats.venues)} />
            </div>
          )}

          {/* Milestones */}
          <h3 className="text-h3 mt-12 mb-4">Milestones</h3>
          <ol className="flex flex-col gap-2 text-sm">
            {stats.milestones.map((m) => (
              <li key={m.at} className="flex justify-between" style={{ borderBottom: RULE }}>
                <span className="pb-2">{m.at}th parkrun</span>
                <span className="pb-2" style={{ color: "rgba(0,0,0,0.45)" }}>
                  {monthYear(m.date)}
                </span>
              </li>
            ))}
            {stats.nextMilestone && (
              <li className="flex justify-between" style={{ color: ORANGE }}>
                <span>{stats.nextMilestone.at}th parkrun</span>
                <span>{stats.nextMilestone.toGo} to go</span>
              </li>
            )}
          </ol>
        </div>
      </div>

      {/* Alphabet */}
      <div className="px-8 pt-16">
        <div className="flex items-baseline justify-between mb-3">
          <h3 className="text-h3">The alphabet</h3>
          <span className="text-sm" style={{ color: "rgba(0,0,0,0.4)" }}>
            {stats.lettersDone} of {stats.alphabet.length}
          </span>
        </div>
        <p className="text-sm mb-8" style={{ color: "rgba(0,0,0,0.45)" }}>
          A parkrun for every letter. There&apos;s no X, so 25 is the full set.
        </p>

        {/* Bleeds into the gutter on phones so venue names fit their cells. */}
        <div
          className="grid grid-cols-5 -mx-4 md:mx-0"
          style={{ border: "1px solid rgba(0,0,0,0.1)" }}
        >
          {stats.alphabet.map(({ letter, venue, others }, i) => {
            const isLastInRow = (i + 1) % 5 === 0;
            const isLastRow = i >= stats.alphabet.length - 5;
            return (
              <div
                key={letter}
                className="p-1 md:p-6 flex flex-col min-w-0"
                style={{
                  borderRight: isLastInRow ? "none" : "1px solid rgba(0,0,0,0.1)",
                  borderBottom: isLastRow ? "none" : "1px solid rgba(0,0,0,0.1)",
                  background: venue ? "#fff" : "transparent",
                  minHeight: "5rem",
                }}
              >
                <span
                  className="font-display text-3xl md:text-4xl leading-none"
                  style={{ color: venue ? ORANGE : "rgba(0,0,0,0.18)" }}
                >
                  {letter}
                </span>
                {venue && (
                  <span
                    className="mt-2 text-[9px] md:text-[10px] leading-tight md:uppercase md:tracking-wider break-words"
                    style={{ color: "rgba(0,0,0,0.4)" }}
                  >
                    {venue}
                    {others > 0 && (
                      <span style={{ color: "rgba(0,0,0,0.25)" }}> +{others}</span>
                    )}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
