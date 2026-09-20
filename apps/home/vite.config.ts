import { defineConfig } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** Serve the mirrored DCI管理中心 portal (static Vue build) */
export default defineConfig({
  root: path.join(__dirname, "mirror"),
  publicDir: false,
  server: {
    port: 3020,
    strictPort: true,
    // SPA history fallback
    appType: "spa",
  },
  preview: {
    port: 3020,
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
