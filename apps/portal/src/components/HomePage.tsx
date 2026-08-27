"use client";

import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductShowcase } from "@/components/ProductShowcase";
import { AUDIT_THEMES, VERIFY_THEMES } from "@/lib/content";

export function HomePage() {
  return (
    <>
      <HeroCarousel />

      <ProductShowcase
        id="verify"
        heading="版权核验"
        themes={VERIFY_THEMES}
      />

      <ProductShowcase
        id="audit"
        heading="智能辅助审核"
        themes={AUDIT_THEMES}
        subtle
      />
    </>
  );
}
