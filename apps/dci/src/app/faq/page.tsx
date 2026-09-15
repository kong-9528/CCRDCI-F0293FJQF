"use client";

import { useState } from "react";
import { PageHero } from "@/components/PageHero";
import { FAQ_ITEMS } from "@/lib/content";

export default function FaqPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div>
      <PageHero
        title="常见问题"
        subtitle="汇总了用户最关心的DCI相关问题，帮助您快速了解数字版权唯一标识符体系。"
      />
      <section className="d-section">
        <div className="d-container">
          <div className="d-faq-list">
            {FAQ_ITEMS.map((item, index) => {
              const open = openIndex === index;
              return (
                <article key={item.q} className={`d-faq-item${open ? " is-open" : ""}`}>
                  <button
                    type="button"
                    className="d-faq-item__trigger"
                    aria-expanded={open}
                    onClick={() => setOpenIndex(open ? null : index)}
                  >
                    <span>{item.q}</span>
                    <svg className="d-faq-item__chevron" viewBox="0 0 16 16" fill="none" aria-hidden>
                      <path
                        d="M4 6l4 4 4-4"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                  <div className="d-faq-item__panel">
                    <div className="d-faq-item__inner">
                      <div className="d-faq-item__body">
                        <div className="d-gold-divider" />
                        <p>{item.a}</p>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
