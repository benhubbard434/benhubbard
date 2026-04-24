"use client";

import { useState } from "react";
import Link from "next/link";
import MenuOverlay from "./MenuOverlay";

const socialLinks = [
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/YOUR_HANDLE",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: "Bluesky",
    href: "https://bsky.app/profile/YOUR_HANDLE",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 01-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.479 0-.689-.139-1.861-.902-2.203-.659-.299-1.664-.621-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8z" />
      </svg>
    ),
  },
  {
    label: "Strava",
    href: "https://www.strava.com/athletes/938645",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.599h4.172L10.463 0l-7 13.828h4.169" />
      </svg>
    ),
  },
  {
    label: "Spotify",
    href: "https://open.spotify.com/user/YOUR_HANDLE",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
    ),
  },
];

export default function BottomNav() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 h-[60px] bg-white border-t border-gray-200 flex items-center px-6 z-50">
        {/* Logo */}
        <div className="flex items-center gap-1 shrink-0">
          <svg width="36" height="20" viewBox="0 0 36 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="#111" strokeWidth="2" />
            <circle cx="26" cy="10" r="9" stroke="#111" strokeWidth="2" />
          </svg>
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-4 shrink-0" />

        {/* Name */}
        <Link href="/" className="font-inktrap text-sm tracking-wide shrink-0">
          BEN HUBBARD
        </Link>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-4 shrink-0" />

        {/* Tagline */}
        <span className="text-sm text-gray-600 hidden sm:block truncate">
          Customer Success leader, runner/part time triathlete &amp; maker.
        </span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-4 shrink-0 hidden sm:block" />

        {/* Social icons */}
        <div className="items-center gap-4 hidden sm:flex shrink-0">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={link.label}
              className="text-gray-700 hover:text-black transition-colors"
            >
              {link.icon}
            </a>
          ))}
        </div>

        {/* Divider */}
        <div className="w-px h-5 bg-gray-300 mx-4 shrink-0 hidden sm:block" />

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          aria-label="Open menu"
          className="flex flex-col gap-1.5 shrink-0 p-1"
        >
          <span className="block w-5 h-0.5 bg-black" />
          <span className="block w-5 h-0.5 bg-black" />
          <span className="block w-5 h-0.5 bg-black" />
        </button>
      </nav>

      <MenuOverlay open={menuOpen} onClose={() => setMenuOpen(false)} socialLinks={socialLinks} />
    </>
  );
}
