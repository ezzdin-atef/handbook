import type { NextConfig } from "next";

const isBuild = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  // Static export only for `next build`. In `next dev`, export mode turns unknown
  // URLs into a 500 ("missing param in generateStaticParams") instead of the 404 page.
  output: isBuild ? "export" : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
