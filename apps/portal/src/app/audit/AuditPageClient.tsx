"use client";

import Link from "next/link";
import { AUDIT_PAGE } from "@/lib/content";
import { ProductVisual } from "@/components/home/ProductVisual";
import { Reveal } from "@/components/Reveal";

export function AuditPageClient() {
  const { hero, overview, products, useCases, cta } = AUDIT_PAGE;

  return (
    <div className="p-audit-page">
      <section className="p-audit-hero" aria-labelledby="audit-hero-title">
        <div className="p-audit-hero__bg" aria-hidden>
          <span className="p-audit-hero__mesh" />
          <span className="p-audit-hero__orb p-audit-hero__orb--a" />
          <span className="p-audit-hero__orb p-audit-hero__orb--b" />
        </div>
        <div className="p-container p-audit-hero__inner">
          <Reveal>
            <h1 id="audit-hero-title" className="p-audit-hero__title">
              {hero.title}
              <span className="p-audit-hero__highlight">{hero.highlight}</span>
            </h1>
            <p className="p-audit-hero__lead">{hero.lead}</p>
          </Reveal>
        </div>
      </section>

      <section className="p-audit-overview" aria-labelledby="audit-overview-title">
        <div className="p-rail">
          <Reveal>
            <h2 id="audit-overview-title" className="p-audit-section-title">
              {overview.title}
            </h2>
            {overview.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="p-audit-overview__text">
                {p}
              </p>
            ))}
          </Reveal>
          <div className="p-audit-highlights">
            {overview.highlights.map((item, i) => (
              <Reveal key={item.title} className={`p-audit-highlights__item p-audit-highlights__item--${i + 1}`}>
                <article className={`p-audit-highlight p-audit-highlight--${i + 1}`}>
                  <span className="p-audit-highlight__mark" aria-hidden />
                  <h3 className="p-audit-highlight__title">{item.title}</h3>
                  <p className="p-audit-highlight__desc">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-audit-products" aria-labelledby="audit-products-title">
        <div className="p-rail">
          <Reveal>
            <header className="p-audit-products__head">
              <h2 id="audit-products-title" className="p-audit-section-title">
                三项辅助审核能力
              </h2>
              <p className="p-audit-section-lead">
                可独立调用，也可组合使用——覆盖登记审核链路的关键环节。
              </p>
            </header>
          </Reveal>

          <div className="p-audit-product-list">
            {products.map((product, i) => (
              <Reveal key={product.id} className={`p-audit-product p-audit-product--${i + 1}`}>
                <article id={product.id} className="p-audit-product__inner">
                  <div className="p-audit-product__visual">
                    <ProductVisual productId={product.id} />
                  </div>
                  <div className="p-audit-product__content">
                    <h3 className="p-audit-product__title">{product.title}</h3>
                    <p className="p-audit-product__summary">{product.summary}</p>
                    <p className="p-audit-product__intro">{product.intro}</p>

                    <div className="p-audit-product__meta">
                      <div className="p-audit-product__block">
                        <h4 className="p-audit-product__label">典型场景</h4>
                        <ul className="p-audit-product__list">
                          {product.scenarios.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-audit-product__cols">
                        <div className="p-audit-product__block">
                          <h4 className="p-audit-product__label">提交信息</h4>
                          <ul className="p-audit-product__tags">
                            {product.inputs.map((input) => (
                              <li key={input}>{input}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-audit-product__block">
                          <h4 className="p-audit-product__label">返回要点</h4>
                          <ul className="p-audit-product__tags p-audit-product__tags--out">
                            {product.outputs.map((output) => (
                              <li key={output}>{output}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-audit-scenes" aria-labelledby="audit-scenes-title">
        <div className="p-rail">
          <Reveal>
            <h2 id="audit-scenes-title" className="p-audit-section-title">
              适用场景
            </h2>
          </Reveal>
          <div className="p-audit-scenes__grid">
            {useCases.map((item, i) => (
              <Reveal key={item.title} className={`p-audit-scenes__item p-audit-scenes__item--${i + 1}`}>
                <article className={`p-audit-scene-card p-audit-scene-card--${i + 1}`}>
                  <span className="p-audit-scene-card__mark" aria-hidden />
                  <h3 className="p-audit-scene-card__title">{item.title}</h3>
                  <p className="p-audit-scene-card__desc">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-audit-cta" aria-labelledby="audit-cta-title">
        <div className="p-rail p-audit-cta__inner">
          <Reveal>
            <h2 id="audit-cta-title" className="p-audit-cta__title">
              {cta.title}
            </h2>
            <p className="p-audit-cta__desc">{cta.desc}</p>
            <div className="p-audit-cta__actions">
              <Link href="/guide" className="p-btn p-btn--primary">
                查看接入指南
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
