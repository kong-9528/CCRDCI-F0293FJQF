import type { ProductCode } from "@/lib/catalog";
import { productName } from "@/lib/catalog";
import { DEMO_TODAY, shortDaysAgo } from "@/lib/demoClock";
import { WORK_REVIEW_ENTITLEMENT } from "@/lib/review";
import { MOCK_TENANT_SERVICES, tenantHasProduct } from "@/lib/tenant";

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
  /** 与工作台一致：核验共享 / 审核独立 */
  entitlement?: "verify" | "audit";
  consumePerWork?: number;
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

function daysLeftUntil(expireAt: string): number {
  const end = new Date(`${expireAt}T23:59:59`);
  const now = new Date(DEMO_TODAY);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / 86400000));
}

function fromTenantService(
  code: ProductCode,
  extras: { monthCalls: number; momPercent: number | null },
): DashboardProduct | null {
  const row = MOCK_TENANT_SERVICES.find((s) => s.product === code);
  if (!row) return null;
  const quotaTotal = row.quotaTotal;
  const quotaUsagePct =
    quotaTotal && quotaTotal > 0
      ? Math.round((row.usedCount / quotaTotal) * 1000) / 10
      : 0;
  return {
    code,
    status: row.status,
    usedCount: row.usedCount,
    quotaTotal,
    monthCalls: extras.monthCalls,
    momPercent: extras.momPercent,
    expireAt: row.expireAt,
    daysLeft: daysLeftUntil(row.expireAt),
    quotaUsagePct,
    entitlement: row.entitlement,
    consumePerWork: row.consumePerWork,
  };
}

const MONTH_HINTS: Partial<
  Record<ProductCode, { monthCalls: number; momPercent: number | null }>
> = {
  dci: { monthCalls: 3421, momPercent: 12.5 },
  info: { monthCalls: 2156, momPercent: 8.3 },
  certificate: { monthCalls: 892, momPercent: -2.1 },
  workReview: { monthCalls: 1200, momPercent: 12.8 },
};

/** 按开通产品给出更贴近额度的本月调用演示值 */
function monthHint(code: ProductCode): { monthCalls: number; momPercent: number | null } {
  const opened = MOCK_TENANT_SERVICES.map((s) => s.product);
  const onlyReview = opened.length === 1 && opened[0] === "workReview";
  const onlyVerify = opened.length > 0 && opened.every((p) => p !== "workReview");
  if (onlyReview && code === "workReview") {
    return { monthCalls: 2140, momPercent: 11.4 };
  }
  if (onlyVerify) {
    if (opened.length === 1 && opened[0] === "certificate" && code === "certificate") {
      return { monthCalls: 640, momPercent: 4.1 };
    }
    if (code === "dci") return { monthCalls: 1420, momPercent: 7.6 };
    if (code === "info") return { monthCalls: 980, momPercent: 5.2 };
    if (code === "certificate") return { monthCalls: 640, momPercent: 4.1 };
  }
  return MONTH_HINTS[code] ?? { monthCalls: 0, momPercent: null };
}

/** 按当前账号已开通技术服务生成看板产品（随门户桥接切换） */
export function getDashboardProducts(): DashboardProduct[] {
  const codes: ProductCode[] = ["dci", "info", "certificate", "workReview"];
  const out: DashboardProduct[] = [];
  for (const code of codes) {
    const hint = monthHint(code);
    if (code === "workReview") {
      const row = MOCK_TENANT_SERVICES.find((s) => s.product === "workReview");
      if (!row) continue;
      const quotaTotal = row.quotaTotal;
      const quotaUsagePct =
        quotaTotal && quotaTotal > 0
          ? Math.round((row.usedCount / quotaTotal) * 1000) / 10
          : WORK_REVIEW_ENTITLEMENT.quotaUsagePct;
      out.push({
        code,
        status: row.status,
        usedCount: row.usedCount,
        quotaTotal,
        monthCalls: hint.monthCalls,
        momPercent: hint.momPercent,
        expireAt: row.expireAt,
        daysLeft: daysLeftUntil(row.expireAt),
        quotaUsagePct,
        entitlement: "audit",
      });
      continue;
    }
    const item = fromTenantService(code, hint);
    if (item) out.push(item);
  }
  return out;
}


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
  if (p.code === "workReview" && p.daysLeft <= 7) {
    return { kind: "expiring", daysLeft: p.daysLeft, quotaPct: Math.round(p.quotaUsagePct) };
  }
  if (p.daysLeft <= 30 && p.daysLeft > 0) {
    return { kind: "expiring", daysLeft: p.daysLeft };
  }
  return { kind: "ok" };
}

export function countWarnings(products: DashboardProduct[]): number {
  return products.filter((p) => productWarnings(p).kind !== "ok").length;
}

const DEFAULT_RECENT_VERIFY_ROWS: RecentVerifyRow[] = [
  {
    id: "r1",
    at: shortDaysAgo(0, 14, 32),
    typeLabel: "DCI核验",
    channel: "WebUI",
    status: "pass",
    link: "/verify/dci",
  },
  {
    id: "r2",
    at: shortDaysAgo(0, 11, 15),
    typeLabel: "DCI核验",
    channel: "API",
    status: "pass",
    link: "/verify/dci",
  },
  {
    id: "r3",
    at: shortDaysAgo(1, 16, 48),
    typeLabel: "信息核验",
    channel: "WebUI",
    status: "fail",
    link: "/verify/info",
  },
  {
    id: "r4",
    at: shortDaysAgo(1, 9, 22),
    typeLabel: "DCI核验",
    channel: "API",
    status: "pass",
    link: "/verify/dci",
  },
  {
    id: "r5",
    at: shortDaysAgo(2, 15, 3),
    typeLabel: "证书核验",
    channel: "WebUI",
    status: "pass",
    link: "/verify/certificate",
  },
];

const YUNNAN_RECENT_ROWS: RecentVerifyRow[] = [
  {
    id: "yn-r1",
    at: shortDaysAgo(0, 17, 10),
    typeLabel: "疑似侵权审核",
    channel: "API",
    status: "pass",
    link: "/review/infringement",
  },
  {
    id: "yn-r2",
    at: shortDaysAgo(0, 16, 55),
    typeLabel: "内容安全审核",
    channel: "WebUI",
    status: "pass",
    link: "/review/safety",
  },
  {
    id: "yn-r3",
    at: shortDaysAgo(1, 16, 30),
    typeLabel: "作品登记查重",
    channel: "API",
    status: "pass",
    link: "/review/duplicate",
  },
  {
    id: "yn-r4",
    at: shortDaysAgo(2, 15, 22),
    typeLabel: "疑似侵权审核",
    channel: "WebUI",
    status: "fail",
    link: "/review/infringement",
  },
  {
    id: "yn-r5",
    at: shortDaysAgo(3, 14, 55),
    typeLabel: "作品登记查重",
    channel: "API",
    status: "pass",
    link: "/review/duplicate",
  },
];

const BEIJIAN_RECENT_ROWS: RecentVerifyRow[] = [
  {
    id: "bj-r1",
    at: shortDaysAgo(0, 12, 0),
    typeLabel: "证书核验",
    channel: "WebUI",
    status: "pass",
    link: "/verify/certificate",
  },
  {
    id: "bj-r2",
    at: shortDaysAgo(1, 15, 20),
    typeLabel: "证书核验",
    channel: "API",
    status: "pass",
    link: "/verify/certificate",
  },
  {
    id: "bj-r3",
    at: shortDaysAgo(2, 10, 8),
    typeLabel: "证书核验",
    channel: "WebUI",
    status: "fail",
    link: "/verify/certificate",
  },
  {
    id: "bj-r4",
    at: shortDaysAgo(4, 14, 18),
    typeLabel: "证书核验",
    channel: "API",
    status: "pass",
    link: "/verify/certificate",
  },
  {
    id: "bj-r5",
    at: shortDaysAgo(9, 9, 45),
    typeLabel: "证书核验",
    channel: "WebUI",
    status: "fail",
    link: "/verify/certificate",
  },
];

/** @deprecated 请用 getRecentActivityRows() */
export const RECENT_VERIFY_ROWS: RecentVerifyRow[] = DEFAULT_RECENT_VERIFY_ROWS;

export function getRecentActivityRows(): RecentVerifyRow[] {
  const hasVerify =
    tenantHasProduct("dci") || tenantHasProduct("info") || tenantHasProduct("certificate");
  const hasReview = tenantHasProduct("workReview");
  const onlyCert =
    tenantHasProduct("certificate") &&
    !tenantHasProduct("dci") &&
    !tenantHasProduct("info") &&
    !hasReview;
  if (hasReview && !hasVerify) return YUNNAN_RECENT_ROWS;
  if (onlyCert) return BEIJIAN_RECENT_ROWS;
  return DEFAULT_RECENT_VERIFY_ROWS.filter((row) => {
    if (row.link?.includes("/verify/dci")) return tenantHasProduct("dci");
    if (row.link?.includes("/verify/info")) return tenantHasProduct("info");
    if (row.link?.includes("/verify/certificate")) return tenantHasProduct("certificate");
    return true;
  });
}

export function recentActivityTitle(): string {
  const hasVerify =
    tenantHasProduct("dci") || tenantHasProduct("info") || tenantHasProduct("certificate");
  const hasReview = tenantHasProduct("workReview");
  if (hasReview && !hasVerify) return "最近审核记录";
  return "最近核验记录";
}

export function recentActivityAllLink(): string {
  if (tenantHasProduct("dci")) return "/verify/dci";
  if (tenantHasProduct("info")) return "/verify/info";
  if (tenantHasProduct("certificate")) return "/verify/certificate";
  if (tenantHasProduct("workReview")) return "/review/safety";
  return "/desk";
}

/** 近 7 / 30 天调用量（演示序列） */
const CHART_7D: Record<ProductCode, number[]> = {
  dci: [148, 132, 176, 158, 169, 182, 196],
  info: [98, 110, 102, 118, 108, 124, 116],
  certificate: [62, 71, 58, 78, 69, 84, 76],
  workReview: [68, 62, 84, 76, 79, 88, 96],
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
    dci: "#0075c1",
    info: "#52c41a",
    certificate: "#ff9c6e",
    workReview: "#2F5BA8",
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

/** 看板趋势图可选产品：仅当前账号已开通 */
export function getChartProducts(): ProductCode[] {
  const verify = CHART_DEFAULT_PRODUCTS.filter((c) => tenantHasProduct(c));
  if (verify.length) return verify;
  if (tenantHasProduct("workReview")) return ["workReview"];
  return [];
}
