import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { ProductVerifyOptions } from "@/components/ProductVerifyOptions";
import { TableAction } from "@/components/TableAction";
import { IconDisable, IconEnable, IconTrash } from "@/components/icons/UiIcons";
import {
  PACKAGE_TECH_SERVICES,
  SERVICE_STATUS_LABEL,
  deriveServiceStatus,
  isVerifyProduct,
  productName,
  type ProductCode,
} from "@/lib/catalog";
import {
  emptyPackageRow,
  emptyPackageServiceRow,
  type PackageFormRow,
  type PackageServiceFormRow,
} from "@/lib/productConfig";

type Props = {
  packages: PackageFormRow[];
  onChange: (packages: PackageFormRow[]) => void;
  defaultRange?: { startDate: string; endDate: string };
  showUsed?: boolean;
  showStatus?: boolean;
  mode?: "create" | "edit";
};

function statusTagClass(status: keyof typeof SERVICE_STATUS_LABEL) {
  if (status === "active") return "a-tag--ok";
  if (status === "pending") return "a-tag--wn";
  if (status === "stopped") return "a-tag--er";
  if (status === "over_quota") return "a-tag--wn";
  return "a-tag--muted";
}

function ProductCombobox({
  value,
  taken,
  onChange,
}: {
  value: ProductCode | "";
  taken: Set<string>;
  onChange: (code: ProductCode) => void;
}) {
  const [open, setOpen] = useState(false);
  const [panelStyle, setPanelStyle] = useState<CSSProperties>({});
  const rootRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const placePanel = () => {
    const trigger = triggerRef.current;
    if (!trigger) return;
    const rect = trigger.getBoundingClientRect();
    const width = Math.max(rect.width, 200);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const openUp = spaceBelow < 240 && rect.top > spaceBelow;
    setPanelStyle({
      position: "fixed",
      left: rect.left,
      width,
      top: openUp ? undefined : rect.bottom + 4,
      bottom: openUp ? window.innerHeight - rect.top + 4 : undefined,
      zIndex: 2100,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;
    placePanel();
    const onReposition = () => placePanel();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (rootRef.current?.contains(t) || panelRef.current?.contains(t)) return;
      setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const selectedLabel = value
    ? (PACKAGE_TECH_SERVICES.find((p) => p.code === value)?.name ?? value)
    : "";

  return (
    <div className="a-combobox" ref={rootRef}>
      <button
        ref={triggerRef}
        type="button"
        className={`a-combobox__trigger${!selectedLabel ? " is-placeholder" : ""}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="a-combobox__value">{selectedLabel || "请选择核验产品"}</span>
        <span className="a-combobox__caret" aria-hidden>
          ▾
        </span>
      </button>
      {open
        ? createPortal(
            <div
              ref={panelRef}
              className="a-combobox__panel a-combobox__panel--portal"
              style={panelStyle}
              role="listbox"
            >
              <div className="a-combobox__list">
                {PACKAGE_TECH_SERVICES.map((p) => {
                  const disabled = taken.has(p.code) && p.code !== value;
                  return (
                    <button
                      key={p.code}
                      type="button"
                      role="option"
                      disabled={disabled}
                      className={`a-combobox__option${
                        p.code === value ? " is-selected" : ""
                      }${disabled ? " is-disabled" : ""}`}
                      aria-selected={p.code === value}
                      onClick={() => {
                        if (disabled) return;
                        onChange(p.code);
                        setOpen(false);
                      }}
                    >
                      <span className="a-combobox__option-main">
                        {p.name}
                        {disabled ? <span className="a-combobox__badge">已配置</span> : null}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

export function ServicePackagesEditor({
  packages,
  onChange,
  defaultRange,
  showUsed = true,
  showStatus = false,
  mode = "create",
}: Props) {
  const isEdit = mode === "edit";
  const unit = packages[0] ?? null;
  const [pendingToggle, setPendingToggle] = useState<{
    svcKey: string;
    name: string;
    nextStopped: boolean;
  } | null>(null);

  const setUnit = (next: PackageFormRow | null) => {
    onChange(next ? [next] : []);
  };

  const updateUnit = (patch: Partial<PackageFormRow>) => {
    if (!unit) return;
    setUnit({ ...unit, ...patch });
  };

  const updateSvc = (svcKey: string, patch: Partial<PackageServiceFormRow>) => {
    if (!unit) return;
    setUnit({
      ...unit,
      services: unit.services.map((s) => (s.key === svcKey ? { ...s, ...patch } : s)),
    });
  };

  const takenProducts = new Set(
    (unit?.services ?? []).map((s) => s.product).filter(Boolean) as string[],
  );
  const atCap = takenProducts.size >= PACKAGE_TECH_SERVICES.length;

  if (!unit) {
    return (
      <div className="a-stack a-service-packages-editor">
        <div className="a-empty" style={{ padding: "28px 16px" }}>
          尚未开通版权核验服务
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              className="a-btn a-btn--sm a-btn--primary"
              onClick={() =>
                setUnit(
                  emptyPackageRow({
                    startDate: defaultRange?.startDate,
                    endDate: defaultRange?.endDate,
                  }),
                )
              }
            >
              开通服务
            </button>
          </div>
        </div>
      </div>
    );
  }

  const locked = isEdit && !unit.isNew;
  const quotaTotalNum = unit.quotaTotal.trim() ? Number(unit.quotaTotal) : null;
  const unitStatus = unit.isNew
    ? null
    : deriveServiceStatus({
        stopped: false,
        startDate: unit.startDate,
        endDate: unit.endDate,
        quotaType: "total",
        quotaTotal: Number.isFinite(quotaTotalNum) ? quotaTotalNum : null,
        usedCount: unit.usedCount,
      });

  return (
    <div className="a-stack a-service-packages-editor">
      <section className="a-service-package a-verify-service-card">
        <header className="a-service-package__head">
          <div className="a-service-package__title-row">
            <label className="a-field a-field--inline a-service-package__quota">
              <span className="a-field__label">授权总量</span>
              <input
                className="a-input a-input--sm"
                style={{ width: 110 }}
                inputMode="numeric"
                placeholder="次数"
                value={unit.quotaTotal}
                onChange={(e) =>
                  updateUnit({ quotaTotal: e.target.value.replace(/\D/g, "") })
                }
              />
            </label>

            {showUsed ? (
              <div className="a-field a-field--inline">
                <span className="a-field__label">已用</span>
                <span className="a-service-package__used">
                  {unit.isNew ? "—" : unit.usedCount.toLocaleString()}
                </span>
              </div>
            ) : null}

            <label className="a-field a-field--inline a-service-package__period">
              <span className="a-field__label">生效起止</span>
              <div className="a-date-range">
                <input
                  type="date"
                  className="a-input"
                  value={unit.startDate}
                  onChange={(e) => updateUnit({ startDate: e.target.value })}
                />
                <span>至</span>
                <input
                  type="date"
                  className="a-input"
                  value={unit.endDate}
                  onChange={(e) => updateUnit({ endDate: e.target.value })}
                />
              </div>
            </label>

            {showStatus ? (
              <div className="a-field a-field--inline">
                <span className="a-field__label">状态</span>
                {unitStatus == null ? (
                  <span className="a-service-package__placeholder">—</span>
                ) : (
                  <span className={`a-tag ${statusTagClass(unitStatus)}`}>
                    {SERVICE_STATUS_LABEL[unitStatus]}
                  </span>
                )}
              </div>
            ) : null}

            <div className="a-service-package__title-actions a-actions a-actions--nowrap">
              {!locked || unit.isNew ? (
                <TableAction
                  icon={<IconTrash />}
                  danger
                  onClick={() => setUnit(null)}
                >
                  移除
                </TableAction>
              ) : null}
            </div>
          </div>
        </header>

        <div className="a-service-package__body">
          <div className="a-service-package__section-label">核验产品</div>
          <div className="a-service-package__table-wrap">
            <table className="a-table a-table--compact a-service-package__table">
              <colgroup>
                <col className="a-service-package__col-svc" />
                <col className="a-service-package__col-cfg" />
                <col style={{ width: 120 }} />
                <col className="a-service-package__col-act" />
              </colgroup>
              <thead>
                <tr>
                  <th>核验产品</th>
                  <th>功能配置</th>
                  <th>每作品消耗次数</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {unit.services.map((svc) => {
                  const svcLocked = locked && !svc.isNew;
                  const canRemove =
                    unit.services.length > 1 || Boolean(svc.product) || Boolean(svc.isNew);
                  const hasCfg = Boolean(svc.product && isVerifyProduct(svc.product));
                  const displayName = svc.product
                    ? productName(svc.product)
                    : "未选择产品";

                  return (
                    <tr key={svc.key}>
                      <td className="a-service-package__cell-svc">
                        {svcLocked && svc.product ? (
                          <strong>{displayName}</strong>
                        ) : (
                          <ProductCombobox
                            value={svc.product}
                            taken={takenProducts}
                            onChange={(code) =>
                              updateSvc(svc.key, {
                                product: code,
                              })
                            }
                          />
                        )}
                      </td>
                      <td className="a-service-package__cell-cfg">
                        {hasCfg ? (
                          <ProductVerifyOptions
                            businessTypes={svc.businessTypes}
                            usageChannels={svc.usageChannels}
                            onChange={(patch) => updateSvc(svc.key, patch)}
                          />
                        ) : (
                          <span className="a-field__hint">—</span>
                        )}
                      </td>
                      <td>
                        <input
                          className="a-input a-input--sm"
                          style={{ width: 88 }}
                          inputMode="numeric"
                          placeholder="整数"
                          value={svc.consumePerWork}
                          onChange={(e) =>
                            updateSvc(svc.key, {
                              consumePerWork: e.target.value.replace(/\D/g, ""),
                            })
                          }
                        />
                      </td>
                      <td className="a-service-package__cell-act">
                        <div className="a-actions">
                          {svcLocked && svc.product ? (
                            <TableAction
                              icon={svc.stopped ? <IconEnable /> : <IconDisable />}
                              onClick={() =>
                                setPendingToggle({
                                  svcKey: svc.key,
                                  name: displayName,
                                  nextStopped: !svc.stopped,
                                })
                              }
                            >
                              {svc.stopped ? "恢复" : "停止"}
                            </TableAction>
                          ) : null}
                          {canRemove && (!svcLocked || svc.isNew) ? (
                            <TableAction
                              icon={<IconTrash />}
                              danger
                              onClick={() => {
                                const next = unit.services.filter((s) => s.key !== svc.key);
                                updateUnit({
                                  services:
                                    next.length > 0 ? next : [emptyPackageServiceRow()],
                                });
                              }}
                            >
                              移除
                            </TableAction>
                          ) : !svcLocked ? (
                            <span style={{ color: "var(--n-400)" }}>—</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="a-inline-actions" style={{ marginTop: 10 }}>
            <button
              type="button"
              className="a-btn a-btn--sm"
              disabled={atCap}
              onClick={() =>
                updateUnit({
                  services: [...unit.services, emptyPackageServiceRow()],
                })
              }
            >
              添加核验产品
            </button>
            {takenProducts.size > 0 ? (
              <span className="a-field__hint">
                已配置：
                {[...takenProducts].map((c) => productName(c as ProductCode)).join("、")}
                {atCap ? "（已达上限）" : ""}
              </span>
            ) : null}
          </div>
        </div>
      </section>

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        title={pendingToggle?.nextStopped ? "确认停止产品" : "确认恢复产品"}
        description={
          pendingToggle?.nextStopped
            ? `确定停止「${pendingToggle.name}」吗？停止后该产品不可调用；共享额度与其它产品不受影响。`
            : `确定恢复「${pendingToggle?.name ?? ""}」吗？恢复后，在共享生效期内且额度未用尽时可继续使用。`
        }
        confirmText={pendingToggle?.nextStopped ? "停止" : "恢复"}
        danger={Boolean(pendingToggle?.nextStopped)}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => {
          if (!pendingToggle) return;
          updateSvc(pendingToggle.svcKey, { stopped: pendingToggle.nextStopped });
          setPendingToggle(null);
        }}
      />
    </div>
  );
}
