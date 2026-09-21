import { defineConfig, loadEnv, type Plugin } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function customerUrlFrom(env: Record<string, string>) {
  return (env.VITE_CUSTOMER_URL || "http://localhost:3002").replace(/\/$/, "");
}

/** Inject VITE_CUSTOMER_URL (.env.local or the deploy platform) into index.html */
function injectCustomerUrl(customerUrl: string): Plugin {
  const snippet = `window.__DCI_CUSTOMER_URL__ = ${JSON.stringify(customerUrl)};`;
  return {
    name: "inject-dci-customer-url",
    transformIndexHtml(html) {
      if (html.includes("window.__DCI_CUSTOMER_URL__")) {
        return html.replace(
          /window\.__DCI_CUSTOMER_URL__\s*=\s*[^;]+;/,
          snippet,
        );
      }
      return html.replace(
        /<script src="\.\/static\/js\/dci-mock-auth\.js"><\/script>/,
        `<script>${snippet}</script>\n  <script src="./static/js/dci-mock-auth.js"></script>`,
      );
    },
  };
}

/** Serve the mirrored DCI管理中心 portal (static Vue build) */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "VITE_");
  const customerUrl = customerUrlFrom(env);
  return {
    root: path.join(__dirname, "mirror"),
    envDir: __dirname,
    publicDir: false,
    plugins: [injectCustomerUrl(customerUrl)],
    server: {
      port: 3020,
      strictPort: true,
      appType: "spa" as const,
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
  };
});
