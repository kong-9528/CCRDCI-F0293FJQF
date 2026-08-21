import { useMemo, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import {
  VISIBILITY_LABEL,
  useContentStore,
  type HelpArticle,
  type HelpCatalog,
  type Visibility,
} from "@/lib/contentStore";

type CatalogForm = { name: string; parentId: string; weight: string };
type ArticleForm = {
  title: string;
  catalogId: string;
  weight: string;
  summary: string;
  body: string;
};

const EMPTY_CATALOG: CatalogForm = { name: "", parentId: "", weight: "10" };
const EMPTY_ARTICLE: ArticleForm = {
  title: "",
  catalogId: "",
  weight: "10",
  summary: "",
  body: "",
};

type Filters = { keyword: string; type: "" | "catalog" | "article"; status: string };

const EMPTY_FILTERS: Filters = { keyword: "", type: "", status: "" };

export function ContentManagePage() {
  const store = useContentStore();
  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  const [catalogDialog, setCatalogDialog] = useState<"create" | "edit" | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<HelpCatalog | null>(null);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>(EMPTY_CATALOG);

  const [articleDialog, setArticleDialog] = useState<"create" | "edit" | null>(null);
  const [editingArticle, setEditingArticle] = useState<HelpArticle | null>(null);
  const [articleForm, setArticleForm] = useState<ArticleForm>(EMPTY_ARTICLE);

  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteCatalog, setConfirmDeleteCatalog] = useState<HelpCatalog | null>(null);
  const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<HelpArticle | null>(null);
  const [confirmVisCatalog, setConfirmVisCatalog] = useState<HelpCatalog | null>(null);
  const [confirmVisArticle, setConfirmVisArticle] = useState<HelpArticle | null>(null);

  const parentOptions = useMemo(
    () => store.catalogSelectOptions(editingCatalog?.id),
    [store, editingCatalog],
  );
  const catalogOptions = store.catalogSelectOptions();

  const rows = useMemo(() => {
    const kw = applied.keyword.trim().toLowerCase();
    return store.sortedContentTree.filter((row) => {
      if (applied.type && row.kind !== applied.type) return false;
      if (row.kind === "catalog") {
        if (applied.status && row.catalog.status !== applied.status) return false;
        if (kw && !row.catalog.name.toLowerCase().includes(kw)) return false;
      } else {
        if (applied.status && row.article.status !== applied.status) return false;
        if (kw) {
          const a = row.article;
          const hit =
            a.title.toLowerCase().includes(kw) ||
            a.summary.toLowerCase().includes(kw) ||
            a.body.toLowerCase().includes(kw);
          if (!hit) return false;
        }
      }
      return true;
    });
  }, [store.sortedContentTree, applied]);

  const openCreateCatalog = (parentId = "") => {
    setEditingCatalog(null);
    setCatalogForm({ ...EMPTY_CATALOG, parentId });
    setError(null);
    setCatalogDialog("create");
  };

  const openEditCatalog = (row: HelpCatalog) => {
    setEditingCatalog(row);
    setCatalogForm({
      name: row.name,
      parentId: row.parentId ?? "",
      weight: String(row.weight),
    });
    setError(null);
    setCatalogDialog("edit");
  };

  const openCreateArticle = (catalogId = "") => {
    setEditingArticle(null);
    setArticleForm({ ...EMPTY_ARTICLE, catalogId });
    setError(null);
    setArticleDialog("create");
  };

  const openEditArticle = (row: HelpArticle) => {
    setEditingArticle(row);
    setArticleForm({
      title: row.title,
      catalogId: row.catalogId ?? "",
      weight: String(row.weight),
      summary: row.summary,
      body: row.body,
    });
    setError(null);
    setArticleDialog("edit");
  };

  const submitCatalog = () => {
    if (!catalogForm.name.trim()) {
      setError("请填写目录名称");
      return;
    }
    const weight = Number(catalogForm.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const parentId = catalogForm.parentId || null;
    if (catalogDialog === "create") {
      store.createCatalog({ name: catalogForm.name, parentId, weight });
    } else if (editingCatalog) {
      store.updateCatalog(editingCatalog.id, {
        name: catalogForm.name,
        parentId,
        weight,
      });
    }
    setCatalogDialog(null);
  };

  const submitArticle = () => {
    if (!articleForm.title.trim()) {
      setError("请填写文章标题");
      return;
    }
    const weight = Number(articleForm.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const payload = {
      title: articleForm.title,
      catalogId: articleForm.catalogId || null,
      weight,
      summary: articleForm.summary,
      body: articleForm.body,
    };
    if (articleDialog === "create") store.createArticle(payload);
    else if (editingArticle) store.updateArticle(editingArticle.id, payload);
    setArticleDialog(null);
  };

  const visLabel = (status: Visibility) => VISIBILITY_LABEL[status];

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">名称</span>
            <input
              className="a-input"
              style={{ minWidth: 200 }}
              placeholder="目录名 / 文章标题或正文"
              value={draft.keyword}
              onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            />
          </div>
          <div className="a-field">
            <span className="a-field__label">类型</span>
            <select
              className="a-select"
              value={draft.type}
              onChange={(e) =>
                setDraft((p) => ({
                  ...p,
                  type: e.target.value as Filters["type"],
                }))
              }
            >
              <option value="">全部</option>
              <option value="catalog">目录</option>
              <option value="article">文章</option>
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">状态</span>
            <select
              className="a-select"
              value={draft.status}
              onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value }))}
            >
              <option value="">全部</option>
              <option value="visible">显示</option>
              <option value="hidden">隐藏</option>
            </select>
          </div>
          <button
            type="button"
            className="a-btn"
            onClick={() => {
              setDraft(EMPTY_FILTERS);
              setApplied(EMPTY_FILTERS);
            }}
          >
            重置
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => setApplied({ ...draft })}
          >
            查询
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => openCreateCatalog()}
          >
            新增目录
          </button>
          <button
            type="button"
            className="a-btn a-btn--primary"
            onClick={() => openCreateArticle()}
          >
            新增文章
          </button>
        </div>

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>排序权重</th>
                <th>状态</th>
                <th>浏览量</th>
                <th>更新时间</th>
                <th>维护人</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="a-empty">暂无内容</div>
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  if (row.kind === "catalog") {
                    const c = row.catalog;
                    return (
                      <tr key={`c-${c.id}`}>
                        <td>
                          <span style={{ paddingLeft: row.depth * 16 }}>
                            {row.depth > 0 ? "└ " : ""}
                            {c.name}
                          </span>
                        </td>
                        <td>目录</td>
                        <td className="num">{c.weight}</td>
                        <td>
                          <span
                            className={`a-tag ${
                              c.status === "visible" ? "a-tag--ok" : "a-tag--muted"
                            }`}
                          >
                            {visLabel(c.status)}
                          </span>
                        </td>
                        <td className="num">—</td>
                        <td>—</td>
                        <td>—</td>
                        <td>
                          <div className="a-actions">
                            <button
                              type="button"
                              className="a-btn a-btn--text a-btn--sm"
                              onClick={() => openEditCatalog(c)}
                            >
                              编辑
                            </button>
                            <button
                              type="button"
                              className="a-btn a-btn--text a-btn--sm"
                              onClick={() => setConfirmVisCatalog(c)}
                            >
                              {c.status === "visible" ? "隐藏" : "显示"}
                            </button>
                            <button
                              type="button"
                              className="a-btn a-btn--text a-btn--sm"
                              onClick={() => setConfirmDeleteCatalog(c)}
                            >
                              删除
                            </button>
                            <button
                              type="button"
                              className="a-btn a-btn--text a-btn--sm"
                              onClick={() => openCreateCatalog(c.id)}
                            >
                              新增目录
                            </button>
                            <button
                              type="button"
                              className="a-btn a-btn--text a-btn--sm"
                              onClick={() => openCreateArticle(c.id)}
                            >
                              新增文章
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  }

                  const a = row.article;
                  return (
                    <tr key={`a-${a.id}`}>
                      <td>
                        <span style={{ paddingLeft: row.depth * 16 }}>
                          {row.depth > 0 ? "└ " : ""}
                          {a.title}
                        </span>
                      </td>
                      <td>文章</td>
                      <td className="num">{a.weight}</td>
                      <td>
                        <span
                          className={`a-tag ${
                            a.status === "visible" ? "a-tag--ok" : "a-tag--muted"
                          }`}
                        >
                          {visLabel(a.status)}
                        </span>
                      </td>
                      <td className="num">{a.views.toLocaleString()}</td>
                      <td>{a.updatedAt}</td>
                      <td>{a.maintainer}</td>
                      <td>
                        <div className="a-actions">
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => openEditArticle(a)}
                          >
                            编辑
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setConfirmVisArticle(a)}
                          >
                            {a.status === "visible" ? "隐藏" : "显示"}
                          </button>
                          <button
                            type="button"
                            className="a-btn a-btn--text a-btn--sm"
                            onClick={() => setConfirmDeleteArticle(a)}
                          >
                            删除
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  <option value="">无（作为根目录）</option>
                  {parentOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
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
                  onChange={(e) =>
                    setCatalogForm((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">排序权重（小靠前）</span>
                <input
                  className="a-input"
                  inputMode="numeric"
                  value={catalogForm.weight}
                  onChange={(e) =>
                    setCatalogForm((p) => ({
                      ...p,
                      weight: e.target.value.replace(/\D/g, ""),
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

      {articleDialog ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setArticleDialog(null)}
        >
          <div
            className="a-modal a-modal--lg"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {articleDialog === "create" ? "新增文章" : "编辑文章"}
            </h3>
            {articleDialog === "create" ? (
              <p className="a-modal__desc">
                新增文章默认为隐藏，需手动「显示」后才会在前端展示。
              </p>
            ) : null}
            <div className="a-form a-form--modal a-form--stack">
              <div className="a-field a-field--stack">
                <span className="a-field__label">所属目录</span>
                <select
                  className="a-select"
                  value={articleForm.catalogId}
                  onChange={(e) =>
                    setArticleForm((p) => ({ ...p, catalogId: e.target.value }))
                  }
                >
                  <option value="">（根目录）</option>
                  {catalogOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">
                  文章标题 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={articleForm.title}
                  onChange={(e) =>
                    setArticleForm((p) => ({ ...p, title: e.target.value }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">排序权重</span>
                <input
                  className="a-input"
                  value={articleForm.weight}
                  onChange={(e) =>
                    setArticleForm((p) => ({
                      ...p,
                      weight: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">摘要</span>
                <input
                  className="a-input"
                  value={articleForm.summary}
                  onChange={(e) =>
                    setArticleForm((p) => ({ ...p, summary: e.target.value }))
                  }
                />
              </div>
              <div className="a-field a-field--stack">
                <span className="a-field__label">正文（支持 HTML 图文混排）</span>
                <textarea
                  className="a-textarea"
                  rows={8}
                  value={articleForm.body}
                  onChange={(e) =>
                    setArticleForm((p) => ({ ...p, body: e.target.value }))
                  }
                />
              </div>
            </div>
            {error ? <div className="a-form-error">{error}</div> : null}
            <div className="a-modal__actions">
              <button type="button" className="a-btn" onClick={() => setArticleDialog(null)}>
                取消
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={submitArticle}>
                保存
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ConfirmDialog
        open={Boolean(confirmDeleteCatalog)}
        title="确认删除目录"
        description={
          confirmDeleteCatalog
            ? `确定删除目录「${confirmDeleteCatalog.name}」吗？名下有子目录或文章时不可删除。`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDeleteCatalog(null)}
        onConfirm={() => {
          if (!confirmDeleteCatalog) return;
          const err = store.deleteCatalog(confirmDeleteCatalog.id);
          setConfirmDeleteCatalog(null);
          if (err) window.alert(err);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDeleteArticle)}
        title="确认删除文章"
        description={
          confirmDeleteArticle
            ? `删除后后台列表不再展示，前端亦不可访问（软删除）。确定删除「${confirmDeleteArticle.title}」吗？`
            : ""
        }
        confirmText="删除"
        danger
        onCancel={() => setConfirmDeleteArticle(null)}
        onConfirm={() => {
          if (!confirmDeleteArticle) return;
          store.softDeleteArticle(confirmDeleteArticle.id);
          setConfirmDeleteArticle(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmVisCatalog)}
        title={confirmVisCatalog?.status === "visible" ? "确认隐藏目录" : "确认显示目录"}
        description={
          confirmVisCatalog
            ? confirmVisCatalog.status === "visible"
              ? `隐藏后，前端帮助中心将不可见该目录及其下属文章。确定隐藏「${confirmVisCatalog.name}」吗？`
              : `确定重新显示目录「${confirmVisCatalog.name}」吗？`
            : ""
        }
        confirmText={confirmVisCatalog?.status === "visible" ? "隐藏" : "显示"}
        danger={confirmVisCatalog?.status === "visible"}
        onCancel={() => setConfirmVisCatalog(null)}
        onConfirm={() => {
          if (!confirmVisCatalog) return;
          store.setCatalogVisibility(
            confirmVisCatalog.id,
            confirmVisCatalog.status === "visible" ? "hidden" : "visible",
          );
          setConfirmVisCatalog(null);
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmVisArticle)}
        title={confirmVisArticle?.status === "visible" ? "确认隐藏文章" : "确认显示文章"}
        description={
          confirmVisArticle
            ? confirmVisArticle.status === "visible"
              ? `隐藏后前端帮助中心将不再展示「${confirmVisArticle.title}」，确定继续吗？`
              : `显示后「${confirmVisArticle.title}」将对前端用户可见，确定继续吗？`
            : ""
        }
        confirmText={confirmVisArticle?.status === "visible" ? "隐藏" : "显示"}
        danger={confirmVisArticle?.status === "visible"}
        onCancel={() => setConfirmVisArticle(null)}
        onConfirm={() => {
          if (!confirmVisArticle) return;
          store.setArticleVisibility(
            confirmVisArticle.id,
            confirmVisArticle.status === "visible" ? "hidden" : "visible",
          );
          setConfirmVisArticle(null);
        }}
      />
    </>
  );
}
