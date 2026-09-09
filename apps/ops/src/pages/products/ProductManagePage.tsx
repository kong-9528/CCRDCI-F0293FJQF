import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Switch } from "@/components/Switch";
import {
  WORK_REVIEW_SHELF_PRODUCT_NAME,
  useProductsStore,
  type ManagedProduct,
} from "@/lib/productsStore";

function StatusSwitchCell({
  labelOn,
  labelOff,
  checked,
  ariaLabel,
  onChange,
}: {
  labelOn: string;
  labelOff: string;
  checked: boolean;
  ariaLabel: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="a-cell-with-action">
      <span className="a-switch-label">{checked ? labelOn : labelOff}</span>
      <Switch checked={checked} aria-label={ariaLabel} onChange={onChange} />
    </div>
  );
}

function displayName(row: ManagedProduct) {
  return row.code === "workReview" ? WORK_REVIEW_SHELF_PRODUCT_NAME : row.name;
}

export function ProductManagePage() {
  const { getByCategory, getWorkReviewProduct, setShelfStatus } = useProductsStore();
  const [pending, setPending] = useState<{ row: ManagedProduct; next: boolean } | null>(null);

  const rows = useMemo(() => {
    const verify = getByCategory("verify");
    const workReview = getWorkReviewProduct();
    return workReview ? [...verify, workReview] : verify;
  }, [getByCategory, getWorkReviewProduct]);

  const confirmSwitch = () => {
    if (!pending) return;
    setShelfStatus(pending.row.code, pending.next ? "online" : "offline");
    setPending(null);
  };

  const pendingName = pending ? displayName(pending.row) : "";

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>产品名称</th>
                <th>上线状态</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={2}>
                    <div className="a-empty">暂无产品</div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const online = row.shelfStatus === "online";
                  const name = displayName(row);
                  return (
                    <tr key={row.code}>
                      <td>{name}</td>
                      <td>
                        <StatusSwitchCell
                          labelOn="上线"
                          labelOff="下线"
                          checked={online}
                          ariaLabel={`${name} ${online ? "下线" : "上线"}`}
                          onChange={(next) => setPending({ row, next })}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ConfirmDialog
        open={Boolean(pending)}
        title={pending?.next ? "确认上线产品" : "确认下线产品"}
        description={
          pending?.next
            ? `确定将产品「${pendingName}」设为上线吗？上线后客户可使用该产品。`
            : `确定将产品「${pendingName}」设为下线吗？下线后客户将无法使用该产品。`
        }
        confirmText={pending?.next ? "上线" : "下线"}
        danger={pending ? !pending.next : false}
        onCancel={() => setPending(null)}
        onConfirm={confirmSwitch}
      />
    </div>
  );
}
