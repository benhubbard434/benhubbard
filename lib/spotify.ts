/**
 * Spotify Web API client, server-side only.
 *
 * The playlist endpoints do not have the shape most references describe.
 * Verified against the live API in September 2026:
 *
 *   - The track listing lives at /playlists/{id}/items, NOT
 *     /playlists/{id}/tracks. The old path answers 403 Forbidden with an
 *     empty body, which reads like a permissions problem but is not one.
 *   - Each row wraps its track under `item`, NOT `track`.
 *   - GET /playlists/{id} inlines that same listing under a top-level
 *     `items` key, NOT `tracks`. That rename fails silently: asking for
 *     `fields=tracks.total` returns `{}` rather than an error.
 *   - `preview_url` is absent from every track object, and the batch
 *     /v1/tracks?ids= endpoint is 403. Single /v1/tracks/{id} still works.
 *
 * Anything here that looks redundant is load-bearing. Re-verify against the
 * live API before "tidying" the field lists.
 */

const PLAYLIST_ID = "1V4K1ZZ4SKAJdLvrh7O7lS";

/** The account is UK-based; relinking picks the playable release per market. */
const MARKET = "GB";

/** Trimmed to what the page renders — the untrimmed playlist inlines all 100 rows. */
const META_FIELDS =
  "name,description,external_urls,images,followers,snapshot_id,owner(display_name)";

const ITEM_FIELDS =
  "total,items(added_at,item(id,uri,name,duration_ms,explicit,external_urls,artists(name),album(name,images,release_date)))";

export type SpotifyTrack = {
  id: string;
  uri: string;
  name: string;
  /** Pre-joined for display; Spotify returns these as an array. */
  artists: string;
  album: string;
  albumArt: string | null;
  releaseDate: string | null;
  durationMs: number;
  explicit: boolean;
  addedAt: string | null;
  url: string;
};

export type SpotifyPlaylist = {
  id: string;
  name: string;
  description: string;
  url: string;
  cover: string | null;
  followers: number | null;
  /** Changes only when the contents change — cheap way to diff the playlist. */
  snapshotId: string | null;
  tracks: SpotifyTrack[];
};

export const PLAYLIST_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;
export const PLAYLIST_EMBED_URL = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}`;

async function getAccessToken(): Promise<string | null> {
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, SPOTIFY_REFRESH_TOKEN } =
    process.env;
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET || !SPOTIFY_REFRESH_TOKEN) {
    return null;
  }

  const credentials = Buffer.from(
    `${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`
  ).toString("base64");

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
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.access_token ?? null;
}

/** Shape of one row from /playlists/{id}/items — note `item`, not `track`. */
type RawRow = {
  added_at?: string | null;
  item?: {
    id?: string;
    uri?: string;
    name?: string;
    duration_ms?: number;
    explicit?: boolean;
    external_urls?: { spotify?: string };
    artists?: { name?: string }[];
    album?: {
      name?: string;
      release_date?: string;
      images?: { url?: string; width?: number | null }[];
    };
  } | null;
};

/** Largest first, so [0] is the highest resolution Spotify offers. */
function largestImage(images?: { url?: string }[] | null): string | null {
  return images?.[0]?.url ?? null;
}

function normaliseRow(row: RawRow): SpotifyTrack | null {
  const t = row.item;
  // Locally-added files and tracks pulled from the catalogue arrive as null.
  if (!t?.id || !t.uri || !t.name) return null;

  return {
    id: t.id,
    uri: t.uri,
    name: t.name,
    artists: (t.artists ?? [])
      .map((a) => a.name)
      .filter(Boolean)
      .join(", "),
    album: t.album?.name ?? "",
    albumArt: largestImage(t.album?.images),
    releaseDate: t.album?.release_date ?? null,
    durationMs: t.duration_ms ?? 0,
    explicit: Boolean(t.explicit),
    addedAt: row.added_at ?? null,
    url: t.external_urls?.spotify ?? `https://open.spotify.com/track/${t.id}`,
  };
}

/**
 * Fetches the playlist and its tracks. Returns null on any failure so the
 * page can fall back to the plain embed rather than failing the render.
 */
export async function getPlaylist(): Promise<SpotifyPlaylist | null> {
  try {
    const token = await getAccessToken();
    if (!token) return null;

    const headers = { Authorization: `Bearer ${token}` };
    const [metaRes, itemsRes] = await Promise.all([
      fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}?fields=${encodeURIComponent(META_FIELDS)}`,
        { headers }
      ),
      fetch(
        `https://api.spotify.com/v1/playlists/${PLAYLIST_ID}/items?market=${MARKET}&limit=50&fields=${encodeURIComponent(ITEM_FIELDS)}`,
        { headers }
      ),
    ]);

    if (!metaRes.ok) return null;
    const meta = await metaRes.json();

    // A failed listing still leaves a usable header, so degrade rather than bail.
    const rows: RawRow[] = itemsRes.ok ? ((await itemsRes.json()).items ?? []) : [];

    return {
      id: PLAYLIST_ID,
      name: meta.name ?? "Ben's Ten of the Month",
      description: meta.description ?? "",
      url: meta.external_urls?.spotify ?? PLAYLIST_URL,
      cover: largestImage(meta.images),
      followers: meta.followers?.total ?? null,
      snapshotId: meta.snapshot_id ?? null,
      tracks: rows.map(normaliseRow).filter((t): t is SpotifyTrack => t !== null),
    };
  } catch (err) {
    console.error("Spotify fetch failed:", err);
    return null;
  }
}
