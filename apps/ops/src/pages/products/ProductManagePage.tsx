import { useEffect, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Switch } from "@/components/Switch";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconPlus } from "@/components/icons/UiIcons";
import {
  useTechShelfStore,
  type TechShelfCatalog,
  type TechShelfService,
} from "@/lib/techShelfStore";

type CatalogForm = {
  name: string;
  parentId: string;
  sort: string;
};

type ServiceForm = {
  name: string;
  enabled: boolean;
};

const EMPTY_CATALOG: CatalogForm = { name: "", parentId: "", sort: "10" };
const EMPTY_SERVICE: ServiceForm = { name: "", enabled: true };

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

function TreeNodes({
  nodes,
  selectedId,
  onSelect,
  onEdit,
  onAddChild,
}: {
  nodes: ReturnType<typeof useTechShelfStore>["tree"];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onEdit: (c: TechShelfCatalog) => void;
  onAddChild: (parentId: string) => void;
}) {
  return (
    <ul className="a-tech-shelf-tree__list">
      {nodes.map((node) => {
        const { catalog } = node;
        const active = catalog.id === selectedId;
        return (
          <li key={catalog.id} className="a-tech-shelf-tree__item">
            <div
              className={`a-tech-shelf-tree__row${active ? " is-active" : ""}`}
              style={{ paddingLeft: 12 + node.depth * 16 }}
            >
              <button
                type="button"
                className="a-tech-shelf-tree__label"
                onClick={() => onSelect(catalog.id)}
              >
                <span className="a-tech-shelf-tree__name">{catalog.name}</span>
                <span className="a-tech-shelf-tree__sort">排序 {catalog.sort}</span>
              </button>
              <div className="a-tech-shelf-tree__actions">
                <TableAction icon={<IconEdit />} title="编辑目录" onClick={() => onEdit(catalog)}>
                  编辑
                </TableAction>
                <TableAction
                  icon={<IconPlus />}
                  title="新增子目录"
                  onClick={() => onAddChild(catalog.id)}
                >
                  子目录
                </TableAction>
              </div>
            </div>
            {node.children.length > 0 ? (
              <TreeNodes
                nodes={node.children}
                selectedId={selectedId}
                onSelect={onSelect}
                onEdit={onEdit}
                onAddChild={onAddChild}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

export function ProductManagePage() {
  const store = useTechShelfStore();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [catalogDialog, setCatalogDialog] = useState<"create" | "edit" | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<TechShelfCatalog | null>(null);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>(EMPTY_CATALOG);

  const [serviceDialog, setServiceDialog] = useState<"create" | "edit" | null>(null);
  const [editingService, setEditingService] = useState<TechShelfService | null>(null);
  const [serviceForm, setServiceForm] = useState<ServiceForm>(EMPTY_SERVICE);

  const [error, setError] = useState<string | null>(null);
  const [pendingEnable, setPendingEnable] = useState<{
    row: TechShelfService;
    next: boolean;
  } | null>(null);

  const flatTree = store.flatTree;
  const selectedExists = Boolean(selectedId && store.getCatalog(selectedId));

  useEffect(() => {
    if (selectedExists) return;
    const first = flatTree[0]?.catalog.id ?? null;
    setSelectedId(first);
  }, [selectedExists, flatTree]);

  const selectedCatalog = selectedId ? store.getCatalog(selectedId) : undefined;
  const services = selectedId ? store.listServices(selectedId) : [];
  const parentOptions = store.parentOptions(editingCatalog?.id);

  const openCreateRoot = () => {
    setEditingCatalog(null);
    setCatalogForm({ ...EMPTY_CATALOG, parentId: "" });
    setError(null);
    setCatalogDialog("create");
  };

  const openCreateChild = (parentId: string) => {
    setEditingCatalog(null);
    setCatalogForm({ ...EMPTY_CATALOG, parentId });
    setError(null);
    setCatalogDialog("create");
  };

  const openEditCatalog = (c: TechShelfCatalog) => {
    setEditingCatalog(c);
    setCatalogForm({
      name: c.name,
      parentId: c.parentId ?? "",
      sort: String(c.sort),
    });
    setError(null);
    setCatalogDialog("edit");
  };

  const submitCatalog = () => {
    try {
      const input = {
        name: catalogForm.name,
        parentId: catalogForm.parentId || null,
        sort: Number(catalogForm.sort || "10"),
      };
      if (catalogDialog === "create") {
        const created = store.createCatalog(input);
        setSelectedId(created.id);
      } else if (editingCatalog) {
        store.updateCatalog(editingCatalog.id, input);
      }
      setCatalogDialog(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const openCreateService = () => {
    if (!selectedId) {
      setError("请先选择左侧目录");
      return;
    }
    setEditingService(null);
    setServiceForm(EMPTY_SERVICE);
    setError(null);
    setServiceDialog("create");
  };

  const openEditService = (row: TechShelfService) => {
    setEditingService(row);
    setServiceForm({ name: row.name, enabled: row.enabled });
    setError(null);
    setServiceDialog("edit");
  };

  const submitService = () => {
    try {
      if (!selectedId) throw new Error("请先选择左侧目录");
      if (serviceDialog === "create") {
        store.createService(selectedId, serviceForm);
      } else if (editingService) {
        store.updateService(editingService.id, serviceForm);
      }
      setServiceDialog(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const confirmEnable = () => {
    if (!pendingEnable) return;
    store.setServiceEnabled(pendingEnable.row.id, pendingEnable.next);
    setPendingEnable(null);
  };

  return (
    <div className="a-tech-shelf">
      <aside className="a-tech-shelf__tree a-card">
        <div className="a-tech-shelf__pane-head">
          <h3 className="a-tech-shelf__pane-title">服务目录</h3>
          <button type="button" className="a-btn a-btn--sm" onClick={openCreateRoot}>
            新增根目录
          </button>
        </div>
        <div className="a-tech-shelf__tree-body">
          {store.tree.length === 0 ? (
            <div className="a-empty">暂无目录，请先新增根目录</div>
          ) : (
            <TreeNodes
              nodes={store.tree}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onEdit={openEditCatalog}
              onAddChild={openCreateChild}
            />
          )}
        </div>
      </aside>

      <section className="a-tech-shelf__main a-card">
        <div className="a-tech-shelf__pane-head">
          <div>
            <h3 className="a-tech-shelf__pane-title">
              {selectedCatalog ? selectedCatalog.name : "技术服务"}
            </h3>
            <p className="a-tech-shelf__pane-desc">
              {selectedCatalog
                ? "在当前目录下管理技术服务名称与开启状态"
                : "请选择左侧目录"}
            </p>
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary a-btn--sm"
            disabled={!selectedCatalog}
            onClick={openCreateService}
          >
            新增技术服务
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>技术服务名称</th>
                <th>是否开启</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {!selectedCatalog ? (
                <tr>
                  <td colSpan={3}>
                    <div className="a-empty">请选择左侧目录</div>
                  </td>
                </tr>
              ) : services.length === 0 ? (
                <tr>
                  <td colSpan={3}>
                    <div className="a-empty">该目录下暂无技术服务</div>
                  </td>
                </tr>
              ) : (
                services.map((row) => (
                  <tr key={row.id}>
                    <td>{row.name}</td>
                    <td>
                      <StatusSwitchCell
                        labelOn="已开启"
                        labelOff="已关闭"
                        checked={row.enabled}
                        ariaLabel={`${row.name} ${row.enabled ? "关闭" : "开启"}`}
                        onChange={(next) => setPendingEnable({ row, next })}
                      />
                    </td>
                    <td>
                      <TableAction
                        icon={<IconEdit />}
                        title="编辑"
                        onClick={() => openEditService(row)}
                      >
                        编辑
                      </TableAction>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {catalogDialog ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setCatalogDialog(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {catalogDialog === "create" ? "新增目录" : "编辑目录"}
            </h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">上级目录</span>
                <select
                  className="a-select"
                  value={catalogForm.parentId}
                  onChange={(e) =>
                    setCatalogForm((p) => ({ ...p, parentId: e.target.value }))
                  }
                >
                  <option value="">无（作为根节点）</option>
                  {parentOptions.map(({ catalog, depth }) => (
                    <option key={catalog.id} value={catalog.id}>
                      {"—".repeat(depth)}
                      {depth > 0 ? " " : ""}
                      {catalog.name}
                    </option>
                  ))}
                </select>
                <span className="a-field__hint">留空创建根节点；选择上级则创建叶子/子节点</span>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  目录名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={catalogForm.name}
                  onChange={(e) => setCatalogForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">排序值（同级越小越靠前）</span>
                <input
                  className="a-input"
                  inputMode="numeric"
                  value={catalogForm.sort}
                  onChange={(e) =>
                    setCatalogForm((p) => ({
                      ...p,
                      sort: e.target.value.replace(/[^\d-]/g, ""),
                    }))
                  }
                />
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setCatalogDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submitCatalog}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {serviceDialog ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setServiceDialog(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {serviceDialog === "create" ? "新增技术服务" : "编辑技术服务"}
            </h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">所属目录</span>
                <input
                  className="a-input"
                  value={selectedCatalog?.name ?? ""}
                  disabled
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  技术服务名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={serviceForm.name}
                  onChange={(e) => setServiceForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">是否开启</span>
                <StatusSwitchCell
                  labelOn="已开启"
                  labelOff="已关闭"
                  checked={serviceForm.enabled}
                  ariaLabel="是否开启"
                  onChange={(next) => setServiceForm((p) => ({ ...p, enabled: next }))}
                />
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setServiceDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submitService}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(pendingEnable)}
        title={pendingEnable?.next ? "确认开启技术服务" : "确认关闭技术服务"}
        description={
          pendingEnable?.next
            ? `确定开启「${pendingEnable.row.name}」吗？开启后客户可使用该技术服务。`
            : `确定关闭「${pendingEnable?.row.name ?? ""}」吗？关闭后客户将无法使用该技术服务。`
        }
        confirmText={pendingEnable?.next ? "开启" : "关闭"}
        danger={pendingEnable ? !pendingEnable.next : false}
        onCancel={() => setPendingEnable(null)}
        onConfirm={confirmEnable}
      />
    </div>
  );
}
