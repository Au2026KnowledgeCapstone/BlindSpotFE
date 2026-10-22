import type { NextConfig } from "next";

console.log(
  "[DEBUG build-time env] NEXT_PUBLIC_SUPABASE_URL=",
  JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_URL),
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=",
  JSON.stringify(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)
);

const nextConfig: NextConfig = {
  experimental: {
    turbopackFileSystemCacheForBuild: false,
  },
};

export default nextConfig;
