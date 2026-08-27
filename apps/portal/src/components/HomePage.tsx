"use client";

import { HeroCarousel } from "@/components/HeroCarousel";
import { HeroWave } from "@/components/home/SectionDecor";
import { ProductShowcase } from "@/components/ProductShowcase";
import { AUDIT_SECTION, VERIFY_SECTION } from "@/lib/content";

export function HomePage() {
  return (
    <div className="p-home">
      <HeroCarousel />
      <HeroWave />
      <ProductShowcase section={VERIFY_SECTION} tone="verify" />
      <ProductShowcase section={AUDIT_SECTION} tone="audit" />
    </div>
  );
}
