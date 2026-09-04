"use client";

import { usePathname } from "next/navigation";
import TabRail from "./TabRail";
import { aiRailItem } from "./AiTab";

/**
 * The AI tab everywhere except the blog index, which builds its own rail so
 * the tab can sit beside Categories and the two descend together.
 */
export default function GlobalTabRail() {
  const pathname = usePathname();
  if (pathname === "/blog") return null;
  return <TabRail items={[aiRailItem]} />;
}
