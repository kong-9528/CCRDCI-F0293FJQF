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

type TrendMetric = "activeAccounts" | "calls" | "successRate";

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  activeAccounts: "日调用账号数",
  calls: "日调用次数",
  successRate: "日成功率",
};

export function ProductStatsPage() {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const [boardPeriod, setBoardPeriod] = useState<StatsPeriod>("7d");
  const [trendRange, setTrendRange] = useState<TrendRange>("30d");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("calls");
  const [selected, setSelected] = useState<ProductCode[]>([PRODUCTS[0]!.code]);
  const [rankRange, setRankRange] = useState<TrendRange>("30d");
  const [productsExpanded, setProductsExpanded] = useState(false);

  const boardDates = sliceDates(boardPeriod);
  const periodLabel =
    boardPeriod === "1d" ? "昨日" : boardPeriod === "7d" ? "近7日" : "近30日";

  const productCards = PRODUCTS.map((p) => {
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
      opened,
      activeAccounts,
      totalCalls: sumCalls(all),
      periodCalls: sumCalls(period),
      overallRate: avgSuccessRate(all),
      periodRate: avgSuccessRate(period),
    };
  });

  const visibleProductCards = productsExpanded
    ? productCards
    : productCards.slice(0, 2);

  const trendDates = sliceDates(trendRange);
  const trendSeries = selected.map((code, idx) => {
    const values = trendDates.map((date) => {
      const row = data.productDays.find((r) => r.date === date && r.product === code);
      if (!row) return 0;
      if (trendMetric === "calls") return row.calls;
      if (trendMetric === "activeAccounts") return row.activeAccounts;
      return row.successRate;
    });
    return {
      id: code,
      label: PRODUCTS.find((p) => p.code === code)?.name ?? code,
      color: chartColor(idx),
      values,
    };
  });

  const rankDates = sliceDates(rankRange);
  const rankRows = PRODUCTS.map((p) => {
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
  }).sort((a, b) => b.calls - a.calls);

  const toggleProduct = (code: ProductCode) => {
    setSelected((prev) => {
      if (prev.includes(code)) {
        if (prev.length === 1) return prev;
        return prev.filter((c) => c !== code);
      }
      return [...prev, code];
    });
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          分产品表盘
          <div className="a-card__extra">
            <StatsPeriodToggle value={boardPeriod} onChange={setBoardPeriod} />
          </div>
        </div>
        <div className="a-card__body">
          <div className="a-product-board">
            {visibleProductCards.map((card) => (
              <div key={card.code} className="a-product-board__card">
                <div className="a-product-board__name">{card.name}</div>
                <div className="a-metric-groups">
                  <div className="a-metric-group">
                    <div className="a-metric-group__title">账号规模</div>
                    <div className="a-metric-pair">
                      <div className="a-metric-pair__item">
                        <div className="a-stat__label">开通账号数</div>
                        <div className="a-stat__num">{card.opened}</div>
                      </div>
                      <div className="a-metric-pair__item is-period">
                        <div className="a-stat__label">{periodLabel}活跃账号</div>
                        <div className="a-stat__num">{card.activeAccounts}</div>
                      </div>
                    </div>
                  </div>
                  <div className="a-metric-group">
                    <div className="a-metric-group__title">调用量</div>
                    <div className="a-metric-pair">
                      <div className="a-metric-pair__item">
                        <div className="a-stat__label">总调用次数</div>
                        <div className="a-stat__num">{card.totalCalls.toLocaleString()}</div>
                      </div>
                      <div className="a-metric-pair__item is-period">
                        <div className="a-stat__label">{periodLabel}调用</div>
                        <div className="a-stat__num">{card.periodCalls.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="a-metric-group">
                    <div className="a-metric-group__title">成功率</div>
                    <div className="a-metric-pair">
                      <div className="a-metric-pair__item">
                        <div className="a-stat__label">整体成功率</div>
                        <div className="a-stat__num">{card.overallRate.toFixed(1)}%</div>
                      </div>
                      <div className="a-metric-pair__item is-period">
                        <div className="a-stat__label">{periodLabel}成功率</div>
                        <div className="a-stat__num">{card.periodRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {productCards.length > 2 ? (
              <button
                type="button"
                className="a-product-board__toggle"
                onClick={() => setProductsExpanded((v) => !v)}
              >
                {productsExpanded
                  ? "收起全部产品"
                  : `展开全部产品（还有 ${productCards.length - 2} 个）`}
              </button>
            ) : null}
          </div>
        </div>
      </div>

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
        <div className="a-card__body a-stack">
          <div className="a-check-row">
            {PRODUCTS.map((p) => (
              <label key={p.code} className="a-check">
                <input
                  type="checkbox"
                  checked={selected.includes(p.code)}
                  onChange={() => toggleProduct(p.code)}
                />
                {p.name}
              </label>
            ))}
          </div>
          <TrendChart
            labels={trendDates}
            unit={trendMetric === "successRate" ? "%" : ""}
            series={trendSeries}
          />
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          产品调用榜单
          <div className="a-card__extra a-inline-actions">
            <TrendRangeToggle value={rankRange} onChange={setRankRange} />
            <button type="button" className="a-btn a-btn--sm" onClick={exportProductDailyCsv}>
              下载统计报表
            </button>
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--primary"
              onClick={exportAccountProductDailyCsv}
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
