/**
 * Parkrun stats, worked out from Strava activities with "parkrun" in the name.
 *
 * Strava knows nothing about parkrun, so the venue is inferred: first from the
 * start point (nearest known venue), then from the activity name for the few
 * runs without GPS. New venues need adding to VENUES; until then their runs
 * still count, but are logged as unplaced and left out of the alphabet.
 *
 * Every tagged run counts, whatever its length, apart from EXCLUDED_IDS.
 * Times are Strava's elapsed time, which runs a few seconds off the official
 * result (hence no PB here: Strava's fastest beats the real one), and only
 * clean 5k recordings are timed (see isTimed), so warm-ups and short
 * recordings count towards the totals without skewing the times.
 */

export type ParkrunActivity = {
  id: number;
  name: string;
  distance: number;
  elapsed_time: number;
  start_date_local: string;
  start_latlng: [number, number] | [] | null;
};

type Venue = { name: string; lat: number; lng: number; match: RegExp };

/** Coordinates are the average start point of my runs there, not the course. */
const VENUES: Venue[] = [
  { name: "Aldenham", lat: 51.6482, lng: -0.3166, match: /aldenham/i },
  { name: "Bury St Edmunds", lat: 52.2246, lng: 0.7301, match: /bury st/i },
  { name: "Cambridge", lat: 52.2366, lng: 0.1624, match: /cambridge|milton country/i },
  { name: "Canterbury", lat: 51.2775, lng: 1.0802, match: /canterbury/i },
  { name: "Clapham Common", lat: 51.4572, lng: -0.1529, match: /clapham/i },
  { name: "Coldham's Common", lat: 52.2068, lng: 0.1475, match: /coldham/i },
  { name: "Dulwich", lat: 51.4441, lng: -0.0789, match: /dulwich/i },
  { name: "East Brighton", lat: 50.8187, lng: -0.0993, match: /east brighton/i },
  { name: "Fulham Palace", lat: 51.471, lng: -0.2183, match: /fulham/i },
  { name: "Gadebridge", lat: 51.7603, lng: -0.4738, match: /gadebridge/i },
  { name: "Hackney Marshes", lat: 51.5549, lng: -0.0242, match: /hackney/i },
  { name: "Hastings", lat: 50.8503, lng: 0.5401, match: /hastings/i },
  { name: "Henlow Bridge Lakes", lat: 52.0304, lng: -0.2681, match: /henlow/i },
  { name: "Highbury Fields", lat: 51.5486, lng: -0.104, match: /highbury/i },
  { name: "Jersey Farm", lat: 51.7739, lng: -0.3093, match: /jersey farm/i },
  { name: "Lanhydrock", lat: 50.4436, lng: -4.6979, match: /lanhydrock|hilly af/i },
  { name: "Letchworth", lat: 51.9874, lng: -0.2173, match: /letchworth/i },
  { name: "Mile End", lat: 51.5236, lng: -0.0395, match: /mile end/i },
  { name: "Nonsuch", lat: 51.357, lng: -0.2311, match: /nonsuch/i },
  { name: "Oak Hill", lat: 51.6382, lng: -0.1556, match: /oak hill/i },
  { name: "Parke", lat: 50.5928, lng: -3.6863, match: /^parke\b/i },
  { name: "Plym Valley", lat: 50.4093, lng: -4.0793, match: /plym ?vall?e?y/i },
  { name: "Roding Valley", lat: 51.6385, lng: 0.0668, match: /roding/i },
  { name: "Southwark", lat: 51.4938, lng: -0.0523, match: /southwark/i },
  { name: "St Albans", lat: 51.7491, lng: -0.3514, match: /st albans/i },
  { name: "Stevenage", lat: 51.9045, lng: -0.1805, match: /stevenage/i },
  { name: "Tooting Common", lat: 51.4619, lng: -0.1382, match: /tooting/i },
  { name: "University of Northampton", lat: 52.2301, lng: -0.8869, match: /northampton/i },
  { name: "Victoria Dock", lat: 51.507, lng: 0.0168, match: /victoria dock/i },
  { name: "Walthamstow", lat: 51.6028, lng: -0.0077, match: /walthamstow/i },
  { name: "Wanstead Flats", lat: 51.5609, lng: 0.0153, match: /wanstead/i },
  { name: "Wimpole Estate", lat: 52.1401, lng: -0.0477, match: /wimpole/i },
];

/**
 * Letters I count with a particular venue, kept from the hand-made grid. Any
 * other letter goes to the first venue I ran there.
 */
const ALPHABET_PICKS = new Set([
  "Canterbury",
  "Hackney Marshes",
  "Lanhydrock",
  "Parke",
  "Stevenage",
  "Wimpole Estate",
]);

/** Tagged runs that shouldn't count as a parkrun, by Strava activity id. */
const EXCLUDED_IDS = new Set([
  9722205900, // "The first km of parkrun", 26 Aug 2023
]);

/** A start further than this from every known venue is left unplaced. */
const MAX_VENUE_KM = 2;

/** Parkrun has no X venue in the UK, so the alphabet runs to 25. */
const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWYZ".split("");

const MILESTONES = [25, 50, 100, 250, 500];

function kmBetween(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const rad = Math.PI / 180;
  const dLat = (lat2 - lat1) * rad;
  const dLng = (lng2 - lng1) * rad;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(a));
}

function venueFor(a: ParkrunActivity): Venue | null {
  if (a.start_latlng?.length === 2) {
    const [lat, lng] = a.start_latlng;
    let best: Venue | null = null;
    let bestKm = MAX_VENUE_KM;
    for (const v of VENUES) {
      const km = kmBetween(lat, lng, v.lat, v.lng);
      if (km < bestKm) [best, bestKm] = [v, km];
    }
    if (best) return best;
  }
  // Names often lead with a note ("Mr Consistency // Mile End parkrun").
  const name = a.name.split("//").pop()!.trim();
  return VENUES.find((v) => v.match.test(name)) ?? null;
}

/** A single 5k with the watch running throughout, so the time means something. */
const isTimed = (a: ParkrunActivity) =>
  a.distance >= 4800 && a.distance <= 5300 && a.elapsed_time >= 900 && a.elapsed_time <= 2700;

/** Weeks since the epoch, Saturday to Friday, so each parkrun lands in its own week. */
const weekOf = (date: string) =>
  Math.floor((Date.parse(date.slice(0, 10)) / 86400000 + 5) / 7);

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

export type VenueTally = { name: string; count: number; first: string; lat: number; lng: number };

export type ParkrunStats = {
  total: number;
  venues: VenueTally[];
  /** `others` counts the letter's other venues. */
  alphabet: { letter: string; venue: string | null; others: number }[];
  lettersDone: number;
  /** Runs timed as a clean 5k (see isTimed). */
  timedCount: number;
  medianSeconds: number | null;
  totalKm: number;
  byYear: { year: number; count: number; medianSeconds: number | null }[];
  longestStreak: { weeks: number; from: string; to: string };
  milestones: { at: number; date: string }[];
  nextMilestone: { at: number; toGo: number } | null;
  /** Dates of runs that matched no venue; logged so VENUES can be updated. */
  unplaced: string[];
};

export function parkrunStats(activities: ParkrunActivity[]): ParkrunStats {
  const runs = activities
    .filter((a) => !EXCLUDED_IDS.has(a.id))
    .sort((a, b) => a.start_date_local.localeCompare(b.start_date_local));
  const placed = runs.map((a) => {
    const place = venueFor(a);
    return { a, place, venue: place?.name ?? null };
  });

  const tally = new Map<string, VenueTally>();
  for (const { a, place } of placed) {
    if (!place) continue;
    const t = tally.get(place.name);
    if (t) t.count++;
    else
      tally.set(place.name, {
        name: place.name,
        count: 1,
        first: a.start_date_local,
        lat: place.lat,
        lng: place.lng,
      });
  }
  const venues = [...tally.values()].sort((a, b) => b.count - a.count);

  const alphabet = LETTERS.map((letter) => {
    const matches = [...tally.values()]
      .filter((v) => v.name[0].toUpperCase() === letter)
      .sort((a, b) => a.first.localeCompare(b.first));
    const pick = matches.find((v) => ALPHABET_PICKS.has(v.name)) ?? matches[0];
    return { letter, venue: pick?.name ?? null, others: Math.max(0, matches.length - 1) };
  });

  const timed = placed.filter(({ a }) => isTimed(a));
  const times = timed.map(({ a }) => a.elapsed_time);

  const years = new Map<number, { count: number; times: number[] }>();
  for (const a of runs) {
    const year = Number(a.start_date_local.slice(0, 4));
    const y = years.get(year) ?? { count: 0, times: [] };
    y.count++;
    if (isTimed(a)) y.times.push(a.elapsed_time);
    years.set(year, y);
  }
  const first = runs.length ? Number(runs[0].start_date_local.slice(0, 4)) : 0;
  const last = runs.length ? Number(runs.at(-1)!.start_date_local.slice(0, 4)) : -1;
  // Every year from the first, so gaps (2020) show as gaps rather than vanish.
  const byYear = [];
  for (let year = first; year <= last; year++) {
    const y = years.get(year);
    byYear.push({
      year,
      count: y?.count ?? 0,
      medianSeconds: y?.times.length ? median(y.times) : null,
    });
  }

  let streak = { weeks: 0, from: "", to: "" };
  let run = { weeks: 0, from: "" };
  let prevWeek = NaN;
  for (const a of runs) {
    const week = weekOf(a.start_date_local);
    if (week === prevWeek) continue;
    run = week === prevWeek + 1 ? { ...run, weeks: run.weeks + 1 } : { weeks: 1, from: a.start_date_local };
    if (run.weeks > streak.weeks) streak = { ...run, to: a.start_date_local };
    prevWeek = week;
  }

  const milestones = MILESTONES.filter((m) => m <= runs.length).map((m) => ({
    at: m,
    date: runs[m - 1].start_date_local,
  }));
  const next = MILESTONES.find((m) => m > runs.length);

  return {
    total: runs.length,
    venues,
    alphabet,
    lettersDone: alphabet.filter((l) => l.venue).length,
    timedCount: timed.length,
    medianSeconds: times.length ? median(times) : null,
    totalKm: runs.length * 5,
    byYear,
    longestStreak: streak,
    milestones,
    nextMilestone: next ? { at: next, toGo: next - runs.length } : null,
    unplaced: placed.filter((p) => !p.venue).map((p) => p.a.start_date_local.slice(0, 10)),
  };
}
