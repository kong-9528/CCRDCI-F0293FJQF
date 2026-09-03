/**
 * SSO RBAC 数据模型（前端演示）
 *
 * - User.username：全集团唯一身份（可与入职邮箱同值，但 SSO 侧只存统一用户名）
 * - Role 归属某一子系统（含 SSO 平台本身 subsystemId = "sso"）
 * - 用户可绑定多个子系统下的多个角色 → 开通多系统权限
 * - 技术服务中心（ops）权限树 / 角色 / 演示用户与 apps/ops 对齐
 */

import {
  flattenOpsPermissions,
  OPS_SEED_ROLES,
  OPS_SUBSYSTEM_ID,
} from "@/lib/opsPermissionSeed";

export type EntityStatus = "active" | "disabled";

export { OPS_SUBSYSTEM_ID };

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
  /** 关联的该子系统 API 接口（可多选） */
  apiIds: string[];
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

export type OrgUnitType = "company" | "division" | "department" | "team";

export type OrgUnit = {
  id: string;
  code: string;
  name: string;
  parentId: string | null;
  type: OrgUnitType;
  leaderName: string;
  sort: number;
  status: EntityStatus;
  description: string;
};

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

export type ApiEndpoint = {
  id: string;
  subsystemId: string;
  /** 子系统内唯一 */
  code: string;
  name: string;
  method: HttpMethod;
  path: string;
  version: string;
  summary: string;
  description: string;
  contentType: string;
  authRequired: boolean;
  requestExample: string;
  responseExample: string;
  tags: string;
  status: EntityStatus;
  sort: number;
};

export type SsoUser = {
  id: string;
  /** 全局唯一用户名 */
  username: string;
  displayName: string;
  password: string;
  status: EntityStatus;
  roleIds: string[];
  /** 所属组织节点 */
  orgUnitId: string | null;
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
let orgSeq = 30;
let apiSeq = 80;

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
    id: OPS_SUBSYSTEM_ID,
    code: "ops",
    name: "技术服务中心",
    description: "运营后台：客户、产品上架、内容与系统管理",
    entryUrl: "http://localhost:3001",
    accent: "#0B62B8",
    status: "active",
    sort: 5,
  },
  {
    id: "sys-oa",
    code: "oa",
    name: "协同办公 OA",
    description: "审批、公文、日程与组织通讯录",
    entryUrl: "https://www.ccopyright.com",
    accent: "#00B8C6",
    status: "active",
    sort: 10,
  },
  {
    id: "sys-hr",
    code: "hr",
    name: "人力资源 HR",
    description: "组织人事、考勤与员工自助",
    entryUrl: "https://www.ccopyright.com",
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

const opsPermissions: Permission[] = flattenOpsPermissions().map((p) => ({
  ...p,
  subsystemId: OPS_SUBSYSTEM_ID,
  apiIds: [] as string[],
}));

let permissions: Permission[] = [
  // SSO 平台
  { id: "p-sso-launcher", code: "sso.launcher", name: "访问应用入口", subsystemId: SSO_SUBSYSTEM_ID, description: "登录后查看已开通子系统", apiIds: ["api-sso-me", "api-sso-launcher"] },
  { id: "p-sso-password", code: "sso.password", name: "修改本人密码", subsystemId: SSO_SUBSYSTEM_ID, description: "原密码校验后修改密码", apiIds: ["api-sso-password"] },
  { id: "p-sso-users", code: "sso.users", name: "用户管理", subsystemId: SSO_SUBSYSTEM_ID, description: "查看与维护 SSO 用户", apiIds: ["api-sso-users-list", "api-sso-users-get"] },
  { id: "p-sso-users-write", code: "sso.users.write", name: "用户编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "新增/编辑用户及角色绑定", apiIds: ["api-sso-users-create", "api-sso-users-update"] },
  { id: "p-sso-roles", code: "sso.roles", name: "角色管理", subsystemId: SSO_SUBSYSTEM_ID, description: "查看与维护角色", apiIds: ["api-sso-roles-list"] },
  { id: "p-sso-roles-write", code: "sso.roles.write", name: "角色编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "新增/编辑角色及权限", apiIds: ["api-sso-roles-create", "api-sso-roles-update"] },
  { id: "p-sso-perms", code: "sso.perms", name: "权限目录", subsystemId: SSO_SUBSYSTEM_ID, description: "查看权限点定义", apiIds: ["api-sso-perms-list"] },
  { id: "p-sso-perms-write", code: "sso.perms.write", name: "权限编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "维护权限点及关联接口", apiIds: ["api-sso-perms-create", "api-sso-perms-update"] },
  { id: "p-sso-subsystems", code: "sso.subsystems", name: "子系统管理", subsystemId: SSO_SUBSYSTEM_ID, description: "维护可接入子系统", apiIds: ["api-sso-sys-list"] },
  { id: "p-sso-subsystems-write", code: "sso.subsystems.write", name: "子系统编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "新增/编辑子系统", apiIds: ["api-sso-sys-create", "api-sso-sys-update"] },
  { id: "p-sso-org", code: "sso.org", name: "组织管理", subsystemId: SSO_SUBSYSTEM_ID, description: "查看组织结构", apiIds: ["api-sso-org-list"] },
  { id: "p-sso-org-write", code: "sso.org.write", name: "组织编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "维护组织树节点", apiIds: ["api-sso-org-create", "api-sso-org-update"] },
  { id: "p-sso-apis", code: "sso.apis", name: "接口管理", subsystemId: SSO_SUBSYSTEM_ID, description: "查看子系统 API 清单", apiIds: ["api-sso-apis-list"] },
  { id: "p-sso-apis-write", code: "sso.apis.write", name: "接口编辑", subsystemId: SSO_SUBSYSTEM_ID, description: "维护 API 接口定义", apiIds: ["api-sso-apis-create", "api-sso-apis-update"] },
  // 技术服务中心（与 ops 权限树对齐）
  ...opsPermissions,
  // OA
  { id: "p-oa-home", code: "oa.home", name: "OA 工作台", subsystemId: "sys-oa", description: "进入 OA", apiIds: ["api-oa-home"] },
  { id: "p-oa-approve", code: "oa.approve", name: "审批办理", subsystemId: "sys-oa", description: "处理审批单据", apiIds: ["api-oa-tasks", "api-oa-approve"] },
  { id: "p-oa-admin", code: "oa.admin", name: "OA 管理", subsystemId: "sys-oa", description: "OA 后台配置", apiIds: [] },
  // HR
  { id: "p-hr-home", code: "hr.home", name: "HR 工作台", subsystemId: "sys-hr", description: "进入 HR", apiIds: [] },
  { id: "p-hr-self", code: "hr.self", name: "员工自助", subsystemId: "sys-hr", description: "查看个人人事信息", apiIds: [] },
  { id: "p-hr-admin", code: "hr.admin", name: "人事管理", subsystemId: "sys-hr", description: "组织人事管理", apiIds: [] },
  // ERP
  { id: "p-erp-home", code: "erp.home", name: "ERP 工作台", subsystemId: "sys-erp", description: "进入 ERP", apiIds: [] },
  { id: "p-erp-report", code: "erp.report", name: "经营报表", subsystemId: "sys-erp", description: "查看经营报表", apiIds: [] },
  { id: "p-erp-finance", code: "erp.finance", name: "财务操作", subsystemId: "sys-erp", description: "财务模块操作", apiIds: [] },
  // CRM
  { id: "p-crm-home", code: "crm.home", name: "CRM 工作台", subsystemId: "sys-crm", description: "进入 CRM", apiIds: [] },
  { id: "p-crm-lead", code: "crm.lead", name: "商机管理", subsystemId: "sys-crm", description: "维护商机", apiIds: [] },
  { id: "p-crm-admin", code: "crm.admin", name: "CRM 管理", subsystemId: "sys-crm", description: "CRM 后台", apiIds: [] },
];

let orgUnits: OrgUnit[] = [
  {
    id: "org-root",
    code: "GROUP",
    name: "中国版权保护中心",
    parentId: null,
    type: "company",
    leaderName: "张主任",
    sort: 0,
    status: "active",
    description: "集团根组织",
  },
  {
    id: "org-tech",
    code: "TECH",
    name: "技术服务事业部",
    parentId: "org-root",
    type: "division",
    leaderName: "李总监",
    sort: 10,
    status: "active",
    description: "技术与平台服务",
  },
  {
    id: "org-ops",
    code: "OPS",
    name: "运营中心",
    parentId: "org-tech",
    type: "department",
    leaderName: "王经理",
    sort: 10,
    status: "active",
    description: "技术服务中心运营",
  },
  {
    id: "org-ops-content",
    code: "OPS-CONTENT",
    name: "内容运营组",
    parentId: "org-ops",
    type: "team",
    leaderName: "王编辑",
    sort: 10,
    status: "active",
    description: "门户内容与专题",
  },
  {
    id: "org-ops-biz",
    code: "OPS-BIZ",
    name: "客户运营组",
    parentId: "org-ops",
    type: "team",
    leaderName: "李运营",
    sort: 20,
    status: "active",
    description: "客户与产品运营",
  },
  {
    id: "org-it",
    code: "IT",
    name: "信息中心",
    parentId: "org-root",
    type: "division",
    leaderName: "赵处长",
    sort: 20,
    status: "active",
    description: "信息系统与 SSO",
  },
  {
    id: "org-it-sso",
    code: "IT-SSO",
    name: "身份认证组",
    parentId: "org-it",
    type: "department",
    leaderName: "系统管理员",
    sort: 10,
    status: "active",
    description: "统一身份与权限",
  },
];

function api(
  partial: Omit<ApiEndpoint, "contentType" | "authRequired" | "requestExample" | "responseExample" | "status" | "sort" | "version" | "tags" | "summary" | "description"> &
    Partial<
      Pick<
        ApiEndpoint,
        | "contentType"
        | "authRequired"
        | "requestExample"
        | "responseExample"
        | "status"
        | "sort"
        | "version"
        | "tags"
        | "summary"
        | "description"
      >
    >,
): ApiEndpoint {
  return {
    contentType: "application/json",
    authRequired: true,
    requestExample: "",
    responseExample: "",
    status: "active",
    sort: 0,
    version: "v1",
    tags: "",
    summary: partial.name,
    description: "",
    ...partial,
  };
}

let apiEndpoints: ApiEndpoint[] = [
  api({
    id: "api-sso-me",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.me.get",
    name: "获取当前用户",
    method: "GET",
    path: "/api/v1/me",
    tags: "账号",
    sort: 1,
    summary: "返回当前登录用户资料与权限摘要",
    description: "需携带 SSO Session / Bearer Token。",
    responseExample: '{\n  "username": "admin",\n  "displayName": "超级管理员"\n}',
  }),
  api({
    id: "api-sso-launcher",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.launcher.list",
    name: "已开通子系统列表",
    method: "GET",
    path: "/api/v1/launcher/systems",
    tags: "入口",
    sort: 2,
    summary: "按当前用户角色返回可进入的业务系统",
  }),
  api({
    id: "api-sso-password",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.password.change",
    name: "修改密码",
    method: "POST",
    path: "/api/v1/account/password",
    tags: "账号",
    sort: 3,
    requestExample: '{\n  "oldPassword": "***",\n  "newPassword": "***"\n}',
  }),
  api({
    id: "api-sso-users-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.users.list",
    name: "用户列表",
    method: "GET",
    path: "/api/v1/users",
    tags: "用户",
    sort: 10,
  }),
  api({
    id: "api-sso-users-get",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.users.get",
    name: "用户详情",
    method: "GET",
    path: "/api/v1/users/{id}",
    tags: "用户",
    sort: 11,
  }),
  api({
    id: "api-sso-users-create",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.users.create",
    name: "创建用户",
    method: "POST",
    path: "/api/v1/users",
    tags: "用户",
    sort: 12,
    requestExample: '{\n  "username": "zhangsan",\n  "displayName": "张三",\n  "orgUnitId": "org-ops",\n  "roleIds": ["r-sso-user"]\n}',
  }),
  api({
    id: "api-sso-users-update",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.users.update",
    name: "更新用户",
    method: "PUT",
    path: "/api/v1/users/{id}",
    tags: "用户",
    sort: 13,
  }),
  api({
    id: "api-sso-roles-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.roles.list",
    name: "角色列表",
    method: "GET",
    path: "/api/v1/roles",
    tags: "角色",
    sort: 20,
  }),
  api({
    id: "api-sso-roles-create",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.roles.create",
    name: "创建角色",
    method: "POST",
    path: "/api/v1/roles",
    tags: "角色",
    sort: 21,
  }),
  api({
    id: "api-sso-roles-update",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.roles.update",
    name: "更新角色",
    method: "PUT",
    path: "/api/v1/roles/{id}",
    tags: "角色",
    sort: 22,
  }),
  api({
    id: "api-sso-perms-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.perms.list",
    name: "权限目录",
    method: "GET",
    path: "/api/v1/permissions",
    tags: "权限",
    sort: 30,
  }),
  api({
    id: "api-sso-perms-create",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.perms.create",
    name: "创建权限点",
    method: "POST",
    path: "/api/v1/permissions",
    tags: "权限",
    sort: 31,
  }),
  api({
    id: "api-sso-perms-update",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.perms.update",
    name: "更新权限点",
    method: "PUT",
    path: "/api/v1/permissions/{id}",
    tags: "权限",
    sort: 32,
    description: "可更新名称、说明及关联 API 列表",
  }),
  api({
    id: "api-sso-sys-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.subsystems.list",
    name: "子系统列表",
    method: "GET",
    path: "/api/v1/subsystems",
    tags: "子系统",
    sort: 40,
  }),
  api({
    id: "api-sso-sys-create",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.subsystems.create",
    name: "创建子系统",
    method: "POST",
    path: "/api/v1/subsystems",
    tags: "子系统",
    sort: 41,
  }),
  api({
    id: "api-sso-sys-update",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.subsystems.update",
    name: "更新子系统",
    method: "PUT",
    path: "/api/v1/subsystems/{id}",
    tags: "子系统",
    sort: 42,
  }),
  api({
    id: "api-sso-org-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.org.list",
    name: "组织树",
    method: "GET",
    path: "/api/v1/org/units",
    tags: "组织",
    sort: 50,
  }),
  api({
    id: "api-sso-org-create",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.org.create",
    name: "创建组织节点",
    method: "POST",
    path: "/api/v1/org/units",
    tags: "组织",
    sort: 51,
  }),
  api({
    id: "api-sso-org-update",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.org.update",
    name: "更新组织节点",
    method: "PUT",
    path: "/api/v1/org/units/{id}",
    tags: "组织",
    sort: 52,
  }),
  api({
    id: "api-sso-apis-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.apis.list",
    name: "接口清单",
    method: "GET",
    path: "/api/v1/apis",
    tags: "接口",
    sort: 60,
  }),
  api({
    id: "api-sso-apis-create",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.apis.create",
    name: "创建接口",
    method: "POST",
    path: "/api/v1/apis",
    tags: "接口",
    sort: 61,
  }),
  api({
    id: "api-sso-apis-update",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.apis.update",
    name: "更新接口",
    method: "PUT",
    path: "/api/v1/apis/{id}",
    tags: "接口",
    sort: 62,
  }),
  api({
    id: "api-ops-customers",
    subsystemId: OPS_SUBSYSTEM_ID,
    code: "ops.customers.list",
    name: "客户列表",
    method: "GET",
    path: "/api/v1/customers",
    tags: "客户",
    sort: 1,
    summary: "技术服务中心客户账号列表",
  }),
  api({
    id: "api-ops-customers-create",
    subsystemId: OPS_SUBSYSTEM_ID,
    code: "ops.customers.create",
    name: "新增客户",
    method: "POST",
    path: "/api/v1/customers",
    tags: "客户",
    sort: 2,
  }),
  api({
    id: "api-ops-content",
    subsystemId: OPS_SUBSYSTEM_ID,
    code: "ops.content.list",
    name: "内容管理列表",
    method: "GET",
    path: "/api/v1/content/articles",
    tags: "内容",
    sort: 10,
  }),
  api({
    id: "api-oa-home",
    subsystemId: "sys-oa",
    code: "oa.home.get",
    name: "OA 工作台",
    method: "GET",
    path: "/api/v1/oa/desk",
    tags: "工作台",
    sort: 1,
  }),
  api({
    id: "api-oa-tasks",
    subsystemId: "sys-oa",
    code: "oa.tasks.list",
    name: "待办审批",
    method: "GET",
    path: "/api/v1/oa/tasks",
    tags: "审批",
    sort: 2,
  }),
  api({
    id: "api-oa-approve",
    subsystemId: "sys-oa",
    code: "oa.tasks.approve",
    name: "提交审批意见",
    method: "POST",
    path: "/api/v1/oa/tasks/{id}/approve",
    tags: "审批",
    sort: 3,
    requestExample: '{\n  "action": "pass",\n  "comment": "同意"\n}',
  }),
];

// 将 ops 部分权限预绑定演示接口
permissions = permissions.map((p) => {
  if (p.id === "customers.list") return { ...p, apiIds: ["api-ops-customers"] };
  if (p.id === "customers.list.create") return { ...p, apiIds: ["api-ops-customers-create"] };
  if (p.id === "content.center") return { ...p, apiIds: ["api-ops-content"] };
  return p;
});

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
      "p-sso-perms-write",
      "p-sso-subsystems",
      "p-sso-subsystems-write",
      "p-sso-org",
      "p-sso-org-write",
      "p-sso-apis",
      "p-sso-apis-write",
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
  // 技术服务中心（与 ops rolesStore 对齐）
  ...OPS_SEED_ROLES.map((r) => ({
    id: r.id,
    code: r.code,
    name: r.name,
    subsystemId: OPS_SUBSYSTEM_ID,
    description: r.description,
    permissionIds: [...r.permissionIds],
    status: "active" as const,
  })),
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
    displayName: "超级管理员",
    password: "admin123",
    status: "active",
    orgUnitId: "org-it-sso",
    roleIds: [
      "r-sso-admin",
      "role-super",
      "r-oa-admin",
      "r-hr-admin",
      "r-erp-user",
      "r-crm-user",
    ],
    createdAt: "2026-01-01 10:00:00",
    updatedAt: "2026-01-01 10:00:00",
  },
  {
    id: "u-wang",
    username: "wang_editor",
    displayName: "王编辑",
    password: "demo123456",
    status: "active",
    orgUnitId: "org-ops-content",
    roleIds: ["r-sso-user", "role-ops"],
    createdAt: "2026-02-01 09:00:00",
    updatedAt: "2026-02-01 09:00:00",
  },
  {
    id: "u-li",
    username: "li_ops",
    displayName: "李运营",
    password: "demo123456",
    status: "active",
    orgUnitId: "org-ops-biz",
    roleIds: ["r-sso-user", "role-ops"],
    createdAt: "2026-02-05 10:00:00",
    updatedAt: "2026-02-05 10:00:00",
  },
  {
    id: "u-viewer",
    username: "viewer01",
    displayName: "观察员甲",
    password: "demo123456",
    status: "disabled",
    orgUnitId: "org-ops",
    roleIds: ["r-sso-user", "role-viewer"],
    createdAt: "2026-02-08 14:00:00",
    updatedAt: "2026-02-08 14:00:00",
  },
  {
    id: "u-zhangsan",
    username: "zhangsan",
    displayName: "张三",
    password: "demo123456",
    status: "active",
    orgUnitId: "org-tech",
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
    orgUnitId: "org-it",
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
  orgUnitId?: string | null;
}): { ok: true; user: SsoUser } | { ok: false; message: string } {
  const username = input.username.trim();
  if (!/^[a-zA-Z][a-zA-Z0-9._-]{2,31}$/.test(username)) {
    return { ok: false, message: "用户名须字母开头，3–32 位，仅含字母数字._-" };
  }
  if (findUserByUsername(username)) return { ok: false, message: "用户名已存在" };
  if (input.password.length < 6) return { ok: false, message: "密码至少 6 位" };
  if (input.orgUnitId && !getOrgUnit(input.orgUnitId)) {
    return { ok: false, message: "所属组织不存在" };
  }
  userSeq += 1;
  const user: SsoUser = {
    id: `u-${userSeq}`,
    username,
    displayName: input.displayName.trim() || username,
    password: input.password,
    status: input.status,
    roleIds: [...new Set(input.roleIds)],
    orgUnitId: input.orgUnitId ?? null,
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
    orgUnitId?: string | null;
  },
): { ok: true } | { ok: false; message: string } {
  const user = getUser(id);
  if (!user) return { ok: false, message: "用户不存在" };
  if (input.password !== undefined && input.password !== "" && input.password.length < 6) {
    return { ok: false, message: "密码至少 6 位" };
  }
  if (input.orgUnitId && !getOrgUnit(input.orgUnitId)) {
    return { ok: false, message: "所属组织不存在" };
  }
  users = users.map((u) =>
    u.id === id
      ? {
          ...u,
          displayName: input.displayName.trim() || u.displayName,
          roleIds: [...new Set(input.roleIds)],
          status: input.status,
          password: input.password ? input.password : u.password,
          orgUnitId: input.orgUnitId === undefined ? u.orgUnitId : input.orgUnitId,
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
  apiIds?: string[];
}): { ok: true } | { ok: false; message: string } {
  const code = input.code.trim();
  if (!code) return { ok: false, message: "请填写权限编码" };
  if (permissions.some((p) => p.code === code)) return { ok: false, message: "权限编码已存在" };
  if (!getSubsystem(input.subsystemId)) return { ok: false, message: "子系统不存在" };
  const apiIds = sanitizeApiIds(input.subsystemId, input.apiIds ?? []);
  permSeq += 1;
  permissions = [
    {
      id: `p-${permSeq}`,
      code,
      name: input.name.trim(),
      subsystemId: input.subsystemId,
      description: input.description.trim(),
      apiIds,
    },
    ...permissions,
  ];
  emit();
  return { ok: true };
}

export function updatePermission(
  id: string,
  input: {
    name: string;
    description: string;
    apiIds: string[];
  },
): { ok: true } | { ok: false; message: string } {
  const perm = permissions.find((p) => p.id === id);
  if (!perm) return { ok: false, message: "权限不存在" };
  const apiIds = sanitizeApiIds(perm.subsystemId, input.apiIds);
  permissions = permissions.map((p) =>
    p.id === id
      ? {
          ...p,
          name: input.name.trim(),
          description: input.description.trim(),
          apiIds,
        }
      : p,
  );
  emit();
  return { ok: true };
}

function sanitizeApiIds(subsystemId: string, apiIds: string[]) {
  const allowed = new Set(
    apiEndpoints.filter((a) => a.subsystemId === subsystemId).map((a) => a.id),
  );
  return [...new Set(apiIds)].filter((id) => allowed.has(id));
}

export const ORG_TYPE_LABEL: Record<OrgUnitType, string> = {
  company: "单位",
  division: "事业部",
  department: "部门",
  team: "小组",
};

export function listOrgUnits() {
  return orgUnits.slice().sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
}

export function getOrgUnit(id: string) {
  return orgUnits.find((o) => o.id === id) ?? null;
}

export function getOrgPathLabel(id: string | null | undefined): string {
  if (!id) return "—";
  const parts: string[] = [];
  let cur = getOrgUnit(id);
  const guard = new Set<string>();
  while (cur && !guard.has(cur.id)) {
    guard.add(cur.id);
    parts.unshift(cur.name);
    cur = cur.parentId ? getOrgUnit(cur.parentId) : null;
  }
  return parts.join(" / ") || "—";
}

export type OrgTreeNode = OrgUnit & { children: OrgTreeNode[] };

export function buildOrgTree(includeDisabled = true): OrgTreeNode[] {
  const list = listOrgUnits().filter((o) => includeDisabled || o.status === "active");
  const map = new Map<string, OrgTreeNode>();
  for (const o of list) map.set(o.id, { ...o, children: [] });
  const roots: OrgTreeNode[] = [];
  for (const o of list) {
    const node = map.get(o.id)!;
    if (o.parentId && map.has(o.parentId)) map.get(o.parentId)!.children.push(node);
    else roots.push(node);
  }
  const sortRec = (nodes: OrgTreeNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
}

export function createOrgUnit(input: {
  code: string;
  name: string;
  parentId: string | null;
  type: OrgUnitType;
  leaderName: string;
  sort: number;
  description: string;
}): { ok: true } | { ok: false; message: string } {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, message: "请填写组织编码" };
  if (orgUnits.some((o) => o.code.toUpperCase() === code)) {
    return { ok: false, message: "组织编码已存在" };
  }
  if (input.parentId && !getOrgUnit(input.parentId)) {
    return { ok: false, message: "上级组织不存在" };
  }
  orgSeq += 1;
  orgUnits = [
    ...orgUnits,
    {
      id: `org-${orgSeq}`,
      code,
      name: input.name.trim(),
      parentId: input.parentId,
      type: input.type,
      leaderName: input.leaderName.trim(),
      sort: input.sort,
      status: "active",
      description: input.description.trim(),
    },
  ];
  emit();
  return { ok: true };
}

export function updateOrgUnit(
  id: string,
  input: {
    name: string;
    parentId: string | null;
    type: OrgUnitType;
    leaderName: string;
    sort: number;
    status: EntityStatus;
    description: string;
  },
): { ok: true } | { ok: false; message: string } {
  const unit = getOrgUnit(id);
  if (!unit) return { ok: false, message: "组织不存在" };
  if (input.parentId === id) return { ok: false, message: "上级组织不能是自身" };
  if (input.parentId) {
    if (!getOrgUnit(input.parentId)) return { ok: false, message: "上级组织不存在" };
    // 禁止把节点挂到自己的子孙下
    let cur: OrgUnit | null = getOrgUnit(input.parentId);
    const guard = new Set<string>();
    while (cur && !guard.has(cur.id)) {
      if (cur.id === id) return { ok: false, message: "不能将组织挂到其子节点下" };
      guard.add(cur.id);
      cur = cur.parentId ? getOrgUnit(cur.parentId) : null;
    }
  }
  if (id === "org-root" && input.parentId) {
    return { ok: false, message: "根组织不能设置上级" };
  }
  orgUnits = orgUnits.map((o) =>
    o.id === id
      ? {
          ...o,
          name: input.name.trim(),
          parentId: id === "org-root" ? null : input.parentId,
          type: input.type,
          leaderName: input.leaderName.trim(),
          sort: input.sort,
          status: input.status,
          description: input.description.trim(),
        }
      : o,
  );
  emit();
  return { ok: true };
}

export function listApis(subsystemId?: string) {
  return apiEndpoints
    .filter((a) => !subsystemId || a.subsystemId === subsystemId)
    .slice()
    .sort((a, b) => a.sort - b.sort || a.code.localeCompare(b.code));
}

export function getApi(id: string) {
  return apiEndpoints.find((a) => a.id === id) ?? null;
}

/** 当前已关联某接口的权限点 id 列表 */
export function getPermissionIdsForApi(apiId: string) {
  return permissions.filter((p) => p.apiIds.includes(apiId)).map((p) => p.id);
}

function syncApiPermissionLinks(apiId: string, subsystemId: string, permissionIds: string[]) {
  const selected = new Set(permissionIds);
  permissions = permissions.map((p) => {
    if (p.subsystemId !== subsystemId) return p;
    const has = p.apiIds.includes(apiId);
    const want = selected.has(p.id);
    if (has === want) return p;
    if (want) return { ...p, apiIds: [...new Set([...p.apiIds, apiId])] };
    return { ...p, apiIds: p.apiIds.filter((id) => id !== apiId) };
  });
}

export function createApi(input: {
  subsystemId: string;
  code: string;
  name: string;
  method: HttpMethod;
  path: string;
  summary: string;
  description: string;
  authRequired: boolean;
  permissionIds?: string[];
}): { ok: true; id: string } | { ok: false; message: string } {
  const code = input.code.trim();
  const path = input.path.trim();
  if (!code) return { ok: false, message: "请填写接口编码" };
  if (!path.startsWith("/")) return { ok: false, message: "路径须以 / 开头" };
  if (!getSubsystem(input.subsystemId)) return { ok: false, message: "子系统不存在" };
  if (apiEndpoints.some((a) => a.subsystemId === input.subsystemId && a.code === code)) {
    return { ok: false, message: "该子系统下接口编码已存在" };
  }
  apiSeq += 1;
  const id = `api-${apiSeq}`;
  apiEndpoints = [
    ...apiEndpoints,
    {
      id,
      subsystemId: input.subsystemId,
      code,
      name: input.name.trim(),
      method: input.method,
      path,
      version: "v1",
      summary: input.summary.trim() || input.name.trim(),
      description: input.description.trim(),
      contentType: "application/json",
      authRequired: input.authRequired,
      requestExample: "",
      responseExample: "",
      tags: "",
      status: "active",
      sort: apiEndpoints.filter((a) => a.subsystemId === input.subsystemId).length + 1,
    },
  ];
  syncApiPermissionLinks(id, input.subsystemId, input.permissionIds ?? []);
  emit();
  return { ok: true, id };
}

export function updateApi(
  id: string,
  input: {
    name: string;
    method: HttpMethod;
    path: string;
    summary: string;
    description: string;
    authRequired: boolean;
    status: EntityStatus;
    permissionIds?: string[];
  },
): { ok: true } | { ok: false; message: string } {
  const item = getApi(id);
  if (!item) return { ok: false, message: "接口不存在" };
  const path = input.path.trim();
  if (!path.startsWith("/")) return { ok: false, message: "路径须以 / 开头" };
  apiEndpoints = apiEndpoints.map((a) =>
    a.id === id
      ? {
          ...a,
          name: input.name.trim(),
          method: input.method,
          path,
          summary: input.summary.trim() || input.name.trim(),
          description: input.description.trim(),
          authRequired: input.authRequired,
          status: input.status,
        }
      : a,
  );
  if (input.permissionIds) {
    syncApiPermissionLinks(id, item.subsystemId, input.permissionIds);
  }
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
