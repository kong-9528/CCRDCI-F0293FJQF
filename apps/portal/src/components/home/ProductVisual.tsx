type Props = {
  productId: string;
  className?: string;
};

export function ProductVisual({ productId, className = "" }: Props) {
  const g1 = `pg1-${productId}`;
  const g2 = `pg2-${productId}`;

  return (
    <div className={`p-product-visual ${className}`.trim()} data-product={productId} aria-hidden>
      <svg viewBox="0 0 320 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="p-product-visual__svg">
        <defs>
          <linearGradient id={g1} x1="0" y1="0" x2="1" y2="1">
            <stop stopColor="#0B62B8" />
            <stop offset="1" stopColor="#00B8C6" />
          </linearGradient>
          <linearGradient id={g2} x1="0" y1="1" x2="1" y2="0">
            <stop stopColor="#003161" />
            <stop offset="1" stopColor="#0053A2" />
          </linearGradient>
        </defs>
        <rect width="320" height="200" rx="16" fill={`url(#${g2})`} opacity="0.92" />
        <circle cx="280" cy="40" r="48" fill="rgba(0,184,198,0.15)" />
        <circle cx="40" cy="160" r="36" fill="rgba(11,98,184,0.2)" />

        {productId === "dci" && (
          <>
            <path d="M160 48l-44 18v50c0 32 20 56 44 64 24-8 44-32 44-64V66L160 48z" fill={`url(#${g1})`} />
            <path d="M138 118l14 14 28-30" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
            <rect x="72" y="132" width="176" height="36" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.2)" />
            <text x="88" y="155" fill="#fff" fontSize="14" fontFamily="monospace" fontWeight="600">
              DCI-XXXXXX
            </text>
          </>
        )}

        {productId === "info" && (
          <>
            <rect x="88" y="44" width="144" height="112" rx="14" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" />
            <rect x="108" y="68" width="80" height="8" rx="3" fill="rgba(255,255,255,0.4)" />
            <rect x="108" y="88" width="104" height="6" rx="3" fill="rgba(255,255,255,0.25)" />
            <rect x="108" y="104" width="88" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
            <rect x="108" y="128" width="56" height="18" rx="6" fill={`url(#${g1})`} />
            <circle cx="220" cy="148" r="22" fill="rgba(0,184,198,0.3)" stroke="#00B8C6" strokeWidth="1.5" />
            <path d="M212 148h16M220 140v16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {productId === "certificate" && (
          <>
            <rect x="108" y="36" width="104" height="136" rx="10" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.25)" />
            <circle cx="160" cy="88" r="28" stroke={`url(#${g1})`} strokeWidth="3" fill="none" />
            <path d="M148 88l8 8 16-18" stroke="#00B8C6" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="124" y="128" width="72" height="6" rx="3" fill="rgba(255,255,255,0.3)" />
            <rect x="132" y="140" width="56" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
            <path d="M228 60l28 28-56 56-28-28 56-56z" fill="rgba(0,184,198,0.25)" stroke="#00B8C6" strokeWidth="1.5" />
          </>
        )}

        {productId === "safety" && (
          <>
            <rect x="72" y="52" width="176" height="96" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <rect x="88" y="72" width="120" height="8" rx="3" fill="rgba(255,255,255,0.35)" />
            <rect x="88" y="90" width="144" height="6" rx="3" fill="rgba(255,255,255,0.2)" />
            <rect x="88" y="106" width="96" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
            <path d="M72 52l176 96" stroke="#00B8C6" strokeWidth="2" opacity="0.6" />
            <rect x="108" y="148" width="104" height="24" rx="8" fill="rgba(0,184,198,0.35)" stroke="#00B8C6" />
            <text x="122" y="164" fill="#fff" fontSize="11" fontWeight="600">
              风险筛查
            </text>
          </>
        )}

        {productId === "duplicate" && (
          <>
            <rect x="88" y="56" width="96" height="80" rx="10" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" />
            <rect x="136" y="72" width="96" height="80" rx="10" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" />
            <path d="M184 96h32" stroke="#00B8C6" strokeWidth="2" strokeDasharray="4 4" />
            <rect x="108" y="148" width="104" height="28" rx="8" fill={`url(#${g1})`} opacity="0.85" />
            <text x="128" y="167" fill="#fff" fontSize="12" fontWeight="600">
              相似度 87%
            </text>
          </>
        )}

        {productId === "infringement" && (
          <>
            <circle cx="128" cy="100" r="40" stroke="rgba(255,255,255,0.25)" strokeWidth="2" fill="rgba(255,255,255,0.06)" />
            <circle cx="192" cy="100" r="40" stroke="rgba(0,184,198,0.4)" strokeWidth="2" fill="rgba(0,184,198,0.08)" />
            <path d="M160 72v56M132 100h56" stroke="#00B8C6" strokeWidth="2" strokeLinecap="round" />
            <rect x="96" y="148" width="128" height="28" rx="8" fill="rgba(11,98,184,0.5)" stroke="rgba(0,184,198,0.4)" />
            <text x="118" y="167" fill="#fff" fontSize="11" fontWeight="600">
              侵权风险研判
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
