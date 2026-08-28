import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Switch } from "@/components/Switch";
import {
  PRODUCT_SECTIONS,
  WORK_REVIEW_SHELF_PRODUCT_NAME,
  useProductsStore,
  type AuditCapability,
  type ManagedProduct,
  type ProductCategory,
  type ProductSection,
} from "@/lib/productsStore";

type Props = {
  category: ProductCategory;
};

type PendingShelf =
  | { kind: "product"; row: ManagedProduct; next: boolean }
  | { kind: "capability"; row: AuditCapability; next: boolean };

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

function AuditShelfPanel({
  section,
  product,
  capabilities,
  onRequestShelfChange,
}: {
  section: ProductSection;
  product: ManagedProduct | undefined;
  capabilities: AuditCapability[];
  onRequestShelfChange: (pending: PendingShelf) => void;
}) {
  if (!product) {
    return (
      <div className="a-card">
        <div className="a-card__head">{section.title}</div>
        <div className="a-card__body">
          <div className="a-empty">未找到作品智能辅助审核产品配置</div>
        </div>
      </div>
    );
  }

  const productOnline = product.shelfStatus === "online";

  return (
    <div className="a-card">
      <div className="a-card__head">{section.title}</div>
      <div className="a-card__body a-card__body--flush">
        <table className="a-table a-table--shelf-tree">
          <thead>
            <tr>
              <th>名称</th>
              <th>上线状态</th>
            </tr>
          </thead>
          <tbody>
            <tr className="a-shelf-tree__product">
              <td>
                <span className="a-shelf-tree__name">{WORK_REVIEW_SHELF_PRODUCT_NAME}</span>
              </td>
              <td>
                <StatusSwitchCell
                  labelOn="上架"
                  labelOff="下架"
                  checked={productOnline}
                  ariaLabel={`${WORK_REVIEW_SHELF_PRODUCT_NAME} ${productOnline ? "下架" : "上架"}`}
                  onChange={(next) =>
                    onRequestShelfChange({ kind: "product", row: product, next })
                  }
                />
              </td>
            </tr>
            {capabilities.map((cap) => {
              const online = cap.shelfStatus === "online";
              return (
                <tr key={cap.code} className="a-shelf-tree__child">
                  <td>
                    <span className="a-shelf-tree__name a-shelf-tree__name--child">
                      {cap.name}
                    </span>
                  </td>
                  <td>
                    <StatusSwitchCell
                      labelOn="上架"
                      labelOff="下架"
                      checked={online}
                      ariaLabel={`${cap.name} ${online ? "下架" : "上架"}`}
                      onChange={(next) =>
                        onRequestShelfChange({ kind: "capability", row: cap, next })
                      }
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function shelfConfirmCopy(pending: PendingShelf) {
  const name =
    pending.kind === "product" ? WORK_REVIEW_SHELF_PRODUCT_NAME : pending.row.name;
  const level = pending.kind === "product" ? "产品" : "能力";
  if (pending.next) {
    return {
      title: `确认上架${level}`,
      description: `确定将${level}「${name}」设为上架吗？上架后客户可使用该${level}。`,
      confirmText: "上架",
      danger: false,
    };
  }
  return {
    title: `确认下架${level}`,
    description: `确定将${level}「${name}」设为下架吗？下架后客户将无法使用该${level}。`,
    confirmText: "下架",
    danger: true,
  };
}

export function ProductManagePage({ category }: Props) {
  const {
    getByCategory,
    getWorkReviewProduct,
    getAuditCapabilities,
    setShelfStatus,
    setAuditCapabilityShelfStatus,
  } = useProductsStore();
  const [pending, setPending] = useState<PendingShelf | null>(null);

  const section =
    PRODUCT_SECTIONS.find((item) => item.category === category) ??
    PRODUCT_SECTIONS[0];

  const confirmSwitch = () => {
    if (!pending) return;
    if (pending.kind === "product") {
      setShelfStatus(pending.row.code, pending.next ? "online" : "offline");
    } else {
      setAuditCapabilityShelfStatus(
        pending.row.code,
        pending.next ? "online" : "offline",
      );
    }
    setPending(null);
  };

  const copy = pending ? shelfConfirmCopy(pending) : null;

  return (
    <div className="a-stack">
      {category === "audit" ? (
        <AuditShelfPanel
          section={section}
          product={getWorkReviewProduct()}
          capabilities={getAuditCapabilities()}
          onRequestShelfChange={setPending}
        />
      ) : (
        <ProductSectionTable
          section={section}
          rows={getByCategory(category)}
          onRequestShelfChange={(row, next) =>
            setPending({ kind: "product", row, next })
          }
        />
      )}

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
