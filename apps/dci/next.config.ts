import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, "../.."),
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
