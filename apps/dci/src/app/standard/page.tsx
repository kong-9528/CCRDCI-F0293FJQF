import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { STANDARD_IMAGES, STANDARD_SCENES } from "@/lib/content";

export const metadata: Metadata = { title: "DCI标准" };

export default function StandardPage() {
  return (
    <div>
      <PageHero
        title="DCI标准"
        subtitle="DCI体系始终以标准为创新引领，逐步构建以DCI国家标准为核心的版权标准体系，并面向音视图文等各垂直领域数字生态及AI新业态新场景开展贯标试点应用。"
      />

      <section className="d-section">
        <div className="d-container d-split d-split--center">
          <p style={{ margin: 0, fontSize: 16, lineHeight: 1.8 }}>
            <strong>DCI</strong>
            ，英文全称Digital Copyright Identifier，中文名称为数字版权唯一标识符，是数字网络环境下用于唯一标识和描述权利人对其符合作品特征的智力成果享有权益的一组字符，适用于版权创造、运用、保护、管理、服务等全生命周期的标识体系构建与数据互操作。
          </p>
          <div className="d-card d-card--pad">
            <img src={STANDARD_IMAGES.intro} alt="DCI数字版权唯一标识符" />
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container d-split d-split--center">
          <div className="d-card d-card--pad">
            <img src={STANDARD_IMAGES.system} alt="DCI标准体系" />
          </div>
          <div>
            <h2 className="d-section__title">DCI标准体系</h2>
            <div className="d-gold-divider" style={{ margin: "12px 0 18px" }} />
            <p style={{ margin: 0, color: "var(--d-muted)", fontSize: 15, lineHeight: 1.8 }}>
              DCI标准体系以《GB/T 45913-2025数字版权唯一标识符（DCI）》为核心，覆盖版权创造、运用、保护、管理、服务全链条。纳入DCI可信生态的合作伙伴在进行DCI分配及携载、DCI标识应用、数字版权登记、版权登记证书（数字版）签发、版权授权交易、版权维权保护等均采用DCI标准。
            </p>
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            国家标准
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-split d-split--center">
            <div className="d-card d-card--pad">
              <img src={STANDARD_IMAGES.national} alt="DCI国家标准" />
            </div>
            <p style={{ margin: 0, color: "var(--d-muted)", fontSize: 15, lineHeight: 1.8 }}>
              《GB/T 45913-2025数字版权唯一标识符（DCI）》国家标准由国家市场监督管理总局和国标委共同发布，2025年11月1日起正式实施。标准旨在数字网络环境下，为权利人对其符合作品特征的智力成果享有的版权提供唯一的标识代码，规定了数字版权唯一标识符（digital copyright identifier；DCI）的编码结构、分配原则和管理方式。该标准是数字网络环境下版权领域标准中的一项核心标准，适用覆盖数字网络环境下版权创作、运用、保护、管理与服务全链条。
            </p>
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            行业标准
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-card d-card--pad">
            <img src={STANDARD_IMAGES.industry} alt="DCI行业标准体系" />
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container">
          <h2 className="d-section__title" style={{ textAlign: "center" }}>
            DCI贯标应用
          </h2>
          <div className="d-gold-divider d-gold-divider--center" style={{ margin: "12px auto 24px" }} />
          <div className="d-scene-grid">
            {STANDARD_SCENES.map((scene) => (
              <div key={scene} className="d-scene">
                {scene}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
