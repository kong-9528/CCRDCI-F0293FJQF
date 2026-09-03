import {
  buildPermissionTreeFromFlat,
  checkboxState,
  togglePermissionNode,
  type PermTreeNode,
} from "@/lib/permTree";
import { OPS_PERMISSION_TREE, OPS_SUBSYSTEM_ID, type OpsPermNode } from "@/lib/opsPermissionSeed";
import { listPermissions, type Permission } from "@/lib/rbacStore";

/** ops 权限树节点 id 即编码，补上 code 字段便于展示 */
function withOpsCodes(nodes: OpsPermNode[]): PermTreeNode[] {
  return nodes.map((n) => ({
    id: n.id,
    label: n.label,
    code: n.id,
    children: n.children?.length ? withOpsCodes(n.children) : undefined,
  }));
}

export function getPermissionTreeForSubsystem(subsystemId: string): PermTreeNode[] {
  if (subsystemId === OPS_SUBSYSTEM_ID) {
    return withOpsCodes(OPS_PERMISSION_TREE);
  }
  const perms = listPermissions(subsystemId);
  return buildPermissionTreeFromFlat(perms);
}

type Props = {
  nodes: PermTreeNode[];
  selected: Set<string>;
  disabled?: boolean;
  onChange: (next: Set<string>) => void;
  depth?: number;
  tree?: PermTreeNode[];
};

export function PermCheckTree({
  nodes,
  selected,
  disabled,
  onChange,
  depth = 0,
  tree,
}: Props) {
  const root = tree ?? nodes;

  if (!nodes.length) {
    return <div className="sso-hint">该系统暂无权限点</div>;
  }

  return (
    <ul className={`sso-perm-tree${depth === 0 ? " sso-perm-tree--root" : ""}`}>
      {nodes.map((node) => {
        const state = checkboxState(node, selected);
        const code = node.code ?? node.id;
        return (
          <li key={node.id} className="sso-perm-tree__item">
            <label
              className="sso-perm-tree__label"
              style={{ paddingLeft: depth * 20 }}
            >
              <input
                type="checkbox"
                className="sso-perm-tree__check"
                disabled={disabled}
                checked={state === true}
                ref={(el) => {
                  if (el) el.indeterminate = state === "indeterminate";
                }}
                onChange={() => onChange(togglePermissionNode(node, selected, root))}
              />
              <span className="sso-perm-tree__text">
                {node.label}
                <code className="sso-perm-tree__code">{code}</code>
              </span>
            </label>
            {node.children?.length ? (
              <PermCheckTree
                nodes={node.children}
                selected={selected}
                disabled={disabled}
                onChange={onChange}
                depth={depth + 1}
                tree={root}
              />
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}

/** 兼容：从扁平列表快速构建（测试/调试用） */
export function buildTreeFromPermissions(perms: Permission[]): PermTreeNode[] {
  return buildPermissionTreeFromFlat(perms);
}
