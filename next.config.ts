import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ['convex'],
  outputFileTracingIncludes: {
    '/': ['./src/proxy.ts'],
  },
};

export default nextConfig;