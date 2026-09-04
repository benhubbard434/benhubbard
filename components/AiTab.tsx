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
  // Rides up over the sheet's bottom edge by its own border width, so the two
  // read as one white shape joined at the seam rather than as separate pieces.
  seam: 2,
  renderPanel: () => (
    <div className="bg-white px-6 py-8" style={{ borderBottom: `2px solid ${BRAND}` }}>
      <p className="text-sm text-gray-600">Nothing wired up in here yet.</p>
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
