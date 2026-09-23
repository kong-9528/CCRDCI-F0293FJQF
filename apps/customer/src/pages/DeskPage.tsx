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

function quotaPct(used: number, total: number | null | undefined) {
  if (total == null || total <= 0) return null;
  return Math.min(100, Math.round((used / total) * 100));
}

function formatNum(n: number) {
  return n.toLocaleString("zh-CN");
}

function groupStatus(services: TenantService[]): TenantService["status"] {
  if (services.every((s) => s.status === "stopped")) return "stopped";
  if (services.some((s) => s.status === "expiring")) return "expiring";
  if (services.some((s) => s.status === "active")) return "active";
  return services[0]?.status ?? "active";
}

export function DeskPage() {
  const hour = new Date().getHours();
  const greeting = greetingByHour(hour);
  const displayName = "管理员";

  const verifyServices = MOCK_TENANT_SERVICES.filter((s) => s.entitlement === "verify");
  const auditService = MOCK_TENANT_SERVICES.find((s) => s.entitlement === "audit") ?? null;
  const openedGroups =
    (verifyServices.length > 0 ? 1 : 0) + (auditService ? 1 : 0);

  const verifyQuota = verifyServices[0]?.quotaTotal ?? null;
  const verifyPeriod = verifyServices[0]
    ? { start: verifyServices[0].openedAt, end: verifyServices[0].expireAt }
    : null;
  const verifyUsed = verifyPoolUsedTotal(verifyServices);
  const verifyPct = quotaPct(verifyUsed, verifyQuota);
  const verifyStatus = groupStatus(verifyServices);

  const auditPct = auditService
    ? quotaPct(auditService.usedCount, auditService.quotaTotal)
    : null;

  return (
    <div className="a-stack c-desk">
      <section className="c-desk-hero">
        <div className="c-desk-hero__main">
          <h1 className="c-desk-hero__title">
            {greeting}，{displayName}
          </h1>
          <p className="c-desk-hero__lead">
            欢迎回到 {MOCK_TENANT.companyName} 的技术服务工作台。以下为当前已开通技术服务及其使用情况。
          </p>
        </div>
        <div className="c-desk-hero__stats" aria-label="开通概况">
          <div className="c-desk-stat">
            <span className="c-desk-stat__value c-desk-stat__value--primary">{openedGroups}</span>
            <span className="c-desk-stat__label">已开通技术服务</span>
          </div>
        </div>
      </section>

      <section className="c-desk-section">
        <div className="c-desk-section__head">
          <h2 className="c-desk-section__title">已开通技术服务</h2>
        </div>

        <div className="c-desk-groups">
          {verifyServices.length > 0 && verifyPeriod ? (
            <article
              className={`c-desk-group${verifyStatus === "stopped" ? " is-stopped" : ""}${
                verifyStatus === "expiring" ? " is-expiring" : ""
              }`}
            >
              <header className="c-desk-group__head">
                <div className="c-desk-group__title-row">
                  <h3 className="c-desk-group__title">版权核验</h3>
                  <span className={`c-desk-svc__status c-desk-svc__status--${verifyStatus}`}>
                    {statusLabel(verifyStatus)}
                  </span>
                </div>
                <p className="c-desk-group__period">
                  服务周期：{verifyPeriod.start} ~ {verifyPeriod.end}
                </p>
                <div className="c-desk-group__quota">
                  <div className="c-desk-svc__usage-row">
                    <span className="c-desk-svc__usage-label">共享授权额度</span>
                    <span className="c-desk-svc__usage-value">
                      {formatNum(verifyUsed)}
                      {verifyQuota != null ? (
                        <span className="c-desk-svc__quota"> / {formatNum(verifyQuota)}</span>
                      ) : (
                        <span className="c-desk-svc__quota"> / 不限量</span>
                      )}
                    </span>
                  </div>
                  {verifyPct != null ? (
                    <div className="c-desk-svc__bar" aria-hidden>
                      <div
                        className={`c-desk-svc__fill${
                          verifyStatus === "expiring" ? " is-warn" : ""
                        }`}
                        style={{ width: `${verifyPct}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </header>

              <div className="c-desk-group__body">
                <div className="c-desk-group__sub-label">子产品用量</div>
                <ul
                  className="c-desk-sublist"
                  style={{ ["--desk-sub-cols" as string]: String(verifyServices.length) }}
                >
                  {verifyServices.map((svc) => (
                    <li key={svc.product} className="c-desk-sub">
                      <div className="c-desk-sub__main">
                        <div className="c-desk-sub__name-row">
                          <span className="c-desk-sub__name">{productName(svc.product)}</span>
                          <span className={`c-desk-svc__status c-desk-svc__status--${svc.status}`}>
                            {statusLabel(svc.status)}
                          </span>
                        </div>
                        <div className="c-desk-sub__usage">
                          本产品用量 {formatNum(svc.usedCount)}
                          {svc.consumePerWork != null
                            ? ` · 每作品消耗 ${svc.consumePerWork} 次`
                            : ""}
                        </div>
                      </div>
                      <div className="c-desk-sub__action">
                        {svc.status === "stopped" ? (
                          <span className="c-desk-svc__disabled">已停用</span>
                        ) : (
                          <Link to={productPath(svc.product)} className="c-desk-svc__link">
                            进入服务 →
                          </Link>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ) : null}

          {auditService ? (
            <article
              className={`c-desk-group${auditService.status === "stopped" ? " is-stopped" : ""}${
                auditService.status === "expiring" ? " is-expiring" : ""
              }`}
            >
              <header className="c-desk-group__head">
                <div className="c-desk-group__title-row">
                  <h3 className="c-desk-group__title">作品智能辅助审核</h3>
                  <span
                    className={`c-desk-svc__status c-desk-svc__status--${auditService.status}`}
                  >
                    {statusLabel(auditService.status)}
                  </span>
                </div>
                <p className="c-desk-group__period">
                  服务周期：{auditService.openedAt} ~ {auditService.expireAt}
                </p>
                <div className="c-desk-group__quota">
                  <div className="c-desk-svc__usage-row">
                    <span className="c-desk-svc__usage-label">授权额度</span>
                    <span className="c-desk-svc__usage-value">
                      {formatNum(auditService.usedCount)}
                      {auditService.quotaTotal != null ? (
                        <span className="c-desk-svc__quota">
                          {" "}
                          / {formatNum(auditService.quotaTotal)}
                        </span>
                      ) : (
                        <span className="c-desk-svc__quota"> / 不限量</span>
                      )}
                    </span>
                  </div>
                  {auditPct != null ? (
                    <div className="c-desk-svc__bar" aria-hidden>
                      <div
                        className={`c-desk-svc__fill${
                          auditService.status === "expiring" ? " is-warn" : ""
                        }${auditPct > 100 ? " is-over" : ""}`}
                        style={{ width: `${Math.min(100, auditPct)}%` }}
                      />
                    </div>
                  ) : null}
                </div>
              </header>

              <div className="c-desk-group__body c-desk-group__body--solo">
                <p className="c-desk-group__solo-hint">独立产品，无子产品拆分</p>
                <div className="c-desk-group__solo-action">
                  {auditService.status === "stopped" ? (
                    <span className="c-desk-svc__disabled">服务已停用，请联系商务续期</span>
                  ) : (
                    <Link to={productPath(auditService.product)} className="c-desk-svc__link">
                      进入服务 →
                    </Link>
                  )}
                </div>
              </div>
            </article>
          ) : null}
        </div>
      </section>
    </div>
  );
}
