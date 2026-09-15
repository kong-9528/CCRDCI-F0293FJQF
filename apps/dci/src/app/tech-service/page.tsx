import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { TECH_CONTACT, TECH_SERVICES } from "@/lib/content";

export const metadata: Metadata = { title: "DCI®技术服务中心" };

export default function TechServicePage() {
  return (
    <div>
      <PageHero
        title={
          <>
            <span style={{ display: "block", fontSize: 14, letterSpacing: "0.08em", opacity: 0.8, marginBottom: 8 }}>
              DCI® Technical Service Center
            </span>
            DCI®技术服务中心
          </>
        }
        subtitle="为 DCI 注册中心及生态合作方提供专业的技术支持、接口对接与运维保障服务"
      />

      <section className="d-section">
        <div className="d-container">
          <div className="d-tech-grid">
            {TECH_SERVICES.map((item) => (
              <article key={item.title} className="d-tech-card">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            联系我们
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-tech-contact">
            <div className="d-tech-contact__item">
              <strong>技术邮箱</strong>
              <span>{TECH_CONTACT.email}</span>
            </div>
            <div className="d-tech-contact__item">
              <strong>服务热线</strong>
              <span>{TECH_CONTACT.phone}</span>
            </div>
            <div className="d-tech-contact__item">
              <strong>办公地址</strong>
              <span>{TECH_CONTACT.address}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
