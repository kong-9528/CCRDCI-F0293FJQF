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
  avgSuccessRate,
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
type TrendMetric = "activeAccounts" | "calls" | "successRate";

const TAB_ITEMS: { key: ProductStatsTab; label: string }[] = [
  { key: "verify", label: "版权核验使用统计" },
  { key: "audit", label: "智能辅助审核使用统计" },
];

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  activeAccounts: "日调用账号数",
  calls: "日调用次数",
  successRate: "日成功率",
};

const CATEGORY_TAG: Record<ProductStatsTab, string> = {
  verify: "版权核验",
  audit: "智能审核",
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
      overallRate: avgSuccessRate(all),
      periodRate: avgSuccessRate(period),
    };
  });

  const trendDates = sliceDates(trendRange);
  const trendSeries = categoryProducts.map((p, idx) => {
    const values = trendDates.map((date) => {
      const row = data.productDays.find((r) => r.date === date && r.product === p.code);
      if (!row) return 0;
      if (trendMetric === "calls") return row.calls;
      if (trendMetric === "activeAccounts") return row.activeAccounts;
      return row.successRate;
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
        successRate: avgSuccessRate(rows),
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
          <span className="a-dash-panel__title">分产品表盘</span>
          <div className="a-card__extra">
            <StatsPeriodToggle value={boardPeriod} onChange={setBoardPeriod} />
          </div>
        </div>
        <div className="a-card__body a-dash-panel__body">
          <div className="a-product-board">
            {productCards.map((card, i) => (
              <article
                key={card.code}
                className={`a-product-board__card a-product-board__card--${card.category}`}
                style={{ animationDelay: `${i * 45}ms` }}
              >
                <header className="a-product-board__head">
                  <span className="a-product-board__index" aria-hidden>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="a-product-board__titles">
                    <span className="a-product-board__tag">{CATEGORY_TAG[tab]}</span>
                    <h3 className="a-product-board__name">{card.name}</h3>
                  </div>
                </header>
                <div className="a-product-board__groups">
                  <div className="a-product-board__group">
                    <div className="a-product-board__group-title">账号规模</div>
                    <div className="a-product-board__pair">
                      <div className="a-product-board__cell">
                        <span className="a-product-board__label">开通账号数</span>
                        <span className="a-product-board__value">{card.opened}</span>
                      </div>
                      <div className="a-product-board__cell a-product-board__cell--period">
                        <span className="a-product-board__label">{periodLabel}活跃账号</span>
                        <span className="a-product-board__value">{card.activeAccounts}</span>
                      </div>
                    </div>
                  </div>
                  <div className="a-product-board__group">
                    <div className="a-product-board__group-title">调用量</div>
                    <div className="a-product-board__pair">
                      <div className="a-product-board__cell">
                        <span className="a-product-board__label">总调用次数</span>
                        <span className="a-product-board__value">
                          {card.totalCalls.toLocaleString()}
                        </span>
                      </div>
                      <div className="a-product-board__cell a-product-board__cell--period">
                        <span className="a-product-board__label">{periodLabel}调用</span>
                        <span className="a-product-board__value">
                          {card.periodCalls.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="a-product-board__group">
                    <div className="a-product-board__group-title">成功率</div>
                    <div className="a-product-board__pair">
                      <div className="a-product-board__cell">
                        <span className="a-product-board__label">整体成功率</span>
                        <span className="a-product-board__value">
                          {card.overallRate.toFixed(1)}%
                        </span>
                      </div>
                      <div className="a-product-board__cell a-product-board__cell--period">
                        <span className="a-product-board__label">{periodLabel}成功率</span>
                        <span className="a-product-board__value">
                          {card.periodRate.toFixed(1)}%
                        </span>
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
            unit={trendMetric === "successRate" ? "%" : ""}
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
                <th>日均活跃账号</th>
                <th>成功率</th>
              </tr>
            </thead>
            <tbody>
              {rankRows.map((row, i) => (
                <tr key={row.code}>
                  <td className="num">{i + 1}</td>
                  <td>{row.name}</td>
                  <td className="num">{row.calls.toLocaleString()}</td>
                  <td className="num">{row.activeAccounts}</td>
                  <td className="num">{row.successRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
