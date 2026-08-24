import { Link } from "react-router-dom";
import { API_DOC_PRODUCTS } from "@/lib/apiDocs";

export function ApiDocsOverviewPage() {
  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">API接口文档</div>
        <div className="a-card__body">
          <p className="a-field__hint" style={{ marginBottom: 16 }}>
            技术服务中心 · 全部产品接口文档 · v2.1（首版骨架，部分接口为示例）
          </p>
          <div className="a-quick-grid">
            {API_DOC_PRODUCTS.map((p) => (
              <Link key={p.id} to={`/api-docs/${p.id}`} className="a-quick-link">
                <span>
                  {p.name}
                  <span className="a-field__hint" style={{ display: "block", marginTop: 4 }}>
                    {p.summary}
                  </span>
                </span>
                <span>→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
