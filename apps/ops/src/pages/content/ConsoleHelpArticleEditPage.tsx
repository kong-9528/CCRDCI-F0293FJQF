import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { RichTextEditor } from "@/components/RichTextEditor";
import { useConsoleHelpStore } from "@/lib/consoleHelpStore";

type FormState = {
  title: string;
  weight: string;
  summary: string;
  body: string;
};

const EMPTY_FORM: FormState = {
  title: "",
  weight: "10",
  summary: "",
  body: "",
};

const LIST_PATH = "/content/console-help";

export function ConsoleHelpArticleEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const store = useConsoleHelpStore();
  const isCreate = !id;

  const article = useMemo(() => {
    if (!id) return null;
    return store.articles.find((a) => a.id === id) ?? null;
  }, [id, store.articles]);

  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(isCreate);

  useEffect(() => {
    if (isCreate) {
      setForm(EMPTY_FORM);
      setReady(true);
      return;
    }
    if (article) {
      setForm({
        title: article.title,
        weight: String(article.weight),
        summary: article.summary,
        body: article.body,
      });
      setReady(true);
    }
  }, [isCreate, article]);

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
            <button type="button" className="a-btn" onClick={() => navigate(LIST_PATH)}>
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
      weight,
      summary: form.summary,
      body: form.body,
    };
    if (isCreate) {
      store.createArticle(payload);
    } else if (article) {
      store.updateArticle(article.id, payload);
    }
    navigate(LIST_PATH);
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          {isCreate ? "新增文章" : "编辑文章"}
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate(LIST_PATH)}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          {isCreate ? (
            <p className="a-field__hint" style={{ margin: 0 }}>
              新增文章默认为隐藏，需手动「显示」后才会在控制台帮助中心展示。
            </p>
          ) : null}

          <section className="a-form-section">
            <h3 className="a-form-section__title">基本信息</h3>
            <div className="a-form a-form--grid">
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
                <div className="a-field__hint">数值越小越靠前（列表按权重排序）</div>
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
            <button type="button" className="a-btn" onClick={() => navigate(LIST_PATH)}>
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
