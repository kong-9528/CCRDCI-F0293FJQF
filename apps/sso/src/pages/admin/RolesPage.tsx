import { useMemo, useState } from "react";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  createRole,
  getSubsystem,
  listPermissions,
  listRoles,
  listSubsystems,
  updateRole,
  type EntityStatus,
  type Role,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

export function RolesPage() {
  return (
    <RequirePerm code="sso.roles">
      <RolesPageInner />
    </RequirePerm>
  );
}

function RolesPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const roles = listRoles();
  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="sso-admin">
      <header className="sso-page-head sso-page-head--row">
        <div>
          <p className="sso-eyebrow">RBAC</p>
          <h1 className="sso-h1">角色管理</h1>
          <p className="sso-lead">角色归属单一子系统；用户通过绑定多角色获得多系统权限。</p>
        </div>
        {can("sso.roles.write") ? (
          <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
            新增角色
          </button>
        ) : null}
      </header>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>编码</th>
              <th>名称</th>
              <th>所属系统</th>
              <th>权限数</th>
              <th>状态</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.id}>
                <td>
                  <code>{r.code}</code>
                </td>
                <td>{r.name}</td>
                <td>{getSubsystem(r.subsystemId)?.name ?? "—"}</td>
                <td>{r.permissionIds.length}</td>
                <td>
                  <span className={`sso-tag${r.status === "active" ? " is-ok" : ""}`}>
                    {r.status === "active" ? "启用" : "停用"}
                  </span>
                </td>
                <td>
                  {can("sso.roles.write") ? (
                    <button type="button" className="sso-text-link" onClick={() => setEditing(r)}>
                      编辑
                    </button>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {creating ? <RoleDialog mode="create" onClose={() => setCreating(false)} /> : null}
      {editing ? (
        <RoleDialog mode="edit" role={editing} onClose={() => setEditing(null)} />
      ) : null}
    </div>
  );
}

function RoleDialog({
  mode,
  role,
  onClose,
}: {
  mode: "create" | "edit";
  role?: Role;
  onClose: () => void;
}) {
  const [code, setCode] = useState(role?.code ?? "");
  const [name, setName] = useState(role?.name ?? "");
  const [subsystemId, setSubsystemId] = useState(role?.subsystemId ?? "sso");
  const [description, setDescription] = useState(role?.description ?? "");
  const [status, setStatus] = useState<EntityStatus>(role?.status ?? "active");
  const [permissionIds, setPermissionIds] = useState<string[]>(role?.permissionIds ?? []);
  const [error, setError] = useState("");

  const perms = useMemo(() => listPermissions(subsystemId), [subsystemId]);

  const toggle = (pid: string) => {
    setPermissionIds((prev) =>
      prev.includes(pid) ? prev.filter((x) => x !== pid) : [...prev, pid],
    );
  };

  const submit = () => {
    setError("");
    if (mode === "create") {
      const result = createRole({ code, name, subsystemId, description, permissionIds });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (role) {
      const result = updateRole(role.id, { name, description, permissionIds, status });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    }
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div className="sso-modal" role="dialog" aria-modal onClick={(e) => e.stopPropagation()}>
        <h3>{mode === "create" ? "新增角色" : "编辑角色"}</h3>
        <div className="sso-form">
          {mode === "create" ? (
            <>
              <div className="sso-field">
                <label>所属子系统</label>
                <select
                  className="sso-select"
                  value={subsystemId}
                  onChange={(e) => {
                    setSubsystemId(e.target.value);
                    setPermissionIds([]);
                  }}
                >
                  {listSubsystems(true).map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sso-field">
                <label>角色编码</label>
                <input className="sso-input" value={code} onChange={(e) => setCode(e.target.value)} />
              </div>
            </>
          ) : (
            <div className="sso-hint">
              所属系统：{getSubsystem(subsystemId)?.name} · 编码：{code}
            </div>
          )}
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
          {mode === "edit" ? (
            <div className="sso-field">
              <label>状态</label>
              <select
                className="sso-select"
                value={status}
                onChange={(e) => setStatus(e.target.value as EntityStatus)}
              >
                <option value="active">启用</option>
                <option value="disabled">停用</option>
              </select>
            </div>
          ) : null}
          <div className="sso-field">
            <label>权限点</label>
            <div className="sso-check-grid sso-check-grid--compact">
              {perms.map((p) => (
                <label key={p.id} className="sso-check">
                  <input
                    type="checkbox"
                    checked={permissionIds.includes(p.id)}
                    onChange={() => toggle(p.id)}
                  />
                  <span>
                    <strong>{p.name}</strong>
                    <small>
                      <code>{p.code}</code>
                    </small>
                  </span>
                </label>
              ))}
              {!perms.length ? <div className="sso-hint">该系统暂无权限点</div> : null}
            </div>
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
