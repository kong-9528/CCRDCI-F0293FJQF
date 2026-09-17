import { useMemo, useState } from "react";
import { Navigate, useParams } from "react-router-dom";
import { TrendChart, chartColor } from "@/components/TrendChart";
import {
  TrendRangeToggle,
  SegmentedControl,
} from "@/components/StatsControls";
import { StatsCardGlyph } from "@/components/StatsCardGlyph";
import { normalizeProductCode } from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import {
  exportAccountProductDailyCsv,
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
  statsProductCodesForScope,
  type StatsScope,
} from "@/lib/statsScope";

type TrendMetric = "calls" | "activeAccounts";

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  calls: "日调用次数",
  activeAccounts: "日调用账号数",
};

const TREND_METRIC_OPTIONS: TrendMetric[] = ["activeAccounts", "calls"];

export function CustomerStatsPage() {
  const { scope: scopeParam } = useParams();
  if (!isStatsScope(scopeParam)) {
    return <Navigate to="/stats/verify/customers" replace />;
  }
  return <CustomerStatsBody scope={scopeParam} />;
}

function CustomerStatsBody({ scope }: { scope: StatsScope }) {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const [trendRange, setTrendRange] = useState<TrendRange>("30d");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("calls");
  const [rankRange, setRankRange] = useState<TrendRange>("30d");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const scopeCodes = useMemo(() => new Set(statsProductCodesForScope(scope)), [scope]);
  const scopedDays = useMemo(
    () => data.accountProductDays.filter((r) => scopeCodes.has(r.product)),
    [data.accountProductDays, scopeCodes],
  );

  const entitlementCode = scope === "audit" ? "workReview" : null;
  const totalAccounts = data.customers.filter((c) =>
    c.productServices.some((s) => {
      const code = normalizeProductCode(s.product);
      if (entitlementCode) return code === entitlementCode;
      return scopeCodes.has(code);
    }),
  ).length;

  const totalCallsAll = sumCalls(scopedDays);
  const pageSubmitCalls = sumPageSubmitCalls(scopedDays);
  const apiCalls = sumApiCalls(scopedDays);

  const trendDates = sliceDates(trendRange);
  const trendValues = trendDates.map((date) => {
    const dayRows = scopedDays.filter((r) => r.date === date);
    if (trendMetric === "calls") return sumCalls(dayRows);
    return new Set(dayRows.filter((r) => r.calls > 0).map((r) => r.customerId)).size;
  });

  const rankDates = sliceDates(rankRange);
  const rankRows = useMemo(() => {
    const map = new Map<
      string,
      { account: string; companyName: string; contactName: string; calls: number }
    >();
    for (const r of scopedDays) {
      if (!rankDates.includes(r.date)) continue;
      const cur = map.get(r.customerId) ?? {
        account: r.account,
        companyName: r.companyName,
        contactName: r.contactName,
        calls: 0,
      };
      cur.calls += r.calls;
      map.set(r.customerId, cur);
    }
    return [...map.values()].sort((a, b) => b.calls - a.calls);
  }, [scopedDays, rankDates]);

  const totalPages = Math.max(1, Math.ceil(rankRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = rankRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  const overviewMetrics =
    scope === "verify"
      ? [
          { label: "总账号数", value: totalAccounts },
          { label: "总调用次数", value: totalCallsAll.toLocaleString() },
          { label: "页面提交次数", value: pageSubmitCalls.toLocaleString() },
          { label: "API调用次数", value: apiCalls.toLocaleString() },
        ]
      : [
          { label: "总账号数", value: totalAccounts },
          { label: "总调用次数", value: totalCallsAll.toLocaleString() },
        ];

  return (
    <div className="a-stack">
      <section className="a-stats-overview">
        <article className="a-stats-strip a-stats-strip--tone-0">
          <header className="a-stats-strip__head">
            <h3 className="a-stats-strip__title">机构使用数据统计</h3>
          </header>
          <div
            className={`a-stats-strip__metrics a-stats-strip__metrics--${overviewMetrics.length}`}
          >
            {overviewMetrics.map((item) => (
              <div key={item.label} className="a-stats-strip__cell">
                <span className="a-stats-strip__value">{item.value}</span>
                <span className="a-stats-strip__label">{item.label}</span>
              </div>
            ))}
          </div>
          <StatsCardGlyph kind="users" />
        </article>
      </section>

      <div className="a-card">
        <div className="a-card__head">
          调用趋势
          <div className="a-card__extra a-inline-actions">
            <SegmentedControl
              value={trendMetric}
              onChange={setTrendMetric}
              options={TREND_METRIC_OPTIONS.map((k) => ({
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
            series={[
              {
                id: "metric",
                label: TREND_METRIC_LABEL[trendMetric],
                color: chartColor(0),
                values: trendValues,
              },
            ]}
          />
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          账号调用榜单
          <div className="a-card__extra a-inline-actions">
            <TrendRangeToggle
              value={rankRange}
              onChange={(v) => {
                setRankRange(v);
                setPage(1);
              }}
            />
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--primary"
              onClick={() => exportAccountProductDailyCsv([...scopeCodes])}
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
                <th>账号</th>
                <th>公司名称</th>
                <th>联系人</th>
                <th>调用次数</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map((row, i) => (
                <tr key={row.account}>
                  <td className="num">{(safePage - 1) * pageSize + i + 1}</td>
                  <td>
                    <code>{row.account}</code>
                  </td>
                  <td>{row.companyName}</td>
                  <td>{row.contactName}</td>
                  <td className="num">{row.calls.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="a-pagination">
          <span>
            共 {rankRows.length} 条 · 第 {safePage}/{totalPages} 页 · 每页 10 条
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
