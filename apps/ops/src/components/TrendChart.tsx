import { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";

export type TrendSeries = {
  id: string;
  label: string;
  color: string;
  values: number[];
};

type Props = {
  labels: string[];
  series: TrendSeries[];
  unit?: "" | "%";
  height?: number;
};

const PALETTE = ["#5470C6", "#91CC75", "#FAC858", "#EE6666", "#73C0DE", "#3BA272"];

export function chartColor(i: number) {
  return PALETTE[i % PALETTE.length]!;
}

export function TrendChart({ labels, series, unit = "", height = 320 }: Props) {
  const option = useMemo<EChartsOption>(() => {
    const isPercent = unit === "%";

    return {
      color: series.map((s) => s.color),
      animationDuration: 450,
      animationEasing: "cubicOut",
      grid: {
        left: 52,
        right: 24,
        top: 28,
        bottom: series.length > 1 ? 56 : 36,
        containLabel: false,
      },
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "cross",
          snap: true,
          crossStyle: { color: "#98A4B7" },
          lineStyle: { color: "#CBD3E0", type: "dashed" },
        },
        backgroundColor: "rgba(255,255,255,0.96)",
        borderColor: "#E2E7EF",
        borderWidth: 1,
        padding: [10, 12],
        textStyle: {
          color: "#363F4D",
          fontSize: 13,
        },
        extraCssText: "box-shadow: 0 8px 24px rgba(22,28,36,0.12); border-radius: 8px;",
        valueFormatter: (value) => {
          const n = Number(value);
          if (Number.isNaN(n)) return String(value);
          return isPercent ? `${n.toFixed(1)}%` : n.toLocaleString();
        },
      },
      legend: {
        show: series.length > 0,
        bottom: 0,
        left: "center",
        icon: "roundRect",
        itemWidth: 12,
        itemHeight: 8,
        itemGap: 16,
        selectedMode: true,
        inactiveColor: "#B8C0CC",
        textStyle: { color: "#4A5665", fontSize: 13 },
        pageTextStyle: { color: "#6B7889" },
      },
      xAxis: {
        type: "category",
        boundaryGap: false,
        data: labels.map((d) => d.slice(5)),
        axisLine: { lineStyle: { color: "#E2E7EF" } },
        axisTick: { show: false },
        axisLabel: {
          color: "#6B7889",
          fontSize: 12,
          hideOverlap: true,
          margin: 12,
        },
        splitLine: { show: false },
      },
      yAxis: {
        type: "value",
        min: 0,
        max: isPercent ? 100 : undefined,
        splitNumber: 5,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: {
          color: "#6B7889",
          fontSize: 12,
          formatter: (v: number) => (isPercent ? `${v}%` : `${v}`),
        },
        splitLine: {
          show: true,
          lineStyle: { color: "#EFF2F7", type: "solid" },
        },
      },
      series: series.map((s) => ({
        name: s.label,
        type: "line",
        data: s.values,
        smooth: 0.25,
        showSymbol: labels.length <= 10,
        symbol: "circle",
        symbolSize: 6,
        sampling: "lttb",
        lineStyle: { width: 2.5, color: s.color },
        itemStyle: {
          color: s.color,
          borderColor: "#fff",
          borderWidth: 2,
        },
        emphasis: {
          focus: "series",
          scale: true,
          itemStyle: {
            borderWidth: 2,
            shadowBlur: 8,
            shadowColor: "rgba(84,112,198,0.35)",
          },
        },
        areaStyle:
          series.length === 1
            ? {
                color: {
                  type: "linear",
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    { offset: 0, color: hexToRgba(s.color, 0.28) },
                    { offset: 1, color: hexToRgba(s.color, 0.02) },
                  ],
                },
              }
            : undefined,
      })),
    };
  }, [labels, series, unit]);

  if (!labels.length || !series.length) {
    return <div className="a-empty">暂无趋势数据</div>;
  }

  return (
    <div className="a-trend-chart">
      <ReactECharts
        option={option}
        style={{ height, width: "100%" }}
        opts={{ renderer: "canvas" }}
        notMerge
        lazyUpdate
      />
    </div>
  );
}

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "");
  const full =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h;
  const n = Number.parseInt(full, 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r},${g},${b},${alpha})`;
}
