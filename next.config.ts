import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
  },
  // In Next.js 16, Turbopack is stabilized and its config moves to the top level.
  // Adding an empty turbopack object silences the build error when custom webpack
  // is detected from other plugins.
  turbopack: {},
};

const withPWA = withPWAInit({
  dest: "public",
  register: true,
});

// Avoid wrapping with PWA in dev to keep Turbopack happy
export default isDev ? nextConfig : withPWA(nextConfig);
