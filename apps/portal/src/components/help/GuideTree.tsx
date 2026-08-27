import type { HelpGuideNode } from "@/lib/content";

type Props = {
  nodes: HelpGuideNode[];
  activeId: string | null;
  expanded: Record<string, boolean>;
  onToggleFolder: (id: string) => void;
  onSelectArticle: (id: string) => void;
};

export function GuideTree({
  nodes,
  activeId,
  expanded,
  onToggleFolder,
  onSelectArticle,
}: Props) {
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

export function collectFolderIds(nodes: HelpGuideNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      ids.push(node.id);
      ids.push(...collectFolderIds(node.children));
    }
  }
  return ids;
}
