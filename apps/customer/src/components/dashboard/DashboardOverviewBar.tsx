import { dashboardOverview, DASHBOARD_PRODUCTS } from "@/lib/dashboard";

export function DashboardOverviewBar() {
  const { normalCount, stoppedCount, expiringSoonCount, monthTotal } =
    dashboardOverview(DASHBOARD_PRODUCTS);

  return (
    <div className="c-kpi-row">
      <div className="c-kpi c-kpi--blue">
        <div className="c-kpi__value">{normalCount}</div>
        <div className="c-kpi__label">
          正常服务
          {expiringSoonCount > 0 ? `（${expiringSoonCount} 个即将到期）` : ""}
        </div>
        <span className="c-kpi__glyph" aria-hidden>
          ↑
        </span>
      </div>
      <div className="c-kpi c-kpi--purple">
        <div className="c-kpi__value">{stoppedCount}</div>
        <div className="c-kpi__label">已停用服务</div>
        <span className="c-kpi__glyph" aria-hidden>
          ▮
        </span>
      </div>
      <div className="c-kpi c-kpi--indigo">
        <div className="c-kpi__value">{monthTotal.toLocaleString()}</div>
        <div className="c-kpi__label">本月总调用量（次）</div>
        <span className="c-kpi__glyph" aria-hidden>
          人
        </span>
      </div>
    </div>
  );
}
