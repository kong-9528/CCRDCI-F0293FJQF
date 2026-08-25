export type NavIconId =
  | "dashboard"
  | "dci"
  | "info"
  | "cert"
  | "safety"
  | "duplicate"
  | "infringement"
  | "keys"
  | "account"
  | "api-docs"
  | "help";

type Props = {
  id: NavIconId;
  className?: string;
};

/** 侧栏菜单图标（20×20，stroke） */
export function NavIcon({ id, className = "a-menu__icon" }: Props) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };

  switch (id) {
    case "dashboard":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="7" height="9" rx="1" />
          <rect x="14" y="3" width="7" height="5" rx="1" />
          <rect x="14" y="12" width="7" height="9" rx="1" />
          <rect x="3" y="16" width="7" height="5" rx="1" />
        </svg>
      );
    case "dci":
      return (
        <svg {...common}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "info":
      return (
        <svg {...common}>
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      );
    case "cert":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="5" />
          <path d="M7 10v5a5 5 0 0 0 10 0v-5" />
          <path d="M12 18v3" />
          <path d="M8 21h8" />
        </svg>
      );
    case "safety":
      return (
        <svg {...common}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "duplicate":
      return (
        <svg {...common}>
          <rect x="9" y="9" width="13" height="13" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      );
    case "infringement":
      return (
        <svg {...common}>
          <path d="m16 16 3-8-8 3-3 8 8-3z" />
          <path d="m2 2 20 20" />
        </svg>
      );
    case "keys":
      return (
        <svg {...common}>
          <circle cx="8" cy="15" r="4" />
          <path d="M12 15h9" />
          <path d="M18 15v3" />
          <path d="M21 15v3" />
          <path d="M15 7a4 4 0 0 1 4 4v1" />
        </svg>
      );
    case "account":
      return (
        <svg {...common}>
          <path d="M3 21h18" />
          <path d="M5 21V7l8-4v18" />
          <path d="M19 21V11l-6-4" />
          <path d="M9 9v.01" />
          <path d="M9 12v.01" />
          <path d="M9 15v.01" />
          <path d="M9 18v.01" />
        </svg>
      );
    case "api-docs":
      return (
        <svg {...common}>
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <path d="M8 7h8" />
          <path d="M8 11h6" />
        </svg>
      );
    case "help":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="10" />
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      );
  }
}
