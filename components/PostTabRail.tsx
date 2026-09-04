"use client";

import TabRail from "./TabRail";
import { aiRailItem } from "./AiTab";
import type { AiProvenance } from "@/lib/ai-provenance";

/**
 * A post's own rail. The rail items carry render functions, which cannot
 * cross the server boundary, so the post page hands over plain provenance
 * and the item is built here.
 */
export default function PostTabRail({ provenance }: { provenance: AiProvenance }) {
  return <TabRail items={[aiRailItem(provenance)]} />;
}
