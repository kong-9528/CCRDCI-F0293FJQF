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
    return <span style={{ color: "var(--n-400)" }}>—</span>;
  }

  return (
    <div className="a-tag--list">
      {display.map((svc) => {
        const expired = derivePeriodStatus(svc.startDate, svc.endDate) === "expired";
        return (
          <span
            key={svc.product}
            className={`a-tag${expired ? " a-tag--muted" : " a-tag--cyan"}`}
            title={
              expired
                ? `产品有效期已到期（${svc.startDate} ~ ${svc.endDate}）`
                : `产品有效期 ${svc.startDate} ~ ${svc.endDate}`
            }
          >
            {productName(svc.product)}
          </span>
        );
      })}
    </div>
  );
}
