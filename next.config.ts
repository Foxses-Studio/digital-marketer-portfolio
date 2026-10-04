import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CMS reads are cached with `use cache` + cache tags and refreshed with
  // `updateTag` from admin Server Actions.
  cacheComponents: true,
  poweredByHeader: false,
};

export default nextConfig;
