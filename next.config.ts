import type { NextConfig } from "next";

/** Live under aiyla.co.uk/case-studies/renaker-life */
const BASE = "/case-studies/renaker-life";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["three"],
  output: "export",
  basePath: BASE,
  assetPrefix: BASE,
  images: { unoptimized: true },
};

export default nextConfig;
