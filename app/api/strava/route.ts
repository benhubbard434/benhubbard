import { NextResponse } from "next/server";

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

    return NextResponse.json({
      ytd_distance_km: (stats.ytd_run_totals?.distance / 1000).toFixed(2),
      all_time_distance_km: (stats.all_run_totals?.distance / 1000).toFixed(2),
      races_this_year: racesThisYear,
      all_time_races: stats.all_run_totals?.count ?? 0,
    });
  } catch (err) {
    console.error("Strava API error:", err);
    return NextResponse.json({ error: "Failed to fetch Strava data" }, { status: 500 });
  }
}
