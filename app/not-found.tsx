"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const GREEN = "#04f06a";
const EYE = 148;
const PUPIL = 62;
// How far a pupil can travel from centre before it hits the white.
const TRAVEL = (EYE - PUPIL) / 2 - 10;

/**
 * One oversized googly eye. It follows the cursor, and when nothing has moved
 * for a moment it starts casting about on its own — the pair are meant to
 * read as looking for the page rather than at you.
 */
function Eye({ target, delay }: { target: { x: number; y: number }; delay: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = target.x - (rect.left + rect.width / 2);
    const dy = target.y - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist < 1) return;
    const t = Math.min(dist, TRAVEL) / dist;
    setPupil({ x: dx * t, y: dy * t });
  }, [target]);

  return (
    <div
      ref={ref}
      className="relative rounded-full bg-white"
      style={{ width: EYE, height: EYE, border: "6px solid #111" }}
    >
      <div
        className="absolute rounded-full bg-black"
        style={{
          width: PUPIL,
          height: PUPIL,
          top: "50%",
          left: "50%",
          transform: `translate(calc(-50% + ${pupil.x}px), calc(-50% + ${pupil.y}px))`,
          // Staggered so the two never move as one, which reads mechanical.
          transition: `transform 420ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms`,
        }}
      />
    </div>
  );
}

const WORDS = ["Lost", "Missing", "Nowhere", "Long gone", "Not here"];

export default function NotFound() {
  const [target, setTarget] = useState({ x: -9999, y: -9999 });

  useEffect(() => {
    let idle: ReturnType<typeof setTimeout>;
    let searching: ReturnType<typeof setInterval> | null = null;
    const stillness = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const wander = () => {
      if (stillness) return;
      searching = setInterval(() => {
        setTarget({
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
        });
      }, 900);
    };

    const onMove = (e: MouseEvent) => {
      if (searching) {
        clearInterval(searching);
        searching = null;
      }
      setTarget({ x: e.clientX, y: e.clientY });
      clearTimeout(idle);
      // Give up on the visitor after a beat and go back to searching.
      idle = setTimeout(wander, 2000);
    };

    idle = setTimeout(wander, 700);
    window.addEventListener("mousemove", onMove);
    return () => {
      clearTimeout(idle);
      if (searching) clearInterval(searching);
      window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return (
    // -mb-24 cancels the body padding that reserves room for the floating
    // nav, which this page does without, and dvh holds the bottom edge when a
    // phone's URL bar collapses.
    <main
      data-no-chrome
      className="w-full min-h-dvh -mb-24 flex flex-col items-center justify-center gap-10 overflow-hidden"
      style={{ backgroundColor: GREEN }}
    >
      <div className="flex gap-8">
        <Eye target={target} delay={0} />
        <Eye target={target} delay={70} />
      </div>

      <h1 className="font-display text-display leading-none">404</h1>

      {/* Full-bleed, so the type runs off both edges of the screen */}
      <div
        className="w-screen overflow-hidden py-3"
        style={{ borderBlock: "3px solid #111" }}
      >
        <div className="flex w-max animate-marquee">
          {/* Twice over: the keyframe travels -50%, so the second copy is
              already in place when the first runs out. */}
          {[0, 1].map((copy) => (
            <div key={copy} className="flex shrink-0" aria-hidden={copy === 1}>
              {WORDS.map((word) => (
                <span key={word} className="font-display text-h3 px-6 whitespace-nowrap">
                  {word}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      <p className="font-subhead text-h3 px-6 text-center">
        Whatever you were after, it isn&apos;t here.
      </p>

      <Link
        href="/"
        className="font-display px-7 py-3.5 text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: "#111", borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
      >
        Take me home
      </Link>
    </main>
  );
}
