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
  const tree = buildOrgTree(true);
  const [selectedId, setSelectedId] = useState<string>(tree[0]?.id ?? "");
  const [creating, setCreating] = useState(false);
  const selected = selectedId ? getOrgUnit(selectedId) : null;

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="组织结构管理"
        description="维护集团组织树，用户可归属到具体部门/小组。"
        actions={
          can("sso.org.write") ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
              新增下级组织
            </button>
          ) : null
        }
      />

      <div className="sso-org-layout">
        <aside className="sso-card sso-org-tree">
          <div className="sso-org-tree__title">组织树</div>
          {tree.length ? (
            <ul className="sso-tree">
              {tree.map((n) => (
                <OrgTreeItem
                  key={n.id}
                  node={n}
                  depth={0}
                  selectedId={selectedId}
                  onSelect={setSelectedId}
                />
              ))}
            </ul>
          ) : (
            <div className="sso-empty">暂无组织</div>
          )}
        </aside>

        <section className="sso-card">
          {selected ? (
            <OrgDetail
              unit={selected}
              canWrite={can("sso.org.write")}
              onSaved={() => undefined}
            />
          ) : (
            <div className="sso-empty">请选择左侧组织节点</div>
          )}
        </section>
      </div>

      {creating ? (
        <OrgCreateDialog
          defaultParentId={selectedId || null}
          onClose={() => setCreating(false)}
          onCreated={(id) => setSelectedId(id)}
        />
      ) : null}
    </div>
  );
}

function OrgTreeItem({
  node,
  depth,
  selectedId,
  onSelect,
}: {
  node: OrgTreeNode;
  depth: number;
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <li>
      <button
        type="button"
        className={`sso-tree__node${selectedId === node.id ? " is-active" : ""}`}
        style={{ paddingLeft: 12 + depth * 16 }}
        onClick={() => onSelect(node.id)}
      >
        <span className="sso-tree__type">{ORG_TYPE_LABEL[node.type]}</span>
        <span>{node.name}</span>
        {node.status !== "active" ? <em className="sso-tree__off">停用</em> : null}
      </button>
      {node.children.length ? (
        <ul>
          {node.children.map((c) => (
            <OrgTreeItem
              key={c.id}
              node={c}
              depth={depth + 1}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

function OrgDetail({
  unit,
  canWrite,
}: {
  unit: OrgUnit;
  canWrite: boolean;
  onSaved: () => void;
}) {
  const [name, setName] = useState(unit.name);
  const [parentId, setParentId] = useState<string>(unit.parentId ?? "");
  const [type, setType] = useState<OrgUnitType>(unit.type);
  const [leaderName, setLeaderName] = useState(unit.leaderName);
  const [sort, setSort] = useState(String(unit.sort));
  const [status, setStatus] = useState<EntityStatus>(unit.status);
  const [description, setDescription] = useState(unit.description);
  const [error, setError] = useState("");
  const [okMsg, setOkMsg] = useState("");

  useEffect(() => {
    setName(unit.name);
    setParentId(unit.parentId ?? "");
    setType(unit.type);
    setLeaderName(unit.leaderName);
    setSort(String(unit.sort));
    setStatus(unit.status);
    setDescription(unit.description);
    setError("");
    setOkMsg("");
  }, [unit]);

  const parentOptions = listOrgUnits().filter((o) => o.id !== unit.id);

  const save = () => {
    setError("");
    setOkMsg("");
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
    setOkMsg("已保存");
  };

  return (
    <div className="sso-form sso-org-detail">
      <h3>
        {unit.name}
        <code>{unit.code}</code>
      </h3>
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
      {okMsg ? <div className="sso-hint">{okMsg}</div> : null}
      {canWrite ? (
        <div className="sso-form-actions">
          <button type="button" className="sso-btn sso-btn--primary" onClick={save}>
            保存
          </button>
        </div>
      ) : null}
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
      <div className="sso-modal sso-modal--lg" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <h3>新增组织</h3>
        <div className="sso-form">
          <div className="sso-field">
            <label>编码</label>
            <input className="sso-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="如 FINANCE" />
          </div>
          <div className="sso-field">
            <label>名称</label>
            <input className="sso-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="sso-field">
            <label>上级组织</label>
            <select className="sso-select" value={parentId} onChange={(e) => setParentId(e.target.value)}>
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
            <input className="sso-input" value={leaderName} onChange={(e) => setLeaderName(e.target.value)} />
          </div>
          <div className="sso-field">
            <label>排序</label>
            <input className="sso-input" type="number" value={sort} onChange={(e) => setSort(e.target.value)} />
          </div>
          <div className="sso-field">
            <label>说明</label>
            <input className="sso-input" value={description} onChange={(e) => setDescription(e.target.value)} />
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
