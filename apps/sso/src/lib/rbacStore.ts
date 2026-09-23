/**
 * SSO RBAC 数据模型（前端演示）
 *
 * - User.username：全集团唯一身份（可与入职邮箱同值，但 SSO 侧只存统一用户名）
 * - Role 归属某一子系统（含 SSO 平台本身 subsystemId = "sso"）
 * - 用户可绑定多个子系统下的多个角色 → 开通多系统权限
 * - 演示子系统：SSO / DCI管理中心运营后台 / DCI®技术服务中心运营后台
 *   （技术服务中心 customer 不走 SSO，只能从 home 工作台进入；C端用户中心运营后台暂下线）
 * - DCI管理中心（ops）权限树 / 角色与 apps/ops 对齐；首页不展示本平台入口
 */

import {
  flattenOpsPermissions,
  OPS_SEED_ROLES,
  OPS_SUBSYSTEM_ID,
} from "@/lib/opsPermissionSeed";
import { OPS_DCI_URL, OPS_URL, UCENTER_URL } from "@/lib/publicEnv";

export type EntityStatus = "active" | "disabled";

export { OPS_SUBSYSTEM_ID };

/** DCI管理中心运营后台（apps/ops-dci 镜像） */
export const OPS_DCI_SUBSYSTEM_ID = "sys-ops-dci";

/** DCI®技术服务中心（客户控制台 apps/customer） */
export const CUSTOMER_SUBSYSTEM_ID = "sys-customer";

/** C端用户中心运营后台（C 端会员运营 apps/uc-ops） */
export const UC_OPS_SUBSYSTEM_ID = "sys-uc-ops";

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

export type MenuType = "directory" | "menu" | "button";

export type Permission = {
  id: string;
  /** 权限标识（按钮必填；菜单作页面标识；目录可填分组编码） */
  code: string;
  name: string;
  /** 所属子系统；sso = 本平台权限 */
  subsystemId: string;
  description: string;
  /** 关联的该子系统 API 接口（可多选） */
  apiIds: string[];
  menuType: MenuType;
  parentId: string | null;
  /** 路由路径（目录 / 菜单） */
  routePath: string;
  /** 页面组件（菜单） */
  component: string;
  sort: number;
  /** 显示状态 */
  visible: boolean;
};

export const MENU_TYPE_LABEL: Record<MenuType, string> = {
  directory: "目录",
  menu: "菜单",
  button: "按钮",
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

/** 角色履职绑定：同一角色可管辖多个部门 */
export type RoleBinding = {
  roleId: string;
  orgUnitIds: string[];
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
  /** 唯一归属部门 */
  orgUnitId: string;
  /** 角色及各自履职部门（同角色可多部门） */
  roleBindings: RoleBinding[];
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
    name: "用户统一认证系统",
    description: "本平台：统一登录入口与身份、组织、角色、菜单权限管理",
    entryUrl: "",
    accent: "#0f3786",
    status: "active",
    sort: 0,
  },
  {
    id: OPS_DCI_SUBSYSTEM_ID,
    code: "ops-dci",
    name: "DCI管理中心运营后台",
    description: "DCI 注册中心审核、发码统计、码管理与门户内容（镜像演示）",
    entryUrl: OPS_DCI_URL,
    accent: "#1449b2",
    status: "active",
    sort: 10,
  },
  {
    id: OPS_SUBSYSTEM_ID,
    code: "ops",
    name: "DCI®技术服务中心运营后台",
    description: "运营管理后台：客户、合同、产品上架、内容与系统配置",
    entryUrl: OPS_URL,
    accent: "#0B62B8",
    status: "active",
    sort: 20,
  },
  {
    id: UC_OPS_SUBSYSTEM_ID,
    code: "uc-ops",
    name: "C端用户中心运营后台",
    description: "C 端注册用户运营：账号状态、安全审计、入驻关系只读汇总",
    entryUrl: UCENTER_URL,
    accent: "#0f3786",
    // 暂时下线：不在启动器展示；子系统管理仍可见（停用）
    status: "disabled",
    sort: 30,
  },
];

const opsPermissions: Permission[] = flattenOpsPermissions().map((p) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  description: p.description,
  subsystemId: OPS_SUBSYSTEM_ID,
  apiIds: [] as string[],
  menuType: p.menuType,
  parentId: p.parentId,
  routePath: p.menuType === "button" ? "" : `/${p.code.replace(/\./g, "/")}`,
  component: p.menuType === "menu" ? `ops/${p.code.replace(/\./g, "/")}/index` : "",
  sort: p.sort,
  visible: true,
}));

function ssoPerm(
  partial: Omit<Permission, "subsystemId" | "visible" | "description" | "routePath" | "component" | "apiIds"> &
    Partial<Pick<Permission, "description" | "routePath" | "component" | "apiIds" | "visible">>,
): Permission {
  return {
    description: "",
    routePath: "",
    component: "",
    apiIds: [],
    visible: true,
    subsystemId: SSO_SUBSYSTEM_ID,
    ...partial,
  };
}

let permissions: Permission[] = [
  // —— 用户统一认证系统：目录 / 菜单 / 按钮 ——
  ssoPerm({
    id: "p-sso-dir-workspace",
    code: "sso.dir.workspace",
    name: "工作台",
    menuType: "directory",
    parentId: null,
    routePath: "/",
    sort: 10,
    description: "门户与个人入口",
  }),
  ssoPerm({
    id: "p-sso-launcher",
    code: "sso.launcher",
    name: "首页",
    menuType: "menu",
    parentId: "p-sso-dir-workspace",
    routePath: "/home",
    component: "pages/LauncherPage",
    sort: 10,
    description: "登录后查看已开通子系统",
    apiIds: ["api-sso-me", "api-sso-launcher"],
  }),
  ssoPerm({
    id: "p-sso-password",
    code: "sso.password",
    name: "修改密码",
    menuType: "menu",
    parentId: "p-sso-dir-workspace",
    routePath: "",
    component: "components/ChangePasswordDialog",
    sort: 20,
    description: "原密码校验后修改密码（弹窗）",
    apiIds: ["api-sso-password"],
  }),
  ssoPerm({
    id: "p-sso-dir-system",
    code: "sso.dir.system",
    name: "系统管理",
    menuType: "directory",
    parentId: null,
    routePath: "/admin",
    sort: 20,
    description: "身份、组织与权限配置",
  }),
  ssoPerm({
    id: "p-sso-users",
    code: "sso.users",
    name: "用户管理",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "users",
    component: "pages/admin/UsersPage",
    sort: 10,
    description: "查看与维护 SSO 用户",
    apiIds: ["api-sso-users-list", "api-sso-users-get"],
  }),
  ssoPerm({
    id: "p-sso-users-write",
    code: "sso.users.write",
    name: "用户编辑",
    menuType: "button",
    parentId: "p-sso-users",
    sort: 10,
    description: "新增/编辑用户及角色绑定",
    apiIds: ["api-sso-users-create", "api-sso-users-update"],
  }),
  ssoPerm({
    id: "p-sso-org",
    code: "sso.org",
    name: "组织结构",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "org",
    component: "pages/admin/OrgPage",
    sort: 20,
    description: "查看组织结构",
    apiIds: ["api-sso-org-list"],
  }),
  ssoPerm({
    id: "p-sso-org-write",
    code: "sso.org.write",
    name: "组织编辑",
    menuType: "button",
    parentId: "p-sso-org",
    sort: 10,
    description: "维护组织树节点",
    apiIds: ["api-sso-org-create", "api-sso-org-update"],
  }),
  ssoPerm({
    id: "p-sso-roles",
    code: "sso.roles",
    name: "角色管理",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "roles",
    component: "pages/admin/RolesPage",
    sort: 30,
    description: "查看与维护角色",
    apiIds: ["api-sso-roles-list"],
  }),
  ssoPerm({
    id: "p-sso-roles-write",
    code: "sso.roles.write",
    name: "角色编辑",
    menuType: "button",
    parentId: "p-sso-roles",
    sort: 10,
    description: "新增/编辑角色及权限",
    apiIds: ["api-sso-roles-create", "api-sso-roles-update"],
  }),
  ssoPerm({
    id: "p-sso-perms",
    code: "sso.perms",
    name: "菜单管理",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "permissions",
    component: "pages/admin/PermissionsPage",
    sort: 40,
    description: "查看菜单与权限点定义",
    apiIds: ["api-sso-perms-list"],
  }),
  ssoPerm({
    id: "p-sso-perms-write",
    code: "sso.perms.write",
    name: "菜单编辑",
    menuType: "button",
    parentId: "p-sso-perms",
    sort: 10,
    description: "维护菜单权限点及关联接口",
    apiIds: ["api-sso-perms-create", "api-sso-perms-update"],
  }),
  ssoPerm({
    id: "p-sso-subsystems",
    code: "sso.subsystems",
    name: "子系统管理",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "subsystems",
    component: "pages/admin/SubsystemsPage",
    sort: 50,
    description: "维护可接入子系统",
    apiIds: ["api-sso-sys-list"],
  }),
  ssoPerm({
    id: "p-sso-subsystems-write",
    code: "sso.subsystems.write",
    name: "子系统编辑",
    menuType: "button",
    parentId: "p-sso-subsystems",
    sort: 10,
    description: "新增/编辑子系统",
    apiIds: ["api-sso-sys-create", "api-sso-sys-update"],
  }),
  ssoPerm({
    id: "p-sso-apis",
    code: "sso.apis",
    name: "接口管理",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "apis",
    component: "pages/admin/ApisPage",
    sort: 60,
    description: "查看子系统 API 清单",
    apiIds: ["api-sso-apis-list"],
  }),
  ssoPerm({
    id: "p-sso-apis-write",
    code: "sso.apis.write",
    name: "接口编辑",
    menuType: "button",
    parentId: "p-sso-apis",
    sort: 10,
    description: "维护 API 接口定义",
    apiIds: ["api-sso-apis-create", "api-sso-apis-update"],
  }),
  ssoPerm({
    id: "p-sso-logs",
    code: "sso.logs",
    name: "系统日志",
    menuType: "menu",
    parentId: "p-sso-dir-system",
    routePath: "logs",
    component: "pages/admin/SystemLogsPage",
    sort: 70,
    description: "查看系统操作审计日志",
    apiIds: ["api-sso-logs-list", "api-sso-logs-get"],
  }),
  ssoPerm({
    id: "p-sso-dir-portal",
    code: "sso.dir.portal",
    name: "门户运营管理",
    menuType: "directory",
    parentId: null,
    routePath: "/admin/portal-users",
    sort: 15,
    description: "门户（C 端）注册用户查询与账号状态操作",
  }),
  ssoPerm({
    id: "p-sso-portal-users",
    code: "sso.portal.users",
    name: "门户用户列表",
    menuType: "menu",
    parentId: "p-sso-dir-portal",
    routePath: "portal-users",
    component: "pages/admin/PortalUsersPage",
    sort: 10,
    description: "查看门户注册用户（脱敏手机号，11 位精准搜索）",
    apiIds: ["api-sso-portal-users-list", "api-sso-portal-users-get"],
  }),
  ssoPerm({
    id: "p-sso-portal-users-write",
    code: "sso.portal.users.write",
    name: "冻结/解冻",
    menuType: "button",
    parentId: "p-sso-portal-users",
    sort: 10,
    description: "变更门户用户冻结状态",
    apiIds: ["api-sso-portal-users-freeze", "api-sso-portal-users-unfreeze"],
  }),
  // DCI管理中心（与 ops 权限树对齐）
  ...opsPermissions,
  // DCI®技术服务中心
  {
    id: "p-tsc-dir-console",
    code: "tsc.dir.console",
    name: "客户控制台",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    description: "技术服务中心入口",
    apiIds: [],
    menuType: "directory",
    parentId: null,
    routePath: "/",
    component: "",
    sort: 10,
    visible: true,
  },
  {
    id: "p-tsc-home",
    code: "tsc.home",
    name: "控制台首页",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    description: "进入客户控制台",
    apiIds: ["api-tsc-home"],
    menuType: "menu",
    parentId: "p-tsc-dir-console",
    routePath: "/",
    component: "pages/HomePage",
    sort: 10,
    visible: true,
  },
  {
    id: "p-tsc-verify",
    code: "tsc.verify",
    name: "版权核验服务",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    description: "使用 DCI / 信息 / 证书核验",
    apiIds: ["api-tsc-verify"],
    menuType: "menu",
    parentId: "p-tsc-dir-console",
    routePath: "verify/dci",
    component: "pages/verify/DciVerifyPage",
    sort: 20,
    visible: true,
  },
  {
    id: "p-tsc-api",
    code: "tsc.api",
    name: "API 接入",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    description: "查看接口文档与密钥",
    apiIds: [],
    menuType: "menu",
    parentId: "p-tsc-dir-console",
    routePath: "api-docs",
    component: "pages/api-docs/ApiDocsOverviewPage",
    sort: 30,
    visible: true,
  },
  // DCI管理中心运营管理平台（ops-dci）
  {
    id: "p-ops-dci-home",
    code: "ops_dci.home",
    name: "运营管理平台首页",
    subsystemId: OPS_DCI_SUBSYSTEM_ID,
    description: "进入 DCI 管理中心运营管理平台",
    apiIds: [],
    menuType: "menu",
    parentId: null,
    routePath: "/",
    component: "index",
    sort: 10,
    visible: true,
  },
  // 用户中心运营
  {
    id: "p-uco-dir",
    code: "uco.dir",
    name: "用户中心运营",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "C 端用户运营目录",
    apiIds: [],
    menuType: "directory",
    parentId: null,
    routePath: "/",
    component: "",
    sort: 10,
    visible: true,
  },
  {
    id: "p-uco-dashboard",
    code: "uco.dashboard",
    name: "首页",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "运营总览",
    apiIds: [],
    menuType: "menu",
    parentId: "p-uco-dir",
    routePath: "dashboard",
    component: "pages/DashboardPage",
    sort: 10,
    visible: true,
  },
  {
    id: "p-uco-users",
    code: "uco.users",
    name: "全部用户",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "查看 C 端注册用户",
    apiIds: [],
    menuType: "menu",
    parentId: "p-uco-dir",
    routePath: "users",
    component: "pages/users/UsersPage",
    sort: 20,
    visible: true,
  },
  {
    id: "p-uco-users-write",
    code: "uco.users.write",
    name: "冻结/解冻",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "变更 C 端用户状态（暂隐藏）",
    apiIds: [],
    menuType: "button",
    parentId: "p-uco-users",
    routePath: "",
    component: "",
    sort: 10,
    visible: false,
  },
  {
    id: "p-uco-security",
    code: "uco.security",
    name: "用户安全日志",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "用户安全相关操作日志",
    apiIds: [],
    menuType: "menu",
    parentId: "p-uco-dir",
    routePath: "security/logs",
    component: "pages/security/SecurityLogsPage",
    sort: 30,
    visible: true,
  },
  {
    id: "p-uco-oplogs",
    code: "uco.oplogs",
    name: "操作日志",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "运营审计",
    apiIds: [],
    menuType: "menu",
    parentId: "p-uco-dir",
    routePath: "system/op-logs",
    component: "pages/system/OpLogsPage",
    sort: 40,
    visible: true,
  },
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
    description: "DCI管理中心运营",
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
    id: "api-sso-portal-users-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.portal.users.list",
    name: "门户用户列表",
    method: "GET",
    path: "/api/v1/portal-users",
    tags: "门户用户",
    sort: 8,
    summary: "查询门户（C 端）注册用户列表",
  }),
  api({
    id: "api-sso-portal-users-get",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.portal.users.get",
    name: "门户用户详情",
    method: "GET",
    path: "/api/v1/portal-users/{id}",
    tags: "门户用户",
    sort: 9,
    summary: "查询门户用户详情（含入驻关系）",
  }),
  api({
    id: "api-sso-portal-users-freeze",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.portal.users.freeze",
    name: "冻结门户用户",
    method: "POST",
    path: "/api/v1/portal-users/{id}/freeze",
    tags: "门户用户",
    sort: 9.1,
    summary: "冻结门户注册用户，限制其登录",
  }),
  api({
    id: "api-sso-portal-users-unfreeze",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.portal.users.unfreeze",
    name: "解冻门户用户",
    method: "POST",
    path: "/api/v1/portal-users/{id}/unfreeze",
    tags: "门户用户",
    sort: 9.2,
    summary: "解除门户用户冻结状态",
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
    requestExample: '{\n  "username": "zhangsan",\n  "displayName": "张三",\n  "orgUnitId": "org-ops",\n  "roleBindings": [{ "roleId": "r-sso-user", "orgUnitIds": ["org-ops"] }]\n}',
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
    name: "菜单管理",
    method: "GET",
    path: "/api/v1/permissions",
    tags: "菜单",
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
    id: "api-sso-logs-list",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.logs.list",
    name: "系统日志列表",
    method: "GET",
    path: "/api/v1/system-logs",
    tags: "系统日志",
    sort: 70,
    summary: "分页查询系统操作日志",
  }),
  api({
    id: "api-sso-logs-get",
    subsystemId: SSO_SUBSYSTEM_ID,
    code: "sso.logs.get",
    name: "系统日志详情",
    method: "GET",
    path: "/api/v1/system-logs/{id}",
    tags: "系统日志",
    sort: 71,
    summary: "查询单条系统操作日志详情",
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
    summary: "DCI管理中心机构账号列表",
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
    id: "api-tsc-home",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    code: "tsc.home.get",
    name: "控制台首页",
    method: "GET",
    path: "/api/v1/console/home",
    tags: "工作台",
    sort: 1,
  }),
  api({
    id: "api-tsc-verify",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    code: "tsc.verify.submit",
    name: "提交核验",
    method: "POST",
    path: "/api/v1/verify/dci",
    tags: "核验",
    sort: 2,
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
      "p-sso-dir-workspace",
      "p-sso-dir-system",
      "p-sso-dir-portal",
      "p-sso-launcher",
      "p-sso-password",
      "p-sso-portal-users",
      "p-sso-portal-users-write",
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
      "p-sso-logs",
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
  // DCI管理中心（与 ops rolesStore 对齐）
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
    id: "r-ops-dci-admin",
    code: "ops_dci_admin",
    name: "DCI运营管理平台管理员",
    subsystemId: OPS_DCI_SUBSYSTEM_ID,
    description: "访问 DCI 管理中心运营管理平台（镜像演示）",
    permissionIds: ["p-ops-dci-home"],
    status: "active",
  },
  {
    id: "r-tsc-user",
    code: "tsc_user",
    name: "技术服务中心用户",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    description: "使用核验与查看文档",
    permissionIds: ["p-tsc-dir-console", "p-tsc-home", "p-tsc-verify", "p-tsc-api"],
    status: "active",
  },
  {
    id: "r-tsc-admin",
    code: "tsc_admin",
    name: "技术服务中心管理员",
    subsystemId: CUSTOMER_SUBSYSTEM_ID,
    description: "控制台全权限（演示）",
    permissionIds: ["p-tsc-dir-console", "p-tsc-home", "p-tsc-verify", "p-tsc-api"],
    status: "active",
  },
  {
    id: "r-uco-admin",
    code: "uco_admin",
    name: "用户中心运营管理员",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "查看并冻结/解冻 C 端用户",
    permissionIds: [
      "p-uco-dir",
      "p-uco-dashboard",
      "p-uco-users",
      "p-uco-users-write",
      "p-uco-security",
      "p-uco-oplogs",
    ],
    status: "active",
  },
  {
    id: "r-uco-viewer",
    code: "uco_viewer",
    name: "用户中心运营只读",
    subsystemId: UC_OPS_SUBSYSTEM_ID,
    description: "仅查看 C 端用户与日志",
    permissionIds: ["p-uco-dir", "p-uco-dashboard", "p-uco-users", "p-uco-security", "p-uco-oplogs"],
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
    roleBindings: [
      { roleId: "r-sso-admin", orgUnitIds: ["org-root"] },
      { roleId: "role-super", orgUnitIds: ["org-ops"] },
      { roleId: "r-ops-dci-admin", orgUnitIds: ["org-ops"] },
      { roleId: "r-uco-admin", orgUnitIds: ["org-root"] },
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
    roleBindings: [
      { roleId: "r-sso-user", orgUnitIds: ["org-ops-content"] },
      { roleId: "role-ops", orgUnitIds: ["org-ops-content", "org-ops-biz"] },
      { roleId: "r-ops-dci-admin", orgUnitIds: ["org-ops-content"] },
    ],
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
    roleBindings: [
      { roleId: "r-sso-user", orgUnitIds: ["org-ops-biz"] },
      { roleId: "role-ops", orgUnitIds: ["org-ops-biz"] },
      { roleId: "r-ops-dci-admin", orgUnitIds: ["org-ops-biz"] },
    ],
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
    roleBindings: [
      { roleId: "r-sso-user", orgUnitIds: ["org-ops"] },
      { roleId: "role-viewer", orgUnitIds: ["org-ops"] },
    ],
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
    roleBindings: [
      { roleId: "r-sso-user", orgUnitIds: ["org-tech"] },
      { roleId: "r-tsc-user", orgUnitIds: ["org-tech"] },
    ],
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
    roleBindings: [
      { roleId: "r-sso-user", orgUnitIds: ["org-it"] },
      { roleId: "r-tsc-user", orgUnitIds: ["org-it"] },
      { roleId: "role-viewer", orgUnitIds: ["org-ops"] },
    ],
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
    .sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name) || a.code.localeCompare(b.code));
}

export function getPermission(id: string) {
  return permissions.find((p) => p.id === id) ?? null;
}

export type PermissionTreeNode = Permission & { children: PermissionTreeNode[] };

export function buildPermissionTree(subsystemId?: string): PermissionTreeNode[] {
  const list = listPermissions(subsystemId);
  const map = new Map<string, PermissionTreeNode>();
  for (const p of list) map.set(p.id, { ...p, children: [] });
  const roots: PermissionTreeNode[] = [];
  for (const p of list) {
    const node = map.get(p.id)!;
    if (p.parentId && map.has(p.parentId)) {
      map.get(p.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }
  const sortRec = (nodes: PermissionTreeNode[]) => {
    nodes.sort((a, b) => a.sort - b.sort || a.name.localeCompare(b.name));
    nodes.forEach((n) => sortRec(n.children));
  };
  sortRec(roots);
  return roots;
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

export function getUserRoleIds(user: SsoUser): string[] {
  return [...new Set(user.roleBindings.map((b) => b.roleId))];
}

export function getUserPermissionCodes(user: SsoUser): Set<string> {
  const codes = new Set<string>();
  for (const rid of getUserRoleIds(user)) {
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
  for (const rid of getUserRoleIds(user)) {
    const role = getRole(rid);
    if (!role || role.status !== "active") continue;
    if (role.subsystemId === SSO_SUBSYSTEM_ID) continue;
    ids.add(role.subsystemId);
  }
  return listSubsystems(false).filter((s) => s.status === "active" && ids.has(s.id));
}

/** 某组织节点及其全部下级 id */
export function getOrgSubtreeIds(rootId: string): Set<string> {
  const result = new Set<string>();
  if (!getOrgUnit(rootId)) return result;
  const childrenByParent = new Map<string, string[]>();
  for (const o of orgUnits) {
    if (!o.parentId) continue;
    const list = childrenByParent.get(o.parentId) ?? [];
    list.push(o.id);
    childrenByParent.set(o.parentId, list);
  }
  const walk = (id: string) => {
    result.add(id);
    for (const child of childrenByParent.get(id) ?? []) walk(child);
  };
  walk(rootId);
  return result;
}

/**
 * 当前账号可管辖的组织范围：
 * 各角色履职部门及其下级的并集（演示环境暂用全部角色身份的并集；后续可按「当前身份」收窄）。
 */
export function getManagedOrgIds(actor: SsoUser): Set<string> {
  const ids = new Set<string>();
  for (const binding of actor.roleBindings) {
    for (const orgId of binding.orgUnitIds) {
      for (const id of getOrgSubtreeIds(orgId)) ids.add(id);
    }
  }
  return ids;
}

export function listAssignableOrgUnits(actor: SsoUser, includeDisabled = false): OrgUnit[] {
  const allowed = getManagedOrgIds(actor);
  return listOrgUnits().filter(
    (o) => allowed.has(o.id) && (includeDisabled || o.status === "active"),
  );
}

export function formatRoleBindingSummary(binding: RoleBinding): string {
  const role = getRole(binding.roleId);
  const orgs = binding.orgUnitIds.map((id) => getOrgUnit(id)?.name ?? id).join("、");
  return `${role?.name ?? binding.roleId}（${orgs || "未选部门"}）`;
}

function validateUserOrgAssignment(
  orgUnitId: string,
  roleBindings: RoleBinding[],
  managedOrgIds?: Set<string>,
): { ok: true; orgUnitId: string; roleBindings: RoleBinding[] } | { ok: false; message: string } {
  if (!orgUnitId) return { ok: false, message: "请选择归属部门" };
  if (!getOrgUnit(orgUnitId)) return { ok: false, message: "归属部门不存在" };
  if (managedOrgIds && !managedOrgIds.has(orgUnitId)) {
    return { ok: false, message: "归属部门超出当前账号的管辖范围" };
  }
  if (!roleBindings.length) return { ok: false, message: "请至少勾选一个角色" };

  const seenRoles = new Set<string>();
  const cleaned: RoleBinding[] = [];
  for (const raw of roleBindings) {
    const roleId = raw.roleId?.trim();
    if (!roleId) return { ok: false, message: "角色绑定无效" };
    if (seenRoles.has(roleId)) return { ok: false, message: "角色重复勾选" };
    seenRoles.add(roleId);
    if (!getRole(roleId)) return { ok: false, message: `角色不存在：${roleId}` };
    const orgUnitIds = [...new Set((raw.orgUnitIds ?? []).filter(Boolean))];
    if (!orgUnitIds.length) {
      const role = getRole(roleId);
      return { ok: false, message: `请为角色「${role?.name ?? roleId}」选择至少一个履职部门` };
    }
    for (const oid of orgUnitIds) {
      if (!getOrgUnit(oid)) return { ok: false, message: "履职部门不存在" };
      if (managedOrgIds && !managedOrgIds.has(oid)) {
        return { ok: false, message: "履职部门超出当前账号的管辖范围" };
      }
    }
    cleaned.push({ roleId, orgUnitIds });
  }
  return { ok: true, orgUnitId, roleBindings: cleaned };
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

export function createUser(
  input: {
    username: string;
    displayName: string;
    password: string;
    orgUnitId: string;
    roleBindings: RoleBinding[];
    status: EntityStatus;
  },
  opts?: { managedOrgIds?: Set<string> },
): { ok: true; user: SsoUser } | { ok: false; message: string } {
  const username = input.username.trim();
  if (!/^[a-zA-Z][a-zA-Z0-9._-]{2,31}$/.test(username)) {
    return { ok: false, message: "用户名须字母开头，3–32 位，仅含字母数字._-" };
  }
  if (findUserByUsername(username)) return { ok: false, message: "用户名已存在" };
  if (input.password.length < 6) return { ok: false, message: "密码至少 6 位" };
  const checked = validateUserOrgAssignment(input.orgUnitId, input.roleBindings, opts?.managedOrgIds);
  if (!checked.ok) return checked;
  userSeq += 1;
  const user: SsoUser = {
    id: `u-${userSeq}`,
    username,
    displayName: input.displayName.trim() || username,
    password: input.password,
    status: input.status,
    orgUnitId: checked.orgUnitId,
    roleBindings: checked.roleBindings,
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
    orgUnitId: string;
    roleBindings: RoleBinding[];
    status: EntityStatus;
    password?: string;
  },
  opts?: { managedOrgIds?: Set<string> },
): { ok: true } | { ok: false; message: string } {
  const user = getUser(id);
  if (!user) return { ok: false, message: "用户不存在" };
  if (input.password !== undefined && input.password !== "" && input.password.length < 6) {
    return { ok: false, message: "密码至少 6 位" };
  }
  const checked = validateUserOrgAssignment(input.orgUnitId, input.roleBindings, opts?.managedOrgIds);
  if (!checked.ok) return checked;
  users = users.map((u) =>
    u.id === id
      ? {
          ...u,
          displayName: input.displayName.trim() || u.displayName,
          orgUnitId: checked.orgUnitId,
          roleBindings: checked.roleBindings,
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
  apiIds?: string[];
  menuType: MenuType;
  parentId?: string | null;
  routePath?: string;
  component?: string;
  sort?: number;
  visible?: boolean;
}): { ok: true; id: string } | { ok: false; message: string } {
  const code = input.code.trim();
  if (!code) return { ok: false, message: "请填写权限标识" };
  if (permissions.some((p) => p.code === code)) return { ok: false, message: "权限标识已存在" };
  if (!getSubsystem(input.subsystemId)) return { ok: false, message: "子系统不存在" };
  if (!input.name.trim()) return { ok: false, message: "请填写菜单名称" };
  const parentId = input.parentId || null;
  if (parentId) {
    const parent = getPermission(parentId);
    if (!parent) return { ok: false, message: "父级菜单不存在" };
    if (parent.subsystemId !== input.subsystemId) return { ok: false, message: "父级须属于同一子系统" };
    if (parent.menuType === "button") return { ok: false, message: "按钮下不可再挂子级" };
  }
  if (input.menuType === "directory" || input.menuType === "menu") {
    if (!input.routePath?.trim()) return { ok: false, message: "请填写路由路径" };
  }
  if (input.menuType === "menu" && !input.component?.trim()) {
    return { ok: false, message: "请填写页面组件" };
  }
  const apiIds = sanitizeApiIds(input.subsystemId, input.apiIds ?? []);
  permSeq += 1;
  const id = `p-${permSeq}`;
  permissions = [
    {
      id,
      code,
      name: input.name.trim(),
      subsystemId: input.subsystemId,
      description: input.description.trim(),
      apiIds,
      menuType: input.menuType,
      parentId,
      routePath: input.menuType === "button" ? "" : (input.routePath ?? "").trim(),
      component: input.menuType === "menu" ? (input.component ?? "").trim() : "",
      sort: Number(input.sort) || 0,
      visible: input.visible !== false,
    },
    ...permissions,
  ];
  emit();
  return { ok: true, id };
}

export function updatePermission(
  id: string,
  input: {
    name: string;
    description: string;
    apiIds: string[];
    menuType?: MenuType;
    parentId?: string | null;
    routePath?: string;
    component?: string;
    sort?: number;
    visible?: boolean;
    code?: string;
  },
): { ok: true } | { ok: false; message: string } {
  const perm = permissions.find((p) => p.id === id);
  if (!perm) return { ok: false, message: "权限不存在" };
  const menuType = input.menuType ?? perm.menuType;
  const parentId = input.parentId === undefined ? perm.parentId : input.parentId || null;
  if (parentId === id) return { ok: false, message: "不能将自身设为父级" };
  if (parentId) {
    const parent = getPermission(parentId);
    if (!parent) return { ok: false, message: "父级菜单不存在" };
    if (parent.subsystemId !== perm.subsystemId) return { ok: false, message: "父级须属于同一子系统" };
    if (parent.menuType === "button") return { ok: false, message: "按钮下不可再挂子级" };
    // 防止成环
    let walk: string | null = parentId;
    const guard = new Set<string>();
    while (walk) {
      if (walk === id) return { ok: false, message: "不能将子节点设为父级" };
      if (guard.has(walk)) break;
      guard.add(walk);
      walk = getPermission(walk)?.parentId ?? null;
    }
  }
  if (!input.name.trim()) return { ok: false, message: "请填写菜单名称" };
  if (menuType === "directory" || menuType === "menu") {
    if (!(input.routePath ?? perm.routePath).trim()) return { ok: false, message: "请填写路由路径" };
  }
  if (menuType === "menu" && !(input.component ?? perm.component).trim()) {
    return { ok: false, message: "请填写页面组件" };
  }
  let code = perm.code;
  if (input.code !== undefined) {
    const next = input.code.trim();
    if (!next) return { ok: false, message: "请填写权限标识" };
    if (permissions.some((p) => p.code === next && p.id !== id)) {
      return { ok: false, message: "权限标识已存在" };
    }
    code = next;
  }
  const apiIds = sanitizeApiIds(perm.subsystemId, input.apiIds);
  permissions = permissions.map((p) =>
    p.id === id
      ? {
          ...p,
          code,
          name: input.name.trim(),
          description: input.description.trim(),
          apiIds,
          menuType,
          parentId,
          routePath: menuType === "button" ? "" : (input.routePath ?? p.routePath).trim(),
          component: menuType === "menu" ? (input.component ?? p.component).trim() : "",
          sort: input.sort !== undefined ? Number(input.sort) || 0 : p.sort,
          visible: input.visible !== undefined ? input.visible : p.visible,
        }
      : p,
  );
  emit();
  return { ok: true };
}

export function deletePermission(id: string): { ok: true } | { ok: false; message: string } {
  const perm = getPermission(id);
  if (!perm) return { ok: false, message: "权限不存在" };
  const toRemove = new Set<string>();
  const walk = (pid: string) => {
    toRemove.add(pid);
    for (const c of permissions) {
      if (c.parentId === pid) walk(c.id);
    }
  };
  walk(id);
  permissions = permissions.filter((p) => !toRemove.has(p.id));
  roles = roles.map((r) => ({
    ...r,
    permissionIds: r.permissionIds.filter((pid) => !toRemove.has(pid)),
  }));
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

/** 在允许的组织 id 集合内重建树；父节点不在集合内时该节点升为根 */
export function buildOrgTreeWithin(allowedIds: Set<string>, includeDisabled = false): OrgTreeNode[] {
  const list = listOrgUnits().filter(
    (o) => allowedIds.has(o.id) && (includeDisabled || o.status === "active"),
  );
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
