"use client";

import { useState } from "react";
import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ProcessSection } from "@/components/ProcessSection";
import { Reveal } from "@/components/Reveal";
import { LoginModal } from "@/components/LoginModal";
import { JoinDialog } from "@/components/JoinDialog";
import { AUDIT_THEMES, VERIFY_THEMES } from "@/lib/content";

export function HomePage() {
  const [loginOpen, setLoginOpen] = useState(false);
  const [joinOpen, setJoinOpen] = useState(false);

  return (
    <>
      <HeroCarousel onLogin={() => setLoginOpen(true)} onJoin={() => setJoinOpen(true)} />

      <ProductShowcase
        id="verify"
        eyebrow="Copyright Verification"
        heading="版权核验产品"
        themes={VERIFY_THEMES}
      />

      <ProductShowcase
        id="audit"
        eyebrow="Intelligent Audit"
        heading="智能审核服务"
        themes={AUDIT_THEMES}
        subtle
      />

      <ProcessSection />

      <section className="p-stats">
        <div className="p-container">
          <Reveal>
            <div className="p-stats__grid">
              <div>
                <div className="p-stats__num">6</div>
                <div className="p-stats__label">API 产品能力</div>
              </div>
              <div>
                <div className="p-stats__num">3</div>
                <div className="p-stats__label">WebUI 同步操作</div>
              </div>
              <div>
                <div className="p-stats__num">秒级</div>
                <div className="p-stats__label">核验响应体验</div>
              </div>
              <div>
                <div className="p-stats__num">按次</div>
                <div className="p-stats__label">清晰计量计费</div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <JoinDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  );
}
