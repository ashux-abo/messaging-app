import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['convex'],
  outputFileTracingIncludes: {
    '/': ['./proxy.ts'],
  },
};

export default nextConfig;