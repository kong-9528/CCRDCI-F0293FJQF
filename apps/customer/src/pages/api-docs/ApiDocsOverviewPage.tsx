import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { catalogIdForProduct, type ProductCode } from "@ctp/api-catalog";
import {
  getApiDocProductsForOverview,
  getApiDocTotalCount,
  subscribeApiCatalog,
} from "@/lib/apiDocs";

const PRODUCT_MARK: Record<string, string> = {
  dci: "DCI",
  info: "INF",
  certificate: "CRT",
  workReview: "REV",
};

const CATEGORY_LABEL: Record<"verify" | "audit", string> = {
  verify: "版权核验",
  audit: "智能审核",
};

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
          技术服务中心 · 全部产品接口文档 · 共 {total} 个已上线接口
        </p>
      </div>
      <div className="c-apidoc-grid">
        {products.map((prod, index) => {
          const empty = prod.apis.length === 0;
          const catalogId = catalogIdForProduct(prod.productCode as ProductCode);
          return (
            <Link
              key={prod.id}
              to={`/docs?catalog=${encodeURIComponent(catalogId)}`}
              state={{ from: `${location.pathname}${location.search}` }}
              className={`c-apidoc-card${empty ? " is-empty" : ""}`}
              style={{ ["--card-i" as string]: index }}
              data-category={prod.category}
            >
              <span className="c-apidoc-card__accent" aria-hidden />
              <div className="c-apidoc-card__mark" aria-hidden>
                {PRODUCT_MARK[prod.id] ?? prod.productCode.slice(0, 3).toUpperCase()}
              </div>
              <div className="c-apidoc-card__body">
                <span className="c-apidoc-card__cat">{CATEGORY_LABEL[prod.category]}</span>
                <div className="c-apidoc-card__title">{prod.name}</div>
                <div className="c-apidoc-card__foot">
                  <span className="c-apidoc-card__count">
                    {empty ? "暂无上线接口" : `${prod.apis.length} 个接口`}
                  </span>
                  <span className="c-apidoc-card__go" aria-hidden>
                    查看
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path
                        d="M3 7h8M7.5 3.5 11 7l-3.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
