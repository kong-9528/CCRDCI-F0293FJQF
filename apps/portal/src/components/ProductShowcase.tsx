import type { HomeProductSection } from "@/lib/content";
import { ProductVisual } from "@/components/home/ProductVisual";
import { SectionDecor } from "@/components/home/SectionDecor";
import { Reveal } from "@/components/Reveal";

type Props = {
  section: HomeProductSection;
  tone?: "verify" | "audit";
};

export function ProductShowcase({ section, tone = "verify" }: Props) {
  return (
    <section
      id={section.id}
      className={`p-products p-products--${tone}`}
      aria-labelledby={`${section.id}-heading`}
    >
      <SectionDecor tone={tone} />

      <div className="p-products__bg" aria-hidden>
        <span className="p-products__orb p-products__orb--a" />
        <span className="p-products__orb p-products__orb--b" />
        <span className="p-products__grid-lines" />
      </div>

      <div className="p-rail p-products__inner">
        <Reveal>
          <header className="p-products__head">
            <h2 id={`${section.id}-heading`} className="p-products__title">
              {section.heading}
            </h2>
            <p className="p-products__lead">{section.lead}</p>
          </header>
        </Reveal>

        <div className="p-products__grid">
          {section.products.map((product, i) => (
            <Reveal key={product.id} className={`p-products__item p-products__item--${i + 1}`}>
              <article className="p-product-card" data-product={product.id}>
                <div className="p-product-card__media">
                  <ProductVisual productId={product.id} />
                  <span className="p-product-card__shine" aria-hidden />
                </div>
                <div className="p-product-card__body">
                  <h3 className="p-product-card__title">{product.title}</h3>
                  <p className="p-product-card__desc">{product.desc}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
