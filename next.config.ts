import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    serverComponentsExternalPackages: ['convex'],
  },
  outputFileTracingIncludes: {
    '/': ['./proxy.ts'],
  },
};

export default nextConfig;