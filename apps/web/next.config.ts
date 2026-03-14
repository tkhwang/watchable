import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tkbetter/shared'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
