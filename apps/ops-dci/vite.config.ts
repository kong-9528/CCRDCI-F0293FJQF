import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Serve the mirrored DCI管理运营后台 (static Vue build) */
export default defineConfig({
  root: path.join(__dirname, "mirror"),
  envDir: __dirname,
  publicDir: false,
  server: {
    port: 3030,
    strictPort: true,
    appType: "spa" as const,
  },
  preview: {
    port: 3030,
    strictPort: true,
  },
  build: {
    outDir: path.join(__dirname, "dist"),
    emptyOutDir: true,
    rollupOptions: {
      input: path.join(__dirname, "mirror", "index.html"),
    },
    copyPublicDir: false,
  },
});
