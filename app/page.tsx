import Image from "next/image";

export default function Home() {
  return (
    <main className="relative w-full h-screen -mb-24">
      {/* Hero image — replace hero.jpg with your photo */}
      <Image
        src="/images/hero.jpg"
        alt="Ben Hubbard"
        fill
        priority
        className="object-cover object-center"
      />
      {/* Fallback background behind image */}
      <div className="absolute inset-0 bg-gray-200 -z-10" aria-hidden />
    </main>
  );
}
