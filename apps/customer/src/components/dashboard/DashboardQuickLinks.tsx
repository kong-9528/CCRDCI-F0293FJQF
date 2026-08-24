import { Link } from "react-router-dom";
import { PRODUCTS, productName, type ProductCode } from "@/lib/catalog";

const QUICK_EXTRAS = [
  { label: "API 文档", to: "/api-docs", desc: "接口说明与示例" },
  { label: "密钥管理", to: "/keys", desc: "AccessKey / Secret" },
  { label: "帮助中心", to: "/help", desc: "接入指南与 FAQ" },
] as const;

const QUICK_DESC: Partial<Record<ProductCode, string>> = {
  dci: "编码核验 · 权属查询",
  info: "登记信息 · 权属匹配",
  certificate: "证书真伪 · 批量核验",
  safety: "文本 · 图片 · 视频",
  duplicate: "登记查重 · 相似报告",
  infringement: "侵权检测 · 风险分析",
};

export function DashboardQuickLinks() {
  return (
    <div className="a-card">
      <div className="a-card__head">快捷入口</div>
      <div className="a-card__body">
        <div className="c-quick-tiles">
          {PRODUCTS.map((p) => (
            <Link key={p.code} to={p.path} className="c-quick-tile">
              <span className="c-quick-tile__title">{productName(p.code)}</span>
              <span className="c-quick-tile__desc">{QUICK_DESC[p.code] ?? "进入服务"}</span>
            </Link>
          ))}
          {QUICK_EXTRAS.map((item) => (
            <Link key={item.to} to={item.to} className="c-quick-tile c-quick-tile--muted">
              <span className="c-quick-tile__title">{item.label}</span>
              <span className="c-quick-tile__desc">{item.desc}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
