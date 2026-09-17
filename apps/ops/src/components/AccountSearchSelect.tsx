import { useEffect, useMemo, useRef, useState } from "react";
import { useCustomerStore } from "@/lib/customersStore";

type Props = {
  value: string;
  onChange: (customerId: string) => void;
  placeholder?: string;
};

/** 机构账号可搜索下拉：从机构名称、账号模糊匹配，范围=运营后台已通过机构账号 */
export function AccountSearchSelect({
  value,
  onChange,
  placeholder = "请选择机构账号",
}: Props) {
  const { customers } = useCustomerStore();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selected = customers.find((c) => c.id === value);
  const selectedLabel = selected
    ? `${selected.account}（${selected.companyName}）`
    : "";

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(
      (c) =>
        c.account.toLowerCase().includes(q) ||
        c.companyName.toLowerCase().includes(q),
    );
  }, [customers, query]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(() => {
    if (open) {
      window.setTimeout(() => searchRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <div className="a-combobox" ref={rootRef}>
      <button
        type="button"
        className={`a-combobox__trigger${!selectedLabel ? " is-placeholder" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => {
          setOpen((v) => !v);
          setQuery("");
        }}
      >
        <span className="a-combobox__value">{selectedLabel || placeholder}</span>
        <span className="a-combobox__caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="a-combobox__panel" role="listbox">
          <div className="a-combobox__search">
            <input
              ref={searchRef}
              className="a-input"
              placeholder="输入机构名称或账号搜索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="a-combobox__list">
            <button
              type="button"
              role="option"
              className={`a-combobox__option${!value ? " is-selected" : ""}`}
              aria-selected={!value}
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              <span className="a-combobox__option-main">全部账号</span>
            </button>
            {filtered.length === 0 ? (
              <div className="a-combobox__empty">无匹配账号</div>
            ) : (
              filtered.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  role="option"
                  className={`a-combobox__option${c.id === value ? " is-selected" : ""}`}
                  aria-selected={c.id === value}
                  onClick={() => {
                    onChange(c.id);
                    setOpen(false);
                  }}
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
  );
}
