import {
  PRODUCTS,
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
  /** 编辑态可停止/恢复 */
  allowStop?: boolean;
};

export function ProductServicesEditor({
  rows,
  onChange,
  defaultRange,
  allowStop = false,
}: Props) {
  const used = new Set(rows.map((r) => r.product).filter(Boolean));

  const update = (key: string, patch: Partial<ProductFormRow>) => {
    onChange(rows.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  };

  const remove = (key: string) => {
    if (rows.length <= 1) {
      onChange([emptyProductRow(defaultRange)]);
      return;
    }
    onChange(rows.filter((r) => r.key !== key));
  };

  const add = () => {
    onChange([...rows, emptyProductRow(defaultRange)]);
  };

  return (
    <div className="a-stack">
      <div className="a-field__hint">
        规则：产品额度仅在「有效期内」可使用；过期后已用/剩余次数不清零，但页面核验与 API
        调用均不可再消耗。同一产品仅可配置一条。
      </div>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>产品</th>
              <th>额度类型</th>
              <th>总量</th>
              <th>已用</th>
              <th>有效期</th>
              {allowStop ? <th>服务状态</th> : null}
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const options = PRODUCTS.filter(
                (p) => p.code === row.product || !used.has(p.code),
              );
              return (
                <tr key={row.key}>
                  <td>
                    <select
                      className="a-select"
                      style={{ minWidth: 140 }}
                      value={row.product}
                      onChange={(e) =>
                        update(row.key, {
                          product: e.target.value as ProductCode | "",
                        })
                      }
                    >
                      <option value="">请选择产品</option>
                      {options.map((p) => (
                        <option key={p.code} value={p.code}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <select
                      className="a-select"
                      style={{ minWidth: 110 }}
                      value={row.quotaType}
                      onChange={(e) =>
                        update(row.key, {
                          quotaType: e.target.value as ProductFormRow["quotaType"],
                          quotaTotal:
                            e.target.value === "unlimited" ? "" : row.quotaTotal,
                        })
                      }
                    >
                      <option value="unlimited">不限量</option>
                      <option value="total">合作期内总量</option>
                    </select>
                  </td>
                  <td>
                    {row.quotaType === "total" ? (
                      <input
                        className="a-input a-input--sm"
                        style={{ minWidth: 96 }}
                        inputMode="numeric"
                        placeholder="次数"
                        value={row.quotaTotal}
                        onChange={(e) =>
                          update(row.key, {
                            quotaTotal: e.target.value.replace(/\D/g, ""),
                          })
                        }
                      />
                    ) : (
                      <span style={{ color: "var(--n-400)" }}>—</span>
                    )}
                  </td>
                  <td className="num">{row.usedCount.toLocaleString()}</td>
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
                  {allowStop ? (
                    <td>
                      {row.stopped ? (
                        <span className="a-tag a-tag--er">已停止</span>
                      ) : (
                        <span className="a-tag a-tag--ok">可使用</span>
                      )}
                    </td>
                  ) : null}
                  <td>
                    <div className="a-actions">
                      {allowStop && row.product ? (
                        <button
                          type="button"
                          className="a-btn a-btn--text a-btn--sm"
                          onClick={() =>
                            update(row.key, { stopped: !row.stopped })
                          }
                        >
                          {row.stopped ? "恢复" : "停止"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        className="a-btn a-btn--text a-btn--sm"
                        onClick={() => remove(row.key)}
                      >
                        移除
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="a-inline-actions">
        <button
          type="button"
          className="a-btn a-btn--sm"
          disabled={used.size >= PRODUCTS.length}
          onClick={add}
        >
          新增产品配置
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
