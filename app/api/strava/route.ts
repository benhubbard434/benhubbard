import { NextResponse } from "next/server";

// Cache the route response for 1 hour — Strava stats don't need to be real-time
export const revalidate = 3600;

const STRAVA_CLIENT_ID = process.env.STRAVA_CLIENT_ID!;
const STRAVA_CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET!;
const STRAVA_REFRESH_TOKEN = process.env.STRAVA_REFRESH_TOKEN!;
const ATHLETE_ID = "938645";

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

export async function GET() {
  try {
    const token = await getAccessToken();

    const statsRes = await fetch(
      `https://www.strava.com/api/v3/athletes/${ATHLETE_ID}/stats`,
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    );
    const stats = await statsRes.json();

    // Fetch recent activities to count races (workout_type === 1)
    const activitiesRes = await fetch(
      "https://www.strava.com/api/v3/athlete/activities?per_page=200",
      { headers: { Authorization: `Bearer ${token}` }, next: { revalidate: 3600 } }
    );
    const activities = await activitiesRes.json();

    const currentYear = new Date().getFullYear();
    const racesThisYear = Array.isArray(activities)
      ? activities.filter((a: { type: string; workout_type: number; start_date: string }) => {
          const year = new Date(a.start_date).getFullYear();
          return a.type === "Run" && a.workout_type === 1 && year === currentYear;
        }).length
      : 0;

    const ytd = stats.ytd_run_totals?.distance;
    const allTime = stats.all_run_totals?.distance;

    return NextResponse.json(
      {
        ytd_distance_km: ytd != null ? (ytd / 1000).toFixed(2) : null,
        all_time_distance_km: allTime != null ? (allTime / 1000).toFixed(2) : null,
        races_this_year: racesThisYear,
        all_time_races: stats.all_run_totals?.count ?? 0,
      },
      { headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=7200" } }
    );
  } catch (err) {
    console.error("Strava API error:", err);
    return NextResponse.json({ error: "Failed to fetch Strava data" }, { status: 500 });
  }
}
