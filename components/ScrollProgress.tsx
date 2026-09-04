"use client";

import { useEffect, useRef } from "react";

/**
 * Reading progress for the page, pinned across the top. The fill is anchored
 * to the right edge and grows leftward, so it closes in on the left as you
 * reach the end.
 *
 * Written straight to the node's transform rather than through state: this
 * runs on every scroll frame, and re-rendering the tree that often to move one
 * bar would be wasteful.
 */
export default function ScrollProgress() {
  const fillRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const fill = fillRef.current;
      if (!fill) return;

      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      // A page too short to scroll has no progress to report.
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;

      fill.style.transform = `scaleX(${Math.min(1, Math.max(0, progress))})`;
    };

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    // Hero images and webfonts settle after mount and change the scroll
    // height under us, which would otherwise leave the bar mis-scaled.
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      observer.disconnect();
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-50 pointer-events-none"
      style={{ height: 5 }}
    >
      <div
        ref={fillRef}
        className="h-full w-full origin-right"
        style={{
          backgroundColor: "var(--color-spring-green)",
          transform: "scaleX(0)",
        }}
      />
    </div>
  );
}
