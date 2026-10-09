import { StatCell } from "./StravaStats";

type Pb = {
  distance: string;
  time: string;
  /** When and where, linked to the Strava activity when there is one. */
  note?: string;
  strava?: string;
};

/**
 * Entered by hand rather than read from Strava: its API has no list of PBs,
 * and its "best efforts" can't be trusted here anyway, since a GPS track that
 * runs long inflates them (it credits a 3:55 marathon inside a 45km track).
 * Race times are each activity's elapsed time. The 400m was a rep inside a
 * track session, and the mile is the watch time from the activity's title
 * (Strava's elapsed time for it is a second slower).
 */
const PBS: Pb[] = [
  {
    distance: "400m",
    time: "1:00",
    note: "Track East, Jun 2018",
    strava: "https://www.strava.com/activities/1638773836",
  },
  {
    distance: "1 mile",
    time: "5:23",
    note: "Jul 2019",
    strava: "https://www.strava.com/activities/2509715650",
  },
  {
    distance: "5k",
    time: "19:39",
    note: "Chase the Sun, Jul 2019",
    strava: "https://www.strava.com/activities/2521193162",
  },
  {
    distance: "10k",
    time: "40:46",
    note: "Aug 2019",
    strava: "https://www.strava.com/activities/2599534510",
  },
  {
    distance: "Half marathon",
    time: "1:37:18",
    note: "Oct 2014",
    strava: "https://www.strava.com/activities/209103215",
  },
  {
    distance: "Marathon",
    time: "4:16:54",
    note: "Apr 2014",
    strava: "https://www.strava.com/activities/127535384",
  },
];

export default function PersonalBests() {
  return (
    <section className="pt-16" style={{ borderTop: "1px solid rgba(0,0,0,0.08)" }}>
      <h2 className="font-display text-4xl md:text-5xl px-8 mb-10">Personal bests</h2>
      {/* The gap shows the grid's background through as rules between cells,
          so they stay drawn however the columns wrap. */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-px [&>*]:bg-white"
        style={{
          background: "rgba(0,0,0,0.08)",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          borderBottom: "1px solid rgba(0,0,0,0.08)",
        }}
      >
        {PBS.map((pb) => (
          <StatCell
            key={pb.distance}
            label={pb.distance}
            value={pb.time}
            unit=""
            note={
              pb.strava ? (
                <a
                  href={pb.strava}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-2 hover:text-black"
                >
                  {pb.note}
                </a>
              ) : (
                pb.note
              )
            }
          />
        ))}
      </div>
    </section>
  );
}
