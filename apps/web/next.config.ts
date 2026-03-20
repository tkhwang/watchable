import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@tkbetter/domain'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
