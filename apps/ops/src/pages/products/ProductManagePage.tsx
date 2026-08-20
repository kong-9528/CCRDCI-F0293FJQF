import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  PRODUCT_SECTIONS,
  SHELF_STATUS_LABEL,
  WEBUI_LABEL,
  useProductsStore,
  type ManagedProduct,
  type ShelfStatus,
} from "@/lib/productsStore";
import type { ProductCode } from "@/lib/catalog";

type ConfirmKind = "shelf" | "webui";

type PendingConfirm = {
  kind: ConfirmKind;
  code: ProductCode;
  name: string;
  nextShelf?: ShelfStatus;
  nextWebui?: boolean;
};

function SettingsIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M6.5 2.5h3l.4 1.6a4.5 4.5 0 0 1 1.1.6l1.5-.7 1.5 1.5-.7 1.5c.25.35.45.72.6 1.1L15.5 8.5v3l-1.6.4a4.5 4.5 0 0 1-.6 1.1l.7 1.5-1.5 1.5-1.5-.7a4.5 4.5 0 0 1-1.1.6L9.5 15.5h-3l-.4-1.6a4.5 4.5 0 0 1-1.1-.6l-1.5.7-1.5-1.5.7-1.5a4.5 4.5 0 0 1-.6-1.1L.5 11.5v-3l1.6-.4c.15-.38.35-.75.6-1.1l-.7-1.5 1.5-1.5 1.5.7c.35-.25.72-.45 1.1-.6L6.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
      <circle cx="8" cy="8.5" r="2" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  );
}

function SettingButton({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="a-icon-btn"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <SettingsIcon />
    </button>
  );
}

function ProductSectionTable({
  title,
  rows,
  onEditShelf,
  onEditWebui,
}: {
  title: string;
  rows: ManagedProduct[];
  onEditShelf: (row: ManagedProduct) => void;
  onEditWebui: (row: ManagedProduct) => void;
}) {
  const { productName } = useProductsStore();

  return (
    <div className="a-card">
      <div className="a-card__head">{title}</div>
      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>产品状态</th>
              <th>WebUI</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code}>
                <td>{productName(row.code)}</td>
                <td>
                  <span className="a-cell-with-action">
                    <span
                      className={`a-tag ${
                        row.shelfStatus === "online" ? "a-tag--ok" : "a-tag--muted"
                      }`}
                    >
                      {SHELF_STATUS_LABEL[row.shelfStatus]}
                    </span>
                    <SettingButton
                      label="设置产品状态"
                      onClick={() => onEditShelf(row)}
                    />
                  </span>
                </td>
                <td>
                  <span className="a-cell-with-action">
                    <span
                      className={`a-tag ${
                        row.webuiEnabled ? "a-tag--cyan" : "a-tag--muted"
                      }`}
                    >
                      {row.webuiEnabled ? WEBUI_LABEL.on : WEBUI_LABEL.off}
                    </span>
                    <SettingButton
                      label="设置 WebUI"
                      onClick={() => onEditWebui(row)}
                    />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductManagePage() {
  const { getByCategory, setShelfStatus, setWebuiEnabled, productName } =
    useProductsStore();
  const [pending, setPending] = useState<PendingConfirm | null>(null);

  const openShelf = (row: ManagedProduct) => {
    const next: ShelfStatus = row.shelfStatus === "online" ? "offline" : "online";
    setPending({
      kind: "shelf",
      code: row.code,
      name: productName(row.code),
      nextShelf: next,
    });
  };

  const openWebui = (row: ManagedProduct) => {
    setPending({
      kind: "webui",
      code: row.code,
      name: productName(row.code),
      nextWebui: !row.webuiEnabled,
    });
  };

  const confirm = () => {
    if (!pending) return;
    if (pending.kind === "shelf" && pending.nextShelf) {
      setShelfStatus(pending.code, pending.nextShelf);
    }
    if (pending.kind === "webui" && pending.nextWebui !== undefined) {
      setWebuiEnabled(pending.code, pending.nextWebui);
    }
    setPending(null);
  };

  const dialogTitle =
    pending?.kind === "shelf" ? "确认修改产品状态" : "确认修改 WebUI 设置";

  const dialogDesc = pending
    ? pending.kind === "shelf"
      ? `确定将产品「${pending.name}」的产品状态改为「${SHELF_STATUS_LABEL[pending.nextShelf!]}」吗？`
      : `确定将产品「${pending.name}」的 WebUI（页面提交）改为「${
          pending.nextWebui ? WEBUI_LABEL.on : WEBUI_LABEL.off
        }」吗？`
    : "";

  return (
    <div className="a-stack">
      {PRODUCT_SECTIONS.map((section) => (
        <ProductSectionTable
          key={section.id}
          title={section.title}
          rows={getByCategory(section.category)}
          onEditShelf={openShelf}
          onEditWebui={openWebui}
        />
      ))}

      <ConfirmDialog
        open={Boolean(pending)}
        title={dialogTitle}
        description={dialogDesc}
        confirmText="确认修改"
        danger={
          pending?.kind === "shelf"
            ? pending.nextShelf === "offline"
            : pending?.nextWebui === false
        }
        onCancel={() => setPending(null)}
        onConfirm={confirm}
      />
    </div>
  );
}
