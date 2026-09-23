import { Link } from "react-router-dom";
import { productName, productPath } from "@/lib/catalog";
import {
  MOCK_TENANT,
  MOCK_TENANT_SERVICES,
  verifyPoolUsedTotal,
  type TenantService,
} from "@/lib/tenant";

function greetingByHour(hour: number) {
  if (hour < 12) return "上午好";
  if (hour < 18) return "下午好";
  return "晚上好";
}

function statusLabel(status: TenantService["status"]) {
  if (status === "stopped") return "已停用";
  if (status === "expiring") return "即将到期";
  return "使用中";
}

export function DeskPage() {
  const hour = new Date().getHours();
  const greeting = greetingByHour(hour);
  /** 设计稿称呼；可后续接真实角色名 */
  const displayName = "管理员";
  const openedCount = MOCK_TENANT_SERVICES.length;
  const verifyPoolUsed = verifyPoolUsedTotal();

  return (
    <div className="a-stack c-desk">
      <section className="c-desk-hero">
        <div className="c-desk-hero__main">
          <h1 className="c-desk-hero__title">
            {greeting}，{displayName}
          </h1>
          <p className="c-desk-hero__lead">
            欢迎回到 {MOCK_TENANT.companyName} 的技术服务工作台。以下为当前已开通产品及其累计使用情况。
          </p>
        </div>
        <div className="c-desk-hero__stats" aria-label="开通概况">
          <div className="c-desk-stat">
            <span className="c-desk-stat__value c-desk-stat__value--primary">{openedCount}</span>
            <span className="c-desk-stat__label">已开通技术服务</span>
          </div>
        </div>
      </section>

      <section className="c-desk-section">
        <div className="c-desk-section__head">
          <h2 className="c-desk-section__title">已开通技术服务</h2>
          <span
            className="c-desk-section__hint"
            title="三类核验产品共用授权总量与服务周期，各自统计用量；作品智能辅助审核独立计费"
          >
            {/* <svg className="c-desk-section__hint-icon" width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
              <circle cx="8" cy="8" r="6.25" stroke="currentColor" strokeWidth="1.4" />
              <path d="M8 7.2v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              <circle cx="8" cy="5.1" r="0.85" fill="currentColor" />
            </svg> */}
            {/* 版权核验产品共享额度 · 智能审核独立额度 */}
          </span>
        </div>

        <div className="c-desk-services">
          {MOCK_TENANT_SERVICES.map((svc) => {
            const shared = svc.entitlement === "verify";
            const pct =
              svc.quotaTotal && svc.quotaTotal > 0
                ? Math.min(100, Math.round((svc.usedCount / svc.quotaTotal) * 100))
                : null;
            const status = svc.status;

            return (
              <article
                key={svc.product}
                className={`c-desk-svc${status === "stopped" ? " is-stopped" : ""}${
                  status === "expiring" ? " is-expiring" : ""
                }`}
              >
                <div className="c-desk-svc__top">
                  <h3 className="c-desk-svc__name">{productName(svc.product)}</h3>
                  <span className={`c-desk-svc__status c-desk-svc__status--${status}`}>
                    {statusLabel(status)}
                  </span>
                </div>

                <p className="c-desk-svc__period">
                  服务周期：{svc.openedAt} ~ {svc.expireAt}
                  {shared ? (
                    <span className="c-desk-svc__period-note">（版权核验共享）</span>
                  ) : null}
                </p>

                <div className="c-desk-svc__usage">
                  <div className="c-desk-svc__usage-row">
                    <span className="c-desk-svc__usage-label">
                      {shared ? "本技术服务用量" : "累计使用量"}
                    </span>
                    <span className="c-desk-svc__usage-value">
                      {svc.usedCount.toLocaleString("zh-CN")}
                      {svc.quotaTotal != null ? (
                        <span className="c-desk-svc__quota">
                          {" "}
                          / {svc.quotaTotal.toLocaleString("zh-CN")}
                          {shared ? " 版权核验共享额度" : ""}
                        </span>
                      ) : (
                        <span className="c-desk-svc__quota"> / 不限量</span>
                      )}
                    </span>
                  </div>
                  {pct != null ? (
                    <div className="c-desk-svc__bar" aria-hidden>
                      <div
                        className={`c-desk-svc__fill${status === "expiring" ? " is-warn" : ""}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  ) : null}
                  {shared && svc.quotaTotal != null ? (
                    <p className="c-desk-svc__pool-hint">
                      共享池合计已用 {verifyPoolUsed.toLocaleString("zh-CN")} /{" "}
                      {svc.quotaTotal.toLocaleString("zh-CN")}
                      {svc.consumePerWork != null
                        ? ` · 每作品消耗 ${svc.consumePerWork} 次`
                        : ""}
                    </p>
                  ) : null}
                </div>

                <div className="c-desk-svc__actions">
                  {status === "stopped" ? (
                    <span className="c-desk-svc__disabled">服务已停用，请联系商务续期</span>
                  ) : (
                    <Link to={productPath(svc.product)} className="c-desk-svc__link">
                      进入服务
                      <span aria-hidden> →</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
