import type { ProductCode } from "@/lib/catalog";
import {
  DASHBOARD_PRODUCTS,
  type ServiceStatus,
} from "@/lib/dashboard";
import { verifyPoolUsedTotal } from "@/lib/tenant";

function serviceStatusTag(status: ServiceStatus) {
  if (status === "stopped") return <span className="a-tag a-tag--muted">已停用</span>;
  if (status === "expiring") return <span className="a-tag a-tag--wn">即将到期</span>;
  return <span className="a-tag a-tag--ok">正常使用</span>;
}

function formatCount(n: number) {
  return n.toLocaleString("zh-CN");
}

type Props = {
  product: ProductCode;
  /** 隐藏卡片内标题（外层 PaneHeader 已展示时） */
  hideHead?: boolean;
};

/** 产品页使用量板块（核验：突出本技术服务用量 + 共享池进度条） */
export function ProductUsagePanel({ product, hideHead = false }: Props) {
  const item = DASHBOARD_PRODUCTS.find((p) => p.code === product);
  if (!item) return null;

  const stopped = item.status === "stopped";
  const shared = item.entitlement === "verify";
  const poolUsed = shared ? verifyPoolUsedTotal() : item.usedCount;
  const quotaTotal = item.quotaTotal;
  const poolPct =
    quotaTotal && quotaTotal > 0
      ? Math.round((poolUsed / quotaTotal) * 1000) / 10
      : 0;
  const poolOver = quotaTotal != null && poolUsed > quotaTotal;

  return (
    <div className="a-card">
      {hideHead ? null : (
        <div className="a-card__head">
          用量统计
          <span className="a-card__extra" />
        </div>
      )}
      <div className="a-card__body">
        <div className="c-usage-stats">
          <div className="c-usage-stats__rows">
            <div className="c-usage-stats__row">
              <span className="c-usage-stats__label">服务状态</span>
              <span className="c-usage-stats__value">{serviceStatusTag(item.status)}</span>
            </div>
            {stopped ? (
              <div className="c-usage-stats__row">
                <span className="c-usage-stats__label">说明</span>
                <span className="c-usage-stats__value">需联系运营恢复</span>
              </div>
            ) : (
              <div className="c-usage-stats__row">
                <span className="c-usage-stats__label">有效期</span>
                <span className="c-usage-stats__value">{item.expireAt}</span>
              </div>
            )}
          </div>

          {!stopped ? (
            <>
              <div className="c-usage-stats__hero">
                <span className="c-usage-stats__hero-label">本技术服务用量</span>
                <div className="c-usage-stats__hero-main">
                  <strong className="c-usage-stats__hero-num">{formatCount(item.usedCount)}</strong>
                  <span className="c-usage-stats__hero-unit">次</span>
                </div>
              </div>

              {quotaTotal != null ? (
                <div className="c-usage-stats__pool">
                  <div className="c-usage-stats__row">
                    <span className="c-usage-stats__label">
                      {shared ? "版权核验总额度" : "套餐额度"}
                    </span>
                    <span className="c-usage-stats__value c-usage-stats__value--num">
                      {formatCount(poolUsed)} / {formatCount(quotaTotal)}
                      {poolOver ? (
                        <span className="a-tag a-tag--wn" style={{ marginLeft: 8 }}>
                          已超额
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="c-usage-stats__bar-wrap">
                    <div className="c-usage-stats__bar" aria-hidden>
                      <div
                        className={`c-usage-stats__fill${poolOver ? " is-over" : ""}`}
                        style={{ width: `${Math.min(100, poolPct)}%` }}
                      />
                    </div>
                    <div className="c-usage-stats__bar-meta">
                      使用率 {poolPct.toFixed(1)}%
                      {poolOver ? "（已超出）" : ""}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="c-usage-stats__row">
                  <span className="c-usage-stats__label">套餐额度</span>
                  <span className="c-usage-stats__value">不限量</span>
                </div>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
