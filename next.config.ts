import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  async rewrites() {
    return [
      // /api/auth/login -> http://api:8080/auth/login
      { source: '/api/:path*', destination: 'http://api:8080/:path*' },
    ];
  },
};

export default nextConfig;
