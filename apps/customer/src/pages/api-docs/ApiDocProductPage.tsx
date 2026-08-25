import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  getApiDocProduct,
  subscribeApiCatalog,
  type ApiErrorCode,
  type ApiParam,
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

  const onCopyPath = async () => {
    const ok = await copyText(api.path);
    if (!ok) {
      showToast("复制失败");
      return;
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1000);
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
            <h2 className="c-apidoc-main__title">{api.apiName}</h2>
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
            </div>
            {api.description ? <p className="c-apidoc-desc">{api.description}</p> : null}
            <ParamTable
              title="公共鉴权参数"
              hint="以下公共参数需要随每次请求一并传递，用于身份认证和请求标识。"
              rows={api.commonParams}
            />
            <ParamTable title="Path 参数" rows={api.pathParams} />
            <ParamTable title="Query 参数" rows={api.queryParams} />
            <ParamTable title="Header 参数" rows={api.headerParams} />
            <ParamTable title="Body 参数" rows={api.bodyParams} />
            <ParamTable title="返回参数" rows={api.responseParams} />
            <ErrorCodeTable rows={api.errorCodes} />
            <ExampleBlock title="示例请求" content={api.exampleRequest} />
            <ExampleBlock title="示例响应" content={api.exampleResponse} />
          </div>
        </div>
      </div>
    </div>
  );
}

function hasExtraColumns(rows: ApiParam[]) {
  return rows.some((r) => r.defaultValue || r.validation || r.example);
}

function ParamTable({
  title,
  hint,
  rows,
}: {
  title: string;
  hint?: string;
  rows: ApiParam[];
}) {
  if (rows.length === 0) return null;
  const showExtra = hasExtraColumns(rows);
  return (
    <section className="c-apidoc-section">
      <h3 className="c-apidoc-section__title">{title}</h3>
      {hint ? <p className="c-apidoc-section__hint">{hint}</p> : null}
      <div className="a-table-wrap">
        <table className="a-table">
          <thead>
            <tr>
              <th>参数名</th>
              <th>类型</th>
              <th>必填</th>
              <th>说明</th>
              {showExtra ? (
                <>
                  <th>默认值</th>
                  <th>校验</th>
                  <th>示例</th>
                </>
              ) : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name}>
                <td>
                  <code>{row.name}</code>
                </td>
                <td>{row.type}</td>
                <td>{row.required ? "是" : "否"}</td>
                <td>{row.desc}</td>
                {showExtra ? (
                  <>
                    <td>{row.defaultValue || "—"}</td>
                    <td>{row.validation || "—"}</td>
                    <td>{row.example || "—"}</td>
                  </>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
