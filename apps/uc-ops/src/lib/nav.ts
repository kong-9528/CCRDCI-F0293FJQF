export type NavItem = { to: string; label: string; end?: boolean };

export type NavGroup = {
  key: string;
  /** 无 title 时为顶层单链（如首页） */
  title?: string;
  items: NavItem[];
};

export const UC_OPS_NAV: NavGroup[] = [
  {
    key: "home",
    items: [{ to: "/dashboard", label: "首页", end: true }],
  },
  {
    key: "users",
    title: "用户管理",
    items: [{ to: "/users", label: "全部用户" }],
  },
  {
    key: "security",
    title: "安全中心",
    items: [{ to: "/security/logs", label: "用户安全日志" }],
  },
  {
    key: "system",
    title: "系统",
    items: [{ to: "/system/op-logs", label: "操作日志" }],
  },
];

export function findNavGroupKey(pathname: string): string | null {
  for (const g of UC_OPS_NAV) {
    for (const item of g.items) {
      if (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return g.key;
      }
    }
  }
  if (pathname.startsWith("/users/")) return "users";
  return null;
}

export function findNavLabel(pathname: string) {
  for (const g of UC_OPS_NAV) {
    for (const item of g.items) {
      if (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  if (pathname.startsWith("/users/")) return "用户详情";
  return "C端用户中心运营后台";
}
