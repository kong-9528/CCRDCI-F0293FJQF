export type NavItem = {
  to: string;
  label: string;
  /** 未实现页仅占位 */
  ready?: boolean;
  /** 侧栏不展示，但路由仍可直接访问 */
  hidden?: boolean;
};

export type NavGroup = {
  /** 分组唯一键 */
  key: string;
  /** 目录标题；空字符串表示顶层单链（如首页） */
  title: string;
  /** 目录级图标 id（仅目录/首页，不挂在子模块） */
  icon: string;
  items: NavItem[];
};

export const OPS_NAV: NavGroup[] = [
  {
    key: "home",
    title: "",
    icon: "home",
    items: [{ to: "/dashboard", label: "首页", ready: true }],
  },
  {
    key: "customers",
    title: "机构服务管理",
    icon: "customers",
    items: [
      { to: "/accounts/pending", label: "待审核", ready: true },
      { to: "/accounts/mine", label: "我的审核", ready: true },
      { to: "/accounts/all", label: "全部审核", ready: true },
      { to: "/accounts", label: "客户账号管理", ready: true, hidden: true },
      { to: "/customers", label: "客户账号列表", ready: true, hidden: true },
      { to: "/customer-services", label: "服务产品管理", ready: true, hidden: true },
    ],
  },
  {
    key: "stats-verify",
    title: "核验统计",
    icon: "stats",
    items: [
      { to: "/stats/verify/customers", label: "机构使用统计", ready: true },
      { to: "/stats/verify/products", label: "技术服务使用统计", ready: true },
      { to: "/stats/verify/account-products", label: "机构服务使用统计", ready: true },
      { to: "/stats/verify/usage-records", label: "技术服务使用记录", ready: true },
    ],
  },
  {
    key: "stats-audit",
    title: "作品智能辅助审核统计",
    icon: "stats",
    items: [
      { to: "/stats/audit/customers", label: "机构使用统计", ready: true },
      { to: "/stats/audit/products", label: "审核能力使用统计", ready: true },
      { to: "/stats/audit/account-products", label: "机构审核能力使用统计", ready: true },
      { to: "/stats/audit/usage-records", label: "技术服务使用记录", ready: true },
    ],
  },
  {
    key: "content",
    title: "门户内容管理",
    icon: "content",
    items: [
      { to: "/content/portal", label: "技术服务中心专题管理", ready: true, hidden: true },
      { to: "/content/home", label: "门户内容管理", ready: true, hidden: true },
      { to: "/content/center", label: "技术服务中心内容管理", ready: true, hidden: true },
    ],
  },
  {
    key: "system",
    title: "系统管理",
    icon: "system",
    items: [
      { to: "/system/roles", label: "角色权限", ready: true, hidden: true },
      { to: "/system/users", label: "用户管理", ready: true, hidden: true },
      { to: "/system/invite-codes", label: "邀请码管理", ready: true },
      { to: "/products/verify", label: "技术服务上架管理", ready: true },
      { to: "/products/audit", label: "技术服务上架管理", ready: true, hidden: true },
      { to: "/system/api-services", label: "接口服务设置", ready: true },
      { to: "/system/op-logs", label: "操作日志", ready: true },
    ],
  },
];

export function findNavGroupKey(pathname: string): string | null {
  let best: { key: string; len: number } | null = null;
  for (const group of OPS_NAV) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        const len = item.to.length;
        if (!best || len > best.len) best = { key: group.key, len };
      }
    }
  }
  return best?.key ?? null;
}

export function findNavLabel(pathname: string): string {
  if (pathname === "/accounts/pending") return "待审核";
  if (pathname === "/accounts/mine") return "我的审核";
  if (pathname === "/accounts/all") return "全部审核";
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
  if (pathname === "/content/portal") return "技术服务中心专题管理";
  if (pathname === "/content/home") return "门户内容管理";
  if (/^\/content\/home\/[^/]+\/edit$/.test(pathname)) return "门户内容编辑";
  if (pathname === "/content/center") return "技术服务中心内容管理";
  if (pathname === "/products/verify" || pathname === "/products/audit" || pathname === "/products") {
    return "技术服务上架管理";
  }
  for (const group of OPS_NAV) {
    for (const item of group.items) {
      if (pathname === item.to || pathname.startsWith(`${item.to}/`)) {
        return item.label;
      }
    }
  }
  return "运营后台";
}
