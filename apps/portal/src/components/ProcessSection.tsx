import { PROCESS_STEPS } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

function StepIcon({ id }: { id: (typeof PROCESS_STEPS)[number]["id"] }) {
  const common = {
    width: 28,
    height: 28,
    viewBox: "0 0 28 28",
    fill: "none",
    "aria-hidden": true as const,
  };

  switch (id) {
    case "sign":
      return (
        <svg {...common}>
          <path
            d="M7 8.5h10.5a2 2 0 0 1 2 2V21a1.5 1.5 0 0 1-1.5 1.5H8.5A1.5 1.5 0 0 1 7 21V8.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <path d="M10 6.5h7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M11 13h6M11 16.5h4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path
            d="M17.5 19.5c1.8-1.2 3.8-1 4.8.2.4.5.2 1.2-.4 1.5l-3.4 1.6-1.6-3.3c-.3-.6.1-1.3.6-1.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "open":
      return (
        <svg {...common}>
          <circle cx="14" cy="11" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M7.5 21.5c.8-3.2 3.2-5 6.5-5s5.7 1.8 6.5 5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <path
            d="M19.5 7.5 21 9l2.2-2.5"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "use":
      return (
        <svg {...common}>
          <rect x="4.5" y="6.5" width="19" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M4.5 11h19" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="8" cy="8.7" r="0.9" fill="currentColor" />
          <circle cx="11" cy="8.7" r="0.9" fill="currentColor" />
          <path d="M9 15.5h4.5M9 18h7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "bill":
      return (
        <svg {...common}>
          <circle cx="14" cy="14" r="8.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M14 9.2v9.6M11.2 11.4c.5-.8 1.4-1.2 2.8-1.2 1.7 0 2.8.7 2.8 1.9s-1.1 1.8-2.9 2.1c-1.8.3-2.9.9-2.9 2.2 0 1.3 1.2 2.1 3.1 2.1 1.4 0 2.4-.5 2.9-1.3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      );
  }
}

export function ProcessSection() {
  return (
    <section id="process" className="p-process">
      <div className="p-process__glow" aria-hidden />
      <div className="p-rail">
        <Reveal>
          <div className="p-section__head p-process__head">
            <div className="p-eyebrow">How it works</div>
            <h2 className="p-h2">
              四步开启
              <span className="p-text-gradient"> 合作之旅</span>
            </h2>
            <p className="p-lead">
              线下签约完成后由运营开通账号，企业即可登录使用产品与查阅 API 文档。
            </p>
          </div>

          <ol className="p-journey">
            {PROCESS_STEPS.map((step, i) => (
              <li key={step.id} className="p-journey__item" style={{ ["--i" as string]: i }}>
                <div className="p-journey__node">
                  <span className="p-journey__ring" aria-hidden />
                  <span className="p-journey__icon">
                    <StepIcon id={step.id} />
                  </span>
                  {i < PROCESS_STEPS.length - 1 ? (
                    <span className="p-journey__bridge" aria-hidden />
                  ) : null}
                </div>
                <article className="p-journey__card">
                  <span className="p-journey__index">{String(i + 1).padStart(2, "0")}</span>
                  <span className="p-journey__hint">{step.hint}</span>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </article>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}
