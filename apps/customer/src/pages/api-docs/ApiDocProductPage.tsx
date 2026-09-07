import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import {
  collectRequestParams,
  getApiDocProduct,
  subscribeApiCatalog,
  type ApiParam,
} from "@/lib/apiDocs";
import { copyText } from "@/lib/keys";

type LocationState = {
  from?: string;
};

/**
 * 与 ops「新增/编辑接口」弹窗字段对齐：
 * 接口名称、请求方式、请求地址、接口描述、请求参数、返回参数、调用/响应示例、接口文档
 * 不展示后台未维护的字段（如错误码、版本号等）
 */
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
    navigate("/api/docs");
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
  const requestParams = collectRequestParams(api);
  const responseParams = api.responseParams ?? [];

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
    const body = [
      `# ${api.apiName}`,
      ``,
      `请求方式：${api.method}`,
      `请求地址：${api.path}`,
      api.description ? `接口描述：${api.description}` : "",
      ``,
      `## 请求参数`,
      requestParams.length
        ? requestParams
            .map(
              (p) =>
                `- ${p.name} (${p.type}, ${p.required ? "必填" : "可选"})${p.desc ? `: ${p.desc}` : ""}`,
            )
            .join("\n")
        : "（无）",
      ``,
      `## 返回参数`,
      responseParams.length
        ? responseParams
            .map(
              (p) =>
                `- ${p.name} (${p.type}, ${p.required ? "必填" : "可选"})${p.desc ? `: ${p.desc}` : ""}`,
            )
            .join("\n")
        : "（无）",
      ``,
      `## 调用示例`,
      api.exampleRequest || "（无）",
      ``,
      `## 响应示例`,
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
                  title={api.docFile.name}
                >
                  下载接口文档
                </button>
              ) : null}
            </div>

            <section className="c-apidoc-section">
              <h3 className="c-apidoc-section__title">请求方式</h3>
              <div className="c-apidoc-endpoint">
                <span className={`c-apidoc-method${api.method === "GET" ? " is-get" : ""}`}>
                  {api.method}
                </span>
              </div>
            </section>

            <section className="c-apidoc-section">
              <h3 className="c-apidoc-section__title">请求地址</h3>
              <div className="c-apidoc-endpoint">
                <code className="c-apidoc-path">{api.path}</code>
                <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onCopyPath}>
                  {copied ? "已复制" : "复制"}
                </button>
              </div>
            </section>

            <section className="c-apidoc-section">
              <h3 className="c-apidoc-section__title">接口描述</h3>
              {api.description.trim() ? (
                <p className="c-apidoc-desc">{api.description}</p>
              ) : (
                <p className="c-apidoc-section__empty">暂无接口描述</p>
              )}
            </section>

            <ParamTable title="请求参数" rows={requestParams} />
            <ParamTable title="返回参数" rows={responseParams} />

            <section className="c-apidoc-section">
              <h3 className="c-apidoc-section__title">调用/响应示例</h3>
              <div className="c-apidoc-examples">
                <div className="c-apidoc-examples__item">
                  <div className="c-apidoc-examples__label">调用示例</div>
                  {api.exampleRequest.trim() ? (
                    <pre className="c-apidoc-example">{api.exampleRequest}</pre>
                  ) : (
                    <p className="c-apidoc-section__empty">暂无调用示例</p>
                  )}
                </div>
                <div className="c-apidoc-examples__item">
                  <div className="c-apidoc-examples__label">响应示例</div>
                  {api.exampleResponse.trim() ? (
                    <pre className="c-apidoc-example">{api.exampleResponse}</pre>
                  ) : (
                    <p className="c-apidoc-section__empty">暂无响应示例</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParamTable({ title, rows }: { title: string; rows: ApiParam[] }) {
  return (
    <section className="c-apidoc-section">
      <h3 className="c-apidoc-section__title">{title}</h3>
      {rows.length === 0 ? (
        <p className="c-apidoc-section__empty">暂无{title}</p>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table a-table--compact">
            <thead>
              <tr>
                <th>参数名</th>
                <th style={{ width: 120 }}>类型</th>
                <th style={{ width: 88 }}>必填</th>
                <th>说明</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={`${title}-${row.name}-${index}`}>
                  <td>
                    <code>{row.name}</code>
                  </td>
                  <td>{row.type}</td>
                  <td>{row.required ? "是" : "否"}</td>
                  <td>{row.desc || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
