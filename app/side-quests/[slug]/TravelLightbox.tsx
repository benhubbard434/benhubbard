"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { CaretLeft, CaretRight, X } from "@phosphor-icons/react";
import type { Photo } from "@/lib/travel";

/**
 * A city's photo album, full screen. The photos sit in a row that scrolls
 * sideways and snaps one to a screen, so a swipe, a trackpad, the arrow
 * buttons and the arrow keys all move through them the same way.
 */
export default function TravelLightbox({
  title,
  photos,
  onClose,
}: {
  title: string;
  photos: Photo[];
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Hold the page still behind it, start on the close button, and hand focus
  // back to whatever opened it on the way out.
  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus();
    };
  }, []);

  const go = (to: number) => {
    const track = trackRef.current;
    if (!track) return;
    const i = Math.max(0, Math.min(photos.length - 1, to));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    track.scrollTo({ left: i * track.clientWidth, behavior: reduce ? "auto" : "smooth" });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(index + 1);
      else if (e.key === "ArrowLeft") go(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  // Whichever photo has snapped into place is the current one
  const onScroll = () => {
    const track = trackRef.current;
    if (!track) return;
    setIndex(Math.round(track.scrollLeft / track.clientWidth));
  };

  const photo = photos[index];

  return (
    <div
      className="travel-lightbox fixed inset-0 z-[110] flex flex-col text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`Photos from ${title}`}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
        <p className="font-display text-h4 uppercase">{title}</p>
        <div className="flex items-center gap-4">
          <p className="text-sm tabular-nums opacity-70" aria-live="polite">
            {index + 1} / {photos.length}
          </p>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="travel-lightbox-button flex h-10 w-10 items-center justify-center rounded-lg"
            aria-label="Close photos"
          >
            <X size={20} weight="bold" />
          </button>
        </div>
      </div>

      <div className="relative min-h-0 flex-1">
        <div
          ref={trackRef}
          onScroll={onScroll}
          className="travel-lightbox-track flex h-full overflow-x-auto"
          tabIndex={-1}
        >
          {photos.map((p, i) => (
            <figure key={p.src} className="relative h-full w-full shrink-0 snap-center">
              <Image
                src={p.src}
                alt={p.alt}
                fill
                sizes="100vw"
                className="object-contain p-2 md:p-8"
                // The first is on screen straight away; the rest can wait
                priority={i === 0}
              />
            </figure>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              disabled={index === 0}
              className="travel-lightbox-button absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg md:left-6"
              aria-label="Previous photo"
            >
              <CaretLeft size={22} weight="bold" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              disabled={index === photos.length - 1}
              className="travel-lightbox-button absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg md:right-6"
              aria-label="Next photo"
            >
              <CaretRight size={22} weight="bold" />
            </button>
          </>
        )}
      </div>

      <p className="font-subhead min-h-[3.5rem] px-4 py-4 text-center text-h4 md:px-8">{photo?.caption}</p>
    </div>
  );
}
