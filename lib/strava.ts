/**
 * Strava API client, server-side only.
 *
 * Distance comes straight from /athletes/{id}/stats, but Strava has no race
 * count anywhere, so races mean paging through every activity and counting
 * runs tagged as a race (workout_type 1). That listing is the slow part.
 * The stats call returns activity counts, so the page count is estimated up
 * front and the pages are fetched in parallel rather than one after another.
 */

const ATHLETE_ID = "938645";
const API_BASE = "https://www.strava.com/api/v3";
const PER_PAGE = 200;

/** Matches the running page's `revalidate`. */
const REVALIDATE = 10800;

export type StravaStats = {
  ytdDistanceKm: number | null;
  allTimeDistanceKm: number | null;
  racesThisYear: number;
  allTimeRaces: number;
  /** Runs with "parkrun" in the name. Only as complete as the tagging. */
  parkruns: number;
};

type Totals = { count: number; distance: number };
type AthleteStats = {
  ytd_run_totals?: Totals;
  all_run_totals?: Totals;
  all_ride_totals?: Totals;
  all_swim_totals?: Totals;
};
type Activity = {
  name: string;
  type: string;
  workout_type: number | null;
  start_date: string;
};

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID,
      client_secret: process.env.STRAVA_CLIENT_SECRET,
      refresh_token: process.env.STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);
  const data = await res.json();
  return data.access_token;
}

async function get<T>(path: string, token: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    next: { revalidate: REVALIDATE },
  });
  if (!res.ok) throw new Error(`Strava ${path} failed: ${res.status}`);
  return res.json();
}

const getPage = (page: number, token: string) =>
  get<Activity[]>(`/athlete/activities?per_page=${PER_PAGE}&page=${page}`, token);

async function fetchAllActivities(token: string, estimatedCount: number): Promise<Activity[]> {
  // Run/ride/swim counts miss walks, workouts and the like, so the estimate
  // can fall short. Anything past it is picked up one page at a time below.
  const estimatedPages = Math.max(1, Math.ceil(estimatedCount / PER_PAGE));
  const pages = await Promise.all(
    Array.from({ length: estimatedPages }, (_, i) => getPage(i + 1, token))
  );

  let page = estimatedPages;
  while (pages[pages.length - 1].length === PER_PAGE) {
    page++;
    pages.push(await getPage(page, token));
  }
  return pages.flat();
}

const toKm = (t?: Totals) => (t?.distance != null ? Math.round(t.distance / 1000) : null);

/** Returns null when Strava is unreachable, so the page still renders. */
export async function getStravaStats(): Promise<StravaStats | null> {
  try {
    const token = await getAccessToken();
    const stats = await get<AthleteStats>(`/athletes/${ATHLETE_ID}/stats`, token);

    const estimatedCount =
      (stats.all_run_totals?.count ?? 0) +
      (stats.all_ride_totals?.count ?? 0) +
      (stats.all_swim_totals?.count ?? 0);
    const activities = await fetchAllActivities(token, estimatedCount);

    const currentYear = new Date().getFullYear();
    const runs = activities.filter((a) => a.type === "Run");
    const races = runs.filter((a) => a.workout_type === 1);

    return {
      ytdDistanceKm: toKm(stats.ytd_run_totals),
      allTimeDistanceKm: toKm(stats.all_run_totals),
      racesThisYear: races.filter(
        (a) => new Date(a.start_date).getFullYear() === currentYear
      ).length,
      allTimeRaces: races.length,
      parkruns: runs.filter((a) => /park\s*run/i.test(a.name)).length,
    };
  } catch (err) {
    console.error("Strava API error:", err);
    return null;
  }
}
