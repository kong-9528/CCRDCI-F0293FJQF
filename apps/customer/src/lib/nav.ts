export type NavItem = {
  to: string;
  label: string;
  ready?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const CUSTOMER_NAV: NavGroup[] = [
  {
    title: "总览",
    items: [{ to: "/", label: "控制台", ready: true }],
  },
  {
    title: "版权核验服务",
    items: [
      { to: "/verify/dci", label: "DCI核验", ready: true },
      { to: "/verify/info", label: "版权信息核验", ready: false },
      { to: "/verify/certificate", label: "版权证书核验", ready: false },
    ],
  },
  {
    title: "智能审核服务",
    items: [{ to: "/audit", label: "智能审核服务", ready: false }],
  },
  {
    title: "开放能力",
    items: [
      { to: "/api-docs", label: "API 文档", ready: false },
      { to: "/keys", label: "密钥管理", ready: false },
    ],
  },
  {
    title: "数据与报表",
    items: [
      { to: "/analytics", label: "数据分析", ready: false },
      { to: "/reports/supervise", label: "上级监管报表", ready: false },
      { to: "/reports/subscribe", label: "订阅报表下载", ready: false },
    ],
  },
  {
    title: "账号中心",
    items: [
      { to: "/account/org", label: "机构信息", ready: false },
      { to: "/account/services", label: "服务列表", ready: false },
      { to: "/account/contracts", label: "合同信息", ready: false },
    ],
  },
  {
    title: "支持",
    items: [{ to: "/help", label: "帮助中心", ready: false }],
  },
];

export function findNavLabel(pathname: string): string {
  if (pathname === "/") return "控制台";
  for (const group of CUSTOMER_NAV) {
    for (const item of group.items) {
      if (item.to === "/") continue;
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  return "控制台";
}
