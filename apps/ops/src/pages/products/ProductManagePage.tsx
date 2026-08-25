import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Switch } from "@/components/Switch";
import {
  PRODUCT_SECTIONS,
  useProductsStore,
  type ManagedProduct,
  type ProductSection,
} from "@/lib/productsStore";

type PendingSwitch =
  | { kind: "shelf"; row: ManagedProduct; next: boolean }
  | { kind: "page"; row: ManagedProduct; next: boolean }
  | { kind: "api"; row: ManagedProduct; next: boolean };

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
  onRequestSwitch,
}: {
  section: ProductSection;
  rows: ManagedProduct[];
  onRequestSwitch: (pending: PendingSwitch) => void;
}) {
  return (
    <div className="a-card">
      <div className="a-card__head">
        {section.title}
        <div className="a-card__extra">
          <Link
            className="a-btn a-btn--primary a-btn--sm"
            to={`/products/new?category=${section.category}`}
          >
            新增产品
          </Link>
        </div>
      </div>
      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>上线状态</th>
              <th>页面提交</th>
              <th>API调用</th>
              <th style={{ width: 88 }}>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <div className="a-empty">暂无产品，可点击「新增产品」添加</div>
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
                        onChange={(next) =>
                          onRequestSwitch({ kind: "shelf", row, next })
                        }
                      />
                    </td>
                    <td>
                      <StatusSwitchCell
                        labelOn="支持"
                        labelOff="不支持"
                        checked={row.pageSubmitEnabled}
                        ariaLabel={`${row.name} 页面提交`}
                        onChange={(next) =>
                          onRequestSwitch({ kind: "page", row, next })
                        }
                      />
                    </td>
                    <td>
                      <StatusSwitchCell
                        labelOn="支持"
                        labelOff="不支持"
                        checked={row.apiEnabled}
                        ariaLabel={`${row.name} API调用`}
                        onChange={(next) =>
                          onRequestSwitch({ kind: "api", row, next })
                        }
                      />
                    </td>
                    <td>
                      <Link
                        className="a-btn a-btn--text a-btn--sm"
                        to={`/products/${row.code}/edit`}
                      >
                        编辑
                      </Link>
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

function switchConfirmCopy(pending: PendingSwitch): {
  title: string;
  description: string;
  confirmText: string;
  danger: boolean;
} {
  const name = pending.row.name;
  if (pending.kind === "shelf") {
    return pending.next
      ? {
          title: "确认上线产品",
          description: `确定将产品「${name}」设为上线吗？上线后客户可使用该产品。`,
          confirmText: "上线",
          danger: false,
        }
      : {
          title: "确认下线产品",
          description: `确定将产品「${name}」设为下线吗？下线后客户将无法使用该产品。`,
          confirmText: "下线",
          danger: true,
        };
  }
  if (pending.kind === "page") {
    return pending.next
      ? {
          title: "确认开启页面提交",
          description: `确定为产品「${name}」开启页面提交吗？`,
          confirmText: "开启",
          danger: false,
        }
      : {
          title: "确认关闭页面提交",
          description: `确定为产品「${name}」关闭页面提交吗？`,
          confirmText: "关闭",
          danger: true,
        };
  }
  return pending.next
    ? {
        title: "确认开启 API 调用",
        description: `确定为产品「${name}」开启 API 调用吗？`,
        confirmText: "开启",
        danger: false,
      }
    : {
        title: "确认关闭 API 调用",
        description: `确定为产品「${name}」关闭 API 调用吗？`,
        confirmText: "关闭",
        danger: true,
      };
}

export function ProductManagePage() {
  const { getByCategory, setShelfStatus, setPageSubmitEnabled, setApiEnabled } =
    useProductsStore();
  const [pending, setPending] = useState<PendingSwitch | null>(null);

  const confirmSwitch = () => {
    if (!pending) return;
    const { kind, row, next } = pending;
    if (kind === "shelf") setShelfStatus(row.code, next ? "online" : "offline");
    if (kind === "page") setPageSubmitEnabled(row.code, next);
    if (kind === "api") setApiEnabled(row.code, next);
    setPending(null);
  };

  const copy = pending ? switchConfirmCopy(pending) : null;

  return (
    <div className="a-stack">
      {PRODUCT_SECTIONS.map((section) => (
        <ProductSectionTable
          key={section.id}
          section={section}
          rows={getByCategory(section.category)}
          onRequestSwitch={setPending}
        />
      ))}

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
