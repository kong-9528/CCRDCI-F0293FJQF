"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  HOME_ECOLOGY,
  HOME_PILLARS,
  HOME_SLIDES,
} from "@/lib/content";

export function HomePage() {
  const [index, setIndex] = useState(0);
  const slide = HOME_SLIDES[index];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIndex((i) => (i + 1) % HOME_SLIDES.length);
    }, 5000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div>
      <section className="d-hero">
        <div className="d-hero__grid" aria-hidden />
        <div className="d-container d-hero__inner">
          <div>
            <p className="d-hero__tag">{slide.tag}</p>
            <h1 className="d-hero__title">{slide.title}</h1>
            <p className="d-hero__subtitle">{slide.subtitle}</p>
            <div className="d-hero__controls">
              <button
                type="button"
                className="d-hero__arrow"
                aria-label="上一张"
                onClick={() => setIndex((i) => (i - 1 + HOME_SLIDES.length) % HOME_SLIDES.length)}
              >
                ‹
              </button>
              <div className="d-hero__dots">
                {HOME_SLIDES.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`d-hero__dot${i === index ? " is-active" : ""}`}
                    aria-label={`切换到第 ${i + 1} 张`}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="d-hero__arrow"
                aria-label="下一张"
                onClick={() => setIndex((i) => (i + 1) % HOME_SLIDES.length)}
              >
                ›
              </button>
            </div>
          </div>
          <div className="d-hero__visual">
            <img src={slide.img} alt="" />
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container">
          <div className="d-section__head">
            <div>
              <p className="d-section__eyebrow">DCI SYSTEMATIC INTEGRATED SOLUTION</p>
              <h2 className="d-section__title">DCI体系</h2>
            </div>
            <Link href="/system/" className="d-link-arrow">
              了解DCI体系 →
            </Link>
          </div>
          <p className="d-section__desc">
            是以DCI国家标准为引领，以版权化识别为基础手段，以AI、区块链等新技术的系统集成应用为驱动，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。
          </p>
          <div className="d-pillars">
            {HOME_PILLARS.map((item) => (
              <Link key={item.label} href={item.href} className="d-pillar">
                <span className="d-pillar__icon">{item.label.slice(0, 1)}</span>
                <span className="d-pillar__label">{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container">
          <div className="d-section__head">
            <div>
              <p className="d-section__eyebrow">DCI STANDARD</p>
              <h2 className="d-section__title">DCI标准</h2>
            </div>
            <Link href="/standard/" className="d-link-arrow">
              了解更多标准 →
            </Link>
          </div>
          <div className="d-split d-split--center" style={{ marginTop: 24 }}>
            <article className="d-card d-card--pad">
              <h3 style={{ margin: "0 0 10px", fontSize: 16 }}>简介</h3>
              <p style={{ margin: 0, color: "var(--d-muted)", fontSize: 14, lineHeight: 1.75 }}>
                DCI体系始终以标准为创新引领、遵循构建以DCI国家标准为核心的版权标准化体系，并面向消费文著园文字著音乐及AI新业态新场域开展版权标识式标准应用。
              </p>
            </article>
            <div
              className="d-card"
              style={{
                minHeight: 180,
                display: "grid",
                placeItems: "center",
                background: "linear-gradient(135deg, #006bc2, #298ee0)",
                color: "#fff",
                fontSize: 64,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              DCI
            </div>
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container">
          <div className="d-center-cta">
            <p className="d-section__eyebrow">DCI REGISTRATION CENTER</p>
            <h2 className="d-section__title">DCI注册中心——DCI可信生态合作伙伴</h2>
            <p>DCI注册中心是经DCI管理中心评估认证，负责DCI业务的标准化落地与数据运营</p>
            <Link href="/registry/" className="d-btn d-btn--ghost">
              如何申请成为DCI注册中心 →
            </Link>
          </div>
        </div>
      </section>

      <section className="d-section d-section--soft">
        <div className="d-container">
          <div className="d-section__head">
            <div>
              <p className="d-section__eyebrow">SYSTEMATIC INTEGRATED SOLUTION</p>
              <h2 className="d-section__title">DCI生态</h2>
            </div>
            <Link href="/ecology/" className="d-link-arrow">
              了解更多内容 →
            </Link>
          </div>
          <p className="d-section__desc">秉承“共建、共治、共享”理念，共同构建DCI可信生态</p>
          <div className="d-eco-grid">
            {HOME_ECOLOGY.map((item) => (
              <article key={item.label} className="d-eco-card">
                <p className="d-eco-card__en">{item.en}</p>
                <h3 className="d-eco-card__title">{item.label}</h3>
                <p className="d-eco-card__desc">{item.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="d-section">
        <div className="d-container">
          <div className="d-section__head">
            <div>
              <p className="d-section__eyebrow">JOINT LABORATORY OF TECHNICAL RESEARCH & APPLICATION</p>
              <h2 className="d-section__title">DCI技术研究与应用联合实验室</h2>
            </div>
            <Link href="/lab/" className="d-link-arrow">
              DCI实验室介绍 →
            </Link>
          </div>
          <div className="d-lab-banner">
            <div className="d-lab-banner__ring">
              <p className="d-lab-banner__text">技术研究 · 场景应用 · 标准推广</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
