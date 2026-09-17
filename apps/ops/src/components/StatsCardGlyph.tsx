/** 统计卡片装饰水印（半透明，不抢数据） */
export function StatsCardGlyph({
  kind,
  className = "a-stats-strip__glyph",
}: {
  kind: "trend" | "chart" | "users" | "api" | "product";
  className?: string;
}) {
  if (kind === "trend") {
    return (
      <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
        <path
          d="M18 62 L38 42 L52 56 L78 28"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M62 28 H78 V44"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (kind === "chart") {
    return (
      <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
        <rect x="18" y="48" width="12" height="28" rx="2" fill="currentColor" />
        <rect x="36" y="34" width="12" height="42" rx="2" fill="currentColor" />
        <rect x="54" y="22" width="12" height="54" rx="2" fill="currentColor" />
        <rect x="72" y="40" width="12" height="36" rx="2" fill="currentColor" />
      </svg>
    );
  }

  if (kind === "users") {
    return (
      <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
        <circle cx="48" cy="34" r="14" stroke="currentColor" strokeWidth="6" />
        <path
          d="M20 78c4-16 14-24 28-24s24 8 28 24"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (kind === "api") {
    return (
      <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
        <rect x="22" y="28" width="52" height="40" rx="8" stroke="currentColor" strokeWidth="6" />
        <path d="M34 48h28M40 40v16M56 40v16" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 96 96" fill="none" aria-hidden>
      <rect x="20" y="24" width="56" height="48" rx="8" stroke="currentColor" strokeWidth="6" />
      <path d="M32 40h32M32 52h20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}
