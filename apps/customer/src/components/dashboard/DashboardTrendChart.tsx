import { useMemo, useState } from "react";
import { productName, type ProductCode } from "@/lib/catalog";
import {
  CHART_DEFAULT_PRODUCTS,
  chartLabels,
  chartSeries,
  type ChartRange,
} from "@/lib/dashboard";
import { LineTrendChart } from "@/components/charts/LineTrendChart";

const CHART_OPTIONS: ProductCode[] = CHART_DEFAULT_PRODUCTS;

function chartColor(code: ProductCode): string {
  if (code === "dci") return "#0075c1";
  if (code === "info") return "#52c41a";
  return "#ff9c6e";
}

export function DashboardTrendChart() {
  const [range, setRange] = useState<ChartRange>("7d");
  const [selected, setSelected] = useState<ProductCode[]>([...CHART_DEFAULT_PRODUCTS]);

  const series = useMemo(
    () =>
      chartSeries(range, selected).map((s) => ({
        key: s.code,
        name: s.name,
        color: s.color,
        values: s.values,
      })),
    [range, selected],
  );
  const labels = useMemo(() => chartLabels(range), [range]);

  const toggle = (code: ProductCode) => {
    setSelected((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
  };

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
        <LineTrendChart
          series={series}
          labels={labels}
          labelStep={range === "30d" ? 5 : 1}
          emptyText="请至少勾选一个产品"
        />
      </div>
    </div>
  );
}
