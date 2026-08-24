import { useEffect, useMemo, useState } from "react";
import {
  PRODUCTS,
  type CustomerAccount,
  type ProductCode,
  type QuotaType,
} from "@/lib/catalog";

export type ServiceCreateInput = {
  customerId: string;
  product: ProductCode;
  quotaType: QuotaType;
  quotaTotal: number | null;
  startDate: string;
  endDate: string;
};

type Props = {
  open: boolean;
  customers: CustomerAccount[];
  onCancel: () => void;
  onSave: (input: ServiceCreateInput) => string | null;
};

const EMPTY = {
  customerId: "",
  product: "" as ProductCode | "",
  quotaType: "total" as QuotaType,
  quotaTotal: "",
  startDate: "",
  endDate: "",
};

export function AddServiceDialog({ open, customers, onCancel, onSave }: Props) {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError(null);
  }, [open]);

  const customer = useMemo(
    () => customers.find((c) => c.id === form.customerId) ?? null,
    [customers, form.customerId],
  );

  const productOptions = useMemo(() => {
    if (!customer) return PRODUCTS;
    const used = new Set(customer.productServices.map((s) => s.product));
    return PRODUCTS.filter((p) => !used.has(p.code));
  }, [customer]);

  if (!open) return null;

  const submit = () => {
    if (!form.customerId) {
      setError("请选择客户账号");
      return;
    }
    if (!form.product) {
      setError("请选择产品");
      return;
    }
    if (!form.startDate || !form.endDate) {
      setError("请填写产品有效期");
      return;
    }
    if (form.startDate > form.endDate) {
      setError("有效期开始不能晚于结束");
      return;
    }

    let quotaTotal: number | null = null;
    if (form.quotaType === "total") {
      const n = Number(form.quotaTotal);
      if (!Number.isInteger(n) || n <= 0) {
        setError("按总量时，额度须为正整数");
        return;
      }
      quotaTotal = n;
    }

    const err = onSave({
      customerId: form.customerId,
      product: form.product,
      quotaType: form.quotaType,
      quotaTotal,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    if (err) setError(err);
  };

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="a-modal a-modal--md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-service-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="add-service-title" className="a-modal__title">
          新增产品服务
        </h3>
        <p className="a-modal__desc">
          为已有客户账号开通产品。开通后不可移除，仅可编辑额度 / 有效期或启停。
        </p>

        <div className="a-form a-form--modal a-form--stack">
          <div className="a-field a-field--stack">
            <span className="a-field__label">
              客户账号 <span className="a-req">*</span>
            </span>
            <select
              className="a-select"
              value={form.customerId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  customerId: e.target.value,
                  product: "",
                  startDate: "",
                  endDate: "",
                }))
              }
            >
              <option value="">请选择账号</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.account} · {c.companyName}
                </option>
              ))}
            </select>
          </div>

          {customer ? (
            <div className="a-field__hint">
              信用代码 {customer.creditCode} · 合作期 {customer.contractStart} ~{" "}
              {customer.contractEnd}
            </div>
          ) : null}

          <div className="a-field a-field--stack">
            <span className="a-field__label">
              产品 <span className="a-req">*</span>
            </span>
            <select
              className="a-select"
              value={form.product}
              disabled={!form.customerId}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  product: e.target.value as ProductCode | "",
                  startDate: p.startDate || customer?.contractStart || "",
                  endDate: p.endDate || customer?.contractEnd || "",
                }))
              }
            >
              <option value="">请选择产品</option>
              {productOptions.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
            {form.customerId && productOptions.length === 0 ? (
              <div className="a-field__hint">该账号已开通全部产品</div>
            ) : null}
          </div>

          <div className="a-field a-field--stack">
            <span className="a-field__label">额度</span>
            <div className="a-inline-actions" style={{ flexWrap: "wrap" }}>
              <label className="a-radio">
                <input
                  type="radio"
                  name="addQuotaType"
                  checked={form.quotaType === "unlimited"}
                  onChange={() => setForm((p) => ({ ...p, quotaType: "unlimited" }))}
                />
                不限量
              </label>
              <label className="a-radio">
                <input
                  type="radio"
                  name="addQuotaType"
                  checked={form.quotaType === "total"}
                  onChange={() => setForm((p) => ({ ...p, quotaType: "total" }))}
                />
                合作期内总量
              </label>
              {form.quotaType === "total" ? (
                <input
                  className="a-input a-input--sm"
                  style={{ minWidth: 120 }}
                  inputMode="numeric"
                  placeholder="次数"
                  value={form.quotaTotal}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      quotaTotal: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="a-field a-field--stack">
            <span className="a-field__label">
              产品有效期 <span className="a-req">*</span>
            </span>
            <div className="a-date-range">
              <input
                type="date"
                className="a-input"
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            </div>
          </div>
        </div>

        {error ? <div className="a-form-error">{error}</div> : null}

        <div className="a-modal__actions">
          <button type="button" className="a-btn" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={submit}>
            开通
          </button>
        </div>
      </div>
    </div>
  );
}
