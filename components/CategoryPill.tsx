import Link from "next/link";
import type { CSSProperties } from "react";

const BRAND = "#470FF4";

// Matches the categories drawer's caps treatment, a step smaller: the display
// face is tracked to -0.06em, which caps need opened back up.
const PILL_TYPE: CSSProperties = {
  fontSize: "0.6875rem",
  lineHeight: 1,
  textTransform: "uppercase",
  letterSpacing: "0.04em",
  color: BRAND,
  backgroundColor: "rgba(71, 15, 244, 0.08)",
};

const CLASSES = "font-display inline-block rounded-full px-2.5 py-1.5 align-middle";

/**
 * A post's category. Given an `href` it renders as a link; inside a row that is
 * already wrapped in one (the blog list) it renders as plain text instead,
 * since nested anchors are invalid.
 */
export default function CategoryPill({
  category,
  href,
}: {
  category: string;
  href?: string;
}) {
  if (!href) {
    return (
      <span className={CLASSES} style={PILL_TYPE}>
        {category}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={`${CLASSES} transition-opacity hover:opacity-70`}
      style={PILL_TYPE}
    >
      {category}
    </Link>
  );
}

/** Where a pill points: the blog list, pre-filtered to that category. */
export function categoryHref(category: string) {
  return `/blog?category=${encodeURIComponent(category)}`;
}
