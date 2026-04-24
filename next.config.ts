import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Spotify album art
      { protocol: "https", hostname: "i.scdn.co" },
      { protocol: "https", hostname: "mosaic.scdn.co" },
      // Supabase storage (if you upload images there)
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
