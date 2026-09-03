import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  CONSOLE_HELP,
  collectConsoleFolderIds,
  findConsoleHelpArticle,
  firstConsoleHelpArticleId,
  type ConsoleHelpNode,
} from "@/lib/help";

function HelpTree({
  nodes,
  activeId,
  expanded,
  onToggleFolder,
  onSelectArticle,
}: {
  nodes: ConsoleHelpNode[];
  activeId: string | null;
  expanded: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onSelectArticle: (id: string) => void;
}) {
  return (
    <ul className="c-help-tree">
      {nodes.map((node) => {
        if (node.type === "folder") {
          const open = expanded[node.id] ?? true;
          return (
            <li key={node.id} className="c-help-tree__node c-help-tree__node--folder">
              <button
                type="button"
                className={`c-help-tree__folder${open ? " is-open" : ""}`}
                aria-expanded={open}
                onClick={() => onToggleFolder(node.id)}
              >
                <span className="c-help-tree__chevron" aria-hidden>
                  {open ? "▾" : "▸"}
                </span>
                <span>{node.title}</span>
              </button>
              {open ? (
                <div className="c-help-tree__folder-body">
                  <HelpTree
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
          <li key={node.id} className="c-help-tree__node">
            <button
              type="button"
              className={`c-help-tree__article${activeId === node.id ? " is-active" : ""}`}
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

function HelpRichTextLinked({ html }: { html: string }) {
  const parts = useMemo(() => {
    const re = /<a\s+href="(\/[^"]+)"[^>]*>(.*?)<\/a>/gi;
    const nodes: ReactNode[] = [];
    let last = 0;
    let m: RegExpExecArray | null;
    let key = 0;
    const src = html;
    while ((m = re.exec(src))) {
      if (m.index > last) {
        nodes.push(
          <span key={`h-${key++}`} dangerouslySetInnerHTML={{ __html: src.slice(last, m.index) }} />,
        );
      }
      nodes.push(
        <Link key={`l-${key++}`} to={m[1]} className="c-help-inline-link">
          <span dangerouslySetInnerHTML={{ __html: m[2] }} />
        </Link>,
      );
      last = m.index + m[0].length;
    }
    if (last < src.length) {
      nodes.push(
        <span key={`h-${key++}`} dangerouslySetInnerHTML={{ __html: src.slice(last) }} />,
      );
    }
    return nodes;
  }, [html]);

  return <div className="c-help-richtext">{parts}</div>;
}

export function HelpCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultId = firstConsoleHelpArticleId(CONSOLE_HELP) ?? "ch-quickstart";
  const fromQuery = searchParams.get("article");
  const [activeId, setActiveId] = useState(fromQuery || defaultId);
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const id of collectConsoleFolderIds(CONSOLE_HELP)) init[id] = true;
    return init;
  });

  useEffect(() => {
    if (fromQuery && findConsoleHelpArticle(CONSOLE_HELP, fromQuery)) {
      setActiveId(fromQuery);
    } else if (!fromQuery) {
      setActiveId(defaultId);
    }
  }, [fromQuery, defaultId]);

  const article = useMemo(
    () => findConsoleHelpArticle(CONSOLE_HELP, activeId),
    [activeId],
  );

  const select = (id: string) => {
    setActiveId(id);
    setSearchParams(id === defaultId ? {} : { article: id }, { replace: true });
  };

  return (
    <div className="c-help-layout">
      <aside className="c-help-sidebar" aria-label="帮助目录">
        <HelpTree
          nodes={CONSOLE_HELP}
          activeId={activeId}
          expanded={expanded}
          onToggleFolder={(id) => setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))}
          onSelectArticle={select}
        />
      </aside>
      <article className="a-card c-help-content">
        <div className="a-card__body">
          {article ? (
            <>
              <h2 className="c-help-content__title">{article.title}</h2>
              <HelpRichTextLinked html={article.html} />
            </>
          ) : (
            <div className="a-empty">未找到该文章</div>
          )}
        </div>
      </article>
    </div>
  );
}
