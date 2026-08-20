import { PROCESS_STEPS } from "@/lib/content";
import { Reveal } from "@/components/Reveal";

export function ProcessSection() {
  return (
    <section id="process" className="p-section p-section--subtle">
      <div className="p-container">
        <Reveal>
          <div className="p-section__head">
            <div className="p-eyebrow">How it works</div>
            <h2 className="p-h2">合作流程</h2>
            <p className="p-lead">线下签约完成后由运营开通账号，企业即可登录使用产品与查阅 API 文档。</p>
          </div>
          <div className="p-steps">
            {PROCESS_STEPS.map((step) => (
              <article key={step.title} className="p-step">
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </article>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
