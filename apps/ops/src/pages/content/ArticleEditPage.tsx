import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { RichTextEditor } from "@/components/RichTextEditor";
import {
  CONTENT_CHANNEL_LABEL,
  CONTENT_CHANNELS,
  getArticleById,
  useContentStore,
  type ContentChannel,
} from "@/lib/contentStore";
import { CONTENT_CENTER_PATH } from "@/pages/content/ContentManagePage";

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

function parseChannel(raw: string | null): ContentChannel {
  if (raw && (CONTENT_CHANNELS as string[]).includes(raw)) {
    return raw as ContentChannel;
  }
  return "portal_guide";
}

export function ArticleEditPage() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isCreate = !id;
  const channelFromQuery = parseChannel(searchParams.get("channel"));

  const [channel, setChannel] = useState<ContentChannel>(channelFromQuery);
  const store = useContentStore(channel);
  const article = id ? getArticleById(id) : null;

  useEffect(() => {
    if (article?.channel) setChannel(article.channel);
    else if (isCreate) setChannel(channelFromQuery);
  }, [article?.channel, isCreate, channelFromQuery]);

  const isFaq = channel === "portal_faq";
  const listPath = `${CONTENT_CENTER_PATH}?channel=${channel}`;

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
    } else {
      setReady(true);
    }
  }, [isCreate, article, searchParams]);

  const headTitle = isFaq
    ? isCreate
      ? "新增常见问题"
      : "编辑常见问题"
    : isCreate
      ? "新增文章"
      : "编辑文章";

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__head">{headTitle}</div>
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!isCreate && !article) {
    return (
      <div className="a-card">
        <div className="a-card__head">{headTitle}</div>
        <div className="a-card__body">
          <div className="a-empty">内容不存在或已删除</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => navigate(listPath)}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  const submit = () => {
    if (!form.title.trim()) {
      setError(isFaq ? "请填写问题" : "请填写文章标题");
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
    navigate(listPath);
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          {headTitle}
          <div className="a-card__extra">
            <span className="a-tag a-tag--cyan" style={{ marginRight: 8 }}>
              {CONTENT_CHANNEL_LABEL[channel]}
            </span>
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate(listPath)}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          {isCreate ? (
            <p className="a-field__hint" style={{ margin: 0 }}>
              新增内容默认为隐藏，需在列表中手动「显示」后才会在前台展示。
              {isFaq ? " 标题为问题，正文为回答（支持富文本）。" : ""}
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
                  {isFaq ? "问题" : "文章标题"} <span className="a-req">*</span>
                </span>
                <input
                  className="a-input"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder={isFaq ? "请输入问题" : "请输入标题"}
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
              {!isFaq ? (
                <div className="a-field a-field--wide">
                  <span className="a-field__label">摘要</span>
                  <input
                    className="a-input"
                    value={form.summary}
                    onChange={(e) => setForm((p) => ({ ...p, summary: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>
          </section>

          <section className="a-form-section">
            <h3 className="a-form-section__title">{isFaq ? "回答" : "正文"}</h3>
            <RichTextEditor
              value={form.body}
              onChange={(body) => setForm((p) => ({ ...p, body }))}
              placeholder={isFaq ? "请输入回答内容，支持图文混排" : "请输入正文内容，支持图文混排"}
              minHeight={400}
            />
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn" onClick={() => navigate(listPath)}>
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
