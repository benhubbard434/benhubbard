"use client";

import { usePathname } from "next/navigation";
import TabRail from "./TabRail";
import { aiRailItem } from "./AiTab";
import { provenanceFor } from "@/lib/ai-provenance";

/**
 * The AI tab everywhere except the blog index, which builds its own rail so
 * the tab can sit beside Categories and the two descend together.
 *
 * Posts still come through here for now, on the sitewide claims. Once posts
 * carry their own provenance they will render their own rail too, and this
 * will need to stand aside for them the way it does for the index.
 */
export default function GlobalTabRail() {
  const pathname = usePathname();
  if (pathname === "/blog") return null;
  return <TabRail items={[aiRailItem(provenanceFor(pathname))]} />;
}
