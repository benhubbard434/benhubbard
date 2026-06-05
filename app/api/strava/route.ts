import { NextResponse } from "next/server";

export const revalidate = 10800;

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN!;
const ATHLETE_ID = "938645";
const API_BASE = "https://www.api-v3.strava.com";

async function getAccessToken(): Promise<string> {
  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: STRAVA_CLIENT_ID,
      client_secret: STRAVA_CLIENT_SECRET,
      refresh_token: STRAVA_REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const data = await res.json();
  return data.access_token;
}

type Activity = { type: string; workout_type: number; start_date: string };

async function fetchAllActivities(token: string): Promise<Activity[]> {
  const all: Activity[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${API_BASE}/athlete/activities?per_page=200&page=${page}`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    );
    const batch: Activity[] = await res.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 200) break;
    page++;
  }
  return all;
}

export async function GET() {
  try {
    const token = await getAccessToken();

    const [stats, activities] = await Promise.all([
      fetch(`${API_BASE}/athletes/${ATHLETE_ID}/stats`, {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 3600 },
      }).then((r) => r.json()),
      fetchAllActivities(token),
    ]);

    const currentYear = new Date().getFullYear();
    const raceRuns = activities.filter((a) => a.type === "Run" && a.workout_type === 1);

    return NextResponse.json(
      {
        ytd_distance_km: stats.ytd_run_totals?.distance != null
          ? (stats.ytd_run_totals.distance / 1000).toFixed(2)
          : null,
        all_time_distance_km: stats.all_run_totals?.distance != null
          ? (stats.all_run_totals.distance / 1000).toFixed(2)
          : null,
        races_this_year: raceRuns.filter(
          (a) => new Date(a.start_date).getFullYear() === currentYear
        ).length,
        all_time_races: raceRuns.length,
      },
      { headers: { "Cache-Control": "public, s-maxage=10800, stale-while-revalidate=21600" } }
    );
  } catch (err) {
    console.error("Strava API error:", err);
    return NextResponse.json({ error: "Failed to fetch Strava data" }, { status: 500 });
  }
}
