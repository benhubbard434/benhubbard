"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

/**
 * A side-quest card. On hover the card fills with its own solid colour, and a
 * white bubble grows under the cursor, follows it, then pops into smaller
 * bubbles that drift upwards. After a break of a few seconds another starts
 * growing. The motion is in globals.css; this only tracks the cursor and runs
 * the grow → pop cycle.
 *
 * Mouse only: on touch a tap navigates straight away, so there is nothing to
 * hover. Keyboard focus and reduced motion get the colour without bubbles.
 */

/** Random break between a pop and the next bubble starting to grow. */
const REST_MIN_MS = 3000;
const REST_MAX_MS = 7000;
/** Longest a burst can run (duration + delay), after which it is removed. */
const BURST_MS = 2400;

type Point = { x: number; y: number };

type Particle = {
  /** Where it leaves the bubble's skin, relative to the pop. */
  sx: number;
  sy: number;
  /** Where the initial burst throws it. */
  bx: number;
  by: number;
  /** Where it has drifted up to by the time it fades. */
  ex: number;
  ey: number;
  size: number;
  dur: number;
  delay: number;
};

type Burst = Point & { id: number; particles: Particle[] };

/** Bubble radius at full size; matches .quest-grow in globals.css. */
const RADIUS = 28;

function makeParticles(): Particle[] {
  const count = 9;
  return Array.from({ length: count }, (_, i) => {
    // Spread evenly around the bubble, nudged so no two pops look the same.
    const angle = (i / count) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    const throwBy = 14 + Math.random() * 12;
    return {
      sx: cos * RADIUS * 0.8,
      sy: sin * RADIUS * 0.8,
      bx: cos * (RADIUS + throwBy),
      by: sin * (RADIUS + throwBy),
      // Whatever direction the burst threw it, it ends up rising.
      ex: cos * (RADIUS + throwBy) + (Math.random() - 0.5) * 16,
      ey: -(45 + Math.random() * 45),
      size: 4 + Math.random() * 7,
      dur: 1500 + Math.random() * 600,
      delay: Math.random() * 150,
    };
  });
}

export default function QuestCard({
  href,
  ground,
  ink,
  children,
}: {
  href: string;
  /** Solid fill on hover and focus. */
  ground: string;
  /** Type colour while filled. */
  ink: string;
  children: React.ReactNode;
}) {
  const [bubble, setBubble] = useState<(Point & { key: number }) | null>(null);
  const [bursts, setBursts] = useState<Burst[]>([]);

  const cardRef = useRef<HTMLAnchorElement>(null);
  const bubbleRef = useRef<HTMLSpanElement>(null);
  const pos = useRef<Point>({ x: 0, y: 0 });
  const hovering = useRef(false);
  const nextId = useRef(0);
  const timers = useRef(new Set<ReturnType<typeof setTimeout>>());
  /** The break before the next bubble; cancelled on leave, so re-entering
      during it cannot restart a freshly grown bubble halfway through. */
  const restTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const pending = timers.current;
    const rest = restTimer;
    return () => {
      pending.forEach(clearTimeout);
      if (rest.current) clearTimeout(rest.current);
    };
  }, []);

  const cancelRest = () => {
    if (restTimer.current) clearTimeout(restTimer.current);
    restTimer.current = null;
  };

  const later = (fn: () => void, ms: number) => {
    const t = setTimeout(() => {
      timers.current.delete(t);
      fn();
    }, ms);
    timers.current.add(t);
  };

  const toLocal = (e: React.PointerEvent): Point => {
    const rect = cardRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const grow = () => {
    if (!hovering.current) return;
    setBubble({ ...pos.current, key: nextId.current++ });
  };

  const onPointerEnter = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    hovering.current = true;
    pos.current = toLocal(e);
    // The first bubble starts straight away; only the ones after a pop wait.
    cancelRest();
    grow();
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!hovering.current) return;
    const p = toLocal(e);
    pos.current = p;
    // Straight to the DOM: a re-render on every mousemove is wasted work.
    if (bubbleRef.current) bubbleRef.current.style.translate = `${p.x}px ${p.y}px`;
  };

  const onPointerLeave = () => {
    hovering.current = false;
    cancelRest();
    // The growing bubble goes; any burst already in the air finishes.
    setBubble(null);
  };

  const pop = () => {
    const id = nextId.current++;
    const { x, y } = pos.current;
    setBubble(null);
    setBursts((b) => [...b, { id, x, y, particles: makeParticles() }]);
    later(() => setBursts((b) => b.filter((burst) => burst.id !== id)), BURST_MS);
    cancelRest();
    restTimer.current = setTimeout(() => {
      restTimer.current = null;
      grow();
    }, REST_MIN_MS + Math.random() * (REST_MAX_MS - REST_MIN_MS));
  };

  return (
    <Link
      ref={cardRef}
      href={href}
      onPointerEnter={onPointerEnter}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="quest-card relative block overflow-hidden rounded-lg border border-gray-200 bg-white p-5 text-gray-900"
      style={{ "--quest-ground": ground, "--quest-ink": ink } as React.CSSProperties}
    >
      <span className="quest-pops" aria-hidden="true">
        {bubble && (
          <span
            key={bubble.key}
            ref={bubbleRef}
            className="quest-grow"
            style={{ translate: `${bubble.x}px ${bubble.y}px` }}
            onAnimationEnd={pop}
          />
        )}
        {bursts.map((burst) => (
          <span
            key={burst.id}
            className="quest-burst"
            style={{ translate: `${burst.x}px ${burst.y}px` }}
          >
            <span className="quest-ring" />
            {burst.particles.map((p, i) => (
              <span
                key={i}
                className="quest-particle"
                style={
                  {
                    "--sx": `${p.sx}px`,
                    "--sy": `${p.sy}px`,
                    "--bx": `${p.bx}px`,
                    "--by": `${p.by}px`,
                    "--ex": `${p.ex}px`,
                    "--ey": `${p.ey}px`,
                    "--size": `${p.size}px`,
                    animationDuration: `${p.dur}ms`,
                    animationDelay: `${p.delay}ms`,
                  } as React.CSSProperties
                }
              />
            ))}
          </span>
        ))}
      </span>

      {/* relative, so the title paints above the bubbles */}
      <div className="relative">{children}</div>
    </Link>
  );
}
