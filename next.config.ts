import type { NextConfig } from "next";

const isProduction = process.env.NODE_ENV === 'production';

const nextConfig: NextConfig = {
  output: 'export',
  ...(isProduction ? { basePath: '/lunaart-terminal' } : {}),
  images: { unoptimized: true },
};

export default nextConfig;
