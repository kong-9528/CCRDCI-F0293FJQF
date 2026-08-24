import { Link, useParams, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { copyText } from "@/lib/keys";
import { getApiDocProduct, type ApiParam } from "@/lib/apiDocs";

export function ApiDocProductPage() {
  const { productId = "" } = useParams();
  const [searchParams] = useSearchParams();
  const doc = useMemo(() => getApiDocProduct(productId), [productId]);
  const apiIdFromQuery = searchParams.get("api");

  const initialIndex = useMemo(() => {
    if (!doc || !apiIdFromQuery) return 0;
    const idx = doc.apis.findIndex((item) => item.id === apiIdFromQuery);
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

  if (!doc) {
    return (
      <div className="a-card">
        <div className="a-card__head">API文档</div>
        <div className="a-card__body">
          <div className="a-empty">未找到该产品文档</div>
          <Link to="/api-docs" className="a-btn" style={{ marginTop: 16 }}>
            返回总览
          </Link>
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
        <Link to="/api-docs" className="a-btn a-btn--sm">
          ← 返回
        </Link>
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
                {item.name}
              </button>
            ))}
          </nav>
          <div className="c-apidoc-main">
            <h2 className="c-apidoc-main__title">{api.name}</h2>
            <div className="c-apidoc-endpoint">
              <span className={`c-apidoc-method${api.method === "GET" ? " is-get" : ""}`}>
                {api.method}
              </span>
              <code className="c-apidoc-path">{api.path}</code>
              <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onCopyPath}>
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            {api.description ? <p className="c-apidoc-desc">{api.description}</p> : null}
            <ParamTable
              title="公共参数"
              hint="以下公共参数需要随每次请求一并传递，用于身份认证和请求标识。"
              rows={api.commonParams}
            />
            <ParamTable title="提交参数" rows={api.requestParams} />
            <ParamTable title="返回参数" rows={api.responseParams} />
          </div>
        </div>
      </div>
    </div>
  );
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
