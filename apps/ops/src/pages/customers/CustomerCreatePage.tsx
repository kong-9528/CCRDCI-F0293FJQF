import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductServicesEditor } from "@/components/ProductServicesEditor";
import { CUSTOMER_TYPE_LABEL, generateStrongPassword } from "@/lib/catalog";
import {
  emptyCustomerForm,
  formToCustomerPayload,
  validateCustomerForm,
  type CustomerFormState,
} from "@/lib/customerForm";
import { useCustomerStore } from "@/lib/customersStore";

export function CustomerCreatePage() {
  const navigate = useNavigate();
  const { create, isAccountTaken } = useCustomerStore();
  const [form, setForm] = useState<CustomerFormState>(() => emptyCustomerForm());
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmGenPassword, setConfirmGenPassword] = useState(false);

  const set = <K extends keyof CustomerFormState>(key: K, value: CustomerFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const syncProductRangeFromContract = () => {
    setForm((prev) => ({
      ...prev,
      productServices: prev.productServices.map((row) => ({
        ...row,
        startDate: row.startDate || prev.contractStart,
        endDate: row.endDate || prev.contractEnd,
      })),
    }));
  };

  const onFiles = (fileList: FileList | null) => {
    if (!fileList?.length) return;
    const added = Array.from(fileList).map((f, i) => ({
      id: `up-${Date.now()}-${i}`,
      name: f.name,
      size: f.size,
    }));
    setForm((prev) => ({
      ...prev,
      contractFiles: [...prev.contractFiles, ...added],
    }));
  };

  const submit = () => {
    const err = validateCustomerForm(form, "create", {
      accountTaken: isAccountTaken(form.account),
    });
    if (err) {
      setError(err);
      return;
    }
    setError(null);
    const payload = formToCustomerPayload(form);
    const row = create(payload);
    navigate(`/customers/${row.id}`);
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          新增客户账号
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
                <select className="a-select" value="enterprise" disabled>
                  <option value="enterprise">{CUSTOMER_TYPE_LABEL.enterprise}</option>
                </select>
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  机构名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  style={{ minWidth: 240 }}
                  value={form.companyName}
                  onChange={(e) => set("companyName", e.target.value)}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">统一社会信用代码</span>
                <input
                  className="a-input"
                  value={form.creditCode}
                  onChange={(e) => set("creditCode", e.target.value)}
                  placeholder="选填，企业请填写"
                />
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
            <h3 className="a-form-section__title">合作信息</h3>
            <div className="a-form a-form--grid">
              <div className="a-field">
                <span className="a-field__label">
                  合同编号 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  maxLength={200}
                  placeholder="请输入合同编号"
                  value={form.contractNo}
                  onChange={(e) => set("contractNo", e.target.value.slice(0, 200))}
                />
              </div>
              <div className="a-field a-field--wide">
                <span className="a-field__label">合同文件</span>
                <div className="a-upload-list">
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf,.zip"
                    onChange={(e) => {
                      onFiles(e.target.files);
                      e.target.value = "";
                    }}
                  />
                  {form.contractFiles.length ? (
                    <ul className="a-file-list">
                      {form.contractFiles.map((f) => (
                        <li key={f.id}>
                          <span>{f.name}</span>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() =>
                              set(
                                "contractFiles",
                                form.contractFiles.filter((x) => x.id !== f.id),
                              )
                            }
                          >
                            移除
                          </button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="a-field__hint">支持多文件（图片 / PDF 等）</span>
                  )}
                </div>
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  合作起止日期 <span className="a-req">*</span>
                </span>
                <div className="a-date-range">
                  <input
                    type="date"
                    className="a-input"
                    value={form.contractStart}
                    onChange={(e) => set("contractStart", e.target.value)}
                    onBlur={syncProductRangeFromContract}
                  />
                  <span>至</span>
                  <input
                    type="date"
                    className="a-input"
                    value={form.contractEnd}
                    onChange={(e) => set("contractEnd", e.target.value)}
                    onBlur={syncProductRangeFromContract}
                  />
                </div>
              </div>
              <div className="a-field">
                <span className="a-field__label">合同总金额（元）</span>
                <input
                  className="a-input"
                  inputMode="decimal"
                  value={form.contractAmount}
                  onChange={(e) => set("contractAmount", e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">账号信息</h3>
            <div className="a-form a-form--grid">
              <div className="a-field">
                <span className="a-field__label">
                  账号 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  placeholder="字母开头，6–20 位"
                  value={form.account}
                  onChange={(e) => set("account", e.target.value)}
                />
              </div>
              <div className="a-field a-field--wide">
                <span className="a-field__label">
                  密码 <span className="a-req">*</span>
                </span>
                <div className="a-inline-actions">
                  <input
                    className="a-input"
                    style={{ minWidth: 220 }}
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
                    onClick={async () => {
                      await navigator.clipboard.writeText(form.password);
                      setCopied(true);
                      window.setTimeout(() => setCopied(false), 1600);
                    }}
                  >
                    {copied ? "已复制" : "复制"}
                  </button>
                </div>
                <div className="a-field__hint">
                  须含大写 / 小写 / 数字 / 特殊符{"{!_@#}"} 中至少 3 种
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
                startDate: form.contractStart,
                endDate: form.contractEnd,
              }}
              showUsed={false}
            />
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn" onClick={() => navigate("/customers")}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              创建（默认已启用）
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
