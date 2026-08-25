import {
  BUSINESS_LINE_LABEL,
  BUSINESS_LINE_OPTIONS,
  CATEGORY_LABEL,
  PRODUCT_DESCRIPTION_MAX,
  PRODUCT_SECTIONS,
  type BusinessLine,
  type ProductCategory,
} from "@/lib/productsStore";

export type ProductFormValues = {
  category: ProductCategory;
  name: string;
  description: string;
  businessLines: BusinessLine[];
};

type Props = {
  values: ProductFormValues;
  onChange: <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => void;
  onToggleBusinessLine: (line: BusinessLine) => void;
};

function isProductCategory(value: string): value is ProductCategory {
  return value === "verify" || value === "audit";
}

export function ProductFormFields({ values, onChange, onToggleBusinessLine }: Props) {
  const descLeft = PRODUCT_DESCRIPTION_MAX - values.description.length;

  return (
    <div className="a-product-form">
      <div className="a-product-form__row">
        <span className="a-product-form__label">
          所属产品类别 <span className="a-req">*</span>
        </span>
        <div className="a-product-form__control">
          <select
            className="a-input a-product-form__input"
            value={values.category}
            onChange={(e) => {
              const value = e.target.value;
              if (isProductCategory(value)) onChange("category", value);
            }}
          >
            {PRODUCT_SECTIONS.map((section) => (
              <option key={section.id} value={section.category}>
                {CATEGORY_LABEL[section.category]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="a-product-form__row">
        <span className="a-product-form__label">
          产品名称 <span className="a-req">*</span>
        </span>
        <div className="a-product-form__control">
          <input
            className="a-input a-product-form__input"
            value={values.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="请输入产品名称"
          />
        </div>
      </div>

      <div className="a-product-form__row a-product-form__row--top">
        <span className="a-product-form__label">服务说明</span>
        <div className="a-product-form__control a-product-form__control--wide">
          <textarea
            className="a-input a-textarea a-product-form__textarea"
            rows={6}
            value={values.description}
            maxLength={PRODUCT_DESCRIPTION_MAX}
            onChange={(e) => onChange("description", e.target.value)}
            placeholder="请输入产品服务说明，最多 2000 字"
          />
          <span className="a-field__hint a-field__hint--counter">
            还可输入 {descLeft} 字
          </span>
        </div>
      </div>

      <div className="a-product-form__row">
        <span className="a-product-form__label">
          支持的业务线 <span className="a-req">*</span>
        </span>
        <div className="a-product-form__control a-product-form__control--inline">
          <div className="a-check-row">
            {BUSINESS_LINE_OPTIONS.map((line) => (
              <label key={line} className="a-check">
                <input
                  type="checkbox"
                  checked={values.businessLines.includes(line)}
                  onChange={() => onToggleBusinessLine(line)}
                />
                {BUSINESS_LINE_LABEL[line]}
              </label>
            ))}
          </div>
          <span className="a-field__hint">可多选</span>
        </div>
      </div>
    </div>
  );
}
