import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  EXTERNAL_LOGIN_ACCOUNT,
  applicationToForm,
  emptyOnboardingForm,
  type OnboardingFormInput,
  useOnboardingStore,
} from "@/lib/onboardingStore";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="a-field a-field--stack">
      <label className="a-field__label">
        {label}
        {required ? <span className="a-req"> *</span> : null}
      </label>
      {children}
    </div>
  );
}

export function ApplyOnboardingPage() {
  const {
    accessStatus,
    application,
    unlocked,
    submitOnboardingApplication,
    withdrawOnboardingApplication,
    demoApproveOnboarding,
    demoRejectOnboarding,
    demoResetOnboarding,
    demoSetApproved,
  } = useOnboardingStore();

  const [form, setForm] = useState<OnboardingFormInput>(() => emptyOnboardingForm());
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const editing = accessStatus === "unsubmitted" || accessStatus === "rejected";
  const pending = accessStatus === "pending";

  useEffect(() => {
    if ((accessStatus === "rejected" || accessStatus === "unsubmitted") && application) {
      setForm(applicationToForm(application));
    } else if (accessStatus === "unsubmitted") {
      setForm(emptyOnboardingForm());
    }
    setError(null);
  }, [accessStatus, application]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const set = <K extends keyof OnboardingFormInput>(key: K, value: OnboardingFormInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const next = [...form.contractFiles];
    for (const file of Array.from(list)) {
      next.push({
        id: `f-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
      form.contractFiles.filter((f) => f.id !== id),
    );
  };

  const onSubmit = () => {
    const res = submitOnboardingApplication(form);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    setError(null);
    showToast("申请已提交，请等待运营审核");
  };

  const onWithdraw = () => {
    const res = withdrawOnboardingApplication();
    setWithdrawOpen(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    showToast("已撤回申请，资料已保留，可修改后重新提交");
  };

  const statusBanner = useMemo(() => {
    if (pending) {
      return {
        tone: "wn" as const,
        title: "申请审核中",
        desc: `已于 ${application?.submittedAt ?? "—"} 提交，运营审核通过前仅可查看本页。如需修改资料，请先撤回申请。`,
      };
    }
    if (accessStatus === "rejected") {
      return {
        tone: "err" as const,
        title: "申请未通过",
        desc: application?.rejectReason || "未填写拒绝原因，请修改资料后重新提交。",
      };
    }
    if (application?.status === "draft" || (accessStatus === "unsubmitted" && application)) {
      return {
        tone: "info" as const,
        title: "待提交申请",
        desc: "申请已撤回或尚未提交。以下资料与附件已为您保留，确认无误后可再次提交。",
      };
    }
    return {
      tone: "info" as const,
      title: "开通平台服务",
      desc: "您已通过DCI®管理中心注册账号，请填写企业与合同信息并提交入驻申请。",
    };
  }, [accessStatus, pending, application]);

  if (unlocked) {
    return <Navigate to="/desk" replace />;
  }

  const viewApp = pending ? application : null;

  return (
    <div className="a-page a-apply">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-page__head">
        <div>
          <h1 className="a-page__title">平台入驻申请</h1>
          <p className="a-page__desc">登录账号：{EXTERNAL_LOGIN_ACCOUNT}</p>
        </div>
      </div>

      <div className={`a-apply__banner a-apply__banner--${statusBanner.tone}`}>
        <strong>{statusBanner.title}</strong>
        <p>{statusBanner.desc}</p>
      </div>

      {viewApp ? (
        <div className="a-stack">
          <section className="a-form-section">
            <h3 className="a-form-section__title">机构/企业信息</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">机构/企业名称</span>
                <span className="a-desc__value">{viewApp.companyName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">统一社会信用代码</span>
                <span className="a-desc__value">{viewApp.creditCode || "—"}</span>
              </div>
              <div className="a-desc__item a-desc__item--wide">
                <span className="a-desc__label">机构/企业地址</span>
                <span className="a-desc__value">{viewApp.address || "—"}</span>
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">联系信息</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">联系人姓名</span>
                <span className="a-desc__value">{viewApp.contactName}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">联系人手机号</span>
                <span className="a-desc__value">{viewApp.contactPhone}</span>
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">合同信息</h3>
            <div className="a-desc">
              <div className="a-desc__item">
                <span className="a-desc__label">合同编号</span>
                <span className="a-desc__value">{viewApp.contractNo}</span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">合作起止</span>
                <span className="a-desc__value">
                  {viewApp.contractStart} ~ {viewApp.contractEnd}
                </span>
              </div>
              <div className="a-desc__item">
                <span className="a-desc__label">合同总金额</span>
                <span className="a-desc__value">
                  {viewApp.contractAmount == null
                    ? "—"
                    : `¥ ${viewApp.contractAmount.toLocaleString("zh-CN")}`}
                </span>
              </div>
              <div className="a-desc__item a-desc__item--wide">
                <span className="a-desc__label">合同附件</span>
                <span className="a-desc__value">
                  {viewApp.contractFiles.length === 0
                    ? "—"
                    : viewApp.contractFiles.map((f) => f.name).join("、")}
                </span>
              </div>
            </div>
          </section>

          <div className="a-inline-actions">
            <button type="button" className="a-btn a-btn--ghost" onClick={() => setWithdrawOpen(true)}>
              撤回申请
            </button>
          </div>
        </div>
      ) : null}

      {editing ? (
        <div className="a-stack">
          <section className="a-form-section">
            <h3 className="a-form-section__title">机构/企业信息</h3>
            <div className="a-form-grid">
              <Field label="机构/企业名称" required>
                <input
                  className="a-input"
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                  placeholder="请输入机构/企业名称"
                />
              </Field>
              <Field label="统一社会信用代码">
                <input
                  className="a-input"
                  value={form.creditCode}
                  onChange={(e) => set("creditCode", e.target.value)}
                  placeholder="选填，企业请填写"
                />
              </Field>
              <Field label="机构/企业地址" required>
                <input
                  className="a-input"
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                  placeholder="请输入机构/企业地址"
                />
              </Field>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">联系信息</h3>
            <div className="a-form-grid">
              <Field label="联系人姓名" required>
                <input
                  className="a-input"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                />
              </Field>
              <Field label="联系人手机号" required>
                <input
                  className="a-input"
                  inputMode="tel"
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                  placeholder="用于登录与短信验证"
                />
              </Field>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">合同信息</h3>
            <div className="a-form-grid">
              <Field label="合同编号" required>
                <input
                  className="a-input"
                  value={form.contractNo}
                  onChange={(e) => set("contractNo", e.target.value)}
                />
              </Field>
              <Field label="合同总金额（元）">
                <input
                  className="a-input"
                  value={form.contractAmount}
                  onChange={(e) => set("contractAmount", e.target.value)}
                  placeholder="选填"
                />
              </Field>
              <Field label="合同开始日期" required>
                <input
                  className="a-input"
                  type="date"
                  value={form.contractStart}
                  onChange={(e) => set("contractStart", e.target.value)}
                />
              </Field>
              <Field label="合同结束日期" required>
                <input
                  className="a-input"
                  type="date"
                  value={form.contractEnd}
                  onChange={(e) => set("contractEnd", e.target.value)}
                />
              </Field>
              <div className="a-field a-field--stack a-form-grid__full">
                <label className="a-field__label">
                  合同附件<span className="a-req"> *</span>
                </label>
                <div className="a-upload">
                  <input
                    ref={fileRef}
                    type="file"
                    multiple
                    onChange={(e) => onPickFiles(e.target.files)}
                  />
                </div>
                {form.contractFiles.length > 0 ? (
                  <ul className="a-apply__files">
                    {form.contractFiles.map((f) => (
                      <li key={f.id}>
                        <span>
                          {f.name}（{formatSize(f.size)}）
                        </span>
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() => removeFile(f.id)}
                        >
                          移除
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-inline-actions">
            <button type="button" className="a-btn a-btn--primary" onClick={onSubmit}>
              {accessStatus === "rejected" ? "重新提交申请" : "提交入驻申请"}
            </button>
          </div>
        </div>
      ) : null}

      <section className="a-form-section a-apply__demo">
        <h3 className="a-form-section__title">演示操作</h3>
        <p className="a-muted">本地联调：模拟运营审核结果，或恢复完整控制台。</p>
        <div className="a-inline-actions">
          {pending ? (
            <>
              <button type="button" className="a-btn a-btn--primary" onClick={demoApproveOnboarding}>
                模拟审核通过
              </button>
              <button type="button" className="a-btn" onClick={() => demoRejectOnboarding()}>
                模拟驳回
              </button>
            </>
          ) : null}
          <button type="button" className="a-btn a-btn--ghost" onClick={demoResetOnboarding}>
            重置为未提交
          </button>
          <button type="button" className="a-btn a-btn--ghost" onClick={demoSetApproved}>
            直接开通控制台
          </button>
        </div>
      </section>

      <ConfirmDialog
        open={withdrawOpen}
        title="撤回入驻申请"
        description="撤回后申请将回到待提交状态，已填写的资料与合同附件会保留，您可修改后再提交。确定撤回吗？"
        confirmText="撤回申请"
        danger
        onCancel={() => setWithdrawOpen(false)}
        onConfirm={onWithdraw}
      />
    </div>
  );
}
