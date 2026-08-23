import { useEffect, useState } from "react";
import {
  CUSTOMER_TYPE_LABEL,
  productName,
  type CustomerAccount,
  type ProductServiceConfig,
  type QuotaType,
} from "@/lib/catalog";

export type ServiceEditPatch = {
  quotaType: QuotaType;
  quotaTotal: number | null;
  startDate: string;
  endDate: string;
};

type Props = {
  open: boolean;
  customer: CustomerAccount | null;
  service: ProductServiceConfig | null;
  onCancel: () => void;
  onSave: (patch: ServiceEditPatch) => string | null;
};

export function EditServiceDialog({
  open,
  customer,
  service,
  onCancel,
  onSave,
}: Props) {
  const [quotaType, setQuotaType] = useState<QuotaType>("total");
  const [quotaTotal, setQuotaTotal] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !service) return;
    setQuotaType(service.quotaType);
    setQuotaTotal(service.quotaTotal == null ? "" : String(service.quotaTotal));
    setStartDate(service.startDate);
    setEndDate(service.endDate);
    setError(null);
  }, [open, service]);

  if (!open || !customer || !service) return null;

  const submit = () => {
    if (!startDate || !endDate) {
      setError("请填写产品有效期");
      return;
    }
    if (startDate > endDate) {
      setError("有效期开始不能晚于结束");
      return;
    }

    let total: number | null = null;
    if (quotaType === "total") {
      const n = Number(quotaTotal);
      if (!Number.isInteger(n) || n <= 0) {
        setError("按总量时，额度须为正整数");
        return;
      }
      if (n < service.usedCount) {
        setError(`新额度不能小于已用次数 ${service.usedCount}`);
        return;
      }
      total = n;
    }

    const err = onSave({
      quotaType,
      quotaTotal: total,
      startDate,
      endDate,
    });
    if (err) setError(err);
  };

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="a-modal a-modal--md"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-service-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="edit-service-title" className="a-modal__title">
          编辑服务项
        </h3>

        <div className="a-desc a-desc--modal">
          <div className="a-desc__item">
            <span className="a-desc__label">账号</span>
            <span className="a-desc__value">
              <code>{customer.account}</code>
            </span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">公司全称</span>
            <span className="a-desc__value">{customer.companyName}</span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">统一社会信用代码</span>
            <span className="a-desc__value">{customer.creditCode}</span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">客户类型</span>
            <span className="a-desc__value">
              {CUSTOMER_TYPE_LABEL[customer.customerType]}
            </span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">联系人</span>
            <span className="a-desc__value">
              {customer.contactName} / {customer.contactPhone}
            </span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">产品</span>
            <span className="a-desc__value">{productName(service.product)}</span>
          </div>
          <div className="a-desc__item">
            <span className="a-desc__label">已用次数</span>
            <span className="a-desc__value">{service.usedCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="a-form a-form--modal a-form--stack">
          <div className="a-field a-field--stack">
            <span className="a-field__label">额度</span>
            <div className="a-inline-actions" style={{ flexWrap: "wrap" }}>
              <label className="a-radio">
                <input
                  type="radio"
                  name="quotaType"
                  checked={quotaType === "unlimited"}
                  onChange={() => setQuotaType("unlimited")}
                />
                不限量
              </label>
              <label className="a-radio">
                <input
                  type="radio"
                  name="quotaType"
                  checked={quotaType === "total"}
                  onChange={() => setQuotaType("total")}
                />
                合作期内总量
              </label>
              {quotaType === "total" ? (
                <input
                  className="a-input a-input--sm"
                  style={{ minWidth: 120 }}
                  inputMode="numeric"
                  placeholder="次数"
                  value={quotaTotal}
                  onChange={(e) => setQuotaTotal(e.target.value.replace(/\D/g, ""))}
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
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <span>至</span>
              <input
                type="date"
                className="a-input"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="a-field__hint">
            额度仅在产品有效期内可消耗；过期后次数不清零，但不可再调用。
          </div>
        </div>

        {error ? <div className="a-form-error">{error}</div> : null}

        <div className="a-modal__actions">
          <button type="button" className="a-btn" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="a-btn a-btn--primary" onClick={submit}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
