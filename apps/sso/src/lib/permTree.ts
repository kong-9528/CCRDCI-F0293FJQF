export type PermTreeNode = {
  id: string;
  label: string;
  /** 权限编码，供技术人员甄别；缺省时展示 id */
  code?: string;
  children?: PermTreeNode[];
};

export function collectDescendantIds(node: PermTreeNode): string[] {
  const out: string[] = [];
  const walk = (n: PermTreeNode) => {
    out.push(n.id);
    n.children?.forEach(walk);
  };
  walk(node);
  return out;
}

function findPathIds(targetId: string, nodes: PermTreeNode[], trail: string[] = []): string[] | null {
  for (const n of nodes) {
    const next = [...trail, n.id];
    if (n.id === targetId) return next;
    if (n.children?.length) {
      const found = findPathIds(targetId, n.children, next);
      if (found) return found;
    }
  }
  return null;
}

/** 勾选节点时带上祖先；取消时取消自身及子孙 */
export function togglePermissionNode(
  node: PermTreeNode,
  selected: Set<string>,
  tree: PermTreeNode[],
): Set<string> {
  const ids = collectDescendantIds(node);
  const next = new Set(selected);
  const hit = ids.filter((id) => selected.has(id)).length;
  const state = hit === 0 ? false : hit === ids.length ? true : ("indeterminate" as const);

  if (state === true) {
    ids.forEach((id) => next.delete(id));
  } else {
    ids.forEach((id) => next.add(id));
    const path = findPathIds(node.id, tree) ?? [];
    path.forEach((id) => next.add(id));
  }
  return next;
}

export function checkboxState(
  node: PermTreeNode,
  selected: Set<string>,
): boolean | "indeterminate" {
  const ids = collectDescendantIds(node);
  const hit = ids.filter((id) => selected.has(id)).length;
  if (hit === 0) return false;
  if (hit === ids.length) return true;
  return "indeterminate";
}

type FlatPerm = { id: string; code: string; name: string };

/** 按权限编码点号层级，将扁平权限点组装为树 */
export function buildPermissionTreeFromFlat(perms: FlatPerm[]): PermTreeNode[] {
  const sorted = [...perms].sort((a, b) => {
    const da = a.code.split(".").length;
    const db = b.code.split(".").length;
    if (da !== db) return da - db;
    return a.code.localeCompare(b.code);
  });

  type Internal = PermTreeNode & { code: string };
  const byCode = new Map<string, Internal>();
  for (const p of sorted) {
    byCode.set(p.code, { id: p.id, label: p.name, code: p.code, children: [] });
  }

  const roots: Internal[] = [];
  for (const p of sorted) {
    const node = byCode.get(p.code)!;
    let parentCode: string | null = null;
    for (const code of byCode.keys()) {
      if (code === p.code) continue;
      if (!p.code.startsWith(`${code}.`)) continue;
      if (!parentCode || code.length > parentCode.length) parentCode = code;
    }
    if (parentCode) {
      const parent = byCode.get(parentCode)!;
      parent.children = parent.children ?? [];
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const prune = (nodes: Internal[]): PermTreeNode[] =>
    nodes.map((n) => {
      const children = n.children?.length ? prune(n.children as Internal[]) : undefined;
      return children?.length
        ? { id: n.id, label: n.label, code: n.code, children }
        : { id: n.id, label: n.label, code: n.code };
    });

  return prune(roots);
}
