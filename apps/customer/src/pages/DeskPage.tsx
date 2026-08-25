import { Link } from "react-router-dom";
import { productName, productPath } from "@/lib/catalog";
import { MOCK_TENANT, MOCK_TENANT_SERVICES } from "@/lib/tenant";

function greetingByHour(hour: number) {
  if (hour < 12) return "上午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function serviceStatusTag(status: (typeof MOCK_TENANT_SERVICES)[number]["status"]) {
  if (status === "stopped") return <span className="a-tag a-tag--muted">已停用</span>;
  if (status === "expiring") return <span className="a-tag a-tag--wn">即将到期</span>;
  return <span className="a-tag a-tag--ok">使用中</span>;
}

export function DeskPage() {
  const hour = new Date().getHours();
  const greeting = greetingByHour(hour);
  const displayName = MOCK_TENANT.contactName || MOCK_TENANT.companyName;
  const activeServices = MOCK_TENANT_SERVICES.filter((s) => s.status !== "stopped");
  const stoppedCount = MOCK_TENANT_SERVICES.length - activeServices.length;

  return (
    <div className="a-stack c-desk">
      <section className="c-desk-hero">
        <div className="c-desk-hero__eyebrow">Work Desk</div>
        <h1 className="c-desk-hero__title">
          {greeting}，{displayName}
        </h1>
        <p className="c-desk-hero__lead">
          欢迎回到 {MOCK_TENANT.companyName} 的服务工作台。以下为当前已开通产品及其累计使用情况。
        </p>
        <div className="c-desk-hero__stats">
          <div className="c-desk-stat">
            <span className="c-desk-stat__value">{MOCK_TENANT_SERVICES.length}</span>
            <span className="c-desk-stat__label">已开通服务</span>
          </div>
          <div className="c-desk-stat">
            <span className="c-desk-stat__value">{activeServices.length}</span>
            <span className="c-desk-stat__label">可正常使用</span>
          </div>
          {stoppedCount > 0 ? (
            <div className="c-desk-stat">
              <span className="c-desk-stat__value">{stoppedCount}</span>
              <span className="c-desk-stat__label">已停用</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="a-card">
        <div className="a-card__head">
          已开通产品服务
          <div className="a-card__extra">累计使用量截至当前</div>
        </div>
        <div className="a-card__body a-card__body--flush">
          <div className="c-desk-services">
            {MOCK_TENANT_SERVICES.map((svc) => {
              const pct =
                svc.quotaTotal && svc.quotaTotal > 0
                  ? Math.min(100, Math.round((svc.usedCount / svc.quotaTotal) * 100))
                  : null;
              return (
                <article
                  key={svc.product}
                  className={`c-desk-svc${svc.status === "stopped" ? " is-stopped" : ""}`}
                >
                  <div className="c-desk-svc__top">
                    <div>
                      <h3 className="c-desk-svc__name">{productName(svc.product)}</h3>
                      <p className="c-desk-svc__period">
                        服务周期：{svc.openedAt} ~ {svc.expireAt}
                      </p>
                    </div>
                    {serviceStatusTag(svc.status)}
                  </div>

                  <div className="c-desk-svc__usage">
                    <div className="c-desk-svc__usage-row">
                      <span className="c-desk-svc__usage-label">累计使用量</span>
                      <span className="c-desk-svc__usage-value">
                        {svc.usedCount.toLocaleString("zh-CN")}
                        {svc.quotaTotal != null ? (
                          <span className="c-desk-svc__quota">
                            {" "}
                            / {svc.quotaTotal.toLocaleString("zh-CN")}
                          </span>
                        ) : (
                          <span className="c-desk-svc__quota"> · 不限量</span>
                        )}
                      </span>
                    </div>
                    {pct != null ? (
                      <div className="c-desk-svc__bar" aria-hidden>
                        <div
                          className={`c-desk-svc__fill${svc.status === "expiring" ? " is-warn" : ""}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="c-desk-svc__actions">
                    {svc.status === "stopped" ? (
                      <span className="a-field__hint">服务已停用，请联系商务续期</span>
                    ) : (
                      <Link to={productPath(svc.product)} className="a-btn a-btn--sm a-btn--primary">
                        进入服务
                      </Link>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
