import type { NextConfig } from "next";

// The secret santa is private: keep it out of search engines and caches, and
// don't tell other sites where a visitor came from.
const privateHeaders = [
  { key: "X-Robots-Tag", value: "noindex, nofollow" },
  { key: "Referrer-Policy", value: "no-referrer" },
  { key: "Cache-Control", value: "no-store" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: "/secret-santa", headers: privateHeaders },
      { source: "/secret-santa/:path*", headers: privateHeaders },
      { source: "/api/secret-santa/:path*", headers: privateHeaders },
    ];
  },
  experimental: {
    // Netlify restores .next/cache between deploys, and Turbopack's cache has
    // shipped a stale globals.css from it (new markup, old styles). Build
    // from scratch every time instead.
    turbopackFileSystemCacheForBuild: false,
    // The dev server does the same: edits to globals.css keep failing to
    // reach the page until .next is cleared. Slower cold starts, but current.
    turbopackFileSystemCacheForDev: false,
  },
  images: {
    remotePatterns: [
      // Spotify album art / playlist covers
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "*.spotifycdn.com" },
      { protocol: "https", hostname: "image-cdn-fa.spotifycdn.com" },
      // YouTube thumbnails (the poster for embedded videos)
      { protocol: "https", hostname: "i.ytimg.com" },
      // Supabase storage (if you upload images there)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
