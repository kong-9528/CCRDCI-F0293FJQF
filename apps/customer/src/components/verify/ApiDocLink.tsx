import { Link, useLocation } from "react-router-dom";

type Props = {
  productId: string;
  label?: string;
};

export function ApiDocLink({ productId, label = "查看 API 文档 →" }: Props) {
  const location = useLocation();
  return (
    <Link
      to={`/api-docs/${productId}`}
      state={{ from: `${location.pathname}${location.search}` }}
      className="c-verify-apidoc"
    >
      {label}
    </Link>
  );
}
