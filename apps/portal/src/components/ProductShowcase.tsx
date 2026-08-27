import type { HomeProductSection } from "@/lib/content";

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
      <div className="p-rail p-products__inner">
        <header className="p-products__head">
          <h2 id={`${section.id}-heading`} className="p-products__title">
            {section.heading}
          </h2>
          <p className="p-products__lead">{section.lead}</p>
        </header>

        <div className="p-products__grid">
          {section.products.map((product) => (
            <article key={product.id} className="p-product-card" data-product={product.id}>
              <h3 className="p-product-card__title">{product.title}</h3>
              <p className="p-product-card__desc">{product.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
