import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconPlus, IconTrash } from "@/components/icons/UiIcons";
import {
  CMS_SCHEMA_TEMPLATES,
  catalogOptionLabel,
  useCmsArticleStore,
  type CmsCatalog,
  type CmsSchemaTemplateId,
} from "@/lib/cmsArticleStore";

type CatalogForm = {
  name: string;
  sort: string;
  templateId: CmsSchemaTemplateId;
};

const EMPTY_CREATE: CatalogForm = {
  name: "",
  sort: "10",
  templateId: "blank",
};

export function CmsCatalogManagePage() {
  const store = useCmsArticleStore();
  const [dialog, setDialog] = useState<"create" | "edit" | null>(null);
  const [parentId, setParentId] = useState<string | null>(null);
  const [editing, setEditing] = useState<CmsCatalog | null>(null);
  const [form, setForm] = useState<CatalogForm>(EMPTY_CREATE);
  const [error, setError] = useState<string | null>(null);
  const [deleteRow, setDeleteRow] = useState<CmsCatalog | null>(null);

  const openCreateRoot = () => {
    setEditing(null);
    setParentId(null);
    setForm({ ...EMPTY_CREATE });
    setError(null);
    setDialog("create");
  };

  const openCreateChild = (parent: CmsCatalog) => {
    setEditing(null);
    setParentId(parent.id);
    setForm({ ...EMPTY_CREATE, sort: "10" });
    setError(null);
    setDialog("create");
  };

  const openEdit = (row: CmsCatalog) => {
    setEditing(row);
    setParentId(row.parentId);
    setForm({
      name: row.name,
      sort: String(row.sort),
      templateId: "blank",
    });
    setError(null);
    setDialog("edit");
  };

  const submit = () => {
    try {
      if (dialog === "create") {
        store.createCatalog({
          name: form.name,
          parentId,
          sort: Number(form.sort || "10"),
          templateId: form.templateId,
        });
      } else if (editing) {
        store.updateCatalog(editing.id, {
          name: form.name,
          sort: Number(form.sort || "10"),
        });
      }
      setDialog(null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const confirmDelete = () => {
    if (!deleteRow) return;
    const err = store.deleteCatalog(deleteRow.id);
    if (err) {
      setError(err);
      setDeleteRow(null);
      return;
    }
    setDeleteRow(null);
    setError(null);
  };

  const parentName =
    parentId != null ? store.getCatalog(parentId)?.name ?? "未知目录" : null;

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          目录管理
          <span className="a-card__extra a-muted">
            维护文章目录树；目录 ID + 文章 ID + 字段标识可唯一定位表单元素
          </span>
          <button type="button" className="a-btn a-btn--primary a-btn--sm" onClick={openCreateRoot}>
            新增根目录
          </button>
        </div>

        {error && !dialog ? (
          <div className="a-card__body" style={{ paddingBottom: 0 }}>
            <div className="a-form-error">{error}</div>
          </div>
        ) : null}

        <div className="a-card__body a-card__body--flush">
          <table className="a-table a-cms-catalog-table">
            <thead>
              <tr>
                <th className="a-cms-catalog-table__name">目录名称</th>
                <th className="a-cms-id-col">目录 ID</th>
                <th style={{ width: 100 }}>排序</th>
                <th style={{ width: 320 }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {store.flatCatalogs.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="a-empty">暂无目录，请新增根目录</div>
                  </td>
                </tr>
              ) : (
                store.flatCatalogs.map(({ catalog, depth }) => (
                  <tr key={catalog.id}>
                    <td className="a-cms-catalog-table__name">
                      <span className="a-cms-catalog-name" style={{ paddingLeft: depth * 20 }}>
                        {depth > 0 ? (
                          <span className="a-muted" aria-hidden>
                            └{" "}
                          </span>
                        ) : null}
                        {catalog.name}
                      </span>
                      <span className="a-muted" style={{ marginLeft: 8, fontSize: 12 }}>
                        {catalog.fields.length} 个字段
                      </span>
                    </td>
                    <td className="a-cms-id-col">
                      <code className="a-code a-cms-id">{catalog.id}</code>
                    </td>
                    <td>{catalog.sort}</td>
                    <td>
                      <div className="a-inline-actions">
                        <TableAction icon={<IconEdit />} onClick={() => openEdit(catalog)}>
                          编辑
                        </TableAction>
                        <TableAction
                          icon={<IconPlus />}
                          onClick={() => openCreateChild(catalog)}
                        >
                          子目录
                        </TableAction>
                        <Link
                          className="a-link-action"
                          to={`/content/catalogs/${catalog.id}/schema`}
                        >
                          表单编排
                        </Link>
                        <TableAction
                          icon={<IconTrash />}
                          danger
                          onClick={() => setDeleteRow(catalog)}
                        >
                          删除
                        </TableAction>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {dialog ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setDialog(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {dialog === "create"
                ? parentName
                  ? `在「${parentName}」下新增子目录`
                  : "新增根目录"
                : "编辑目录"}
            </h3>
            <div className="a-form a-form--modal a-form--stack">
              {dialog === "edit" && editing?.parentId ? (
                <div className="a-field a-field--stack">
                  <span className="a-field__label">上级目录</span>
                  <input
                    className="a-input"
                    disabled
                    value={
                      store.flatCatalogs.find(({ catalog }) => catalog.id === editing.parentId)
                        ? catalogOptionLabel(
                            store.getCatalog(editing.parentId!)!.name,
                            store.flatCatalogs.find(
                              ({ catalog }) => catalog.id === editing.parentId,
                            )!.depth,
                          )
                        : "—"
                    }
                  />
                </div>
              ) : null}
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  目录名称 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">排序</span>
                <input
                  className="a-input"
                  inputMode="numeric"
                  value={form.sort}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      sort: e.target.value.replace(/[^\d-]/g, ""),
                    }))
                  }
                />
              </div>
              {dialog === "create" ? (
                <div className="a-field a-field--stack">
                  <span className="a-field__label">初始表单模板</span>
                  <select
                    className="a-select"
                    value={form.templateId}
                    onChange={(e) =>
                      setForm((p) => ({
                        ...p,
                        templateId: e.target.value as CmsSchemaTemplateId,
                      }))
                    }
                  >
                    {(Object.keys(CMS_SCHEMA_TEMPLATES) as CmsSchemaTemplateId[]).map((key) => (
                      <option key={key} value={key}>
                        {CMS_SCHEMA_TEMPLATES[key].label} —{" "}
                        {CMS_SCHEMA_TEMPLATES[key].description}
                      </option>
                    ))}
                  </select>
                  <span className="a-field__hint">创建                    创建后可随时进入「表单编排」调整字段
                  </span>
                </div>
              ) : null}
            </div>
            {error && dialog ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submit}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteRow)}
        title="确认删除目录"
        description={
          deleteRow
            ? `确定删除目录「${deleteRow.name}」吗？有子目录或文章时不可删除。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setDeleteRow(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
