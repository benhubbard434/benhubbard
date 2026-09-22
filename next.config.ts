import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Netlify restores .next/cache between deploys, and Turbopack's cache has
    // shipped a stale globals.css from it (new markup, old styles). Build
    // from scratch every time instead.
    turbopackFileSystemCacheForBuild: false,
  },
  images: {
    remotePatterns: [
      // Spotify album art / playlist covers
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      { protocol: "https", hostname: "*.spotifycdn.com" },
      { protocol: "https", hostname: "image-cdn-fa.spotifycdn.com" },
      // Supabase storage (if you upload images there)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
