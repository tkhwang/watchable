import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@life-logs/domain'],
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
