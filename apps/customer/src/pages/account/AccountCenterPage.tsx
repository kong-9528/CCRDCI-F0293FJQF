import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Tabs } from "@/components/Tabs";
import { useAccountStore } from "@/lib/accountStore";
import {
  APPLY_HISTORY_STATUS_LABEL,
  type ApplyHistoryRecord,
  type ApplyHistoryStatus,
} from "@/lib/applyHistory";

type TabKey = "info" | "history";

const TAB_ITEMS = [
  { key: "info" as const, label: "基本信息" },
  { key: "history" as const, label: "历史申请记录" },
];

function formatFileSize(bytes?: number) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function historyStatusTag(status: ApplyHistoryStatus) {
  const label = APPLY_HISTORY_STATUS_LABEL[status];
  if (status === "approved") return <span className="a-tag a-tag--ok">{label}</span>;
  if (status === "rejected") return <span className="a-tag a-tag--er">{label}</span>;
  if (status === "pending") return <span className="a-tag a-tag--wn">{label}</span>;
  return <span className="a-tag a-tag--muted">{label}</span>;
}

function formatContractRange(start: string, end: string) {
  if (!start && !end) return "—";
  if (!start) return end;
  if (!end) return start;
  return `${start} ~ ${end}`;
}

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      className={`c-apply-history-card__chevron${open ? " is-open" : ""}`}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      <path
        d="M4 6l4 4 4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ApplyHistoryCard({
  record,
  expanded,
  onToggle,
  onPreviewFile,
}: {
  record: ApplyHistoryRecord;
  expanded: boolean;
  onToggle: () => void;
  onPreviewFile: (name: string) => void;
}) {
  const panelId = `apply-history-panel-${record.id}`;
  const triggerId = `apply-history-trigger-${record.id}`;
  const contractRange = formatContractRange(record.contractStart, record.contractEnd);

  return (
    <article className={`c-apply-history-card${expanded ? " is-open" : ""}`}>
      <button
        type="button"
        id={triggerId}
        className="c-apply-history-card__summary"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="c-apply-history-card__summary-main">
          <span className="c-apply-history-card__company" title={record.companyName}>
            {record.companyName}
          </span>
          <span className="c-apply-history-card__summary-meta">
            <span className="c-apply-history-card__meta-item">
              <span className="c-apply-history-card__meta-label">合同起止</span>
              <span className="c-apply-history-card__meta-value">{contractRange}</span>
            </span>
            <span className="c-apply-history-card__meta-item">
              <span className="c-apply-history-card__meta-label">提交时间</span>
              <span className="c-apply-history-card__meta-value">{record.submittedAt}</span>
            </span>
          </span>
        </span>
        <span className="c-apply-history-card__summary-aside">
          {historyStatusTag(record.status)}
          <ChevronIcon open={expanded} />
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={triggerId}
        className="c-apply-history-card__panel"
        aria-hidden={!expanded}
        inert={!expanded ? true : undefined}
      >
        <div className="c-apply-history-card__panel-inner">
          <section className="c-apply-history-block">
            <h4 className="c-apply-history-block__title">
              <span className="c-apply-history-block__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3 21h18M5 21V8.5L12 4l7 4.5V21M9 21v-4h6v4"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              基本信息
            </h4>
            <div className="c-apply-history-grid">
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">机构名称</span>
                <span className="c-apply-history-field__value">{record.companyName}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">统一社会信用代码</span>
                <span className="c-apply-history-field__value">{record.creditCode || "—"}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">联系地址</span>
                <span className="c-apply-history-field__value">{record.address || "—"}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">合同开始日期</span>
                <span className="c-apply-history-field__value">{record.contractStart || "—"}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">合同结束日期</span>
                <span className="c-apply-history-field__value">{record.contractEnd || "—"}</span>
              </div>
              <div className="c-apply-history-field c-apply-history-field--full">
                <span className="c-apply-history-field__label">合同附件</span>
                <div className="c-apply-history-files">
                  {record.contractFiles.length === 0 ? (
                    <span className="c-apply-history-field__value">—</span>
                  ) : (
                    record.contractFiles.map((f) => {
                      const sizeText = formatFileSize(f.size);
                      return (
                        <button
                          key={f.id}
                          type="button"
                          className="c-apply-history-file"
                          onClick={() => onPreviewFile(f.name)}
                        >
                          <span className="c-apply-history-file__name">{f.name}</span>
                          {sizeText ? (
                            <span className="c-apply-history-file__size">（{sizeText}）</span>
                          ) : null}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="c-apply-history-block">
            <h4 className="c-apply-history-block__title">
              <span className="c-apply-history-block__icon" aria-hidden>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.75" />
                  <path
                    d="M5 19.5c1.2-3 3.5-4.5 7-4.5s5.8 1.5 7 4.5"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
              联系人信息
            </h4>
            <div className="c-apply-history-grid">
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">联系人</span>
                <span className="c-apply-history-field__value">{record.contactName}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">手机号</span>
                <span className="c-apply-history-field__value">{record.contactPhone}</span>
              </div>
            </div>
            {record.status === "rejected" && record.rejectReason ? (
              <p className="c-apply-history-reject">不通过原因：{record.rejectReason}</p>
            ) : null}
          </section>
        </div>
      </div>
    </article>
  );
}

export function AccountCenterPage() {
  const navigate = useNavigate();
  const { profile, contract, history, applyStatus, withdrawAccountApplication } = useAccountStore();
  const [tab, setTab] = useState<TabKey>("info");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    history[0] ? new Set([history[0].id]) : new Set(),
  );

  const isPending = applyStatus === "pending";
  const currentRejectReason = useMemo(() => {
    if (applyStatus !== "rejected") return undefined;
    return history.find((r) => r.status === "rejected")?.rejectReason;
  }, [applyStatus, history]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const toggleHistory = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const confirmWithdraw = () => {
    const res = withdrawAccountApplication();
    setWithdrawOpen(false);
    if (!res.ok) {
      showToast(res.error);
      return;
    }
    showToast("已撤回申请，可修改资料后重新提交");
  };

  return (
    <div className="a-card c-account-page">
      {toast ? <div className="a-toast">{toast}</div> : null}
      <div className="a-card__head">机构信息</div>
      <Tabs items={TAB_ITEMS} active={tab} onChange={setTab} className="c-seg-tabs" />
      <div className="a-card__body a-stack">
        {tab === "info" ? (
          <section className="a-form-section">
            <div className="c-account-section-head">
              <div className="c-account-section-head__main">
                <h3 className="a-form-section__title" style={{ margin: 0 }}>
                  基本信息
                </h3>
                {historyStatusTag(applyStatus)}
              </div>
              {isPending ? (
                <button
                  type="button"
                  className="a-btn a-btn--sm"
                  onClick={() => setWithdrawOpen(true)}
                >
                  撤回申请
                </button>
              ) : (
                <button
                  type="button"
                  className="a-btn a-btn--primary a-btn--sm"
                  onClick={() => navigate("/account/edit")}
                >
                  编辑
                </button>
              )}
            </div>

            {isPending ? (
              <p className="a-field__hint c-account-status-hint">
                申请审核中，资料暂不可修改。如需调整，请先撤回申请。
              </p>
            ) : null}
            {applyStatus === "rejected" && currentRejectReason ? (
              <p className="c-apply-history-reject c-account-status-hint">
                不通过原因：{currentRejectReason}
              </p>
            ) : null}
            {applyStatus === "withdrawn" ? (
              <p className="a-field__hint c-account-status-hint">
                申请已撤回，修改资料并保存后将重新提交审核。
              </p>
            ) : null}

            <div className="a-desc c-account-desc" style={{ marginTop: 12 }}>
              <div className="a-desc__item">
                <span className="a-desc__label">机构名称</span>
                <span className="a-desc__value">{profile.companyName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">统一社会信用代码</span>
                <span className="a-desc__value">{profile.creditCode || "—"}</span>
              </div>
              <div className="a-desc__item a-desc__item--wide">
                <span className="a-desc__label">联系地址</span>
                <span className="a-desc__value">{profile.address || "—"}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">合同开始日期</span>
                <span className="a-desc__value">{contract.startDate || "—"}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">合同结束日期</span>
                <span className="a-desc__value">{contract.endDate || "—"}</span>
              </div>
              <div className="a-desc__item a-desc__item--wide">
                <span className="a-desc__label">合同附件</span>
                <span className="a-desc__value">
                  {contract.files.length ? (
                    <div className="c-account-files">
                      {contract.files.map((f) => {
                        const sizeText = formatFileSize(f.size);
                        return (
                          <button
                            key={f.id}
                            type="button"
                            className="c-account-file"
                            onClick={() => showToast(`演示：预览 ${f.name}`)}
                            title={f.name}
                          >
                            <span className="c-account-file__name">{f.name}</span>
                            {sizeText ? (
                              <span className="c-account-file__size">（{sizeText}）</span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    "—"
                  )}
                </span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">联系人</span>
                <span className="a-desc__value">{profile.contactName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">联系人手机号</span>
                <span className="a-desc__value">{profile.contactPhone}</span>
              </div>
            </div>
          </section>
        ) : null}

        {tab === "history" ? (
          <div className="c-apply-history-list">
            {history.length === 0 ? (
              <div className="a-empty">暂无历史申请记录</div>
            ) : (
              history.map((record) => (
                <ApplyHistoryCard
                  key={record.id}
                  record={record}
                  expanded={expandedIds.has(record.id)}
                  onToggle={() => toggleHistory(record.id)}
                  onPreviewFile={(name) => showToast(`演示：预览 ${name}`)}
                />
              ))
            )}
          </div>
        ) : null}
      </div>

      <ConfirmDialog
        open={withdrawOpen}
        title="撤回申请"
        description="撤回后本次申请将标记为已撤回，资料会保留，您可修改后再重新提交。确定撤回吗？"
        confirmText="撤回申请"
        danger
        onConfirm={confirmWithdraw}
        onCancel={() => setWithdrawOpen(false)}
      />
    </div>
  );
}
