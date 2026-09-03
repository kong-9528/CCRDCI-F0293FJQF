export type NavItem = {
  to: string;
  label: string;
  /** 未实现页仅占位 */
  ready?: boolean;
  /** 侧栏不展示，但路由仍可直接访问 */
  hidden?: boolean;
};

export type NavGroup = {
  title: string;
  items: NavItem[];
};

export const OPS_NAV: NavGroup[] = [
  {
    title: "",
    items: [{ to: "/dashboard", label: "首页", ready: true }],
  },
  {
    title: "客户管理",
    items: [
      { to: "/accounts", label: "客户账号管理", ready: true },
      { to: "/customers", label: "客户账号列表", ready: true },
      { to: "/customer-services", label: "服务产品管理", ready: true, hidden: true },
    ],
  },
  {
    title: "产品/能力上架管理",
    items: [
      { to: "/products/verify", label: "版权核验产品", ready: true },
      { to: "/products/audit", label: "智能辅助审核产品", ready: true },
    ],
  },
  {
    title: "运营统计",
    items: [
      { to: "/stats/customers", label: "客户使用统计", ready: true },
      { to: "/stats/products", label: "产品使用统计", ready: true },
      { to: "/stats/account-products", label: "账号产品使用统计", ready: true },
    ],
  },
  {
    title: "DCI技术服务平台门户",
    items: [
      { to: "/content/portal", label: "门户首页管理", ready: true },
      { to: "/content/home", label: "门户内容管理", ready: true },
      { to: "/content/center", label: "技术服务中心内容管理", ready: true },
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
  if (/^\/accounts\/[^/]+\/review$/.test(pathname)) return "审核开通申请";
  if (/^\/accounts\/[^/]+\/edit$/.test(pathname)) return "编辑产品服务";
  if (/^\/accounts\/[^/]+$/.test(pathname)) return "申请详情";
  if (pathname === "/customers/new") return "新增客户账号";
  if (/^\/customers\/[^/]+\/edit$/.test(pathname)) return "编辑客户";
  if (/^\/customers\/[^/]+\/contracts$/.test(pathname)) return "合同管理";
  if (/^\/customers\/[^/]+$/.test(pathname)) return "客户详情";
  if (pathname === "/content/center/articles/new") return "新增内容";
  if (/^\/content\/center\/articles\/[^/]+\/edit$/.test(pathname)) return "编辑内容";
  if (pathname === "/content/guide/articles/new") return "新增指南文章";
  if (/^\/content\/guide\/articles\/[^/]+\/edit$/.test(pathname)) return "编辑指南文章";
  if (pathname === "/content/console-help/articles/new") return "新增文章";
  if (/^\/content\/console-help\/articles\/[^/]+\/edit$/.test(pathname)) return "编辑文章";
  if (/^\/content\/home\/[^/]+\/edit$/.test(pathname)) return "门户内容编辑";
  if (pathname === "/content/portal") return "门户首页管理";
  if (pathname === "/content/center") return "技术服务中心内容管理";
  if (pathname === "/system/api-services/new") return "新增接口";
  if (/^\/system\/api-services\/[^/]+\/edit$/.test(pathname)) return "编辑接口";
  if (pathname === "/products/verify") return "版权核验产品";
  if (pathname === "/products/audit") return "智能辅助审核产品";
  for (const group of OPS_NAV) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  return "运营后台";
}
