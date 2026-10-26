import { useMemo, useState } from "react";
import {
  CMS_STATUS_LABEL,
  catalogOptionLabel,
  useCmsArticleStore,
  type CmsArticle,
  type CmsFieldDef,
} from "@/lib/cmsArticleStore";

function parseIds(raw: string, multiple: boolean): string[] {
  if (!multiple) {
    const id = raw.trim();
    return id ? [id] : [];
  }
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function serializeIds(ids: string[], multiple: boolean): string {
  if (!multiple) return ids[0] ?? "";
  return JSON.stringify(ids);
}

type Props = {
  field: CmsFieldDef;
  value: string;
  onChange: (v: string) => void;
  /** 当前正在编辑的文章，避免自引用 */
  excludeArticleId?: string;
};

export function ArticleRefField({ field, value, onChange, excludeArticleId }: Props) {
  const store = useCmsArticleStore();
  const multiple = field.type === "articleRefs";
  const maxCount = field.maxCount ?? (multiple ? 20 : 1);
  const selectedIds = parseIds(value, multiple);

  const [open, setOpen] = useState(false);
  const [catalogFilter, setCatalogFilter] = useState("");
  const [keyword, setKeyword] = useState("");
  const [keywordApplied, setKeywordApplied] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>([]);

  const selectedArticles = useMemo(() => {
    return selectedIds.map((id) => {
      const row = store.getArticle(id);
      return { id, row };
    });
  }, [selectedIds, store]);

  const results = useMemo(() => {
    return store.searchArticlesForRef({
      keyword: keywordApplied,
      catalogId: catalogFilter || undefined,
      excludeArticleId,
    });
  }, [store, keywordApplied, catalogFilter, excludeArticleId]);

  const openDialog = () => {
    setDraftIds([...selectedIds]);
    setCatalogFilter("");
    setKeyword("");
    setKeywordApplied("");
    setOpen(true);
  };

  const toggleDraft = (id: string) => {
    if (multiple) {
      setDraftIds((prev) => {
        if (prev.includes(id)) return prev.filter((x) => x !== id);
        if (prev.length >= maxCount) return prev;
        return [...prev, id];
      });
      return;
    }
    setDraftIds([id]);
  };

  const confirm = () => {
    onChange(serializeIds(draftIds, multiple));
    setOpen(false);
  };

  const removeOne = (id: string) => {
    onChange(serializeIds(selectedIds.filter((x) => x !== id), multiple));
  };

  const catalogName = (catalogId: string) => store.getCatalog(catalogId)?.name ?? catalogId;

  return (
    <div className="a-cms-article-ref">
      <div className="a-cms-article-ref__list">
        {selectedArticles.length === 0 ? (
          <div className="a-muted" style={{ fontSize: 13 }}>
            尚未关联文章
          </div>
        ) : (
          selectedArticles.map(({ id, row }) => (
            <div key={id} className="a-cms-article-ref__chip">
              <div className="a-cms-article-ref__chip-main">
                <div className="a-cms-article-ref__chip-title">
                  {row ? row.title : <span className="a-form-error">文章已失效</span>}
                </div>
                <div className="a-cms-article-ref__chip-meta">
                  <code className="a-code a-cms-id">{id}</code>
                  {row ? (
                    <span className="a-muted">
                      {catalogName(row.catalogId)} · {CMS_STATUS_LABEL[row.status]}
                    </span>
                  ) : null}
                </div>
              </div>
              <button type="button" className="a-btn a-btn--sm" onClick={() => removeOne(id)}>
                移除
              </button>
            </div>
          ))
        )}
      </div>
      <div className="a-cms-article-ref__actions">
        <button type="button" className="a-btn a-btn--sm" onClick={openDialog}>
          {multiple
            ? selectedIds.length
              ? "继续添加 / 调整"
              : "搜索并关联文章"
            : selectedIds.length
              ? "重新选择"
              : "搜索并关联文章"}
        </button>
        {multiple ? (
          <span className="a-field__hint">
            已选 {selectedIds.length}
            {maxCount ? ` / 最多 ${maxCount}` : ""} 篇
          </span>
        ) : null}
      </div>

      {open ? (
        <div
          className="a-modal-backdrop"
          role="presentation"
          onClick={() => setOpen(false)}
        >
          <div
            className="a-modal a-modal--lg a-cms-article-ref-modal"
            role="dialog"
            aria-modal
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="a-modal__title">
              {multiple ? "选择引用文章（可多选）" : "选择引用文章"}
            </h3>
            <div className="a-toolbar a-cms-article-ref-modal__toolbar">
              <div className="a-field">
                <span className="a-field__label">目录</span>
                <select
                  className="a-select"
                  value={catalogFilter}
                  onChange={(e) => setCatalogFilter(e.target.value)}
                >
                  <option value="">全部目录</option>
                  {store.flatCatalogs.map(({ catalog, depth }) => (
                    <option key={catalog.id} value={catalog.id}>
                      {catalogOptionLabel(catalog.name, depth)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="a-field a-cms-article-ref-modal__search">
                <span className="a-field__label">关键词</span>
                <div className="a-cms-articles__search-row">
                  <input
                    className="a-input"
                    value={keyword}
                    placeholder="标题 / 文章 ID / 目录 ID"
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
                </div>
              </div>
            </div>

            <div className="a-cms-article-ref-modal__body">
              <table className="a-table a-cms-article-ref-modal__table">
                <thead>
                  <tr>
                    <th style={{ width: 48 }}>{multiple ? "选" : ""}</th>
                    <th className="a-cms-catalog-table__name">标题</th>
                    <th className="a-cms-id-col">文章 ID</th>
                    <th>目录</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {results.length === 0 ? (
                    <tr>
                      <td colSpan={5}>
                        <div className="a-empty">无匹配文章</div>
                      </td>
                    </tr>
                  ) : (
                    results.map((row: CmsArticle) => {
                      const checked = draftIds.includes(row.id);
                      const disabled =
                        multiple && !checked && draftIds.length >= maxCount;
                      return (
                        <tr
                          key={row.id}
                          className={checked ? "is-selected" : undefined}
                          onClick={() => {
                            if (!disabled) toggleDraft(row.id);
                          }}
                          style={{ cursor: disabled ? "not-allowed" : "pointer" }}
                        >
                          <td>
                            {multiple ? (
                              <input
                                type="checkbox"
                                checked={checked}
                                disabled={disabled}
                                onChange={() => toggleDraft(row.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            ) : (
                              <input
                                type="radio"
                                name={`cms-article-ref-${field.key}`}
                                checked={checked}
                                onChange={() => toggleDraft(row.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </td>
                          <td className="a-cms-catalog-table__name">{row.title}</td>
                          <td className="a-cms-id-col">
                            <code className="a-code a-cms-id">{row.id}</code>
                          </td>
                          <td>{catalogName(row.catalogId)}</td>
                          <td>
                            <span className={`a-cms-status a-cms-status--${row.status}`}>
                              {CMS_STATUS_LABEL[row.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="a-modal__actions">
              <span className="a-muted" style={{ marginRight: "auto", fontSize: 13 }}>
                已选 {draftIds.length}
                {multiple && maxCount ? ` / ${maxCount}` : ""} 篇
              </span>
              <button type="button" className="a-btn" onClick={() => setOpen(false)}>
                取消
              </button>
              <button
                type="button"
                className="a-btn a-btn--primary"
                disabled={!multiple && draftIds.length === 0 && field.required}
                onClick={confirm}
              >
                确定
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
