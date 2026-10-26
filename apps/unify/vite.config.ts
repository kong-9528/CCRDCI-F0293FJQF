import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 3010,
    fs: {
      // 复用 apps/ops 的 ops.css / dci-theme.css
      allow: [path.resolve(__dirname, "../..")],
    },
  },
});
