import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Switch } from "@/components/Switch";
import {
  PRODUCT_SECTIONS,
  useProductsStore,
  type ManagedProduct,
  type ProductCategory,
  type ProductSection,
} from "@/lib/productsStore";

type Props = {
  category: ProductCategory;
};

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

function ProductSectionTable({
  section,
  rows,
  onRequestShelfChange,
}: {
  section: ProductSection;
  rows: ManagedProduct[];
  onRequestShelfChange: (row: ManagedProduct, next: boolean) => void;
}) {
  return (
    <div className="a-card">
      <div className="a-card__head">{section.title}</div>
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
                return (
                  <tr key={row.code}>
                    <td>{row.name}</td>
                    <td>
                      <StatusSwitchCell
                        labelOn="上线"
                        labelOff="下线"
                        checked={online}
                        ariaLabel={`${row.name} ${online ? "下线" : "上线"}`}
                        onChange={(next) => onRequestShelfChange(row, next)}
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
  );
}

export function ProductManagePage({ category }: Props) {
  const { getByCategory, setShelfStatus } = useProductsStore();
  const [pending, setPending] = useState<{
    row: ManagedProduct;
    next: boolean;
  } | null>(null);

  const section =
    PRODUCT_SECTIONS.find((item) => item.category === category) ??
    PRODUCT_SECTIONS[0];

  const confirmSwitch = () => {
    if (!pending) return;
    setShelfStatus(pending.row.code, pending.next ? "online" : "offline");
    setPending(null);
  };

  const copy = pending
    ? pending.next
      ? {
          title: "确认上线产品",
          description: `确定将产品「${pending.row.name}」设为上线吗？上线后客户可使用该产品。`,
          confirmText: "上线",
          danger: false,
        }
      : {
          title: "确认下线产品",
          description: `确定将产品「${pending.row.name}」设为下线吗？下线后客户将无法使用该产品。`,
          confirmText: "下线",
          danger: true,
        }
    : null;

  return (
    <div className="a-stack">
      <ProductSectionTable
        section={section}
        rows={getByCategory(category)}
        onRequestShelfChange={(row, next) => setPending({ row, next })}
      />

      <ConfirmDialog
        open={Boolean(pending)}
        title={copy?.title ?? ""}
        description={copy?.description ?? ""}
        confirmText={copy?.confirmText}
        danger={copy?.danger}
        onCancel={() => setPending(null)}
        onConfirm={confirmSwitch}
      />
    </div>
  );
}
