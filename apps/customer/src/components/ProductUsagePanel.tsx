import type { ProductCode } from "@/lib/catalog";
import { productName } from "@/lib/catalog";
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
  /** 卡片副标题，默认「用量统计」 */
  subtitle?: string;
};

/** 产品页使用量板块（核验：本产品用量 / 共享额度；审核：独立额度） */
export function ProductUsagePanel({ product, subtitle = "" }: Props) {
  const item = DASHBOARD_PRODUCTS.find((p) => p.code === product);
  if (!item) return null;

  const stopped = item.status === "stopped";
  const title = productName(product);
  const shared = item.entitlement === "verify";

  return (
    <div className="a-card">
      <div className="a-card__head">
        {title}
        <span className="a-card__extra">{subtitle}</span>
      </div>
      <div className="a-card__body a-stack">
        <div className="a-desc">
          <div className="a-desc__item">
            <span className="a-desc__label">服务状态</span>
            <span className="a-desc__value">{serviceStatusTag(item.status)}</span>
          </div>
          {stopped ? (
            <div className="a-desc__item">
              <span className="a-desc__label">说明</span>
              <span className="a-desc__value">需联系运营恢复</span>
            </div>
          ) : (
            <>
              <div className="a-desc__item">
                <span className="a-desc__label">有效期</span>
                <span className="a-desc__value">
                  {item.expireAt}
                  {shared ? "（版权核验共享）" : ""}
                </span>
              </div>
              {item.quotaTotal != null ? (
                <div className="a-desc__item">
                  <span className="a-desc__label">
                    {shared ? "本技术服务用量 / 版权核验共享额度" : "已用额度"}
                  </span>
                  <span className="a-desc__value">
                    {formatCount(item.usedCount)} / {formatCount(item.quotaTotal)}
                  </span>
                </div>
              ) : (
                <div className="a-desc__item">
                  <span className="a-desc__label">已用额度</span>
                  <span className="a-desc__value">
                    {formatCount(item.usedCount)} / 不限量
                  </span>
                </div>
              )}
              {shared && item.quotaTotal != null ? (
                <div className="a-desc__item">
                  <span className="a-desc__label">共享池合计</span>
                  <span className="a-desc__value">
                    {formatCount(verifyPoolUsedTotal())} / {formatCount(item.quotaTotal)}
                    {item.consumePerWork != null
                      ? ` · 每作品 ${item.consumePerWork} 次`
                      : ""}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>
        {!stopped && item.quotaTotal != null ? (
          <div className="c-review-quota">
            <div className="c-review-quota__bar">
              <div
                className="c-review-quota__fill"
                style={{ width: `${Math.min(100, item.quotaUsagePct)}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
