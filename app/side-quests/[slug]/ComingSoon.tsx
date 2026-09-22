"use client";

import { useEffect } from "react";
import Link from "next/link";

const WORDS = ["Coming soon", "In the works", "Watch this space", "Under construction", "Nearly there"];

/**
 * Placeholder for a side quest that hasn't been written up yet. Built on the
 * 404 page's layout — big type, a marquee band, one line and one button — but
 * on the side quest's own colour, with its emoji where the googly eyes go.
 */
export default function ComingSoon({
  title,
  emoji,
  ground,
}: {
  title: string;
  emoji: string;
  ground: string;
}) {
  // Paint the document too, so overscroll shows the quest's colour rather
  // than white. See body:has([data-full-bleed]) in globals.css.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--page-ground", ground);
    return () => {
      root.style.removeProperty("--page-ground");
    };
  }, [ground]);

  return (
    // pb-24 is the floating nav's clearance, which data-full-bleed moves in
    // here from the body; dvh holds the bottom edge when a phone's URL bar
    // collapses.
    <main
      data-full-bleed
      className="w-full min-h-dvh pt-16 pb-24 flex flex-col items-center justify-center gap-10 overflow-hidden text-[#111]"
      style={{ backgroundColor: ground }}
    >
      <span className="coming-soon-emoji text-[7rem] leading-none" aria-hidden="true">
        {emoji}
      </span>

      <h1 className="font-display text-h1 leading-none px-6 text-center">{title}</h1>

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
        This side quest is still being written up. Check back soon.
      </p>

      <Link
        href="/work?tab=side-quests"
        className="font-display px-7 py-3.5 text-white transition-opacity hover:opacity-80"
        style={{ backgroundColor: "#111", borderRadius: 8, fontSize: "0.8125rem", letterSpacing: "0.06em", textTransform: "uppercase" }}
      >
        Back to side quests
      </Link>
    </main>
  );
}
