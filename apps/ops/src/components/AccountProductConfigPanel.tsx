import { ProductServicesEditor } from "@/components/ProductServicesEditor";
import type { ProductConfigState } from "@/lib/productConfig";

type Props = {
  value: ProductConfigState;
  onChange: (value: ProductConfigState) => void;
  defaultRange?: { startDate: string; endDate: string };
  mode?: "create" | "edit";
  showUsed?: boolean;
  showStatus?: boolean;
};

export function AccountProductConfigPanel({
  value,
  onChange,
  defaultRange,
  mode = "create",
  showUsed = false,
  showStatus = false,
}: Props) {
  return (
    <div className="a-stack">
      <section className="a-form-section">
        <h4 className="a-form-section__title">
          产品配置
          {mode === "create" ? (
            <span className="a-field__hint" style={{ marginLeft: 8, fontWeight: 400 }}>
              （可选）
            </span>
          ) : null}
        </h4>
        <ProductServicesEditor
          rows={value.productRows}
          onChange={(productRows) => onChange({ ...value, productRows })}
          defaultRange={defaultRange}
          showUsed={showUsed}
          showStatus={showStatus}
          mode={mode}
        />
      </section>
    </div>
  );
}
