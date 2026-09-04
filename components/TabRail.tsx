"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";

export const TAB_BASE =
  "font-display pointer-events-auto px-5 py-2.5 shadow-lg flex items-center";

/** Tabs hang off the top edge, so only the bottom corners are rounded. */
export const TAB_SHAPE: CSSProperties = {
  borderBottomLeftRadius: 8,
  borderBottomRightRadius: 8,
};

export type RailItem = {
  id: string;
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
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
    >
      {/* Out of flow, so a sheet moves only the tab that opened it, and above
          the tabs so a closed one is covered by the sheet rather than
          floating over it. The open tab clears the sheet's bottom edge, so it
          stays visible either way. */}
      <div className="absolute top-0 left-0 right-0 z-10">
        {items.map((item) => {
          const open = openId === item.id;
          return (
            <div
              key={item.id}
              id={item.id}
              inert={!open}
              className="disclosure-motion grid w-full pointer-events-auto"
              style={{
                gridTemplateRows: open ? "1fr" : "0fr",
                transitionDuration: open ? "420ms" : "315ms",
              }}
            >
              <div className="overflow-hidden">
                <div
                  ref={(el) => {
                    if (el) contentRefs.current.set(item.id, el);
                    else contentRefs.current.delete(item.id);
                  }}
                >
                  {item.renderPanel({ close })}
                </div>
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
              className="disclosure-motion flex"
              style={{
                transform: `translateY(${open ? heights[item.id] ?? 0 : 0}px)`,
                transitionDuration: open ? "420ms" : "315ms",
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
