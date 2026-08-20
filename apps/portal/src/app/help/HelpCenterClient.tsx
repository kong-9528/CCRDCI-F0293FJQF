"use client";

import { useEffect, useState } from "react";
import { HELP_SECTIONS } from "@/lib/content";

export function HelpCenter() {
  const [active, setActive] = useState(HELP_SECTIONS[0].children[0].id);

  useEffect(() => {
    const ids = HELP_SECTIONS.flatMap((s) => s.children.map((c) => c.id));
    const els = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 1] },
    );

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="p-help">
      <div className="p-container">
        <div className="p-section__head" style={{ marginBottom: 40 }}>
          <div className="p-eyebrow">Help Center</div>
          <h1 className="p-h1" style={{ margin: "12px 0 0" }}>
            帮助中心
          </h1>
          <p className="p-lead">了解账号开通、产品使用与常见问题。</p>
        </div>

        <div className="p-help__layout">
          <nav className="p-help__nav" aria-label="帮助目录">
            {HELP_SECTIONS.map((section) => (
              <div key={section.id}>
                <div className="is-group">{section.title}</div>
                {section.children.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={active === item.id ? "is-active" : undefined}
                    onClick={() => setActive(item.id)}
                  >
                    {item.title}
                  </a>
                ))}
              </div>
            ))}
          </nav>

          <article className="p-help__article">
            {HELP_SECTIONS.map((section) => (
              <div key={section.id}>
                <h2 id={section.id}>{section.title}</h2>
                {section.children.map((item) => (
                  <section key={item.id} id={item.id}>
                    <h3>{item.title}</h3>
                    {item.body.map((p) => (
                      <p key={p}>{p}</p>
                    ))}
                    {"figure" in item && item.figure ? (
                      <div className="p-help__figure" role="img" aria-label={item.figure}>
                        {item.figure}
                      </div>
                    ) : null}
                  </section>
                ))}
              </div>
            ))}
          </article>
        </div>
      </div>
    </div>
  );
}
