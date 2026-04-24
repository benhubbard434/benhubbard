import Image from "next/image";

export default function Home() {
  return (
    <main className="relative w-full" style={{ height: "calc(100vh - 60px)" }}>
      {/* Hero image — replace hero.jpg with your photo */}
      <Image
        src="/images/hero.jpg"
        alt="Ben Hubbard"
        fill
        priority
        className="object-cover object-center"
      />
      {/* Fallback background while image loads */}
      <div className="absolute inset-0 bg-gray-200" aria-hidden />
    </main>
  );
}
