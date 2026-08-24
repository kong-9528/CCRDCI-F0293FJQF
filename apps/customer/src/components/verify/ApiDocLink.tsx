import { Link } from "react-router-dom";

type Props = {
  productId: string;
  label?: string;
};

export function ApiDocLink({ productId, label = "查看 API 文档 →" }: Props) {
  return (
    <Link to={`/api-docs/${productId}`} className="c-verify-apidoc">
      {label}
    </Link>
  );
}
