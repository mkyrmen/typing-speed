import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { dev }) => {
    // Disable Webpack filesystem caching in dev mode to avoid network drive (Z:) EPERM locks on trace/cache files
    if (dev) {
      config.cache = false;
    }
    return config;
  },
};

export default nextConfig;
