export type NavItem = {
  to: string;
  label: string;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** 与 console-prototype.html 侧边栏一致 */
export const CUSTOMER_NAV: NavGroup[] = [
  {
    title: "概览",
    items: [{ to: "/", label: "控制台首页" }],
  },
  {
    title: "版权核验服务",
    items: [
      { to: "/verify/dci", label: "DCI核验" },
      { to: "/verify/info", label: "版权信息核验" },
      { to: "/verify/certificate", label: "版权证书核验" },
    ],
  },
  {
    title: "智能辅助审核服务",
    items: [
      { to: "/review/safety", label: "内容安全审核" },
      { to: "/review/duplicate", label: "作品登记查重" },
      { to: "/review/infringement", label: "疑似侵权审核" },
    ],
  },
  {
    title: "设置",
    items: [
      { to: "/keys", label: "密钥管理" },
      { to: "/account", label: "账号中心" },
      { to: "/api-docs", label: "API文档" },
      { to: "/help", label: "帮助中心" },
    ],
  },
];

const NAV_LABELS: Record<string, string> = {
  "/": "控制台首页",
  "/verify/dci": "DCI核验",
  "/verify/info": "版权信息核验",
  "/verify/certificate": "版权证书核验",
  "/review/safety": "内容安全审核",
  "/review/duplicate": "作品登记查重",
  "/review/infringement": "疑似侵权审核",
  "/keys": "密钥管理",
  "/account": "账号中心",
  "/api-docs": "API文档",
  "/help": "帮助中心",
};

export function findNavLabel(pathname: string): string {
  if (pathname === "/") return NAV_LABELS["/"];
  if (pathname.startsWith("/api-docs")) return "API文档";
  for (const [path, label] of Object.entries(NAV_LABELS)) {
    if (path === "/") continue;
    if (pathname === path || pathname.startsWith(`${path}/`)) return label;
  }
  return "控制台首页";
}
