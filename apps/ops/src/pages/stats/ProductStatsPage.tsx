import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { TrendChart, chartColor } from "@/components/TrendChart";
import {
  SegmentedControl,
  TrendRangeToggle,
} from "@/components/StatsControls";
import { StatsCardGlyph } from "@/components/StatsCardGlyph";
import { normalizeProductCode, type ProductCode } from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import {
  exportAccountProductDailyCsv,
  exportProductDailyCsv,
  getStatsData,
  refreshStatsData,
  sliceDates,
  sumApiCalls,
  sumCalls,
  sumPageSubmitCalls,
  type TrendRange,
} from "@/lib/statsData";
import {
  isStatsScope,
  statsProductsForScope,
  type StatsScope,
} from "@/lib/statsScope";

type TrendMetric = "activeAccounts" | "calls";

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  activeAccounts: "日调用账号数",
  calls: "日调用次数",
};

export function ProductStatsPage() {
  const { scope: scopeParam } = useParams();
  if (!isStatsScope(scopeParam)) {
    return <Navigate to="/stats/verify/products" replace />;
  }
  return <ProductStatsBody scope={scopeParam} />;
}

function ProductStatsBody({ scope }: { scope: StatsScope }) {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const [trendRange, setTrendRange] = useState<TrendRange>("30d");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("calls");
  const [rankRange, setRankRange] = useState<TrendRange>("30d");

  const categoryProducts = statsProductsForScope(scope);
  const productCodes = categoryProducts.map((p) => p.code) as ProductCode[];
  const showChannelMetrics = scope === "verify";

  const productCards = categoryProducts.map((p) => {
    const all = data.productDays.filter((r) => r.product === p.code);
    const lookupCode = scope === "audit" ? "workReview" : p.code;
    const totalAccounts = data.customers.filter((c) =>
      c.productServices.some((s) => normalizeProductCode(s.product) === lookupCode),
    ).length;
    return {
      code: p.code,
      name: p.name,
      totalAccounts,
      totalCalls: sumCalls(all),
      pageSubmitCalls: sumPageSubmitCalls(all),
      apiCalls: sumApiCalls(all),
    };
  });

  const trendDates = sliceDates(trendRange);
  const trendSeries = categoryProducts.map((p, idx) => {
    const values = trendDates.map((date) => {
      const row = data.productDays.find((r) => r.date === date && r.product === p.code);
      if (!row) return 0;
      if (trendMetric === "calls") return row.calls;
      return row.activeAccounts;
    });
    return {
      id: p.code,
      label: p.name,
      color: chartColor(idx),
      values,
    };
  });

  const rankDates = sliceDates(rankRange);
  const rankRows = categoryProducts
    .map((p) => {
      const rows = data.productDays.filter(
        (r) => r.product === p.code && rankDates.includes(r.date),
      );
      return {
        code: p.code,
        name: p.name,
        calls: sumCalls(rows),
        activeAccounts: Math.round(
          rows.reduce((s, r) => s + r.activeAccounts, 0) / Math.max(1, rows.length),
        ),
      };
    })
    .sort((a, b) => b.calls - a.calls);

  return (
    <div className="a-stack a-stats-products">
      <section className="a-stats-overview">
        <div className="a-product-board a-product-board--compact">
          {productCards.map((card, i) => {
            const metrics = showChannelMetrics
              ? [
                  { label: "总账号数", value: String(card.totalAccounts) },
                  { label: "总调用次数", value: card.totalCalls.toLocaleString() },
                  { label: "页面提交次数", value: card.pageSubmitCalls.toLocaleString() },
                  { label: "API调用次数", value: card.apiCalls.toLocaleString() },
                ]
              : [
                  { label: "总账号数", value: String(card.totalAccounts) },
                  { label: "总调用次数", value: card.totalCalls.toLocaleString() },
                ];

            return (
              <article
                key={card.code}
                className={`a-product-board__card a-product-board__card--tone-${i % 3}`}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <header className="a-product-board__head">
                  <h3 className="a-product-board__name">{card.name}</h3>
                </header>
                <div
                  className={`a-stats-strip__metrics a-product-board__metrics${
                    showChannelMetrics
                      ? " a-stats-strip__metrics--4"
                      : " a-stats-strip__metrics--2"
                  }`}
                >
                  {metrics.map((item) => (
                    <div key={item.label} className="a-stats-strip__cell">
                      <span className="a-stats-strip__value">{item.value}</span>
                      <span className="a-stats-strip__label">{item.label}</span>
                    </div>
                  ))}
                </div>
                <StatsCardGlyph
                  kind={i % 3 === 0 ? "product" : i % 3 === 1 ? "chart" : "api"}
                  className="a-product-board__glyph"
                />
              </article>
            );
          })}
        </div>
      </section>

      <div className="a-card">
        <div className="a-card__head">
          产品趋势
          <div className="a-card__extra a-inline-actions">
            <SegmentedControl
              value={trendMetric}
              onChange={setTrendMetric}
              options={(Object.keys(TREND_METRIC_LABEL) as TrendMetric[]).map((k) => ({
                value: k,
                label: TREND_METRIC_LABEL[k],
              }))}
            />
            <TrendRangeToggle value={trendRange} onChange={setTrendRange} />
          </div>
        </div>
        <div className="a-card__body">
          <TrendChart labels={trendDates} series={trendSeries} />
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          产品调用汇总数据
          <div className="a-card__extra a-inline-actions">
            <TrendRangeToggle value={rankRange} onChange={setRankRange} />
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => exportProductDailyCsv(productCodes)}
            >
              下载统计报表
            </button>
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--primary"
              onClick={() => exportAccountProductDailyCsv(productCodes)}
            >
              下载明细报表
            </button>
          </div>
        </div>
        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>排名</th>
                <th>产品</th>
                <th>调用次数</th>
                <th>日均调用账号数</th>
              </tr>
            </thead>
            <tbody>
              {rankRows.map((row, i) => (
                <tr key={row.code}>
                  <td className="num">{i + 1}</td>
                  <td>{row.name}</td>
                  <td className="num">{row.calls.toLocaleString()}</td>
                  <td className="num">{row.activeAccounts}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
