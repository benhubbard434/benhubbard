/**
 * What AI contributed to a given page, surfaced in the AI tray.
 *
 * Static pages are recorded here, beside the code they describe. Blog posts
 * carry their own values on the row instead, since the content categories are
 * the ones that genuinely vary post to post.
 */

export type AiLevel = "none" | "some" | "mostly" | "all";

export type AiCategory = {
  level: AiLevel;
  /** One line of specifics. A level on its own says too little to be honest. */
  note: string;
};

export type AiProvenance = {
  code: AiCategory;
  words: AiCategory;
  media: AiCategory;
  other: AiCategory;
};

/** Rendered in this order, four across. */
export const AI_CATEGORIES: { key: keyof AiProvenance; label: string }[] = [
  { key: "code", label: "Code" },
  { key: "words", label: "Words" },
  { key: "media", label: "Images & video" },
  { key: "other", label: "Other" },
];

export const AI_LEVEL_LABEL: Record<AiLevel, string> = {
  none: "None",
  some: "Some",
  mostly: "Mostly",
  all: "All",
};

/**
 * Everything the site shares. Pages below override only what differs, so a
 * claim that holds everywhere is stated once.
 */
const SITEWIDE: AiProvenance = {
  code: { level: "mostly", note: "Built by pairing with Claude Code." },
  words: { level: "none", note: "Written start to finish by me." },
  media: { level: "none", note: "My own photography, or credited stock." },
  other: { level: "some", note: "Alt text and page metadata." },
};

/** Only pages that differ from the sitewide claims above. */
const PAGES: Record<string, Partial<AiProvenance>> = {
  "/blog/an-ode-to-yorkshire-pudding": {
    media: {
      level: "all",
      note: "Header image made with DALL·E. The prompt is in the credit below the post.",
    },
  },
};

/**
 * A page's provenance, falling back to the sitewide claims. Posts pass their
 * own values through `overrides` rather than being listed above.
 */
export function provenanceFor(
  pathname: string,
  overrides?: Partial<AiProvenance> | null
): AiProvenance {
  const page = PAGES[pathname] ?? {};
  return { ...SITEWIDE, ...page, ...(overrides ?? {}) };
}
