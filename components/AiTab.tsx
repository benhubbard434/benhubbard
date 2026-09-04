"use client";

import { Sparkle } from "@phosphor-icons/react";
import { TAB_BASE, TAB_SHAPE, type RailItem } from "./TabRail";

const BRAND = "#470FF4";

// A tint of the brand blue rather than a new hue, so the mark reads as light
// without stepping outside the palette.
const LIGHT_BLUE = "#AC93FA";

export const AI_PANEL_ID = "site-ai";

/** Defined once and shared, so the tab is identical on every page. */
export const aiRailItem: RailItem = {
  id: AI_PANEL_ID,
  renderPanel: () => (
    <div style={{ backgroundColor: BRAND }} className="px-6 py-8">
      <p className="text-sm text-white/70">Nothing wired up in here yet.</p>
    </div>
  ),
  renderTab: ({ open, toggle }) => (
    <button
      onClick={toggle}
      aria-expanded={open}
      aria-controls={AI_PANEL_ID}
      aria-label="AI"
      className={`${TAB_BASE} bg-white`}
      style={{
        ...TAB_SHAPE,
        border: `2px solid ${BRAND}`,
        // The tab hangs off the top of the screen; an edge drawn up there
        // reads as a stray line rather than part of the shape.
        borderTop: "none",
      }}
    >
      <Sparkle size={18} weight="fill" color={LIGHT_BLUE} />
    </button>
  ),
};
