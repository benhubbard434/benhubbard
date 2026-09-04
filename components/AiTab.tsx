"use client";

import { Sparkle } from "@phosphor-icons/react";
import { TAB_BASE, TAB_SHAPE, type RailItem } from "./TabRail";
import {
  AI_CATEGORIES,
  AI_LEVEL_LABEL,
  type AiProvenance,
} from "@/lib/ai-provenance";

const BRAND = "#470FF4";

export const AI_PANEL_ID = "site-ai";

/** Caps treatment shared with the rail's tabs, a size down. */
const LABEL_TYPE = {
  fontSize: "0.625rem",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
};

/**
 * The tab is identical everywhere; the sheet behind it changes with the page,
 * so the item is built per page rather than shared as a constant.
 */
export function aiRailItem(provenance: AiProvenance): RailItem {
  return {
    id: AI_PANEL_ID,
    // Rides up over the sheet's bottom edge by its own border width, so the
    // two read as one white shape joined at the seam.
    seam: 2,
    renderPanel: () => (
      <div
        className="bg-white px-6 pt-6 pb-7"
        style={{ borderBottom: `2px solid ${BRAND}` }}
      >
        <p className="font-display mb-5 text-gray-400" style={LABEL_TYPE}>
          What AI did on this page
        </p>

        <ul className="grid gap-5">
          {AI_CATEGORIES.map(({ key, label }) => {
            const { level, note } = provenance[key];
            // Categories AI stayed out of recede, so the eye lands on the
            // ones it actually touched.
            const used = level !== "none";
            return (
              <li
                key={key}
                className="pt-2.5"
                style={{ borderTop: `2px solid ${used ? BRAND : "#e5e7eb"}` }}
              >
                <p
                  className="font-display mb-1.5"
                  style={{ ...LABEL_TYPE, color: used ? BRAND : "#9ca3af" }}
                >
                  {label}
                </p>
                <p
                  className={`text-sm font-medium mb-1 ${
                    used ? "text-black" : "text-gray-400"
                  }`}
                >
                  {AI_LEVEL_LABEL[level]}
                </p>
                <p className="text-xs leading-relaxed text-gray-500">{note}</p>
              </li>
            );
          })}
        </ul>
      </div>
    ),
    renderTab: ({ open, toggle }) => (
      <button
        onClick={toggle}
        aria-expanded={open}
        aria-controls={AI_PANEL_ID}
        aria-label="What AI did on this page"
        className={`${TAB_BASE} bg-white`}
        style={{
          ...TAB_SHAPE,
          border: `2px solid ${BRAND}`,
          // The tab hangs off the top of the screen; an edge drawn up there
          // reads as a stray line rather than part of the shape.
          borderTop: "none",
        }}
      >
        <Sparkle size={12} weight="fill" color={BRAND} />
      </button>
    ),
  };
}
