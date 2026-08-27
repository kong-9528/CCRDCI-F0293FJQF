"use client";

import { useEffect, useState } from "react";
import { HERO_SLIDES } from "@/lib/content";
import { HeroVisual } from "@/components/home/HeroVisual";

const AUTO_MS = 6000;

const TAB_LABELS: Record<string, string> = {
  trust: "平台能力",
  verify: "版权核验",
  audit: "智能审核",
};

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % HERO_SLIDES.length);
      setProgressKey((k) => k + 1);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, []);

  const slide = HERO_SLIDES[index];

  const goTo = (i: number) => {
    setIndex(i);
    setProgressKey((k) => k + 1);
  };

  return (
    <section className="p-hero" aria-label="首屏焦点">
      <div className="p-hero__bg" aria-hidden>
        <span className="p-hero__mesh" />
        <span className="p-hero__orb p-hero__orb--1" />
        <span className="p-hero__orb p-hero__orb--2" />
        <span className="p-hero__line p-hero__line--1" />
        <span className="p-hero__line p-hero__line--2" />
      </div>

      <div className="p-container p-hero__inner">
        <div className="p-hero__layout">
          <div className="p-hero__copy">
            <div className="p-hero__tabs" role="tablist" aria-label="价值主张">
              {HERO_SLIDES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  role="tab"
                  className={`p-hero__tab${i === index ? " is-active" : ""}`}
                  aria-selected={i === index}
                  onClick={() => goTo(i)}
                >
                  {TAB_LABELS[s.id] ?? s.title}
                  {i === index ? (
                    <span
                      key={progressKey}
                      className="p-hero__tab-progress"
                      style={{ animationDuration: `${AUTO_MS}ms` }}
                    />
                  ) : null}
                </button>
              ))}
            </div>

            <div className="p-hero__slides">
              <div key={slide.id} className="p-hero__slide is-active">
                <h1 className="p-display p-hero__title">
                  {slide.title}
                  <br />
                  <span className="p-text-gradient">{slide.highlight}</span>
                </h1>
                <p className="p-lead p-hero__lead">{slide.lead}</p>
              </div>
            </div>

            <div className="p-hero__metrics" aria-label="平台能力概览">
              <div className="p-hero__metric">
                <span className="p-hero__metric-value">6</span>
                <span className="p-hero__metric-label">核心产品</span>
              </div>
              <span className="p-hero__metric-divider" aria-hidden />
              <div className="p-hero__metric">
                <span className="p-hero__metric-value">API</span>
                <span className="p-hero__metric-label">开放接入</span>
              </div>
              <span className="p-hero__metric-divider" aria-hidden />
              <div className="p-hero__metric">
                <span className="p-hero__metric-value">权威</span>
                <span className="p-hero__metric-label">登记数据</span>
              </div>
            </div>
          </div>

          <div className="p-hero__visual-wrap">
            <div className="p-hero__visual-frame">
              <HeroVisual variant={slide.id as "trust" | "verify" | "audit"} />
              <span className="p-hero__visual-badge">可信 · 可溯 · 可计量</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
