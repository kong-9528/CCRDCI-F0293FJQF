import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  CMS_FIELD_TYPE_LABEL,
  CMS_TEXT_FORMAT_LABEL,
  createDefaultField,
  getCmsCatalog,
  useCmsArticleStore,
  type CmsFieldDef,
  type CmsFieldType,
  type CmsSelectLayout,
  type CmsTextFormat,
} from "@/lib/cmsArticleStore";

const FIELD_TYPES = Object.keys(CMS_FIELD_TYPE_LABEL) as CmsFieldType[];

function optionsToText(options?: string[]) {
  return (options ?? []).join("\n");
}

function textToOptions(text: string) {
  return text
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function CmsFormSchemaPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const store = useCmsArticleStore();
  const catalog = getCmsCatalog(id) ?? store.getCatalog(id);

  const [fields, setFields] = useState<CmsFieldDef[]>([]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedTip, setSavedTip] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!catalog) return;
    setFields(catalog.fields.map((f) => ({ ...f, options: f.options ? [...f.options] : undefined })));
    setSelectedKey(catalog.fields[0]?.key ?? null);
  }, [catalog?.id]);

  const selected = useMemo(
    () => fields.find((f) => f.key === selectedKey) ?? null,
    [fields, selectedKey],
  );

  if (!catalog) {
    return (
      <div className="a-card">
        <div className="a-card__head">表单编排</div>
        <div className="a-card__body">
          <div className="a-empty">目录不存在</div>
          <Link className="a-btn" to="/content/catalogs">
            返回目录管理
          </Link>
        </div>
      </div>
    );
  }

  const updateField = (key: string, patch: Partial<CmsFieldDef>) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, ...patch } : f)));
  };

  const addField = (type: CmsFieldType) => {
    const next = createDefaultField(type);
    setFields((prev) => [...prev, next]);
    setSelectedKey(next.key);
    setSavedTip(false);
  };

  const removeField = (key: string) => {
    if (key === "title") {
      setError("标题字段（key=title）不可删除，可修改名称与其它属性");
      return;
    }
    setFields((prev) => {
      const next = prev.filter((f) => f.key !== key);
      if (selectedKey === key) setSelectedKey(next[0]?.key ?? null);
      return next;
    });
    setError(null);
    setSavedTip(false);
  };

  const reorder = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= fields.length || to >= fields.length) return;
    setFields((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    });
    setSavedTip(false);
  };

  const save = () => {
    try {
      store.updateCatalogFields(id, fields);
      setError(null);
      setSavedTip(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
      setSavedTip(false);
    }
  };

  return (
    <div className="a-stack a-cms-schema">
      <div className="a-card">
        <div className="a-card__head">
          表单编排
          <span className="a-card__extra a-muted">目录：{catalog.name}</span>
          <div className="a-inline-actions">
            <button type="button" className="a-btn" onClick={() => navigate("/content/catalogs")}>
              返回
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={save}>
              保存表单
            </button>
          </div>
        </div>
        <div className="a-card__body" style={{ paddingBottom: 8 }}>
          <div className="a-cms-ref-bar">
            <span>
              目录 ID：<code className="a-code a-cms-id">{catalog.id}</code>
            </span>
            <span className="a-muted">
              元素引用格式：目录 ID / 文章 ID / 字段标识
            </span>
          </div>
          <p className="a-muted" style={{ margin: 0 }}>
            为本目录下的文章配置表单字段。须保留标识为 <code>title</code>{" "}
            的标题字段；支持拖拽调整顺序。字段标识将作为引用路径的第三段。
          </p>
          {error ? <div className="a-form-error" style={{ marginTop: 8 }}>{error}</div> : null}
          {savedTip ? (
            <div className="a-muted" style={{ marginTop: 8, color: "var(--success, #389e0d)" }}>
              已保存
            </div>
          ) : null}
        </div>
      </div>

      <div className="a-cms-schema__layout">
        <aside className="a-card a-cms-schema__palette">
          <div className="a-card__head">组件</div>
          <div className="a-card__body a-cms-schema__palette-body">
            {FIELD_TYPES.map((type) => (
              <button
                key={type}
                type="button"
                className="a-btn a-cms-schema__palette-btn"
                onClick={() => addField(type)}
              >
                {CMS_FIELD_TYPE_LABEL[type]}
              </button>
            ))}
          </div>
        </aside>

        <section className="a-card a-cms-schema__list">
          <div className="a-card__head">字段列表（可拖拽排序）</div>
          <div className="a-card__body a-card__body--flush">
            {fields.length === 0 ? (
              <div className="a-empty">请从左侧添加组件</div>
            ) : (
              <ul className="a-cms-schema__fields">
                {fields.map((field, index) => {
                  const active = field.key === selectedKey;
                  const isOver = overIndex === index && dragIndex !== null && dragIndex !== index;
                  return (
                    <li
                      key={field.key}
                      className={`a-cms-schema__field${active ? " is-active" : ""}${
                        isOver ? " is-over" : ""
                      }`}
                      draggable
                      onDragStart={() => setDragIndex(index)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setOverIndex(index);
                      }}
                      onDragLeave={() => setOverIndex((v) => (v === index ? null : v))}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (dragIndex != null) reorder(dragIndex, index);
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      onDragEnd={() => {
                        setDragIndex(null);
                        setOverIndex(null);
                      }}
                      onClick={() => setSelectedKey(field.key)}
                    >
                      <span className="a-cms-schema__drag" title="拖拽排序" aria-hidden>
                        ⋮⋮
                      </span>
                      <div className="a-cms-schema__field-main">
                        <div className="a-cms-schema__field-title">
                          {field.label}
                          {field.required ? <span className="a-req"> *</span> : null}
                          {field.key === "title" ? (
                            <span className="a-cms-schema__badge">标题</span>
                          ) : null}
                        </div>
                        <div className="a-cms-schema__field-meta">
                          {CMS_FIELD_TYPE_LABEL[field.type]} · {field.key}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="a-btn a-btn--sm a-btn--danger-ghost"
                        disabled={field.key === "title"}
                        onClick={(e) => {
                          e.stopPropagation();
                          removeField(field.key);
                        }}
                      >
                        删除
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <aside className="a-card a-cms-schema__editor">
          <div className="a-card__head">字段属性</div>
          <div className="a-card__body">
            {!selected ? (
              <div className="a-empty">请选择字段</div>
            ) : (
              <div className="a-form a-form--stack">
                <div className="a-field a-field--stack">
                  <span className="a-field__label">
                    字段名称 <span className="a-req">*</span>
                  </span>
                  <input
                    className="a-input"
                    value={selected.label}
                    onChange={(e) => updateField(selected.key, { label: e.target.value })}
                  />
                </div>
                <div className="a-field a-field--stack">
                  <span className="a-field__label">
                    字段标识 <span className="a-req">*</span>
                  </span>
                  <input
                    className="a-input"
                    value={selected.key}
                    disabled={selected.key === "title"}
                    onChange={(e) => {
                      const nextKey = e.target.value.replace(/[^\w]/g, "");
                      if (!nextKey) return;
                      setFields((prev) =>
                        prev.map((f) => (f.key === selected.key ? { ...f, key: nextKey } : f)),
                      );
                      setSelectedKey(nextKey);
                    }}
                  />
                  <span className="a-field__hint">
                    英文/数字/下划线；标题字段固定为 title
                  </span>
                </div>
                <div className="a-field a-field--stack">
                  <span className="a-field__label">组件类型</span>
                  <input
                    className="a-input"
                    disabled
                    value={CMS_FIELD_TYPE_LABEL[selected.type]}
                  />
                </div>
                <label className="a-check">
                  <input
                    type="checkbox"
                    checked={Boolean(selected.required)}
                    onChange={(e) => updateField(selected.key, { required: e.target.checked })}
                  />
                  <span>必填</span>
                </label>
                <div className="a-field a-field--stack">
                  <span className="a-field__label">提示说明</span>
                  <input
                    className="a-input"
                    value={selected.hint ?? ""}
                    onChange={(e) => updateField(selected.key, { hint: e.target.value })}
                  />
                </div>

                {selected.type === "text" ? (
                  <div className="a-field a-field--stack">
                    <span className="a-field__label">内容格式</span>
                    <select
                      className="a-select"
                      value={selected.format ?? "any"}
                      onChange={(e) =>
                        updateField(selected.key, {
                          format: e.target.value as CmsTextFormat,
                        })
                      }
                    >
                      {(Object.keys(CMS_TEXT_FORMAT_LABEL) as CmsTextFormat[]).map((k) => (
                        <option key={k} value={k}>
                          {CMS_TEXT_FORMAT_LABEL[k]}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : null}

                {selected.type === "textarea" || selected.type === "richtext" ? (
                  <div className="a-field a-field--stack">
                    <span className="a-field__label">默认行数</span>
                    <input
                      className="a-input"
                      inputMode="numeric"
                      value={String(selected.rows ?? "")}
                      onChange={(e) =>
                        updateField(selected.key, {
                          rows: Number(e.target.value.replace(/\D/g, "") || "4"),
                        })
                      }
                    />
                  </div>
                ) : null}

                {selected.type === "number" ||
                selected.type === "integer" ||
                selected.type === "numberRange" ? (
                  <div className="a-cms-schema__pair">
                    <div className="a-field a-field--stack">
                      <span className="a-field__label">最小值</span>
                      <input
                        className="a-input"
                        value={selected.min ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateField(selected.key, {
                            min: v === "" ? undefined : Number(v),
                          });
                        }}
                      />
                    </div>
                    <div className="a-field a-field--stack">
                      <span className="a-field__label">最大值</span>
                      <input
                        className="a-input"
                        value={selected.max ?? ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateField(selected.key, {
                            max: v === "" ? undefined : Number(v),
                          });
                        }}
                      />
                    </div>
                  </div>
                ) : null}

                {selected.type === "radio" || selected.type === "checkbox" ? (
                  <>
                    <div className="a-field a-field--stack">
                      <span className="a-field__label">展示方式</span>
                      <select
                        className="a-select"
                        value={selected.selectLayout ?? "dropdown"}
                        onChange={(e) =>
                          updateField(selected.key, {
                            selectLayout: e.target.value as CmsSelectLayout,
                          })
                        }
                      >
                        <option value="dropdown">下拉</option>
                        <option value="flat">平铺</option>
                      </select>
                    </div>
                    <div className="a-field a-field--stack">
                      <span className="a-field__label">
                        选项（每行一个） <span className="a-req">*</span>
                      </span>
                      <textarea
                        className="a-textarea"
                        rows={5}
                        value={optionsToText(selected.options)}
                        onChange={(e) =>
                          updateField(selected.key, {
                            options: textToOptions(e.target.value),
                          })
                        }
                      />
                    </div>
                    {selected.type === "checkbox" ? (
                      <label className="a-check">
                        <input
                          type="checkbox"
                          checked={Boolean(selected.allowSelectAll)}
                          onChange={(e) =>
                            updateField(selected.key, { allowSelectAll: e.target.checked })
                          }
                        />
                        <span>支持选择「全部」</span>
                      </label>
                    ) : null}
                  </>
                ) : null}

                {selected.type === "image" ? (
                  <>
                    <div className="a-cms-schema__pair">
                      <div className="a-field a-field--stack">
                        <span className="a-field__label">最小宽度(px)</span>
                        <input
                          className="a-input"
                          value={selected.imageMinWidth ?? ""}
                          onChange={(e) =>
                            updateField(selected.key, {
                              imageMinWidth:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value.replace(/\D/g, "")),
                            })
                          }
                        />
                      </div>
                      <div className="a-field a-field--stack">
                        <span className="a-field__label">最大宽度(px)</span>
                        <input
                          className="a-input"
                          value={selected.imageMaxWidth ?? ""}
                          onChange={(e) =>
                            updateField(selected.key, {
                              imageMaxWidth:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value.replace(/\D/g, "")),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="a-cms-schema__pair">
                      <div className="a-field a-field--stack">
                        <span className="a-field__label">最小高度(px)</span>
                        <input
                          className="a-input"
                          value={selected.imageMinHeight ?? ""}
                          onChange={(e) =>
                            updateField(selected.key, {
                              imageMinHeight:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value.replace(/\D/g, "")),
                            })
                          }
                        />
                      </div>
                      <div className="a-field a-field--stack">
                        <span className="a-field__label">最大高度(px)</span>
                        <input
                          className="a-input"
                          value={selected.imageMaxHeight ?? ""}
                          onChange={(e) =>
                            updateField(selected.key, {
                              imageMaxHeight:
                                e.target.value === ""
                                  ? undefined
                                  : Number(e.target.value.replace(/\D/g, "")),
                            })
                          }
                        />
                      </div>
                    </div>
                    <div className="a-field a-field--stack">
                      <span className="a-field__label">宽高比</span>
                      <input
                        className="a-input"
                        placeholder="如 16:9 或 1:1"
                        value={selected.imageAspectRatio ?? ""}
                        onChange={(e) =>
                          updateField(selected.key, { imageAspectRatio: e.target.value })
                        }
                      />
                    </div>
                  </>
                ) : null}

                {selected.type === "images" ? (
                  <div className="a-field a-field--stack">
                    <span className="a-field__label">最多上传张数</span>
                    <input
                      className="a-input"
                      inputMode="numeric"
                      value={String(selected.maxCount ?? 9)}
                      onChange={(e) =>
                        updateField(selected.key, {
                          maxCount: Number(e.target.value.replace(/\D/g, "") || "9"),
                        })
                      }
                    />
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
