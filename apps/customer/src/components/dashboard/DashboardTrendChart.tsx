import { useMemo, useState } from "react";
import { productName, type ProductCode } from "@/lib/catalog";
import {
  CHART_DEFAULT_PRODUCTS,
  chartLabels,
  chartSeries,
  type ChartRange,
} from "@/lib/dashboard";

const CHART_OPTIONS: ProductCode[] = CHART_DEFAULT_PRODUCTS;

export function DashboardTrendChart() {
  const [range, setRange] = useState<ChartRange>("7d");
  const [selected, setSelected] = useState<ProductCode[]>([...CHART_DEFAULT_PRODUCTS]);

  const series = useMemo(
    () => chartSeries(range, selected),
    [range, selected],
  );
  const labels = useMemo(() => chartLabels(range), [range]);

  const maxY = useMemo(() => {
    let m = 1;
    for (const s of series) {
      for (const v of s.values) m = Math.max(m, v);
    }
    return Math.ceil(m * 1.15);
  }, [series]);

  const toggle = (code: ProductCode) => {
    setSelected((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code],
    );
  };

  const width = 640;
  const height = 220;
  const pad = { l: 36, r: 12, t: 12, b: 28 };
  const innerW = width - pad.l - pad.r;
  const innerH = height - pad.t - pad.b;

  const xAt = (i: number, n: number) => pad.l + (n <= 1 ? 0 : (i / (n - 1)) * innerW);
  const yAt = (v: number) => pad.t + innerH - (v / maxY) * innerH;

  return (
    <div className="a-card">
      <div className="c-chart__head">
        <div>
          <div className="c-chart__title">调用量趋势</div>
          <div className="a-field__hint">实时监控各服务调用情况</div>
        </div>
        <div className="c-chart__controls">
          <div className="c-chart__checks">
            {CHART_OPTIONS.map((code) => (
              <label key={code} className="c-chart__check">
                <input
                  type="checkbox"
                  checked={selected.includes(code)}
                  onChange={() => toggle(code)}
                />
                <span className="c-chart__swatch" style={{ background: chartColor(code) }} />
                {productName(code)}
              </label>
            ))}
          </div>
          <div className="c-chart__tabs">
            <button
              type="button"
              className={`a-btn a-btn--sm${range === "7d" ? " a-btn--primary" : ""}`}
              onClick={() => setRange("7d")}
            >
              近7天
            </button>
            <button
              type="button"
              className={`a-btn a-btn--sm${range === "30d" ? " a-btn--primary" : ""}`}
              onClick={() => setRange("30d")}
            >
              近30天
            </button>
          </div>
        </div>
      </div>
      <div className="a-card__body">
        {selected.length === 0 ? (
          <div className="a-placeholder">请至少勾选一个产品</div>
        ) : (
          <svg
            className="c-chart__svg"
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="调用量趋势折线图"
          >
            {[0, 0.25, 0.5, 0.75, 1].map((t) => {
              const y = pad.t + innerH * (1 - t);
              const val = Math.round(maxY * t);
              return (
                <g key={t}>
                  <line
                    x1={pad.l}
                    y1={y}
                    x2={width - pad.r}
                    y2={y}
                    stroke="var(--n-200)"
                    strokeWidth="1"
                  />
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
                <g key={s.code}>
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
              if (range === "30d" && i % 5 !== 0 && i !== labels.length - 1) return null;
              const n = labels.length;
              return (
                <text
                  key={label + i}
                  x={xAt(i, n)}
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
        )}
      </div>
    </div>
  );
}

function chartColor(code: ProductCode): string {
  if (code === "dci") return "#1890ff";
  if (code === "info") return "#52c41a";
  return "#ff9c6e";
}
