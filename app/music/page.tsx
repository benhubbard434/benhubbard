import type { Metadata } from "next";
import { getPlaylist } from "@/lib/spotify";
import MusicClient from "./MusicClient";

/**
 * The playlist changes about once a month, so the page is prerendered and
 * regenerated every six hours.
 *
 * `force-static` is doing real work here. Getting a Spotify token means a POST,
 * which Next never caches, and a single uncached fetch is enough to flip the
 * whole route to dynamic rendering — which would quietly cancel `revalidate`
 * and hit the API on every visit. Forcing the static render pins it.
 *
 * This project has not enabled `cacheComponents`, so `revalidate` is the right
 * knob rather than `use cache` / `cacheLife`.
 */
export const dynamic = "force-static";
export const revalidate = 21600;

export const metadata: Metadata = {
  title: "Ten of the Month — Ben Hubbard",
  description:
    "Every month(ish), I curate my ten favourite tracks on repeat. Listen here.",
};

export default async function MusicPage() {
  const playlist = await getPlaylist();
  return <MusicClient playlist={playlist} />;
}
