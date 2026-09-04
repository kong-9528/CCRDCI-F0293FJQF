import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductServicesEditor } from "@/components/ProductServicesEditor";
import {
  CUSTOMER_TYPE_LABEL,
  generateStrongPassword,
} from "@/lib/catalog";
import {
  customerToForm,
  diffCustomer,
  formToCustomerPayload,
  validateCustomerForm,
  type CustomerFormState,
} from "@/lib/customerForm";
import { useCustomerStore } from "@/lib/customersStore";

export function CustomerEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const { getById, update } = useCustomerStore();
  const original = getById(id);

  const [form, setForm] = useState<CustomerFormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmGenPassword, setConfirmGenPassword] = useState(false);

  useEffect(() => {
    if (original) setForm(customerToForm(original));
  }, [original]);

  if (!original || !form) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑客户</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该客户账号</div>
        </div>
      </div>
    );
  }

  const set = <K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const submit = () => {
    const err = validateCustomerForm(form, "edit");
    if (err) {
      setError(err);
      return;
    }
    const payload = formToCustomerPayload(form, original);
    const next = {
      ...original,
      ...payload,
      account: original.account,
      creditCode: original.creditCode,
      companyName: original.companyName,
      customerType: original.customerType,
      status: original.status,
      createdAt: original.createdAt,
    };
    // 编辑页：信用代码/机构名称/账号/合同信息只读；合同请在合同管理页维护
    next.contactName = form.contactName.trim();
    next.contactPhone = form.contactPhone.replace(/[\s-]/g, "").trim();
    next.address = form.address.trim();
    next.productServices = payload.productServices;
    if (form.password) next.passwordHint = form.password;

    const changes = diffCustomer(original, next);
    if (!changes.length) {
      setError("未检测到字段变更");
      return;
    }
    setError(null);
    const hasService = changes.some((c) => c.field.startsWith("产品·"));
    update(
      id,
      next,
      changes,
      hasService ? "service" : "edit",
      hasService ? "调整产品服务配置" : "编辑客户信息",
    );
    navigate(`/customers/${id}`);
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          编辑客户 · {original.account}
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate(-1)}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <section className="a-form-section">
            <h3 className="a-form-section__title">客户信息</h3>
            <div className="a-form a-form--grid">
              <div className="a-field">
                <span className="a-field__label">客户类型</span>
                <input
                  className="a-input"
                  value={CUSTOMER_TYPE_LABEL[original.customerType]}
                  disabled
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">机构名称</span>
                <input
                  className="a-input"
                  style={{ minWidth: 240 }}
                  value={form.companyName}
                  disabled
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">统一社会信用代码</span>
                <input className="a-input" value={form.creditCode} disabled />
              </div>
              <div className="a-field a-field--wide">
                <span className="a-field__label">联系地址</span>
                <input
                  className="a-input"
                  style={{ minWidth: 360 }}
                  value={form.address}
                  onChange={(e) => set("address", e.target.value)}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  联系人姓名 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.contactName}
                  onChange={(e) => set("contactName", e.target.value)}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  联系人手机号 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  inputMode="tel"
                  value={form.contactPhone}
                  onChange={(e) => set("contactPhone", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">账号信息</h3>
            <div className="a-form a-form--grid">
              <div className="a-field">
                <span className="a-field__label">账号</span>
                <input className="a-input" value={form.account} disabled />
              </div>
              <div className="a-field a-field--wide">
                <span className="a-field__label">重置密码</span>
                <div className="a-inline-actions">
                  <input
                    className="a-input"
                    style={{ minWidth: 220 }}
                    placeholder="留空表示不修改"
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                  />
                  <button
                    type="button"
                    className="a-btn a-btn--sm"
                    onClick={() => setConfirmGenPassword(true)}
                  >
                    生成强密码
                  </button>
                  <button
                    type="button"
                    className="a-btn a-btn--sm"
                    disabled={!form.password}
                    onClick={async () => {
                      await navigator.clipboard.writeText(form.password);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    {copied ? "已复制" : "复制"}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">产品服务配置</h3>
            <ProductServicesEditor
              rows={form.productServices}
              onChange={(rows) => set("productServices", rows)}
              defaultRange={{
                startDate: original.contractStart,
                endDate: original.contractEnd,
              }}
              showStatus
              mode="edit"
            />
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button
              type="button"
              className="a-btn"
              onClick={() => navigate(`/customers/${id}`)}
            >
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              保存
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmGenPassword}
        title="确认生成强密码"
        description="生成后将覆盖当前密码。若密码已复制并告知客户，请勿误点；确认后需重新复制并通知客户。"
        confirmText="确认生成"
        danger
        onCancel={() => setConfirmGenPassword(false)}
        onConfirm={() => {
          set("password", generateStrongPassword());
          setCopied(false);
          setConfirmGenPassword(false);
        }}
      />
    </div>
  );
}
