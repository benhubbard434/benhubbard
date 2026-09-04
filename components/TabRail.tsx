"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export const TAB_BASE =
  "font-display pointer-events-auto px-3 py-1.5 shadow-lg flex items-center";

/** Tab labels sit a step below the sheet's own type, so the rail stays quiet. */
export const TAB_TYPE: CSSProperties = {
  fontSize: "clamp(0.625rem, 0.575rem + 0.2vw, 0.6875rem)",
  textTransform: "uppercase",
  // Small caps need the display face's -0.06em opened back up further than
  // the larger type does.
  letterSpacing: "0.06em",
};

/** Tabs hang off the top edge, so only the bottom corners are rounded. */
export const TAB_SHAPE: CSSProperties = {
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

export type RailItem = {
  id: string;
  /**
   * Pixels the tab rides up into its own sheet, so a sheet with a drawn edge
   * can have that edge broken where the tab joins it.
   */
  seam?: number;
  renderPanel: (state: { close: () => void }) => ReactNode;
  renderTab: (state: { open: boolean; toggle: () => void }) => ReactNode;
};

/**
 * The rail of tabs pinned to the top of the screen, each with a sheet that
 * unrolls beneath it and carries the tabs down as it goes.
 *
 * Every tab on a page shares one rail so they descend together and only one
 * sheet is ever down — opening any tab closes whichever was open.
 */
export default function TabRail({ items }: { items: RailItem[] }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const contentRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    if (!openId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpenId(null); };
    // Dismiss on any press outside the rail, without swallowing that press.
    const onDown = (e: PointerEvent) => {
      if (!railRef.current?.contains(e.target as Node)) setOpenId(null);
    };
    window.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [openId]);

  // Each tab rides its own sheet down and ignores the others. The sheets are
  // out of flow, so nothing is pushed by default; instead a tab offsets itself
  // by the height of its own sheet. Measuring the content, whose height only
  // changes on resize, means the tab can run the same transition as the sheet
  // and stay in lockstep with it rather than chasing it a frame behind.
  useEffect(() => {
    const observers: ResizeObserver[] = [];
    for (const [id, content] of contentRefs.current) {
      const measure = new ResizeObserver(() => {
        setHeights((current) =>
          current[id] === content.offsetHeight
            ? current
            : { ...current, [id]: content.offsetHeight }
        );
      });
      measure.observe(content);
      observers.push(measure);
    }
    return () => observers.forEach((o) => o.disconnect());
  }, [items]);

  const close = () => setOpenId(null);

  return (
    <div
      ref={railRef}
      data-tab-rail
      className="fixed top-0 left-0 right-0 z-[60] pointer-events-none"
    >
      {/* Out of flow, so a sheet moves only the tab that opened it, and above
          the tabs so a closed one is covered by the sheet rather than
          floating over it. The open tab clears the sheet's bottom edge, so it
          stays visible either way. Sheets overlay rather than stack, since
          only one is ever down. */}
      <div className="absolute top-0 left-0 right-0 z-10">
        {items.map((item) => {
          const open = openId === item.id;
          const height = heights[item.id] ?? 0;
          return (
            <div
              key={item.id}
              id={item.id}
              inert={!open}
              className="absolute top-0 left-0 right-0 overflow-hidden"
              style={{ height, pointerEvents: open ? "auto" : "none" }}
            >
              {/* The sheet slides out from behind the top edge rather than
                  being uncovered by a growing box. Transitioning a box's size
                  in fr units moves the clip that hides the sheet out of step
                  with the height the tab is following, which left the sheet's
                  painted edge trailing the tab by ~20px mid-unroll. Two
                  transforms on one timing cannot drift like that. */}
              <div
                ref={(el) => {
                  if (el) contentRefs.current.set(item.id, el);
                  else contentRefs.current.delete(item.id);
                }}
                className="disclosure-motion"
                style={{
                  transform: open ? "translateY(0)" : "translateY(-100%)",
                  transitionDuration: open ? "420ms" : "315ms",
                }}
              >
                {item.renderPanel({ close })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Stretched so tabs of differing content stay the same height */}
      <div className="relative flex items-stretch justify-end gap-2 mr-6">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              className="disclosure-motion relative flex"
              style={{
                transform: `translateY(${
                  open ? (heights[item.id] ?? 0) - (item.seam ?? 0) : 0
                }px)`,
                transitionDuration: open ? "420ms" : "315ms",
                // Above its own sheet once open, so it can cover the seam;
                // behind it when closed, so the sheet hides it.
                zIndex: open ? 20 : 0,
              }}
            >
              {item.renderTab({
                open,
                toggle: () => setOpenId((current) => (current === item.id ? null : item.id)),
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}
