/**
 * SSO RBAC 数据模型（前端演示）
 *
 * - User.username：全集团唯一身份（可与入职邮箱同值，但 SSO 侧只存统一用户名）
 * - Role 归属某一子系统（含 SSO 平台本身 subsystemId = "sso"）
 * - 用户可绑定多个子系统下的多个角色 → 开通多系统权限
 */

export type EntityStatus = "active" | "disabled";

export type Subsystem = {
  id: string;
  code: string;
  name: string;
  description: string;
  /** 外部入口 URL；SSO 平台自身为空 */
  entryUrl: string;
  accent: string;
  status: EntityStatus;
  sort: number;
};

export type Permission = {
  id: string;
  code: string;
  name: string;
  /** 所属子系统；sso = 本平台权限 */
  subsystemId: string;
  description: string;
};

export type Role = {
  id: string;
  code: string;
  name: string;
  subsystemId: string;
  description: string;
  permissionIds: string[];
  status: EntityStatus;
};

export type SsoUser = {
  id: string;
  /** 全局唯一用户名 */
  username: string;
  displayName: string;
  password: string;
  status: EntityStatus;
  roleIds: string[];
  createdAt: string;
  updatedAt: string;
};

export const SSO_SUBSYSTEM_ID = "sso";

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let userSeq = 20;
let roleSeq = 20;
let permSeq = 50;
let subsystemSeq = 20;

let subsystems: Subsystem[] = [
  {
    id: SSO_SUBSYSTEM_ID,
    code: "sso",
    name: "统一身份认证平台",
    description: "集团 SSO 本身：入口门户与身份权限管理",
    entryUrl: "",
    accent: "#0B62B8",
    status: "active",
    sort: 0,
  },
  {
    id: "sys-oa",
    code: "oa",
    name: "协同办公 OA",
    description: "审批、公文、日程与组织通讯录",
    entryUrl: "http://localhost:3002",
    accent: "#00B8C6",
    status: "active",
    sort: 10,
  },
  {
    id: "sys-hr",
    code: "hr",
    name: "人力资源 HR",
    description: "组织人事、考勤与员工自助",
    entryUrl: "http://localhost:3001",
    accent: "#0B62B8",
    status: "active",
    sort: 20,
  },
  {
    id: "sys-erp",
    code: "erp",
    name: "经营管控 ERP",
    description: "财务、采购与经营报表",
    entryUrl: "https://www.ccopyright.com",
    accent: "#004281",
    status: "active",
    sort: 30,
  },
  {
    id: "sys-crm",
    code: "crm",
    name: "客户关系 CRM",
    description: "客户档案、商机与合同跟进",
    entryUrl: "http://localhost:3000",
    accent: "#0096A3",
    status: "active",
    sort: 40,
  },
];

let permissions: Permission[] = [
  // SSO 平台
  { id: "p-sso-launcher", code: "sso.launcher", name: "访问应用入口", subsystemId: SSO_SUBSYSTEM_ID, description: "登录后查看已开通子系统" },
  { id: "p-sso-password", code: "sso.password", name: "修改本人密码", subsystemId: SSO_SUBSYSTEM_ID, description: "原密码校验后修改密码" },
  { id: "p-sso-users", code: "sso.users", name: "用户管理", subsystemId: SSO_SUBSYSTEM_ID, description: "查看与维护 SSO 用户" },
  { id: "p-sso-users-write", code: "sso.users.write", name: "用户编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "新增/编辑用户及角色绑定" },
  { id: "p-sso-roles", code: "sso.roles", name: "角色管理", subsystemId: SSO_SUBSYSTEM_ID, description: "查看与维护角色" },
  { id: "p-sso-roles-write", code: "sso.roles.write", name: "角色编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "新增/编辑角色及权限" },
  { id: "p-sso-perms", code: "sso.perms", name: "权限目录", subsystemId: SSO_SUBSYSTEM_ID, description: "查看权限点定义" },
  { id: "p-sso-subsystems", code: "sso.subsystems", name: "子系统管理", subsystemId: SSO_SUBSYSTEM_ID, description: "维护可接入子系统" },
  { id: "p-sso-subsystems-write", code: "sso.subsystems.write", name: "子系统编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "新增/编辑子系统" },
  // OA
  { id: "p-oa-home", code: "oa.home", name: "OA 工作台", subsystemId: "sys-oa", description: "进入 OA" },
  { id: "p-oa-approve", code: "oa.approve", name: "审批办理", subsystemId: "sys-oa", description: "处理审批单据" },
  { id: "p-oa-admin", code: "oa.admin", name: "OA 管理", subsystemId: "sys-oa", description: "OA 后台配置" },
  // HR
  { id: "p-hr-home", code: "hr.home", name: "HR 工作台", subsystemId: "sys-hr", description: "进入 HR" },
  { id: "p-hr-self", code: "hr.self", name: "员工自助", subsystemId: "sys-hr", description: "查看个人人事信息" },
  { id: "p-hr-admin", code: "hr.admin", name: "人事管理", subsystemId: "sys-hr", description: "组织人事管理" },
  // ERP
  { id: "p-erp-home", code: "erp.home", name: "ERP 工作台", subsystemId: "sys-erp", description: "进入 ERP" },
  { id: "p-erp-report", code: "erp.report", name: "经营报表", subsystemId: "sys-erp", description: "查看经营报表" },
  { id: "p-erp-finance", code: "erp.finance", name: "财务操作", subsystemId: "sys-erp", description: "财务模块操作" },
  // CRM
  { id: "p-crm-home", code: "crm.home", name: "CRM 工作台", subsystemId: "sys-crm", description: "进入 CRM" },
  { id: "p-crm-lead", code: "crm.lead", name: "商机管理", subsystemId: "sys-crm", description: "维护商机" },
  { id: "p-crm-admin", code: "crm.admin", name: "CRM 管理", subsystemId: "sys-crm", description: "CRM 后台" },
];

let roles: Role[] = [
  {
    id: "r-sso-admin",
    code: "sso_admin",
    name: "SSO 系统管理员",
    subsystemId: SSO_SUBSYSTEM_ID,
    description: "管理用户、角色、权限与子系统",
    permissionIds: [
      "p-sso-launcher",
      "p-sso-password",
      "p-sso-users",
      "p-sso-users-write",
      "p-sso-roles",
      "p-sso-roles-write",
      "p-sso-perms",
      "p-sso-subsystems",
      "p-sso-subsystems-write",
    ],
    status: "active",
  },
  {
    id: "r-sso-user",
    code: "sso_user",
    name: "SSO 普通用户",
    subsystemId: SSO_SUBSYSTEM_ID,
    description: "访问入口与修改本人密码",
    permissionIds: ["p-sso-launcher", "p-sso-password"],
    status: "active",
  },
  {
    id: "r-oa-user",
    code: "oa_user",
    name: "OA 普通用户",
    subsystemId: "sys-oa",
    description: "办公与审批",
    permissionIds: ["p-oa-home", "p-oa-approve"],
    status: "active",
  },
  {
    id: "r-oa-admin",
    code: "oa_admin",
    name: "OA 管理员",
    subsystemId: "sys-oa",
    description: "OA 全权限",
    permissionIds: ["p-oa-home", "p-oa-approve", "p-oa-admin"],
    status: "active",
  },
  {
    id: "r-hr-user",
    code: "hr_user",
    name: "HR 员工",
    subsystemId: "sys-hr",
    description: "员工自助",
    permissionIds: ["p-hr-home", "p-hr-self"],
    status: "active",
  },
  {
    id: "r-hr-admin",
    code: "hr_admin",
    name: "HR 管理员",
    subsystemId: "sys-hr",
    description: "人事管理",
    permissionIds: ["p-hr-home", "p-hr-self", "p-hr-admin"],
    status: "active",
  },
  {
    id: "r-erp-user",
    code: "erp_user",
    name: "ERP 只读",
    subsystemId: "sys-erp",
    description: "查看报表",
    permissionIds: ["p-erp-home", "p-erp-report"],
    status: "active",
  },
  {
    id: "r-crm-user",
    code: "crm_user",
    name: "CRM 销售",
    subsystemId: "sys-crm",
    description: "商机跟进",
    permissionIds: ["p-crm-home", "p-crm-lead"],
    status: "active",
  },
];

let users: SsoUser[] = [
  {
    id: "u-admin",
    username: "admin",
    displayName: "系统管理员",
    password: "admin123",
    status: "active",
    roleIds: ["r-sso-admin", "r-oa-admin", "r-hr-admin", "r-erp-user", "r-crm-user"],
    createdAt: "2026-01-01 10:00:00",
    updatedAt: "2026-01-01 10:00:00",
  },
  {
    id: "u-zhangsan",
    username: "zhangsan",
    displayName: "张三",
    password: "demo123456",
    status: "active",
    roleIds: ["r-sso-user", "r-oa-user", "r-hr-user"],
    createdAt: "2026-02-01 09:00:00",
    updatedAt: "2026-02-01 09:00:00",
  },
  {
    id: "u-lisi",
    username: "lisi",
    displayName: "李四",
    password: "demo123456",
    status: "active",
    roleIds: ["r-sso-user", "r-crm-user", "r-erp-user"],
    createdAt: "2026-02-10 11:00:00",
    updatedAt: "2026-02-10 11:00:00",
  },
];

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribeRbac(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function listSubsystems(includeSso = true) {
  return subsystems
    .filter((s) => includeSso || s.id !== SSO_SUBSYSTEM_ID)
    .slice()
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
}

export function getSubsystem(id: string) {
  return subsystems.find((s) => s.id === id) ?? null;
}

export function listPermissions(subsystemId?: string) {
  return permissions
    .filter((p) => !subsystemId || p.subsystemId === subsystemId)
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function listRoles(subsystemId?: string) {
  return roles
    .filter((r) => !subsystemId || r.subsystemId === subsystemId)
    .slice()
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function getRole(id: string) {
  return roles.find((r) => r.id === id) ?? null;
}

export function listUsers() {
  return users.slice().sort((a, b) => a.username.localeCompare(b.username));
}

export function getUser(id: string) {
  return users.find((u) => u.id === id) ?? null;
}

export function findUserByUsername(username: string) {
  const key = username.trim().toLowerCase();
  return users.find((u) => u.username.toLowerCase() === key) ?? null;
}

export function authenticate(username: string, password: string):
  | { ok: true; user: SsoUser }
  | { ok: false; message: string } {
  const user = findUserByUsername(username);
  if (!user || user.password !== password) {
    return { ok: false, message: "用户名或密码错误" };
  }
  if (user.status !== "active") {
    return { ok: false, message: "账号已停用，请联系管理员" };
  }
  return { ok: true, user };
}

export function getUserPermissionCodes(user: SsoUser): Set<string> {
  const codes = new Set<string>();
  for (const rid of user.roleIds) {
    const role = getRole(rid);
    if (!role || role.status !== "active") continue;
    for (const pid of role.permissionIds) {
      const p = permissions.find((x) => x.id === pid);
      if (p) codes.add(p.code);
    }
  }
  return codes;
}

export function userHasPermission(user: SsoUser, code: string) {
  return getUserPermissionCodes(user).has(code);
}

/** 用户已开通的业务子系统（有该系统下任一有效角色，且系统启用） */
export function getUserSubsystems(user: SsoUser): Subsystem[] {
  const ids = new Set<string>();
  for (const rid of user.roleIds) {
    const role = getRole(rid);
    if (!role || role.status !== "active") continue;
    if (role.subsystemId === SSO_SUBSYSTEM_ID) continue;
    ids.add(role.subsystemId);
  }
  return listSubsystems(false).filter((s) => s.status === "active" && ids.has(s.id));
}

export function changePassword(
  userId: string,
  oldPassword: string,
  newPassword: string,
): { ok: true } | { ok: false; message: string } {
  const user = getUser(userId);
  if (!user) return { ok: false, message: "用户不存在" };
  if (user.password !== oldPassword) return { ok: false, message: "原密码不正确" };
  if (newPassword.length < 6) return { ok: false, message: "新密码至少 6 位" };
  if (newPassword === oldPassword) return { ok: false, message: "新密码不能与原密码相同" };
  users = users.map((u) =>
    u.id === userId ? { ...u, password: newPassword, updatedAt: nowStamp() } : u,
  );
  emit();
  return { ok: true };
}

export function createUser(input: {
  username: string;
  displayName: string;
  password: string;
  roleIds: string[];
  status: EntityStatus;
}): { ok: true; user: SsoUser } | { ok: false; message: string } {
  const username = input.username.trim();
  if (!/^[a-zA-Z][a-zA-Z0-9._-]{2,31}$/.test(username)) {
    return { ok: false, message: "用户名须字母开头，3–32 位，仅含字母数字._-" };
  }
  if (findUserByUsername(username)) return { ok: false, message: "用户名已存在" };
  if (input.password.length < 6) return { ok: false, message: "密码至少 6 位" };
  userSeq += 1;
  const user: SsoUser = {
    id: `u-${userSeq}`,
    username,
    displayName: input.displayName.trim() || username,
    password: input.password,
    status: input.status,
    roleIds: [...new Set(input.roleIds)],
    createdAt: nowStamp(),
    updatedAt: nowStamp(),
  };
  users = [user, ...users];
  emit();
  return { ok: true, user };
}

export function updateUser(
  id: string,
  input: {
    displayName: string;
    roleIds: string[];
    status: EntityStatus;
    password?: string;
  },
): { ok: true } | { ok: false; message: string } {
  const user = getUser(id);
  if (!user) return { ok: false, message: "用户不存在" };
  if (input.password !== undefined && input.password !== "" && input.password.length < 6) {
    return { ok: false, message: "密码至少 6 位" };
  }
  users = users.map((u) =>
    u.id === id
      ? {
          ...u,
          displayName: input.displayName.trim() || u.displayName,
          roleIds: [...new Set(input.roleIds)],
          status: input.status,
          password: input.password ? input.password : u.password,
          updatedAt: nowStamp(),
        }
      : u,
  );
  emit();
  return { ok: true };
}

export function createRole(input: {
  code: string;
  name: string;
  subsystemId: string;
  description: string;
  permissionIds: string[];
}): { ok: true } | { ok: false; message: string } {
  const code = input.code.trim();
  if (!code) return { ok: false, message: "请填写角色编码" };
  if (roles.some((r) => r.code === code && r.subsystemId === input.subsystemId)) {
    return { ok: false, message: "该子系统下角色编码已存在" };
  }
  if (!getSubsystem(input.subsystemId)) return { ok: false, message: "子系统不存在" };
  roleSeq += 1;
  roles = [
    {
      id: `r-${roleSeq}`,
      code,
      name: input.name.trim(),
      subsystemId: input.subsystemId,
      description: input.description.trim(),
      permissionIds: [...new Set(input.permissionIds)],
      status: "active",
    },
    ...roles,
  ];
  emit();
  return { ok: true };
}

export function updateRole(
  id: string,
  input: {
    name: string;
    description: string;
    permissionIds: string[];
    status: EntityStatus;
  },
): { ok: true } | { ok: false; message: string } {
  if (!getRole(id)) return { ok: false, message: "角色不存在" };
  roles = roles.map((r) =>
    r.id === id
      ? {
          ...r,
          name: input.name.trim(),
          description: input.description.trim(),
          permissionIds: [...new Set(input.permissionIds)],
          status: input.status,
        }
      : r,
  );
  emit();
  return { ok: true };
}

export function createPermission(input: {
  code: string;
  name: string;
  subsystemId: string;
  description: string;
}): { ok: true } | { ok: false; message: string } {
  const code = input.code.trim();
  if (!code) return { ok: false, message: "请填写权限编码" };
  if (permissions.some((p) => p.code === code)) return { ok: false, message: "权限编码已存在" };
  if (!getSubsystem(input.subsystemId)) return { ok: false, message: "子系统不存在" };
  permSeq += 1;
  permissions = [
    {
      id: `p-${permSeq}`,
      code,
      name: input.name.trim(),
      subsystemId: input.subsystemId,
      description: input.description.trim(),
    },
    ...permissions,
  ];
  emit();
  return { ok: true };
}

export function createSubsystem(input: {
  code: string;
  name: string;
  description: string;
  entryUrl: string;
  accent: string;
  sort: number;
}): { ok: true } | { ok: false; message: string } {
  const code = input.code.trim().toLowerCase();
  if (!/^[a-z][a-z0-9_-]{1,15}$/.test(code)) {
    return { ok: false, message: "编码须小写字母开头，2–16 位" };
  }
  if (subsystems.some((s) => s.code === code)) return { ok: false, message: "子系统编码已存在" };
  subsystemSeq += 1;
  subsystems = [
    ...subsystems,
    {
      id: `sys-${subsystemSeq}`,
      code,
      name: input.name.trim(),
      description: input.description.trim(),
      entryUrl: input.entryUrl.trim(),
      accent: input.accent || "#0B62B8",
      status: "active",
      sort: input.sort,
    },
  ];
  emit();
  return { ok: true };
}

export function updateSubsystem(
  id: string,
  input: {
    name: string;
    description: string;
    entryUrl: string;
    accent: string;
    sort: number;
    status: EntityStatus;
  },
): { ok: true } | { ok: false; message: string } {
  if (id === SSO_SUBSYSTEM_ID) {
    // SSO 平台可改名称描述，不可禁用/改入口
    subsystems = subsystems.map((s) =>
      s.id === id
        ? {
            ...s,
            name: input.name.trim(),
            description: input.description.trim(),
            accent: input.accent || s.accent,
            sort: input.sort,
          }
        : s,
    );
    emit();
    return { ok: true };
  }
  if (!getSubsystem(id)) return { ok: false, message: "子系统不存在" };
  subsystems = subsystems.map((s) =>
    s.id === id
      ? {
          ...s,
          name: input.name.trim(),
          description: input.description.trim(),
          entryUrl: input.entryUrl.trim(),
          accent: input.accent || s.accent,
          sort: input.sort,
          status: input.status,
        }
      : s,
  );
  emit();
  return { ok: true };
}
