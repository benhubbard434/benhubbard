"use client";

import { useEffect, useRef, useState } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
/** Time each letter shows for as a letter cycles, like a board's flap rate. */
const FLAP_MS = 40;

/**
 * A heading whose letters each run through the alphabet when hovered, like a
 * split-flap board, starting from the next letter and landing back on their
 * own. The flap itself is .letter-flap in globals.css; under reduced motion
 * the letters stay put.
 */
export default function FlapTitle({ text, className }: { text: string; className?: string }) {
  return (
    <h1 className={className}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {text.split(" ").map((word, w) => (
          // Words stay whole so the title only wraps between them.
          <span key={w} className="whitespace-nowrap">
            {w > 0 && " "}
            {word.split("").map((letter, i) => (
              <FlapLetter key={i} letter={letter.toUpperCase()} />
            ))}
          </span>
        ))}
      </span>
    </h1>
  );
}

function FlapLetter({ letter }: { letter: string }) {
  const [shown, setShown] = useState(letter);
  // Counts flaps, so each one restarts the flap animation.
  const [flaps, setFlaps] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => {
    if (timer.current) clearInterval(timer.current);
  }, []);

  const cycle = () => {
    const start = ALPHABET.indexOf(letter);
    if (timer.current || start < 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let step = 0;
    timer.current = setInterval(() => {
      step += 1;
      setShown(ALPHABET[(start + step) % ALPHABET.length]);
      setFlaps((n) => n + 1);
      // A full lap ends back on the letter it started from.
      if (step === ALPHABET.length) {
        clearInterval(timer.current!);
        timer.current = null;
      }
    }, FLAP_MS);
  };

  return (
    <span className="letter-flap-cell" onMouseEnter={cycle}>
      {/* Holds the cell at the letter's own width while others pass through */}
      <span className="invisible">{letter}</span>
      <span key={flaps} className={flaps ? "letter-flap letter-flap-moving" : "letter-flap"}>
        {shown}
      </span>
    </span>
  );
}
