import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { REGISTRY_PARTNERS } from "@/lib/content";

export const metadata: Metadata = { title: "DCI注册中心" };

export default function RegistryPage() {
  return (
    <div>
      <PageHero
        title={
          <>
            DCI 注册中心
            <br />
            ——DCI可信生态合作伙伴
          </>
        }
      />

      <section className="d-section">
        <div className="d-container" style={{ maxWidth: 880 }}>
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            DCI注册中心职责
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-card d-card--pad" style={{ display: "grid", gap: 14 }}>
            <p style={{ margin: 0, lineHeight: 1.8 }}>
              DCI注册中心是经 DCI 管理中心评估认证的DCI 可信生态合作伙伴，负责 DCI 业务的标准化落地与数据运营。
            </p>
            <p style={{ margin: 0, color: "var(--d-muted)", lineHeight: 1.8 }}>
              是 DCI 码的分配与业务审核执行机构，管理本域内的DCI申领平台的相关服务，帮助其提升服务能力与合规水平。
            </p>
            <p style={{ margin: 0, color: "var(--d-muted)", lineHeight: 1.8 }}>
              DCI注册中心涵盖版权登记机构、内容平台、版权专业服务商等主体类型。
            </p>
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            DCI注册中心合作伙伴
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-partner-grid">
            {REGISTRY_PARTNERS.map((p) => (
              <div key={p.name} className="d-partner">
                {p.name}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
