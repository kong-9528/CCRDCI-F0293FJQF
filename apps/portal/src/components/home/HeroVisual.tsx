type Props = {
  variant: "trust" | "verify" | "audit";
  className?: string;
};

export function HeroVisual({ variant, className = "" }: Props) {
  return (
    <div className={`p-hero-visual ${className}`.trim()} data-variant={variant} aria-hidden>
      <svg viewBox="0 0 560 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="p-hero-visual__svg">
        <defs>
          <linearGradient id="hg1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0B62B8" />
            <stop offset="100%" stopColor="#00B8C6" />
          </linearGradient>
          <linearGradient id="hg2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#003161" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#0B62B8" stopOpacity="0.6" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 背景装饰圆环 */}
        <circle cx="420" cy="120" r="90" stroke="rgba(255,255,255,0.12)" strokeWidth="1.5" />
        <circle cx="420" cy="120" r="130" stroke="rgba(0,184,198,0.18)" strokeWidth="1" strokeDasharray="6 8" />
        <circle cx="140" cy="360" r="70" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5" />
        <path d="M40 240h480" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        <path d="M80 80l400 320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

        {variant === "trust" && (
          <>
            <rect x="168" y="108" width="224" height="264" rx="24" fill="url(#hg2)" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
            <path d="M280 168l-52 20v58c0 36 22 62 52 72 30-10 52-36 52-72v-58l-52-20z" fill="url(#hg1)" filter="url(#glow)" opacity="0.95" />
            <path d="M256 248l16 16 32-34" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="88" y="156" width="96" height="64" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.22)" />
            <rect x="376" y="196" width="108" height="72" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.18)" />
            <circle cx="136" cy="188" r="6" fill="#00B8C6" />
            <circle cx="430" cy="232" r="6" fill="#00B8C6" />
            <path d="M184 188h56M408 232h-40" stroke="rgba(0,184,198,0.5)" strokeWidth="1.5" strokeDasharray="4 4" />
            <rect x="196" y="320" width="168" height="12" rx="6" fill="rgba(255,255,255,0.15)" />
            <rect x="212" y="344" width="136" height="8" rx="4" fill="rgba(255,255,255,0.1)" />
          </>
        )}

        {variant === "verify" && (
          <>
            <rect x="120" y="96" width="320" height="288" rx="28" fill="url(#hg2)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <rect x="156" y="132" width="248" height="168" rx="16" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.15)" />
            <rect x="176" y="156" width="88" height="12" rx="4" fill="rgba(255,255,255,0.35)" />
            <rect x="176" y="180" width="168" height="8" rx="4" fill="rgba(255,255,255,0.2)" />
            <rect x="176" y="200" width="140" height="8" rx="4" fill="rgba(255,255,255,0.15)" />
            <rect x="176" y="236" width="72" height="28" rx="8" fill="url(#hg1)" />
            <text x="188" y="255" fill="#fff" fontSize="13" fontFamily="monospace" fontWeight="600">
              DCI·2026
            </text>
            <circle cx="368" cy="248" r="36" fill="rgba(0,184,198,0.25)" stroke="#00B8C6" strokeWidth="2" />
            <path d="M352 248h32M368 232v32" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            <rect x="196" y="320" width="168" height="44" rx="12" fill="rgba(11,98,184,0.45)" stroke="rgba(0,184,198,0.4)" />
            <path d="M216 342h128M216 354h88" stroke="rgba(255,255,255,0.35)" strokeWidth="2" strokeLinecap="round" />
          </>
        )}

        {variant === "audit" && (
          <>
            <rect x="108" y="88" width="344" height="304" rx="28" fill="url(#hg2)" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
            <rect x="140" y="128" width="136" height="100" rx="14" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" />
            <rect x="292" y="128" width="136" height="100" rx="14" fill="rgba(255,255,255,0.07)" stroke="rgba(255,255,255,0.15)" />
            <path d="M248 178h64" stroke="#00B8C6" strokeWidth="2" strokeDasharray="5 5" />
            <circle cx="248" cy="178" r="5" fill="#00B8C6" />
            <circle cx="312" cy="178" r="5" fill="#00B8C6" />
            <rect x="140" y="252" width="288" height="96" rx="14" fill="rgba(11,98,184,0.35)" stroke="rgba(0,184,198,0.35)" />
            <rect x="160" y="276" width="120" height="10" rx="4" fill="rgba(255,255,255,0.3)" />
            <rect x="160" y="298" width="200" height="8" rx="4" fill="rgba(255,255,255,0.18)" />
            <rect x="160" y="316" width="88" height="20" rx="8" fill="rgba(0,184,198,0.35)" stroke="#00B8C6" strokeWidth="1" />
            <path d="M100 160l40-40M460 320l40 40" stroke="rgba(0,184,198,0.45)" strokeWidth="1.5" />
            <polygon points="280,72 292,96 268,96" fill="rgba(0,184,198,0.6)" />
          </>
        )}

        {/* 浮动光点 */}
        <circle className="p-hero-visual__spark p-hero-visual__spark--1" cx="480" cy="80" r="4" fill="#00B8C6" />
        <circle className="p-hero-visual__spark p-hero-visual__spark--2" cx="72" cy="300" r="3" fill="#fff" opacity="0.6" />
        <circle className="p-hero-visual__spark p-hero-visual__spark--3" cx="500" cy="380" r="5" fill="#0B62B8" opacity="0.8" />
      </svg>
    </div>
  );
}
