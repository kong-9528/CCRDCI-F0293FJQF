/** 调用统计：演示数据与图表系列 */

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

export const STATS_METRICS: MetricCard[] = [
  { label: "今日调用总数", value: 1842, trendPct: 12.5, trendText: "较上一周期" },
  { label: "本月调用总数", value: 52890, trendPct: 8.3, trendText: "较上一周期" },
  { label: "累计调用总数", value: 1_284_567, trendPct: null, trendText: "" },
];

export const SERVICE_TABS: { key: ServiceTab; label: string }[] = [
  { key: "verify", label: "核验服务" },
  { key: "review", label: "作品智能辅助审核服务" },
];

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

const VERIFY_BASE: Record<string, number[]> = {
  dci: genSeries(1, 380, 520),
  info: genSeries(4, 280, 360),
  cert: genSeries(7, 240, 300),
};

const REVIEW_BASE: Record<string, number[]> = {
  safety: genSeries(2, 360, 480),
  duplicate: genSeries(5, 300, 390),
  infringement: genSeries(8, 260, 320),
};

function sumSeries(parts: number[][]): number[] {
  const n = parts[0]?.length ?? 0;
  return Array.from({ length: n }, (_, i) => parts.reduce((s, arr) => s + (arr[i] ?? 0), 0));
}

function scaleSeries(values: number[], factor: number): number[] {
  return values.map((v) => Math.max(20, Math.round(v * factor)));
}

function channelFactor(channel: ChannelFilter): number {
  if (channel === "webui") return 0.42;
  if (channel === "api") return 0.58;
  return 1;
}

export function statsDayLabels(): string[] {
  const end = new Date(2026, 8, 17);
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
    const dci = scaleSeries(VERIFY_BASE.dci!, factor);
    const info = scaleSeries(VERIFY_BASE.info!, factor);
    const cert = scaleSeries(VERIFY_BASE.cert!, factor);
    const all = sumSeries([dci, info, cert]);
    const values: Record<string, number[]> = { all, dci, info, cert };
    return VERIFY_META.map((m) => ({ ...m, values: values[m.key]! }));
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
