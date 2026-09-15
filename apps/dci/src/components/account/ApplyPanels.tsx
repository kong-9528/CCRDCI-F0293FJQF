"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ApplyField, ApplySection, ApplyStatusBanner, ApplyWithdrawBar } from "@/components/account/ApplyFormShared";
import { useAuth, CUSTOMER_CONSOLE_URL } from "@/lib/auth";
import {
  getRejectReason,
  listApplyHistory,
  loadRegistryForm,
  loadTechForm,
  markHistoryWithdrawn,
  pushApplyHistory,
  saveRegistryForm,
  saveTechForm,
  type RegistryApplyForm,
  type RegistryOrgType,
  type TechApplyForm,
} from "@/lib/applyStore";
import { canSubmitApplication, canWithdrawApplication } from "@/lib/serviceAccess";

function IconHistory() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path d="M14 2v5a1 1 0 0 0 1 1h5" stroke="currentColor" strokeWidth="2" />
      <path d="M10 9H8M16 13H8M16 17H8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconBack() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ApplyBackLink() {
  return (
    <Link href="/account/services/" className="d-account__action d-apply__back">
      <IconBack /> 返回开通管理
    </Link>
  );
}

function HistoryModal({
  open,
  onClose,
  username,
  kind,
  title,
}: {
  open: boolean;
  onClose: () => void;
  username: string;
  kind: "registry" | "tech";
  title: string;
}) {
  if (!open) return null;
  const items = listApplyHistory(username, kind);
  const label: Record<string, string> = {
    pending: "审核中",
    approved: "已通过",
    rejected: "未通过",
    withdrawn: "已撤回",
  };
  return (
    <div className="d-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button type="button" className="d-modal__mask" aria-label="关闭" onClick={onClose} />
      <div className="d-modal__panel d-account__modal d-account__modal--wide">
        <button type="button" className="d-modal__close" onClick={onClose} aria-label="关闭">
          ×
        </button>
        <h3>{title}</h3>
        <p className="d-modal__desc">展示本账号相关申请与审核轨迹（演示数据）。</p>
        {items.length === 0 ? (
          <p className="d-account__placeholder">暂无历史申请记录</p>
        ) : (
          <ul className="d-apply__history">
            {items.map((item) => (
              <li key={item.id}>
                <div>
                  <strong>{item.summary || "-"}</strong>
                  <span
                    className={`d-account__status d-account__status--${
                      item.status === "withdrawn"
                        ? "withdrawn"
                        : item.status === "pending"
                          ? "pending"
                          : item.status === "approved"
                            ? "approved"
                            : "rejected"
                    }`}
                  >
                    {label[item.status] || item.status}
                  </span>
                </div>
                <p>{new Date(item.submittedAt).toLocaleString("zh-CN")}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export function RegistryApplyPanel() {
  const { user, updateServiceStatus } = useAuth();
  const status = user?.registryStatus ?? "none";
  const readOnly = status === "pending" || status === "approved";
  const [form, setForm] = useState<RegistryApplyForm>(() => ({ ...loadRegistryForm("") }));
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setForm(loadRegistryForm(user.username));
  }, [user]);

  const rejectReason = useMemo(
    () => (user && status === "rejected" ? getRejectReason(user.username, "registry") : undefined),
    [user, status],
  );

  if (!user) return null;

  const set = <K extends keyof RegistryApplyForm>(key: K, value: RegistryApplyForm[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const validate = () => {
    if (!form.orgName.trim()) return "请输入机构名称";
    if (!form.orgPinyin.trim()) return "请输入机构名称中文拼音";
    if (!form.orgCode.trim()) return "请输入组织机构代码";
    if (!form.orgAddress.trim()) return "请输入机构地址";
    if (!form.inviteCode.trim()) return "请输入邀请码";
    if (!form.cooperationField.trim()) return "请输入合作领域";
    if (!form.contractStart) return "请选择合同开始日期";
    if (!form.contractEnd) return "请选择合同结束日期";
    if (form.contractEnd < form.contractStart) return "合同结束日期不能早于开始日期";
    if (!form.contractFileName.trim()) return "请上传合同附件";
    if (!form.contactName.trim()) return "请输入联系人";
    if (!/^1\d{10}$/.test(form.contactPhone)) return "请输入正确的手机号码";
    return null;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmitApplication(status)) return;
    const err = validate();
    if (err) {
      showToast(err);
      return;
    }
    setBusy(true);
    saveRegistryForm(user.username, form);
    pushApplyHistory(user.username, {
      kind: "registry",
      submittedAt: new Date().toISOString(),
      status: "pending",
      summary: form.orgName,
    });
    updateServiceStatus("registry", "pending");
    setBusy(false);
    showToast(status === "rejected" ? "已重新提交，进入审核中" : "申请已提交，进入审核中");
  };

  const onWithdraw = () => {
    if (!canWithdrawApplication(status)) return;
    setBusy(true);
    markHistoryWithdrawn(user.username, "registry");
    updateServiceStatus("registry", "none");
    setBusy(false);
    showToast("本次申请已撤回，状态回到未提交");
  };

  const onFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("请上传 PDF 格式合同文件");
      return;
    }
    set("contractFileName", file.name);
  };

  return (
    <div className="d-account__card d-apply">
      <div className="d-account__card-head">
        <div className="d-account__card-title">
          <ApplyBackLink />
          <span>申请成为 DCI 注册中心</span>
        </div>
        <button type="button" className="d-account__action" onClick={() => setHistoryOpen(true)}>
          <IconHistory /> 历史申请记录
        </button>
      </div>

      <div className="d-account__card-body">
        <ApplyStatusBanner
          status={status}
          kind="registry"
          rejectReason={rejectReason}
        />

        {status === "approved" ? (
          <div className="d-apply__approved-actions">
            <Link href="/dashboard/" className="d-btn">
              进入 DCI 注册中心工作台
            </Link>
            <Link href="/account/services/" className="d-btn d-btn--ghost">
              返回开通管理
            </Link>
          </div>
        ) : (
          <form className="d-apply__form" onSubmit={onSubmit}>
            <ApplySection title="基本信息">
              <ApplyField label="机构名称" required>
                <input value={form.orgName} disabled={readOnly} onChange={(e) => set("orgName", e.target.value)} placeholder="请输入机构名称" />
              </ApplyField>
              <ApplyField label="机构名称中文拼音" required>
                <input value={form.orgPinyin} disabled={readOnly} onChange={(e) => set("orgPinyin", e.target.value)} placeholder="请输入机构名称中文拼音" />
              </ApplyField>
              <ApplyField label="组织机构代码" required>
                <input
                  value={form.orgCode}
                  disabled={readOnly}
                  maxLength={50}
                  onChange={(e) => set("orgCode", e.target.value.slice(0, 50))}
                  placeholder="请输入组织机构代码"
                />
              </ApplyField>
              <ApplyField label="机构地址" required>
                <input value={form.orgAddress} disabled={readOnly} onChange={(e) => set("orgAddress", e.target.value)} placeholder="请输入机构地址" />
              </ApplyField>
              <ApplyField label="邀请码" required>
                <input value={form.inviteCode} disabled={readOnly} onChange={(e) => set("inviteCode", e.target.value)} placeholder="请输入邀请码" />
              </ApplyField>
              <ApplyField label="DCI注册中心类型" required>
                <div className="d-apply__radios" role="radiogroup">
                  {(["内容平台", "专业服务"] as RegistryOrgType[]).map((t) => (
                    <label key={t} className="d-apply__radio">
                      <input type="radio" name="orgType" value={t} checked={form.orgType === t} disabled={readOnly} onChange={() => set("orgType", t)} />
                      <span>{t}</span>
                    </label>
                  ))}
                </div>
              </ApplyField>
              <ApplyField label="合作领域" required>
                <div className="d-apply__textarea-wrap">
                  <textarea
                    value={form.cooperationField}
                    disabled={readOnly}
                    maxLength={300}
                    rows={3}
                    onChange={(e) => set("cooperationField", e.target.value)}
                    placeholder="请输入合作领域，如电商领域、艺术领域等"
                  />
                  <span className="d-apply__counter">{form.cooperationField.length}/300</span>
                </div>
              </ApplyField>
              <ApplyField label="合同开始日期" required>
                <input type="date" value={form.contractStart} disabled={readOnly} onChange={(e) => set("contractStart", e.target.value)} />
              </ApplyField>
              <ApplyField label="合同结束日期" required>
                <input type="date" value={form.contractEnd} disabled={readOnly} onChange={(e) => set("contractEnd", e.target.value)} />
              </ApplyField>
              <ApplyField label="合同附件" required>
                <div className="d-apply__file">
                  {form.contractFileName ? (
                    <div className="d-apply__file-chip">
                      <span>{form.contractFileName}</span>
                      {!readOnly ? (
                        <button type="button" onClick={() => set("contractFileName", "")}>
                          移除
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <label className="d-apply__file-pick">
                      <input type="file" accept="application/pdf,.pdf" disabled={readOnly} onChange={(e) => onFile(e.target.files?.[0] || null)} />
                      <span>选择 PDF 合同文件</span>
                    </label>
                  )}
                  <p className="d-apply__hint">请上传 PDF 格式合同文件</p>
                </div>
              </ApplyField>
            </ApplySection>

            <ApplySection title="联系人信息">
              <ApplyField label="联系人" required>
                <input value={form.contactName} disabled={readOnly} onChange={(e) => set("contactName", e.target.value)} placeholder="请输入联系人姓名" />
              </ApplyField>
              <ApplyField label="手机号码" required>
                <input
                  value={form.contactPhone}
                  disabled={readOnly}
                  onChange={(e) => set("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="请输入手机号码"
                  inputMode="numeric"
                />
              </ApplyField>
            </ApplySection>

            {status === "pending" ? (
              <ApplyWithdrawBar onWithdraw={onWithdraw} withdrawing={busy} />
            ) : null}

            {canSubmitApplication(status) ? (
              <button type="submit" className="d-btn d-apply__submit" disabled={busy}>
                {status === "rejected" ? "修改后重新提交" : "提交申请"}
              </button>
            ) : null}
          </form>
        )}
      </div>

      {toast ? (
        <div className="d-account__toast" role="status">
          {toast}
        </div>
      ) : null}

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        username={user.username}
        kind="registry"
        title="历史申请记录"
      />
    </div>
  );
}

export function TechApplyPanel() {
  const { user, updateServiceStatus } = useAuth();
  const status = user?.techStatus ?? "none";
  const readOnly = status === "pending" || status === "approved";
  const [form, setForm] = useState<TechApplyForm>(() => ({ ...loadTechForm("") }));
  const [toast, setToast] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setForm(loadTechForm(user.username));
  }, [user]);

  const rejectReason = useMemo(
    () => (user && status === "rejected" ? getRejectReason(user.username, "tech") : undefined),
    [user, status],
  );

  if (!user) return null;

  const set = <K extends keyof TechApplyForm>(key: K, value: TechApplyForm[K]) =>
    setForm((s) => ({ ...s, [key]: value }));

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2600);
  };

  const validate = () => {
    if (!form.companyName.trim()) return "请输入机构名称";
    if (!form.orgCode.trim()) return "请输入组织机构代码";
    if (!form.companyAddress.trim()) return "请输入联系地址";
    if (!form.inviteCode.trim()) return "请输入邀请码";
    if (!form.cooperationField.trim()) return "请输入合作领域";
    if (!form.contractStart) return "请选择合同开始日期";
    if (!form.contractEnd) return "请选择合同结束日期";
    if (form.contractEnd < form.contractStart) return "合同结束日期不能早于开始日期";
    if (!form.contractFileName.trim()) return "请上传合同附件";
    if (!form.contactName.trim()) return "请输入联系人姓名";
    if (!/^1\d{10}$/.test(form.contactPhone)) return "请输入正确的联系人电话";
    return null;
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!canSubmitApplication(status)) return;
    const err = validate();
    if (err) {
      showToast(err);
      return;
    }
    setBusy(true);
    saveTechForm(user.username, form);
    pushApplyHistory(user.username, {
      kind: "tech",
      submittedAt: new Date().toISOString(),
      status: "pending",
      summary: form.companyName,
    });
    updateServiceStatus("tech", "pending");
    setBusy(false);
    showToast(status === "rejected" ? "已重新提交，进入审核中" : "申请已提交，进入审核中");
  };

  const onWithdraw = () => {
    if (!canWithdrawApplication(status)) return;
    setBusy(true);
    markHistoryWithdrawn(user.username, "tech");
    updateServiceStatus("tech", "none");
    setBusy(false);
    showToast("本次申请已撤回，状态回到未提交");
  };

  const onFile = (file: File | null) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      showToast("请上传 PDF 格式合同文件");
      return;
    }
    set("contractFileName", file.name);
  };

  return (
    <div className="d-account__card d-apply">
      <div className="d-account__card-head">
        <div className="d-account__card-title">
          <ApplyBackLink />
          <span>申请接入技术服务中心</span>
        </div>
        <button type="button" className="d-account__action" onClick={() => setHistoryOpen(true)}>
          <IconHistory /> 历史申请记录
        </button>
      </div>

      <div className="d-account__card-body">
        <ApplyStatusBanner
          status={status}
          kind="tech"
          rejectReason={rejectReason}
        />

        {status === "approved" ? (
          <div className="d-apply__approved-actions">
            <a href={CUSTOMER_CONSOLE_URL} target="_blank" rel="noopener noreferrer" className="d-btn">
              进入 DCI®技术服务中心工作台
            </a>
            <Link href="/account/services/" className="d-btn d-btn--ghost">
              返回开通管理
            </Link>
          </div>
        ) : (
          <form className="d-apply__form" onSubmit={onSubmit}>
            <ApplySection title="基本信息">
              <ApplyField label="机构名称" required>
                <input value={form.companyName} disabled={readOnly} onChange={(e) => set("companyName", e.target.value)} placeholder="请输入机构名称" />
              </ApplyField>
              <ApplyField label="组织机构代码" required>
                <input
                  value={form.orgCode}
                  disabled={readOnly}
                  maxLength={50}
                  onChange={(e) => set("orgCode", e.target.value.slice(0, 50))}
                  placeholder="请输入组织机构代码"
                />
              </ApplyField>
              <ApplyField label="联系地址" required>
                <input
                  value={form.companyAddress}
                  disabled={readOnly}
                  onChange={(e) => set("companyAddress", e.target.value)}
                  placeholder="请输入联系地址"
                />
              </ApplyField>
              <ApplyField label="邀请码" required>
                <input value={form.inviteCode} disabled={readOnly} onChange={(e) => set("inviteCode", e.target.value)} placeholder="请输入邀请码" />
              </ApplyField>
              <ApplyField label="合作领域" required>
                <div className="d-apply__textarea-wrap">
                  <textarea
                    value={form.cooperationField}
                    disabled={readOnly}
                    maxLength={300}
                    rows={3}
                    onChange={(e) => set("cooperationField", e.target.value)}
                    placeholder="请输入合作领域，如电商领域、艺术领域等"
                  />
                  <span className="d-apply__counter">{form.cooperationField.length}/300</span>
                </div>
              </ApplyField>
              <ApplyField label="合同开始日期" required>
                <input type="date" value={form.contractStart} disabled={readOnly} onChange={(e) => set("contractStart", e.target.value)} />
              </ApplyField>
              <ApplyField label="合同结束日期" required>
                <input type="date" value={form.contractEnd} disabled={readOnly} onChange={(e) => set("contractEnd", e.target.value)} />
              </ApplyField>
              <ApplyField label="合同附件" required>
                <div className="d-apply__file">
                  {form.contractFileName ? (
                    <div className="d-apply__file-chip">
                      <span>{form.contractFileName}</span>
                      {!readOnly ? (
                        <button type="button" onClick={() => set("contractFileName", "")}>
                          移除
                        </button>
                      ) : null}
                    </div>
                  ) : (
                    <label className="d-apply__file-pick">
                      <input type="file" accept="application/pdf,.pdf" disabled={readOnly} onChange={(e) => onFile(e.target.files?.[0] || null)} />
                      <span>选择 PDF 合同文件</span>
                    </label>
                  )}
                  <p className="d-apply__hint">请上传 PDF 格式合同文件</p>
                </div>
              </ApplyField>
            </ApplySection>

            <ApplySection title="联系人信息">
              <ApplyField label="联系人姓名" required>
                <input value={form.contactName} disabled={readOnly} onChange={(e) => set("contactName", e.target.value)} placeholder="请输入联系人姓名" />
              </ApplyField>
              <ApplyField label="联系人电话" required>
                <input
                  value={form.contactPhone}
                  disabled={readOnly}
                  onChange={(e) => set("contactPhone", e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="请输入联系人电话"
                  inputMode="numeric"
                />
              </ApplyField>
            </ApplySection>

            {status === "pending" ? (
              <ApplyWithdrawBar onWithdraw={onWithdraw} withdrawing={busy} />
            ) : null}

            {canSubmitApplication(status) ? (
              <button type="submit" className="d-btn d-apply__submit" disabled={busy}>
                {status === "rejected" ? "修改后重新提交" : "提交申请"}
              </button>
            ) : null}
          </form>
        )}
      </div>

      {toast ? (
        <div className="d-account__toast" role="status">
          {toast}
        </div>
      ) : null}

      <HistoryModal
        open={historyOpen}
        onClose={() => setHistoryOpen(false)}
        username={user.username}
        kind="tech"
        title="历史申请记录"
      />
    </div>
  );
}
