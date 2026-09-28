"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Place } from "@/lib/travel";

const INK = "#111";

/** How far the map zooms in: all the way out, and as far as it goes. */
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
/** How close a place in the list zooms to its pin. */
const PLACE_ZOOM = 4;
/** Movement before a press becomes a drag rather than a tap. */
const DRAG_SLOP = 6;

type Pin = Place & { x: number; y: number };

/** Scale, then offset in screen pixels, applied to the map from its top-left. */
type View = { k: number; x: number; y: number };

type Point = { x: number; y: number };

const HOME: View = { k: 1, x: 0, y: 0 };

/**
 * The map and the list of places under it.
 *
 * The map pans and zooms: pinch or drag on a phone, the +/− buttons anywhere,
 * and a place in the list flies to its pin. It's all one CSS transform on the
 * layer holding the SVG and the pins; the pins counter-scale so they stay a
 * finger-sized 14px, and country borders don't thicken as it zooms.
 *
 * Pins are HTML laid over the SVG rather than SVG circles for the same reason.
 * Hovering or focusing a pin or a place lights up both.
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
  /** The pin a place in the list flew to; its name stays up until you move on. */
  const [focused, setFocused] = useState<number | null>(null);
  const [view, setView] = useState<View>(HOME);
  /** Eased for button and list moves; immediate while a finger is on it. */
  const [animate, setAnimate] = useState(false);

  const frameRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<View>(HOME);
  const pointers = useRef(new Map<number, Point>());
  const gesture = useRef<{ start: Point; dragging: boolean; pin: number | null } | null>(null);

  // Paint the document too, so overscroll shows the quest's colour.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", ground);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, [ground]);

  // The view's offset is in pixels, so when the frame resizes (a rotated
  // phone, a resized window) scale it with the frame to stay on the same spot.
  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    let last = frame.getBoundingClientRect().width;
    const observer = new ResizeObserver(() => {
      const now = frame.getBoundingClientRect().width;
      if (!last || now === last) return;
      const ratio = now / last;
      last = now;
      const { k, x, y } = viewRef.current;
      const v = { k, x: x * ratio, y: y * ratio };
      viewRef.current = v;
      setAnimate(false);
      setView(v);
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  /** Keeps the map covering its frame: no dragging it off into the void. */
  const clamp = (v: View): View => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return v;
    const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, v.k));
    return {
      k,
      x: Math.min(0, Math.max(rect.width * (1 - k), v.x)),
      y: Math.min(0, Math.max(rect.height * (1 - k), v.y)),
    };
  };

  const apply = (next: View, eased: boolean) => {
    const v = clamp(next);
    viewRef.current = v;
    setAnimate(eased);
    setView(v);
  };

  /** Zoom by a factor, keeping the point under `at` (frame pixels) in place. */
  const zoomAbout = (factor: number, at: Point, eased: boolean) => {
    const { k, x, y } = viewRef.current;
    const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k * factor));
    const ratio = next / k;
    apply({ k: next, x: at.x - (at.x - x) * ratio, y: at.y - (at.y - y) * ratio }, eased);
  };

  const zoomButton = (factor: number) => {
    const rect = frameRef.current?.getBoundingClientRect();
    if (!rect) return;
    zoomAbout(factor, { x: rect.width / 2, y: rect.height / 2 }, true);
  };

  const reset = () => {
    setFocused(null);
    apply(HOME, true);
  };

  /** Fly to a pin, bringing the map into view first if the list is on screen. */
  const flyTo = (i: number) => {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    const px = (pins[i].x / width) * rect.width;
    const py = (pins[i].y / height) * rect.height;
    setFocused(i);
    apply({ k: PLACE_ZOOM, x: rect.width / 2 - px * PLACE_ZOOM, y: rect.height / 2 - py * PLACE_ZOOM }, true);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    frame.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
  };

  // ── Gestures ───────────────────────────────────────────────────────────────

  const local = (e: React.PointerEvent): Point => {
    const rect = frameRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    pointers.current.set(e.pointerId, local(e));
    const pinEl = (e.target as HTMLElement).closest<HTMLElement>("[data-pin]");
    gesture.current = {
      start: local(e),
      dragging: pointers.current.size > 1,
      pin: pinEl ? Number(pinEl.dataset.pin) : null,
    };
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
      // Captured only once it's a real drag, so a tap still reaches a pin.
      // Throws if the pointer has already gone, which just means no capture.
      try {
        frame.setPointerCapture(e.pointerId);
      } catch {}
    }

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
        apply({ k: next, x: mid.x - (mid0.x - x) * ratio, y: mid.y - (mid0.y - y) * ratio }, false);
      }
    } else if (g.dragging && viewRef.current.k > 1) {
      const { k, x, y } = viewRef.current;
      apply({ k, x: x + now.x - prev.x, y: y + now.y - prev.y }, false);
    }

    pointers.current.set(e.pointerId, now);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    pointers.current.delete(e.pointerId);
    // A tap on a pin on a touch screen, which has no hover, shows its name
    if (g && !g.dragging && e.pointerType !== "mouse") {
      setFocused(g.pin);
    }
    if (pointers.current.size === 0) gesture.current = null;
  };

  const countryNames = [...new Set(pins.map((p) => p.country))].sort();
  // A whole country goes by its name; a city carries its country after it
  const listed = pins
    .map((pin, i) => ({ pin, i, label: pin.name === pin.country ? pin.name : `${pin.name}, ${pin.country}` }))
    .sort((a, b) => a.label.localeCompare(b.label));

  const zoomed = view.k > 1.01;

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
                  transform: `translate(${view.x}px, ${view.y}px) scale(${view.k})`,
                  "--zoom": view.k,
                } as React.CSSProperties
              }
            >
              <svg viewBox={`0 0 ${width} ${height}`} className="block h-auto w-full" aria-hidden="true">
                {countries.map((c, i) => (
                  <path
                    key={i}
                    d={c.d}
                    fill={c.visited ? INK : "rgba(17,17,17,0.16)"}
                    stroke={ground}
                    strokeWidth={0.8}
                    strokeLinejoin="round"
                    vectorEffect="non-scaling-stroke"
                  />
                ))}
              </svg>

              {pins.map((pin, i) => (
                <button
                  key={`${pin.name}-${pin.country}`}
                  type="button"
                  data-pin={i}
                  className="travel-pin absolute"
                  data-active={active === i || focused === i}
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

          {/* Under the map rather than over it, where on a phone they'd
              cover half of it */}
          <div className="mt-4 flex items-center justify-between gap-4">
            <p className="travel-hint text-sm opacity-70">Pinch to zoom, drag to look around.</p>
            <div className="ml-auto flex gap-1.5">
              {zoomed && (
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
          <h2 id="travel-places" className="font-display text-h2">
            Where I&apos;ve been
          </h2>
          <ul className="mt-10 flex flex-wrap gap-3 pt-8" style={{ borderTop: `3px solid ${INK}` }}>
            {listed.map(({ i, label }) => (
              <li key={label}>
                <button
                  type="button"
                  className="travel-chip font-subhead rounded-full px-5 py-2 text-h4"
                  data-active={active === i || focused === i}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setActive(i)}
                  onPointerLeave={() => setActive(null)}
                  onClick={() => flyTo(i)}
                  aria-label={`Show ${label} on the map`}
                >
                  {label}
                </button>
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
