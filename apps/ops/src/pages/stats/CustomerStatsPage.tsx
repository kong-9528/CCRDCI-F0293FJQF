import { useMemo, useState } from "react";
import { TrendChart, chartColor } from "@/components/TrendChart";
import {
  StatsPeriodToggle,
  TrendRangeToggle,
  SegmentedControl,
} from "@/components/StatsControls";
import { useCustomerStore } from "@/lib/customersStore";
import {
  avgSuccessRate,
  exportAccountDailyCsv,
  exportAccountProductDailyCsv,
  getStatsData,
  refreshStatsData,
  sliceDates,
  sumCalls,
  type StatsPeriod,
  type TrendRange,
} from "@/lib/statsData";

type TrendMetric = "calls" | "activeAccounts" | "successRate";

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  calls: "日账号调用次数",
  activeAccounts: "日活跃账号数",
  successRate: "日成功率",
};

export function CustomerStatsPage() {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const [boardPeriod, setBoardPeriod] = useState<StatsPeriod>("7d");
  const [trendRange, setTrendRange] = useState<TrendRange>("30d");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("calls");
  const [rankRange, setRankRange] = useState<TrendRange>("30d");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const boardDates = sliceDates(boardPeriod);
  const boardRows = data.accountDays.filter((r) => boardDates.includes(r.date));
  const totalAccounts = data.customers.length;
  const activeAccounts = new Set(
    boardRows.filter((r) => r.calls > 0).map((r) => r.customerId),
  ).size;
  const totalCallsAll = sumCalls(data.accountDays);
  const periodCalls = sumCalls(boardRows);
  const overallRate = avgSuccessRate(data.accountDays);
  const periodRate = avgSuccessRate(boardRows);

  const trendDates = sliceDates(trendRange);
  const trendValues = trendDates.map((date) => {
    const dayRows = data.accountDays.filter((r) => r.date === date);
    if (trendMetric === "calls") return sumCalls(dayRows);
    if (trendMetric === "activeAccounts") {
      return new Set(dayRows.filter((r) => r.calls > 0).map((r) => r.customerId)).size;
    }
    return avgSuccessRate(dayRows);
  });

  const rankDates = sliceDates(rankRange);
  const rankRows = useMemo(() => {
    const map = new Map<
      string,
      { account: string; companyName: string; contactName: string; calls: number; rateRows: { calls: number; successRate: number }[] }
    >();
    for (const r of data.accountDays) {
      if (!rankDates.includes(r.date)) continue;
      const cur = map.get(r.customerId) ?? {
        account: r.account,
        companyName: r.companyName,
        contactName: r.contactName,
        calls: 0,
        rateRows: [],
      };
      cur.calls += r.calls;
      cur.rateRows.push(r);
      map.set(r.customerId, cur);
    }
    return [...map.values()]
      .map((x) => ({
        ...x,
        successRate: avgSuccessRate(x.rateRows),
      }))
      .sort((a, b) => b.calls - a.calls);
  }, [data.accountDays, rankDates]);

  const totalPages = Math.max(1, Math.ceil(rankRows.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageRows = rankRows.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          表盘概览
          <div className="a-card__extra">
            <StatsPeriodToggle
              value={boardPeriod}
              onChange={(v) => setBoardPeriod(v)}
            />
          </div>
        </div>
        <div className="a-card__body">
          <div className="a-metric-groups">
            <div className="a-metric-group">
              <div className="a-metric-group__title">账号规模</div>
              <div className="a-metric-pair">
                <div className="a-metric-pair__item">
                  <div className="a-stat__label">总账号数</div>
                  <div className="a-stat__num">{totalAccounts}</div>
                </div>
                <div className="a-metric-pair__item is-period">
                  <div className="a-stat__label">
                    {boardPeriod === "1d" ? "昨日" : boardPeriod === "7d" ? "近7日" : "近30日"}
                    活跃账号数
                  </div>
                  <div className="a-stat__num">{activeAccounts}</div>
                </div>
              </div>
            </div>

            <div className="a-metric-group">
              <div className="a-metric-group__title">调用量</div>
              <div className="a-metric-pair">
                <div className="a-metric-pair__item">
                  <div className="a-stat__label">总调用次数</div>
                  <div className="a-stat__num">{totalCallsAll.toLocaleString()}</div>
                </div>
                <div className="a-metric-pair__item is-period">
                  <div className="a-stat__label">
                    {boardPeriod === "1d" ? "昨日" : boardPeriod === "7d" ? "近7日" : "近30日"}
                    调用次数
                  </div>
                  <div className="a-stat__num">{periodCalls.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div className="a-metric-group">
              <div className="a-metric-group__title">成功率</div>
              <div className="a-metric-pair">
                <div className="a-metric-pair__item">
                  <div className="a-stat__label">整体成功率</div>
                  <div className="a-stat__num">{overallRate.toFixed(1)}%</div>
                </div>
                <div className="a-metric-pair__item is-period">
                  <div className="a-stat__label">
                    {boardPeriod === "1d" ? "昨日" : boardPeriod === "7d" ? "近7日" : "近30日"}
                    成功率
                  </div>
                  <div className="a-stat__num">{periodRate.toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          调用趋势
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
            <button type="button" className="a-btn a-btn--sm" onClick={exportAccountDailyCsv}>
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
                <th>账号</th>
                <th>公司名称</th>
                <th>联系人</th>
                <th>调用次数</th>
                <th>成功率</th>
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
                  <td className="num">{row.successRate.toFixed(1)}%</td>
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
