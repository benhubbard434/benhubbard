"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Image as ImageIcon } from "@phosphor-icons/react";
import type { City, Place } from "@/lib/travel";
import TravelLightbox from "./TravelLightbox";

const INK = "#111";
/** The brand blue, as on the AI tab */
const BLUE = "#470FF4";
/** Country fills: visited, visited while another is focused, and unvisited */
const FILL_VISITED = INK;
const FILL_DIMMED = "rgba(17,17,17,0.45)";
const FILL_UNVISITED = "rgba(17,17,17,0.16)";

/** How far the map zooms in: all the way out, and as far as it goes. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 36;
/** As far as clicking a country zooms on its own; the rest is by hand. */
const MAX_FIT_ZOOM = 12;
/** How close a place zooms when it has no country to fit, like a city. */
const PLACE_ZOOM = 4;
/** How much of the frame a country fills when zoomed to, leaving a margin. */
const FIT = 0.8;
/** How far in the map has to be before a selected country's cities show. */
const CITY_ZOOM = 3;
/** Movement before a press becomes a drag rather than a tap. */
const DRAG_SLOP = 6;

/** In the SVG's units. `countryIndex` is the country it falls in, if drawn. */
type Pin = Place & { x: number; y: number; countryIndex: number | null };

/** A city, in the SVG's units. */
type CityPin = City & { x: number; y: number };

export type MapCountry = {
  d: string;
  visited: boolean;
  /** Visited countries only: [x0, y0, x1, y1] of their mainland, to zoom to. */
  bounds?: [number, number, number, number];
};

/**
 * Scale, then offset, applied to the map from its top-left. Offsets are
 * fractions of the map's own size, so a view means the same at any width and
 * the server can render the starting one.
 */
export type View = { k: number; x: number; y: number };

type Point = { x: number; y: number };

/**
 * The map and the list of places under it.
 *
 * The map pans and zooms: pinch or drag on a phone, the +/− buttons anywhere.
 * Clicking a pin, a filled-in country or a place in the list zooms to fit
 * that country. It starts zoomed in on everywhere I've been, `home`, rather
 * than the whole world. It's all one CSS transform on the layer holding the
 * SVG and the pins; the pins counter-scale so they stay a finger-sized 14px,
 * and country borders thin out so they don't thicken as it zooms.
 *
 * Pins are HTML laid over the SVG rather than SVG circles for the same reason.
 * Hovering or focusing a pin or a place lights up both.
 *
 * Cities stay out of sight until their country is selected: then they appear
 * on the map, once it's zoomed in far enough to separate them, and in the
 * list under their country (or all of them, with "show all cities"). A
 * selected city's name shows over its pin in blue. A city with an album gets
 * a photo button on its pin, which opens the album full screen.
 */
export default function TravelMap({
  ground,
  width,
  height,
  countries,
  pins,
  cities,
  home,
}: {
  ground: string;
  width: number;
  height: number;
  countries: MapCountry[];
  pins: Pin[];
  cities: CityPin[];
  /** The starting view, and where Reset goes back to. */
  home: View;
}) {
  const [active, setActive] = useState<number | null>(null);
  /** The pin last zoomed to. Its country stays black and the rest of the
      visited ones grey out, with its name in the map's corner, until reset. */
  const [focused, setFocused] = useState<number | null>(null);
  const [view, setView] = useState<View>(home);
  /** Eased for button and list moves; immediate while a finger is on it. */
  const [animate, setAnimate] = useState(false);
  /** Cities, by index: hovered, selected (named in blue), and album open. */
  const [activeCity, setActiveCity] = useState<number | null>(null);
  const [selectedCity, setSelectedCity] = useState<number | null>(null);
  const [album, setAlbum] = useState<number | null>(null);
  const [allCities, setAllCities] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(home);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ start: Point; dragging: boolean } | null>(null);

  // Paint the document too, so overscroll shows the quest's colour.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", ground);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, [ground]);

  /** Keeps the map covering its frame: no dragging it off into the void. */
  const clamp = (v: View): View => {
    const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.k));
    return {
      k,
      x: Math.min(0, Math.max(1 - k, v.x)),
      y: Math.min(0, Math.max(1 - k, v.y)),
    };
  };

  const apply = (next: View, eased: boolean) => {
    const v = clamp(next);
    // Zoomed all the way back out, nothing's in focus any more
    if (v.k <= MIN_ZOOM + 0.01) {
      setFocused(null);
      setSelectedCity(null);
    }
    viewRef.current = v;
    setAnimate(eased);
    setView(v);
  };

  /** Zoom by a factor, keeping the point under `at` (a fraction of the map) in place. */
  const zoomAbout = (factor: number, at: Point, eased: boolean) => {
    const { k, x, y } = viewRef.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k * factor));
    const ratio = next / k;
    apply({ k: next, x: at.x - (at.x - x) * ratio, y: at.y - (at.y - y) * ratio }, eased);
  };

  const zoomButton = (factor: number) => zoomAbout(factor, { x: 0.5, y: 0.5 }, true);

  const reset = () => {
    setFocused(null);
    setSelectedCity(null);
    apply(home, true);
  };

  /** Brings the map into view, for zooms started from the list below it. */
  const bringIntoView = () => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frameRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  /** Zoom to centre a point, in the SVG's units, at zoom k. */
  const centreOn = (px: number, py: number, k: number) => {
    apply({ k, x: 0.5 - (px / width) * k, y: 0.5 - (py / height) * k }, true);
  };

  /** The zoom at which a box, in the SVG's units, fills the frame with a margin. */
  const fitZoom = ([x0, y0, x1, y1]: [number, number, number, number]) =>
    Math.min(MAX_FIT_ZOOM, Math.max(MIN_ZOOM, FIT * Math.min(width / (x1 - x0), height / (y1 - y0))));

  const fit = (bounds: [number, number, number, number]) => {
    const [x0, y0, x1, y1] = bounds;
    centreOn((x0 + x1) / 2, (y0 + y1) / 2, fitZoom(bounds));
  };

  /** Zoom to a country, naming the first pin in it. */
  const showCountry = (ci: number) => {
    const bounds = countries[ci].bounds;
    if (!bounds) return;
    const first = pins.findIndex((p) => p.countryIndex === ci);
    setFocused(first === -1 ? null : first);
    setSelectedCity(null);
    fit(bounds);
  };

  /**
   * Zoom to a pin: to fit its whole country if the pin stands for one, or
   * close in on the spot if it's a city (or somewhere too small to draw).
   */
  const showPin = (i: number) => {
    const pin = pins[i];
    const bounds = pin.countryIndex === null ? undefined : countries[pin.countryIndex].bounds;
    setFocused(i);
    setSelectedCity(null);
    if (bounds && pin.name === pin.country) fit(bounds);
    else centreOn(pin.x, pin.y, PLACE_ZOOM);
  };

  /**
   * Select a city from the list: zoom to its country, as its country's pin
   * would, and name the city in blue. If fitting the whole country leaves the
   * map too far out for cities to show, it closes in on the city instead.
   */
  const showCity = (ci: number) => {
    const city = cities[ci];
    const pi = pins.findIndex((p) => p.country === city.country);
    if (pi === -1) return;
    const pin = pins[pi];
    const bounds = pin.countryIndex === null ? undefined : countries[pin.countryIndex].bounds;
    setFocused(pi);
    setSelectedCity(ci);
    if (bounds && pin.name === pin.country && fitZoom(bounds) >= CITY_ZOOM) fit(bounds);
    else centreOn(city.x, city.y, Math.max(PLACE_ZOOM, CITY_ZOOM));
  };

  // ── Gestures ───────────────────────────────────────────────────────────────

  const local = (e: React.PointerEvent): Point => {
    const rect = frameRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, local(e));
    gesture.current = { start: local(e), dragging: pointers.current.size > 1 };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const prev = pointers.current.get(e.pointerId);
    const g = gesture.current;
    if (!prev || !g) return;
    const now = local(e);

    if (!g.dragging && Math.hypot(now.x - g.start.x, now.y - g.start.y) > DRAG_SLOP) {
      g.dragging = true;
    }
    const frame = frameRef.current;
    if (g.dragging && frame && !frame.hasPointerCapture(e.pointerId)) {
      // Captured only once it's a real drag, so a tap still clicks a pin or
      // a country, and a drag that ends on one doesn't.
      // Throws if the pointer has already gone, which just means no capture.
      try {
        frame.setPointerCapture(e.pointerId);
      } catch {}
    }

    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    if (pointers.current.size === 2) {
      // Pinch: scale by the change in finger spread, about their midpoint,
      // and pan by how far the midpoint moved.
      const [a, b] = [...pointers.current.entries()].map(([id, p]) => (id === e.pointerId ? now : p));
      const [a0, b0] = [...pointers.current.values()];
      const spread = Math.hypot(a.x - b.x, a.y - b.y);
      const spread0 = Math.hypot(a0.x - b0.x, a0.y - b0.y);
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      const mid0 = { x: (a0.x + b0.x) / 2, y: (a0.y + b0.y) / 2 };
      if (spread0 > 0) {
        const { k, x, y } = viewRef.current;
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k * (spread / spread0)));
        const ratio = next / k;
        // Pixels to fractions of the map, which views are kept in
        const fx = (px: number) => px / rect.width;
        const fy = (py: number) => py / rect.height;
        apply(
          { k: next, x: fx(mid.x) - (fx(mid0.x) - x) * ratio, y: fy(mid.y) - (fy(mid0.y) - y) * ratio },
          false,
        );
      }
    } else if (g.dragging && viewRef.current.k > 1) {
      const { k, x, y } = viewRef.current;
      apply({ k, x: x + (now.x - prev.x) / rect.width, y: y + (now.y - prev.y) / rect.height }, false);
    }

    pointers.current.set(e.pointerId, now);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
  };

  const countryNames = [...new Set(pins.map((p) => p.country))].sort();
  // A whole country goes by its name; a city carries its country after it
  const listed = pins
    .map((pin, i) => ({ pin, i, label: pin.name === pin.country ? pin.name : `${pin.name}, ${pin.country}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const zoomed = view.k > MIN_ZOOM + 0.01;
  const atHome =
    Math.abs(view.k - home.k) < 0.01 && Math.abs(view.x - home.x) < 0.001 && Math.abs(view.y - home.y) < 0.001;
  const focusedPin = focused === null ? null : pins[focused];
  const focusedCountry = focusedPin?.countryIndex ?? null;
  const fillFor = (c: MapCountry, i: number) => {
    if (!c.visited) return FILL_UNVISITED;
    if (focused === null || i === focusedCountry) return FILL_VISITED;
    return FILL_DIMMED;
  };

  const citiesOf = (country: string) =>
    cities.map((city, ci) => ({ city, ci })).filter(({ city }) => city.country === country);
  // The selected country's cities, once the map is in close enough
  const shownCities =
    focusedPin && view.k >= CITY_ZOOM - 0.01 ? citiesOf(focusedPin.country) : [];
  const albumCity = album === null ? null : cities[album];
  // A country's own pin steps aside for its cities
  const hidePin = (i: number) => i === focused && shownCities.length > 0 && pins[i].name === pins[i].country;

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
              {countryNames.length} {countryNames.length === 1 ? "country" : "countries"}
            </p>
          )}
        </div>
      </section>

      {/* ── Map ───────────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 pt-12 md:px-10" aria-label="Map of places I've travelled">
        <div className="py-6" style={{ borderBlock: `3px solid ${INK}` }}>
          <div
            ref={frameRef}
            className="travel-frame relative overflow-hidden"
            data-zoomed={zoomed}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          >
            <div
              className="travel-layer relative origin-top-left"
              data-animate={animate}
              style={
                {
                  // Percentages of the layer's own size, which is the map's
                  transform: `translate(${view.x * 100}%, ${view.y * 100}%) scale(${view.k})`,
                  "--zoom": view.k,
                } as React.CSSProperties
              }
            >
              <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" aria-hidden="true">
                {countries.map((c, i) => (
                  <path
                    key={i}
                    d={c.d}
                    className={c.visited ? "travel-country" : undefined}
                    onClick={c.visited ? () => showCountry(i) : undefined}
                    style={{ fill: fillFor(c, i) }}
                    stroke={ground}
                    strokeLinejoin="round"
                  />
                ))}
              </svg>

              {pins.map((pin, i) => hidePin(i) ? null : (
                <button
                  key={`${pin.name}-${pin.country}`}
                  type="button"
                  data-pin={i}
                  className="travel-pin absolute"
                  data-active={active === i}
                  data-focused={focused === i}
                  style={
                    {
                      left: `${(pin.x / width) * 100}%`,
                      top: `${(pin.y / height) * 100}%`,
                      animationDelay: `${Math.min(i * 60, 1200)}ms`,
                    } as React.CSSProperties
                  }
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onFocus={() => setActive(i)}
                  onBlur={() => setActive(null)}
                  onClick={() => showPin(i)}
                  aria-label={`Zoom to ${pin.name === pin.country ? pin.name : `${pin.name}, ${pin.country}`}`}
                >
                  <span className="travel-pin-dot" />
                  <span className="travel-pin-label font-display" aria-hidden="true">
                    {pin.name}
                  </span>
                </button>
              ))}

              {shownCities.map(({ city, ci }, n) => (
                <div
                  key={`${city.name}-${city.country}`}
                  className="travel-pin travel-city absolute"
                  data-active={activeCity === ci}
                  data-selected={selectedCity === ci}
                  style={
                    {
                      left: `${(city.x / width) * 100}%`,
                      top: `${(city.y / height) * 100}%`,
                      animationDelay: `${Math.min(n * 50, 600)}ms`,
                    } as React.CSSProperties
                  }
                >
                  <button
                    type="button"
                    className="travel-city-hit"
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActiveCity(ci)}
                    onPointerLeave={() => setActiveCity(null)}
                    onFocus={() => setActiveCity(ci)}
                    onBlur={() => setActiveCity(null)}
                    onClick={() => setSelectedCity(ci)}
                    aria-label={city.name}
                    aria-pressed={selectedCity === ci}
                  >
                    <span className="travel-pin-dot" />
                  </button>
                  <span className="travel-pin-label font-display" aria-hidden="true">
                    {city.name}
                  </span>
                  {city.album && city.album.length > 0 && (
                    <button
                      type="button"
                      className="travel-album"
                      data-album={ci}
                      onClick={() => setAlbum(ci)}
                      aria-label={`Open photos from ${city.name}`}
                    >
                      <ImageIcon size={14} weight="bold" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* The focused place's name, pinned to the map's corner rather
                than its pin, where it would sit over the country it names */}
            {focusedPin && (
              <p
                key={focused}
                className="travel-focus font-display pointer-events-none absolute top-2 left-2 rounded-md px-3 py-1.5 text-sm uppercase text-white"
                style={{ backgroundColor: BLUE }}
                aria-live="polite"
              >
                {focusedPin.name}
              </p>
            )}
          </div>

          {/* Under the map rather than over it, where on a phone they'd
              cover half of it */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="travel-hint text-sm opacity-70">Pinch to zoom, drag to look around.</p>
            <div className="ml-auto flex gap-1.5">
              {!atHome && (
                <button type="button" className="travel-control font-display px-3 text-xs uppercase" onClick={reset}>
                  Reset
                </button>
              )}
              <button type="button" className="travel-control w-9 text-lg" onClick={() => zoomButton(1 / 1.8)} disabled={!zoomed} aria-label="Zoom out">
                −
              </button>
              <button type="button" className="travel-control w-9 text-lg" onClick={() => zoomButton(1.8)} disabled={view.k >= MAX_ZOOM} aria-label="Zoom in">
                +
              </button>
            </div>
          </div>
        </div>

        {pins.length === 0 && <p className="font-subhead mt-8 text-h3">Pins going in soon.</p>}
      </section>

      {/* ── Places ────────────────────────────────────────────────────────── */}
      {pins.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pt-24 md:px-10" aria-labelledby="travel-places">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 id="travel-places" className="font-display text-h2">
              Where I&apos;ve been
            </h2>
            {cities.length > 0 && (
              <button
                type="button"
                role="switch"
                aria-checked={allCities}
                onClick={() => setAllCities((on) => !on)}
                className="travel-switch flex items-center gap-3 pb-1 text-sm"
              >
                <span className="travel-switch-track" aria-hidden="true">
                  <span className="travel-switch-thumb" />
                </span>
                Show all cities
              </button>
            )}
          </div>
          <ul className="mt-10 flex flex-wrap gap-3 pt-8" style={{ borderTop: `3px solid ${INK}` }}>
            {listed.map(({ pin, i, label }) => {
              // A country's cities show under it once it's selected, or all
              // of them with the switch on
              const open = allCities || focusedPin?.country === pin.country;
              const own = open ? citiesOf(pin.country) : [];
              return (
                <li key={label} className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="travel-chip font-subhead rounded-full px-5 py-2 text-h4"
                    data-active={active === i || focused === i}
                    onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                    onPointerLeave={() => setActive(null)}
                    onClick={() => {
                      bringIntoView();
                      showPin(i);
                    }}
                    aria-label={`Show ${label} on the map`}
                  >
                    {label}
                  </button>
                  {own.map(({ city, ci }) => (
                    <button
                      key={city.name}
                      type="button"
                      className="travel-city-chip inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm"
                      data-active={activeCity === ci}
                      data-selected={selectedCity === ci}
                      onPointerEnter={(e) => e.pointerType === "mouse" && setActiveCity(ci)}
                      onPointerLeave={() => setActiveCity(null)}
                      onClick={() => {
                        bringIntoView();
                        showCity(ci);
                      }}
                      aria-label={`Show ${city.name}, ${city.country} on the map`}
                    >
                      {city.name}
                      {city.album && city.album.length > 0 && <ImageIcon size={12} weight="bold" aria-hidden="true" />}
                    </button>
                  ))}
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {albumCity?.album && (
        <TravelLightbox
          title={`${albumCity.name}, ${albumCity.country}`}
          photos={albumCity.album}
          onClose={() => {
            const ci = album;
            setAlbum(null);
            // Back to the photo button it came from. Safari doesn't focus a
            // button on click, so the lightbox can't rely on remembering it.
            requestAnimationFrame(() =>
              frameRef.current?.querySelector<HTMLElement>(`[data-album="${ci}"]`)?.focus(),
            );
          }}
        />
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
