import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@ctp/styles"],
  output: "export",
  trailingSlash: true,
  outputFileTracingRoot: path.join(__dirname, "../.."),
  // 低内存环境下 PackFileCacheStrategy 易触发 Array buffer allocation failed
  webpack: (config, { dev }) => {
    if (dev) {
      config.cache = { type: "memory" };
    }
    return config;
  },
};

export default nextConfig;
