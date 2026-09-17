import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import {
  saveAccountProfile,
  useAccountStore,
  type AccountContractFile,
  type AccountProfileDraft,
} from "@/lib/accountStore";

function formatFileSize(bytes?: number) {
  if (bytes == null || !Number.isFinite(bytes) || bytes < 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function IconBuilding() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M10 12h4M10 8h4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path
        d="M14 21v-3a2 2 0 0 0-4 0v3M6 10H4a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-2M6 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
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

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

function EditRow({
  label,
  required,
  children,
  info,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  info?: string;
}) {
  return (
    <div className="c-org-info-row c-org-info-row--edit">
      <div className="c-org-info-row__label">
        {required ? <span className="c-required">*</span> : null}
        {required ? " " : null}
        {label}
        {info ? (
          <button type="button" className="c-field-info" title={info} aria-label={`${label}说明`}>
            <InfoIcon />
          </button>
        ) : null}
      </div>
      <div className="c-org-info-row__value c-org-info-row__control">{children}</div>
    </div>
  );
}

export function AccountEditPage() {
  const navigate = useNavigate();
  const { profile, contract, applyStatus } = useAccountStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [draft, setDraft] = useState<AccountProfileDraft>(() => ({
    ...profile,
    contractStart: contract.startDate,
    contractEnd: contract.endDate,
    contractFiles: contract.files.map((f) => ({ ...f })),
  }));
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setDraft({
      ...profile,
      contractStart: contract.startDate,
      contractEnd: contract.endDate,
      contractFiles: contract.files.map((f) => ({ ...f })),
    });
  }, [profile, contract]);

  if (applyStatus === "pending") {
    return <Navigate to="/account" replace />;
  }

  const isResubmit = applyStatus === "withdrawn" || applyStatus === "rejected";
  const set = <K extends keyof AccountProfileDraft>(key: K, value: AccountProfileDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }));
  };

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next: AccountContractFile[] = [...draft.contractFiles];
    for (const file of Array.from(list)) {
      next.push({
        id: `cf-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: file.name,
        size: file.size,
      });
    }
    set("contractFiles", next);
    if (fileRef.current) fileRef.current.value = "";
  };

  const removeFile = (id: string) => {
    set(
      "contractFiles",
      draft.contractFiles.filter((f) => f.id !== id),
    );
  };

  const onSave = () => {
    setError(null);
    const result = saveAccountProfile(draft);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    showToast(result.resubmitted ? "已重新提交，请等待审核" : "机构信息已更新");
    window.setTimeout(() => navigate("/account", { replace: true }), 400);
  };

  return (
    <div className="c-org-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="c-org-page__toolbar">
        <button
          type="button"
          className="c-org-btn c-org-btn--ghost c-org-btn--sm"
          onClick={() => navigate("/account?view=history")}
        >
          <IconHistory />
          历史申请记录
        </button>
      </div>

      {isResubmit ? (
        <div className="c-org-alert c-org-alert--withdrawn" role="status">
          <div className="c-org-alert__body">
            <p className="c-org-alert__title">请完善资料后重新提交</p>
            <p className="c-org-alert__desc">修改资料并保存后将重新进入审核。</p>
          </div>
        </div>
      ) : null}

      <section className="c-org-card c-org-card--registry">
        <header className="c-org-card__header">
          <div className="c-org-card__header-left">
            <span className="c-org-card__icon" aria-hidden>
              <IconBuilding />
            </span>
            <h1 className="c-org-card__title">
              {isResubmit ? "修改并重新提交" : "编辑机构信息"}
            </h1>
          </div>
          <div className="c-org-card__header-right">
            <button
              type="button"
              className="c-org-btn c-org-btn--ghost c-org-btn--sm"
              onClick={() => navigate("/account")}
            >
              取消
            </button>
            <button
              type="button"
              className="c-org-btn c-org-btn--primary c-org-btn--sm"
              onClick={onSave}
            >
              {isResubmit ? "保存并提交" : "保存"}
            </button>
          </div>
        </header>

        <div className="c-org-card__body c-org-edit-body">
          <div className="c-org-info-panel">
            <div className="c-org-info-panel__head">
              <h2 className="c-org-info-panel__title">基本信息</h2>
            </div>
            <div className="c-org-info-panel__rows">
              <EditRow label="机构名称" required>
                <input
                  className="a-input"
                  value={draft.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="请输入机构名称"
                />
              </EditRow>
              <EditRow label="组织机构代码" required>
                <input
                  className="a-input"
                  value={draft.creditCode}
                  onChange={(e) => set("creditCode", e.target.value)}
                  placeholder="请输入组织机构代码"
                />
              </EditRow>
              <EditRow label="机构地址" required>
                <input
                  className="a-input"
                  value={draft.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="请输入机构地址"
                />
              </EditRow>
              <EditRow label="邀请码" required>
                <div className="c-invite-readonly c-invite-readonly--inline">
                  <span className="c-invite-readonly__code">{profile.inviteCode || "—"}</span>
                  <span className="c-invite-readonly__badge">已认证核销</span>
                  <span className="c-invite-readonly__hint">（资质变更无需再次消耗邀请码）</span>
                </div>
              </EditRow>
              <EditRow
                label="合作领域"
                required
                info="请填写与贵机构业务相关的合作领域，如电商领域、艺术领域等。"
              >
                <div className="c-textarea-wrap">
                  <textarea
                    className="a-textarea c-textarea--counted"
                    rows={3}
                    maxLength={300}
                    value={draft.cooperationField}
                    onChange={(e) => set("cooperationField", e.target.value.slice(0, 300))}
                    placeholder="请输入合作领域，如电商领域、艺术领域等"
                  />
                  <span className="c-textarea-counter">{draft.cooperationField.length} / 300</span>
                </div>
              </EditRow>
              <EditRow label="合同开始日期" required>
                <input
                  className="a-input c-org-edit-date"
                  type="date"
                  value={draft.contractStart}
                  onChange={(e) => set("contractStart", e.target.value)}
                />
              </EditRow>
              <EditRow label="合同结束日期" required>
                <input
                  className="a-input c-org-edit-date"
                  type="date"
                  value={draft.contractEnd}
                  onChange={(e) => set("contractEnd", e.target.value)}
                />
              </EditRow>
              <EditRow label="合同附件" required>
                <div className="c-org-upload">
                  <div className="a-upload">
                    <input
                      ref={fileRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
                      onChange={(e) => onPickFiles(e.target.files)}
                    />
                  </div>
                  {draft.contractFiles.length > 0 ? (
                    <ul className="c-org-upload__list">
                      {draft.contractFiles.map((f) => {
                        const sizeText = formatFileSize(f.size);
                        return (
                          <li key={f.id} className="c-org-file">
                            <span className="c-org-file__name">
                              {f.name}
                              {sizeText ? `（${sizeText}）` : ""}
                            </span>
                            <button
                              type="button"
                              className="c-org-file__link"
                              onClick={() => removeFile(f.id)}
                            >
                              移除
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <span className="a-field__hint">请上传至少一份合同附件</span>
                  )}
                </div>
              </EditRow>
            </div>
          </div>

          <div className="c-org-info-panel">
            <div className="c-org-info-panel__head">
              <h2 className="c-org-info-panel__title">联系人信息</h2>
            </div>
            <div className="c-org-info-panel__rows">
              <EditRow label="联系人" required>
                <input
                  className="a-input"
                  value={draft.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                  placeholder="请输入联系人姓名"
                />
              </EditRow>
              <EditRow label="手机号码" required>
                <input
                  className="a-input"
                  inputMode="tel"
                  value={draft.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  placeholder="请输入手机号"
                />
              </EditRow>
            </div>
          </div>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="c-org-edit-footer">
            <button
              type="button"
              className="c-org-btn c-org-btn--ghost"
              onClick={() => navigate("/account")}
            >
              取消
            </button>
            <button type="button" className="c-org-btn c-org-btn--primary" onClick={onSave}>
              {isResubmit ? "保存并提交" : "保存"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
