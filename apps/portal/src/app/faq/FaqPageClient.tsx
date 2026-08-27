"use client";

import { HELP_FAQ } from "@/lib/content";
import { FaqAccordion } from "@/components/help/FaqAccordion";

export function FaqPageClient() {
  return (
    <div className="p-help p-faq">
      <div className="p-container">
        <div className="p-help__bar">
          <h1 className="p-help__bar-title">常见问题</h1>
          <p className="p-help__bar-desc">关于账号、额度、产品与使用的常见疑问</p>
        </div>

        <div className="p-faq__main">
          <FaqAccordion items={HELP_FAQ} />
        </div>
      </div>
    </div>
  );
}
