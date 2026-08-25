import { Switch } from "@/components/Switch";
import {
  PRODUCT_SECTIONS,
  useProductsStore,
  type ManagedProduct,
} from "@/lib/productsStore";

function StatusSwitchCell({
  labelOn,
  labelOff,
  checked,
  ariaLabel,
  onChange,
}: {
  labelOn: string;
  labelOff: string;
  checked: boolean;
  ariaLabel: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <div className="a-cell-with-action">
      <span className="a-switch-label">{checked ? labelOn : labelOff}</span>
      <Switch checked={checked} aria-label={ariaLabel} onChange={onChange} />
    </div>
  );
}

function ProductSectionTable({
  title,
  rows,
}: {
  title: string;
  rows: ManagedProduct[];
}) {
  const { productName, setShelfStatus, setPageSubmitEnabled, setApiEnabled } =
    useProductsStore();

  return (
    <div className="a-card">
      <div className="a-card__head">{title}</div>
      <div className="a-card__body a-card__body--flush">
        <table className="a-table">
          <thead>
            <tr>
              <th>产品名称</th>
              <th>上线状态</th>
              <th>页面提交</th>
              <th>API调用</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const name = productName(row.code);
              const online = row.shelfStatus === "online";
              return (
                <tr key={row.code}>
                  <td>{name}</td>
                  <td>
                    <StatusSwitchCell
                      labelOn="上线"
                      labelOff="下线"
                      checked={online}
                      ariaLabel={`${name} ${online ? "下线" : "上线"}`}
                      onChange={(next) =>
                        setShelfStatus(row.code, next ? "online" : "offline")
                      }
                    />
                  </td>
                  <td>
                    <StatusSwitchCell
                      labelOn="支持"
                      labelOff="不支持"
                      checked={row.pageSubmitEnabled}
                      ariaLabel={`${name} 页面提交`}
                      onChange={(next) => setPageSubmitEnabled(row.code, next)}
                    />
                  </td>
                  <td>
                    <StatusSwitchCell
                      labelOn="支持"
                      labelOff="不支持"
                      checked={row.apiEnabled}
                      ariaLabel={`${name} API调用`}
                      onChange={(next) => setApiEnabled(row.code, next)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function ProductManagePage() {
  const { getByCategory } = useProductsStore();

  return (
    <div className="a-stack">
      {PRODUCT_SECTIONS.map((section) => (
        <ProductSectionTable
          key={section.id}
          title={section.title}
          rows={getByCategory(section.category)}
        />
      ))}
    </div>
  );
}
