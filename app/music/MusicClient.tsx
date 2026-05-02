"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type PlaylistData = {
  name: string | null;
  description: string | null;
  url: string;
  image: string | null;
  embedUrl: string;
};

const PLAYLIST_ID = "1V4K1ZZ4SKAJdLvrh7O7lS";
const FALLBACK_EMBED = `https://open.spotify.com/embed/playlist/${PLAYLIST_ID}?utm_source=generator&theme=0`;
const FALLBACK_URL = `https://open.spotify.com/playlist/${PLAYLIST_ID}`;

export default function MusicClient() {
  const [data, setData] = useState<PlaylistData | null>(null);

  useEffect(() => {
    fetch("/api/spotify")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .catch(() => {});
  }, []);

  const embedUrl = data?.embedUrl ?? FALLBACK_EMBED;
  const playlistUrl = data?.url ?? FALLBACK_URL;
  const coverImage = data?.image ?? null;

  return (
    <main
      className="flex-1 flex flex-col min-h-screen"
      style={{
        background:
          "linear-gradient(135deg, #f0c040 0%, #e07820 25%, #c04080 50%, #6040c0 75%, #2080c0 100%)",
      }}
    >
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-10 min-h-[45vh]">
        {coverImage && (
          <div className="relative w-36 h-36 rounded-lg overflow-hidden shadow-2xl mb-6">
            <Image
              src={coverImage}
              alt="Playlist cover"
              fill
              className="object-cover"
              sizes="144px"
            />
          </div>
        )}

        <h1
          className="font-inktrap text-white leading-none mb-3"
          style={{ fontSize: "clamp(2rem, 7vw, 5rem)" }}
        >
          {data?.name ?? "BEN'S TEN OF THE MONTH"}
        </h1>
        <p className="text-black/60 text-lg mb-8 max-w-md">
          Every month(ish), I curate my top 10 favourite tracks on repeat.
        </p>

        <a
          href={playlistUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-900 transition-colors"
          style={{ color: "#f0c040" }}
        >
          {/* Spotify icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Open in Spotify
        </a>
      </section>

      {/* Spotify embed player */}
      <section className="px-4 pb-4 max-w-2xl w-full mx-auto w-full">
        <iframe
          src={embedUrl}
          width="100%"
          height="500"
          frameBorder="0"
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
          className="rounded-xl shadow-2xl"
          title="Spotify Playlist"
        />
      </section>

      {/* Footer padding */}
      <div className="h-8" />
    </main>
  );
}
