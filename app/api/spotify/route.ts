import { NextResponse } from "next/server";

// Cache the route response for 6 hours — playlist updates are infrequent
export const revalidate = 21600;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const SPOTIFY_REFRESH_TOKEN = process.env.SPOTIFY_REFRESH_TOKEN!;
const PLAYLIST_ID = "1V4K1ZZ4SKAJdLvrh7O7lS";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: SPOTIFY_REFRESH_TOKEN,
    }),
    cache: "no-store",
  });
  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    // Spotify restricted the /tracks sub-endpoint for apps without Extended Quota Mode.
    // We fetch only playlist metadata here; tracks are displayed via the embed widget.
    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}?fields=name,description,images,external_urls`,
      {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }
    );

    const playlist = await playlistRes.json();

    return NextResponse.json(
      {
        name: playlist.name ?? null,
        description: playlist.description ?? null,
        url: playlist.external_urls?.spotify ?? `https://open.spotify.com/playlist/${PLAYLIST_ID}`,
        image: playlist.images?.[0]?.url ?? null,
        embedUrl: `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`,
      },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=43200" } }
    );
  } catch (err) {
    console.error("Spotify API error:", err);
    return NextResponse.json({ error: "Failed to fetch Spotify data" }, { status: 500 });
  }
}
