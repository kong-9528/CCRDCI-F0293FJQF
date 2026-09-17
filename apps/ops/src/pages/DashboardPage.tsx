import { useMemo, useState } from "react";
// import { Link } from "react-router-dom"; // 快速入口暂隐
import { TrendChart, chartColor } from "@/components/TrendChart";
import { SegmentedControl, TrendRangeToggle } from "@/components/StatsControls";
import { StatsCardGlyph } from "@/components/StatsCardGlyph";
import { PRODUCTS } from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import {
  getStatsData,
  refreshStatsData,
  sliceDates,
  sumApiCalls,
  sumCalls,
  sumPageSubmitCalls,
  type TrendRange,
} from "@/lib/statsData";
import { getCurrentUserPermissions } from "@/lib/usersStore";

type TrendMetric = "activeAccounts" | "calls";

const TREND_METRIC_LABEL: Record<TrendMetric, string> = {
  activeAccounts: "日调用账号数",
  calls: "日调用次数",
};

/* 快速入口配置：暂隐，择机再启用
type QuickEntry = {
  id: string;
  label: string;
  to: string;
  perms: string[];
};

const QUICK_ENTRIES: QuickEntry[] = [
      { id: "customers", label: "机构服务管理", to: "/customers", perms: ["customers.list"] },
  {
    id: "services",
    label: "服务产品管理",
    to: "/customer-services",
    perms: ["customers.services"],
  },
  {
    id: "verify-cfg",
    label: "版权核验服务配置",
    to: "/products",
    perms: ["products.list", "products.settings"],
  },
  {
    id: "audit-cfg",
    label: "智能审核服务配置",
    to: "/products",
    perms: ["products.list", "products.settings"],
  },
  {
    id: "api",
    label: "接口服务配置",
    to: "/system/api-services",
    perms: ["system.apiVerify", "system.apiAudit"],
  },
  {
    id: "stats-c",
    label: "按机构",
    to: "/stats/verify/customers",
    perms: ["stats.customers"],
  },
  {
    id: "stats-p",
    label: "按技术服务",
    to: "/stats/verify/products",
    perms: ["stats.products"],
  },
];
*/

function hasPerm(userPerms: string[], required: string[]) {
  const set = new Set(userPerms);
  return required.some((p) => set.has(p));
}

export function DashboardPage() {
  useCustomerStore();
  const data = useMemo(() => {
    refreshStatsData();
    return getStatsData();
  }, []);

  const userPerms = getCurrentUserPermissions();
  const showBoard = hasPerm(userPerms, [
    "customers.list",
    "stats.customers",
    "stats.products",
    "products.list",
  ]);
  const showTrend = hasPerm(userPerms, ["stats.customers", "stats.products"]);
  // const quickEntries = QUICK_ENTRIES.filter((e) => hasPerm(userPerms, e.perms));

  const totalAccounts = data.customers.length;
  const totalCalls = sumCalls(data.accountDays);
  const pageSubmitCalls = sumPageSubmitCalls(data.accountDays);
  const apiCalls = sumApiCalls(data.accountDays);

  const overviewMetrics = [
    { label: "总账号数", value: totalAccounts },
    { label: "总调用次数", value: totalCalls.toLocaleString() },
    { label: "页面提交次数", value: pageSubmitCalls.toLocaleString() },
    { label: "API调用次数", value: apiCalls.toLocaleString() },
  ];

  const productBoard = PRODUCTS.map((p) => {
    const all = data.productDays.filter((r) => r.product === p.code);
    const accounts = data.customers.filter((c) =>
      c.productServices.some((s) => s.product === p.code),
    ).length;
    return {
      code: p.code,
      name: p.name,
      category: p.category,
      accounts,
      totalCalls: sumCalls(all),
      pageSubmitCalls: sumPageSubmitCalls(all),
      apiCalls: sumApiCalls(all),
    };
  });

  const [trendRange, setTrendRange] = useState<TrendRange>("7d");
  const [trendMetric, setTrendMetric] = useState<TrendMetric>("calls");

  const trendDates = sliceDates(trendRange);

  const series = useMemo(() => {
    const out: { id: string; label: string; color: string; values: number[] }[] = [];
    let colorIdx = 0;

    out.push({
      id: "total",
      label: "总量",
      color: chartColor(colorIdx++),
      values: trendDates.map((date) => {
        const dayRows = data.accountDays.filter((r) => r.date === date);
        if (trendMetric === "calls") return sumCalls(dayRows);
        return new Set(dayRows.filter((r) => r.calls > 0).map((r) => r.customerId)).size;
      }),
    });

    for (const p of PRODUCTS) {
      out.push({
        id: p.code,
        label: p.name,
        color: chartColor(colorIdx++),
        values: trendDates.map((date) => {
          const day = data.productDays.find(
            (r) => r.date === date && r.product === p.code,
          );
          if (!day) return 0;
          return trendMetric === "calls" ? day.calls : day.activeAccounts;
        }),
      });
    }
    return out;
  }, [data, trendDates, trendMetric]);

  return (
    <div className="a-stack">
      {showBoard ? (
        <>
          <section className="a-stats-overview">
            <article className="a-stats-strip a-stats-strip--tone-0">
              <header className="a-stats-strip__head">
                <h3 className="a-stats-strip__title">平台数据概览</h3>
              </header>
              <div className="a-stats-strip__metrics a-stats-strip__metrics--4">
                {overviewMetrics.map((item) => (
                  <div key={item.label} className="a-stats-strip__cell">
                    <span className="a-stats-strip__value">{item.value}</span>
                    <span className="a-stats-strip__label">{item.label}</span>
                  </div>
                ))}
              </div>
              <StatsCardGlyph kind="trend" />
            </article>
          </section>

          <section className="a-stats-overview">
            <div className="a-product-board a-product-board--compact">
              {productBoard.map((p, i) => {
                const showChannelMetrics = p.category === "verify";
                const metrics = showChannelMetrics
                  ? [
                      { label: "总账号数", value: String(p.accounts) },
                      { label: "总调用次数", value: p.totalCalls.toLocaleString() },
                      { label: "页面提交次数", value: p.pageSubmitCalls.toLocaleString() },
                      { label: "API调用次数", value: p.apiCalls.toLocaleString() },
                    ]
                  : [
                      { label: "总账号数", value: String(p.accounts) },
                      { label: "总调用次数", value: p.totalCalls.toLocaleString() },
                    ];
                const glyphKind = i % 3 === 0 ? "users" : i % 3 === 1 ? "chart" : "api";

                return (
                  <article
                    key={p.code}
                    className={`a-product-board__card a-product-board__card--tone-${i % 3}`}
                    style={{ animationDelay: `${i * 45}ms` }}
                  >
                    <header className="a-product-board__head">
                      <h3 className="a-product-board__name">{p.name}</h3>
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
                    <StatsCardGlyph kind={glyphKind} className="a-product-board__glyph" />
                  </article>
                );
              })}
            </div>
          </section>
        </>
      ) : null}

      {showTrend ? (
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
              height={300}
              series={series}
            />
          </div>
        </div>
      ) : null}

      {/* 快速入口：暂隐，择机再启用
      {quickEntries.length > 0 ? (
        <div className="a-card">
          <div className="a-card__head">快速入口</div>
          <div className="a-card__body">
            <div className="a-dash-links">
              {quickEntries.map((e) => (
                <Link key={e.id} to={e.to} className="a-dash-link">
                  {e.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      ) : null}
      */}

      {!showBoard && !showTrend ? (
        <div className="a-card">
          <div className="a-placeholder">当前账号暂无可展示的首页模块，请联系管理员开通权限。</div>
        </div>
      ) : null}
    </div>
  );
}
