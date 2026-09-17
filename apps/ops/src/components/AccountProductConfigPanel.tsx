import { ServicePackagesEditor } from "@/components/ServicePackagesEditor";
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
          技术服务套餐配置
          {mode === "create" ? (
            <span className="a-field__hint" style={{ marginLeft: 8, fontWeight: 400 }}>
              （可选）
            </span>
          ) : null}
        </h4>
        <ServicePackagesEditor
          packages={value.packages}
          onChange={(packages) => onChange({ ...value, packages })}
          defaultRange={defaultRange}
          showUsed={showUsed}
          showStatus={showStatus}
          mode={mode}
        />
      </section>
    </div>
  );
}
