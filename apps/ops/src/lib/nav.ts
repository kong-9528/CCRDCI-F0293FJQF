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
    items: [{ to: "/dashboard", label: "首页", ready: true }],
  },
  {
    title: "客户管理",
    items: [
      { to: "/customers", label: "客户账号列表", ready: true },
      { to: "/customer-services", label: "服务产品管理", ready: true },
    ],
  },
  {
    title: "产品管理",
    items: [{ to: "/products", label: "产品管理", ready: true }],
  },
  {
    title: "运营统计",
    items: [
      { to: "/stats/customers", label: "客户使用统计", ready: true },
      { to: "/stats/products", label: "产品使用统计", ready: true },
    ],
  },
  {
    title: "DCI技术服务平台门户",
    items: [
      { to: "/content/home", label: "门户内容管理", ready: true },
      { to: "/content/hc", label: "帮助中心管理", ready: true },
      { to: "/content/faqs", label: "FAQ管理", ready: true },
    ],
  },
  {
    title: "系统管理",
    items: [
      { to: "/system/roles", label: "角色权限", ready: true },
      { to: "/system/users", label: "用户管理", ready: true },
      { to: "/system/api-services", label: "接口服务设置", ready: true },
      { to: "/system/op-logs", label: "操作日志", ready: true },
    ],
  },
];

export function findNavLabel(pathname: string): string {
  if (pathname === "/customers/new") return "新增客户账号";
  if (/^\/customers\/[^/]+\/edit$/.test(pathname)) return "编辑客户";
  if (/^\/customers\/[^/]+\/contracts$/.test(pathname)) return "合同管理";
  if (/^\/customers\/[^/]+$/.test(pathname)) return "客户详情";
  if (pathname === "/content/hc/articles/new") return "新增文章";
  if (/^\/content\/hc\/articles\/[^/]+\/edit$/.test(pathname)) return "编辑文章";
  if (/^\/content\/home\/[^/]+\/edit$/.test(pathname)) return "门户内容编辑";
  if (pathname === "/content/portal") return "门户首页管理";
  for (const group of OPS_NAV) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  return "运营后台";
}
