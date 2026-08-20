"use client";

import { useMemo, useState } from "react";
import {
  HELP_FAQ,
  HELP_GUIDE,
  findHelpArticle,
  firstHelpArticleId,
  type HelpGuideNode,
} from "@/lib/content";

type Selection =
  | { kind: "article"; id: string }
  | { kind: "faq" };

function collectFolderIds(nodes: HelpGuideNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      ids.push(node.id);
      ids.push(...collectFolderIds(node.children));
    }
  }
  return ids;
}

function GuideTree({
  nodes,
  activeId,
  expanded,
  onToggleFolder,
  onSelectArticle,
}: {
  nodes: HelpGuideNode[];
  activeId: string | null;
  expanded: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onSelectArticle: (id: string) => void;
}) {
  return (
    <ul className="p-help__tree">
      {nodes.map((node) => {
        if (node.type === "folder") {
          const open = expanded[node.id] ?? true;
          return (
            <li key={node.id} className="p-help__node p-help__node--folder">
              <button
                type="button"
                className={`p-help__folder-btn${open ? " is-open" : ""}`}
                aria-expanded={open}
                onClick={() => onToggleFolder(node.id)}
              >
                <span className="p-help__chevron" aria-hidden>
                  {open ? "▾" : "▸"}
                </span>
                <span>{node.title}</span>
              </button>
              {open ? (
                <div className="p-help__folder-body">
                  <GuideTree
                    nodes={node.children}
                    activeId={activeId}
                    expanded={expanded}
                    onToggleFolder={onToggleFolder}
                    onSelectArticle={onSelectArticle}
                  />
                </div>
              ) : null}
            </li>
          );
        }

        return (
          <li key={node.id} className="p-help__node">
            <button
              type="button"
              className={`p-help__nav-item${activeId === node.id ? " is-active" : ""}`}
              onClick={() => onSelectArticle(node.id)}
            >
              {node.title}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

export function HelpCenter() {
  const defaultArticleId = firstHelpArticleId(HELP_GUIDE) ?? "account";
  const [selection, setSelection] = useState<Selection>({
    kind: "article",
    id: defaultArticleId,
  });
  const [openFaqId, setOpenFaqId] = useState<string | null>(HELP_FAQ[0]?.id ?? null);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of collectFolderIds(HELP_GUIDE)) init[id] = true;
    return init;
  });

  const article = useMemo(() => {
    if (selection.kind !== "article") return null;
    return findHelpArticle(HELP_GUIDE, selection.id);
  }, [selection]);

  const toggleFolder = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="p-help">
      <div className="p-container">
        <div className="p-help__bar">
          <h1 className="p-help__bar-title">帮助中心</h1>
          <p className="p-help__bar-desc">接入指南与常见问题</p>
        </div>

        <div className="p-help__layout">
          <nav className="p-help__nav" aria-label="帮助目录">
            <GuideTree
              nodes={HELP_GUIDE}
              activeId={selection.kind === "article" ? selection.id : null}
              expanded={expanded}
              onToggleFolder={toggleFolder}
              onSelectArticle={(id) => setSelection({ kind: "article", id })}
            />

            <button
              type="button"
              className={`p-help__nav-item p-help__nav-item--root${selection.kind === "faq" ? " is-active" : ""}`}
              onClick={() => setSelection({ kind: "faq" })}
            >
              FAQ
            </button>
          </nav>

          <div className="p-help__panel">
            {selection.kind === "article" && article ? (
              <article className="p-help__article">
                <h2 className="p-help__article-title">{article.title}</h2>
                <div
                  className="p-help__richtext"
                  dangerouslySetInnerHTML={{ __html: article.html }}
                />
              </article>
            ) : null}

            {selection.kind === "faq" ? (
              <div className="p-help__faq">
                <h2 className="p-help__article-title">FAQ</h2>
                <div className="p-help__accordion">
                  {HELP_FAQ.map((item) => {
                    const open = openFaqId === item.id;
                    return (
                      <div
                        key={item.id}
                        className={`p-help__acc-item${open ? " is-open" : ""}`}
                      >
                        <button
                          type="button"
                          className="p-help__acc-q"
                          aria-expanded={open}
                          onClick={() =>
                            setOpenFaqId((cur) => (cur === item.id ? null : item.id))
                          }
                        >
                          <span>{item.question}</span>
                          <span className="p-help__acc-icon" aria-hidden>
                            <span className="p-help__acc-icon-plus">+</span>
                          </span>
                        </button>
                        <div
                          className="p-help__acc-panel"
                          aria-hidden={!open}
                        >
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
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
