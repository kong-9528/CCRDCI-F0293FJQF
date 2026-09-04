import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getApiDocProduct,
  resolveRequestParamsText,
  resolveResponseFieldsText,
  subscribeApiCatalog,
  type ApiErrorCode,
} from "@/lib/apiDocs";
import { copyText } from "@/lib/keys";

type LocationState = {
  from?: string;
};

export function ApiDocProductPage() {
  const { productId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [catalogTick, setCatalogTick] = useState(0);

  useEffect(() => subscribeApiCatalog(() => setCatalogTick((n) => n + 1)), []);

  const doc = useMemo(() => getApiDocProduct(productId), [productId, catalogTick]);
  const apiIdFromQuery = searchParams.get("api");

  const initialIndex = useMemo(() => {
    if (!doc || !apiIdFromQuery) return 0;
    const idx = doc.apis.findIndex(
      (item) => item.id === apiIdFromQuery || item.apiCode === apiIdFromQuery,
    );
    return idx >= 0 ? idx : 0;
  }, [doc, apiIdFromQuery]);

  const [activeApi, setActiveApi] = useState(initialIndex);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    setActiveApi(initialIndex);
  }, [productId, initialIndex]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2000);
  };

  const goBack = () => {
    const from = (location.state as LocationState | null)?.from;
    if (from && from !== location.pathname) {
      navigate(from);
      return;
    }
    const idx = (window.history.state as { idx?: number } | null)?.idx;
    if (typeof idx === "number" && idx > 0) {
      navigate(-1);
      return;
    }
    navigate("/api-docs");
  };

  if (!doc) {
    return (
      <div className="a-card">
        <div className="a-card__head">API文档</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该产品文档</div>
          <button type="button" className="a-btn" style={{ marginTop: 16 }} onClick={goBack}>
            返回
          </button>
        </div>
      </div>
    );
  }

  if (doc.apis.length === 0) {
    return (
      <div className="a-stack c-apidoc-page">
        <div className="a-inline-actions">
          <button type="button" className="a-btn a-btn--sm" onClick={goBack}>
            ← 返回
          </button>
          <span className="a-field__hint">{doc.name}</span>
        </div>
        <div className="a-card">
          <div className="a-card__body">
            <div className="a-empty">该产品暂无已上线接口</div>
          </div>
        </div>
      </div>
    );
  }

  const api = doc.apis[activeApi] ?? doc.apis[0];
  const requestText = resolveRequestParamsText(api);
  const responseText = resolveResponseFieldsText(api);

  const onCopyPath = async () => {
    const ok = await copyText(api.path);
    if (!ok) {
      showToast("复制失败");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
  };

  const onDownloadDoc = () => {
    const file = api.docFile;
    if (!file) {
      showToast("该接口暂无文档文件");
      return;
    }
    if (file.url) {
      const a = document.createElement("a");
      a.href = file.url;
      a.download = file.name;
      a.rel = "noopener";
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast("开始下载");
      return;
    }
    // 演示：无真实文件时，用接口配置内容生成可下载文本
    const body = [
      `# ${api.apiName}`,
      ``,
      `接口路径：${api.method} ${api.path}`,
      `版本：${api.version}`,
      api.description ? `说明：${api.description}` : "",
      ``,
      `## 请求参数`,
      requestText || "（无）",
      ``,
      `## 响应字段`,
      responseText || "（无）",
      ``,
      `## 示例请求`,
      api.exampleRequest || "（无）",
      ``,
      `## 示例响应`,
      api.exampleResponse || "（无）",
    ]
      .filter((line) => line !== undefined)
      .join("\n");
    const blob = new Blob([body], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name.replace(/\.[^.]+$/, "") + ".txt";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    showToast("开始下载");
  };

  return (
    <div className="a-stack c-apidoc-page">
      {toast ? <div className="a-toast">{toast}</div> : null}
      <div className="a-inline-actions">
        <button type="button" className="a-btn a-btn--sm" onClick={goBack}>
          ← 返回
        </button>
        <span className="a-field__hint">{doc.name}</span>
      </div>
      <div className="a-card">
        <div className="a-card__body c-apidoc-detail">
          <nav className="c-apidoc-nav" aria-label="接口列表">
            {doc.apis.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`c-apidoc-nav__item${i === activeApi ? " is-active" : ""}`}
                onClick={() => setActiveApi(i)}
              >
                {item.apiName}
              </button>
            ))}
          </nav>
          <div className="c-apidoc-main">
            <div className="c-apidoc-main__head">
              <h2 className="c-apidoc-main__title">{api.apiName}</h2>
              {api.docFile ? (
                <button
                  type="button"
                  className="a-btn a-btn--sm a-btn--primary c-apidoc-download"
                  onClick={onDownloadDoc}
                >
                  下载接口文档
                </button>
              ) : null}
            </div>
            <div className="c-apidoc-endpoint">
              <span
                className={`c-apidoc-method${api.method === "GET" ? " is-get" : ""}`}
              >
                {api.method}
              </span>
              <code className="c-apidoc-path">{api.path}</code>
              <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onCopyPath}>
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <div className="c-apidoc-meta">
              <span className="a-tag a-tag--cyan">版本 {api.version}</span>
              {api.owner ? <span className="a-tag a-tag--muted">负责人 {api.owner}</span> : null}
              <span className="a-tag a-tag--muted">
                <code>{api.apiCode}</code>
              </span>
              {api.docFile ? (
                <span className="a-tag a-tag--muted" title={api.docFile.name}>
                  文档 {api.docFile.name}
                </span>
              ) : null}
            </div>
            {api.description ? <p className="c-apidoc-desc">{api.description}</p> : null}
            <TextDocSection
              title="请求参数"
              hint="以下内容来自运营后台接口配置。"
              content={requestText}
            />
            <TextDocSection
              title="响应字段"
              hint="以下内容来自运营后台接口配置。"
              content={responseText}
            />
            <ErrorCodeTable rows={api.errorCodes} />
            <ExampleBlock title="示例请求" content={api.exampleRequest} />
            <ExampleBlock title="示例响应" content={api.exampleResponse} />
          </div>
        </div>
      </div>
    </div>
  );
}

function TextDocSection({
  title,
  hint,
  content,
}: {
  title: string;
  hint?: string;
  content: string;
}) {
  if (!content.trim()) return null;
  return (
    <section className="c-apidoc-section">
      <h3 className="c-apidoc-section__title">{title}</h3>
      {hint ? <p className="c-apidoc-section__hint">{hint}</p> : null}
      <pre className="c-apidoc-fields">{content}</pre>
    </section>
  );
}

function ErrorCodeTable({ rows }: { rows: ApiErrorCode[] }) {
  if (rows.length === 0) return null;
  return (
    <section className="c-apidoc-section">
      <h3 className="c-apidoc-section__title">错误码</h3>
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th style={{ width: 140 }}>错误码</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code}>
                <td>
                  <code>{row.code}</code>
                </td>
                <td>{row.desc}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ExampleBlock({ title, content }: { title: string; content: string }) {
  if (!content.trim()) return null;
  return (
    <section className="c-apidoc-section">
      <h3 className="c-apidoc-section__title">{title}</h3>
      <pre className="c-apidoc-example">{content}</pre>
    </section>
  );
}
