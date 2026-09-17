import { useEffect, useState } from "react";

export type RoleStatus = "enabled" | "disabled";

export type Role = {
  id: string;
  name: string;
  description: string;
  status: RoleStatus;
  /** 绑定用户数；超级管理员等内置角色可固定 */
  userCount: number;
  permissionIds: string[];
  /** 内置不可删改 */
  builtin?: boolean;
};

export const ROLE_STATUS_LABEL: Record<RoleStatus, string> = {
  enabled: "启用",
  disabled: "停用",
};

export type PermNode = {
  id: string;
  label: string;
  children?: PermNode[];
};

/** 文档约定的页面 / 功能按钮权限树 */
export const PERMISSION_TREE: PermNode[] = [
  {
    id: "customers",
    label: "机构服务管理",
    children: [
      {
        id: "customers.list",
        label: "机构账号列表页",
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
    label: "机构账号管理",
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
    label: "技术服务上架管理",
    children: [
      { id: "products.list", label: "列表页" },
      { id: "products.settings", label: "上下架操作" },
    ],
  },
  {
    id: "stats",
    label: "运营统计分析",
    children: [
      { id: "stats.customers", label: "机构使用统计页" },
      { id: "stats.products", label: "技术服务使用统计页" },
      { id: "stats.accountProducts", label: "机构服务使用统计页" },
      { id: "stats.usageRecords", label: "技术服务使用记录页" },
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
      {
        id: "system.inviteCodes",
        label: "邀请码管理页",
        children: [
          { id: "system.inviteCodes.create", label: "新增按钮" },
          { id: "system.inviteCodes.edit", label: "编辑按钮" },
          { id: "system.inviteCodes.delete", label: "删除按钮" },
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

export function collectPermissionIds(nodes: PermNode[] = PERMISSION_TREE): string[] {
  const out: string[] = [];
  const walk = (list: PermNode[]) => {
    for (const n of list) {
      out.push(n.id);
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return out;
}

export function collectDescendantIds(node: PermNode): string[] {
  const out: string[] = [];
  const walk = (n: PermNode) => {
    out.push(n.id);
    n.children?.forEach(walk);
  };
  walk(node);
  return out;
}

function findPathIds(targetId: string, nodes: PermNode[], trail: string[] = []): string[] | null {
  for (const n of nodes) {
    const next = [...trail, n.id];
    if (n.id === targetId) return next;
    if (n.children?.length) {
      const found = findPathIds(targetId, n.children, next);
      if (found) return found;
    }
  }
  return null;
}

/** 勾选节点时带上祖先；取消时仅取消自身及子孙 */
export function togglePermissionNode(
  node: PermNode,
  selected: Set<string>,
  tree: PermNode[] = PERMISSION_TREE,
): Set<string> {
  const ids = collectDescendantIds(node);
  const next = new Set(selected);
  const state = (() => {
    const hit = ids.filter((id) => selected.has(id)).length;
    if (hit === 0) return false as const;
    if (hit === ids.length) return true as const;
    return "indeterminate" as const;
  })();

  if (state === true) {
    ids.forEach((id) => next.delete(id));
  } else {
    ids.forEach((id) => next.add(id));
    const path = findPathIds(node.id, tree) ?? [];
    path.forEach((id) => next.add(id));
  }
  return next;
}

const ALL_PERM_IDS = collectPermissionIds();

let roleSeq = 10;
let roles: Role[] = [
  {
    id: "role-super",
    name: "超级管理员",
    description: "拥有全部权限（含后续新增模块），不可删除、不可修改",
    status: "enabled",
    userCount: 1,
    permissionIds: [...ALL_PERM_IDS],
    builtin: true,
  },
  {
    id: "role-ops",
    name: "运营专员",
    description: "客户与产品日常运营",
    status: "enabled",
    userCount: 2,
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
      "stats.usageRecords",
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
    name: "只读观察",
    description: "仅可查看统计与日志",
    status: "enabled",
    userCount: 0,
    permissionIds: [
      "stats",
      "stats.customers",
      "stats.products",
      "stats.accountProducts",
      "stats.usageRecords",
      "system",
      "system.opLogs",
    ],
  },
];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getRoles(): Role[] {
  return roles;
}

export function getRoleById(id: string): Role | undefined {
  return roles.find((r) => r.id === id);
}

/** 角色权限是否均为操作者已有权限的子集 */
export function isRoleAssignable(role: Role, actorPermissionIds: string[]): boolean {
  if (role.status !== "enabled") return false;
  const actor = new Set(actorPermissionIds);
  return role.permissionIds.every((id) => actor.has(id));
}

export function getAssignableRoles(actorPermissionIds: string[]): Role[] {
  return roles.filter((r) => isRoleAssignable(r, actorPermissionIds));
}

export function syncRoleUserCounts(counts: Record<string, number>) {
  let changed = false;
  roles = roles.map((r) => {
    const next = counts[r.id] ?? 0;
    if (r.userCount === next) return r;
    changed = true;
    return { ...r, userCount: next };
  });
  if (changed) emit();
}

export function createRole(input: { name: string; description: string }) {
  roleSeq += 1;
  roles = [
    {
      id: `role-${roleSeq}`,
      name: input.name.trim(),
      description: input.description.trim(),
      status: "enabled",
      userCount: 0,
      permissionIds: [],
    },
    ...roles,
  ];
  emit();
}

export function updateRole(
  id: string,
  input: { name: string; description: string },
): string | null {
  const role = roles.find((r) => r.id === id);
  if (!role) return "角色不存在";
  if (role.builtin) return "超级管理员不可修改";
  roles = roles.map((r) =>
    r.id === id
      ? {
          ...r,
          name: input.name.trim(),
          description: input.description.trim(),
        }
      : r,
  );
  emit();
  return null;
}

export function setRolePermissions(id: string, permissionIds: string[]): string | null {
  const role = roles.find((r) => r.id === id);
  if (!role) return "角色不存在";
  if (role.builtin) return "超级管理员权限不可修改";
  const set = new Set(permissionIds);
  roles = roles.map((r) =>
    r.id === id ? { ...r, permissionIds: ALL_PERM_IDS.filter((pid) => set.has(pid)) } : r,
  );
  emit();
  return null;
}

export function deleteRole(id: string): string | null {
  const role = roles.find((r) => r.id === id);
  if (!role) return "角色不存在";
  if (role.builtin) return "超级管理员不可删除";
  if (role.userCount > 0) return "该角色下仍有用户，请先解除用户绑定后再删除";
  roles = roles.filter((r) => r.id !== id);
  emit();
  return null;
}

export function useRolesStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    roles: getRoles(),
    createRole,
    updateRole,
    setRolePermissions,
    deleteRole,
  };
}
