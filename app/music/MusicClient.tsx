"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { SpotifyPlaylist, SpotifyTrack } from "@/lib/spotify";
import { PLAYLIST_EMBED_URL, PLAYLIST_URL } from "@/lib/spotify";

/** Spotify green, on the same logic as the running page taking Strava orange. */
const ACCENT = "#1db954";

/* -------------------------------------------------------------------------- */
/*  Spotify iframe API                                                        */
/* -------------------------------------------------------------------------- */

type PlaybackData = {
  position: number;
  duration: number;
  isPaused: boolean;
  isBuffering: boolean;
};

type Controller = {
  loadUri: (uri: string) => void;
  play: () => void;
  pause: () => void;
  resume: () => void;
  togglePlay: () => void;
  /** Takes SECONDS, while playback_update reports position in MILLISECONDS. */
  seek: (seconds: number) => void;
  destroy: () => void;
  addListener: (
    event: "ready" | "playback_update",
    cb: (e: { data: PlaybackData }) => void
  ) => void;
};

type IFrameAPI = {
  createController: (
    el: HTMLElement,
    opts: { uri: string; width: string | number; height: string | number },
    cb: (c: Controller) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: IFrameAPI) => void;
    /** Stashed on first ready so a remount does not wait for a second callback. */
    __spotifyIFrameAPI?: IFrameAPI;
  }
}

const LOADER_ID = "spotify-iframe-api-loader";
const LOADER_SRC = "https://open.spotify.com/embed/iframe-api/v1";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function formatTime(ms: number): string {
  if (!Number.isFinite(ms) || ms <= 0) return "0:00";
  const total = Math.floor(ms / 1000);
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
}

function formatTotal(ms: number): string {
  const mins = Math.round(ms / 60000);
  if (mins < 60) return `${mins} min`;
  return `${Math.floor(mins / 60)} hr ${mins % 60} min`;
}

/** Freshly-added tracks earn a badge; three weeks is roughly one drop. */
function isNew(addedAt: string | null): boolean {
  if (!addedAt) return false;
  const added = new Date(addedAt).getTime();
  if (Number.isNaN(added)) return false;
  return Date.now() - added < 21 * 24 * 60 * 60 * 1000;
}

function releaseYear(date: string | null): string | null {
  return date?.slice(0, 4) ?? null;
}

/* -------------------------------------------------------------------------- */
/*  Component                                                                 */
/* -------------------------------------------------------------------------- */

export default function MusicClient({
  playlist,
}: {
  playlist: SpotifyPlaylist | null;
}) {
  // Stable identity, so the hooks below do not see a new array every render.
  const tracks = useMemo(() => playlist?.tracks ?? [], [playlist]);
  const hasTracks = tracks.length > 0;

  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<Controller | null>(null);
  /** Guards the end-of-track advance, which would otherwise fire on every tick. */
  const advancingRef = useRef(false);

  const [ready, setReady] = useState(false);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(true);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  /**
   * The thumb's position while the user drags it. Non-null means a drag is in
   * progress and takes precedence over the position Spotify reports, which
   * keeps the two from fighting without needing a ref the listener reads.
   */
  const [scrubValue, setScrubValue] = useState<number | null>(null);
  /** Bumped whenever a track is chosen; 0 means "nothing requested yet". */
  const [playRequest, setPlayRequest] = useState(0);

  const current: SpotifyTrack | undefined = tracks[index];

  const select = useCallback(
    (next: number) => {
      const total = tracks.length;
      if (total === 0) return;
      const wrapped = ((next % total) + total) % total;
      setIndex(wrapped);
      setPosition(0);
      setPlayRequest((n) => n + 1);
    },
    [tracks.length]
  );

  /**
   * Loads and starts whichever track is selected.
   *
   * This deliberately lives in an effect rather than in `select` or in the
   * playback listener. Calling loadUri() from inside a playback_update
   * handler wedges the player: the next track loads but never reports
   * progress, leaving the UI frozen at the end of the previous one.
   *
   * `playRequest` starts at 0 and increments on every explicit choice, so the
   * first render shows track one without autoplaying it.
   */
  useEffect(() => {
    if (playRequest === 0) return;
    const ctrl = controllerRef.current;
    const uri = tracks[index]?.uri;
    if (!ctrl || !uri) return;
    ctrl.loadUri(uri);
    ctrl.play();
  }, [playRequest, index, tracks]);

  /* Create the controller once the API is available. */
  useEffect(() => {
    if (!hasTracks) return;
    let cancelled = false;

    const build = (api: IFrameAPI) => {
      const el = embedRef.current;
      if (cancelled || !el || controllerRef.current) return;

      api.createController(
        el,
        { uri: tracks[0].uri, width: "100%", height: 80 },
        (ctrl) => {
          if (cancelled) {
            ctrl.destroy();
            return;
          }
          controllerRef.current = ctrl;
          ctrl.addListener("ready", () => setReady(true));
          ctrl.addListener("playback_update", (e) => {
            const d = e.data;
            setDuration(d.duration);
            setIsPaused(d.isPaused);
            setPosition(d.position);

            // Spotify emits no "ended" event, so infer it from the position.
            const atEnd = d.duration > 0 && d.position >= d.duration - 800;
            // Re-arm once the next track is underway, or the playlist would
            // advance exactly once and then stop.
            if (!atEnd) advancingRef.current = false;

            if (atEnd && !d.isPaused && !advancingRef.current) {
              advancingRef.current = true;
              setIndex((i) => (i + 1) % tracks.length);
              setPosition(0);
              setPlayRequest((n) => n + 1);
            }
          });
        }
      );
    };

    if (window.__spotifyIFrameAPI) {
      build(window.__spotifyIFrameAPI);
    } else {
      window.onSpotifyIframeApiReady = (api) => {
        window.__spotifyIFrameAPI = api;
        build(api);
      };
      if (!document.getElementById(LOADER_ID)) {
        const s = document.createElement("script");
        s.id = LOADER_ID;
        s.src = LOADER_SRC;
        s.async = true;
        document.body.appendChild(s);
      }
    }

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
    };
    // Built once; `tracks` is stable for the life of a prerendered page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasTracks]);

  /** seek() wants seconds; everything else here is in milliseconds. */
  const commitSeek = (ms: number) => {
    controllerRef.current?.seek(ms / 1000);
    setPosition(ms);
    setScrubValue(null);
  };

  const onRowClick = (i: number) => {
    if (i === index && ready) {
      controllerRef.current?.togglePlay();
      return;
    }
    select(i);
  };

  /* ---------------------------------------------------------------------- */
  /*  Fallback: no credentials, or Spotify unreachable at build time.       */
  /* ---------------------------------------------------------------------- */
  if (!playlist || !hasTracks) {
    return (
      <main className="flex flex-col min-h-screen" style={{ background: "#111", color: "#fff" }}>
        <section className="px-8 pt-24 pb-10">
          <h1 className="font-display leading-none" style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}>
            Ten of the Month
          </h1>
          <p className="mt-4 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
            Every month(ish), I curate my ten favourite tracks on repeat.
          </p>
        </section>
        <section className="px-8 pb-20 max-w-2xl w-full">
          <iframe
            src={`${PLAYLIST_EMBED_URL}?utm_source=generator&theme=0`}
            width="100%"
            height="500"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
            className="rounded-xl"
            title="Spotify playlist"
            style={{ border: 0 }}
          />
        </section>
      </main>
    );
  }

  const totalMs = tracks.reduce((sum, t) => sum + t.durationMs, 0);
  /* Anonymous visitors get ~30s previews; only a signed-in listener hears the
     whole track. Trust what the player reports over the catalogue length. */
  const isPreview = duration > 0 && current != null && duration < current.durationMs - 5000;
  const scrubMax = duration > 0 ? duration : (current?.durationMs ?? 0);

  return (
    <main className="flex flex-col min-h-screen" style={{ background: "#111", color: "#fff" }}>
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-6 md:px-8 pt-24 pb-12">
        <p
          className="text-xs uppercase tracking-[0.25em] mb-6"
          style={{ color: "rgba(255,255,255,0.35)" }}
        >
          Curated by hand · Updated monthly
        </p>

        <h1
          className="font-display leading-none"
          style={{ fontSize: "clamp(3rem, 13vw, 11rem)" }}
        >
          Ten of the
          <br />
          <span style={{ color: ACCENT }}>Month</span>
        </h1>

        <p className="mt-6 max-w-xl leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
          Every month(ish), I curate my ten favourite tracks on repeat. Press play
          on any row — the whole thing runs on my own player.
        </p>

        <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
          <Stat label="Tracks" value={String(tracks.length)} />
          <Stat label="Runtime" value={formatTotal(totalMs)} />
          {playlist.followers != null && (
            <Stat label="Followers" value={String(playlist.followers)} />
          )}
        </dl>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Player + track list                                              */}
      {/* ---------------------------------------------------------------- */}
      <section
        className="grid grid-cols-1 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]"
        style={{ borderTop: "1px solid rgba(255,255,255,0.12)" }}
      >
        {/* --- Now playing --------------------------------------------- */}
        <div
          className="px-6 md:px-8 py-10 lg:py-12"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.12)" }}
        >
          <div className="lg:sticky lg:top-28">
            <p
              className="text-xs uppercase tracking-[0.2em] mb-5"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              {isPaused ? "Paused" : "Now playing"}
            </p>

            {/* Album art */}
            <div
              className="relative w-full aspect-square overflow-hidden mb-6"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              {current?.albumArt && (
                <Image
                  key={current.id}
                  src={current.albumArt}
                  alt={`${current.album} cover`}
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 22rem, 100vw"
                  priority
                />
              )}
            </div>

            <h2 className="text-h4 leading-tight mb-1" style={{ textTransform: "none" }}>
              {current?.name}
            </h2>
            <p className="text-sm mb-6" style={{ color: "rgba(255,255,255,0.5)" }}>
              {current?.artists}
            </p>

            {/* Scrubber — a real range input, so keyboard and AT work for free */}
            <label className="sr-only" htmlFor="seek">
              Seek within track
            </label>
            <input
              id="seek"
              type="range"
              min={0}
              max={scrubMax || 1}
              value={scrubValue ?? Math.min(position, scrubMax || 1)}
              disabled={!ready}
              onChange={(e) => setScrubValue(Number(e.target.value))}
              onPointerUp={(e) => commitSeek(Number(e.currentTarget.value))}
              onKeyUp={(e) => commitSeek(Number(e.currentTarget.value))}
              onBlur={() => setScrubValue(null)}
              className="w-full"
              style={{ accentColor: ACCENT }}
            />

            <div
              className="flex justify-between text-xs tabular-nums mt-1"
              style={{ color: "rgba(255,255,255,0.4)" }}
            >
              <span>{formatTime(position)}</span>
              <span>{formatTime(scrubMax)}</span>
            </div>

            {/* Transport */}
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => select(index - 1)}
                aria-label="Previous track"
                className="p-2 transition-opacity hover:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              <button
                onClick={() => controllerRef.current?.togglePlay()}
                disabled={!ready}
                aria-label={isPaused ? "Play" : "Pause"}
                className="flex items-center justify-center w-14 h-14 rounded-full transition-transform hover:scale-105 disabled:opacity-40"
                style={{ background: ACCENT, color: "#111" }}
              >
                {isPaused ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => select(index + 1)}
                aria-label="Next track"
                className="p-2 transition-opacity hover:opacity-60"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
                </svg>
              </button>
            </div>

            {/* The embed is the licensed audio engine and carries Spotify's
                attribution, so it stays visible — just small. */}
            <div className="mt-8">
              <div ref={embedRef} />
              <p
                className="mt-3 text-xs leading-relaxed"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                {isPreview
                  ? "Playing a 30-second preview. Sign in to Spotify for full tracks."
                  : "Full tracks play if you're signed in to Spotify."}
              </p>
            </div>
          </div>
        </div>

        {/* --- Track list ---------------------------------------------- */}
        <ol style={{ borderLeft: "1px solid rgba(255,255,255,0.12)" }}>
          {tracks.map((t, i) => {
            const active = i === index;
            const playing = active && !isPaused;
            return (
              <li
                key={t.id}
                style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
              >
                <div
                  className="group flex items-center gap-4 px-5 md:px-7 py-4 transition-colors"
                  style={{ background: active ? "rgba(29,185,84,0.08)" : undefined }}
                >
                  {/* Index / play toggle */}
                  <button
                    onClick={() => onRowClick(i)}
                    aria-label={playing ? `Pause ${t.name}` : `Play ${t.name}`}
                    className="w-7 shrink-0 text-left tabular-nums"
                    style={{ color: active ? ACCENT : "rgba(255,255,255,0.35)" }}
                  >
                    {playing ? (
                      <EqualiserBars />
                    ) : (
                      <>
                        <span className="group-hover:hidden text-sm">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <svg
                          className="hidden group-hover:block"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </>
                    )}
                  </button>

                  {/* Art */}
                  <div
                    className="relative w-11 h-11 shrink-0 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  >
                    {t.albumArt && (
                      <Image
                        src={t.albumArt}
                        alt=""
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    )}
                  </div>

                  {/* Title / artist */}
                  <button
                    onClick={() => onRowClick(i)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="flex items-center gap-2">
                      <span
                        className="truncate text-sm md:text-base"
                        style={{ color: active ? ACCENT : "#fff" }}
                      >
                        {t.name}
                      </span>
                      {t.explicit && (
                        <span
                          className="shrink-0 text-[9px] px-1 leading-4 rounded-sm"
                          style={{
                            background: "rgba(255,255,255,0.2)",
                            color: "rgba(255,255,255,0.75)",
                          }}
                          title="Explicit"
                        >
                          E
                        </span>
                      )}
                      {isNew(t.addedAt) && (
                        <span
                          className="shrink-0 text-[9px] uppercase tracking-wider px-1.5 leading-4 rounded-sm"
                          style={{ background: ACCENT, color: "#111" }}
                        >
                          New
                        </span>
                      )}
                    </span>
                    <span
                      className="block truncate text-xs mt-0.5"
                      style={{ color: "rgba(255,255,255,0.45)" }}
                    >
                      {t.artists}
                    </span>
                  </button>

                  {/* Album — desktop only, it is the first thing worth dropping */}
                  <span
                    className="hidden xl:block flex-1 min-w-0 truncate text-xs"
                    style={{ color: "rgba(255,255,255,0.3)" }}
                  >
                    {t.album}
                    {releaseYear(t.releaseDate) && ` · ${releaseYear(t.releaseDate)}`}
                  </span>

                  <span
                    className="shrink-0 text-xs tabular-nums"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {formatTime(t.durationMs)}
                  </span>

                  <a
                    href={t.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Open ${t.name} in Spotify`}
                    className="shrink-0 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14zM5 5h5v2H7v10h10v-3h2v5H5z" />
                    </svg>
                  </a>
                </div>
              </li>
            );
          })}

          {/* Footer row */}
          <li className="px-5 md:px-7 py-8 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
              Track data from the Spotify Web API · refreshed every 6 hours
            </p>
            <a
              href={playlist.url || PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: ACCENT }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              Follow on Spotify
            </a>
          </li>
        </ol>
      </section>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt
        className="text-xs uppercase tracking-[0.2em] mb-2"
        style={{ color: "rgba(255,255,255,0.35)" }}
      >
        {label}
      </dt>
      <dd className="font-display leading-none" style={{ fontSize: "clamp(1.5rem, 4vw, 2.25rem)" }}>
        {value}
      </dd>
    </div>
  );
}

/** Three bars that bounce while a row is playing. */
function EqualiserBars() {
  return (
    <span className="flex items-end gap-[2px] h-3.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="equaliser-bar w-[3px]"
          style={{ background: ACCENT, animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
