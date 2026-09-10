/**
 * SSO 系统操作日志（演示数据）
 */

export type SystemLog = {
  id: string;
  /** 操作标题，如「登录-登录」 */
  title: string;
  ip: string;
  /** 执行耗时 ms */
  durationMs: number;
  operator: string;
  /** 操作时间，ISO 本地风格 */
  operatedAt: string;
  browser: string;
  os: string;
  /** 自定义内容，无则空串 */
  content: string;
};

const TITLES = [
  "登录-登录",
  "用户管理-查询列表",
  "用户管理-编辑用户",
  "角色管理-查询列表",
  "角色管理-保存角色",
  "菜单管理-查询树",
  "组织结构-查询",
  "子系统管理-查询列表",
  "接口管理-查询列表",
  "门户用户-查询列表",
  "门户用户-查看详情",
  "门户用户-冻结用户",
  "门户用户-解冻用户",
  "账号-修改密码",
  "工作流-查询列表",
];

const OPERATORS = ["admin", "demo", "ops_lead", "ops_member", "tsc_admin", "youlai"];
const IPS = [
  "106.39.82.66",
  "117.147.122.49",
  "36.112.18.22",
  "58.247.90.11",
  "101.226.33.180",
  "223.104.5.88",
];
const BROWSERS = ["MSEdge", "Chrome", "Firefox", "Safari"];
const OS_LIST = [
  "Windows 10 or Windows Server 2016",
  "Windows 11",
  "macOS",
  "Android",
  "iOS",
];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function at(day: number, hour: number, minute: number, second: number) {
  return `2026-09-${pad(day)}T${pad(hour)}:${pad(minute)}:${pad(second)}`;
}

const logs: SystemLog[] = Array.from({ length: 48 }, (_, i) => {
  const n = i + 1;
  const title = TITLES[i % TITLES.length]!;
  const operator = OPERATORS[i % OPERATORS.length]!;
  const day = 10 - Math.floor(i / 12);
  const hour = 8 + (i % 10);
  const minute = (i * 7) % 60;
  const second = (i * 13) % 60;
  const content =
    i % 5 === 0
      ? `操作对象：${operator === "admin" ? "demo" : "user_" + pad((i % 20) + 1)}`
      : i % 7 === 0
        ? "批量导出列表"
        : "";

  return {
    id: `slog-${n}`,
    title,
    ip: IPS[i % IPS.length]!,
    durationMs: 40 + ((i * 17) % 260),
    operator,
    operatedAt: at(Math.max(1, day), hour, minute, second),
    browser: BROWSERS[i % BROWSERS.length]!,
    os: OS_LIST[i % OS_LIST.length]!,
    content,
  };
}).sort((a, b) => b.operatedAt.localeCompare(a.operatedAt));

export function listSystemLogs() {
  return logs.slice();
}

export function getSystemLog(id: string) {
  return logs.find((l) => l.id === id) ?? null;
}
