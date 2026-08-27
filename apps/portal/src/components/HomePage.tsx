"use client";

import { HeroCarousel } from "@/components/HeroCarousel";
import { ProductShowcase } from "@/components/ProductShowcase";
import { AUDIT_SECTION, VERIFY_SECTION } from "@/lib/content";

export function HomePage() {
  return (
    <>
      <HeroCarousel />

      <ProductShowcase section={VERIFY_SECTION} tone="verify" />

      <ProductShowcase section={AUDIT_SECTION} tone="audit" />
    </>
  );
}
