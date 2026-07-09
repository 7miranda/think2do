import type { NextConfig } from "next";

const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  ...(isGithubPages
    ? {
        output: "export" as const,
        basePath: "/think2do",
        assetPrefix: "/think2do/",
        images: {
          unoptimized: true,
        },
      }
    : {}),
  turbopack: {
    root: process.cwd(),
  },
  ...(process.env.CONF_DIST ? { distDir: process.env.CONF_DIST } : {}),
};

export default nextConfig;
