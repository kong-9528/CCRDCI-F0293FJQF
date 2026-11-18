/** 调用统计：演示数据与图表系列 */

import { DEMO_TODAY } from "@/lib/demoClock";
import { tenantHasProduct } from "@/lib/tenant";

export type ServiceTab = "verify" | "review";
export type ChannelFilter = "all" | "webui" | "api";

export type MetricCard = {
  label: string;
  value: number;
  trendPct: number | null;
  trendText: string;
};

export type ChartSeriesItem = {
  key: string;
  name: string;
  color: string;
  values: number[];
};

const DEFAULT_STATS_METRICS: MetricCard[] = [
  { label: "今日调用总数", value: 1842, trendPct: 12.5, trendText: "较上一周期" },
  { label: "本月调用总数", value: 52890, trendPct: 8.3, trendText: "较上一周期" },
  { label: "累计调用总数", value: 1_284_567, trendPct: null, trendText: "" },
];

/** 按开通产品缩放的演示指标（yunnan 仅审核 / beijian 仅证书核验） */
export function getStatsMetrics(): MetricCard[] {
  const hasVerify =
    tenantHasProduct("dci") || tenantHasProduct("info") || tenantHasProduct("certificate");
  const hasReview = tenantHasProduct("workReview");
  const onlyCert =
    tenantHasProduct("certificate") &&
    !tenantHasProduct("dci") &&
    !tenantHasProduct("info") &&
    !hasReview;

  if (hasReview && !hasVerify) {
    return [
      { label: "今日调用总数", value: 86, trendPct: 9.2, trendText: "较上一周期" },
      { label: "本月调用总数", value: 2140, trendPct: 11.4, trendText: "较上一周期" },
      { label: "累计调用总数", value: 3260, trendPct: null, trendText: "" },
    ];
  }
  if (onlyCert) {
    return [
      { label: "今日调用总数", value: 68, trendPct: 4.8, trendText: "较上一周期" },
      { label: "本月调用总数", value: 640, trendPct: 4.1, trendText: "较上一周期" },
      { label: "累计调用总数", value: 1950, trendPct: null, trendText: "" },
    ];
  }
  if (hasVerify && !hasReview) {
    return [
      { label: "今日调用总数", value: 312, trendPct: 7.6, trendText: "较上一周期" },
      { label: "本月调用总数", value: 8940, trendPct: 6.1, trendText: "较上一周期" },
      { label: "累计调用总数", value: 8940, trendPct: null, trendText: "" },
    ];
  }
  return DEFAULT_STATS_METRICS;
}

/** @deprecated 请用 getStatsMetrics()；保留兼容旧引用 */
export const STATS_METRICS: MetricCard[] = DEFAULT_STATS_METRICS;

export const SERVICE_TABS: { key: ServiceTab; label: string }[] = [
  { key: "verify", label: "版权核验服务" },
  { key: "review", label: "作品智能辅助审核服务" },
];

/** 按当前账号已开通服务过滤 Tab */
export function getServiceTabs(): { key: ServiceTab; label: string }[] {
  const hasVerify =
    tenantHasProduct("dci") || tenantHasProduct("info") || tenantHasProduct("certificate");
  const hasReview = tenantHasProduct("workReview");
  return SERVICE_TABS.filter((tab) => {
    if (tab.key === "verify") return hasVerify;
    if (tab.key === "review") return hasReview;
    return true;
  });
}

export const CHANNEL_FILTERS: { key: ChannelFilter; label: string }[] = [
  { key: "all", label: "全部" },
  { key: "webui", label: "webUI" },
  { key: "api", label: "API" },
];

const VERIFY_META = [
  { key: "all", name: "全部", color: "#2F5BA8" },
  { key: "dci", name: "DCI核验", color: "#C9A06C" },
  { key: "info", name: "版权登记信息核验", color: "#4C8DFF" },
  { key: "cert", name: "版权登记证书核验", color: "#5BB8C9" },
] as const;

const REVIEW_META = [
  { key: "all", name: "全部", color: "#2F5BA8" },
  { key: "safety", name: "内容安全审核", color: "#C9A06C" },
  { key: "duplicate", name: "作品登记查重", color: "#4C8DFF" },
  { key: "infringement", name: "疑似侵权审核", color: "#5BB8C9" },
] as const;

function genSeries(seed: number, amp: number, bias: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 30; i++) {
    const wave =
      Math.sin((i + seed) * 0.45) * amp * 0.35 +
      Math.cos((i + seed) * 0.22) * amp * 0.25 +
      ((i * 17 + seed * 13) % 23) * (amp * 0.02);
    out.push(Math.max(40, Math.round(bias + wave + i * (amp * 0.012))));
  }
  return out;
}

/** 审核账号量级更小（对齐 2 万额度用量） */
function genReviewSeries(seed: number, amp: number, bias: number): number[] {
  const out: number[] = [];
  for (let i = 0; i < 30; i++) {
    const wave =
      Math.sin((i + seed) * 0.45) * amp * 0.35 +
      Math.cos((i + seed) * 0.22) * amp * 0.25 +
      ((i * 17 + seed * 13) % 23) * (amp * 0.02);
    out.push(Math.max(8, Math.round(bias + wave + i * (amp * 0.01))));
  }
  return out;
}

const VERIFY_BASE: Record<string, number[]> = {
  dci: genSeries(1, 120, 140),
  info: genSeries(4, 90, 95),
  cert: genSeries(7, 70, 65),
};

const REVIEW_BASE: Record<string, number[]> = {
  safety: genReviewSeries(2, 28, 32),
  duplicate: genReviewSeries(5, 24, 28),
  infringement: genReviewSeries(8, 22, 24),
};

function sumSeries(parts: number[][]): number[] {
  const n = parts[0]?.length ?? 0;
  return Array.from({ length: n }, (_, i) => parts.reduce((s, arr) => s + (arr[i] ?? 0), 0));
}

function scaleSeries(values: number[], factor: number): number[] {
  return values.map((v) => Math.max(4, Math.round(v * factor)));
}

function channelFactor(channel: ChannelFilter): number {
  if (channel === "webui") return 0.42;
  if (channel === "api") return 0.58;
  return 1;
}

export function statsDayLabels(): string[] {
  const end = new Date(DEMO_TODAY);
  const labels: string[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(end.getDate() - i);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    labels.push(`${mm}/${dd}`);
  }
  return labels;
}

export function statsSeriesMeta(tab: ServiceTab) {
  return tab === "verify" ? [...VERIFY_META] : [...REVIEW_META];
}

export function statsChartSeries(tab: ServiceTab, channel: ChannelFilter = "all"): ChartSeriesItem[] {
  const factor = channelFactor(channel);

  if (tab === "verify") {
    const includeDci = tenantHasProduct("dci");
    const includeInfo = tenantHasProduct("info");
    const includeCert = tenantHasProduct("certificate");
    const dci = includeDci ? scaleSeries(VERIFY_BASE.dci!, factor) : Array(30).fill(0);
    const info = includeInfo ? scaleSeries(VERIFY_BASE.info!, factor) : Array(30).fill(0);
    const cert = includeCert ? scaleSeries(VERIFY_BASE.cert!, factor) : Array(30).fill(0);
    const parts = [
      includeDci ? dci : null,
      includeInfo ? info : null,
      includeCert ? cert : null,
    ].filter(Boolean) as number[][];
    const all = parts.length ? sumSeries(parts) : Array(30).fill(0);
    const values: Record<string, number[]> = { all, dci, info, cert };
    return VERIFY_META.filter((m) => {
      if (m.key === "all") return true;
      if (m.key === "dci") return includeDci;
      if (m.key === "info") return includeInfo;
      if (m.key === "cert") return includeCert;
      return true;
    }).map((m) => ({ ...m, values: values[m.key]! }));
  }

  const safety = REVIEW_BASE.safety!;
  const duplicate = REVIEW_BASE.duplicate!;
  const infringement = REVIEW_BASE.infringement!;
  const all = sumSeries([safety, duplicate, infringement]);
  const values: Record<string, number[]> = { all, safety, duplicate, infringement };
  return REVIEW_META.map((m) => ({ ...m, values: values[m.key]! }));
}

export function formatStatNumber(n: number) {
  return n.toLocaleString("en-US");
}
