import { NextResponse } from "next/server";

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID!;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET!;
const PLAYLIST_ID = "1V4K1ZZ4SKAJdLvrh7O7lS";

async function getAccessToken(): Promise<string> {
  const credentials = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    const playlistRes = await fetch(
      `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}?fields=name,description,external_urls,images,tracks.items(track(id,name,artists,album(name,images),external_urls,duration_ms,preview_url))`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }
    );

    const playlist = await playlistRes.json();

    const tracks = (playlist.tracks?.items ?? [])
      .map((item: { track: SpotifyTrack }) => item.track)
      .filter(Boolean);

    return NextResponse.json({
      name: playlist.name,
      description: playlist.description,
      url: playlist.external_urls?.spotify,
      image: playlist.images?.[0]?.url ?? null,
      tracks,
    });
  } catch (err) {
    console.error("Spotify API error:", err);
    return NextResponse.json({ error: "Failed to fetch Spotify data" }, { status: 500 });
  }
}

type SpotifyTrack = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
  duration_ms: number;
  preview_url: string | null;
};
