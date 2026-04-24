"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

type Track = {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { name: string; images: { url: string }[] };
  external_urls: { spotify: string };
  duration_ms: number;
  preview_url: string | null;
};

type PlaylistData = {
  name: string;
  description: string;
  url: string;
  image: string | null;
  tracks: Track[];
};

function formatDuration(ms: number) {
  const mins = Math.floor(ms / 60000);
  const secs = Math.floor((ms % 60000) / 1000);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicClient() {
  const [data, setData] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/spotify")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <main className="flex-1 flex flex-col min-h-screen" style={{ background: "linear-gradient(135deg, #f0c040 0%, #e07820 25%, #c04080 50%, #6040c0 75%, #2080c0 100%)" }}>
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-6 pt-20 pb-10 min-h-[55vh]">
        <h1
          className="font-inktrap text-white leading-none mb-4"
          style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)" }}
        >
          BEN&apos;S TEN OF THE MONTH
        </h1>
        <p className="text-black/60 text-lg mb-8">
          Every month(ish), I curate my top 10 favourite tracks on repeat in a Playlist.
        </p>
        <a
          href="https://open.spotify.com/playlist/1V4K1ZZ4SKAJdLvrh7O7lS"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded font-medium hover:bg-gray-900 transition-colors"
          style={{ color: "#f0c040" }}
        >
          Give it a listen!
        </a>

        {/* Placeholder album art grid */}
        {loading && (
          <div className="grid grid-cols-3 gap-2 mt-10 opacity-30">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-24 h-24 bg-black/20 rounded" />
            ))}
          </div>
        )}

        {data && data.tracks.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-10">
            {data.tracks.slice(0, 3).map((track) => (
              <a
                key={track.id}
                href={track.external_urls.spotify}
                target="_blank"
                rel="noopener noreferrer"
                className="relative w-24 h-24 rounded overflow-hidden hover:scale-105 transition-transform"
              >
                {track.album.images[0] && (
                  <Image
                    src={track.album.images[0].url}
                    alt={track.album.name}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                )}
              </a>
            ))}
          </div>
        )}
      </section>

      <p className="text-center text-black/40 text-xs tracking-widest uppercase pb-4">
        Scroll to explore
      </p>

      {/* Track list */}
      <section className="bg-black/80 backdrop-blur-sm flex-1 px-6 py-12">
        {loading && (
          <div className="flex flex-col gap-4 max-w-2xl mx-auto">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex gap-4 items-center animate-pulse">
                <div className="w-12 h-12 bg-white/10 rounded shrink-0" />
                <div className="flex-1">
                  <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                  <div className="h-3 bg-white/10 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {data && (
          <ul className="max-w-2xl mx-auto divide-y divide-white/10">
            {data.tracks.map((track, i) => (
              <li key={track.id}>
                <a
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 py-3 group hover:bg-white/5 -mx-2 px-2 rounded transition-colors"
                >
                  <span className="text-white/30 text-sm w-5 text-right shrink-0">{i + 1}</span>
                  <div className="relative w-10 h-10 shrink-0 rounded overflow-hidden bg-gray-800">
                    {track.album.images[0] && (
                      <Image
                        src={track.album.images[0].url}
                        alt={track.album.name}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-medium truncate group-hover:text-green-400 transition-colors">
                      {track.name}
                    </p>
                    <p className="text-white/50 text-sm truncate">
                      {track.artists.map((a) => a.name).join(", ")}
                    </p>
                  </div>
                  <span className="text-white/30 text-sm shrink-0">
                    {formatDuration(track.duration_ms)}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
