import { productName } from "@/lib/catalog";
import { DASHBOARD_PRODUCTS, type DashboardProduct } from "@/lib/dashboard";

function QuotaCard({ item }: { item: DashboardProduct }) {
  const stopped = item.status === "stopped";
  const expiring = item.status === "expiring";
  const label = item.code === "dci" ? "DCI核验服务" : productName(item.code);

  return (
    <div className={`c-quota-card${stopped ? " is-stopped" : ""}`}>
      <div className="c-quota-card__head">
        <span className="c-quota-card__label">
          {label}
          {expiring ? <span className="a-tag a-tag--wn">即将到期</span> : null}
          {stopped ? <span className="a-tag a-tag--muted">已停用</span> : null}
        </span>
        <div className="c-quota-card__value">{item.usedCount.toLocaleString()}</div>
      </div>
      <div className="c-quota-card__bar-wrap">
        <div className="c-quota-card__bar">
          <div
            className="c-quota-card__bar-fill"
            style={{
              width: `${item.quotaUsagePct}%`,
              background: expiring ? "var(--wn-500)" : "var(--p-600)",
            }}
          />
        </div>
        <span className="c-quota-card__pct">已用 {item.quotaUsagePct.toFixed(1)}%</span>
      </div>
      <div className="c-quota-card__foot">
        <span>
          总额度{" "}
          <b>{item.quotaTotal == null ? "不限" : item.quotaTotal.toLocaleString()}</b>
        </span>
        {stopped ? (
          <span className="c-quota-card__muted">服务已停用，无本月数据</span>
        ) : (
          <span>
            本月使用 <b>{item.monthCalls.toLocaleString()}</b>{" "}
            {item.momPercent != null ? (
              <span className={`a-stat__trend ${item.momPercent >= 0 ? "up" : "down"}`}>
                {item.momPercent >= 0 ? "↑" : "↓"} {Math.abs(item.momPercent)}%
              </span>
            ) : null}
          </span>
        )}
      </div>
    </div>
  );
}

export function DashboardQuotaGrid() {
  return (
    <div className="c-quota-grid">
      {DASHBOARD_PRODUCTS.map((item) => (
        <QuotaCard key={item.code} item={item} />
      ))}
    </div>
  );
}
