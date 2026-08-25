import { useMemo, useState } from "react";
// import { Link } from "react-router-dom"; // 快速入口暂隐
import { TrendChart, chartColor } from "@/components/TrendChart";
import { SegmentedControl, TrendRangeToggle } from "@/components/StatsControls";
import { PRODUCTS } from "@/lib/catalog";
import { useCustomerStore } from "@/lib/customersStore";
import {
  getStatsData,
  refreshStatsData,
  sliceDates,
  sumCalls,
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
  { id: "customers", label: "客户管理", to: "/customers", perms: ["customers.list"] },
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
    label: "客户使用统计",
    to: "/stats/customers",
    perms: ["stats.customers"],
  },
  {
    id: "stats-p",
    label: "产品使用统计",
    to: "/stats/products",
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

  const productBoard = PRODUCTS.map((p) => {
    const accounts = data.customers.filter((c) =>
      c.productServices.some((s) => s.product === p.code),
    ).length;
    const calls = sumCalls(
      data.accountProductDays.filter((r) => r.product === p.code),
    );
    return { code: p.code, name: p.name, category: p.category, accounts, calls };
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
          <section className="a-card a-dash-panel a-dash-panel--overview">
            <div className="a-card__head a-dash-panel__head">
              <span className="a-dash-panel__title">总览</span>
              <span className="a-dash-panel__hint">全平台累计</span>
            </div>
            <div className="a-card__body a-dash-panel__body">
              <div className="a-dash-kpis">
                <article className="a-dash-kpi a-dash-kpi--accounts">
                  <div className="a-dash-kpi__glow" aria-hidden />
                  <div className="a-dash-kpi__meta">
                    <span className="a-dash-kpi__eyebrow">Accounts</span>
                    <span className="a-dash-kpi__label">总账号数</span>
                  </div>
                  <div className="a-dash-kpi__value">{totalAccounts}</div>
                  <div className="a-dash-kpi__foot">已开通客户账号</div>
                </article>
                <article className="a-dash-kpi a-dash-kpi--calls">
                  <div className="a-dash-kpi__glow" aria-hidden />
                  <div className="a-dash-kpi__meta">
                    <span className="a-dash-kpi__eyebrow">Invocations</span>
                    <span className="a-dash-kpi__label">总调用次数</span>
                  </div>
                  <div className="a-dash-kpi__value">
                    {totalCalls.toLocaleString()}
                  </div>
                  <div className="a-dash-kpi__foot">全产品历史累计</div>
                </article>
              </div>
            </div>
          </section>

          <section className="a-card a-dash-panel a-dash-panel--products">
            <div className="a-card__head a-dash-panel__head">
              <span className="a-dash-panel__title">分产品概况</span>
              <span className="a-dash-panel__hint">按产品拆分账号与调用</span>
            </div>
            <div className="a-card__body a-dash-panel__body">
              <div className="a-dash-products">
                {productBoard.map((p, i) => (
                  <article
                    key={p.code}
                    className={`a-dash-product a-dash-product--${p.category}`}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <header className="a-dash-product__head">
                      <span className="a-dash-product__index" aria-hidden>
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <div className="a-dash-product__titles">
                        <span className="a-dash-product__tag">
                          {p.category === "verify" ? "版权核验" : "智能审核"}
                        </span>
                        <h3 className="a-dash-product__name">{p.name}</h3>
                      </div>
                    </header>
                    <div className="a-dash-product__metrics">
                      <div className="a-dash-product__metric">
                        <span className="a-dash-product__metric-label">总账号数</span>
                        <span className="a-dash-product__metric-value">{p.accounts}</span>
                      </div>
                      <div className="a-dash-product__metric a-dash-product__metric--accent">
                        <span className="a-dash-product__metric-label">总调用次数</span>
                        <span className="a-dash-product__metric-value">
                          {p.calls.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
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
