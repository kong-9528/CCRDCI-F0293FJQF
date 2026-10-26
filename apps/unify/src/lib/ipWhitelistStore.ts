import { notifyUnify } from "@/lib/useUnifyTick";

export type IpType = "single" | "range" | "cidr";

export type IpWhitelistItem = {
  id: string;
  type: IpType;
  /** 单IP / CIDR 表达式；段则用 start-end */
  expression: string;
  note: string;
  enabled: boolean;
  hitCount: number;
  createdAt: string;
};

export type IpHitLog = {
  id: string;
  whitelistId: string;
  at: string;
  source: string;
  orderId?: string;
};

export const IP_TYPE_LABEL: Record<IpType, string> = {
  single: "单IP",
  range: "IP段",
  cidr: "CIDR",
};

const KEY = "ctp.unify.ip-whitelist";
const LOG_KEY = "ctp.unify.ip-whitelist-hits";

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function uid(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const SEED: IpWhitelistItem[] = [
  {
    id: "ip1",
    type: "single",
    expression: "203.0.113.10",
    note: "合作方出口",
    enabled: true,
    hitCount: 128,
    createdAt: "2026-01-08 10:00:00",
  },
  {
    id: "ip2",
    type: "cidr",
    expression: "10.8.0.0/24",
    note: "内网网段",
    enabled: true,
    hitCount: 2048,
    createdAt: "2026-01-08 10:05:00",
  },
  {
    id: "ip3",
    type: "range",
    expression: "192.168.1.1-192.168.1.50",
    note: "",
    enabled: false,
    hitCount: 3,
    createdAt: "2026-02-01 15:00:00",
  },
];

const SEED_LOGS: IpHitLog[] = [
  {
    id: "iph1",
    whitelistId: "ip1",
    at: "2026-03-15 08:11:02",
    source: "203.0.113.10",
    orderId: "8230615000002328991",
  },
  {
    id: "iph2",
    whitelistId: "ip1",
    at: "2026-03-15 09:22:18",
    source: "203.0.113.10",
  },
  {
    id: "iph3",
    whitelistId: "ip2",
    at: "2026-03-15 10:00:00",
    source: "10.8.0.22",
    orderId: "8230615000002330100",
  },
];

function loadList(): IpWhitelistItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as IpWhitelistItem[];
  } catch {
    /* ignore */
  }
  return structuredClone(SEED);
}

function loadLogs(): IpHitLog[] {
  try {
    const raw = localStorage.getItem(LOG_KEY);
    if (raw) return JSON.parse(raw) as IpHitLog[];
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

export function listIpWhitelist() {
  return items.map((x) => ({ ...x }));
}

export function listIpHits(whitelistId: string) {
  return logs.filter((l) => l.whitelistId === whitelistId).map((l) => ({ ...l }));
}

export function upsertIpWhitelist(input: {
  id?: string;
  type: IpType;
  expression: string;
  note: string;
  enabled: boolean;
}): string | null {
  const expression = input.expression.trim();
  if (!expression) return "请填写 IP 表达式";
  if (input.type === "cidr" && !expression.includes("/")) return "CIDR 需包含掩码，如 10.0.0.0/24";
  if (input.type === "range" && !expression.includes("-")) return "IP 段格式：起始-结束";

  if (input.id) {
    const idx = items.findIndex((x) => x.id === input.id);
    if (idx < 0) return "记录不存在";
    items[idx] = {
      ...items[idx]!,
      type: input.type,
      expression,
      note: input.note.trim(),
      enabled: input.enabled,
    };
  } else {
    items = [
      {
        id: uid("ip"),
        type: input.type,
        expression,
        note: input.note.trim(),
        enabled: input.enabled,
        hitCount: 0,
        createdAt: stamp(),
      },
      ...items,
    ];
  }
  persist();
  return null;
}

export function setIpWhitelistEnabled(id: string, enabled: boolean) {
  const idx = items.findIndex((x) => x.id === id);
  if (idx < 0) return;
  items[idx] = { ...items[idx]!, enabled };
  persist();
}

export function deleteIpWhitelist(id: string) {
  items = items.filter((x) => x.id !== id);
  persist();
}

export function exportIpWhitelistCsv() {
  const header = "类型,表达式,备注,状态,命中次数,创建时间";
  const rows = items.map(
    (r) =>
      `${IP_TYPE_LABEL[r.type]},${r.expression},${r.note},${r.enabled ? "启用" : "停用"},${r.hitCount},${r.createdAt}`,
  );
  return [header, ...rows].join("\n");
}

export function importIpWhitelistCsv(csv: string): { ok: number; fail: string[] } {
  const fail: string[] = [];
  let ok = 0;
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  lines.forEach((line, i) => {
    if (i === 0 && /类型|type/i.test(line)) return;
    const [typeLabel, expression, note = ""] = line.split(",").map((s) => s.trim());
    const type =
      typeLabel === "单IP" || typeLabel === "single"
        ? "single"
        : typeLabel === "IP段" || typeLabel === "range"
          ? "range"
          : typeLabel === "CIDR" || typeLabel === "cidr"
            ? "cidr"
            : null;
    if (!type || !expression) {
      fail.push(`第 ${i + 1} 行：格式错误`);
      return;
    }
    const err = upsertIpWhitelist({ type, expression, note, enabled: true });
    if (err) fail.push(`第 ${i + 1} 行：${err}`);
    else ok++;
  });
  return { ok, fail };
}

/** 与黑名单并存时：黑名单优先拦截（本期仅文档/注释约定，不做实时网关） */
