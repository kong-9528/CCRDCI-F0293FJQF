import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ECOLOGY_TYPES } from "@/lib/content";

export const metadata: Metadata = { title: "DCI生态" };

export default function EcologyPage() {
  return (
    <div>
      <PageHero title="DCI生态" subtitle="秉承“共建、共治、共享”理念，共同构建DCI可信生态" />

      <section className="d-section">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            DCI可信生态
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-eco-type-grid">
            {ECOLOGY_TYPES.map((item) => (
              <article key={item.title} className="d-eco-type">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
