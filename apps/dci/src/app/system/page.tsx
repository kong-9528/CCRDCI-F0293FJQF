import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { SYSTEM_HISTORY, SYSTEM_PILLARS } from "@/lib/content";

export const metadata: Metadata = { title: "DCI体系" };

export default function SystemPage() {
  return (
    <div>
      <PageHero
        title={
          <>
            DCI体系4.0(全球版权数据中心)
            <br />
            ——AI时代的版权可信数据基础设施
          </>
        }
      />

      <section className="d-section d-section--soft">
        <div className="d-container d-split">
          <div>
            <p style={{ marginTop: 0, fontSize: 16, lineHeight: 1.8 }}>
              <strong>DCI体系</strong>
              是以DCI国家标准为引领，以标准化标识为基础手段，以AI、区块链等新技术的系统集成应用为驱动，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。
            </p>
            <p style={{ color: "var(--d-muted)", fontSize: 15, lineHeight: 1.8 }}>
              DCI体系的基础核心是通过为数字网络环境下每一个版权内容与其相关权益主体间一一对应的权属关系和权益状态分配唯一的、可查验的“版权身份证”——DCI，实现从版权内容产生的源头明确权属关系、权益状态的同时，进一步支撑版权内容全网跨平台畅通流转、高效配置、价值释放和有效保护。
            </p>
          </div>
          <div className="d-icon-grid">
            {SYSTEM_PILLARS.map((item) => (
              <div key={item.label} className="d-icon-tile">
                <span>{item.label.slice(0, 1)}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            DCI体系发展历程
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 0" }} />
          <div className="d-timeline">
            {SYSTEM_HISTORY.map((item) => (
              <article
                key={item.title}
                className={`d-timeline__item${item.accent === "blue" ? " is-blue" : ""}${item.accent === "red" ? " is-red" : ""}`}
              >
                <div className="d-timeline__period">{item.period}</div>
                <div>
                  <h3 className="d-timeline__title">
                    {item.title}
                    {item.badge ? <span className="d-timeline__badge">{item.badge}</span> : null}
                  </h3>
                  <ul className="d-timeline__points">
                    {item.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
