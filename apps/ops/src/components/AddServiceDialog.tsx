import { useEffect, useMemo, useRef, useState } from "react";
import {
  CONFIGURABLE_PRODUCTS,
  normalizeProductCode,
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
  const [accountOpen, setAccountOpen] = useState(false);
  const [accountQuery, setAccountQuery] = useState("");
  const [productOpen, setProductOpen] = useState(false);
  const [productTip, setProductTip] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const productRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    setForm(EMPTY);
    setError(null);
    setAccountOpen(false);
    setAccountQuery("");
    setProductOpen(false);
    setProductTip(false);
  }, [open]);

  useEffect(() => {
    if (!accountOpen && !productOpen) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (accountOpen && !accountRef.current?.contains(t)) {
        setAccountOpen(false);
        setAccountQuery("");
      }
      if (productOpen && !productRef.current?.contains(t)) {
        setProductOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [accountOpen, productOpen]);

  useEffect(() => {
    if (accountOpen) {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [accountOpen]);

  const customer = useMemo(
    () => customers.find((c) => c.id === form.customerId) ?? null,
    [customers, form.customerId],
  );

  const openedProducts = useMemo(() => {
    if (!customer) return new Set<string>();
    return new Set(customer.productServices.map((s) => normalizeProductCode(s.product)));
  }, [customer]);

  const filteredAccounts = useMemo(() => {
    const q = accountQuery.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.account.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q),
    );
  }, [customers, accountQuery]);

  const selectedAccountLabel = customer
    ? `${customer.account} · ${customer.companyName}`
    : "";

  const selectedProductLabel = form.product
    ? (CONFIGURABLE_PRODUCTS.find((p) => p.code === form.product)?.name ?? form.product)
    : "";

  if (!open) return null;

  const pickAccount = (c: CustomerAccount) => {
    setForm((p) => ({
      ...p,
      customerId: c.id,
      product: "",
      startDate: c.contractStart || "",
      endDate: c.contractEnd || "",
    }));
    setAccountOpen(false);
    setAccountQuery("");
    setProductOpen(false);
    setProductTip(false);
    setError(null);
  };

  const pickProduct = (code: ProductCode) => {
    if (openedProducts.has(code)) return;
    setForm((p) => ({
      ...p,
      product: code,
      startDate: p.startDate || customer?.contractStart || "",
      endDate: p.endDate || customer?.contractEnd || "",
    }));
    setProductOpen(false);
    setError(null);
  };

  const toggleProduct = () => {
    if (!form.customerId) {
      setProductTip(true);
      setProductOpen(false);
      return;
    }
    setProductTip(false);
    setProductOpen((v) => !v);
  };

  const submit = () => {
    if (!form.customerId) {
      setError("请选择客户账号");
      return;
    }
    if (!form.product) {
      setError("请选择产品");
      return;
    }
    if (openedProducts.has(form.product)) {
      setError("该产品已开通，请选择其他产品");
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
            <div className="a-combobox" ref={accountRef}>
              <button
                type="button"
                className={`a-combobox__trigger${!selectedAccountLabel ? " is-placeholder" : ""}`}
                aria-expanded={accountOpen}
                aria-haspopup="listbox"
                onClick={() => {
                  setAccountOpen((v) => !v);
                  setProductOpen(false);
                  setAccountQuery("");
                }}
              >
                <span className="a-combobox__value">
                  {selectedAccountLabel || "请选择账号"}
                </span>
                <span className="a-combobox__caret" aria-hidden>
                  ▾
                </span>
              </button>
              {accountOpen ? (
                <div className="a-combobox__panel" role="listbox">
                  <div className="a-combobox__search">
                    <input
                      ref={searchRef}
                      className="a-input"
                      placeholder="输入账号或公司名称搜索"
                      value={accountQuery}
                      onChange={(e) => setAccountQuery(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <div className="a-combobox__list">
                    {filteredAccounts.length === 0 ? (
                      <div className="a-combobox__empty">无匹配账号</div>
                    ) : (
                      filteredAccounts.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          role="option"
                          className={`a-combobox__option${
                            c.id === form.customerId ? " is-selected" : ""
                          }`}
                          aria-selected={c.id === form.customerId}
                          onClick={() => pickAccount(c)}
                        >
                          <span className="a-combobox__option-main">{c.account}</span>
                          <span className="a-combobox__option-sub">{c.companyName}</span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              ) : null}
            </div>
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
            <div className="a-combobox" ref={productRef}>
              <button
                type="button"
                className={`a-combobox__trigger${!selectedProductLabel ? " is-placeholder" : ""}`}
                aria-expanded={productOpen}
                aria-haspopup="listbox"
                onClick={toggleProduct}
              >
                <span className="a-combobox__value">
                  {selectedProductLabel || "请选择产品"}
                </span>
                <span className="a-combobox__caret" aria-hidden>
                  ▾
                </span>
              </button>
              {productOpen && form.customerId ? (
                <div className="a-combobox__panel" role="listbox">
                  <div className="a-combobox__list">
                    {CONFIGURABLE_PRODUCTS.map((p) => {
                      const opened = openedProducts.has(p.code);
                      return (
                        <button
                          key={p.code}
                          type="button"
                          role="option"
                          disabled={opened}
                          className={`a-combobox__option${
                            p.code === form.product ? " is-selected" : ""
                          }${opened ? " is-disabled" : ""}`}
                          aria-selected={p.code === form.product}
                          onClick={() => pickProduct(p.code)}
                        >
                          <span className="a-combobox__option-main">
                            {p.name}
                            {opened ? (
                              <span className="a-combobox__badge">已开通</span>
                            ) : null}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
            {productTip && !form.customerId ? (
              <div className="a-field__hint a-field__hint--warn">请先选择账号</div>
            ) : null}
            {form.customerId && openedProducts.size >= CONFIGURABLE_PRODUCTS.length ? (
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
