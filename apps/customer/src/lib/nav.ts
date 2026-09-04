import type { NavIconId } from "@/components/icons/NavIcons";

export type NavItem = {
  to: string;
  label: string;
  icon: NavIconId;
  /** 匹配子路径时也视为选中（如审核入口） */
  matchPrefix?: string;
};

/** 顶栏主导航（原侧栏模块 + API文档 / 帮助中心） */
export const CUSTOMER_NAV: NavItem[] = [
  { to: "/desk", label: "工作台", icon: "dashboard" },
  { to: "/verify/dci", label: "DCI核验", icon: "dci" },
  { to: "/verify/info", label: "版权登记信息核验", icon: "info" },
  { to: "/verify/certificate", label: "版权登记证书核验", icon: "cert" },
  {
    to: "/review/safety",
    label: "作品智能辅助审核",
    icon: "safety",
    matchPrefix: "/review",
  },
];

const NAV_LABELS: Record<string, string> = {
  "/desk": "工作台",
  "/dashboard": "数据概览",
  "/verify/dci": "DCI核验",
  "/verify/info": "版权登记信息核验",
  "/verify/certificate": "版权登记证书核验",
  "/review/safety": "作品智能辅助审核",
  "/review/duplicate": "作品智能辅助审核",
  "/review/infringement": "作品智能辅助审核",
  "/api": "API管理",
  "/api/keys": "API Keys",
  "/api/docs": "API文档",
  "/keys": "API Keys",
  "/account": "账号中心",
  "/account/password": "修改密码",
  "/api-docs": "API文档",
  "/help": "帮助中心",
  "/apply": "入驻申请",
};

export function findNavLabel(pathname: string): string {
  if (pathname === "/" || pathname === "/desk") return "工作台";
  if (pathname === "/api" || pathname === "/api/keys") return "API Keys";
  if (pathname.startsWith("/api/docs")) return "API文档";
  if (pathname.startsWith("/api-docs")) return "API文档";
  if (pathname === "/apply" || pathname.startsWith("/apply/")) return "入驻申请";
  if (pathname.startsWith("/review")) return "作品智能辅助审核";
  for (const [path, label] of Object.entries(NAV_LABELS)) {
    if (pathname === path || pathname.startsWith(`${path}/`)) return label;
  }
  return "工作台";
}

export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (item.matchPrefix) {
    return pathname === item.matchPrefix || pathname.startsWith(`${item.matchPrefix}/`);
  }
  if (item.to === "/desk") return pathname === "/" || pathname === "/desk";
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
}
