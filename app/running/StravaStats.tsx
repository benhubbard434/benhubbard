import type { StravaStats as Stats } from "@/lib/strava";

const fmt = (v: number | null | undefined): string =>
  v != null ? v.toLocaleString("en-GB") : "—";

export default function StravaStats({ stats }: { stats: Stats | null }) {
  const currentYear = new Date().getFullYear();

  return (
    <section style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="grid grid-cols-2 md:grid-cols-4">
        <StatCell label="Distance this year" value={fmt(stats?.ytdDistanceKm)} unit="km" />
        <StatCell label="All-time distance" value={fmt(stats?.allTimeDistanceKm)} unit="km" border />
        <StatCell label={`Races in ${currentYear}`} value={fmt(stats?.racesThisYear)} unit="races" border />
        <StatCell label="Races all time" value={fmt(stats?.allTimeRaces)} unit="races" border />
      </div>

      <div
        className="px-8 py-3"
        style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
      >
        <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "rgba(0,0,0,0.35)" }}>
          Via Strava
        </p>
      </div>
    </section>
  );
}

export function StatCell({
  label,
  value,
  unit,
  border,
}: {
  label: string;
  value: string;
  unit: string;
  border?: boolean;
}) {
  return (
    <div
      className="px-5 md:px-8 py-10"
      style={{ borderLeft: border ? "1px solid rgba(0,0,0,0.08)" : undefined }}
    >
      <p
        className="text-xs uppercase tracking-[0.2em] mb-3"
        style={{ color: "rgba(0,0,0,0.4)" }}
      >
        {label}
      </p>
      <p
        className="font-subhead leading-none flex flex-wrap items-baseline gap-x-2"
        style={{ fontSize: "clamp(1.75rem, 6vw, 4rem)" }}
      >
        {value}
        <span className="text-lg" style={{ color: "rgba(0,0,0,0.35)" }}>
          {unit}
        </span>
      </p>
    </div>
  );
}
