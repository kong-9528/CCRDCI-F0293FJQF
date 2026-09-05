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

function Field({
  label,
  required,
  children,
  full,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`a-field a-field--stack${full ? " a-form-grid__full" : ""}`}>
      <label className="a-field__label">
        {label}
        {required ? <span className="c-required"> *</span> : null}
      </label>
      {children}
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
    <div className="a-card c-account-page c-account-edit-page">
      {toast ? <div className="a-toast">{toast}</div> : null}
      <div className="a-card__head c-account-edit-page__head">
        <div className="c-account-edit-page__title-row">
          <Link to="/account" className="a-btn a-btn--sm">
            返回
          </Link>
          <span>{isResubmit ? "编辑并重新提交" : "编辑机构信息"}</span>
        </div>
      </div>
      <div className="a-card__body a-stack">
        {isResubmit ? (
          <p className="a-field__hint" style={{ margin: 0 }}>
            修改资料并保存后将重新提交审核。
          </p>
        ) : null}

        <section className="a-form-section">
          <h3 className="a-form-section__title">基本信息</h3>
          <div className="a-form-grid">
            <Field label="机构名称" required>
              <input
                className="a-input"
                value={draft.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                placeholder="请输入机构名称"
              />
            </Field>
            <Field label="统一社会信用代码" required>
              <input
                className="a-input"
                value={draft.creditCode}
                onChange={(e) => set("creditCode", e.target.value)}
                placeholder="请输入统一社会信用代码"
              />
            </Field>
            <Field label="联系地址" required full>
              <input
                className="a-input"
                value={draft.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="请输入联系地址"
              />
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
            <div className="a-field a-field--stack a-form-grid__full">
              <label className="a-field__label">
                合同附件<span className="c-required"> *</span>
              </label>
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
                <ul className="a-apply__files">
                  {draft.contractFiles.map((f) => {
                    const sizeText = formatFileSize(f.size);
                    return (
                      <li key={f.id}>
                        <span>
                          {f.name}
                          {sizeText ? `（${sizeText}）` : ""}
                        </span>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
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
          </div>
        </section>

        <section className="a-form-section">
          <h3 className="a-form-section__title">联系信息</h3>
          <div className="a-form-grid">
            <Field label="联系人" required>
              <input
                className="a-input"
                value={draft.contactName}
                onChange={(e) => set("contactName", e.target.value)}
                placeholder="请输入联系人姓名"
              />
            </Field>
            <Field label="联系人手机号" required>
              <input
                className="a-input"
                inputMode="tel"
                value={draft.contactPhone}
                onChange={(e) => set("contactPhone", e.target.value)}
                placeholder="请输入手机号"
              />
            </Field>
          </div>
        </section>

        {error ? <div className="a-form-error">{error}</div> : null}

        <div className="a-inline-actions">
          <button type="button" className="a-btn a-btn--primary" onClick={onSave}>
            {isResubmit ? "保存并提交" : "保存"}
          </button>
          <button type="button" className="a-btn" onClick={() => navigate("/account")}>
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
