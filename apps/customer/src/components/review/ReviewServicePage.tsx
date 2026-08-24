import { ApiDocLink } from "@/components/verify/ApiDocLink";
import {
  REVIEW_RECORD_STATUS_LABEL,
  REVIEW_SERVICES,
  formatReviewCount,
  getReviewQuota,
  type ReviewProductCode,
  type ReviewRecordStatus,
} from "@/lib/review";

type Props = {
  product: ReviewProductCode;
};

function serviceStatusTag(status: "active" | "expiring" | "stopped") {
  if (status === "stopped") return <span className="a-tag a-tag--muted">已停用</span>;
  if (status === "expiring") return <span className="a-tag a-tag--wn">即将到期</span>;
  return <span className="a-tag a-tag--ok">正常使用</span>;
}

function recordStatusTag(status: ReviewRecordStatus) {
  const cls =
    status === "success" ? "a-tag--ok" : status === "partial" ? "a-tag--wn" : "a-tag--er";
  return <span className={`a-tag ${cls}`}>{REVIEW_RECORD_STATUS_LABEL[status]}</span>;
}

export function ReviewServicePage({ product }: Props) {
  const cfg = REVIEW_SERVICES[product];
  const quota = getReviewQuota(product);
  const stopped = cfg.serviceStatus === "stopped";

  return (
    <div className="a-stack c-review-page">
      <div className="a-card c-review-intro">
        <div className="a-card__body">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">服务说明</h2>
            <ApiDocLink productId={cfg.apiDocId} />
          </div>
          <div className="c-review-intro__body">
            {cfg.intro.map((item) => (
              <p key={item.label}>
                <strong>{item.label}：</strong>
                {item.text}
              </p>
            ))}
          </div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          {cfg.title}
          <span className="a-card__extra">{cfg.subtitle}</span>
        </div>
        <div className="a-card__body a-stack">
          <div className="a-desc">
            <div className="a-desc__item">
              <span className="a-desc__label">服务状态</span>
              <span className="a-desc__value">{serviceStatusTag(cfg.serviceStatus)}</span>
            </div>
            {stopped ? (
              <div className="a-desc__item">
                <span className="a-desc__label">说明</span>
                <span className="a-desc__value">{cfg.stoppedNote ?? "—"}</span>
              </div>
            ) : (
              <>
                {(cfg.expireAt || quota?.expireAt) && (
                  <div className="a-desc__item">
                    <span className="a-desc__label">有效期</span>
                    <span className="a-desc__value">{cfg.expireAt ?? quota?.expireAt}</span>
                  </div>
                )}
                {quota && quota.quotaTotal != null ? (
                  <div className="a-desc__item">
                    <span className="a-desc__label">已用额度</span>
                    <span className="a-desc__value">
                      {formatReviewCount(quota.usedCount)} / {formatReviewCount(quota.quotaTotal)}
                    </span>
                  </div>
                ) : null}
              </>
            )}
          </div>
          {!stopped && quota && quota.quotaTotal != null ? (
            <div className="c-review-quota">
              <div className="c-review-quota__bar">
                <div
                  className="c-review-quota__fill"
                  style={{ width: `${Math.min(100, quota.quotaUsagePct)}%` }}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">审核记录</div>
        <div className="a-card__body a-card__body--flush">
          {cfg.records.length === 0 ? (
            <div className="c-review-empty">
              <div className="c-review-empty__icon" aria-hidden>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <p>{stopped ? "服务已停用，暂无审核记录" : "暂无审核记录"}</p>
            </div>
          ) : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>调用时间</th>
                    <th>接口</th>
                    <th>状态</th>
                    <th>响应时间</th>
                    <th>配额消耗</th>
                  </tr>
                </thead>
                <tbody>
                  {cfg.records.map((row) => (
                    <tr key={row.id}>
                      <td>{row.calledAt}</td>
                      <td>{row.apiName}</td>
                      <td>{recordStatusTag(row.status)}</td>
                      <td>{row.responseMs != null ? `${row.responseMs}ms` : "—"}</td>
                      <td>{row.quotaCost}次</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
