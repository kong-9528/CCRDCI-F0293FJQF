import { Fragment, useEffect, useRef, useState } from "react";
import {
  ProductSubparamsRow,
  ProductVerifyOptions,
} from "@/components/ProductVerifyOptions";
import { TableAction } from "@/components/TableAction";
import { IconDisable, IconEnable, IconTrash } from "@/components/icons/UiIcons";
import {
  CONFIGURABLE_PRODUCTS,
  isVerifyProduct,
  productName,
  type ProductCode,
} from "@/lib/catalog";
import {
  emptyProductRow,
  type ProductFormRow,
} from "@/lib/customerForm";
type Props = {
  rows: ProductFormRow[];
  onChange: (rows: ProductFormRow[]) => void;
  /** 新增产品行时默认带入的有效期 */
  defaultRange?: { startDate: string; endDate: string };
  /** 是否展示「已用」列；新增账号时通常隐藏 */
  showUsed?: boolean;
  /** 编辑态展示服务状态列 */
  showStatus?: boolean;
  /**
   * create：创建账号，产品可自由选择/移除
   * edit：已有配置产品锁定不可改、不可移除；本次新增行可选产品并可移除
   */
  mode?: "create" | "edit";
};

function ProductCombobox({
  value,
  configured,
  onChange,
}: {
  value: ProductCode | "";
  configured: Set<string>;
  onChange: (code: ProductCode) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selectedLabel = value
    ? (CONFIGURABLE_PRODUCTS.find((p) => p.code === value)?.name ?? value)
    : "";

  return (
    <div className="a-combobox" ref={ref}>
      <button
        type="button"
        className={`a-combobox__trigger${!selectedLabel ? " is-placeholder" : ""}`}
        style={{ minWidth: 160 }}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="a-combobox__value">{selectedLabel || "请选择产品"}</span>
        <span className="a-combobox__caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="a-combobox__panel" role="listbox">
          <div className="a-combobox__list">
            {CONFIGURABLE_PRODUCTS.map((p) => {
              const taken = configured.has(p.code) && p.code !== value;
              return (
                <button
                  key={p.code}
                  type="button"
                  role="option"
                  disabled={taken}
                  className={`a-combobox__option${
                    p.code === value ? " is-selected" : ""
                  }${taken ? " is-disabled" : ""}`}
                  aria-selected={p.code === value}
                  onClick={() => {
                    if (taken) return;
                    onChange(p.code);
                    setOpen(false);
                  }}
                >
                  <span className="a-combobox__option-main">
                    {p.name}
                    {taken ? <span className="a-combobox__badge">已配置</span> : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

function patchProductSelection(row: ProductFormRow, product: ProductCode): Partial<ProductFormRow> {
  if (isVerifyProduct(product)) {
    return {
      product,
      businessTypes: row.businessTypes,
      usageChannels: row.usageChannels,
    };
  }
  return {
    product,
    businessTypes: [],
    usageChannels: [],
  };
}

export function ProductServicesEditor({
  rows,
  onChange,
  defaultRange,
  showUsed = true,
  showStatus = false,
  mode = "create",
}: Props) {
  const isEdit = mode === "edit";
  const used = new Set(rows.map((r) => r.product).filter(Boolean) as string[]);
  const showActions = true;
  const colCount =
    1 +
    1 +
    (showUsed ? 1 : 0) +
    1 +
    (showStatus ? 1 : 0) +
    (showActions ? 1 : 0);

  const update = (key: string, patch: Partial<ProductFormRow>) => {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const remove = (key: string) => {
    const next = rows.filter((r) => r.key !== key);
    if (next.length === 0) {
      onChange([emptyProductRow(defaultRange)]);
      return;
    }
    onChange(next);
  };

  const add = () => {
    onChange([...rows, emptyProductRow(defaultRange)]);
  };

  return (
    <div className="a-stack a-product-services-editor">
      <div className="a-field__hint">
        规则：产品额度仅在「产品有效期内」可使用；过期后已用/剩余次数不清零，但页面核验与 API
        调用均不可再消耗。同一产品仅可配置一条。
        {isEdit
          ? " 已有配置不可移除，可调整额度、有效期，或在操作列停止/恢复服务；本次新增的配置可移除。"
          : " 合同服务期仅用于提醒展示，不控制登录与调用。"}
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>授权总量</th>
              {showUsed ? <th>已用</th> : null}
              <th>有效期</th>
              {showStatus ? <th>服务状态</th> : null}
              {showActions ? <th>操作</th> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const locked = isEdit && !row.isNew;
              const canRemove = isEdit ? Boolean(row.isNew) : true;
              const options = CONFIGURABLE_PRODUCTS.filter(
                (p) => p.code === row.product || !used.has(p.code),
              );
              const hasSubparams = Boolean(row.product && isVerifyProduct(row.product));

              return (
                <Fragment key={row.key}>
                  <tr className={hasSubparams ? "a-product-row--has-subparams" : undefined}>
                    <td>
                      {locked && row.product ? (
                        <span>{productName(row.product)}</span>
                      ) : isEdit ? (
                        <ProductCombobox
                          value={row.product}
                          configured={used}
                          onChange={(code) =>
                            update(row.key, patchProductSelection(row, code))
                          }
                        />
                      ) : (
                        <select
                          className="a-select"
                          style={{ minWidth: 140 }}
                          value={row.product}
                          onChange={(e) =>
                            update(
                              row.key,
                              patchProductSelection(
                                row,
                                e.target.value as ProductCode,
                              ),
                            )
                          }
                        >
                          <option value="">请选择产品</option>
                          {options.map((p) => (
                            <option key={p.code} value={p.code}>
                              {p.name}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <input
                        className="a-input a-input--sm"
                        style={{ minWidth: 96 }}
                        inputMode="numeric"
                        placeholder="次数"
                        value={row.quotaTotal}
                        onChange={(e) =>
                          update(row.key, {
                            quotaType: "total",
                            quotaTotal: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    </td>
                  {showUsed ? (
                    <td className="num">{row.usedCount.toLocaleString()}</td>
                  ) : null}
                  <td>
                    <div className="a-date-range">
                      <input
                        type="date"
                        className="a-input"
                        value={row.startDate}
                        onChange={(e) =>
                          update(row.key, { startDate: e.target.value })
                        }
                      />
                      <span>至</span>
                      <input
                        type="date"
                        className="a-input"
                        value={row.endDate}
                        onChange={(e) =>
                          update(row.key, { endDate: e.target.value })
                        }
                      />
                    </div>
                  </td>
                  {showStatus ? (
                    <td>
                      {row.stopped ? (
                        <span className="a-tag a-tag--er">已停止</span>
                      ) : (
                        <span className="a-tag a-tag--ok">可使用</span>
                      )}
                    </td>
                  ) : null}
                  {showActions ? (
                    <td>
                      <div className="a-actions">
                        {canRemove ? (
                          <TableAction
                            icon={<IconTrash />}
                            danger
                            onClick={() => remove(row.key)}
                          >
                            移除
                          </TableAction>
                        ) : locked && row.product ? (
                          <TableAction
                            icon={row.stopped ? <IconEnable /> : <IconDisable />}
                            onClick={() => update(row.key, { stopped: !row.stopped })}
                          >
                            {row.stopped ? "恢复" : "停止"}
                          </TableAction>
                        ) : (
                          <span style={{ color: "var(--n-400)" }}>—</span>
                        )}
                      </div>
                    </td>
                  ) : null}
                  </tr>
                  {hasSubparams ? (
                    <ProductSubparamsRow colSpan={colCount - 1}>
                      <ProductVerifyOptions
                        businessTypes={row.businessTypes}
                        usageChannels={row.usageChannels}
                        onChange={(patch) => update(row.key, patch)}
                      />
                    </ProductSubparamsRow>
                  ) : null}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="a-inline-actions">
        <button
          type="button"
          className="a-btn a-btn--sm"
          disabled={used.size >= CONFIGURABLE_PRODUCTS.length}
          onClick={add}
        >
          {isEdit ? "新增配置" : "新增技术服务配置"}
        </button>
        {rows.some((r) => r.product) ? (
          <span className="a-field__hint">
            已选：
            {rows
              .filter((r) => r.product)
              .map((r) => productName(r.product as ProductCode))
              .join("、")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
