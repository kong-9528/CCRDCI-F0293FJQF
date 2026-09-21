import { defineConfig, loadEnv, type Plugin } from "vite";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const STORE_PATH = path.join(__dirname, "mirror", "static", "js", "ops-mock-store.json");

function loadStore(): Record<string, unknown> {
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function apiLookup(method: string, urlPath: string, search: string) {
  const store = loadStore();
  const prefix = "/api/v1/dciManage";
  let p = urlPath;
  const i = p.indexOf(prefix);
  if (i >= 0) p = p.slice(i + prefix.length) || "/";
  const m = method.toUpperCase();
  const keys = [
    `${m} ${prefix}${p}${search}`,
    `${m} ${prefix}${p}`,
    `${m} ${p}${search}`,
    `${m} ${p}`,
  ];
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(store, k)) return store[k];
  }
  return null;
}

function sanitize(pathName: string, body: any) {
  if (!body || typeof body !== "object") return body;
  body = JSON.parse(JSON.stringify(body));
  if (pathName.includes("/getInfo") && body.data) {
    body.data.isPasswordExpired = false;
    body.data.isDefaultModifyPwd = false;
  }
  if (pathName.includes("/getRouters") && Array.isArray(body.data)) {
    const filterNodes = (nodes: any[]): any[] =>
      (nodes || [])
        .filter((n) => {
          const p = String(n.path || "");
          const name = String(n.name || "");
          if (p === "user" || p === "role") return false;
          if (name === "User" || name === "Role") return false;
          return true;
        })
        .map((n) => ({
          ...n,
          children: n.children ? filterNodes(n.children) : n.children,
        }));
    body.data = filterNodes(body.data);
  }
  if (body.success === false || (body.code !== 200 && body.code !== 1000000)) {
    return null;
  }
  return body;
}

function fallback(urlPath: string) {
  if (/list|page|query|Tree/i.test(urlPath)) {
    return {
      code: 1000000,
      msg: "成功",
      rows: [],
      total: 0,
      data: [],
      success: true,
    };
  }
  return { code: 1000000, msg: "成功", data: null, success: true };
}

/** Rewrite leftover /dci-manage/* + answer /api/* from mock store (no real backend).
 *  Inject VITE_PUBLIC_URL / VITE_SSO_URL into index.html.
 */
function offlineMockPlugin(publicUrl: string, ssoUrl: string): Plugin {
  const publicSnippet = `window.__OPS_DCI_PUBLIC_URL__ = ${JSON.stringify(publicUrl)};`;
  const ssoSnippet = `window.__OPS_DCI_SSO_URL__ = ${JSON.stringify(ssoUrl)};`;
  return {
    name: "ops-dci-offline-mock",
    transformIndexHtml(html) {
      let next = html;
      if (next.includes("window.__OPS_DCI_PUBLIC_URL__")) {
        next = next.replace(
          /window\.__OPS_DCI_PUBLIC_URL__\s*=\s*[^;]+;/,
          publicSnippet,
        );
      }
      if (next.includes("window.__OPS_DCI_SSO_URL__")) {
        next = next.replace(/window\.__OPS_DCI_SSO_URL__\s*=\s*[^;]+;/, ssoSnippet);
      }
      return next;
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/dci-manage/")) {
          req.url = req.url.slice("/dci-manage".length) || "/";
        } else if (req.url === "/dci-manage") {
          req.url = "/";
        }

        const raw = req.url || "";
        if (!raw.startsWith("/api/")) {
          next();
          return;
        }

        let parsed: URL;
        try {
          parsed = new URL(raw, "http://127.0.0.1");
        } catch {
          next();
          return;
        }

        const method = (req.method || "GET").toUpperCase();
        let body = apiLookup(method, parsed.pathname, parsed.search);
        body = sanitize(parsed.pathname, body);
        if (!body) body = fallback(parsed.pathname);

        // Special-cases that client mock also handles
        if (parsed.pathname.endsWith("/login") && method === "POST") {
          body = {
            code: 1000000,
            msg: "成功",
            data: { token: "mock-root" },
            success: true,
          };
        }
        if (parsed.pathname.endsWith("/captchaImage")) {
          body = {
            code: 200,
            msg: "操作成功",
            data: { captchaEnabled: false, uuid: "mock-captcha-uuid", img: "" },
            captchaEnabled: false,
            uuid: "mock-captcha-uuid",
            img: "",
          };
        }
        if (parsed.pathname.endsWith("/logout")) {
          body = { code: 1000000, msg: "成功", data: null, success: true };
        }

        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json;charset=utf-8");
        res.end(JSON.stringify(body));
      });
    },
  };
}

/** Serve the mirrored DCI管理运营后台 (static Vue build) */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, __dirname, "VITE_");
  const publicUrl = (env.VITE_PUBLIC_URL || "http://localhost:3030").replace(/\/$/, "");
  const ssoUrl = (env.VITE_SSO_URL || "http://localhost:3003").replace(/\/$/, "");
  return {
    root: path.join(__dirname, "mirror"),
    envDir: __dirname,
    publicDir: false,
    plugins: [offlineMockPlugin(publicUrl, ssoUrl)],
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
  };
});
