import { useEffect, useMemo, useRef, useState } from "react";
import {
  ORG_TYPE_LABEL,
  buildOrgTreeWithin,
  getOrgPathLabel,
  getOrgUnit,
  type OrgTreeNode,
} from "@/lib/rbacStore";

type Props = {
  value: string[];
  allowedIds: Set<string>;
  onChange: (ids: string[]) => void;
  placeholder?: string;
  error?: boolean;
};

function collectExpandIds(nodes: OrgTreeNode[], depth = 0, acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children.length && depth < 2) {
      acc.push(n.id);
      collectExpandIds(n.children, depth + 1, acc);
    }
  }
  return acc;
}

function filterTree(nodes: OrgTreeNode[], q: string): OrgTreeNode[] {
  if (!q) return nodes;
  const out: OrgTreeNode[] = [];
  for (const n of nodes) {
    const kids = filterTree(n.children, q);
    const hit =
      n.name.toLowerCase().includes(q) ||
      n.code.toLowerCase().includes(q) ||
      kids.length > 0;
    if (hit) out.push({ ...n, children: kids });
  }
  return out;
}

function TreeRows({
  nodes,
  depth,
  selected,
  expanded,
  onToggle,
  onExpand,
}: {
  nodes: OrgTreeNode[];
  depth: number;
  selected: Set<string>;
  expanded: Set<string>;
  onToggle: (id: string) => void;
  onExpand: (id: string) => void;
}) {
  return (
    <>
      {nodes.map((node) => {
        const hasKids = node.children.length > 0;
        const open = expanded.has(node.id);
        const on = selected.has(node.id);
        return (
          <div key={node.id} className="sso-otms__branch">
            <div
              className={`sso-otms__row${on ? " is-on" : ""}`}
              style={{ paddingLeft: 10 + depth * 16 }}
            >
              {hasKids ? (
                <button
                  type="button"
                  className={`sso-otms__caret${open ? " is-open" : ""}`}
                  aria-label={open ? "收起" : "展开"}
                  onClick={() => onExpand(node.id)}
                />
              ) : (
                <span className="sso-otms__caret-spacer" />
              )}
              <label className="sso-otms__node">
                <input type="checkbox" checked={on} onChange={() => onToggle(node.id)} />
                <span className="sso-otms__type">{ORG_TYPE_LABEL[node.type]}</span>
                <span className="sso-otms__name">{node.name}</span>
              </label>
            </div>
            {hasKids && open ? (
              <TreeRows
                nodes={node.children}
                depth={depth + 1}
                selected={selected}
                expanded={expanded}
                onToggle={onToggle}
                onExpand={onExpand}
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

/** 组织结构树形多选下拉 */
export function OrgTreeMultiSelect({
  value,
  allowedIds,
  onChange,
  placeholder = "选择履职部门",
  error,
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const tree = useMemo(() => buildOrgTreeWithin(allowedIds), [allowedIds]);
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(collectExpandIds(tree)));

  useEffect(() => {
    setExpanded(new Set(collectExpandIds(tree)));
  }, [tree]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const selected = useMemo(() => new Set(value), [value]);
  const filtered = useMemo(() => filterTree(tree, query.trim().toLowerCase()), [tree, query]);

  const selectedLabels = value
    .map((id) => getOrgUnit(id))
    .filter(Boolean)
    .map((o) => o!.name);

  const toggle = (id: string) => {
    if (selected.has(id)) onChange(value.filter((x) => x !== id));
    else onChange([...value, id]);
  };

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearAll = () => onChange([]);

  return (
    <div className={`sso-otms${open ? " is-open" : ""}${error ? " is-error" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="sso-otms__trigger"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <div className="sso-otms__summary">
          {selectedLabels.length === 0 ? (
            <span className="sso-otms__placeholder">{placeholder}</span>
          ) : (
            <div className="sso-otms__tags">
              {selectedLabels.slice(0, 2).map((name, i) => (
                <span key={`${value[i]}-${name}`} className="sso-otms__tag" title={getOrgPathLabel(value[i])}>
                  {name}
                </span>
              ))}
              {selectedLabels.length > 2 ? (
                <span className="sso-otms__tag sso-otms__tag--more">+{selectedLabels.length - 2}</span>
              ) : null}
            </div>
          )}
        </div>
        <span className="sso-otms__meta">
          {value.length ? `${value.length} 项` : ""}
          <span className={`sso-otms__chevron${open ? " is-open" : ""}`} aria-hidden />
        </span>
      </button>

      {open ? (
        <div className="sso-otms__panel" role="listbox" aria-multiselectable>
          <div className="sso-otms__toolbar">
            <input
              className="sso-input sso-otms__search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索组织名称或编码"
              autoFocus
            />
            {value.length ? (
              <button type="button" className="sso-otms__clear" onClick={clearAll}>
                清空
              </button>
            ) : null}
          </div>
          <div className="sso-otms__tree">
            {filtered.length ? (
              <TreeRows
                nodes={filtered}
                depth={0}
                selected={selected}
                expanded={query.trim() ? new Set(collectAllIds(filtered)) : expanded}
                onToggle={toggle}
                onExpand={toggleExpand}
              />
            ) : (
              <div className="sso-otms__empty">无匹配的组织节点</div>
            )}
          </div>
          <div className="sso-otms__footer">
            已选 <b>{value.length}</b> 个部门 · 点击节点勾选，支持多选
          </div>
        </div>
      ) : null}
    </div>
  );
}

function collectAllIds(nodes: OrgTreeNode[], acc: string[] = []): string[] {
  for (const n of nodes) {
    if (n.children.length) {
      acc.push(n.id);
      collectAllIds(n.children, acc);
    }
  }
  return acc;
}
