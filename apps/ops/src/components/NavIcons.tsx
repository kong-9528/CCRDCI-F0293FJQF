import type { ComponentType, ReactNode } from "react";

/** 侧栏菜单 SVG 图标（16×16，stroke，跟随 currentColor） */

type IconProps = { className?: string };

function Svg({ className, children }: IconProps & { children: ReactNode }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
    >
      {children}
    </svg>
  );
}

const stroke = {
  stroke: "currentColor",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 7.5 8 2.5l5.5 5" {...stroke} />
      <path d="M4 7v5.5h3V9.5h2V12.5h3V7" {...stroke} />
    </Svg>
  );
}

export function IconCustomers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="5" r="2.2" {...stroke} />
      <path d="M2.5 13c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" {...stroke} />
      <circle cx="11.2" cy="5.5" r="1.7" {...stroke} />
      <path d="M13.5 13c0-1.5-1-2.7-2.3-2.7" {...stroke} />
    </Svg>
  );
}

export function IconServices(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="3" width="11" height="3.2" rx="1" {...stroke} />
      <rect x="2.5" y="7.4" width="11" height="3.2" rx="1" {...stroke} />
      <path d="M5 4.6h1.2M5 9h1.2" {...stroke} />
    </Svg>
  );
}

export function IconProducts(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 13.5 5.5v5L8 13.5 2.5 10.5v-5L8 2.5Z" {...stroke} />
      <path d="M8 8v5.5M8 8 13.5 5.5M8 8 2.5 5.5" {...stroke} />
    </Svg>
  );
}

export function IconStatsCustomers(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 13h11" {...stroke} />
      <path d="M4.5 13V7.5M8 13V4.5M11.5 13V9" {...stroke} />
    </Svg>
  );
}

export function IconStatsProducts(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5v5.5l4 2.4" {...stroke} />
      <circle cx="8" cy="8" r="5.5" {...stroke} />
    </Svg>
  );
}

export function IconHelp(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M3.5 2.5h6.5l2.5 2.5V13.5H3.5V2.5Z" {...stroke} />
      <path d="M10 2.5V5h2.5M5.5 8h5M5.5 10.5h3.5" {...stroke} />
    </Svg>
  );
}

export function IconFaq(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="8" r="5.5" {...stroke} />
      <path d="M6.2 6.2a1.9 1.9 0 0 1 3.6.9c0 1.2-1.8 1.6-1.8 2.7" {...stroke} />
      <circle cx="8" cy="12" r="0.6" fill="currentColor" stroke="none" />
    </Svg>
  );
}

export function IconRoles(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M8 2.5 12.5 4.5v3.2c0 3-2 5-4.5 5.8-2.5-.8-4.5-2.8-4.5-5.8V4.5L8 2.5Z" {...stroke} />
      <path d="M6.2 8.1 7.5 9.4 10 6.8" {...stroke} />
    </Svg>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="8" cy="5" r="2.3" {...stroke} />
      <path d="M3.5 13c0-2.3 2-4 4.5-4s4.5 1.7 4.5 4" {...stroke} />
    </Svg>
  );
}

export function IconApi(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M5.5 3.5h5v3h-5v-3Z" {...stroke} />
      <path d="M8 6.5v3" {...stroke} />
      <path d="M4 9.5h8v3H4v-3Z" {...stroke} />
      <path d="M6 12.5v1M10 12.5v1" {...stroke} />
    </Svg>
  );
}

export function IconLogs(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M4 2.5h6.5L13 5v8.5H4V2.5Z" {...stroke} />
      <path d="M10.5 2.5V5H13M5.5 8h5M5.5 10.5h5M5.5 13h3" {...stroke} />
    </Svg>
  );
}

export function IconPortal(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2.5" y="3.5" width="11" height="9" rx="1.2" {...stroke} />
      <path d="M2.5 6.5h11" {...stroke} />
      <path d="M5 9h2.5M5 11h4" {...stroke} />
    </Svg>
  );
}

const NAV_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  "/dashboard": IconHome,
  "/accounts": IconCustomers,
  "/accounts/pending": IconCustomers,
  "/accounts/mine": IconCustomers,
  "/accounts/all": IconCustomers,
  "/customers": IconCustomers,
  "/customer-services": IconServices,
  "/products": IconProducts,
  "/products/verify": IconProducts,
  "/products/audit": IconProducts,
  "/stats/customers": IconStatsCustomers,
  "/stats/products": IconStatsProducts,
  "/stats/account-products": IconStatsProducts,
  "/content/home": IconPortal,
  "/content/portal": IconPortal,
  "/content/center": IconHelp,
  "/content/guide": IconHelp,
  "/content/console-help": IconHelp,
  "/content/faqs": IconFaq,
  "/system/roles": IconRoles,
  "/system/users": IconUsers,
  "/system/api-services": IconApi,
  "/system/op-logs": IconLogs,
};

const GROUP_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  home: IconHome,
  customers: IconCustomers,
  products: IconProducts,
  stats: IconStatsCustomers,
  content: IconPortal,
  system: IconRoles,
};

export function NavIcon({ to, className }: { to: string; className?: string }) {
  const Icon = NAV_ICON_MAP[to];
  if (!Icon) return null;
  return <Icon className={className} />;
}

/** 目录级图标（不用于子模块） */
export function NavGroupIcon({ id, className }: { id: string; className?: string }) {
  const Icon = GROUP_ICON_MAP[id];
  if (!Icon) return null;
  return <Icon className={className} />;
}
