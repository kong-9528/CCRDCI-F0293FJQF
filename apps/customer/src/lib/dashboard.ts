import type { ProductCode } from "@/lib/catalog";
import { productName } from "@/lib/catalog";

export type ServiceStatus = "active" | "expiring" | "stopped";

export type DashboardProduct = {
  code: ProductCode;
  status: ServiceStatus;
  usedCount: number;
  quotaTotal: number | null;
  monthCalls: number;
  momPercent: number | null;
  expireAt: string;
  daysLeft: number;
  quotaUsagePct: number;
};

export type ProductWarning =
  | { kind: "ok" }
  | { kind: "stopped" }
  | { kind: "expiring"; daysLeft: number }
  | { kind: "expiring"; daysLeft: number; quotaPct: number };

export type RecentVerifyRow = {
  id: string;
  at: string;
  typeLabel: string;
  channel: "WebUI" | "API";
  status: "pass" | "fail";
  link?: string;
};

export type ChartRange = "7d" | "30d";

/** 6 产品配额与状态（对齐原型演示数据） */
export const DASHBOARD_PRODUCTS: DashboardProduct[] = [
  {
    code: "dci",
    status: "active",
    usedCount: 12847,
    quotaTotal: 50000,
    monthCalls: 3421,
    momPercent: 12.5,
    expireAt: "2026-09-30",
    daysLeft: 30,
    quotaUsagePct: 25.7,
  },
  {
    code: "info",
    status: "active",
    usedCount: 8432,
    quotaTotal: 30000,
    monthCalls: 2156,
    momPercent: 8.3,
    expireAt: "2026-09-30",
    daysLeft: 26,
    quotaUsagePct: 28.1,
  },
  {
    code: "certificate",
    status: "active",
    usedCount: 3000,
    quotaTotal: 10000,
    monthCalls: 892,
    momPercent: -2.1,
    expireAt: "2026-12-31",
    daysLeft: 133,
    quotaUsagePct: 30,
  },
  {
    code: "safety",
    status: "expiring",
    usedCount: 45230,
    quotaTotal: 100000,
    monthCalls: 680,
    momPercent: 18.2,
    expireAt: "2026-08-25",
    daysLeft: 5,
    quotaUsagePct: 45.2,
  },
  {
    code: "duplicate",
    status: "active",
    usedCount: 1500,
    quotaTotal: 5000,
    monthCalls: 520,
    momPercent: 10.5,
    expireAt: "2026-11-30",
    daysLeft: 102,
    quotaUsagePct: 30,
  },
  {
    code: "infringement",
    status: "stopped",
    usedCount: 1500,
    quotaTotal: 7000,
    monthCalls: 0,
    momPercent: null,
    expireAt: "2026-07-31",
    daysLeft: 0,
    quotaUsagePct: 21.4,
  },
];

export function dashboardOverview(products: DashboardProduct[]) {
  const active = products.filter((p) => p.status !== "stopped");
  const stopped = products.filter((p) => p.status === "stopped");
  const expiringSoon = products.filter((p) => p.status === "expiring" || p.daysLeft <= 30);
  const monthTotal = products.reduce((s, p) => s + p.monthCalls, 0);
  return {
    normalCount: active.length,
    stoppedCount: stopped.length,
    expiringSoonCount: expiringSoon.filter((p) => p.status !== "stopped").length,
    monthTotal,
  };
}

export function productWarnings(p: DashboardProduct): ProductWarning {
  if (p.status === "stopped") return { kind: "stopped" };
  if (p.code === "safety" && p.daysLeft <= 7) {
    return { kind: "expiring", daysLeft: p.daysLeft, quotaPct: 55 };
  }
  if (p.daysLeft <= 30 && p.daysLeft > 0) {
    return { kind: "expiring", daysLeft: p.daysLeft };
  }
  return { kind: "ok" };
}

export function countWarnings(products: DashboardProduct[]): number {
  return products.filter((p) => productWarnings(p).kind !== "ok").length;
}

export const RECENT_VERIFY_ROWS: RecentVerifyRow[] = [
  {
    id: "r1",
    at: "08-19 14:32",
    typeLabel: "DCI核验",
    channel: "WebUI",
    status: "pass",
    link: "/verify/dci",
  },
  {
    id: "r2",
    at: "08-19 11:15",
    typeLabel: "DCI核验",
    channel: "API",
    status: "pass",
    link: "/verify/dci",
  },
  {
    id: "r3",
    at: "08-18 16:48",
    typeLabel: "信息核验",
    channel: "WebUI",
    status: "fail",
    link: "/verify/info",
  },
  {
    id: "r4",
    at: "08-18 09:22",
    typeLabel: "DCI核验",
    channel: "API",
    status: "pass",
    link: "/verify/dci",
  },
  {
    id: "r5",
    at: "08-17 15:03",
    typeLabel: "证书核验",
    channel: "WebUI",
    status: "pass",
    link: "/verify/certificate",
  },
];

/** 近 7 / 30 天调用量（演示序列） */
const CHART_7D: Record<ProductCode, number[]> = {
  dci: [420, 380, 510, 460, 490, 520, 641],
  info: [280, 310, 290, 320, 300, 340, 316],
  certificate: [95, 110, 88, 120, 105, 130, 154],
  safety: [0, 0, 0, 0, 0, 0, 0],
  duplicate: [0, 0, 0, 0, 0, 0, 0],
  infringement: [0, 0, 0, 0, 0, 0, 0],
};

function expandTo30(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 0; i < 30; i++) {
    const src = values[i % values.length];
    out.push(Math.round(src * (0.85 + (i % 5) * 0.04)));
  }
  return out;
}

const CHART_30D = Object.fromEntries(
  Object.entries(CHART_7D).map(([k, v]) => [k, expandTo30(v)]),
) as Record<ProductCode, number[]>;

export function chartLabels(range: ChartRange): string[] {
  const n = range === "7d" ? 7 : 30;
  if (range === "7d") {
    return ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  }
  return Array.from({ length: n }, (_, i) => `${i + 1}日`);
}

export function chartSeries(
  range: ChartRange,
  codes: ProductCode[],
): { code: ProductCode; name: string; values: number[]; color: string }[] {
  const palette: Partial<Record<ProductCode, string>> = {
    dci: "var(--p-600)",
    info: "var(--a-500)",
    certificate: "#6366F1",
  };
  const data = range === "7d" ? CHART_7D : CHART_30D;
  return codes.map((code) => ({
    code,
    name: productName(code),
    values: data[code] ?? [],
    color: palette[code] ?? "var(--p-600)",
  }));
}

export const CHART_DEFAULT_PRODUCTS: ProductCode[] = ["dci", "info", "certificate"];
