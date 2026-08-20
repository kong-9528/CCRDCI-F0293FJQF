export type NavItem = {
  to: string;
  label: string;
  /** 未实现页仅占位 */
  ready?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const OPS_NAV: NavGroup[] = [
  {
    title: "总览",
    items: [{ to: "/dashboard", label: "仪表盘", ready: false }],
  },
  {
    title: "客户管理",
    items: [
      { to: "/customers", label: "客户账号列表", ready: true },
      { to: "/customer-services", label: "客户产品服务", ready: true },
    ],
  },
  {
    title: "产品管理",
    items: [{ to: "/products", label: "产品管理", ready: true }],
  },
  {
    title: "运营统计",
    items: [
      { to: "/stats/customers", label: "客户使用统计", ready: false },
      { to: "/stats/products", label: "产品使用统计", ready: false },
    ],
  },
];

export function findNavLabel(pathname: string): string {
  if (pathname === "/customers/new") return "新增客户账号";
  if (/^\/customers\/[^/]+\/edit$/.test(pathname)) return "编辑客户";
  if (/^\/customers\/[^/]+$/.test(pathname)) return "客户详情";
  for (const group of OPS_NAV) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  return "运营后台";
}
