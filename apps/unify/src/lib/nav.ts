export type NavItem = { to: string; label: string; end?: boolean };

export type NavGroup = {
  key: string;
  /** 无 title 时为顶层单链（如首页） */
  title?: string;
  icon: string;
  items: NavItem[];
};

export const UNIFY_NAV: NavGroup[] = [
  {
    key: "home",
    icon: "home",
    items: [{ to: "/", label: "首页", end: true }],
  },
  {
    key: "audit",
    title: "智能辅助审核安全风险监控",
    icon: "audit",
    items: [{ to: "/audit/tasks", label: "智能辅助审核任务列表" }],
  },
  {
    key: "lists",
    title: "名单管理",
    icon: "lists",
    items: [
      { to: "/lists/user-blacklist", label: "用户黑名单管理" },
      { to: "/lists/ip-whitelist", label: "IP白名单管理" },
      { to: "/lists/sensitive-words", label: "敏感词库" },
    ],
  },
];

export function findNavGroupKey(pathname: string): string | null {
  for (const g of UNIFY_NAV) {
    for (const item of g.items) {
      if (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return g.key;
      }
    }
  }
  return null;
}

export function findNavLabel(pathname: string) {
  for (const g of UNIFY_NAV) {
    for (const item of g.items) {
      if (item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  return "Unify";
}
