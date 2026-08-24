import { Link, useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { getApiDocProduct } from "@/lib/apiDocs";

export function ApiDocProductPage() {
  const { productId = "" } = useParams();
  const doc = useMemo(() => getApiDocProduct(productId), [productId]);
  const [activeApi, setActiveApi] = useState(0);

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

  return (
    <div className="a-stack">
      <div className="a-inline-actions">
        <Link to="/api-docs" className="a-btn a-btn--sm">
          ← 返回
        </Link>
        <span className="a-field__hint">{doc.name}</span>
      </div>
      <div className="a-card">
        <div className="a-card__body" style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <nav
            style={{
              width: 200,
              flexShrink: 0,
              background: "var(--n-50)",
              borderRadius: "var(--ad-radius-sm)",
              padding: 8,
            }}
          >
            {doc.apis.map((item, i) => (
              <button
                key={item.id}
                type="button"
                className={`a-btn a-btn--text a-btn--sm${i === activeApi ? " is-active-doc" : ""}`}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  marginBottom: 2,
                  background: i === activeApi ? "var(--p-600)" : undefined,
                  color: i === activeApi ? "#fff" : undefined,
                }}
                onClick={() => setActiveApi(i)}
              >
                {item.name}
              </button>
            ))}
          </nav>
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: "var(--ad-fs-h1)" }}>{api.name}</h2>
            <div className="a-inline-actions" style={{ marginBottom: 20 }}>
              <span
                className="a-tag a-tag--cyan"
                style={{
                  background: api.method === "GET" ? "var(--ok-500)" : "var(--p-600)",
                  color: "#fff",
                }}
              >
                {api.method}
              </span>
              <code style={{ fontFamily: "var(--font-mono)", fontSize: "var(--ad-fs-body)" }}>
                {api.path}
              </code>
            </div>
            {api.description ? (
              <p className="a-field__hint" style={{ marginBottom: 16 }}>
                {api.description}
              </p>
            ) : null}
            <ParamTable title="公共参数" rows={api.commonParams} />
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
  rows,
}: {
  title: string;
  rows: { name: string; type: string; required: boolean; desc: string }[];
}) {
  if (rows.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ margin: "0 0 12px", fontSize: "var(--ad-fs-h2)" }}>{title}</h3>
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
    </div>
  );
}
