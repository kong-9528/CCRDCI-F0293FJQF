import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useContentStore } from "@/lib/contentStore";

type FormState = {
  title: string;
  catalogId: string;
  weight: string;
  summary: string;
  body: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  catalogId: "",
  weight: "10",
  summary: "",
  body: "",
};

export function ArticleEditPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const store = useContentStore();
  const isCreate = !id;

  const article = useMemo(() => {
    if (!id) return null;
    return store.articles.find((a) => a.id === id && !a.deleted) ?? null;
  }, [id, store.articles]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(isCreate);

  const catalogOptions = store.catalogSelectOptions();

  useEffect(() => {
    if (isCreate) {
      setForm({
        ...EMPTY_FORM,
        catalogId: searchParams.get("catalogId") ?? "",
      });
      setReady(true);
      return;
    }
    if (article) {
      setForm({
        title: article.title,
        catalogId: article.catalogId ?? "",
        weight: String(article.weight),
        summary: article.summary,
        body: article.body,
      });
      setReady(true);
    }
  }, [isCreate, article, searchParams]);

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑文章</div>
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!isCreate && !article) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑文章</div>
        <div className="a-card__body">
          <div className="a-empty">文章不存在或已删除</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => navigate("/content/hc")}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const submit = () => {
    if (!form.title.trim()) {
      setError("请填写文章标题");
      return;
    }
    const weight = Number(form.weight);
    if (!Number.isInteger(weight) || weight < 0) {
      setError("排序权重须为非负整数");
      return;
    }
    const payload = {
      title: form.title,
      catalogId: form.catalogId || null,
      weight,
      summary: form.summary,
      body: form.body,
    };
    if (isCreate) {
      store.createArticle(payload);
    } else if (article) {
      store.updateArticle(article.id, payload);
    }
    navigate("/content/hc");
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          {isCreate ? "新增文章" : "编辑文章"}
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate("/content/hc")}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          {isCreate ? (
            <p className="a-field__hint" style={{ margin: 0 }}>
              新增文章默认为隐藏，需手动「显示」后才会在前端展示。
            </p>
          ) : null}

          <section className="a-form-section">
            <h3 className="a-form-section__title">基本信息</h3>
            <div className="a-form a-form--grid">
              <div className="a-field">
                <span className="a-field__label">所属目录</span>
                <select
                  className="a-select"
                  value={form.catalogId}
                  onChange={(e) => setForm((p) => ({ ...p, catalogId: e.target.value }))}
                >
                  <option value="">（根目录）</option>
                  {catalogOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="a-field">
                <span className="a-field__label">
                  文章标题 <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                />
              </div>
              <div className="a-field">
                <span className="a-field__label">排序权重</span>
                <input
                  className="a-input"
                  inputMode="numeric"
                  value={form.weight}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      weight: e.target.value.replace(/\D/g, ""),
                    }))
                  }
                />
                <div className="a-field__hint">数值越小越靠前</div>
              </div>
              <div className="a-field a-field--wide">
                <span className="a-field__label">摘要</span>
                <input
                  className="a-input"
                  value={form.summary}
                  onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                />
              </div>
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">正文</h3>
            <RichTextEditor
              value={form.body}
              onChange={(body) => setForm((p) => ({ ...p, body }))}
              placeholder="请输入正文内容，支持图文混排"
              minHeight={400}
            />
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn" onClick={() => navigate("/content/hc")}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
