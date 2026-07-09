import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  ...(process.env.CONF_DIST ? { distDir: process.env.CONF_DIST } : {}),
};

export default nextConfig;
