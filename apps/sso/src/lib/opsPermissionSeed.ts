/**
 * 与 apps/ops/src/lib/rolesStore.ts 对齐的「技术服务中心」权限树与内置角色。
 * 权限编码与 ops 的 permissionId 保持一致，便于后续联调。
 */

export const OPS_SUBSYSTEM_ID = "sys-ops";

export type OpsPermNode = {
  id: string;
  label: string;
  children?: OpsPermNode[];
};

/** 文档约定的页面 / 功能按钮权限树（与 ops PERMISSION_TREE 同步） */
export const OPS_PERMISSION_TREE: OpsPermNode[] = [
  {
    id: "customers",
    label: "客户管理",
    children: [
      {
        id: "customers.list",
        label: "客户账号列表页",
        children: [
          { id: "customers.list.create", label: "新增客户按钮" },
          { id: "customers.list.edit", label: "编辑按钮" },
          { id: "customers.list.detail", label: "详情按钮" },
          { id: "customers.list.status", label: "启用/停用" },
          { id: "customers.list.contracts", label: "合同按钮" },
        ],
      },
      {
        id: "customers.contracts",
        label: "合同管理页",
        children: [
          { id: "customers.contracts.create", label: "新增合同按钮" },
          { id: "customers.contracts.edit", label: "修改合同按钮" },
        ],
      },
      {
        id: "customers.services",
        label: "服务产品管理页",
        children: [
          { id: "customers.services.edit", label: "编辑按钮" },
          { id: "customers.services.create", label: "新增服务按钮" },
          { id: "customers.services.toggle", label: "停止/恢复按钮" },
        ],
      },
    ],
  },
  {
    id: "accounts",
    label: "客户账号管理",
    children: [
      {
        id: "accounts.pending",
        label: "待审核",
        children: [{ id: "accounts.pending.review", label: "审核按钮" }],
      },
      {
        id: "accounts.mine",
        label: "我的审核",
        children: [
          { id: "accounts.mine.view", label: "查看按钮" },
          { id: "accounts.mine.edit", label: "编辑按钮" },
        ],
      },
      {
        id: "accounts.all",
        label: "全部审核",
        children: [
          { id: "accounts.all.view", label: "查看按钮" },
          { id: "accounts.all.edit", label: "编辑按钮" },
        ],
      },
      {
        id: "accounts.review",
        label: "审核页",
        children: [{ id: "accounts.review.contractDownload", label: "合同附件下载" }],
      },
      {
        id: "accounts.detail",
        label: "申请详情页",
        children: [{ id: "accounts.detail.contractDownload", label: "合同附件下载" }],
      },
    ],
  },
  {
    id: "products",
    label: "产品上架管理",
    children: [
      { id: "products.list", label: "列表页" },
      { id: "products.settings", label: "上下架操作" },
    ],
  },
  {
    id: "stats",
    label: "运营统计分析",
    children: [
      { id: "stats.customers", label: "客户使用统计页" },
      { id: "stats.products", label: "产品使用统计页" },
      { id: "stats.accountProducts", label: "账号产品使用统计页" },
    ],
  },
  {
    id: "system",
    label: "系统管理",
    children: [
      {
        id: "system.roles",
        label: "角色权限列表页",
        children: [
          { id: "system.roles.create", label: "新增角色按钮" },
          { id: "system.roles.edit", label: "编辑按钮" },
          { id: "system.roles.perms", label: "权限按钮" },
        ],
      },
      {
        id: "system.users",
        label: "用户管理页",
        children: [
          { id: "system.users.create", label: "新增用户按钮" },
          { id: "system.users.edit", label: "编辑按钮" },
          { id: "system.users.status", label: "启用/停用按钮" },
        ],
      },
      { id: "system.opLogs", label: "操作日志页" },
      { id: "system.apiVerify", label: "版权核验接口管理页" },
      { id: "system.apiAudit", label: "智能审核接口管理页" },
    ],
  },
  {
    id: "content",
    label: "门户内容管理",
    children: [
      {
        id: "content.portal",
        label: "技术服务中心专题管理",
        children: [
          { id: "content.portal.create", label: "新增主题按钮" },
          { id: "content.portal.edit", label: "编辑按钮" },
          { id: "content.portal.delete", label: "删除按钮" },
          { id: "content.portal.visibility", label: "显示/隐藏按钮" },
        ],
      },
      {
        id: "content.center",
        label: "技术服务中心内容管理",
        children: [
          { id: "content.center.createCatalog", label: "新增目录按钮" },
          { id: "content.center.createArticle", label: "新增文章/问题按钮" },
          { id: "content.center.edit", label: "编辑按钮" },
          { id: "content.center.delete", label: "删除按钮" },
          { id: "content.center.visibility", label: "显示/隐藏按钮" },
        ],
      },
      {
        id: "content.catalogs",
        label: "目录管理页（兼容）",
        children: [
          { id: "content.catalogs.create", label: "新增目录按钮" },
          { id: "content.catalogs.edit", label: "编辑按钮" },
          { id: "content.catalogs.delete", label: "删除按钮" },
        ],
      },
      {
        id: "content.articles",
        label: "文章管理页（兼容）",
        children: [
          { id: "content.articles.create", label: "新增文章按钮" },
          { id: "content.articles.edit", label: "编辑按钮" },
          { id: "content.articles.delete", label: "删除按钮" },
        ],
      },
      {
        id: "content.faqs",
        label: "问题管理页（兼容）",
        children: [
          { id: "content.faqs.create", label: "新增问题按钮" },
          { id: "content.faqs.edit", label: "编辑按钮" },
          { id: "content.faqs.delete", label: "删除按钮" },
        ],
      },
    ],
  },
];

export function collectOpsPermissionIds(nodes: OpsPermNode[] = OPS_PERMISSION_TREE): string[] {
  const out: string[] = [];
  const walk = (list: OpsPermNode[]) => {
    for (const n of list) {
      out.push(n.id);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export type FlattenedOpsPermission = {
  id: string;
  code: string;
  name: string;
  description: string;
};

/** 扁平化为 SSO Permission 种子（id/code 与 ops permissionId 一致） */
export function flattenOpsPermissions(
  nodes: OpsPermNode[] = OPS_PERMISSION_TREE,
  trail: string[] = [],
): FlattenedOpsPermission[] {
  const out: FlattenedOpsPermission[] = [];
  for (const n of nodes) {
    const path = [...trail, n.label];
    out.push({
      id: n.id,
      code: n.id,
      name: n.label,
      description: path.join(" / "),
    });
    if (n.children?.length) {
      out.push(...flattenOpsPermissions(n.children, path));
    }
  }
  return out;
}

const ALL_OPS_PERM_IDS = collectOpsPermissionIds();

/** 与 ops rolesStore 内置角色一致（permissionIds 使用 ops 编码） */
export const OPS_SEED_ROLES = [
  {
    id: "role-super",
    code: "ops_super",
    name: "超级管理员",
    description: "拥有全部权限（含后续新增模块），不可删除、不可修改",
    permissionIds: [...ALL_OPS_PERM_IDS],
  },
  {
    id: "role-ops",
    code: "ops_specialist",
    name: "运营专员",
    description: "客户与产品日常运营",
    permissionIds: [
      "customers",
      "customers.list",
      "customers.list.create",
      "customers.list.edit",
      "customers.list.detail",
      "customers.list.status",
      "customers.list.contracts",
      "customers.contracts",
      "customers.contracts.create",
      "customers.contracts.edit",
      "customers.services",
      "customers.services.edit",
      "customers.services.create",
      "customers.services.toggle",
      "accounts",
      "accounts.pending",
      "accounts.pending.review",
      "accounts.mine",
      "accounts.mine.view",
      "accounts.mine.edit",
      "accounts.all",
      "accounts.all.view",
      "accounts.all.edit",
      "accounts.review",
      "accounts.review.contractDownload",
      "accounts.detail",
      "accounts.detail.contractDownload",
      "products",
      "products.list",
      "products.settings",
      "stats",
      "stats.customers",
      "stats.products",
      "stats.accountProducts",
      "content",
      "content.portal",
      "content.portal.create",
      "content.portal.edit",
      "content.portal.delete",
      "content.portal.visibility",
      "content.center",
      "content.center.createCatalog",
      "content.center.createArticle",
      "content.center.edit",
      "content.center.delete",
      "content.center.visibility",
      "content.catalogs",
      "content.catalogs.create",
      "content.catalogs.edit",
      "content.catalogs.delete",
      "content.articles",
      "content.articles.create",
      "content.articles.edit",
      "content.articles.delete",
      "content.faqs",
      "content.faqs.create",
      "content.faqs.edit",
      "content.faqs.delete",
    ],
  },
  {
    id: "role-viewer",
    code: "ops_viewer",
    name: "只读观察",
    description: "仅可查看统计与日志",
    permissionIds: [
      "stats",
      "stats.customers",
      "stats.products",
      "stats.accountProducts",
      "system",
      "system.opLogs",
    ],
  },
] as const;
