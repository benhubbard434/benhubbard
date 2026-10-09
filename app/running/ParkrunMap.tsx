"use client";

import { useRef, useState } from "react";
import { MapTrifold, X } from "@phosphor-icons/react";

export type MapView = {
  id: string;
  label: string;
  width: number;
  height: number;
  /** The coastline, already projected and clipped to the view. */
  land: string;
  venues: { name: string; count: number; x: number; y: number }[];
};

const ORANGE = "#fc4c02";

/** Area, not radius, tracks the count, so 131 visits doesn't swamp the map. */
const radius = (count: number) => 4 + Math.sqrt(count) * 1.1;

/**
 * Every parkrun venue on a map, in a pop-up opened from the "Where" list.
 * London gets its own view, since half the venues sit within 25km of it.
 */
export default function ParkrunMap({ views }: { views: MapView[] }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [viewId, setViewId] = useState(views[0]?.id);
  const [active, setActive] = useState<string | null>(null);
  const current = views.find((v) => v.id === viewId) ?? views[0];
  if (!current) return null;

  const home = Math.max(...current.venues.map((v) => v.count));
  const selected = current.venues.find((v) => v.name === active);
  // Biggest first, so the small dots sit on top and stay clickable
  const ordered = [...current.venues].sort((a, b) => b.count - a.count);

  const open = () => {
    setActive(null);
    dialogRef.current?.showModal();
  };

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Show every parkrun venue on a map"
        className="inline-flex align-[-0.15em] ml-1.5 transition-opacity hover:opacity-60"
        style={{ color: ORANGE }}
      >
        <MapTrifold size={16} weight="bold" />
      </button>

      <dialog
        ref={dialogRef}
        aria-label="Parkrun venues map"
        // A click on the backdrop lands on the dialog itself, not its contents
        onClick={(e) => e.target === e.currentTarget && dialogRef.current?.close()}
        className="m-auto w-[min(92vw,760px)] p-0 backdrop:bg-black/50"
        style={{ background: "#f5f5f0", color: "#111" }}
      >
        <div className="flex items-center justify-between gap-4 px-4 pt-4 md:px-6">
          <div className="flex gap-1">
            {views.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setViewId(v.id);
                  setActive(null);
                }}
                aria-pressed={v.id === current.id}
                className="px-3 py-1.5 text-xs uppercase tracking-[0.15em] transition-colors"
                style={
                  v.id === current.id
                    ? { background: "#111", color: "#fff" }
                    : { color: "rgba(0,0,0,0.5)" }
                }
              >
                {v.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Close map"
            className="flex h-9 w-9 items-center justify-center transition-opacity hover:opacity-60"
          >
            <X size={18} weight="bold" />
          </button>
        </div>

        <svg
          viewBox={`0 0 ${current.width} ${current.height}`}
          className="block w-full h-auto mt-3"
          role="img"
          aria-label={`${current.venues.length} parkrun venues`}
          onClick={() => setActive(null)}
        >
          {/* Sea a shade darker than the page, so the coast reads at a glance */}
          <rect width={current.width} height={current.height} fill="#e6e3da" />
          <path d={current.land} fill="#fff" stroke="rgba(0,0,0,0.12)" strokeWidth={1} />
          {ordered.map((v) => {
            const on = v.name === active;
            return (
              <g
                key={v.name}
                role="button"
                tabIndex={0}
                aria-label={`${v.name}, ${v.count} parkrun${v.count === 1 ? "" : "s"}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setActive(on ? null : v.name);
                }}
                onMouseEnter={() => setActive(v.name)}
                onFocus={() => setActive(v.name)}
                onKeyDown={(e) => e.key === "Enter" && setActive(on ? null : v.name)}
                className="cursor-pointer outline-none"
              >
                {/* A bigger, invisible target, for fingers */}
                <circle cx={v.x} cy={v.y} r={Math.max(14, radius(v.count))} fill="transparent" />
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={radius(v.count)}
                  fill={v.count === home ? ORANGE : "#111"}
                  fillOpacity={on ? 1 : 0.8}
                  stroke={on ? ORANGE : "#fff"}
                  strokeWidth={on ? 3 : 1.5}
                />
              </g>
            );
          })}
          {selected && (
            // Drawn last so it sits over every dot; flips left near the right edge
            <text
              x={selected.x + (selected.x > current.width - 200 ? -1 : 1) * (radius(selected.count) + 6)}
              y={selected.y + 5}
              textAnchor={selected.x > current.width - 200 ? "end" : "start"}
              fontSize={15}
              fontWeight={500}
              fill="#111"
              stroke="#fff"
              strokeWidth={4}
              paintOrder="stroke"
              pointerEvents="none"
            >
              {selected.name}
            </text>
          )}
        </svg>

        <p
          className="px-4 pb-4 pt-3 text-sm md:px-6 tabular-nums"
          aria-live="polite"
          style={{ color: selected ? "#111" : "rgba(0,0,0,0.45)" }}
        >
          {selected
            ? `${selected.name} · ${selected.count} parkrun${selected.count === 1 ? "" : "s"}`
            : `${current.venues.length} venues. Tap or hover a dot for its name; bigger dots, more visits.`}
        </p>
      </dialog>
    </>
  );
}
