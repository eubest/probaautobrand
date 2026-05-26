import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "web-scraping.dev",
        protocol: "https",
      },
      {
        hostname: "www.web-scraping.dev",
        protocol: "https",
      },
    ],
  },
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
