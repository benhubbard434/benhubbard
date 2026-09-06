"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import type { SpotifyPlaylist, SpotifyTrack } from "@/lib/spotify";
import { PLAYLIST_EMBED_URL, PLAYLIST_URL } from "@/lib/spotify";

/**
 * One ground colour per track, so the page repaints itself as the playlist
 * moves. Anchored on the three brand colours from /style (Spring Green,
 * Blue, Tomato Jam) and extended with seven that hold the same saturation.
 *
 * `ink` is chosen per ground for contrast, the way the palette swatches on
 * /style carry their own. Indexed by track position, so a given track always
 * gets the same colour rather than flickering between renders.
 */
const PALETTE: { bg: string; ink: string }[] = [
  { bg: "#04F06A", ink: "#111111" }, // Spring Green — brand
  { bg: "#470FF4", ink: "#FFFFFF" }, // Blue — brand
  { bg: "#FFD400", ink: "#111111" }, // Acid yellow
  { bg: "#C4392C", ink: "#FFFFFF" }, // Tomato Jam — brand
  { bg: "#00D9E0", ink: "#111111" }, // Cyan
  { bg: "#FF4FD8", ink: "#111111" }, // Magenta
  { bg: "#7B2FF7", ink: "#FFFFFF" }, // Violet
  { bg: "#C8FF00", ink: "#111111" }, // Lime
  { bg: "#FF6B00", ink: "#111111" }, // Orange
  { bg: "#FF3366", ink: "#111111" }, // Coral
];

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


  const theme = PALETTE[index % PALETTE.length];

  /* ---------------------------------------------------------------------- */
  /*  Fallback: no credentials, or Spotify unreachable at build time.       */
  /* ---------------------------------------------------------------------- */
  if (!playlist || !hasTracks) {
    return (
      <main
        className="flex flex-col min-h-screen"
        style={{ background: PALETTE[0].bg, color: PALETTE[0].ink }}
      >
        <section className="px-6 md:px-8 pt-24 pb-10">
          <h1 className="font-display leading-[0.85]" style={{ fontSize: "clamp(3rem, 12vw, 10rem)" }}>
            Ten of the Month
          </h1>
          <p className="mt-4 text-sm" style={{ opacity: 0.6 }}>
            Every month(ish), I curate my ten favourite tracks on repeat.
          </p>
        </section>
        <section className="px-6 md:px-8 pb-20 max-w-2xl w-full">
          <iframe
            src={`${PLAYLIST_EMBED_URL}?utm_source=generator&theme=0`}
            width="100%"
            height="500"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
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
  const shownPos = scrubValue ?? Math.min(position, scrubMax || 1);
  const playedPct = scrubMax > 0 ? (shownPos / scrubMax) * 100 : 0;

  /* The marquee translates -50%, so the strip has to be exactly two identical
     halves for the loop to be seamless. */
  const marqueeWord = `${current?.name ?? ""} — ${current?.artists ?? ""}`;
  const marqueeHalf = Array.from({ length: 3 }, (_, i) => i);

  return (
    <main
      className="music-page flex flex-col min-h-screen"
      style={
        {
          "--ground": theme.bg,
          "--ink": theme.ink,
          background: "var(--ground)",
          color: "var(--ink)",
        } as React.CSSProperties
      }
    >
      {/* ---------------------------------------------------------------- */}
      {/* Hero                                                             */}
      {/* ---------------------------------------------------------------- */}
      <section className="px-6 md:px-8 pt-24 pb-10">
        <p className="text-xs uppercase tracking-[0.3em] mb-8" style={{ opacity: 0.65 }}>
          Curated by hand · Updated monthly
        </p>

        {/* Explicit lines that will not re-break: the global `text-wrap: balance`
            on h1 otherwise rebalances these into an orphaned "THE". */}
        <h1
          className="font-display leading-[0.82] -ml-1"
          style={{ fontSize: "clamp(2.75rem, 13vw, 13rem)", textWrap: "nowrap" }}
        >
          <span className="block">Ten of the</span>
          <span className="block">Month</span>
        </h1>

        <div className="mt-10 flex flex-wrap items-end gap-x-12 gap-y-6">
          <Stat label="Tracks" value={String(tracks.length)} />
          <Stat label="Runtime" value={formatTotal(totalMs)} />
          {playlist.followers != null && (
            <Stat label="Followers" value={String(playlist.followers)} />
          )}
          <p className="max-w-xs text-sm leading-relaxed" style={{ opacity: 0.7 }}>
            Ten favourites, on repeat, every month(ish). Hit any row — this runs
            on my own player, not Spotify&apos;s.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Now-playing marquee — inverted band, giant scrolling title        */}
      {/* ---------------------------------------------------------------- */}
      <div
        className="overflow-hidden py-3 select-none"
        style={{ background: "var(--ink)", color: "var(--ground)" }}
      >
        <div className="flex w-max animate-marquee">
          {[...marqueeHalf, ...marqueeHalf].map((_, i) => (
            <span
              key={i}
              className="font-display whitespace-nowrap px-6"
              style={{ fontSize: "clamp(1.75rem, 5vw, 4rem)" }}
              aria-hidden={i > 0}
            >
              {marqueeWord}
              <span style={{ opacity: 0.4 }}> ✳ </span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* Player                                                           */}
      {/* ---------------------------------------------------------------- */}
      <section
        className="grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)] gap-8 lg:gap-12 px-6 md:px-8 py-12"
        style={{ borderBottom: "3px solid var(--ink)" }}
      >
        {/* Sleeve — tilted, because a square would be the safe choice */}
        <div className="w-full max-w-[20rem]">
          <div
            className="music-sleeve relative w-full aspect-square overflow-hidden"
            style={{
              transform: isPaused ? "rotate(-2.5deg)" : "rotate(1.5deg)",
              boxShadow: "10px 10px 0 var(--ink)",
            }}
          >
            {current?.albumArt && (
              <Image
                key={current.id}
                src={current.albumArt}
                alt={`${current.album} cover`}
                fill
                className="object-cover"
                sizes="20rem"
                priority
              />
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col justify-center min-w-0">
          <p className="text-xs uppercase tracking-[0.3em] mb-4" style={{ opacity: 0.65 }}>
            {isPaused ? "Paused" : "Now playing"} — {String(index + 1).padStart(2, "0")} of{" "}
            {String(tracks.length).padStart(2, "0")}
          </p>

          <h2
            className="font-display leading-[0.9] mb-2 break-words"
            style={{ fontSize: "clamp(1.75rem, 4.5vw, 3.5rem)" }}
          >
            {current?.name}
          </h2>
          <p className="text-base md:text-lg mb-8" style={{ opacity: 0.7 }}>
            {current?.artists}
          </p>

          {/* Scrubber */}
          <label className="sr-only" htmlFor="seek">
            Seek within track
          </label>
          <input
            id="seek"
            type="range"
            min={0}
            max={scrubMax || 1}
            value={shownPos}
            disabled={!ready}
            onChange={(e) => setScrubValue(Number(e.target.value))}
            onPointerUp={(e) => commitSeek(Number(e.currentTarget.value))}
            onKeyUp={(e) => commitSeek(Number(e.currentTarget.value))}
            onBlur={() => setScrubValue(null)}
            className="music-seek"
            style={{ "--pct": `${playedPct}%` } as React.CSSProperties}
          />

          <div className="flex justify-between text-xs tabular-nums mt-2" style={{ opacity: 0.7 }}>
            <span>{formatTime(position)}</span>
            <span>{formatTime(scrubMax)}</span>
          </div>

          {/* Transport */}
          <div className="flex items-center gap-4 mt-7">
            <TransportButton label="Previous track" onClick={() => select(index - 1)}>
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            </TransportButton>

            <button
              onClick={() => controllerRef.current?.togglePlay()}
              disabled={!ready}
              aria-label={isPaused ? "Play" : "Pause"}
              className="flex items-center justify-center w-16 h-16 rounded-full transition-transform hover:scale-110 active:scale-95 disabled:opacity-40"
              style={{ background: "var(--ink)", color: "var(--ground)" }}
            >
              {isPaused ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M6 5h4v14H6zm8 0h4v14h-4z" />
                </svg>
              )}
            </button>

            <TransportButton label="Next track" onClick={() => select(index + 1)}>
              <path d="M16 6h2v12h-2zM6 18l8.5-6L6 6z" />
            </TransportButton>

            <p className="ml-2 text-xs leading-snug max-w-[16rem]" style={{ opacity: 0.6 }}>
              {isPreview
                ? "30-second preview. Sign in to Spotify for the full track."
                : "Full tracks play if you're signed in to Spotify."}
            </p>
          </div>

          {/* The embed is the licensed audio engine and carries Spotify's
              attribution, so it stays on the page — just out of the way. */}
          <div className="mt-8 max-w-md opacity-70 hover:opacity-100 transition-opacity">
            <div ref={embedRef} />
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* Track list — giant numerals, rows invert on hover and when live   */}
      {/* ---------------------------------------------------------------- */}
      <ol>
        {tracks.map((t, i) => {
          const active = i === index;
          const playing = active && !isPaused;
          return (
            <li key={t.id} style={{ borderBottom: "1px solid var(--ink)" }}>
              <button
                onClick={() => onRowClick(i)}
                data-active={active}
                aria-label={playing ? `Pause ${t.name}` : `Play ${t.name}`}
                className="track-row w-full text-left flex items-center gap-4 md:gap-7 px-6 md:px-8 py-4 md:py-5"
              >
                {/* Numeral */}
                <span
                  className="font-display leading-none shrink-0 tabular-nums w-[2.2ch]"
                  style={{
                    fontSize: "clamp(2rem, 6vw, 4.5rem)",
                    opacity: active ? 1 : 0.35,
                  }}
                >
                  {i + 1}
                </span>

                {/* Equaliser / sleeve */}
                <span
                  className="relative shrink-0 w-12 h-12 md:w-16 md:h-16 overflow-hidden flex items-center justify-center"
                  style={{ outline: "1px solid currentColor" }}
                >
                  {playing ? (
                    <EqualiserBars />
                  ) : (
                    t.albumArt && (
                      <Image src={t.albumArt} alt="" fill className="object-cover" sizes="64px" />
                    )
                  )}
                </span>

                {/* Title + artist */}
                <span className="flex-1 min-w-0">
                  <span className="flex items-center gap-2">
                    <span
                      className="font-display truncate leading-tight"
                      style={{ fontSize: "clamp(1rem, 2.4vw, 1.75rem)" }}
                    >
                      {t.name}
                    </span>
                    {t.explicit && <Tag>E</Tag>}
                    {isNew(t.addedAt) && <Tag>New</Tag>}
                  </span>
                  <span className="block truncate text-xs md:text-sm mt-1" style={{ opacity: 0.7 }}>
                    {t.artists}
                    <span className="hidden md:inline">
                      {" · "}
                      {t.album}
                      {releaseYear(t.releaseDate) && ` (${releaseYear(t.releaseDate)})`}
                    </span>
                  </span>
                </span>

                <span className="shrink-0 text-xs md:text-sm tabular-nums" style={{ opacity: 0.7 }}>
                  {formatTime(t.durationMs)}
                </span>
              </button>
            </li>
          );
        })}
      </ol>

      {/* Footer */}
      <div className="px-6 md:px-8 py-10 flex flex-wrap items-center justify-between gap-5">
        <p className="text-xs" style={{ opacity: 0.6 }}>
          Track data from the Spotify Web API · refreshed every 6 hours
        </p>
        <a
          href={playlist.url || PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium transition-transform hover:-translate-y-0.5"
          style={{ background: "var(--ink)", color: "var(--ground)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
          </svg>
          Follow on Spotify
        </a>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.25em] mb-1" style={{ opacity: 0.65 }}>
        {label}
      </p>
      <p className="font-display leading-none" style={{ fontSize: "clamp(1.75rem, 5vw, 3rem)" }}>
        {value}
      </p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="shrink-0 text-[10px] uppercase tracking-wider px-1.5 py-0.5 leading-none"
      style={{ border: "1px solid currentColor", opacity: 0.75 }}
    >
      {children}
    </span>
  );
}

function TransportButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="p-2 transition-transform hover:scale-125 active:scale-95"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
        {children}
      </svg>
    </button>
  );
}

/** Three bars that bounce while a row is playing. */
function EqualiserBars() {
  return (
    <span className="relative flex items-end gap-[3px] h-6" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="equaliser-bar w-[4px]"
          style={{ background: "currentColor", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  );
}
