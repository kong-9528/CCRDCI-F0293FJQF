"use client";

import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductShowcase } from "@/components/ProductShowcase";
import { ProcessSection } from "@/components/ProcessSection";
import { AUDIT_THEMES, VERIFY_THEMES } from "@/lib/content";

export function HomePage() {
  return (
    <>
      <HeroCarousel />

      <ProductShowcase
        id="verify"
        eyebrow="Copyright Verification"
        heading="版权核验服务"
        themes={VERIFY_THEMES}
      />

      <ProductShowcase
        id="audit"
        eyebrow="Intelligent Audit"
        heading="智能辅助审核服务"
        themes={AUDIT_THEMES}
        subtle
      />

      <ProcessSection />
    </>
  );
}
