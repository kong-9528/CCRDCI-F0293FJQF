type Props = {
  tone?: "verify" | "audit";
};

/** 区块装饰：斜线网格 + 角标括号 */
export function SectionDecor({ tone = "verify" }: Props) {
  return (
    <div className={`p-section-decor p-section-decor--${tone}`} aria-hidden>
      <svg className="p-section-decor__lines" viewBox="0 0 1200 120" preserveAspectRatio="none">
        <path d="M0 60 Q300 20 600 60 T1200 60" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.35" />
        <path d="M0 80 Q400 40 800 80 T1200 80" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.2" />
      </svg>
      <span className="p-section-decor__corner p-section-decor__corner--tl" />
      <span className="p-section-decor__corner p-section-decor__corner--br" />
    </div>
  );
}

/** Hero 与首屏产品区之间的过渡波浪 */
export function HeroWave() {
  return (
    <div className="p-hero-wave" aria-hidden>
      <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="p-hero-wave__svg">
        <path
          d="M0 40 Q360 0 720 40 T1440 40 V80 H0 Z"
          fill="#fff"
        />
        <path
          d="M0 50 Q360 20 720 50 T1440 50"
          fill="none"
          stroke="rgba(11,98,184,0.08)"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
