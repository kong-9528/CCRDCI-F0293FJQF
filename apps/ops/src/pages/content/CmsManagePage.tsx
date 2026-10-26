import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { TableAction } from "@/components/TableAction";
import { IconPlus, IconTrash } from "@/components/icons/UiIcons";
import {
  CMS_STATUS_LABEL,
  catalogOptionLabel,
  useCmsArticleStore,
  type CmsArticle,
} from "@/lib/cmsArticleStore";

export function CmsManagePage() {
  const store = useCmsArticleStore();
  const navigate = useNavigate();
  const flatCatalogs = store.flatCatalogs;

  const [catalogId, setCatalogId] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordApplied, setKeywordApplied] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteArticle, setDeleteArticle] = useState<CmsArticle | null>(null);
  const [approveRow, setApproveRow] = useState<CmsArticle | null>(null);
  const [rejectRow, setRejectRow] = useState<CmsArticle | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    if (!flatCatalogs.length) {
      setCatalogId("");
      return;
    }
    if (!catalogId || !flatCatalogs.some(({ catalog }) => catalog.id === catalogId)) {
      // 默认选中「导航栏目」下第一个子目录，便于看到迁移后的栏目文章
      const firstNavChild = flatCatalogs.find(({ catalog }) => catalog.parentId === "cms-c-nav");
      setCatalogId((firstNavChild ?? flatCatalogs[0]!).catalog.id);
    }
  }, [flatCatalogs, catalogId]);

  const selected = catalogId ? store.getCatalog(catalogId) : undefined;
  const articles = useMemo(
    () => (catalogId ? store.listArticles(catalogId, keywordApplied) : []),
    [store, catalogId, keywordApplied],
  );

  const canCreateArticle = Boolean(
    selected &&
      selected.id !== "cms-c-nav" &&
      !(selected.parentId === "cms-c-nav" && articles.length > 0),
  );

  const confirmDeleteArticle = () => {
    if (!deleteArticle) return;
    const err = store.deleteArticle(deleteArticle.id);
    if (err) setError(err);
    setDeleteArticle(null);
  };

  return (
    <div className="a-stack a-cms-articles">
      <div className="a-card">
        <div className="a-card__head">
          文章管理
          <span className="a-card__extra a-muted">
            按目录筛选；元素定位：目录 ID + 文章 ID + 字段标识
          </span>
        </div>

        <div className="a-toolbar a-cms-articles__toolbar">
          <div className="a-field">
            <span className="a-field__label">
              目录 <span className="a-req">*</span>
            </span>
            <select
              className="a-select"
              value={catalogId}
              disabled={!flatCatalogs.length}
              onChange={(e) => setCatalogId(e.target.value)}
            >
              {flatCatalogs.map(({ catalog, depth }) => (
                <option key={catalog.id} value={catalog.id}>
                  {catalogOptionLabel(catalog.name, depth)}
                </option>
              ))}
            </select>
            {selected ? (
              <span className="a-field__hint">
                目录 ID：<code className="a-code a-cms-id">{selected.id}</code>
              </span>
            ) : null}
          </div>
          <div className="a-field a-cms-articles__search">
            <span className="a-field__label">标题关键词</span>
            <div className="a-cms-articles__search-row">
              <input
                className="a-input"
                value={keyword}
                placeholder="搜索文章标题"
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setKeywordApplied(keyword.trim());
                }}
              />
              <button
                type="button"
                className="a-btn"
                onClick={() => setKeywordApplied(keyword.trim())}
              >
                搜索
              </button>
              {keywordApplied ? (
                <button
                  type="button"
                  className="a-btn"
                  onClick={() => {
                    setKeyword("");
                    setKeywordApplied("");
                  }}
                >
                  清空
                </button>
              ) : null}
            </div>
          </div>
          <div className="a-toolbar__right">
            <button
              type="button"
              className="a-btn a-btn--primary"
              disabled={!canCreateArticle}
              title={
                selected?.parentId === "cms-c-nav" && articles.length > 0
                  ? "导航栏目子目录仅允许一篇文章"
                  : selected?.id === "cms-c-nav"
                    ? "请选择导航栏目下的子目录"
                    : undefined
              }
              onClick={() =>
                selected &&
                canCreateArticle &&
                navigate(`/content/articles/new?catalogId=${selected.id}`)
              }
            >
              新增文章
            </button>
          </div>
        </div>

        {error ? (
          <div className="a-card__body" style={{ paddingTop: 0, paddingBottom: 0 }}>
            <div className="a-form-error">{error}</div>
          </div>
        ) : null}

        <div className="a-card__body a-card__body--flush">
          <table className="a-table">
            <thead>
              <tr>
                <th>标题</th>
                <th style={{ width: 88 }}>排序</th>
                <th className="a-cms-id-col">文章 ID</th>
                <th>状态</th>
                <th>更新时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {!flatCatalogs.length ? (
                <tr>
                  <td colSpan={6}>
                    <div className="a-empty">
                      暂无目录，请先在「目录管理」中创建目录
                    </div>
                  </td>
                </tr>
              ) : articles.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="a-empty">
                      {keywordApplied ? "无匹配文章" : "该目录下暂无文章"}
                    </div>
                  </td>
                </tr>
              ) : (
                articles.map((row) => (
                  <tr key={row.id}>
                    <td>{row.title}</td>
                    <td>{row.sort == null ? "—" : row.sort}</td>
                    <td className="a-cms-id-col">
                      <code className="a-code a-cms-id">{row.id}</code>
                    </td>
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
                        {row.status === "visible" || row.status === "hidden" ? (
                          <TableAction
                            icon={<IconPlus />}
                            onClick={() => {
                              try {
                                store.setVisibility(row.id, row.status === "hidden");
                                setError(null);
                              } catch (e) {
                                setError(e instanceof Error ? e.message : "操作失败");
                              }
                            }}
                          >
                            {row.status === "visible" ? "设为隐藏" : "设为显示"}
                          </TableAction>
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
      </div>

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
          approveRow ? `确定通过审批并发布「${approveRow.title}」吗？` : ""
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
