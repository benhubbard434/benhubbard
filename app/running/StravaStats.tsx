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

  return (
    <section className="px-8 py-16 bg-black text-white border-b border-white/10">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
        <StatBlock
          label="Distance This Year"
          value={loading ? "—" : `${stats?.ytd_distance_km ?? "—"}`}
          unit="km"
        />
        <StatBlock
          label="Total Distance — All Time"
          value={loading ? "—" : `${stats?.all_time_distance_km ?? "—"}`}
          unit="km"
        />
      </div>

      <div className="w-full h-px bg-[#e55012] mb-10" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-10">
        <StatBlock
          label={`Races in ${currentYear}`}
          value={loading ? "—" : String(stats?.races_this_year ?? "—")}
          unit="races"
        />
        <StatBlock
          label="Races — All Time"
          value={loading ? "—" : String(stats?.all_time_races ?? "—")}
          unit="races"
        />
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://www.strava.com/athletes/938645"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded text-white text-sm font-medium transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#fc4c02" }}
        >
          View on Strava
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169" />
          </svg>
        </a>
        <button
          onClick={() => load(true)}
          disabled={refreshing}
          aria-label="Refresh stats"
          className="w-9 h-9 border border-white/20 rounded flex items-center justify-center hover:border-white/40 transition-colors disabled:opacity-50"
        >
          <ArrowClockwise
            size={16}
            weight="light"
            className={refreshing ? "animate-spin" : ""}
          />
        </button>
      </div>
    </section>
  );
}

function StatBlock({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div>
      <p className="text-xs tracking-[0.2em] uppercase text-white/50 mb-2">{label}</p>
      <p className="font-inktrap leading-none" style={{ fontSize: "clamp(4rem, 12vw, 8rem)" }}>
        {value}
        <span className="text-4xl md:text-5xl text-white/50 ml-2">{unit}</span>
      </p>
    </div>
  );
}
