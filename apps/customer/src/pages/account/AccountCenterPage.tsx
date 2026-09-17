import { useMemo, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { useAccountStore } from "@/lib/accountStore";
import {
  APPLY_HISTORY_STATUS_LABEL,
  type ApplyHistoryRecord,
  type ApplyHistoryStatus,
} from "@/lib/applyHistory";

type ViewMode = "info" | "history";

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

function IconHistory() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 9H8M16 13H8M16 17H8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

function IconWithdraw() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M9 14H4v-5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M4 14a8 8 0 1 0-1.05-4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ViewField({
  label,
  required,
  children,
  preLine,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  preLine?: boolean;
}) {
  return (
    <div className="c-org-field">
      <div className="c-org-field__label">
        {required ? <span className="c-required">*</span> : null}
        {required ? " " : null}
        {label}
      </div>
      <div className={`c-org-field__value${preLine ? " is-preline" : ""}`}>{children}</div>
    </div>
  );
}

function StatusAlert({
  status,
  rejectReason,
}: {
  status: ApplyHistoryStatus;
  rejectReason?: string;
}) {
  if (status === "pending") {
    return (
      <div className="c-org-alert c-org-alert--pending" role="status">
        <div className="c-org-alert__body">
          <p className="c-org-alert__title">机构信息变更审核中</p>
          <p className="c-org-alert__desc">您的申请已提交，正在等待平台审核。审核期间资料暂不可修改，如需调整请先撤回申请。</p>
        </div>
      </div>
    );
  }
  if (status === "rejected") {
    return (
      <div className="c-org-alert c-org-alert--rejected" role="status">
        <div className="c-org-alert__body">
          <p className="c-org-alert__title">机构信息变更未通过</p>
          <p className="c-org-alert__desc">{rejectReason || "请修改资料后重新提交。"}</p>
        </div>
      </div>
    );
  }
  if (status === "withdrawn") {
    return (
      <div className="c-org-alert c-org-alert--withdrawn" role="status">
        <div className="c-org-alert__body">
          <p className="c-org-alert__title">申请已撤回</p>
          <p className="c-org-alert__desc">资料已保留，修改后点击下方按钮可重新提交审核。</p>
        </div>
      </div>
    );
  }
  return (
    <div className="c-org-alert c-org-alert--approved" role="status">
      <div className="c-org-alert__body">
        <p className="c-org-alert__title">您的机构资质申请已审核通过</p>
        <p className="c-org-alert__desc">
          机构资质已认证，线上业务运行正常。如机构信息发生变动（如更换联系人、续签合同等），可随时点击下方“修改申请信息”提交变更工单，审核期间不影响现有业务。
        </p>
      </div>
    </div>
  );
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
            <h4 className="c-apply-history-block__title">基本信息</h4>
            <div className="c-apply-history-grid">
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">机构名称</span>
                <span className="c-apply-history-field__value">{record.companyName}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">组织机构代码</span>
                <span className="c-apply-history-field__value">{record.creditCode || "—"}</span>
              </div>
              <div className="c-apply-history-field">
                <span className="c-apply-history-field__label">机构地址</span>
                <span className="c-apply-history-field__value">{record.address || "—"}</span>
              </div>
              <div className="c-apply-history-field c-apply-history-field--full">
                <span className="c-apply-history-field__label">合作领域</span>
                <span className="c-apply-history-field__value">{record.cooperationField || "—"}</span>
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
            <h4 className="c-apply-history-block__title">联系人信息</h4>
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
  const [view, setView] = useState<ViewMode>("info");
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() =>
    history[0] ? new Set([history[0].id]) : new Set(),
  );

  const isPending = applyStatus === "pending";
  const canEdit = !isPending;
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
    <div className="c-org-page">
      {toast ? <div className="a-toast">{toast}</div> : null}
      <div className="c-org-card">
        <div className="c-org-card__header">
          <div className="c-org-card__header-left">
            {view === "history" ? (
              <button type="button" className="c-org-btn c-org-btn--ghost" onClick={() => setView("info")}>
                返回
              </button>
            ) : null}
            <h1 className="c-org-card__title">{view === "history" ? "历史申请记录" : "机构信息"}</h1>
          </div>
          <div className="c-org-card__header-right">
            {view === "info" ? (
              <button type="button" className="c-org-btn c-org-btn--ghost" onClick={() => setView("history")}>
                <IconHistory />
                历史申请记录
              </button>
            ) : null}
          </div>
        </div>

        {view === "info" ? (
          <>
            <StatusAlert status={applyStatus} rejectReason={currentRejectReason} />

            <div className="c-org-form">
              <h2 className="c-org-section-title">基本信息</h2>
              <ViewField label="机构名称" required>
                {profile.companyName}
              </ViewField>
              <ViewField label="组织机构代码" required>
                {profile.creditCode || "—"}
              </ViewField>
              <ViewField label="机构地址" required>
                {profile.address || "—"}
              </ViewField>
              <ViewField label="邀请码" required>
                <span className="c-invite-readonly c-invite-readonly--inline">
                  <span className="c-invite-readonly__code">{profile.inviteCode || "—"}</span>
                  <span className="c-invite-readonly__badge">已认证核销</span>
                  <span className="c-invite-readonly__hint">（资质变更无需再次消耗邀请码）</span>
                </span>
              </ViewField>
              <ViewField label="合作领域" required preLine>
                {profile.cooperationField || "—"}
              </ViewField>
              <ViewField label="合同开始日期" required>
                {contract.startDate || "—"}
              </ViewField>
              <ViewField label="合同结束日期" required>
                {contract.endDate || "—"}
              </ViewField>
              <ViewField label="合同附件" required>
                {contract.files.length ? (
                  <div className="c-org-files">
                    {contract.files.map((f) => {
                      const sizeText = formatFileSize(f.size);
                      return (
                        <div key={f.id} className="c-org-file">
                          <span className="c-org-file__name" title={f.name}>
                            {f.name}
                            {sizeText ? `（${sizeText}）` : ""}
                          </span>
                          <button
                            type="button"
                            className="c-org-file__link"
                            onClick={() => showToast(`演示：预览 ${f.name}`)}
                          >
                            查看
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  "—"
                )}
              </ViewField>

              <div className="c-org-divider" />

              <h2 className="c-org-section-title">联系人信息</h2>
              <ViewField label="联系人" required>
                {profile.contactName}
              </ViewField>
              <ViewField label="手机号码" required>
                {profile.contactPhone}
              </ViewField>

              <div className="c-org-actions">
                {isPending ? (
                  <button
                    type="button"
                    className="c-org-withdraw"
                    onClick={() => setWithdrawOpen(true)}
                  >
                    <IconWithdraw />
                    撤回本次申请
                  </button>
                ) : canEdit ? (
                  <button
                    type="button"
                    className="c-org-submit"
                    onClick={() => navigate("/account/edit")}
                  >
                    <IconEdit />
                    {applyStatus === "withdrawn" || applyStatus === "rejected"
                      ? "修改并重新提交"
                      : "修改申请信息"}
                  </button>
                ) : null}
              </div>
            </div>
          </>
        ) : (
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
        )}
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
