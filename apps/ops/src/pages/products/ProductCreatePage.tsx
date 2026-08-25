import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
  ProductFormFields,
  type ProductFormValues,
} from "@/components/ProductFormFields";
import {
  PRODUCT_DESCRIPTION_MAX,
  useProductsStore,
  type BusinessLine,
  type ProductCategory,
} from "@/lib/productsStore";

function parseCategory(raw: string | null): ProductCategory {
  return raw === "audit" ? "audit" : "verify";
}

export function ProductCreatePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const store = useProductsStore();
  const [form, setForm] = useState<ProductFormValues>(() => ({
    category: parseCategory(searchParams.get("category")),
    name: "",
    description: "",
    businessLines: [],
  }));
  const [error, setError] = useState<string | null>(null);

  const setField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const toggleBusinessLine = (line: BusinessLine) => {
    setForm((prev) => {
      const has = prev.businessLines.includes(line);
      return {
        ...prev,
        businessLines: has
          ? prev.businessLines.filter((item) => item !== line)
          : [...prev.businessLines, line],
      };
    });
  };

  const submit = () => {
    setError(null);
    if (!form.name.trim()) {
      setError("请填写产品名称");
      return;
    }
    if (form.businessLines.length === 0) {
      setError("请至少选择一项业务线");
      return;
    }
    if (form.description.length > PRODUCT_DESCRIPTION_MAX) {
      setError(`服务说明不能超过 ${PRODUCT_DESCRIPTION_MAX} 字`);
      return;
    }
    try {
      store.create(form);
      navigate("/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          新增产品
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate("/products")}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <div className="a-form-notice" role="note">
            新增产品后默认是未上线状态，请放心操作，之后可以在产品列表中管理产品的上下线。
          </div>

          <section className="a-form-section">
            <h3 className="a-form-section__title">产品信息</h3>
            <ProductFormFields
              values={form}
              onChange={setField}
              onToggleBusinessLine={toggleBusinessLine}
            />
          </section>

          {error ? <div className="a-form-error">{error}</div> : null}

          <div className="a-form-actions">
            <button type="button" className="a-btn a-btn--primary" onClick={submit}>
              保存
            </button>
            <Link className="a-btn" to="/products">
              取消
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
