import { useMemo, useState } from "react";
import { TrendChart, chartColor } from "@/components/TrendChart";
import {
  SegmentedControl,
  StatsPeriodToggle,
  TrendRangeToggle,
} from "@/components/StatsControls";
import { PRODUCTS, type ProductCode } from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import {
  exportAccountProductDailyCsv,
  exportProductDailyCsv,
  getStatsData,
  refreshStatsData,
  sliceDates,
  sumCalls,
  type StatsPeriod,
  type TrendRange,
} from "@/lib/statsData";

type ProductStatsTab = "verify" | "audit";
type TrendMetric = "activeAccounts" | "calls";

const TAB_ITEMS: { key: ProductStatsTab; label: string }[] = [
  { key: "verify", label: "版权核验使用统计" },
  { key: "audit", label: "智能辅助审核使用统计" },
];

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  activeAccounts: "日调用账号数",
  calls: "日调用次数",
};

export function ProductStatsPage() {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const [tab, setTab] = useState<ProductStatsTab>("verify");
  const [boardPeriod, setBoardPeriod] = useState<StatsPeriod>("7d");
  const [trendRange, setTrendRange] = useState<TrendRange>("30d");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("calls");
  const [rankRange, setRankRange] = useState<TrendRange>("30d");

  const categoryProducts = useMemo(
    () => PRODUCTS.filter((p) => p.category === tab),
    [tab],
  );
  const productCodes = useMemo(
    () => categoryProducts.map((p) => p.code) as ProductCode[],
    [categoryProducts],
  );

  const boardDates = sliceDates(boardPeriod);
  const periodLabel =
    boardPeriod === "1d" ? "昨日" : boardPeriod === "7d" ? "近7日" : "近30日";

  const productCards = categoryProducts.map((p) => {
    const all = data.productDays.filter((r) => r.product === p.code);
    const period = all.filter((r) => boardDates.includes(r.date));
    const opened = data.customers.filter((c) =>
      c.productServices.some((s) => s.product === p.code),
    ).length;
    const activeAccounts = new Set(
      data.accountProductDays
        .filter((r) => r.product === p.code && boardDates.includes(r.date) && r.calls > 0)
        .map((r) => r.customerId),
    ).size;
    return {
      code: p.code,
      name: p.name,
      category: p.category,
      opened,
      activeAccounts,
      totalCalls: sumCalls(all),
      periodCalls: sumCalls(period),
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
    <div className="a-stack">
      <div className="a-tabs a-tabs--segment" role="tablist">
        {TAB_ITEMS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`a-tabs__item${tab === key ? " is-active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <section className="a-card a-dash-panel a-dash-panel--product-board">
        <div className="a-card__head a-dash-panel__head">
          <span className="a-dash-panel__title">产品概览</span>
          <div className="a-card__extra">
            <StatsPeriodToggle value={boardPeriod} onChange={setBoardPeriod} />
          </div>
        </div>
        <div className="a-card__body a-dash-panel__body">
          <div className="a-product-board">
            {productCards.map((card, i) => (
              <article
                key={card.code}
                className={`a-product-board__card a-product-board__card--tone-${i % 3}`}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <header className="a-product-board__head">
                  <h3 className="a-product-board__name">{card.name}</h3>
                </header>
                <div className="a-product-board__groups">
                  <div className="a-product-board__group">
                    <div className="a-product-board__group-title">账号规模</div>
                    <div className="a-product-board__pair">
                      <div className="a-product-board__cell">
                        <span className="a-product-board__value">{card.opened}</span>
                        <span className="a-product-board__label">开通账号数</span>
                      </div>
                      <div className="a-product-board__cell a-product-board__cell--period">
                        <span className="a-product-board__value">{card.activeAccounts}</span>
                        <span className="a-product-board__label">{periodLabel}调用账号数</span>
                      </div>
                    </div>
                  </div>
                  <div className="a-product-board__group">
                    <div className="a-product-board__group-title">调用量</div>
                    <div className="a-product-board__pair">
                      <div className="a-product-board__cell">
                        <span className="a-product-board__value">
                          {card.totalCalls.toLocaleString()}
                        </span>
                        <span className="a-product-board__label">总调用次数</span>
                      </div>
                      <div className="a-product-board__cell a-product-board__cell--period">
                        <span className="a-product-board__value">
                          {card.periodCalls.toLocaleString()}
                        </span>
                        <span className="a-product-board__label">{periodLabel}调用次数</span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
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
          <TrendChart
            labels={trendDates}
            series={trendSeries}
          />
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
