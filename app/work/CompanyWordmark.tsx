"use client";

import { useState, type CSSProperties } from "react";

/**
 * A company heading that turns into the company's logo on hover, like a
 * split-flap departures board. The name is cut into vertical strips, each
 * a flap with the name on the front and its slice of the logo on the back.
 * They flip one after another, rippling out from wherever the cursor came
 * in, and ripple back the same way when it leaves.
 *
 * The flip is driven from .company-flip in globals.css, which also swaps
 * it for a plain crossfade under reduced motion.
 */

export type CompanyLogo = {
  /** Single-colour artwork, used as a mask so it takes the section's text colour. */
  src: string;
  /** Logo height, relative to the heading's font size. */
  height: string;
};

const STRIPS = 14;
/** Delay between neighbouring strips as the ripple spreads. */
const STAGGER_MS = 28;

export default function CompanyWordmark({
  name,
  logo,
  children,
}: {
  name: string;
  logo: CompanyLogo;
  /** Anything to sit alongside the name that should also trigger the flip. */
  children?: React.ReactNode;
}) {
  // The strip the cursor entered over; the ripple spreads out from here.
  const [origin, setOrigin] = useState(0);

  const onEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const box = e.currentTarget.querySelector(".company-flip-box");
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const t = (e.clientX - rect.left) / rect.width;
    setOrigin(Math.min(STRIPS - 1, Math.max(0, Math.floor(t * STRIPS))));
  };

  const face = (content: React.ReactNode, i: number) => (
    <span
      className="company-flip-slice"
      style={{ width: `${STRIPS * 100}%`, left: `${-i * 100}%` }}
    >
      {content}
    </span>
  );

  const nameFace = <span className="whitespace-nowrap">{name}</span>;
  const logoFace = (
    <span
      className="company-flip-logo"
      style={{ "--logo": `url(${logo.src})`, height: logo.height } as CSSProperties}
    />
  );

  return (
    <div className="company-flip mb-8 flex w-fit items-center gap-3" onMouseEnter={onEnter}>
      <h2 className="font-display text-h2">
        <span className="sr-only">{name}</span>
        <span className="company-flip-box" aria-hidden="true">
          {/* Sizes the box to the name; the strips sit over it */}
          <span className="invisible whitespace-nowrap">{name}</span>
          {Array.from({ length: STRIPS }, (_, i) => (
            <span
              key={i}
              className="company-flip-strip"
              style={{
                left: `${(i * 100) / STRIPS}%`,
                width: `${100 / STRIPS}%`,
                transitionDelay: `${Math.abs(i - origin) * STAGGER_MS}ms`,
              }}
            >
              <span className="company-flip-front">{face(nameFace, i)}</span>
              <span className="company-flip-back">{face(logoFace, i)}</span>
            </span>
          ))}
        </span>
      </h2>
      {children}
    </div>
  );
}
