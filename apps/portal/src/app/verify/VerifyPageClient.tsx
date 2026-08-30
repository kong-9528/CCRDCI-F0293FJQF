"use client";

import Link from "next/link";
import { VERIFY_PAGE } from "@/lib/content";
import { ProductVisual } from "@/components/home/ProductVisual";
import { Reveal } from "@/components/Reveal";

export function VerifyPageClient() {
  const { hero, overview, products, useCases, cta } = VERIFY_PAGE;

  return (
    <div className="p-verify">
      <section className="p-verify-hero" aria-labelledby="verify-hero-title">
        <div className="p-verify-hero__bg" aria-hidden>
          <span className="p-verify-hero__mesh" />
          <span className="p-verify-hero__orb p-verify-hero__orb--a" />
          <span className="p-verify-hero__orb p-verify-hero__orb--b" />
        </div>
        <div className="p-container p-verify-hero__inner">
          <Reveal>
            <h1 id="verify-hero-title" className="p-verify-hero__title">
              {hero.title}
              <span className="p-verify-hero__highlight">{hero.highlight}</span>
            </h1>
            <p className="p-verify-hero__lead">{hero.lead}</p>
          </Reveal>
        </div>
      </section>

      <section className="p-verify-overview" aria-labelledby="verify-overview-title">
        <div className="p-rail">
          <Reveal>
            <h2 id="verify-overview-title" className="p-verify-section-title">
              {overview.title}
            </h2>
            {overview.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="p-verify-overview__text">
                {p}
              </p>
            ))}
          </Reveal>
          <div className="p-verify-highlights">
            {overview.highlights.map((item, i) => (
              <Reveal key={item.title} className={`p-verify-highlights__item p-verify-highlights__item--${i + 1}`}>
                <article className={`p-verify-highlight p-verify-highlight--${i + 1}`}>
                  <span className="p-verify-highlight__mark" aria-hidden />
                  <h3 className="p-verify-highlight__title">{item.title}</h3>
                  <p className="p-verify-highlight__desc">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-verify-products" aria-labelledby="verify-products-title">
        <div className="p-rail">
          <Reveal>
            <header className="p-verify-products__head">
              <h2 id="verify-products-title" className="p-verify-section-title">
                三项核验能力
              </h2>
              <p className="p-verify-section-lead">
                可独立调用，也可组合使用——按您的业务场景选择最合适的路径。
              </p>
            </header>
          </Reveal>

          <div className="p-verify-product-list">
            {products.map((product, i) => (
              <Reveal key={product.id} className={`p-verify-product p-verify-product--${i + 1}`}>
                <article id={product.id} className="p-verify-product__inner">
                  <div className="p-verify-product__visual">
                    <ProductVisual productId={product.id} />
                  </div>
                  <div className="p-verify-product__content">
                    <h3 className="p-verify-product__title">{product.title}</h3>
                    <p className="p-verify-product__summary">{product.summary}</p>
                    <p className="p-verify-product__intro">{product.intro}</p>

                    <div className="p-verify-product__meta">
                      <div className="p-verify-product__block">
                        <h4 className="p-verify-product__label">典型场景</h4>
                        <ul className="p-verify-product__list">
                          {product.scenarios.map((s) => (
                            <li key={s}>{s}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-verify-product__cols">
                        <div className="p-verify-product__block">
                          <h4 className="p-verify-product__label">提交信息</h4>
                          <ul className="p-verify-product__tags">
                            {product.inputs.map((input) => (
                              <li key={input}>{input}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="p-verify-product__block">
                          <h4 className="p-verify-product__label">返回要点</h4>
                          <ul className="p-verify-product__tags p-verify-product__tags--out">
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

      <section className="p-verify-scenes" aria-labelledby="verify-scenes-title">
        <div className="p-rail">
          <Reveal>
            <h2 id="verify-scenes-title" className="p-verify-section-title">
              适用场景
            </h2>
          </Reveal>
          <div className="p-verify-scenes__grid">
            {useCases.map((item, i) => (
              <Reveal key={item.title} className={`p-verify-scenes__item p-verify-scenes__item--${i + 1}`}>
                <article className={`p-verify-scene-card p-verify-scene-card--${i + 1}`}>
                  <span className="p-verify-scene-card__mark" aria-hidden />
                  <h3 className="p-verify-scene-card__title">{item.title}</h3>
                  <p className="p-verify-scene-card__desc">{item.desc}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-verify-cta" aria-labelledby="verify-cta-title">
        <div className="p-rail p-verify-cta__inner">
          <Reveal>
            <h2 id="verify-cta-title" className="p-verify-cta__title">
              {cta.title}
            </h2>
            <p className="p-verify-cta__desc">{cta.desc}</p>
            <div className="p-verify-cta__actions">
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
