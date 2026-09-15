import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { LAB_CAPABILITY, LAB_DIRECTIONS } from "@/lib/content";

export const metadata: Metadata = { title: "DCI实验室" };

export default function LabPage() {
  return (
    <div>
      <PageHero title="DCI技术研究与应用联合实验室" align="left" />

      <section className="d-section">
        <div className="d-container" style={{ maxWidth: 880 }}>
          <h2 className="d-section__title">DCI实验室基本介绍</h2>
          <div className="d-card d-card--pad" style={{ marginTop: 16 }}>
            <p style={{ margin: 0, lineHeight: 1.8 }}>
              DCI技术研究与应用联合实验室（简称DCI实验室）由中国版权保护中心牵头，联合华为、蚂蚁数科、淘天集团（阿里云）、中电科等携手共建。
            </p>
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <h2 className="d-section__title">DCI实验室科研方向</h2>
            <p style={{ margin: "12px 0 0", color: "var(--d-muted)" }}>作为版权科技的倡导者、践行者和传播者，</p>
            <p style={{ margin: "4px 0 0", color: "var(--d-muted)" }}>
              DCI实验室始终坚持“共建、共治、共享”的核心理念，
            </p>
            <p style={{ margin: "4px 0 0", color: "var(--d-muted)" }}>科研主攻方向深耕细作</p>
          </div>
          <div className="d-lab-dir-grid">
            {LAB_DIRECTIONS.map((item) => (
              <div key={item} className="d-lab-dir d-card">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container" style={{ maxWidth: 880 }}>
          <article className="d-card d-card--pad">
            <h3 style={{ margin: "0 0 10px" }}>{LAB_CAPABILITY.title}</h3>
            <p style={{ margin: "0 0 12px", color: "var(--d-muted)", lineHeight: 1.75 }}>
              {LAB_CAPABILITY.summary}
            </p>
            <ul style={{ margin: 0, paddingLeft: 18, color: "var(--d-muted)", lineHeight: 1.8 }}>
              {LAB_CAPABILITY.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          </article>
        </div>
      </section>
    </div>
  );
}
