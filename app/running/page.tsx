import Image from "next/image";
import StravaStats from "./StravaStats";

const qaItems = [
  {
    question: "a pair of shoes, a crisis, a dare?",
    answer:
      "Placeholder — replace with your answer about what got you into running.",
  },
  {
    question:
      "Walk me through what a run actually looks like for you. Not the glossy version — the real one. The negotiation with yourself before you get out the door, what you wear, whether you eat first, what plays in your ears (if anything).",
    answer:
      "Placeholder — replace with your real answer about your running routine.",
  },
];

// Add your running photos to public/images/running/ and list filenames here
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

export default function RunningPage() {
  return (
    <main className="flex-1 flex flex-col bg-black text-white">
      {/* Hero */}
      <section className="px-8 pt-16 pb-8">
        <h1 className="font-inktrap text-7xl md:text-9xl leading-none">Running</h1>
        <p className="text-xs tracking-[0.3em] uppercase text-white/50 mt-2">
          Fuelled by Margaritas
        </p>
      </section>

      {/* Photo strip */}
      <div className="w-full overflow-x-auto flex gap-2 pb-2 px-2 scrollbar-hide">
        {runningPhotos.map((src, i) => (
          <div key={i} className="shrink-0 w-48 h-36 relative rounded overflow-hidden bg-gray-800">
            <Image
              src={src}
              alt={`Running photo ${i + 1}`}
              fill
              className="object-cover"
              sizes="192px"
            />
          </div>
        ))}
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
            Runner, Part Time Cyclist, More Part Time Triathlete
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

      {/* Q&A interview section */}
      <section className="bg-white text-black px-8 py-16 max-w-3xl w-full mx-auto">
        <p className="text-gray-500 text-sm mb-12">
          The following is an interview with Ben, edited lightly for clarity and length.
        </p>

        <div className="flex flex-col gap-12">
          {qaItems.map((item, i) => (
            <div key={i}>
              <h3 className="font-bold text-xl leading-snug mb-4">{item.question}</h3>
              <p className="text-gray-700 leading-relaxed">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
