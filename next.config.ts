import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/hermes-terminal',
  images: { unoptimized: true },
};

export default nextConfig;
