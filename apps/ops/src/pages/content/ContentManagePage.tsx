import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import {
  IconDisable,
  IconEdit,
  IconEnable,
  IconPlus,
  IconTrash,
} from "@/components/icons/UiIcons";
import {
  CONTENT_CHANNEL_LABEL,
  CONTENT_CHANNEL_OPTIONS,
  CONTENT_CHANNEL_DEFAULT,
  VISIBILITY_LABEL,
  useContentStore,
  type ContentChannel,
  type HelpArticle,
  type HelpCatalog,
  type Visibility,
} from "@/lib/contentStore";

export const CONTENT_CENTER_PATH = "/content/center";

type CatalogForm = { name: string; parentId: string; weight: string };

const EMPTY_CATALOG: CatalogForm = { name: "", parentId: "", weight: "10" };

type Filters = { keyword: string; type: "" | "catalog" | "article"; status: string };

const EMPTY_FILTERS: Filters = { keyword: "", type: "", status: "" };

function parseChannel(raw: string | null): ContentChannel {
  if (raw && (CONTENT_CHANNEL_OPTIONS as string[]).includes(raw)) {
    return raw as ContentChannel;
  }
  return CONTENT_CHANNEL_DEFAULT;
}

export function ContentManagePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const channel = parseChannel(searchParams.get("channel"));
  const store = useContentStore(channel);
  const isFaq = channel === "portal_faq";

  const [draft, setDraft] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  const [catalogDialog, setCatalogDialog] = useState<"create" | "edit" | null>(null);
  const [editingCatalog, setEditingCatalog] = useState<HelpCatalog | null>(null);
  const [catalogForm, setCatalogForm] = useState<CatalogForm>(EMPTY_CATALOG);

  const [error, setError] = useState<string | null>(null);
  const [confirmDeleteCatalog, setConfirmDeleteCatalog] = useState<HelpCatalog | null>(null);
  const [confirmDeleteArticle, setConfirmDeleteArticle] = useState<HelpArticle | null>(null);
  const [confirmVisCatalog, setConfirmVisCatalog] = useState<HelpCatalog | null>(null);
  const [confirmVisArticle, setConfirmVisArticle] = useState<HelpArticle | null>(null);

  const parentOptions = useMemo(
    () => store.catalogSelectOptions(editingCatalog?.id),
    [store, editingCatalog],
  );

  const catalogTypeLabel = "目录";
  const articleTypeLabel = isFaq ? "文章（问题）" : "文章";
  const channelLabel = CONTENT_CHANNEL_LABEL[channel];

  const setChannel = (next: ContentChannel) => {
    setSearchParams({ channel: next }, { replace: true });
    setDraft(EMPTY_FILTERS);
    setApplied(EMPTY_FILTERS);
  };

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

  const articleListBase = `${CONTENT_CENTER_PATH}/articles`;

  const openCreateArticle = (catalogId = "") => {
    const qs = new URLSearchParams({ channel });
    if (catalogId) qs.set("catalogId", catalogId);
    navigate(`${articleListBase}/new?${qs.toString()}`);
  };

  const openEditArticle = (row: HelpArticle) => {
    navigate(`${articleListBase}/${row.id}/edit?channel=${channel}`);
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

  const visLabel = (status: Visibility) => VISIBILITY_LABEL[status];

  return (
    <>
      <div className="a-card">
        <div className="a-toolbar">
          <div className="a-field">
            <span className="a-field__label">
              栏目 <span className="a-req">*</span>
            </span>
            <select
              className="a-select"
              value={channel}
              onChange={(e) => setChannel(e.target.value as ContentChannel)}
            >
              {CONTENT_CHANNEL_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {CONTENT_CHANNEL_LABEL[c]}
                </option>
              ))}
            </select>
          </div>
          <div className="a-field">
            <span className="a-field__label">名称</span>
            <input
              className="a-input"
              style={{ minWidth: 200 }}
              placeholder={
                isFaq ? "目录 / 问题标题或回答" : "目录 / 文章标题或正文"
              }
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
              <option value="catalog">{catalogTypeLabel}</option>
              <option value="article">{articleTypeLabel}</option>
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
            {isFaq ? "新增问题" : "新增文章"}
          </button>
        </div>

        {isFaq ? (
          <div className="a-card__body" style={{ paddingBottom: 0 }}>
            <p className="a-field__hint" style={{ margin: "0 0 8px" }}>
              门户常见问题支持目录层级；前台按目录+文章综合顺序<strong>平铺</strong>展示。文章标题为问题，正文为回答（富文本）。
            </p>
          </div>
        ) : null}

        <div className="a-card__body a-card__body--flush">
          <table className="a-table a-table--content-center">
            <thead>
              <tr>
                <th>名称</th>
                <th>类型</th>
                <th>排序权重</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>维护人</th>
                <th className="a-table__col-actions">操作</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7}>
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
                        <td>{catalogTypeLabel}</td>
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
                        <td>—</td>
                        <td>—</td>
                        <td>
                          <div className="a-actions">
                            <TableAction icon={<IconEdit />} onClick={() => openEditCatalog(c)}>
                              编辑
                            </TableAction>
                            <TableAction
                              icon={c.status === "visible" ? <IconDisable /> : <IconEnable />}
                              onClick={() => setConfirmVisCatalog(c)}
                            >
                              {c.status === "visible" ? "隐藏" : "显示"}
                            </TableAction>
                            <TableAction
                              icon={<IconTrash />}
                              danger
                              onClick={() => setConfirmDeleteCatalog(c)}
                            >
                              删除
                            </TableAction>
                            <TableAction
                              icon={<IconPlus />}
                              onClick={() => openCreateCatalog(c.id)}
                            >
                              新增子目录
                            </TableAction>
                            <TableAction
                              icon={<IconPlus />}
                              onClick={() => openCreateArticle(c.id)}
                            >
                              {isFaq ? "新增问题" : "新增文章"}
                            </TableAction>
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
                      <td>{articleTypeLabel}</td>
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
                      <td>{a.updatedAt}</td>
                      <td>{a.maintainer}</td>
                      <td>
                        <div className="a-actions">
                          <TableAction icon={<IconEdit />} onClick={() => openEditArticle(a)}>
                            编辑
                          </TableAction>
                          <TableAction
                            icon={a.status === "visible" ? <IconDisable /> : <IconEnable />}
                            onClick={() => setConfirmVisArticle(a)}
                          >
                            {a.status === "visible" ? "隐藏" : "显示"}
                          </TableAction>
                          <TableAction
                            icon={<IconTrash />}
                            danger
                            onClick={() => setConfirmDeleteArticle(a)}
                          >
                            删除
                          </TableAction>
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
        title={isFaq ? "确认删除问题" : "确认删除文章"}
        description={
          confirmDeleteArticle
            ? `删除后后台列表不再展示，「${channelLabel}」前台亦不可访问。确定删除「${confirmDeleteArticle.title}」吗？`
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
              ? `隐藏后，「${channelLabel}」将不可见该目录及其下属内容。确定隐藏「${confirmVisCatalog.name}」吗？`
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
        title={
          confirmVisArticle?.status === "visible"
            ? isFaq
              ? "确认隐藏问题"
              : "确认隐藏文章"
            : isFaq
              ? "确认显示问题"
              : "确认显示文章"
        }
        description={
          confirmVisArticle
            ? confirmVisArticle.status === "visible"
              ? `隐藏后「${channelLabel}」将不再展示「${confirmVisArticle.title}」，确定继续吗？`
              : `显示后「${confirmVisArticle.title}」将对用户可见，确定继续吗？`
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
