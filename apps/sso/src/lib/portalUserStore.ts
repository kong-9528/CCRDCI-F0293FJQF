/**
 * 门户（C 端）注册用户 — 与 uc-ops 演示数据对齐，供 SSO「门户用户列表」查看与冻结/解冻。
 */

export type PortalUserStatus = "active" | "frozen" | "cancelled";
export type RealNameStatus = "none" | "pending" | "verified" | "rejected";
export type MembershipStatus = "none" | "applying" | "approved" | "rejected" | "disabled";

export type ConsoleMembership = {
  consoleId: "console-a" | "console-b";
  consoleName: string;
  status: MembershipStatus;
  tenantName?: string;
  updatedAt?: string;
};

export type PortalUser = {
  id: string;
  username: string;
  phone: string;
  email: string;
  status: PortalUserStatus;
  realNameStatus: RealNameStatus;
  registerChannel: string;
  createdAt: string;
  lastLoginAt: string | null;
  memberships: ConsoleMembership[];
  remark: string;
};

export type PortalOpLog = {
  id: string;
  operator: string;
  action: string;
  target: string;
  at: string;
};

export const USER_STATUS_LABEL: Record<PortalUserStatus, string> = {
  active: "正常",
  frozen: "冻结",
  cancelled: "注销",
};

export const REAL_NAME_LABEL: Record<RealNameStatus, string> = {
  none: "未实名",
  pending: "审核中",
  verified: "已实名",
  rejected: "未通过",
};

export const MEMBERSHIP_LABEL: Record<MembershipStatus, string> = {
  none: "未申请",
  applying: "申请中",
  approved: "已入驻",
  rejected: "已驳回",
  disabled: "已停用",
};

const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribePortalUsers(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function stamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let users: PortalUser[] = [
  {
    id: "cu-1",
    username: "demo",
    phone: "13800001234",
    email: "demo@example.com",
    status: "active",
    realNameStatus: "verified",
    registerChannel: "门户注册",
    createdAt: "2026-01-01 10:00:00",
    lastLoginAt: "2026-09-08 09:12:00",
    memberships: [
      {
        consoleId: "console-a",
        consoleName: "DCI管理中心控制台",
        status: "approved",
        tenantName: "示例科技有限公司",
        updatedAt: "2026-03-01 11:00:00",
      },
      {
        consoleId: "console-b",
        consoleName: "DCI®技术服务中心控制台",
        status: "applying",
        updatedAt: "2026-09-01 15:20:00",
      },
    ],
    remark: "演示主账号",
  },
  {
    id: "cu-2",
    username: "alice_c",
    phone: "13900005678",
    email: "",
    status: "active",
    realNameStatus: "none",
    registerChannel: "门户注册",
    createdAt: "2026-06-12 14:22:00",
    lastLoginAt: "2026-09-07 18:40:00",
    memberships: [
      {
        consoleId: "console-a",
        consoleName: "DCI管理中心控制台",
        status: "none",
      },
      {
        consoleId: "console-b",
        consoleName: "DCI®技术服务中心控制台",
        status: "approved",
        tenantName: "爱丽丝创意工作室",
        updatedAt: "2026-07-01 10:00:00",
      },
    ],
    remark: "",
  },
  {
    id: "cu-3",
    username: "bob_risk",
    phone: "13700001111",
    email: "bob@mail.com",
    status: "frozen",
    realNameStatus: "pending",
    registerChannel: "门户注册",
    createdAt: "2026-08-20 08:05:00",
    lastLoginAt: "2026-09-05 22:11:00",
    memberships: [
      { consoleId: "console-a", consoleName: "DCI管理中心控制台", status: "none" },
      { consoleId: "console-b", consoleName: "DCI®技术服务中心控制台", status: "none" },
    ],
    remark: "曾有频繁登录失败记录（演示）",
  },
  {
    id: "cu-4",
    username: "gone_user",
    phone: "13600009999",
    email: "",
    status: "cancelled",
    realNameStatus: "none",
    registerChannel: "门户注册",
    createdAt: "2026-02-02 12:00:00",
    lastLoginAt: "2026-04-01 09:00:00",
    memberships: [
      { consoleId: "console-a", consoleName: "DCI管理中心控制台", status: "disabled" },
      { consoleId: "console-b", consoleName: "DCI®技术服务中心控制台", status: "none" },
    ],
    remark: "用户申请注销",
  },
];

let opLogs: PortalOpLog[] = [
  {
    id: "pol-1",
    operator: "admin",
    action: "冻结用户",
    target: "bob_risk",
    at: "2026-09-05 22:15:00",
  },
];

export function listPortalUsers() {
  return users.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPortalUser(id: string) {
  return users.find((u) => u.id === id) ?? null;
}

export function listPortalOpLogs() {
  return opLogs.slice().sort((a, b) => b.at.localeCompare(a.at));
}

function appendOp(operator: string, action: string, target: string) {
  opLogs = [
    {
      id: `pol-${Date.now()}`,
      operator,
      action,
      target,
      at: stamp(),
    },
    ...opLogs,
  ];
}

export function freezePortalUser(id: string, operator: string) {
  const user = users.find((u) => u.id === id);
  if (!user) return { ok: false as const, message: "用户不存在" };
  if (user.status === "cancelled") return { ok: false as const, message: "已注销用户不可冻结" };
  if (user.status === "frozen") return { ok: false as const, message: "用户已处于冻结状态" };

  users = users.map((u) => (u.id === id ? { ...u, status: "frozen" as const } : u));
  appendOp(operator, "冻结用户", user.username);
  emit();
  return { ok: true as const };
}

export function unfreezePortalUser(id: string, operator: string) {
  const user = users.find((u) => u.id === id);
  if (!user) return { ok: false as const, message: "用户不存在" };
  if (user.status !== "frozen") return { ok: false as const, message: "仅冻结用户可解冻" };

  users = users.map((u) => (u.id === id ? { ...u, status: "active" as const } : u));
  appendOp(operator, "解冻用户", user.username);
  emit();
  return { ok: true as const };
}
