"use client";

import { useEffect, useState } from "react";
import { ArrowClockwise } from "@phosphor-icons/react";

type Stats = {
  ytd_distance_km: string;
  all_time_distance_km: string;
  races_this_year: number;
  all_time_races: number;
};

export default function StravaStats() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh = false) {
    if (showRefresh) setRefreshing(true);
    try {
      const url = showRefresh ? `/api/strava?_t=${Date.now()}` : "/api/strava";
      const res = await fetch(url, showRefresh ? { cache: "no-store" } : {});
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const currentYear = new Date().getFullYear();
  const val = (v: string | number | null | undefined): string =>
    loading ? "—" : v != null ? String(v) : "—";

  return (
    <section style={{ background: "#fff", borderTop: "1px solid rgba(0,0,0,0.08)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
      <div className="grid grid-cols-2 md:grid-cols-4">
        <StatCell label="Distance this year" value={val(stats?.ytd_distance_km)} unit="km" />
        <StatCell label="All-time distance" value={val(stats?.all_time_distance_km)} unit="km" border />
        <StatCell label={`Races in ${currentYear}`} value={val(stats?.races_this_year)} unit="races" border />
        <StatCell label="Races all time" value={val(stats?.all_time_races)} unit="races" border />
      </div>

      <div
        className="px-8 py-3 flex items-center justify-between"
        style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}
      >
        <p className="text-xs uppercase tracking-[0.15em]" style={{ color: "rgba(0,0,0,0.35)" }}>
          Via Strava
        </p>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          aria-label="Refresh stats"
          className="flex items-center gap-1.5 text-xs transition-opacity hover:opacity-60 disabled:opacity-30"
          style={{ color: "rgba(0,0,0,0.45)" }}
        >
          <ArrowClockwise
            size={12}
            weight="light"
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>
    </section>
  );
}

function StatCell({
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
        className="font-display leading-none flex flex-wrap items-baseline gap-x-2"
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
