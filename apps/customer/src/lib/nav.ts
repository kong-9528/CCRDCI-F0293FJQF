import type { NavIconId } from "@/components/icons/NavIcons";

export type NavItem = {
  to: string;
  label: string;
  icon: NavIconId;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

/** 与 console-prototype.html 侧边栏一致 */
export const CUSTOMER_NAV: NavGroup[] = [
  {
    title: "概览",
    items: [{ to: "/", label: "工作台", icon: "dashboard" }],
  },
  {
    title: "版权核验服务",
    items: [
      { to: "/verify/dci", label: "DCI核验", icon: "dci" },
      { to: "/verify/info", label: "版权信息核验", icon: "info" },
      { to: "/verify/certificate", label: "版权证书核验", icon: "cert" },
    ],
  },
  {
    title: "智能辅助审核服务",
    items: [
      { to: "/review/safety", label: "内容安全审核", icon: "safety" },
      { to: "/review/duplicate", label: "作品登记查重", icon: "duplicate" },
      { to: "/review/infringement", label: "疑似侵权审核", icon: "infringement" },
    ],
  },
  {
    title: "设置",
    items: [
      { to: "/keys", label: "密钥管理", icon: "keys" },
      { to: "/account", label: "账号中心", icon: "account" },
      { to: "/api-docs", label: "API文档", icon: "api-docs" },
      { to: "/help", label: "帮助中心", icon: "help" },
    ],
  },
];

const NAV_LABELS: Record<string, string> = {
  "/": "工作台",
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
  return "工作台";
}
