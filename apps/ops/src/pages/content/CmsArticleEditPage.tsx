import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  getCmsArticle,
  getCmsCatalog,
  useCmsArticleStore,
  type CmsFieldDef,
} from "@/lib/cmsArticleStore";

function emptyFields(defs: CmsFieldDef[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of defs) {
    if (f.type === "numberRange") out[f.key] = JSON.stringify({ min: "", max: "" });
    else if (f.type === "checkbox" || f.type === "images") out[f.key] = "[]";
    else out[f.key] = "";
  }
  return out;
}

function parseJsonArray(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function parseRange(raw: string): { min: string; max: string } {
  try {
    const v = JSON.parse(raw || "{}") as { min?: string; max?: string };
    return { min: String(v.min ?? ""), max: String(v.max ?? "") };
  } catch {
    return { min: "", max: "" };
  }
}

function FieldControl({
  field,
  value,
  onChange,
}: {
  field: CmsFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "richtext") {
    return (
      <RichTextEditor
        value={value}
        onChange={onChange}
        placeholder={`请输入${field.label}`}
      />
    );
  }
  if (field.type === "textarea") {
    return (
      <textarea
        className="a-textarea"
        rows={field.rows ?? 4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "number" || field.type === "integer") {
    return (
      <input
        className="a-input"
        inputMode={field.type === "integer" ? "numeric" : "decimal"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "numberRange") {
    const range = parseRange(value);
    return (
      <div className="a-cms-range">
        <input
          className="a-input"
          placeholder="最小值"
          value={range.min}
          onChange={(e) =>
            onChange(JSON.stringify({ min: e.target.value, max: range.max }))
          }
        />
        <span className="a-muted">至</span>
        <input
          className="a-input"
          placeholder="最大值"
          value={range.max}
          onChange={(e) =>
            onChange(JSON.stringify({ min: range.min, max: e.target.value }))
          }
        />
      </div>
    );
  }
  if (field.type === "radio") {
    const options = field.options ?? [];
    if (field.selectLayout === "flat") {
      return (
        <div className="a-cms-flat-options">
          {options.map((opt) => (
            <label key={opt} className="a-check">
              <input
                type="radio"
                name={field.key}
                checked={value === opt}
                onChange={() => onChange(opt)}
              />
              <span>{opt}</span>
            </label>
          ))}
        </div>
      );
    }
    return (
      <select className="a-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">请选择</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "checkbox") {
    const selected = parseJsonArray(value);
    const options = field.options ?? [];
    const allSelected = options.length > 0 && options.every((o) => selected.includes(o));
    const toggle = (opt: string) => {
      const set = new Set(selected);
      if (set.has(opt)) set.delete(opt);
      else set.add(opt);
      onChange(JSON.stringify([...set]));
    };
    const toggleAll = () => {
      onChange(JSON.stringify(allSelected ? [] : [...options]));
    };
    if (field.selectLayout === "dropdown") {
      return (
        <select
          className="a-select"
          multiple
          value={selected}
          onChange={(e) => {
            const vals = Array.from(e.target.selectedOptions).map((o) => o.value);
            onChange(JSON.stringify(vals));
          }}
        >
          {options.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      );
    }
    return (
      <div className="a-cms-flat-options">
        {field.allowSelectAll ? (
          <label className="a-check">
            <input type="checkbox" checked={allSelected} onChange={toggleAll} />
            <span>全部</span>
          </label>
        ) : null}
        {options.map((opt) => (
          <label key={opt} className="a-check">
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => toggle(opt)}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    );
  }
  if (field.type === "image") {
    const constraints: string[] = [];
    if (field.imageMinWidth || field.imageMaxWidth) {
      constraints.push(
        `宽 ${field.imageMinWidth ?? "不限"}–${field.imageMaxWidth ?? "不限"}px`,
      );
    }
    if (field.imageMinHeight || field.imageMaxHeight) {
      constraints.push(
        `高 ${field.imageMinHeight ?? "不限"}–${field.imageMaxHeight ?? "不限"}px`,
      );
    }
    if (field.imageAspectRatio) constraints.push(`比例 ${field.imageAspectRatio}`);
    return (
      <>
        <input
          className="a-input"
          value={value}
          placeholder="请输入图片 URL（演示）"
          onChange={(e) => onChange(e.target.value)}
        />
        {constraints.length ? (
          <span className="a-field__hint">{constraints.join(" · ")}</span>
        ) : null}
        {value.trim() ? (
          <div className="a-column-edit__preview">
            <img src={value.trim()} alt="" />
          </div>
        ) : null}
      </>
    );
  }
  if (field.type === "images") {
    const list = parseJsonArray(value);
    return (
      <div className="a-form a-form--stack">
        {list.map((url, i) => (
          <div key={`${url}-${i}`} className="a-cms-multi-row">
            <input
              className="a-input"
              value={url}
              onChange={(e) => {
                const next = [...list];
                next[i] = e.target.value;
                onChange(JSON.stringify(next));
              }}
            />
            <button
              type="button"
              className="a-btn a-btn--sm"
              onClick={() => onChange(JSON.stringify(list.filter((_, j) => j !== i)))}
            >
              移除
            </button>
          </div>
        ))}
        <button
          type="button"
          className="a-btn a-btn--sm"
          disabled={list.length >= (field.maxCount ?? 9)}
          onClick={() => onChange(JSON.stringify([...list, ""]))}
        >
          添加图片 URL
        </button>
        <span className="a-field__hint">最多 {field.maxCount ?? 9} 张（演示以 URL 录入）</span>
      </div>
    );
  }
  if (field.type === "file") {
    return (
      <input
        className="a-input"
        value={value}
        placeholder="请输入附件 URL（演示）"
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "date") {
    return (
      <input
        className="a-input"
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  if (field.type === "datetime") {
    return (
      <input
        className="a-input"
        type="datetime-local"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    );
  }
  return (
    <input className="a-input" value={value} onChange={(e) => onChange(e.target.value)} />
  );
}

export function CmsArticleEditPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useCmsArticleStore();
  const isCreate = !id;

  // 用 store 快照读取，避免 getXxx 每次拷贝新对象导致 effect 死循环
  const existing = id ? store.getArticle(id) : undefined;
  const catalogIdFromQuery = searchParams.get("catalogId") ?? "";
  const catalogId = existing?.catalogId || catalogIdFromQuery;
  const catalog = catalogId ? store.getCatalog(catalogId) : undefined;

  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const fieldDefs = useMemo(() => catalog?.fields ?? [], [catalog?.id, catalog?.fields]);
  const articleId = existing?.id;
  const articleStatus = existing?.status;
  const articleUpdatedAt = existing?.updatedAt;

  useEffect(() => {
    if (isCreate) {
      if (!catalogId) {
        setReady(true);
        return;
      }
      const cat = getCmsCatalog(catalogId);
      if (!cat) {
        setReady(true);
        return;
      }
      setFields(emptyFields(cat.fields));
      setReady(true);
      return;
    }
    if (!articleId) {
      setReady(true);
      return;
    }
    const row = getCmsArticle(articleId);
    const cat = row ? getCmsCatalog(row.catalogId) : undefined;
    if (row && cat) {
      setFields({ ...emptyFields(cat.fields), ...row.fields });
    }
    setReady(true);
    // 仅在路由/文章身份变化时灌入表单，避免引用变化触发重渲染死循环
  }, [isCreate, catalogId, articleId, articleUpdatedAt]);

  const title = isCreate ? "新增文章" : "编辑文章";

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!catalog) {
    return (
      <div className="a-card">
        <div className="a-card__head">{title}</div>
        <div className="a-card__body">
          <div className="a-empty">请从文章管理选择目录后再新增，或文章不存在</div>
          <button type="button" className="a-btn" onClick={() => navigate("/content/articles")}>
            返回
          </button>
        </div>
      </div>
    );
  }

  if (articleStatus === "pending") {
    return (
      <div className="a-card">
        <div className="a-card__head">{title}</div>
        <div className="a-card__body">
          <div className="a-empty">该文章待审批中，暂不可编辑</div>
          <button type="button" className="a-btn" onClick={() => navigate("/content/articles")}>
            返回
          </button>
        </div>
      </div>
    );
  }

  const setField = (key: string, value: string) => {
    setFields((p) => ({ ...p, [key]: value }));
  };

  const save = (andSubmit: boolean) => {
    try {
      if (isCreate) {
        const created = store.createArticle({ catalogId: catalog.id, fields });
        if (andSubmit) store.submit(created.id);
      } else if (articleId) {
        store.updateArticle(articleId, { fields });
        if (andSubmit) store.submit(articleId);
      }
      setError(null);
      navigate("/content/articles");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  const goBack = () => navigate("/content/articles");
  const isVisibilityArticle = articleStatus === "visible" || articleStatus === "hidden";

  return (
    <div className="a-stack a-cms-article-edit">
      <div className="a-card">
        <div className="a-card__head">
          {title}
          <span className="a-card__extra a-muted">目录：{catalog.name}</span>
          <button type="button" className="a-btn" onClick={goBack}>
            返回
          </button>
        </div>
        <div className="a-card__body a-cms-article-edit__body">
          <div className="a-cms-ref-bar">
            <span>
              目录 ID：<code className="a-code a-cms-id">{catalog.id}</code>
            </span>
            <span>
              文章 ID：
              <code className="a-code a-cms-id">{articleId ?? "（新建后生成）"}</code>
            </span>
            <span className="a-muted">
              元素引用：目录 ID / 文章 ID / 字段标识
            </span>
          </div>
          <p className="a-muted" style={{ marginTop: 0 }}>
            表单字段由目录「表单编排」定义。
            {isVisibilityArticle
              ? "保存后保持当前显示/隐藏状态。"
              : "保存后为草稿；提交审批通过后方可发布。"}
            {articleStatus === "published"
              ? " 当前为已发布稿，修改后将回到草稿并需重新审批。"
              : null}
          </p>
          {error ? <div className="a-form-error">{error}</div> : null}
          <div className="a-form a-form--stack">
            {fieldDefs.map((field) => {
              const articleIdPart = articleId ?? "{articleId}";
              const refPath = `${catalog.id}/${articleIdPart}/${field.key}`;
              return (
                <div key={field.key} className="a-field a-field--stack">
                  <span className="a-field__label">
                    {field.label}
                    {field.required ? <span className="a-req"> *</span> : null}
                    <code className="a-code a-cms-field-ref" title="元素定位路径">
                      {refPath}
                    </code>
                  </span>
                  <FieldControl
                    field={field}
                    value={fields[field.key] ?? ""}
                    onChange={(v) => setField(field.key, v)}
                  />
                  {field.hint ? <span className="a-field__hint">{field.hint}</span> : null}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="a-cms-article-edit__footer">
        <div className="a-cms-article-edit__footer-inner">
          <button type="button" className="a-btn" onClick={goBack}>
            取消
          </button>
          {isVisibilityArticle ? (
            <button type="button" className="a-btn a-btn--primary" onClick={() => save(false)}>
              保存
            </button>
          ) : (
            <>
              <button type="button" className="a-btn" onClick={() => save(false)}>
                保存草稿
              </button>
              <button type="button" className="a-btn a-btn--primary" onClick={() => save(true)}>
                保存并提交审批
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
