"use client";

import { usePathname } from "next/navigation";
import TabRail from "./TabRail";
import { aiRailItem } from "./AiTab";
import { provenanceFor } from "@/lib/ai-provenance";

/** The home page carries no AI tab at all. */
const NO_RAIL = "/";

/**
 * The AI tab everywhere except the home page, and except the blog, which
 * builds its own rails: the index so the tab can sit beside Categories, and
 * each post so it can read the claims off its own row.
 */
export default function GlobalTabRail() {
  const pathname = usePathname();
  if (pathname === NO_RAIL) return null;
  if (pathname === "/blog" || pathname.startsWith("/blog/")) return null;
  return <TabRail items={[aiRailItem(provenanceFor(pathname))]} />;
}
