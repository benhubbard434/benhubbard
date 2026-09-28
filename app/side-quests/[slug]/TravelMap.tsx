"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Place } from "@/lib/travel";

const INK = "#111";

type Pin = Place & { x: number; y: number };

/**
 * The map and the list of places under it. Pins are HTML laid over the SVG,
 * not SVG circles, so they stay a finger-sized 16px however far the map
 * scales down on a phone. Hovering or focusing a pin or a row lights up both.
 */
export default function TravelMap({
  ground,
  width,
  height,
  countries,
  pins,
}: {
  ground: string;
  width: number;
  height: number;
  countries: { d: string; visited: boolean }[];
  pins: Pin[];
}) {
  const [active, setActive] = useState<number | null>(null);

  // Paint the document too, so overscroll shows the quest's colour.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", ground);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, [ground]);

  const countryNames = [...new Set(pins.map((p) => p.country))].sort();
  const byCountry = countryNames.map((country) => ({
    country,
    places: pins.map((pin, i) => ({ pin, i })).filter(({ pin }) => pin.country === country),
  }));

  return (
    <main
      data-full-bleed
      className="w-full min-h-dvh pb-24 overflow-hidden"
      style={{ backgroundColor: ground, color: INK, "--ground": ground } as React.CSSProperties}
    >
      {/* ── Title ─────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-32 md:px-10">
        <p className="mb-6 text-sm uppercase tracking-[0.2em]">Side quest</p>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h1 className="font-display text-display">Travel</h1>
          {pins.length > 0 && (
            <p className="font-subhead text-h3 pb-2">
              {countryNames.length} {countryNames.length === 1 ? "country" : "countries"} ·{" "}
              {pins.length} {pins.length === 1 ? "place" : "places"}
            </p>
          )}
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:px-10" aria-label="Map of places I've travelled">
        <div className="relative" style={{ borderBlock: `3px solid ${INK}` }}>
          <div className="relative my-6">
            <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" aria-hidden="true">
              {countries.map((c, i) => (
                <path
                  key={i}
                  d={c.d}
                  fill={c.visited ? INK : "rgba(17,17,17,0.16)"}
                  stroke={ground}
                  strokeWidth={0.6}
                  strokeLinejoin="round"
                />
              ))}
            </svg>

            {pins.map((pin, i) => (
              <button
                key={`${pin.name}-${pin.country}`}
                type="button"
                className="travel-pin absolute"
                data-active={active === i}
                style={
                  {
                    left: `${(pin.x / width) * 100}%`,
                    top: `${(pin.y / height) * 100}%`,
                    animationDelay: `${Math.min(i * 60, 1200)}ms`,
                  } as React.CSSProperties
                }
                onPointerEnter={() => setActive(i)}
                onPointerLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
                aria-label={`${pin.name}, ${pin.country}`}
              >
                <span className="travel-pin-dot" />
                <span className="travel-pin-label font-display" aria-hidden="true">
                  {pin.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {pins.length === 0 && (
          <p className="font-subhead mt-8 text-h3">Pins going in soon.</p>
        )}
      </section>

      {/* ── Places ────────────────────────────────────────────────────────── */}
      {pins.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-24 md:px-10" aria-labelledby="travel-places">
          <h2 id="travel-places" className="font-display text-h2">
            Where I&apos;ve been
          </h2>
          <ul className="mt-10" style={{ borderTop: `3px solid ${INK}` }}>
            {byCountry.map(({ country, places }) => (
              <li
                key={country}
                className="grid gap-2 py-5 md:grid-cols-[1fr_2fr] md:items-center md:gap-8"
                style={{ borderBottom: "1px solid rgba(17,17,17,0.3)" }}
              >
                <h3 className="text-h3">{country}</h3>
                <ul className="flex flex-wrap gap-2">
                  {places.map(({ pin, i }) => (
                    <li key={pin.name}>
                      <span
                        className="travel-chip inline-block rounded-full px-3 py-1 text-sm"
                        data-active={active === i}
                        onPointerEnter={() => setActive(i)}
                        onPointerLeave={() => setActive(null)}
                      >
                        {pin.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-24 flex justify-center px-6">
        <Link
          href="/work?tab=side-quests"
          className="font-display px-7 py-3.5 text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: INK, borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
        >
          Back to side quests
        </Link>
      </div>
    </main>
  );
}
