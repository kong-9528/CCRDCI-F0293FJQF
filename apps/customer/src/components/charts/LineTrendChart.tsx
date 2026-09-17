import { useMemo } from "react";

export type LineTrendSeries = {
  key: string;
  name: string;
  color: string;
  values: number[];
};

type Props = {
  series: LineTrendSeries[];
  labels: string[];
  /** 稀疏显示横轴标签的步长；默认全量显示 */
  labelStep?: number;
  ariaLabel?: string;
  emptyText?: string;
};

/** 与数据概览共用的折线趋势图绘制 */
export function LineTrendChart({
  series,
  labels,
  labelStep = 1,
  ariaLabel = "调用量趋势折线图",
  emptyText = "请至少勾选一个指标",
}: Props) {
  const maxY = useMemo(() => {
    let m = 1;
    for (const s of series) {
      for (const v of s.values) m = Math.max(m, v);
    }
    return Math.ceil(m * 1.15);
  }, [series]);

  const width = 640;
  const height = 280;
  const pad = { l: 40, r: 14, t: 14, b: 30 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;
  const xAt = (i: number, n: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => pad.t + innerH - (v / maxY) * innerH;

  if (series.length === 0) {
    return <div className="a-placeholder">{emptyText}</div>;
  }

  return (
    <svg className="c-chart__svg" viewBox={`0 0 ${width} ${height}`} role="img" aria-label={ariaLabel}>
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.t + innerH * (1 - t);
        const val = Math.round(maxY * t);
        return (
          <g key={t}>
            <line x1={pad.l} y1={y} x2={width - pad.r} y2={y} stroke="var(--n-200)" strokeWidth="1" />
            <text x={4} y={y + 4} fontSize="12" fill="var(--n-400)">
              {val}
            </text>
          </g>
        );
      })}
      {series.map((s) => {
        const n = s.values.length;
        const linePoints = s.values.map((v, i) => `${xAt(i, n)},${yAt(v)}`).join(" ");
        const areaPoints = [
          `${xAt(0, n)},${pad.t + innerH}`,
          ...s.values.map((v, i) => `${xAt(i, n)},${yAt(v)}`),
          `${xAt(n - 1, n)},${pad.t + innerH}`,
        ].join(" ");
        return (
          <g key={s.key}>
            <polygon fill={s.color} fillOpacity="0.12" points={areaPoints} />
            <polyline
              fill="none"
              stroke={s.color}
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={linePoints}
            />
          </g>
        );
      })}
      {labels.map((label, i) => {
        if (labelStep > 1 && i % labelStep !== 0 && i !== labels.length - 1) return null;
        return (
          <text
            key={`${label}-${i}`}
            x={xAt(i, labels.length)}
            y={height - 6}
            fontSize="12"
            fill="var(--n-400)"
            textAnchor="middle"
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}
