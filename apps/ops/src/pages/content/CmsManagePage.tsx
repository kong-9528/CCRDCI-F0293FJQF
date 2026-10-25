import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconEdit, IconPlus, IconTrash } from "@/components/icons/UiIcons";
import {
  CMS_SCHEMAS,
  CMS_STATUS_LABEL,
  useCmsArticleStore,
  type CmsArticle,
  type CmsCatalog,
  type CmsSchemaId,
} from "@/lib/cmsArticleStore";

type CatalogForm = {
  name: string;
  parentId: string;
  sort: string;
  schemaId: CmsSchemaId;
};

const EMPTY_CATALOG: CatalogForm = {
  name: "",
  parentId: "",
  sort: "10",
  schemaId: "faq",
};

export function CmsManagePage() {
  const store = useCmsArticleStore();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [catalogDialog, setCatalogDialog] = useState<"create" | "edit" | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<CmsCatalog | null>(null);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>(EMPTY_CATALOG);
  const [error, setError] = useState<string | null>(null);

  const [deleteCatalog, setDeleteCatalog] = useState<CmsCatalog | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<CmsArticle | null>(null);
  const [approveRow, setApproveRow] = useState<CmsArticle | null>(null);
  const [rejectRow, setRejectRow] = useState<CmsArticle | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const flatCatalogs = store.flatCatalogs;
  const selectedExists = Boolean(selectedId && store.getCatalog(selectedId));

  useEffect(() => {
    if (selectedExists) return;
    setSelectedId(flatCatalogs[0]?.catalog.id ?? null);
  }, [selectedExists, flatCatalogs]);

  const selected = selectedId ? store.getCatalog(selectedId) : undefined;
  const articles = selectedId ? store.listArticles(selectedId) : [];

  const openCreateCatalog = (parentId = "") => {
    setEditingCatalog(null);
    setCatalogForm({ ...EMPTY_CATALOG, parentId });
    setError(null);
    setCatalogDialog("create");
  };

  const openEditCatalog = (c: CmsCatalog) => {
    setEditingCatalog(c);
    setCatalogForm({
      name: c.name,
      parentId: c.parentId ?? "",
      sort: String(c.sort),
      schemaId: c.schemaId,
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
        schemaId: catalogForm.schemaId,
      };
      if (catalogDialog === "create") {
        const created = store.createCatalog(input);
        setSelectedId(created.id);
      } else if (editingCatalog) {
        store.updateCatalog(editingCatalog.id, input);
      }
      setCatalogDialog(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const confirmDeleteCatalog = () => {
    if (!deleteCatalog) return;
    const err = store.deleteCatalog(deleteCatalog.id);
    if (err) {
      setError(err);
      setDeleteCatalog(null);
      return;
    }
    if (selectedId === deleteCatalog.id) setSelectedId(null);
    setDeleteCatalog(null);
  };

  const confirmDeleteArticle = () => {
    if (!deleteArticle) return;
    const err = store.deleteArticle(deleteArticle.id);
    if (err) setError(err);
    setDeleteArticle(null);
  };

  return (
    <div className="a-tech-shelf a-cms">
      <aside className="a-tech-shelf__tree a-card">
        <div className="a-tech-shelf__pane-head">
          <h3 className="a-tech-shelf__pane-title">文章目录</h3>
          <button type="button" className="a-btn a-btn--sm" onClick={() => openCreateCatalog()}>
            新增目录
          </button>
        </div>
        <div className="a-tech-shelf__tree-body">
          {store.flatCatalogs.length === 0 ? (
            <div className="a-empty">暂无目录</div>
          ) : (
            <ul className="a-tech-shelf-tree__list">
              {store.flatCatalogs.map(({ catalog, depth }) => {
                const active = catalog.id === selectedId;
                const schemaLabel = CMS_SCHEMAS[catalog.schemaId].label;
                return (
                  <li key={catalog.id} className="a-tech-shelf-tree__item">
                    <div
                      className={`a-tech-shelf-tree__row${active ? " is-active" : ""}`}
                      style={{ paddingLeft: 12 + depth * 16 }}
                    >
                      <button
                        type="button"
                        className="a-tech-shelf-tree__label"
                        onClick={() => setSelectedId(catalog.id)}
                      >
                        <span className="a-tech-shelf-tree__name">{catalog.name}</span>
                        <span className="a-tech-shelf-tree__sort">
                          {schemaLabel} · 排序 {catalog.sort}
                        </span>
                      </button>
                      <div className="a-tech-shelf-tree__actions">
                        <TableAction
                          icon={<IconEdit />}
                          title="编辑目录"
                          onClick={() => openEditCatalog(catalog)}
                        >
                          编辑
                        </TableAction>
                        <TableAction
                          icon={<IconPlus />}
                          title="新增子目录"
                          onClick={() => openCreateCatalog(catalog.id)}
                        >
                          子目录
                        </TableAction>
                        <TableAction
                          icon={<IconTrash />}
                          title="删除目录"
                          danger
                          onClick={() => setDeleteCatalog(catalog)}
                        >
                          删除
                        </TableAction>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </aside>

      <section className="a-tech-shelf__main a-card">
        <div className="a-tech-shelf__pane-head">
          <div>
            <h3 className="a-tech-shelf__pane-title">
              {selected ? selected.name : "文章列表"}
            </h3>
            <p className="a-tech-shelf__pane-desc">
              {selected
                ? `内容模型：${CMS_SCHEMAS[selected.schemaId].label}（${CMS_SCHEMAS[selected.schemaId].description}）；新增/修改需审批后发布`
                : "请选择左侧目录"}
            </p>
          </div>
          <button
            type="button"
            className="a-btn a-btn--primary a-btn--sm"
            disabled={!selected}
            onClick={() =>
              selected && navigate(`/content/articles/new?catalogId=${selected.id}`)
            }
          >
            新增文章
          </button>
        </div>

        {error ? (
          <div className="a-card__body" style={{ paddingBottom: 0 }}>
            <div className="a-form-error">{error}</div>
          </div>
        ) : null}

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>标题</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {!selected ? (
                <tr>
                  <td colSpan={4}>
                    <div className="a-empty">请选择左侧目录</div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="a-empty">该目录下暂无文章</div>
                  </td>
                </tr>
              ) : (
                articles.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>
                      <span className={`a-cms-status a-cms-status--${row.status}`}>
                        {CMS_STATUS_LABEL[row.status]}
                      </span>
                      {row.status === "rejected" && row.rejectReason ? (
                        <div className="a-muted" style={{ fontSize: 12, marginTop: 4 }}>
                          驳回：{row.rejectReason}
                        </div>
                      ) : null}
                    </td>
                    <td>{row.updatedAt}</td>
                    <td>
                      <div className="a-inline-actions">
                        {row.status !== "pending" ? (
                          <Link
                            className="a-link-action"
                            to={`/content/articles/${row.id}/edit`}
                          >
                            编辑
                          </Link>
                        ) : null}
                        {row.status === "draft" || row.status === "rejected" ? (
                          <TableAction
                            icon={<IconPlus />}
                            onClick={() => {
                              try {
                                store.submit(row.id);
                                setError(null);
                              } catch (e) {
                                setError(e instanceof Error ? e.message : "提交失败");
                              }
                            }}
                          >
                            提交审批
                          </TableAction>
                        ) : null}
                        {row.status === "pending" ? (
                          <>
                            <TableAction icon={<IconPlus />} onClick={() => setApproveRow(row)}>
                              通过
                            </TableAction>
                            <TableAction
                              icon={<IconTrash />}
                              danger
                              onClick={() => {
                                setRejectReason("");
                                setRejectRow(row);
                              }}
                            >
                              驳回
                            </TableAction>
                          </>
                        ) : null}
                        {row.status !== "pending" ? (
                          <TableAction
                            icon={<IconTrash />}
                            danger
                            onClick={() => setDeleteArticle(row)}
                          >
                            删除
                          </TableAction>
                        ) : null}
                      </div>
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
                  <option value="">无（根目录）</option>
                  {store.flatCatalogs
                    .filter(({ catalog }) => catalog.id !== editingCatalog?.id)
                    .map(({ catalog, depth }) => (
                      <option key={catalog.id} value={catalog.id}>
                        {"—".repeat(depth)}
                        {depth ? " " : ""}
                        {catalog.name}
                      </option>
                    ))}
                </select>
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
                <span className="a-field__label">
                  内容模型 <span className="a-req">*</span>
                </span>
                <select
                  className="a-select"
                  value={catalogForm.schemaId}
                  onChange={(e) =>
                    setCatalogForm((p) => ({
                      ...p,
                      schemaId: e.target.value as CmsSchemaId,
                    }))
                  }
                >
                  {(Object.keys(CMS_SCHEMAS) as CmsSchemaId[]).map((key) => (
                    <option key={key} value={key}>
                      {CMS_SCHEMAS[key].label} — {CMS_SCHEMAS[key].description}
                    </option>
                  ))}
                </select>
                <span className="a-field__hint">
                  二次开发可在 cmsArticleStore 中扩展 CMS_SCHEMAS，不同目录绑定不同字段集
                </span>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">排序值</span>
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
            {error && catalogDialog ? <div className="a-form-error">{error}</div> : null}
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

      {rejectRow ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setRejectRow(null)}
        >
          <div
            className="a-modal a-modal--md"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">驳回审批</h3>
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">驳回原因</span>
                <textarea
                  className="a-textarea"
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                />
              </div>
            </div>
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setRejectRow(null)}>
                取消
              </button>
              <button
                type="button"
                className="a-btn a-btn--danger"
                onClick={() => {
                  try {
                    store.reject(rejectRow.id, rejectReason);
                    setRejectRow(null);
                    setError(null);
                  } catch (e) {
                    setError(e instanceof Error ? e.message : "驳回失败");
                  }
                }}
              >
                确认驳回
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(deleteCatalog)}
        title="确认删除目录"
        description={
          deleteCatalog
            ? `确定删除目录「${deleteCatalog.name}」吗？有子目录或文章时不可删除。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setDeleteCatalog(null)}
        onConfirm={confirmDeleteCatalog}
      />
      <ConfirmDialog
        open={Boolean(deleteArticle)}
        title="确认删除文章"
        description={
          deleteArticle ? `确定删除文章「${deleteArticle.title}」吗？` : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setDeleteArticle(null)}
        onConfirm={confirmDeleteArticle}
      />
      <ConfirmDialog
        open={Boolean(approveRow)}
        title="确认发布"
        description={
          approveRow
            ? `确定通过审批并发布「${approveRow.title}」吗？`
            : ""
        }
        confirmText="通过并发布"
        onCancel={() => setApproveRow(null)}
        onConfirm={() => {
          if (!approveRow) return;
          try {
            store.approve(approveRow.id);
            setError(null);
          } catch (e) {
            setError(e instanceof Error ? e.message : "审批失败");
          }
          setApproveRow(null);
        }}
      />
    </div>
  );
}
