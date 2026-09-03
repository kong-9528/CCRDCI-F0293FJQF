import { useMemo, useState } from "react";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  createPermission,
  getSubsystem,
  listPermissions,
  listSubsystems,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

export function PermissionsPage() {
  return (
    <RequirePerm code="sso.perms">
      <PermissionsPageInner />
    </RequirePerm>
  );
}

function PermissionsPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const [filterSys, setFilterSys] = useState("");
  const [creating, setCreating] = useState(false);
  const perms = useMemo(
    () => listPermissions(filterSys || undefined),
    [filterSys],
  );

  return (
    <div className="sso-admin">
      <header className="sso-page-head sso-page-head--row">
        <div>
          <p className="sso-eyebrow">RBAC</p>
          <h1 className="sso-h1">权限目录</h1>
          <p className="sso-lead">权限点按子系统划分，由角色聚合后授予用户。</p>
        </div>
        {can("sso.roles.write") ? (
          <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
            新增权限点
          </button>
        ) : null}
      </header>

      <div className="sso-toolbar">
        <select
          className="sso-select"
          value={filterSys}
          onChange={(e) => setFilterSys(e.target.value)}
        >
          <option value="">全部子系统</option>
          {listSubsystems(true).map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>所属系统</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            {perms.map((p) => (
              <tr key={p.id}>
                <td>
                  <code>{p.code}</code>
                </td>
                <td>{p.name}</td>
                <td>{getSubsystem(p.subsystemId)?.name ?? "—"}</td>
                <td>{p.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating ? <PermDialog onClose={() => setCreating(false)} /> : null}
    </div>
  );
}

function PermDialog({ onClose }: { onClose: () => void }) {
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [subsystemId, setSubsystemId] = useState("sso");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    const result = createPermission({ code, name, subsystemId, description });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="sso-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <h3>新增权限点</h3>
        <div className="sso-form">
          <div className="sso-field">
            <label>所属子系统</label>
            <select
              className="sso-select"
              value={subsystemId}
              onChange={(e) => setSubsystemId(e.target.value)}
            >
              {listSubsystems(true).map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="sso-field">
            <label>编码</label>
            <input
              className="sso-input"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="如 oa.report"
            />
          </div>
          <div className="sso-field">
            <label>名称</label>
            <input className="sso-input" value={name} onChange={(e) => setName(e.target.value)} />
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
