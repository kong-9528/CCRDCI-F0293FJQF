import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getColumnSections,
  getPortalColumn,
  usePortalColumnStore,
  type ColumnFieldDef,
} from "@/lib/portalColumnStore";

function FieldInput({
  field,
  value,
  onChange,
}: {
  field: ColumnFieldDef;
  value: string;
  onChange: (v: string) => void;
}) {
  if (field.type === "textarea" || field.type === "image") {
    return (
      <>
        <textarea
          className="a-textarea"
          rows={field.rows ?? (field.type === "image" ? 2 : 4)}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.type === "image" ? "请输入图片 URL" : undefined}
        />
        {field.type === "image" && value.trim() ? (
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

export function ColumnEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = usePortalColumnStore();
  const source = id ? getPortalColumn(id) : undefined;
  const [content, setContent] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const row = id ? getPortalColumn(id) : undefined;
    setContent(row ? { ...row.content } : {});
    setReady(true);
  }, [id]);

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑页面内容</div>
        <div className="a-card__body">
          <div className="a-empty">栏目不存在</div>
          <button type="button" className="a-btn" onClick={() => navigate("/content/columns")}>
            返回
          </button>
        </div>
      </div>
    );
  }

  const sections = getColumnSections(source);

  const setField = (key: string, value: string) => {
    setContent((p) => ({ ...p, [key]: value }));
    setSaved(false);
  };

  const save = () => {
    try {
      store.updateContent(source.id, content);
      setError(null);
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="a-stack a-column-edit">
      <div className="a-card">
        <div className="a-card__head">
          编辑页面内容 · {source.name}
          <div className="a-card__extra a-inline-actions">
            <button type="button" className="a-btn" onClick={() => navigate("/content/columns")}>
              返回列表
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={save}>
              保存
            </button>
          </div>
        </div>
        <div className="a-card__body">
          <p className="a-muted" style={{ marginTop: 0 }}>
            路径 <code className="a-code">{source.path}</code>
            ；下列字段按门户该页实际版块划分，各栏目结构不同。
          </p>
          {error ? <div className="a-form-error">{error}</div> : null}
          {saved ? <div className="a-form-success">已保存</div> : null}
        </div>
      </div>

      {sections.map((section) => (
        <div key={section.id} className="a-card">
          <div className="a-card__head">{section.title}</div>
          <div className="a-card__body">
            <div className="a-form a-form--stack">
              {section.fields.map((field) => (
                <div key={field.key} className="a-field a-field--stack">
                  <span className="a-field__label">{field.label}</span>
                  <FieldInput
                    field={field}
                    value={content[field.key] ?? ""}
                    onChange={(v) => setField(field.key, v)}
                  />
                  {field.hint ? <span className="a-field__hint">{field.hint}</span> : null}
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
