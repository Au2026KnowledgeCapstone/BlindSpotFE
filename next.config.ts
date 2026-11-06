import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers() {
    return ["/login", "/reset-password"].map((source) => ({
      source,
      headers: [{ key: "Referrer-Policy", value: "no-referrer" }],
    }));
  },
  experimental: {
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
