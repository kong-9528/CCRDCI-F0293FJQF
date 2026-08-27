"use client";

import { useEffect, useState } from "react";
import { HERO_SLIDES } from "@/lib/content";

export function HeroCarousel() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[index];

  return (
    <section className="p-hero" aria-label="首屏焦点">
      <div className="p-container p-hero__inner">
        <div className="p-hero__slides">
          <div key={slide.id} className="p-hero__slide is-active">
            <h1 className="p-display" style={{ margin: 0, maxWidth: 900 }}>
              {slide.title}
              <br />
              <span className="p-text-gradient">{slide.highlight}</span>
            </h1>
            <p className="p-lead">{slide.lead}</p>
          </div>
        </div>
        <div className="p-hero__dots" role="tablist" aria-label="价值主张">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              className={`p-hero__dot${i === index ? " is-active" : ""}`}
              aria-label={s.title}
              aria-selected={i === index}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
