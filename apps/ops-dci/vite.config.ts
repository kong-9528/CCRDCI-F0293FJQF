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

    /** 系统管理子菜单：邀请码 → 业务接口 → 日志 */
    const reorderSystemChildren = (children: any[]): any[] => {
      const desired = ["invitationCode", "busPort", "log"];
      const result: any[] = [];
      const used = new Set<any>();
      for (const p of desired) {
        const found = children.find(
          (c) =>
            String(c.path) === p || String(c.name).toLowerCase() === p.toLowerCase(),
        );
        if (found) {
          result.push(found);
          used.add(found);
        }
      }
      for (const c of children) {
        if (!used.has(c)) result.push(c);
      }
      return result;
    };

    /** 系统管理放到侧栏最后 */
    const reorderTop = (nodes: any[]): any[] => {
      const list = [...(nodes || [])];
      const sysIdx = list.findIndex(
        (n) => n.path === "/system" || n.name === "System",
      );
      if (sysIdx >= 0) {
        const [sys] = list.splice(sysIdx, 1);
        if (Array.isArray(sys.children)) {
          sys.children = reorderSystemChildren(sys.children);
        }
        list.push(sys);
      }
      return list;
    };

    const renameMenus = (nodes: any[]): any[] =>
      (nodes || []).map((n) => {
        const next = { ...n, meta: n.meta ? { ...n.meta } : {} };
        if (next.meta.title === "注册中心管理") next.meta.title = "机构管理";
        const name = String(n.name || "");
        const p = String(n.path || "");
        if (
          name === "Pending" ||
          name === "My" ||
          name === "All" ||
          p === "pending" ||
          p === "my" ||
          p === "all"
        ) {
          next.meta.noCache = true;
        }
        if (n.children) next.children = renameMenus(n.children);
        return next;
      });

    body.data = renameMenus(reorderTop(filterNodes(body.data)));
  }
  if (body.success === false || (body.code !== 200 && body.code !== 1000000)) {
    return null;
  }
  return body;
}

function findRegOrgById(id: string) {
  const store = loadStore() as Record<string, any>;
  const sid = String(id);
  for (const key of Object.keys(store)) {
    if (!/regorg/i.test(key)) continue;
    const body = store[key];
    const rows = (body && (body.rows || body.data)) || [];
    if (!Array.isArray(rows)) continue;
    const hit = rows.find((r: any) => String(r.id) === sid);
    if (hit) return JSON.parse(JSON.stringify(hit));
  }
  return null;
}

function mockRegOrgVo(id: string) {
  const row = findRegOrgById(id);
  if (row) return row;
  return {
    id: String(id || "demo"),
    orgName: "演示机构",
    orgTypeCode: "NRPT",
    orgTypeName: "内容平台",
    orgCode: "DEM",
    creditCode: "91110000MA01234567",
    accessKey: "demo-ak",
    accessSecret: "demo-sk",
    dataEncrypKey: "demo-dek",
    apiPermissions:
      '[{"interfaceId":"2080587923100037121","startDate":"2026-01-01"},{"interfaceId":"2080588010370920449","startDate":"2026-01-01"},{"interfaceId":"2080588682629771266","startDate":"2026-01-01"},{"interfaceId":"2080588786392657922","startDate":"2026-01-01"}]',
    status: "0",
    auditStatus: "1",
    contractStartDate: "2026-01-01 00:00:00",
    contractEndDate: "2027-12-31 00:00:00",
    contactPerson: "演示联系人",
    contactPhone: "13800138000",
    contactEmail: "demo@example.com",
    orgNamePy: "ysjg",
    orgAddress: "北京市朝阳区演示路 1 号",
    cooperationField: "版权服务",
    contractFiles: null,
    linkName: "演示联系人",
    linkPhone: "13800138000",
    linkEmail: "demo@example.com",
    loginUsername: "demoorg",
    loginPhone: "13800138000",
    rcxType: "R",
    invitationCode: "DEMOCODE",
    changeStatus: "0",
    auditType: "1",
  };
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
        const pathname = parsed.pathname;
        const apiRel = pathname.includes("/api/v1/dciManage")
          ? pathname.slice(pathname.indexOf("/api/v1/dciManage") + "/api/v1/dciManage".length) || "/"
          : pathname;

        // 机构配置详情 / 保存：本地 mock
        const voMatch = apiRel.match(/^\/dci\/regorg\/([^/]+)\/vo$/);
        if (method === "GET" && voMatch) {
          const payload = {
            code: 200,
            msg: "操作成功",
            data: mockRegOrgVo(decodeURIComponent(voMatch[1])),
          };
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          res.end(JSON.stringify(payload));
          return;
        }
        const detailMatch = apiRel.match(/^\/dci\/regorg\/([^/]+)$/);
        if (
          method === "GET" &&
          detailMatch &&
          detailMatch[1] !== "list" &&
          detailMatch[1] !== "myList" &&
          detailMatch[1] !== "pendingCount" &&
          detailMatch[1] !== "getRegOrgAccessInfo"
        ) {
          const payload = {
            code: 200,
            msg: "操作成功",
            data: mockRegOrgVo(decodeURIComponent(detailMatch[1])),
          };
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          res.end(JSON.stringify(payload));
          return;
        }
        if (method === "PUT" && apiRel === "/dci/regorg/editDciRegOrg") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          res.end(JSON.stringify({ code: 200, msg: "操作成功", data: null }));
          return;
        }
        if (method === "GET" && apiRel === "/dci/regorg/getRegOrgAccessInfo") {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json;charset=utf-8");
          res.end(
            JSON.stringify({
              code: 200,
              msg: "操作成功",
              data: {
                accessSecret: `mock-sk-${Date.now().toString(36)}`,
                dataEncrypKey: `mock-dek-${Date.now().toString(36)}`,
              },
            }),
          );
          return;
        }

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
