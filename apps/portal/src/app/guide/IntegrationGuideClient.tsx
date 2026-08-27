"use client";

import { useMemo, useState } from "react";
import {
  INTEGRATION_GUIDE,
  findHelpArticle,
  firstHelpArticleId,
} from "@/lib/content";
import { GuideTree, collectFolderIds } from "@/components/help/GuideTree";

export function IntegrationGuideClient() {
  const defaultArticleId = firstHelpArticleId(INTEGRATION_GUIDE) ?? "integration-overview";
  const [activeId, setActiveId] = useState(defaultArticleId);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of collectFolderIds(INTEGRATION_GUIDE)) init[id] = true;
    return init;
  });

  const article = useMemo(() => findHelpArticle(INTEGRATION_GUIDE, activeId), [activeId]);

  return (
    <div className="p-help">
      <div className="p-container">
        <div className="p-help__bar">
          <h1 className="p-help__bar-title">接入指南</h1>
          <p className="p-help__bar-desc">了解如何签约开通并接入本平台各项服务</p>
        </div>

        <div className="p-help__layout">
          <nav className="p-help__nav" aria-label="接入指南目录">
            <GuideTree
              nodes={INTEGRATION_GUIDE}
              activeId={activeId}
              expanded={expanded}
              onToggleFolder={(id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
              onSelectArticle={setActiveId}
            />
          </nav>

          <div className="p-help__panel">
            {article ? (
              <article className="p-help__article">
                <h2 className="p-help__article-title">{article.title}</h2>
                <div
                  className="p-help__richtext"
                  dangerouslySetInnerHTML={{ __html: article.html }}
                />
              </article>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
