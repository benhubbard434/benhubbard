import Image from "next/image";
import StravaStats from "./StravaStats";

const loremShort = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.";
const loremMed = "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.";
const loremAlt = "Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.";
const loremExtra = "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident.";

const qaItems = [
  {
    question: "How did running find you — or did you find it? Was there a specific day, a moment, a pair of shoes, a crisis, a dare?",
    answers: [loremShort, loremMed, loremAlt],
  },
  {
    question: "Walk me through what a run actually looks like for you. Not the glossy version — the real one. The negotiation with yourself before you get out the door, what you wear, whether you eat first, what plays in your ears (if anything).",
    answers: [loremShort, loremMed, loremAlt, loremExtra],
  },
  {
    question: "Do you have a route that feels like yours — one you could draw from memory? What is it about that particular stretch of ground?",
    answers: [loremShort, loremMed, loremAlt],
  },
  {
    question: "How has your relationship with your body changed since you started running? Has it made you kinder to it, or more demanding?",
    answers: [loremShort, loremMed, loremAlt, loremExtra],
  },
  {
    question: "What's the run you most wanted to quit — the one where everything in you said stop? What happened?",
    answers: [loremShort, loremMed, loremAlt],
  },
  {
    question: "And then the opposite — what's your single favourite running moment? The one that lives in your chest. It doesn't have to be a finish line or a PB. It might be a Tuesday in November. What was it, and why does it stay with you?",
    answers: [loremShort, loremMed, loremAlt, loremExtra],
  },
  {
    question: "Do you run alone or with others? Has running changed any of your relationships — started new ones, deepened old ones, quietly ended any?",
    answers: [loremShort, loremMed, loremAlt],
  },
  {
    question: `Do you call yourself "a runner"? When did that start feeling true — if it does?`,
    answers: [loremShort, loremMed, loremAlt, loremExtra],
  },
  {
    question: "Is there a run you haven't done yet that pulls at you? A distance, a place, a feeling you're chasing?",
    answers: [loremShort, loremMed, loremAlt],
  },
];

const runningPhotos = [
  "/images/running-1.jpg",
  "/images/running-2.jpg",
  "/images/running-3.jpg",
  "/images/running-4.jpg",
  "/images/running-5.jpg",
  "/images/running-6.jpg",
  "/images/running-7.jpg",
  "/images/running-8.jpg",
];

const marqueePhotos = [...runningPhotos, ...runningPhotos];

export default function RunningPage() {
  return (
    <main className="flex flex-col bg-black text-white">
      {/* Hero */}
      <section className="px-8 pt-16 pb-8">
        <h1 className="font-inktrap text-7xl md:text-9xl leading-none">Running</h1>
        <p className="text-xs tracking-[0.3em] uppercase text-white/50 mt-2">
          Fuelled by Margaritas
        </p>
      </section>

      {/* Auto-scrolling photo marquee */}
      <div className="w-full overflow-hidden">
        <div className="flex h-[150px] w-max animate-marquee">
          {marqueePhotos.map((src, i) => (
            <div key={i} className="relative h-full w-[225px] shrink-0">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Running photo ${(i % runningPhotos.length) + 1}`}
                className="h-full w-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Strava stats */}
      <StravaStats />

      {/* Orange profile banner */}
      <section className="flex flex-col md:flex-row min-h-[260px]">
        <div
          className="flex-1 flex flex-col justify-center px-8 py-12"
          style={{ backgroundColor: "#e55012" }}
        >
          <h2 className="font-inktrap text-5xl md:text-7xl leading-none text-white">
            Ben Hubbard
          </h2>
          <p className="text-xs tracking-[0.3em] uppercase text-white/70 mt-3">
            Runner, part time cyclist, more part time triathlete
          </p>
        </div>
        <div className="w-full md:w-80 relative min-h-[260px] bg-gray-900">
          <Image
            src="/images/running-profile.jpg"
            alt="Ben running"
            fill
            className="object-cover"
            sizes="320px"
          />
        </div>
      </section>

      {/* Q&A interview section — full width white */}
      <section className="bg-white text-black w-full py-16">
        <div className="max-w-3xl mx-auto px-8">
          <p className="text-gray-500 text-sm mb-12">
            The following is an interview with Ben, edited lightly for clarity and length.
          </p>

          <div className="flex flex-col gap-12">
            {qaItems.map((item, i) => (
              <div key={i}>
                <p className="font-bold text-xl leading-snug mb-4">{item.question}</p>
                <div className="flex flex-col gap-4">
                  {item.answers.map((answer, j) => (
                    <p key={j} className="text-gray-700 leading-relaxed">{answer}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
