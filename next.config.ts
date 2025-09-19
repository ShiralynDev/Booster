import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Either use domains:
    // domains: ["images.unsplash.com", "image.mux.com", "assets.mux.com"],

    // …or remotePatterns (more flexible/recommended):
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "image.mux.com" },   // Mux poster/thumbnail
      { protocol: "https", hostname: "assets.mux.com" },  // (optional) storyboards, etc.
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
