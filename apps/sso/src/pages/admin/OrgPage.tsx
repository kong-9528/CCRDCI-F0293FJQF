import { useEffect, useState } from "react";
import { ListPageHeader } from "@/components/ListPageHeader";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  ORG_TYPE_LABEL,
  buildOrgTree,
  createOrgUnit,
  getOrgUnit,
  listOrgUnits,
  updateOrgUnit,
  type EntityStatus,
  type OrgTreeNode,
  type OrgUnit,
  type OrgUnitType,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

type FlatOrgRow = {
  node: OrgTreeNode;
  depth: number;
  hasChildren: boolean;
};

function collectExpandableIds(nodes: OrgTreeNode[]): string[] {
  const ids: string[] = [];
  const walk = (list: OrgTreeNode[]) => {
    for (const n of list) {
      if (n.children.length) {
        ids.push(n.id);
        walk(n.children);
      }
    }
  };
  walk(nodes);
  return ids;
}

function flattenVisible(nodes: OrgTreeNode[], expanded: Set<string>, depth = 0): FlatOrgRow[] {
  const rows: FlatOrgRow[] = [];
  for (const node of nodes) {
    const hasChildren = node.children.length > 0;
    rows.push({ node, depth, hasChildren });
    if (hasChildren && expanded.has(node.id)) {
      rows.push(...flattenVisible(node.children, expanded, depth + 1));
    }
  }
  return rows;
}

export function OrgPage() {
  return (
    <RequirePerm code="sso.org">
      <OrgPageInner />
    </RequirePerm>
  );
}

function OrgPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const canWrite = can("sso.org.write");
  const tree = buildOrgTree(true);
  const expandableIds = collectExpandableIds(tree);

  /** null = 尚未手动操作，默认全部展开 */
  const [expandedOverride, setExpandedOverride] = useState<Set<string> | null>(null);
  const expanded = expandedOverride ?? new Set(expandableIds);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [creatingParentId, setCreatingParentId] = useState<string | null>(null);

  const rows = flattenVisible(tree, expanded);

  const toggle = (id: string) => {
    setExpandedOverride((prev) => {
      const base = prev ?? new Set(expandableIds);
      const next = new Set(base);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const editing = editingId ? getOrgUnit(editingId) : null;

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="组织结构管理"
        description="按层级维护集团组织；可展开/收起节点，在行内编辑或新增下级。"
      />

      <div className="sso-card sso-card--flush">
        <table className="sso-table sso-org-table">
          <thead>
            <tr>
              <th>组织名称</th>
              <th>编码</th>
              <th>排序</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ node, depth, hasChildren }) => {
              const open = expanded.has(node.id);
              return (
                <tr key={node.id}>
                  <td>
                    <div className="sso-org-name" style={{ paddingLeft: depth * 20 }}>
                      {hasChildren ? (
                        <button
                          type="button"
                          className={`sso-org-toggle${open ? " is-open" : ""}`}
                          aria-expanded={open}
                          aria-label={open ? "收起" : "展开"}
                          onClick={() => toggle(node.id)}
                        />
                      ) : (
                        <span className="sso-org-toggle sso-org-toggle--leaf" aria-hidden />
                      )}
                      <span className="sso-org-name__text">{node.name}</span>
                    </div>
                  </td>
                  <td>
                    <code>{node.code}</code>
                  </td>
                  <td>{node.sort}</td>
                  <td>
                    <span className={`sso-tag${node.status === "active" ? " is-ok" : ""}`}>
                      {node.status === "active" ? "启用" : "停用"}
                    </span>
                  </td>
                  <td>
                    <div className="sso-org-actions">
                      <button
                        type="button"
                        className="sso-text-link"
                        onClick={() => setEditingId(node.id)}
                      >
                        {canWrite ? "编辑" : "查看"}
                      </button>
                      {canWrite ? (
                        <button
                          type="button"
                          className="sso-text-link"
                          onClick={() => setCreatingParentId(node.id)}
                        >
                          新增下级
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
            {!rows.length ? (
              <tr>
                <td colSpan={5}>
                  <div className="sso-empty">暂无组织</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {editing ? (
        <OrgEditDialog
          unit={editing}
          canWrite={canWrite}
          onClose={() => setEditingId(null)}
        />
      ) : null}

      {creatingParentId !== null ? (
        <OrgCreateDialog
          defaultParentId={creatingParentId}
          onClose={() => setCreatingParentId(null)}
          onCreated={(id) => {
            setExpandedOverride((prev) => {
              const next = new Set(prev ?? expandableIds);
              next.add(creatingParentId);
              return next;
            });
            setEditingId(id);
          }}
        />
      ) : null}
    </div>
  );
}

function OrgEditDialog({
  unit,
  canWrite,
  onClose,
}: {
  unit: OrgUnit;
  canWrite: boolean;
  onClose: () => void;
}) {
  const [name, setName] = useState(unit.name);
  const [parentId, setParentId] = useState<string>(unit.parentId ?? "");
  const [type, setType] = useState<OrgUnitType>(unit.type);
  const [leaderName, setLeaderName] = useState(unit.leaderName);
  const [sort, setSort] = useState(String(unit.sort));
  const [status, setStatus] = useState<EntityStatus>(unit.status);
  const [description, setDescription] = useState(unit.description);
  const [error, setError] = useState("");

  useEffect(() => {
    setName(unit.name);
    setParentId(unit.parentId ?? "");
    setType(unit.type);
    setLeaderName(unit.leaderName);
    setSort(String(unit.sort));
    setStatus(unit.status);
    setDescription(unit.description);
    setError("");
  }, [unit]);

  const parentOptions = listOrgUnits().filter((o) => o.id !== unit.id);

  const save = () => {
    setError("");
    const result = updateOrgUnit(unit.id, {
      name,
      parentId: parentId || null,
      type,
      leaderName,
      sort: Number(sort) || 0,
      status,
      description,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sso-modal sso-modal--lg"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3>
          {canWrite ? "编辑组织" : "查看组织"}
          <code>{unit.code}</code>
        </h3>
        <div className="sso-form sso-org-detail">
          <div className="sso-field">
            <label>名称</label>
            <input
              className="sso-input"
              value={name}
              disabled={!canWrite}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label>类型</label>
            <select
              className="sso-select"
              value={type}
              disabled={!canWrite}
              onChange={(e) => setType(e.target.value as OrgUnitType)}
            >
              {(Object.keys(ORG_TYPE_LABEL) as OrgUnitType[]).map((k) => (
                <option key={k} value={k}>
                  {ORG_TYPE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="sso-field">
            <label>上级组织</label>
            <select
              className="sso-select"
              value={parentId}
              disabled={!canWrite || unit.id === "org-root"}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">（无，作为根）</option>
              {parentOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}（{o.code}）
                </option>
              ))}
            </select>
          </div>
          <div className="sso-field">
            <label>负责人</label>
            <input
              className="sso-input"
              value={leaderName}
              disabled={!canWrite}
              onChange={(e) => setLeaderName(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label>排序</label>
            <input
              className="sso-input"
              type="number"
              value={sort}
              disabled={!canWrite}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label>状态</label>
            <select
              className="sso-select"
              value={status}
              disabled={!canWrite || unit.id === "org-root"}
              onChange={(e) => setStatus(e.target.value as EntityStatus)}
            >
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>
          </div>
          <div className="sso-field">
            <label>说明</label>
            <input
              className="sso-input"
              value={description}
              disabled={!canWrite}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error ? <div className="sso-error">{error}</div> : null}
        </div>
        <div className="sso-form-actions">
          <button type="button" className="sso-btn sso-btn--ghost" onClick={onClose}>
            {canWrite ? "取消" : "关闭"}
          </button>
          {canWrite ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={save}>
              保存
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function OrgCreateDialog({
  defaultParentId,
  onClose,
  onCreated,
}: {
  defaultParentId: string | null;
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState(defaultParentId ?? "");
  const [type, setType] = useState<OrgUnitType>("department");
  const [leaderName, setLeaderName] = useState("");
  const [sort, setSort] = useState("100");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const before = new Set(listOrgUnits().map((o) => o.id));
    const result = createOrgUnit({
      code,
      name,
      parentId: parentId || null,
      type,
      leaderName,
      sort: Number(sort) || 0,
      description,
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    const created = listOrgUnits().find((o) => !before.has(o.id));
    if (created) onCreated(created.id);
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sso-modal sso-modal--lg"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
        <h3>新增下级组织</h3>
        <div className="sso-form">
          <div className="sso-field">
            <label>编码</label>
            <input
              className="sso-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="如 FINANCE"
            />
          </div>
          <div className="sso-field">
            <label>名称</label>
            <input className="sso-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sso-field">
            <label>上级组织</label>
            <select
              className="sso-select"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <option value="">（无）</option>
              {listOrgUnits().map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sso-field">
            <label>类型</label>
            <select
              className="sso-select"
              value={type}
              onChange={(e) => setType(e.target.value as OrgUnitType)}
            >
              {(Object.keys(ORG_TYPE_LABEL) as OrgUnitType[]).map((k) => (
                <option key={k} value={k}>
                  {ORG_TYPE_LABEL[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="sso-field">
            <label>负责人</label>
            <input
              className="sso-input"
              value={leaderName}
              onChange={(e) => setLeaderName(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label>排序</label>
            <input
              className="sso-input"
              type="number"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label>说明</label>
            <input
              className="sso-input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          {error ? <div className="sso-error">{error}</div> : null}
        </div>
        <div className="sso-form-actions">
          <button type="button" className="sso-btn sso-btn--ghost" onClick={onClose}>
            取消
          </button>
          <button type="button" className="sso-btn sso-btn--primary" onClick={submit}>
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
