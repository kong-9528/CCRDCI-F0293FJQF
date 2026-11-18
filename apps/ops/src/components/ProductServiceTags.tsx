import {
  derivePeriodStatus,
  productName,
  productServicesForDisplay,
  type ProductServiceConfig,
} from "@/lib/catalog";

type Props = {
  services: ProductServiceConfig[];
};

export function ProductServiceTags({ services }: Props) {
  const display = productServicesForDisplay(services);
  if (display.length === 0) {
    return (
      <div className="a-tag--list">
        <span style={{ color: "var(--n-400)" }}>—</span>
      </div>
    );
  }

  return (
    <div className="a-tag--list" role="list">
      {display.map((svc) => {
        const expired = derivePeriodStatus(svc.startDate, svc.endDate) === "expired";
        return (
          <span
            key={svc.product}
            role="listitem"
            className={`a-tag${expired ? " a-tag--muted" : " a-tag--cyan"}`}
            title={
              expired
                ? `技术服务已到期（${svc.startDate} ~ ${svc.endDate}）`
                : `技术服务有效期 ${svc.startDate} ~ ${svc.endDate}`
            }
          >
            {productName(svc.product)}
          </span>
        );
      })}
    </div>
  );
}
