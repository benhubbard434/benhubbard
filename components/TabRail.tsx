"use client";

import {
  Fragment,
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

  const close = () => setOpenId(null);

  return (
    <div
      ref={railRef}
      className="fixed top-0 left-0 right-0 z-40 flex flex-col items-end pointer-events-none"
    >
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
            <div className="overflow-hidden">{item.renderPanel({ close })}</div>
          </div>
        );
      })}

      {/* Stretched so tabs of differing content stay the same height */}
      <div className="flex items-stretch gap-2 mr-6">
        {items.map((item) => (
          <Fragment key={item.id}>
            {item.renderTab({
              open: openId === item.id,
              toggle: () => setOpenId((current) => (current === item.id ? null : item.id)),
            })}
          </Fragment>
        ))}
      </div>
    </div>
  );
}
