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

function packageStatusTagClass(status: keyof typeof SERVICE_STATUS_LABEL) {
  if (status === "active") return "a-tag--ok";
  if (status === "pending") return "a-tag--wn";
  if (status === "stopped") return "a-tag--er";
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
        <span className="a-combobox__value">{selectedLabel || "请选择技术服务"}</span>
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

function patchServiceProduct(
  row: PackageServiceFormRow,
  product: ProductCode,
): Partial<PackageServiceFormRow> {
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

export function ServicePackagesEditor({
  packages,
  onChange,
  defaultRange,
  showUsed = true,
  showStatus = false,
  mode = "create",
}: Props) {
  const isEdit = mode === "edit";
  const [pendingToggle, setPendingToggle] = useState<{
    key: string;
    name: string;
    nextStopped: boolean;
  } | null>(null);

  const takenProducts = new Set(
    packages.flatMap((pkg) =>
      pkg.services.map((s) => s.product).filter(Boolean),
    ) as string[],
  );
  const packageServiceCap = PACKAGE_TECH_SERVICES.length;
  const atServiceCap = takenProducts.size >= packageServiceCap;

  const updatePkg = (key: string, patch: Partial<PackageFormRow>) => {
    onChange(packages.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  };

  const updateSvc = (
    pkgKey: string,
    svcKey: string,
    patch: Partial<PackageServiceFormRow>,
  ) => {
    onChange(
      packages.map((pkg) =>
        pkg.key !== pkgKey
          ? pkg
          : {
              ...pkg,
              services: pkg.services.map((s) =>
                s.key === svcKey ? { ...s, ...patch } : s,
              ),
            },
      ),
    );
  };

  const removePkg = (key: string) => {
    const target = packages.find((p) => p.key === key);
    if (isEdit && target && !target.isNew) return;
    const next = packages.filter((p) => p.key !== key);
    onChange(
      next.length
        ? next
        : [
            emptyPackageRow({
              startDate: defaultRange?.startDate,
              endDate: defaultRange?.endDate,
              name: "套餐 1",
            }),
          ],
    );
  };

  const addPkg = () => {
    onChange([
      ...packages,
      emptyPackageRow({
        startDate: defaultRange?.startDate,
        endDate: defaultRange?.endDate,
        name: `套餐 ${packages.length + 1}`,
      }),
    ]);
  };

  const addService = (pkgKey: string) => {
    onChange(
      packages.map((pkg) =>
        pkg.key !== pkgKey
          ? pkg
          : { ...pkg, services: [...pkg.services, emptyPackageServiceRow()] },
      ),
    );
  };

  const removeService = (pkgKey: string, svcKey: string) => {
    onChange(
      packages.map((pkg) => {
        if (pkg.key !== pkgKey) return pkg;
        const next = pkg.services.filter((s) => s.key !== svcKey);
        // 已停止的套餐允许清空全部技术服务；未停止时保留一行便于继续配置
        if (next.length > 0) return { ...pkg, services: next };
        if (pkg.stopped) return { ...pkg, services: [] };
        return { ...pkg, services: [emptyPackageServiceRow()] };
      }),
    );
  };

  return (
      <div className="a-stack a-service-packages-editor">
      {packages.map((pkg, pkgIndex) => {
        const pkgLocked = isEdit && !pkg.isNew;
        const canRemovePkg = isEdit ? Boolean(pkg.isNew) : packages.length > 1;
        const pkgStatus = pkg.isNew
          ? null
          : deriveServiceStatus({
              stopped: pkg.stopped,
              startDate: pkg.startDate,
              endDate: pkg.endDate,
            });

        return (
          <section key={pkg.key} className="a-service-package">
            <header className="a-service-package__head">
              <div className="a-service-package__title-row">
                <span className="a-service-package__badge">套餐包</span>
                <input
                  className="a-input a-service-package__name"
                  placeholder={`套餐 ${pkgIndex + 1}`}
                  value={pkg.name}
                  onChange={(e) => updatePkg(pkg.key, { name: e.target.value })}
                />
                <label className="a-field a-field--inline a-service-package__quota">
                  <span className="a-field__label">授权总量</span>
                  <input
                    className="a-input a-input--sm"
                    style={{ width: 110 }}
                    inputMode="numeric"
                    placeholder="次数"
                    value={pkg.quotaTotal}
                    onChange={(e) =>
                      updatePkg(pkg.key, {
                        quotaTotal: e.target.value.replace(/\D/g, ""),
                      })
                    }
                  />
                </label>
                {showUsed ? (
                  <div className="a-field a-field--inline">
                    <span className="a-field__label">已用</span>
                    <span className="a-service-package__used">
                      {pkg.isNew ? "—" : pkg.usedCount.toLocaleString()}
                    </span>
                  </div>
                ) : null}
                <label className="a-field a-field--inline a-service-package__period">
                  <span className="a-field__label">生效起止</span>
                  <div className="a-date-range">
                    <input
                      type="date"
                      className="a-input"
                      value={pkg.startDate}
                      onChange={(e) => updatePkg(pkg.key, { startDate: e.target.value })}
                    />
                    <span>至</span>
                    <input
                      type="date"
                      className="a-input"
                      value={pkg.endDate}
                      onChange={(e) => updatePkg(pkg.key, { endDate: e.target.value })}
                    />
                  </div>
                </label>
                {showStatus ? (
                  <div className="a-field a-field--inline">
                    <span className="a-field__label">状态</span>
                    {pkgStatus == null ? (
                      <span className="a-service-package__placeholder">—</span>
                    ) : (
                      <span className={`a-tag ${packageStatusTagClass(pkgStatus)}`}>
                        {SERVICE_STATUS_LABEL[pkgStatus]}
                      </span>
                    )}
                  </div>
                ) : null}
                <div className="a-service-package__title-actions a-actions a-actions--nowrap">
                  {pkgLocked ? (
                    <TableAction
                      icon={pkg.stopped ? <IconEnable /> : <IconDisable />}
                      onClick={() =>
                        setPendingToggle({
                          key: pkg.key,
                          name: pkg.name.trim() || `套餐 ${pkgIndex + 1}`,
                          nextStopped: !pkg.stopped,
                        })
                      }
                    >
                      {pkg.stopped ? "恢复" : "停止"}
                    </TableAction>
                  ) : null}
                  {canRemovePkg ? (
                    <TableAction
                      icon={<IconTrash />}
                      danger
                      onClick={() => removePkg(pkg.key)}
                    >
                      移除套餐包
                    </TableAction>
                  ) : null}
                </div>
              </div>
            </header>

            <div className="a-service-package__body">
              <div className="a-service-package__section-label">包内技术服务</div>
              <div className="a-service-package__table-wrap">
                <table className="a-table a-table--compact a-service-package__table">
                  <colgroup>
                    <col className="a-service-package__col-svc" />
                    <col className="a-service-package__col-cfg" />
                    <col className="a-service-package__col-act" />
                  </colgroup>
                  <thead>
                    <tr>
                      <th>技术服务</th>
                      <th>功能配置</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.services.length === 0 ? (
                      <tr>
                        <td colSpan={3}>
                          <div className="a-empty" style={{ padding: "12px 0" }}>
                            暂无技术服务
                            {pkg.stopped ? "（已停止的套餐包允许为空）" : ""}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      pkg.services.map((svc) => {
                        const canRemoveSvc =
                          pkg.stopped || pkg.services.length > 1 || Boolean(svc.product);
                        const hasCfg = Boolean(svc.product && isVerifyProduct(svc.product));

                        return (
                          <tr key={svc.key}>
                            <td className="a-service-package__cell-svc">
                              <ProductCombobox
                                value={svc.product}
                                taken={takenProducts}
                                onChange={(code) =>
                                  updateSvc(pkg.key, svc.key, patchServiceProduct(svc, code))
                                }
                              />
                            </td>
                            <td className="a-service-package__cell-cfg">
                              {hasCfg ? (
                                <ProductVerifyOptions
                                  businessTypes={svc.businessTypes}
                                  usageChannels={svc.usageChannels}
                                  onChange={(patch) => updateSvc(pkg.key, svc.key, patch)}
                                />
                              ) : (
                                <span className="a-field__hint">—</span>
                              )}
                            </td>
                            <td className="a-service-package__cell-act">
                              <div className="a-actions">
                                {canRemoveSvc ? (
                                  <TableAction
                                    icon={<IconTrash />}
                                    danger
                                    onClick={() => removeService(pkg.key, svc.key)}
                                  >
                                    移除
                                  </TableAction>
                                ) : (
                                  <span style={{ color: "var(--n-400)" }}>—</span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              <div className="a-inline-actions" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="a-btn a-btn--sm"
                  disabled={atServiceCap}
                  onClick={() => {
                    if (pkg.services.length === 0) {
                      updatePkg(pkg.key, { services: [emptyPackageServiceRow()] });
                      return;
                    }
                    addService(pkg.key);
                  }}
                >
                  添加技术服务
                </button>
              </div>
            </div>
          </section>
        );
      })}

      <div className="a-inline-actions">
        <button
          type="button"
          className="a-btn a-btn--sm a-btn--primary"
          disabled={atServiceCap}
          onClick={addPkg}
        >
          新增套餐包
        </button>
        {takenProducts.size > 0 ? (
          <span className="a-field__hint">
            已配置核验服务：
            {[...takenProducts].map((code) => productName(code as ProductCode)).join("、")}
          </span>
        ) : null}
      </div>

      <ConfirmDialog
        open={Boolean(pendingToggle)}
        title={pendingToggle?.nextStopped ? "确认停止套餐包" : "确认恢复套餐包"}
        description={
          pendingToggle?.nextStopped
            ? `确定停止「${pendingToggle.name}」吗？停止后，该套餐包内全部技术服务将不可调用，已用额度仍会保留。`
            : `确定恢复「${pendingToggle?.name ?? ""}」吗？恢复后，在生效期内且额度未用尽时，包内技术服务可继续使用。恢复时包内须至少配置一项核验技术服务。`
        }
        confirmText={pendingToggle?.nextStopped ? "停止" : "恢复"}
        danger={Boolean(pendingToggle?.nextStopped)}
        onCancel={() => setPendingToggle(null)}
        onConfirm={() => {
          if (!pendingToggle) return;
          updatePkg(pendingToggle.key, { stopped: pendingToggle.nextStopped });
          setPendingToggle(null);
        }}
      />
    </div>
  );
}
