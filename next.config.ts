import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Separate output for verification when Windows locks an older build cache.
  distDir:
    process.env.TEATCH_ISOLATED_BUILD === 'true' ? '.next-verify' : '.next',
  cleanDistDir: process.env.TEATCH_ISOLATED_BUILD !== 'true',
  experimental:
    process.env.TEATCH_ISOLATED_BUILD === 'true'
      ? { cpus: 1, webpackBuildWorker: false }
      : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
