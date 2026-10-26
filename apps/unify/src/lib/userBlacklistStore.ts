import { notifyUnify } from "@/lib/useUnifyTick";

export type BlacklistDim = "userId" | "account" | "deviceId";

export type UserBlacklistItem = {
  id: string;
  dim: BlacklistDim;
  value: string;
  effectiveFrom: string;
  effectiveTo: string;
  note: string;
  enabled: boolean;
  createdBy: string;
  createdAt: string;
};

export type BlacklistHitLog = {
  id: string;
  blacklistId: string;
  at: string;
  orderId: string;
  dim: BlacklistDim;
  value: string;
};

export const BLACKLIST_DIM_LABEL: Record<BlacklistDim, string> = {
  userId: "用户ID",
  account: "账号",
  deviceId: "设备ID",
};

const KEY = "ctp.unify.user-blacklist";
const LOG_KEY = "ctp.unify.user-blacklist-hits";

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const SEED: UserBlacklistItem[] = [
  {
    id: "ubl1",
    dim: "userId",
    value: "10086001",
    effectiveFrom: "2026-01-01 00:00:00",
    effectiveTo: "2027-12-31 23:59:59",
    note: "多次异常申领",
    enabled: true,
    createdBy: "admin",
    createdAt: "2026-01-05 10:00:00",
  },
  {
    id: "ubl2",
    dim: "account",
    value: "spam_user_01",
    effectiveFrom: "2026-02-01 00:00:00",
    effectiveTo: "2026-06-30 23:59:59",
    note: "",
    enabled: true,
    createdBy: "admin",
    createdAt: "2026-02-01 09:00:00",
  },
  {
    id: "ubl3",
    dim: "deviceId",
    value: "DEV-AABB-9910",
    effectiveFrom: "2025-01-01 00:00:00",
    effectiveTo: "2025-12-31 23:59:59",
    note: "已过期示例",
    enabled: true,
    createdBy: "auditor",
    createdAt: "2025-01-10 12:00:00",
  },
];

const SEED_LOGS: BlacklistHitLog[] = [
  {
    id: "hit1",
    blacklistId: "ubl1",
    at: "2026-03-10 14:22:01",
    orderId: "8230615000002328991",
    dim: "userId",
    value: "10086001",
  },
  {
    id: "hit2",
    blacklistId: "ubl1",
    at: "2026-03-12 09:01:33",
    orderId: "8230615000002329002",
    dim: "userId",
    value: "10086001",
  },
];

function loadList(): UserBlacklistItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as UserBlacklistItem[];
  } catch {
    /* ignore */
  }
  return structuredClone(SEED);
}

function loadLogs(): BlacklistHitLog[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw) as BlacklistHitLog[];
  } catch {
    /* ignore */
  }
  return structuredClone(SEED_LOGS);
}

let items = loadList();
let logs = loadLogs();

function persist() {
  localStorage.setItem(KEY, JSON.stringify(items));
  localStorage.setItem(LOG_KEY, JSON.stringify(logs));
  notifyUnify();
}

export function isBlacklistExpired(row: UserBlacklistItem, now = new Date()) {
  const from = new Date(row.effectiveFrom.replace(" ", "T"));
  const to = new Date(row.effectiveTo.replace(" ", "T"));
  return now < from || now > to;
}

export function listUserBlacklist() {
  return items.map((x) => ({ ...x }));
}

export function listBlacklistHits(blacklistId: string) {
  return logs.filter((l) => l.blacklistId === blacklistId).map((l) => ({ ...l }));
}

export function upsertUserBlacklist(input: {
  id?: string;
  dim: BlacklistDim;
  value: string;
  effectiveFrom: string;
  effectiveTo: string;
  note: string;
  enabled: boolean;
  createdBy: string;
}): string | null {
  const value = input.value.trim();
  if (!value) return "请填写匹配值";
  if (!input.effectiveFrom || !input.effectiveTo) return "请填写生效/失效时间";

  if (input.id) {
    const idx = items.findIndex((x) => x.id === input.id);
    if (idx < 0) return "记录不存在";
    items[idx] = {
      ...items[idx]!,
      dim: input.dim,
      value,
      effectiveFrom: input.effectiveFrom,
      effectiveTo: input.effectiveTo,
      note: input.note.trim(),
      enabled: input.enabled,
    };
  } else {
    items = [
      {
        id: uid("ubl"),
        dim: input.dim,
        value,
        effectiveFrom: input.effectiveFrom,
        effectiveTo: input.effectiveTo,
        note: input.note.trim(),
        enabled: input.enabled,
        createdBy: input.createdBy,
        createdAt: stamp(),
      },
      ...items,
    ];
  }
  persist();
  return null;
}

export function setUserBlacklistEnabled(id: string, enabled: boolean) {
  const idx = items.findIndex((x) => x.id === id);
  if (idx < 0) return;
  items[idx] = { ...items[idx]!, enabled };
  persist();
}

export function deleteUserBlacklist(id: string) {
  items = items.filter((x) => x.id !== id);
  persist();
}

export function exportUserBlacklistCsv() {
  const header = "类型,匹配值,生效时间,失效时间,备注,状态";
  const rows = items.map(
    (r) =>
      `${BLACKLIST_DIM_LABEL[r.dim]},${r.value},${r.effectiveFrom},${r.effectiveTo},${r.note},${r.enabled ? "启用" : "停用"}`,
  );
  return [header, ...rows].join("\n");
}

export function importUserBlacklistCsv(
  csv: string,
  createdBy: string,
): { ok: number; fail: string[] } {
  const fail: string[] = [];
  let ok = 0;
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  lines.forEach((line, i) => {
    if (i === 0 && /类型|dim/i.test(line)) return;
    const parts = line.split(",").map((s) => s.trim());
    const [dimLabel, value, effectiveFrom, effectiveTo, note = ""] = parts;
    const dim =
      dimLabel === "用户ID" || dimLabel === "userId"
        ? "userId"
        : dimLabel === "账号" || dimLabel === "account"
          ? "account"
          : dimLabel === "设备ID" || dimLabel === "deviceId"
            ? "deviceId"
            : null;
    if (!dim || !value) {
      fail.push(`第 ${i + 1} 行：格式错误`);
      return;
    }
    const err = upsertUserBlacklist({
      dim,
      value,
      effectiveFrom: effectiveFrom || "2026-01-01 00:00:00",
      effectiveTo: effectiveTo || "2099-12-31 23:59:59",
      note,
      enabled: true,
      createdBy,
    });
    if (err) fail.push(`第 ${i + 1} 行：${err}`);
    else ok++;
  });
  return { ok, fail };
}
