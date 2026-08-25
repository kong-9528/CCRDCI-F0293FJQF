import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ProductFormFields,
  type ProductFormValues,
} from "@/components/ProductFormFields";
import {
  PRODUCT_DESCRIPTION_MAX,
  useProductsStore,
  type BusinessLine,
} from "@/lib/productsStore";

export function ProductEditPage() {
  const { code = "" } = useParams();
  const navigate = useNavigate();
  const store = useProductsStore();

  const product = useMemo(
    () => store.products.find((item) => item.code === code) ?? null,
    [store.products, code],
  );

  const [form, setForm] = useState<ProductFormValues>({
    category: "verify",
    name: "",
    description: "",
    businessLines: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!product) {
      setReady(true);
      return;
    }
    setForm({
      category: product.category,
      name: product.name,
      description: product.description,
      businessLines: [...product.businessLines],
    });
    setError(null);
    setReady(true);
  }, [product]);

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
    if (!product) return;
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
      store.update(product.code, form);
      navigate("/products");
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存失败");
    }
  };

  if (!ready) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑产品</div>
        <div className="a-card__body">
          <div className="a-empty">加载中…</div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="a-card">
        <div className="a-card__head">编辑产品</div>
        <div className="a-card__body">
          <div className="a-empty">产品不存在</div>
          <div className="a-form-actions" style={{ marginTop: 16 }}>
            <button type="button" className="a-btn" onClick={() => navigate("/products")}>
              返回列表
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="a-stack">
      <div className="a-card">
        <div className="a-card__head">
          编辑产品
          <div className="a-card__extra">
            <button type="button" className="a-btn a-btn--sm" onClick={() => navigate("/products")}>
              返回
            </button>
          </div>
        </div>
        <div className="a-card__body a-stack">
          <div className="a-form-notice" role="note">
            修改产品信息不会影响产品的上下架状态，会影响该产品的业务线。
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
