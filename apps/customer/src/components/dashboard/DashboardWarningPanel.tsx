import { productName } from "@/lib/catalog";
import {
  countWarnings,
  DASHBOARD_PRODUCTS,
  productWarnings,
  type ProductWarning,
} from "@/lib/dashboard";

function WarningBody({ warning }: { warning: ProductWarning }) {
  if (warning.kind === "ok") {
    return (
      <div className="c-warn-card__ok">
        <span className="c-warn-card__dot c-warn-card__dot--ok" />
        运行正常
      </div>
    );
  }
  if (warning.kind === "stopped") {
    return (
      <div className="c-warn-card__muted">
        <span className="c-warn-card__dot c-warn-card__dot--muted" />
        服务已停用
      </div>
    );
  }
  return (
    <div className="c-warn-card__alerts">
      <div className={`c-warn-alert${warning.daysLeft <= 7 ? " c-warn-alert--er" : ""}`}>
        将于 <b>{warning.daysLeft} 天后</b> 到期
      </div>
      {"quotaPct" in warning && warning.quotaPct != null ? (
        <div className="c-warn-alert c-warn-alert--wn">
          配额使用率 <b>{warning.quotaPct}%</b>
        </div>
      ) : null}
    </div>
  );
}

function cardTone(warning: ProductWarning): string {
  if (warning.kind === "stopped") return " is-muted";
  if (warning.kind === "expiring" && warning.daysLeft <= 7) return " is-danger";
  if (warning.kind === "expiring") return " is-warn";
  return " is-ok";
}

export function DashboardWarningPanel() {
  const total = countWarnings(DASHBOARD_PRODUCTS);

  return (
    <div className="a-card">
      <div className="c-warn-panel__head">
        <div>
          <div className="c-warn-panel__title">预警提醒</div>
          <div className="a-field__hint">产品服务状态实时监控</div>
        </div>
        <span className="c-warn-panel__count">共 {total} 条预警</span>
      </div>
      <div className="a-card__body">
        <div className="c-warn-grid">
          {DASHBOARD_PRODUCTS.map((p) => {
            const warning = productWarnings(p);
            return (
              <div key={p.code} className={`c-warn-card${cardTone(warning)}`}>
                <div className="c-warn-card__top">
                  <span className="c-warn-card__name">{productName(p.code)}</span>
                  <span
                    className={`c-warn-card__dot${
                      warning.kind === "ok"
                        ? " c-warn-card__dot--ok"
                        : warning.kind === "stopped"
                          ? " c-warn-card__dot--muted"
                          : warning.kind === "expiring" && warning.daysLeft <= 7
                            ? " c-warn-card__dot--er"
                            : " c-warn-card__dot--wn"
                    }`}
                  />
                </div>
                <WarningBody warning={warning} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
