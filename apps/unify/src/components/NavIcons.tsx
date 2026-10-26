import type { ComponentType, ReactNode } from "react";

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

function IconHome(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 7.5 8 2.5l5.5 5" {...stroke} />
      <path d="M4 7v5.5h3V9.5h2V12.5h3V7" {...stroke} />
    </Svg>
  );
}

function IconAudit(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2.5 13h11" {...stroke} />
      <path d="M4.5 13V7.5M8 13V4.5M11.5 13V9" {...stroke} />
    </Svg>
  );
}

function IconLists(props: IconProps) {
  return (
    <Svg {...props}>
      <circle cx="6" cy="5" r="2.2" {...stroke} />
      <path d="M2.5 13c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5" {...stroke} />
      <circle cx="11.2" cy="5.5" r="1.7" {...stroke} />
      <path d="M13.5 13c0-1.5-1-2.7-2.3-2.7" {...stroke} />
    </Svg>
  );
}

const GROUP_ICON_MAP: Record<string, ComponentType<IconProps>> = {
  home: IconHome,
  audit: IconAudit,
  lists: IconLists,
};

export function NavGroupIcon({ id, className }: { id: string; className?: string }) {
  const Icon = GROUP_ICON_MAP[id];
  if (!Icon) return null;
  return <Icon className={className} />;
}
