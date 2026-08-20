import { Link } from "react-router-dom";
import {
  MOCK_USAGE,
  OPENED_PRODUCTS,
  productName,
  productPath,
  type ProductCode,
} from "@/lib/catalog";

const QUICK_EXTRAS: { label: string; to: string; ready: boolean }[] = [
  { label: "API 文档", to: "/api-docs", ready: false },
  { label: "数据分析", to: "/analytics", ready: false },
  { label: "上级监管报表", to: "/reports/supervise", ready: false },
  { label: "订阅报表下载", to: "/reports/subscribe", ready: false },
];

export function DashboardPage() {
  const cards = MOCK_USAGE.filter((u) => OPENED_PRODUCTS.includes(u.code));

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          已开通产品
          <div className="a-card__extra">共 {cards.length} 项</div>
        </div>
        <div className="a-card__body">
          <div className="a-row a-row--3">
            {cards.map((item) => (
              <div key={item.code} className="a-card a-stat">
                <div className="a-stat__label">
                  {productName(item.code)}
                  {item.daysLeft <= 30 ? (
                    <span className="a-tag a-tag--wn" style={{ marginLeft: 8 }}>
                      即将到期
                    </span>
                  ) : null}
                </div>
                <div className="a-stat__num">{item.monthCalls.toLocaleString()}</div>
                <div className="a-stat__extra">
                  <span>本月调用</span>
                  <span
                    className={`a-stat__trend ${item.momPercent >= 0 ? "up" : "down"}`}
                  >
                    环比 {item.momPercent >= 0 ? "+" : ""}
                    {item.momPercent}%
                  </span>
                </div>
                <div className="a-stat__extra">
                  <span>累计 {item.totalCalls.toLocaleString()}</span>
                  <span>到期 {item.expireAt}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">
          调用量趋势
          <div className="a-card__extra">近 7 天 · 图表后续接入</div>
        </div>
        <div className="a-card__body">
          <div className="a-placeholder">折线图占位：支持近 7 / 30 天、多产品勾选对比</div>
        </div>
      </div>

      <div className="a-card">
        <div className="a-card__head">快捷入口</div>
        <div className="a-card__body">
          <div className="a-quick-grid">
            {OPENED_PRODUCTS.slice(0, 6).map((code: ProductCode) => {
              const path = productPath(code);
              const ready = path === "/verify/dci";
              return ready ? (
                <Link key={code} to={path} className="a-quick-link">
                  <span>{productName(code)}</span>
                  <span>→</span>
                </Link>
              ) : (
                <span key={code} className="a-quick-link is-disabled" title="即将接入">
                  <span>{productName(code)}</span>
                  <span>→</span>
                </span>
              );
            })}
            {QUICK_EXTRAS.map((item) =>
              item.ready ? (
                <Link key={item.to} to={item.to} className="a-quick-link">
                  <span>{item.label}</span>
                  <span>→</span>
                </Link>
              ) : (
                <span key={item.to} className="a-quick-link is-disabled" title="即将接入">
                  <span>{item.label}</span>
                  <span>→</span>
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
