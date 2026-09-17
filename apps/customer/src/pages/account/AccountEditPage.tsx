import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
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

function InfoIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.75" />
      <path d="M12 11v6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <circle cx="12" cy="7.5" r="1" fill="currentColor" />
    </svg>
  );
}

function Field({
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
    <div className="c-org-field c-org-field--edit">
      <div className="c-org-field__label">
        {required ? <span className="c-required">*</span> : null}
        {required ? " " : null}
        {label}
        {info ? (
          <button type="button" className="c-field-info" title={info} aria-label={`${label}说明`}>
            <InfoIcon />
          </button>
        ) : null}
      </div>
      <div className="c-org-field__control">{children}</div>
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
      <div className="c-org-card">
        <div className="c-org-card__header">
          <div className="c-org-card__header-left">
            <Link to="/account" className="c-org-btn c-org-btn--ghost">
              返回
            </Link>
            <h1 className="c-org-card__title">{isResubmit ? "修改并重新提交" : "修改申请信息"}</h1>
          </div>
        </div>

        {isResubmit ? (
          <div className="c-org-alert c-org-alert--withdrawn" role="status">
            <div className="c-org-alert__body">
              <p className="c-org-alert__title">请完善资料后重新提交</p>
              <p className="c-org-alert__desc">修改资料并保存后将重新进入审核。</p>
            </div>
          </div>
        ) : null}

        <div className="c-org-form">
          <h2 className="c-org-section-title">基本信息</h2>
          <Field label="机构名称" required>
            <input
              className="a-input"
              value={draft.companyName}
              onChange={(e) => set("companyName", e.target.value)}
              placeholder="请输入机构名称"
            />
          </Field>
          <Field label="组织机构代码" required>
            <input
              className="a-input"
              value={draft.creditCode}
              onChange={(e) => set("creditCode", e.target.value)}
              placeholder="请输入组织机构代码"
            />
          </Field>
          <Field label="机构地址" required>
            <input
              className="a-input"
              value={draft.address}
              onChange={(e) => set("address", e.target.value)}
              placeholder="请输入机构地址"
            />
          </Field>
          <Field label="邀请码" required>
            <div className="c-invite-readonly">
              <span className="c-invite-readonly__code">{profile.inviteCode || "—"}</span>
              <span className="c-invite-readonly__badge">已认证核销</span>
              <span className="c-invite-readonly__hint">（资质变更无需再次消耗邀请码）</span>
            </div>
          </Field>
          <Field
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
          </Field>
          <Field label="合同开始日期" required>
            <input
              className="a-input"
              type="date"
              value={draft.contractStart}
              onChange={(e) => set("contractStart", e.target.value)}
            />
          </Field>
          <Field label="合同结束日期" required>
            <input
              className="a-input"
              type="date"
              value={draft.contractEnd}
              onChange={(e) => set("contractEnd", e.target.value)}
            />
          </Field>
          <Field label="合同附件" required>
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
                        <button type="button" className="c-org-file__link" onClick={() => removeFile(f.id)}>
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
          </Field>

          <div className="c-org-divider" />

          <h2 className="c-org-section-title">联系人信息</h2>
          <Field label="联系人" required>
            <input
              className="a-input"
              value={draft.contactName}
              onChange={(e) => set("contactName", e.target.value)}
              placeholder="请输入联系人姓名"
            />
          </Field>
          <Field label="手机号码" required>
            <input
              className="a-input"
              inputMode="tel"
              value={draft.contactPhone}
              onChange={(e) => set("contactPhone", e.target.value)}
              placeholder="请输入手机号"
            />
          </Field>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="c-org-actions">
            <button type="button" className="c-org-submit" onClick={onSave}>
              {isResubmit ? "保存并提交" : "保存"}
            </button>
            <button type="button" className="c-org-btn c-org-btn--ghost c-org-btn--block" onClick={() => navigate("/account")}>
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
