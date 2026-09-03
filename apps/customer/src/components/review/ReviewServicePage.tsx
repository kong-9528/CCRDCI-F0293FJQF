import { useMemo, useState } from "react";
import { IconCopy, IconEye, IconReset, IconSearch } from "@/components/icons/UiIcons";
import { ApiDocLink } from "@/components/verify/ApiDocLink";
import { ServiceDisclaimer } from "@/components/ServiceDisclaimer";
import {
  REVIEW_DEFAULT_DAYS,
  REVIEW_RECORD_STATUS_LABEL,
  REVIEW_SERVICES,
  WORK_REVIEW_SERVICE_NAME,
  formatReviewCount,
  getReviewQuota,
  getReviewServiceStatus,
  listWorkReviewRecords,
  type ReviewProductCode,
  type ReviewRecordStatus,
} from "@/lib/review";

type Props = {
  product: ReviewProductCode;
};

type Filters = {
  from: string;
  to: string;
  status: string;
  taskId: string;
};

function defaultDateRange() {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - REVIEW_DEFAULT_DAYS);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}

function serviceStatusTag(status: "active" | "expiring" | "stopped") {
  if (status === "stopped") return <span className="a-tag a-tag--muted">已停用</span>;
  if (status === "expiring") return <span className="a-tag a-tag--wn">即将到期</span>;
  return <span className="a-tag a-tag--ok">正常使用</span>;
}

function recordStatusTag(status: ReviewRecordStatus) {
  const cls =
    status === "success"
      ? "a-tag--ok"
      : status === "reviewing"
        ? "a-tag--cyan"
        : "a-tag--er";
  return <span className={`a-tag ${cls}`}>{REVIEW_RECORD_STATUS_LABEL[status]}</span>;
}

export function ReviewServicePage({ product }: Props) {
  const cfg = REVIEW_SERVICES[product];
  const serviceStatus = getReviewServiceStatus(product);
  const quota = getReviewQuota(product);
  const stopped = serviceStatus === "stopped";
  const overQuota = !stopped && quota.overQuota;
  const range0 = defaultDateRange();
  const records = listWorkReviewRecords();

  const [draft, setDraft] = useState<Filters>({
    from: range0.from,
    to: range0.to,
    status: "",
    taskId: "",
  });
  const [applied, setApplied] = useState<Filters>({ ...draft });
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const filtered = useMemo(() => {
    const key = applied.taskId.trim().toLowerCase();
    return records.filter((row) => {
      const day = row.submittedAt.slice(0, 10);
      if (applied.from && day < applied.from) return false;
      if (applied.to && day > applied.to) return false;
      if (applied.status && row.status !== applied.status) return false;
      if (key && !row.taskId.toLowerCase().includes(key)) return false;
      return true;
    });
  }, [records, applied]);

  const copyTaskId = (taskId: string) => {
    void navigator.clipboard?.writeText(taskId);
    showToast("流水号已复制");
  };

  const queryResult = (taskId: string, status: ReviewRecordStatus) => {
    if (status === "reviewing") {
      showToast(`已按流水号 ${taskId} 查询：任务仍在审核中`);
      return;
    }
    showToast(
      `已按流水号 ${taskId} 查询：${REVIEW_RECORD_STATUS_LABEL[status]}`,
    );
  };

  return (
    <div className="a-stack c-review-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-card c-review-intro">
        <div className="a-card__body">
          <div className="c-verify-panel-head">
            <h2 className="c-verify-panel-head__title">{WORK_REVIEW_SERVICE_NAME}</h2>
            <ApiDocLink productId={cfg.apiDocId} />
          </div>
          <div className="c-review-intro__body">
            {cfg.intro.map((item) => (
              <p key={item.label}>{item.text}</p>
            ))}
            <p className="c-review-intro__async">
              内容安全审核、作品登记查重、疑似侵权审核共用同一额度；提交后请保存流水号，并在下方记录中查询审核结果。
            </p>
          </div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          额度与有效期
          <span className="a-card__extra">超额不拦截，仅提示</span>
        </div>
        <div className="a-card__body a-stack">
          {overQuota ? (
            <div className="c-review-over-tip" role="status">
              当前已超出套餐额度（{formatReviewCount(quota.usedCount)} /{" "}
              {formatReviewCount(quota.quotaTotal)}
              ），仍可继续提交审核任务。请及时联系商务扩容或确认超额结算方式。
            </div>
          ) : null}
          <div className="a-desc">
            <div className="a-desc__item">
              <span className="a-desc__label">服务状态</span>
              <span className="a-desc__value">{serviceStatusTag(serviceStatus)}</span>
            </div>
            {!stopped ? (
              <>
                {quota.expireAt ? (
                  <div className="a-desc__item">
                    <span className="a-desc__label">有效期</span>
                    <span className="a-desc__value">{quota.expireAt}</span>
                  </div>
                ) : null}
                <div className="a-desc__item">
                  <span className="a-desc__label">已用额度</span>
                  <span className="a-desc__value">
                    {formatReviewCount(quota.usedCount)} / {formatReviewCount(quota.quotaTotal)}
                    {overQuota ? (
                      <span className="a-tag a-tag--wn" style={{ marginLeft: 8 }}>
                        已超额
                      </span>
                    ) : null}
                  </span>
                </div>
              </>
            ) : null}
          </div>
          {!stopped ? (
            <div className="c-review-quota">
              <div className="c-review-quota__bar">
                <div
                  className={`c-review-quota__fill${overQuota ? " is-over" : ""}`}
                  style={{ width: `${Math.min(100, quota.quotaUsagePct)}%` }}
                />
              </div>
              <div className="c-review-quota__meta">
                使用率 {quota.quotaUsagePct.toFixed(1)}%
                {overQuota ? "（已超出，仍可继续调用）" : ""}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          审核记录
          <div className="a-card__extra">
            异步任务流水 · 默认近 {REVIEW_DEFAULT_DAYS} 天
          </div>
        </div>
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">提交时间</span>
            <div className="a-date-range">
              <input
                type="date"
                className="a-input"
                value={draft.from}
                onChange={(e) => setDraft((p) => ({ ...p, from: e.target.value }))}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={draft.to}
                onChange={(e) => setDraft((p) => ({ ...p, to: e.target.value }))}
              />
            </div>
          </div>
          <div className="a-field">
            <span className="a-field__label">流水号</span>
            <input
              className="a-input"
              placeholder="请输入流水号"
              value={draft.taskId}
              onChange={(e) => setDraft((p) => ({ ...p, taskId: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="success">成功</option>
              <option value="fail">失败</option>
              <option value="reviewing">正在审核</option>
            </select>
          </div>
          <div className="a-toolbar__right">
            <button
              type="button"
              className="a-btn a-btn--primary a-btn--sm"
              onClick={() => setApplied({ ...draft })}
            >
              <IconSearch />
              搜索
            </button>
            <button
              type="button"
              className="a-btn a-btn--outline a-btn--sm"
              onClick={() => {
                const next = { from: range0.from, to: range0.to, status: "", taskId: "" };
                setDraft(next);
                setApplied(next);
              }}
            >
              <IconReset />
              重置
            </button>
          </div>
        </div>
        <div className="a-card__body a-card__body--flush">
          {records.length === 0 || filtered.length === 0 ? (
            <div className="c-review-empty">
              <div className="c-review-empty__icon" aria-hidden>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <p>
                {stopped
                  ? "服务已停用，暂无审核记录"
                  : records.length === 0
                    ? "暂无审核记录"
                    : "当前筛选条件下暂无审核记录"}
              </p>
            </div>
          ) : (
            <div className="a-table-wrap">
              <table className="a-table">
                <thead>
                  <tr>
                    <th>提交时间</th>
                    <th>流水号</th>
                    <th>审核类型</th>
                    <th>状态</th>
                    <th>完成时间</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row) => (
                    <tr key={row.id}>
                      <td>{row.submittedAt}</td>
                      <td>
                        <span className="a-code-cell">
                          <button
                            type="button"
                            className="a-link-action"
                            title="复制流水号"
                            onClick={() => copyTaskId(row.taskId)}
                          >
                            {row.taskId}
                            <IconCopy />
                          </button>
                        </span>
                      </td>
                      <td>{row.apiName}</td>
                      <td>{recordStatusTag(row.status)}</td>
                      <td>{row.finishedAt ?? "—"}</td>
                      <td style={{ whiteSpace: "nowrap" }}>
                        <button
                          type="button"
                          className="a-link-action"
                          onClick={() => queryResult(row.taskId, row.status)}
                        >
                          <IconEye />
                          {row.status === "reviewing" ? "查询结果" : "查看结果"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <ServiceDisclaimer />
    </div>
  );
}
