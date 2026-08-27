"use client";

import { useState } from "react";
import type { HelpFaqItem } from "@/lib/content";

type Props = {
  items: HelpFaqItem[];
  defaultOpenId?: string | null;
};

export function FaqAccordion({ items, defaultOpenId }: Props) {
  const [openId, setOpenId] = useState<string | null>(defaultOpenId ?? items[0]?.id ?? null);

  return (
    <div className="p-help__accordion">
      {items.map((item) => {
        const open = openId === item.id;
        return (
          <div key={item.id} className={`p-help__acc-item${open ? " is-open" : ""}`}>
            <button
              type="button"
              className="p-help__acc-q"
              aria-expanded={open}
              onClick={() => setOpenId((cur) => (cur === item.id ? null : item.id))}
            >
              <span>{item.question}</span>
              <span className="p-help__acc-icon" aria-hidden>
                <span className="p-help__acc-icon-plus">+</span>
              </span>
            </button>
            <div className="p-help__acc-panel" aria-hidden={!open}>
              <div className="p-help__acc-panel-inner">
                <div
                  className="p-help__acc-a p-help__richtext"
                  dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
