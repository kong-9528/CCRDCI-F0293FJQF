import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { TrendChart, chartColor } from "@/components/TrendChart";
import { SegmentedControl, StatsPeriodToggle } from "@/components/StatsControls";
import { CONFIGURABLE_PRODUCTS, type ProductCode } from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import {
  STATS_PERIOD_LABEL,
  buildAccountProductSummaries,
  exportAccountProductDailyCsv,
  exportAccountProductSummaryCsv,
  getAccountProductTrend,
  getStatsData,
  refreshStatsData,
  sumApiCalls,
  sumCalls,
  sumPageSubmitCalls,
  type AccountProductSummary,
  type StatsPeriod,
} from "@/lib/statsData";

type CategoryFilter = "" | "verify" | "audit";

type Selection = {
  customerId: string;
  product: ProductCode;
  account: string;
  productLabel: string;
};

const CATEGORY_OPTIONS: { value: CategoryFilter; label: string }[] = [
  { value: "", label: "全部产品" },
  { value: "verify", label: "版权核验" },
  { value: "audit", label: "智能审核" },
];

const PAGE_SIZE = 12;
/** 热力矩阵：先取调用量 Top N「账号×产品」组合，再反推账号列 */
const MATRIX_TOP_COMBO_LIMIT = 40;
/** 趋势图：当前筛选下调用量最高的组合数 */
const TREND_TOP_COMBO_LIMIT = 5;

function heatLevel(calls: number, max: number): number {
  if (!calls || !max) return 0;
  const ratio = calls / max;
  if (ratio >= 0.8) return 5;
  if (ratio >= 0.6) return 4;
  if (ratio >= 0.4) return 3;
  if (ratio >= 0.2) return 2;
  return 1;
}

function quotaBarClass(pct: number | null) {
  if (pct == null) return "";
  if (pct >= 90) return " is-danger";
  if (pct >= 70) return " is-warn";
  return "";
}

export function AccountProductStatsPage() {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const [statsPeriod, setStatsPeriod] = useState<StatsPeriod>("7d");
  const [category, setCategory] = useState<CategoryFilter>("");
  const [productFilter, setProductFilter] = useState<ProductCode | "">("");
  const [accountQuery, setAccountQuery] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [selection, setSelection] = useState<Selection | null>(null);
  const [page, setPage] = useState(1);

  const filters = useMemo(
    () => ({
      product: productFilter,
      category,
      accountQuery: appliedQuery,
    }),
    [productFilter, category, appliedQuery],
  );

  const summaries = useMemo(
    () => buildAccountProductSummaries(statsPeriod, filters),
    [statsPeriod, filters, data],
  );

  /** 搜索条件下的 Top N 组合（矩阵 / 趋势共用此排序结果） */
  const topCombos = useMemo(
    () => summaries.slice(0, MATRIX_TOP_COMBO_LIMIT),
    [summaries],
  );

  const cellCalls = useMemo(() => {
    const map = new Map<string, number>();
    for (const row of topCombos) {
      map.set(`${row.customerId}:${row.product}`, row.calls);
    }
    return map;
  }, [topCombos]);

  const visibleMatrix = useMemo(() => {
    const summaryKeys = new Set(
      topCombos.map((s) => `${s.customerId}:${s.product}`),
    );
    const accounts: { customerId: string; account: string; companyName: string }[] = [];
    const seenAccounts = new Set<string>();
    for (const row of topCombos) {
      if (seenAccounts.has(row.customerId)) continue;
      seenAccounts.add(row.customerId);
      accounts.push({
        customerId: row.customerId,
        account: row.account,
        companyName: row.companyName,
      });
    }
    const productCodes = new Set(topCombos.map((s) => s.product));
    const products = CONFIGURABLE_PRODUCTS.filter((p) => productCodes.has(p.code)).map(
      (p) => ({
        code: p.code,
        label: p.name,
        category: p.category as "verify" | "audit",
      }),
    );
    return {
      accounts,
      products,
      summaryKeys,
      topComboCount: topCombos.length,
      totalCombos: summaries.length,
      truncated: summaries.length > MATRIX_TOP_COMBO_LIMIT,
    };
  }, [topCombos, summaries.length]);

  const trendTopPairs = useMemo(
    () => summaries.slice(0, TREND_TOP_COMBO_LIMIT),
    [summaries],
  );

  const activePairs = summaries.filter((s) => s.calls > 0).length;
  const totalCalls = sumCalls(summaries);
  const pageCalls = sumPageSubmitCalls(summaries);
  const apiCalls = sumApiCalls(summaries);

  const topPairs = trendTopPairs;

  const hasActiveFilters = Boolean(appliedQuery || productFilter || category);

  const trendSeries = useMemo(() => {
    if (selection) {
      const points = getAccountProductTrend(selection.customerId, selection.product, statsPeriod);
      return {
        labels: points.map((p) => p.date.slice(5)),
        series: [
          {
            id: "calls",
            label: "日调用次数",
            color: chartColor(0),
            values: points.map((p) => p.calls),
          },
        ],
        title: `${selection.account} · ${selection.productLabel}`,
      };
    }
    if (topPairs.length === 0) {
      return { labels: [], series: [], title: `调用量 TOP${TREND_TOP_COMBO_LIMIT} 组合趋势` };
    }
    const labels = getAccountProductTrend(
      topPairs[0]!.customerId,
      topPairs[0]!.product,
      statsPeriod,
    ).map((p) => p.date.slice(5));
    const trendTitle = hasActiveFilters
      ? `调用量 TOP${TREND_TOP_COMBO_LIMIT} 组合趋势（当前筛选 Top ${Math.min(TREND_TOP_COMBO_LIMIT, summaries.length)} / 共 ${summaries.length}）`
      : `调用量 TOP${TREND_TOP_COMBO_LIMIT} 组合趋势`;
    return {
      labels,
      series: topPairs.map((row, idx) => ({
        id: `${row.customerId}-${row.product}`,
        label: `${row.account}·${row.productLabel}`,
        color: chartColor(idx),
        values: getAccountProductTrend(row.customerId, row.product, statsPeriod).map(
          (p) => p.calls,
        ),
      })),
      title: trendTitle,
    };
  }, [selection, topPairs, statsPeriod, hasActiveFilters, summaries.length]);

  const totalPages = Math.max(1, Math.ceil(summaries.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = summaries.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const applyFilters = () => {
    const nextQuery = accountQuery;
    setAppliedQuery(nextQuery);
    setPage(1);
    setSelection((prev) => {
      if (!prev) return null;
      const nextSummaries = buildAccountProductSummaries(statsPeriod, {
        product: productFilter,
        category,
        accountQuery: nextQuery,
      });
      return nextSummaries.some(
        (s) => s.customerId === prev.customerId && s.product === prev.product,
      )
        ? prev
        : null;
    });
  };

  const resetFilters = () => {
    setAccountQuery("");
    setAppliedQuery("");
    setProductFilter("");
    setCategory("");
    setPage(1);
    setSelection(null);
  };

  const pickCell = (row: AccountProductSummary) => {
    setSelection({
      customerId: row.customerId,
      product: row.product,
      account: row.account,
      productLabel: row.productLabel,
    });
  };

  const matrixMax = useMemo(() => {
    let max = 0;
    for (const p of visibleMatrix.products) {
      for (const a of visibleMatrix.accounts) {
        const v = cellCalls.get(`${a.customerId}:${p.code}`) ?? 0;
        if (v > max) max = v;
      }
    }
    return max;
  }, [visibleMatrix, cellCalls]);

  const overviewMetrics = [
    { label: "开通组合", value: summaries.length.toLocaleString() },
    {
      label: `${STATS_PERIOD_LABEL[statsPeriod]}有调用组合`,
      value: activePairs.toLocaleString(),
    },
    {
      label: `${STATS_PERIOD_LABEL[statsPeriod]}调用次数`,
      value: totalCalls.toLocaleString(),
    },
    {
      label: "页面 / API",
      value: `${pageCalls.toLocaleString()} / ${apiCalls.toLocaleString()}`,
    },
  ];

  return (
    <div className="a-stack a-stats-account-product">
      <section className="a-stats-overview">
        <article className="a-stats-strip a-stats-strip--customer">
          <div className="a-stats-strip__metrics a-stats-strip__metrics--4">
            {overviewMetrics.map((item) => (
              <div key={item.label} className="a-stats-strip__cell">
                <span className="a-stats-strip__value">{item.value}</span>
                <span className="a-stats-strip__label">{item.label}</span>
              </div>
            ))}
          </div>
        </article>
      </section>

      <div className="a-card">
        <div className="a-toolbar a-toolbar--wrap a-stats-ap-filters">
          <div className="a-field">
            <span className="a-field__label">产品类型</span>
            <SegmentedControl
              value={category}
              onChange={(v) => {
                setCategory(v);
                setProductFilter("");
                setPage(1);
                setSelection(null);
              }}
              options={CATEGORY_OPTIONS}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">产品</span>
            <select
              className="a-select"
              value={productFilter}
              onChange={(e) => {
                setProductFilter(e.target.value as ProductCode | "");
                setPage(1);
                setSelection(null);
              }}
            >
              <option value="">全部开通产品</option>
              {CONFIGURABLE_PRODUCTS.filter(
                (p) => !category || p.category === category,
              ).map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">账号 / 公司</span>
            <input
              className="a-input"
              placeholder="模糊搜索"
              value={accountQuery}
              onChange={(e) => setAccountQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") applyFilters();
              }}
            />
          </div>
          <div className="a-stats-ap-filters__actions">
            <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={applyFilters}>
              查询
            </button>
            <button type="button" className="a-btn a-btn--sm" onClick={resetFilters}>
              重置
            </button>
          </div>
          <div className="a-stats-ap-filters__period">
            <StatsPeriodToggle
              value={statsPeriod}
              onChange={(v) => {
                setStatsPeriod(v);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="a-card a-stats-ap-panel">
        <section className="a-stats-ap-panel__section">
          <div className="a-stats-ap-panel__head">
            <h3 className="a-stats-ap-panel__title">用量热力矩阵</h3>
            <span className="a-field__hint a-stats-ap-panel__hint">
              颜色越深表示调用越多；「—」表示该账号在统计时段内未开通该产品。点击单元格可查看趋势。
              {visibleMatrix.truncated
                ? ` 当前共 ${visibleMatrix.totalCombos} 个组合，矩阵展示其中 Top ${visibleMatrix.topComboCount}（对应 ${visibleMatrix.accounts.length} 个账号）；全部组合见下方明细。`
                : ""}
            </span>
            <div className="a-stats-matrix-legend a-stats-matrix-legend--inline">
              <span>低</span>
              {[0, 1, 2, 3, 4, 5].map((n) => (
                <span key={n} className={`a-stats-matrix-legend__swatch a-stats-matrix-legend__swatch--l${n}`} />
              ))}
              <span>高</span>
            </div>
          </div>
          <div className="a-stats-ap-panel__body a-stats-ap-panel__body--matrix">
            {visibleMatrix.accounts.length === 0 || visibleMatrix.products.length === 0 ? (
              <div className="a-empty">暂无符合条件的开通组合</div>
            ) : (
              <div className="a-stats-matrix-wrap">
                <table className="a-stats-matrix a-stats-matrix--transposed">
                  <thead>
                    <tr>
                      <th className="a-stats-matrix__corner">产品 \ 账号</th>
                      {visibleMatrix.accounts.map((a) => (
                        <th key={a.customerId} className="a-stats-matrix__col-head a-stats-matrix__col-head--account">
                          <Link to={`/customers/${a.customerId}`} className="a-stats-matrix__account">
                            {a.account}
                          </Link>
                          <span className="a-stats-matrix__company">{a.companyName}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMatrix.products.map((p) => (
                      <tr key={p.code}>
                        <th className="a-stats-matrix__row-head a-stats-matrix__row-head--product">
                          {p.label}
                        </th>
                        {visibleMatrix.accounts.map((a) => {
                          const key = `${a.customerId}:${p.code}`;
                          if (!visibleMatrix.summaryKeys.has(key)) {
                            return (
                              <td key={a.customerId}>
                                <span
                                  className="a-stats-matrix__cell a-stats-matrix__cell--na"
                                  title={`${a.account} · ${p.label}：未开通`}
                                >
                                  —
                                </span>
                              </td>
                            );
                          }
                          const calls = cellCalls.get(key) ?? 0;
                          const level = heatLevel(calls, matrixMax);
                          const isSelected =
                            selection?.customerId === a.customerId &&
                            selection?.product === p.code;
                          return (
                            <td key={a.customerId}>
                              <button
                                type="button"
                                className={`a-stats-matrix__cell a-stats-matrix__cell--l${level}${isSelected ? " is-selected" : ""}`}
                                title={`${a.account} · ${p.label}：${calls.toLocaleString()} 次`}
                                onClick={() =>
                                  pickCell({
                                    customerId: a.customerId,
                                    account: a.account,
                                    companyName: a.companyName,
                                    contactName: "",
                                    product: p.code,
                                    productLabel: p.label,
                                    productCategory: p.category,
                                    calls,
                                    pageSubmitCalls: 0,
                                    apiCalls: 0,
                                    successRate: 0,
                                    activeDays: 0,
                                    lifetimeUsed: 0,
                                    quotaTotal: null,
                                    quotaUsagePct: null,
                                    serviceStatus: "",
                                    accountStatus: "",
                                    periodStatus: "",
                                  })
                                }
                              >
                                {calls > 0 ? calls.toLocaleString() : "0"}
                              </button>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="a-stats-ap-panel__section a-stats-ap-panel__section--last">
          <div className="a-stats-ap-panel__head">
            <h3 className="a-stats-ap-panel__title">{trendSeries.title}</h3>
            {selection ? (
              <button
                type="button"
                className="a-btn a-btn--text a-btn--sm"
                onClick={() => setSelection(null)}
              >
                返回 TOP{TREND_TOP_COMBO_LIMIT}
              </button>
            ) : null}
          </div>
          <div className="a-stats-ap-panel__body a-stats-ap-panel__body--trend">
            {trendSeries.labels.length === 0 ? (
              <div className="a-empty">暂无趋势数据</div>
            ) : (
              <TrendChart
                labels={trendSeries.labels}
                series={trendSeries.series}
                height={240}
                dense
              />
            )}
          </div>
        </section>
      </div>

      <div className="a-card">
        <div className="a-card__head a-stats-ap-detail-head">
          <div className="a-stats-ap-detail-head__main">
            <span>账号产品使用明细</span>
            <span className="a-field__hint a-stats-ap-detail-head__hint">
              下列为当前搜索条件与统计周期下的全部「账号×产品」组合；上方矩阵 / 趋势仅展示其中调用量 Top{" "}
              {MATRIX_TOP_COMBO_LIMIT} 组合及其账号
            </span>
          </div>
          <div className="a-card__extra a-inline-actions">
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => exportAccountProductSummaryCsv(statsPeriod, filters)}
            >
              下载汇总报表
            </button>
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--primary"
              onClick={() =>
                exportAccountProductDailyCsv(
                  productFilter ? [productFilter] : undefined,
                )
              }
            >
              下载日明细
            </button>
          </div>
        </div>
        <div className="a-card__body a-card__body--flush">
          <table className="a-table a-table--compact">
            <thead>
              <tr>
                <th>账号</th>
                <th>公司</th>
                <th>产品</th>
                <th>{STATS_PERIOD_LABEL[statsPeriod]}调用次数</th>
                <th>页面 / API</th>
                <th>活跃天</th>
                <th>历史累积</th>
                <th>额度使用</th>
                <th>服务状态</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="a-empty">暂无数据</div>
                  </td>
                </tr>
              ) : (
                pageRows.map((row) => (
                  <tr
                    key={`${row.customerId}-${row.product}`}
                    className={
                      selection?.customerId === row.customerId &&
                      selection?.product === row.product
                        ? "is-selected"
                        : undefined
                    }
                  >
                    <td>
                      <Link to={`/customers/${row.customerId}`}>
                        <code>{row.account}</code>
                      </Link>
                    </td>
                    <td>{row.companyName}</td>
                    <td>
                      <span className={`a-tag a-tag--cyan`}>{row.productLabel}</span>
                    </td>
                    <td className="num">{row.calls.toLocaleString()}</td>
                    <td className="num">
                      {row.productCategory === "verify"
                        ? `${row.pageSubmitCalls.toLocaleString()} / ${row.apiCalls.toLocaleString()}`
                        : "—"}
                    </td>
                    <td className="num">{row.activeDays}</td>
                    <td className="num">{row.lifetimeUsed.toLocaleString()}</td>
                    <td>
                      {row.quotaUsagePct == null ? (
                        <span style={{ color: "var(--n-400)" }}>不限量</span>
                      ) : (
                        <div className="a-quota-bar">
                          <div
                            className={`a-quota-bar__fill${quotaBarClass(row.quotaUsagePct)}`}
                            style={{ width: `${row.quotaUsagePct}%` }}
                          />
                          <span className="a-quota-bar__text">{row.quotaUsagePct}%</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <span
                        className={`a-tag${row.serviceStatus === "使用中" ? " a-tag--ok" : row.serviceStatus === "已停止" ? " a-tag--er" : " a-tag--muted"}`}
                      >
                        {row.serviceStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="a-pagination">
          <span>
            共 {summaries.length} 条开通组合 · 第 {safePage}/{totalPages} 页
          </span>
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            上一页
          </button>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          >
            下一页
          </button>
        </div>
      </div>
    </div>
  );
}
