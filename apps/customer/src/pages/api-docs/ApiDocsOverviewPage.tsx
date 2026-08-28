import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  API_DOC_VERSION,
  getApiDocProductsForOverview,
  getApiDocTotalCount,
  subscribeApiCatalog,
} from "@/lib/apiDocs";

export function ApiDocsOverviewPage() {
  const location = useLocation();
  const [, setTick] = useState(0);
  useEffect(() => subscribeApiCatalog(() => setTick((n) => n + 1)), []);

  const products = getApiDocProductsForOverview();
  const total = getApiDocTotalCount();

  return (
    <div className="a-stack c-apidoc-page">
      <div className="c-apidoc-overview-head">
        <h1 className="c-apidoc-overview-head__title">API接口文档</h1>
        <p className="c-apidoc-overview-head__sub">
          技术服务中心 · 全部产品接口文档 · {API_DOC_VERSION} · 共 {total} 个已上线接口
        </p>
      </div>
      <div className="c-apidoc-grid">
        {products.map((prod) => (
          <Link
            key={prod.id}
            to={`/api-docs/${prod.id}`}
            state={{ from: `${location.pathname}${location.search}` }}
            className="c-apidoc-card"
          >
            <div className="c-apidoc-card__title">{prod.name}</div>
            <div className="c-apidoc-card__summary">{prod.summary}</div>
            <div className="c-apidoc-card__tags">
              <span className="a-tag a-tag--ok">{prod.apis.length} 个接口</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
