import {
  dashboardOverview,
  DASHBOARD_PRODUCTS,
} from "@/lib/dashboard";

export function DashboardOverviewBar() {
  const { normalCount, stoppedCount, expiringSoonCount, monthTotal } =
    dashboardOverview(DASHBOARD_PRODUCTS);

  return (
    <div className="c-dash-overview">
      <div className="c-dash-pill c-dash-pill--ok">
        <span className="c-dash-pill__dot c-dash-pill__dot--ok" />
        正常服务 <b>{normalCount}</b> 个
        {expiringSoonCount > 0 ? (
          <span className="c-dash-pill__badge">{expiringSoonCount} 个即将到期</span>
        ) : null}
      </div>
      <div className="c-dash-pill">
        <span className="c-dash-pill__dot c-dash-pill__dot--muted" />
        已停用 <b>{stoppedCount}</b> 个
      </div>
      <div className="c-dash-pill c-dash-pill--primary">
        本月总调用量 <b>{monthTotal.toLocaleString()}</b> 次
      </div>
    </div>
  );
}
