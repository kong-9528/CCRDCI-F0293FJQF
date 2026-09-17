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
        <span className="a-combobox__value">{selectedLabel || "请选择技术服务"}</span>
        <span className="a-combobox__caret" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div className="a-combobox__panel" role="listbox">
          <div className="a-combobox__list">
            {CONFIGURABLE_PRODUCTS.map((p) => {
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
        </div>
      ) : null}
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

  const takenProducts = new Set(
    packages.flatMap((pkg) =>
      pkg.services.map((s) => s.product).filter(Boolean),
    ) as string[],
  );

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
        const svc = pkg.services.find((s) => s.key === svcKey);
        if (isEdit && svc && !svc.isNew) return pkg;
        const next = pkg.services.filter((s) => s.key !== svcKey);
        return {
          ...pkg,
          services: next.length ? next : [emptyPackageServiceRow()],
        };
      }),
    );
  };

  return (
    <div className="a-stack a-service-packages-editor">
      <div className="a-field__hint">
        规则：以「套餐包」设定授权总量与生效起止；包内可包含一个或多个技术服务。同一技术服务不可出现在多个套餐包中。核验类服务的业务类型与
        Web页面/API 使用方式仍配置在技术服务上。套餐额度仅在生效期内可消耗。
        {isEdit
          ? " 已开通的技术服务不可移除，可调整所属套餐额度与有效期，或停止/恢复整包；本次新增的套餐与服务可移除。"
          : ""}
      </div>

      {packages.map((pkg, pkgIndex) => {
        const pkgLocked = isEdit && !pkg.isNew;
        const canRemovePkg = isEdit ? Boolean(pkg.isNew) : packages.length > 1;
        const svcColSpan = 2;

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
              </div>
              <div className="a-service-package__meta">
                <label className="a-field a-field--inline">
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
                      {pkg.usedCount.toLocaleString()}
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
                    {pkg.stopped ? (
                      <span className="a-tag a-tag--er">已停止</span>
                    ) : (
                      <span className="a-tag a-tag--ok">可使用</span>
                    )}
                  </div>
                ) : null}
                <div className="a-actions a-actions--nowrap">
                  {pkgLocked ? (
                    <TableAction
                      icon={pkg.stopped ? <IconEnable /> : <IconDisable />}
                      onClick={() => updatePkg(pkg.key, { stopped: !pkg.stopped })}
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
                      移除套餐
                    </TableAction>
                  ) : null}
                </div>
              </div>
            </header>

            <div className="a-service-package__body">
              <div className="a-service-package__section-label">包内技术服务</div>
              <div className="a-table-wrap">
                <table className="a-table a-table--compact">
                  <thead>
                    <tr>
                      <th>技术服务</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pkg.services.map((svc) => {
                      const locked = isEdit && !svc.isNew;
                      const canRemoveSvc = isEdit
                        ? Boolean(svc.isNew) && pkg.services.length > 1
                        : pkg.services.length > 1;
                      const hasSubparams = Boolean(svc.product && isVerifyProduct(svc.product));

                      return (
                        <Fragment key={svc.key}>
                          <tr className={hasSubparams ? "a-product-row--has-subparams" : undefined}>
                            <td>
                              {locked && svc.product ? (
                                <span>{productName(svc.product)}</span>
                              ) : (
                                <ProductCombobox
                                  value={svc.product}
                                  taken={takenProducts}
                                  onChange={(code) =>
                                    updateSvc(pkg.key, svc.key, patchServiceProduct(svc, code))
                                  }
                                />
                              )}
                            </td>
                            <td>
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
                          {hasSubparams ? (
                            <ProductSubparamsRow colSpan={svcColSpan}>
                              <ProductVerifyOptions
                                businessTypes={svc.businessTypes}
                                usageChannels={svc.usageChannels}
                                onChange={(patch) => updateSvc(pkg.key, svc.key, patch)}
                              />
                            </ProductSubparamsRow>
                          ) : null}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="a-inline-actions" style={{ marginTop: 10 }}>
                <button
                  type="button"
                  className="a-btn a-btn--sm"
                  disabled={takenProducts.size >= CONFIGURABLE_PRODUCTS.length}
                  onClick={() => addService(pkg.key)}
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
          disabled={takenProducts.size >= CONFIGURABLE_PRODUCTS.length}
          onClick={addPkg}
        >
          新增套餐包
        </button>
        {takenProducts.size > 0 ? (
          <span className="a-field__hint">
            已配置技术服务：
            {[...takenProducts].map((code) => productName(code as ProductCode)).join("、")}
          </span>
        ) : null}
      </div>
    </div>
  );
}
