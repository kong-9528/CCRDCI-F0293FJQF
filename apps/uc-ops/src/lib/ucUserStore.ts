/**
 * UC 运营侧看到的 C 端用户（演示数据，对应 UC 管理 API）
 */

export type UserStatus = "active" | /* "frozen" | */ "cancelled";
export type RealNameStatus = "none" | "pending" | "verified" | "rejected";
export type MembershipStatus = "none" | "applying" | "approved" | "rejected" | "disabled";

export type ConsoleMembership = {
  consoleId: "console-a" | "console-b";
  consoleName: string;
  status: MembershipStatus;
  tenantName?: string;
  updatedAt?: string;
};

export type UcUser = {
  id: string;
  username: string;
  phone: string;
  email: string;
  status: UserStatus;
  realNameStatus: RealNameStatus;
  registerChannel: string;
  createdAt: string;
  lastLoginAt: string | null;
  memberships: ConsoleMembership[];
  remark: string;
};

export type SecurityAction =
  | "login_success"
  | "login_fail"
  | "change_password"
  | "rebind_phone"
  | "reset_password";

export type SecurityLog = {
  id: string;
  userId: string;
  username: string;
  action: SecurityAction;
  /** 结果：安全动作成功/失败（改密等一般为成功） */
  result: "success" | "fail";
  detail?: string;
  ip: string;
  client: string;
  at: string;
};

export const SECURITY_ACTION_LABEL: Record<SecurityAction, string> = {
  login_success: "登录成功",
  login_fail: "登录失败",
  change_password: "修改密码",
  rebind_phone: "更换绑定手机号",
  reset_password: "重置密码",
};

export type RiskEvent = {
  id: string;
  userId: string;
  username: string;
  level: "low" | "medium" | "high";
  type: string;
  detail: string;
  at: string;
  handled: boolean;
};

export type OpLog = {
  id: string;
  operator: string;
  action: string;
  target: string;
  at: string;
};

export const USER_STATUS_LABEL: Record<UserStatus, string> = {
  active: "正常",
  // frozen: "冻结",
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

export function subscribeUcStore(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

function stamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let users: UcUser[] = [
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
        tenantName: "爱丽丝工作室工作室",
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
    status: "active",
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

let securityLogs: SecurityLog[] = [
  {
    id: "sl-1",
    userId: "cu-1",
    username: "demo",
    action: "login_success",
    result: "success",
    ip: "1.2.3.4",
    client: "Web · Chrome",
    at: "2026-09-08 09:12:00",
  },
  {
    id: "sl-2",
    userId: "cu-1",
    username: "demo",
    action: "change_password",
    result: "success",
    detail: "用户在 UC 安全中心修改登录密码",
    ip: "1.2.3.4",
    client: "Web · Chrome",
    at: "2026-09-06 16:40:00",
  },
  {
    id: "sl-3",
    userId: "cu-2",
    username: "alice_c",
    action: "rebind_phone",
    result: "success",
    detail: "原手机 139****5678 → 新手机 139****8888",
    ip: "114.114.114.114",
    client: "Web · Edge",
    at: "2026-09-07 11:05:00",
  },
  {
    id: "sl-4",
    userId: "cu-2",
    username: "alice_c",
    action: "login_success",
    result: "success",
    ip: "114.114.114.114",
    client: "Web · Edge",
    at: "2026-09-07 18:40:00",
  },
  {
    id: "sl-5",
    userId: "cu-3",
    username: "bob_risk",
    action: "login_fail",
    result: "fail",
    detail: "密码错误",
    ip: "8.8.8.8",
    client: "Web · Safari",
    at: "2026-09-05 22:10:00",
  },
  {
    id: "sl-6",
    userId: "cu-3",
    username: "bob_risk",
    action: "reset_password",
    result: "success",
    detail: "通过短信验证码找回并重置密码",
    ip: "8.8.8.8",
    client: "Web · Safari",
    at: "2026-09-05 22:18:00",
  },
];

let riskEvents: RiskEvent[] = [
  {
    id: "re-1",
    userId: "cu-3",
    username: "bob_risk",
    level: "high",
    type: "频繁登录失败",
    detail: "15 分钟内连续失败 8 次",
    at: "2026-09-05 22:11:00",
    handled: true,
  },
  {
    id: "re-2",
    userId: "cu-2",
    username: "alice_c",
    level: "low",
    type: "异地登录",
    detail: "与常用地不一致（演示）",
    at: "2026-09-07 18:40:00",
    handled: false,
  },
];

let opLogs: OpLog[] = [
  {
    id: "ol-1",
    operator: "admin",
    action: "冻结用户",
    target: "bob_risk",
    at: "2026-09-05 22:15:00",
  },
];

export function listUsers() {
  return users.slice().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUser(id: string) {
  return users.find((u) => u.id === id) ?? null;
}

export function freezeUser(_id: string, _operator: string) {
  // 冻结功能暂隐藏
  return { ok: false as const, message: "冻结功能暂未开放" };
}

export function unfreezeUser(_id: string, _operator: string) {
  // 解冻功能暂隐藏
  return { ok: false as const, message: "解冻功能暂未开放" };
}

export function listSecurityLogs() {
  return securityLogs.slice().sort((a, b) => b.at.localeCompare(a.at));
}

/** @deprecated 使用 listSecurityLogs */
export function listLoginLogs() {
  return listSecurityLogs();
}

export function listRiskEvents() {
  return riskEvents.slice().sort((a, b) => b.at.localeCompare(a.at));
}

export function markRiskHandled(id: string, operator: string) {
  const ev = riskEvents.find((e) => e.id === id);
  if (!ev) return;
  riskEvents = riskEvents.map((e) => (e.id === id ? { ...e, handled: true } : e));
  opLogs = [
    {
      id: `ol-${Date.now()}`,
      operator,
      action: "标记风险已处理",
      target: `${ev.username} / ${ev.type}`,
      at: stamp(),
    },
    ...opLogs,
  ];
  emit();
}

export function listOpLogs() {
  return opLogs.slice().sort((a, b) => b.at.localeCompare(a.at));
}

export function getDashboardStats() {
  const all = listUsers();
  return {
    total: all.length,
    cancelled: all.filter((u) => u.status === "cancelled").length,
    todayLogins: securityLogs.filter(
      (l) => l.action === "login_success" && l.at.startsWith("2026-09-08"),
    ).length,
  };
}
