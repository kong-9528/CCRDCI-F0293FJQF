import { Link, useLocation } from "react-router-dom";
import {
  catalogIdForProduct,
  resolveDocProductId,
  type ProductCode,
} from "@ctp/api-catalog";

type Props = {
  /** 产品 id 或别名（如 dci / certificate / workReview / safety） */
  productId: string;
  label?: string;
};

/** 跳转到 /docs，并定位左侧对应产品目录 */
export function ApiDocLink({ productId, label = "查看接口文档 →" }: Props) {
  const location = useLocation();
  const resolved = resolveDocProductId(productId);
  const catalogId = catalogIdForProduct(resolved as ProductCode);

  return (
    <Link
      to={`/docs?catalog=${encodeURIComponent(catalogId)}`}
      state={{ from: `${location.pathname}${location.search}` }}
      className="c-verify-apidoc"
    >
      {label}
    </Link>
  );
}
