"use client";

import { useEffect, useState } from "react";

export type ShowcaseTheme = {
  id: string;
  title: string;
  desc: string;
  visual: string;
};

type Props = {
  id: string;
  eyebrow: string;
  heading: string;
  themes: ShowcaseTheme[];
  subtle?: boolean;
};

export function ProductShowcase({ id, eyebrow, heading, themes, subtle }: Props) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((i) => (i + 1) % themes.length);
    }, 3000);
    return () => clearInterval(timer);
  }, [themes.length]);

  const theme = themes[index];

  return (
    <section
      id={id}
      className={`p-showcase${subtle ? " p-showcase--subtle" : ""}`}
      aria-label={heading}
    >
      <div className="p-container p-showcase__frame">
        <div className="p-section__head">
          <div className="p-eyebrow">{eyebrow}</div>
          <h2 className="p-h2" style={{ margin: "12px 0 0" }}>
            {heading}
          </h2>
        </div>

        <div key={theme.id} className="p-showcase__slide is-active">
          <div>
            <h3 className="p-h3" style={{ marginTop: 0 }}>
              {theme.title}
            </h3>
            <p className="p-lead" style={{ marginTop: 16 }}>
              {theme.desc}
            </p>
            <div className="p-showcase__controls">
              <button
                type="button"
                className="p-showcase__arrow"
                aria-label="上一主题"
                onClick={() => setIndex((i) => (i - 1 + themes.length) % themes.length)}
              >
                ‹
              </button>
              <div className="p-showcase__dots">
                {themes.map((t, i) => (
                  <button
                    key={t.id}
                    type="button"
                    className={`p-showcase__dot${i === index ? " is-active" : ""}`}
                    aria-label={t.title}
                    onClick={() => setIndex(i)}
                  />
                ))}
              </div>
              <button
                type="button"
                className="p-showcase__arrow"
                aria-label="下一主题"
                onClick={() => setIndex((i) => (i + 1) % themes.length)}
              >
                ›
              </button>
            </div>
          </div>
          <div className="p-showcase__visual">
            <div className="p-showcase__visual-inner">
              <div className="p-showcase__index">0{index + 1}</div>
              <div style={{ fontSize: 18, fontWeight: 600, marginBottom: 8 }}>{theme.title}</div>
              <div style={{ opacity: 0.85, fontSize: 14, letterSpacing: "0.04em" }}>{theme.visual}</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
