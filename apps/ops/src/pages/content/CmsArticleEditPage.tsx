import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  CMS_SCHEMAS,
  getCmsArticle,
  getCmsCatalog,
  useCmsArticleStore,
  type CmsFieldDef,
} from "@/lib/cmsArticleStore";

function emptyFields(defs: CmsFieldDef[]): Record<string, string> {
  const out: Record<string, string> = {};
  for (const f of defs) out[f.key] = "";
  return out;
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
  if (field.type === "select") {
    return (
      <select className="a-select" value={value} onChange={(e) => onChange(e.target.value)}>
        <option value="">请选择</option>
        {(field.options ?? []).map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    );
  }
  if (field.type === "image") {
    return (
      <>
        <input
          className="a-input"
          value={value}
          placeholder="请输入图片 URL"
          onChange={(e) => onChange(e.target.value)}
        />
        {value.trim() ? (
          <div className="a-column-edit__preview">
            <img src={value.trim()} alt="" />
          </div>
        ) : null}
      </>
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

  const existing = id ? getCmsArticle(id) : undefined;
  const catalogIdFromQuery = searchParams.get("catalogId") ?? "";
  const catalogId = existing?.catalogId || catalogIdFromQuery;
  const catalog = catalogId ? getCmsCatalog(catalogId) : undefined;

  const schema = catalog ? CMS_SCHEMAS[catalog.schemaId] : null;
  const [fields, setFields] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  const fieldDefs = useMemo(() => schema?.fields ?? [], [schema]);

  useEffect(() => {
    if (isCreate) {
      if (!catalog || !schema) {
        setReady(true);
        return;
      }
      setFields(emptyFields(schema.fields));
      setReady(true);
      return;
    }
    if (existing) {
      setFields({ ...emptyFields(fieldDefs), ...existing.fields });
      setReady(true);
      return;
    }
    setReady(true);
  }, [isCreate, existing, catalog, schema, fieldDefs]);

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

  if (!catalog || !schema) {
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

  if (existing?.status === "pending") {
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
      } else if (existing) {
        store.updateArticle(existing.id, { fields });
        if (andSubmit) store.submit(existing.id);
      }
      setError(null);
      navigate("/content/articles");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          {title}
          <span className="a-card__extra a-muted">
            目录：{catalog.name} · 模型：{schema.label}
          </span>
        </div>
        <div className="a-card__body">
          <p className="a-muted" style={{ marginTop: 0 }}>
            {schema.description}。保存后为草稿；提交审批通过后方可发布。
            {existing?.status === "published"
              ? " 当前为已发布稿，修改后将回到草稿并需重新审批。"
              : null}
          </p>
          {error ? <div className="a-form-error">{error}</div> : null}
          <div className="a-form a-form--stack">
            {fieldDefs.map((field) => (
              <div key={field.key} className="a-field a-field--stack">
                <span className="a-field__label">
                  {field.label}
                  {field.required ? <span className="a-req"> *</span> : null}
                </span>
                <FieldControl
                  field={field}
                  value={fields[field.key] ?? ""}
                  onChange={(v) => setField(field.key, v)}
                />
                {field.hint ? <span className="a-field__hint">{field.hint}</span> : null}
              </div>
            ))}
          </div>
          <div className="a-form-actions" style={{ marginTop: 20 }}>
            <button type="button" className="a-btn" onClick={() => navigate("/content/articles")}>
              取消
            </button>
            <button type="button" className="a-btn" onClick={() => save(false)}>
              保存草稿
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={() => save(true)}>
              保存并提交审批
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
