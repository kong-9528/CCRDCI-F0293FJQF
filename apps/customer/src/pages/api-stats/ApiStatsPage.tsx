import { useMemo, useState } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import {
  CHANNEL_FILTERS,
  SERVICE_TABS,
  STATS_METRICS,
  formatStatNumber,
  statsChartSeries,
  statsDayLabels,
  statsSeriesMeta,
  type ChannelFilter,
  type ChartSeriesItem,
  type ServiceTab,
} from "@/lib/apiStats";

function IconPulse() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polyline
        points="22 12 18 12 15 21 9 3 6 12 2 12"
        stroke="#165dff"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCalendar() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" stroke="#165dff" strokeWidth="2" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="#165dff" strokeWidth="2" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="#165dff" strokeWidth="2" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="#165dff" strokeWidth="2" />
    </svg>
  );
}

function IconTrendUp() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <polyline
        points="23 6 13.5 15.5 8.5 10.5 1 18"
        stroke="#165dff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline points="17 6 23 6 23 12" stroke="#165dff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconBars() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" className="c-stats-chart__title-icon" aria-hidden>
      <line x1="18" y1="20" x2="18" y2="10" stroke="#165dff" strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="20" x2="12" y2="4" stroke="#165dff" strokeWidth="2" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="14" stroke="#165dff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

const METRIC_ICONS = [<IconPulse key="p" />, <IconCalendar key="c" />, <IconTrendUp key="t" />];

function StatsTrendChart({ series }: { series: ChartSeriesItem[] }) {
  const labels = useMemo(() => statsDayLabels(), []);
  const colorByName = useMemo(() => {
    const map = new Map<string, string>();
    for (const s of series) map.set(s.name, s.color);
    return map;
  }, [series]);

  const yMax = useMemo(() => {
    let m = 1;
    for (const s of series) for (const v of s.values) m = Math.max(m, v);
    return Math.max(350, Math.ceil(m / 350) * 350);
  }, [series]);

  const option = useMemo<EChartsOption>(() => {
    return {
      color: series.map((s) => s.color),
      animation: false,
      grid: {
        left: 48,
        right: 24,
        top: 20,
        bottom: 52,
        containLabel: false,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "line",
          lineStyle: { color: "#C9CDD4", type: "dashed", width: 1 },
        },
        backgroundColor: "#ffffff",
        borderColor: "#E5E6EB",
        borderWidth: 1,
        padding: [10, 14],
        textStyle: { color: "#1D2129", fontSize: 12 },
        extraCssText: "box-shadow: 0 4px 14px rgba(0,0,0,0.08); border-radius: 6px;",
        // 不用自定义 formatter 依赖 p.color（空心点 itemStyle 为白色会导致文字不可见）
        formatter: (raw) => {
          const list = Array.isArray(raw) ? raw : [raw];
          if (!list.length) return "";
          const first = list[0] as { axisValue?: string | number; axisValueLabel?: string | number };
          const date = String(first.axisValueLabel ?? first.axisValue ?? "");
          const rows = list
            .map((item) => {
              const p = item as {
                seriesName?: string;
                value?: number | string | (number | string)[];
                color?: string;
                borderColor?: string;
              };
              const name = p.seriesName ?? "";
              const color = colorByName.get(name) ?? (typeof p.borderColor === "string" ? p.borderColor : "#4E5969");
              const rawVal = p.value;
              const value =
                typeof rawVal === "number"
                  ? rawVal
                  : Array.isArray(rawVal)
                    ? rawVal[1]
                    : rawVal;
              return `<div style="color:${color};line-height:1.85;font-size:12px;">${name} : ${value ?? "—"}</div>`;
            })
            .join("");
          return `<div style="padding:2px 0;">
            <div style="color:#1D2129;font-size:12px;font-weight:500;margin-bottom:4px;">日期: ${date}</div>
            ${rows}
          </div>`;
        },
      },
      legend: {
        bottom: 0,
        left: "center",
        itemWidth: 25,
        itemHeight: 8,
        itemGap: 28,
        textStyle: { color: "#4E5969", fontSize: 12 },
        data: series.map((s) => s.name),
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels,
        axisLine: { show: true, lineStyle: { color: "#E5E6EB" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#86909C",
          fontSize: 12,
          interval: (index: number) => index % 2 === 1 || index === labels.length - 1,
          margin: 12,
        },
        splitLine: {
          show: true,
          lineStyle: { color: "#E5E6EB", type: "dashed" },
        },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: yMax,
        interval: yMax / 4,
        axisLine: { show: true, lineStyle: { color: "#E5E6EB" } },
        axisTick: { show: false },
        axisLabel: { color: "#86909C", fontSize: 12 },
        splitLine: {
          show: true,
          lineStyle: { color: "#E5E6EB", type: "dashed" },
        },
      },
      series: series.map((s) => ({
        name: s.name,
        type: "line" as const,
        data: s.values,
        smooth: true,
        showSymbol: false,
        symbol: "circle",
        symbolSize: 8,
        lineStyle: { width: 2, color: s.color },
        itemStyle: {
          color: s.color,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        emphasis: {
          focus: "none" as const,
          scale: true,
        },
      })),
    };
  }, [labels, series, colorByName, yMax]);

  return (
    <ReactECharts
      className="c-stats-echart"
      option={option}
      style={{ height: "100%", width: "100%" }}
      opts={{ renderer: "canvas" }}
      notMerge
      lazyUpdate
    />
  );
}

export function ApiStatsPage() {
  const [serviceTab, setServiceTab] = useState<ServiceTab>("verify");
  const [channel, setChannel] = useState<ChannelFilter>("all");

  const series = useMemo(
    () => statsChartSeries(serviceTab, serviceTab === "verify" ? channel : "all"),
    [serviceTab, channel],
  );
  const meta = useMemo(() => statsSeriesMeta(serviceTab), [serviceTab]);

  return (
    <div className="c-stats-page">
      <div className="c-stats-service-tabs" role="tablist" aria-label="服务类型">
        {SERVICE_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={serviceTab === tab.key}
            className={`c-stats-service-tabs__item${serviceTab === tab.key ? " is-active" : ""}`}
            onClick={() => {
              setServiceTab(tab.key);
              if (tab.key !== "verify") setChannel("all");
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="c-stats-metrics">
        {STATS_METRICS.map((card, i) => (
          <div key={card.label} className="c-stats-metric">
            <div className="c-stats-metric__header">
              <span className="c-stats-metric__label">{card.label}</span>
              <span className="c-stats-metric__icon">{METRIC_ICONS[i]}</span>
            </div>
            <div className="c-stats-metric__value">{formatStatNumber(card.value)}</div>
            {card.trendPct != null ? (
              <div className="c-stats-metric__trend is-up">
                <span className="c-stats-metric__trend-num">+{card.trendPct}%</span>
                <span className="c-stats-metric__trend-text">{card.trendText}</span>
              </div>
            ) : (
              <div className="c-stats-metric__trend is-flat">
                <span className="c-stats-metric__trend-text">&nbsp;</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="c-stats-chart-card">
        <div className="c-stats-chart__header">
          <div className="c-stats-chart__header-main">
            <h3 className="c-stats-chart__title">
              <IconBars />
              最近30天调用趋势
            </h3>
            <p className="c-stats-chart__desc">统计每日接口调用总次数</p>
          </div>
          {serviceTab === "verify" ? (
            <div className="c-stats-channel-tabs" role="tablist" aria-label="调用渠道">
              {CHANNEL_FILTERS.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  aria-selected={channel === item.key}
                  className={`c-stats-channel-tabs__item${channel === item.key ? " is-active" : ""}`}
                  onClick={() => setChannel(item.key)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="c-stats-chart__box">
          <StatsTrendChart key={`${serviceTab}-${channel}-${meta.map((m) => m.key).join("-")}`} series={series} />
        </div>
      </div>
    </div>
  );
}
