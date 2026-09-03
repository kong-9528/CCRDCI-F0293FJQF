import { useMemo, useState } from "react";
import { ListPageHeader } from "@/components/ListPageHeader";
import { PermCheckTree, getPermissionTreeForSubsystem } from "@/components/PermCheckTree";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  createRole,
  getSubsystem,
  listRoles,
  listSubsystems,
  updateRole,
  type EntityStatus,
  type Role,
} from "@/lib/rbacStore";
import { useClientPagination } from "@/lib/useClientPagination";
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
  const pager = useClientPagination(roles);
  const [editing, setEditing] = useState<Role | null>(null);
  const [creating, setCreating] = useState(false);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="角色管理"
        description="角色归属单一子系统；用户通过绑定多角色获得多系统权限。"
        actions={
          can("sso.roles.write") ? (
            <button type="button" className="sso-btn sso-btn--primary" onClick={() => setCreating(true)}>
              新增角色
            </button>
          ) : null
        }
      />

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
            {pager.pageItems.map((r) => (
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
            {!pager.total ? (
              <tr>
                <td colSpan={6}>
                  <div className="sso-empty">暂无角色</div>
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
        <SsoPagination
          page={pager.page}
          pageSize={pager.pageSize}
          total={pager.total}
          totalPages={pager.totalPages}
          pageSizes={pager.pageSizes}
          onPageChange={pager.setPage}
          onPageSizeChange={pager.setPageSize}
        />
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

  const permTree = useMemo(() => getPermissionTreeForSubsystem(subsystemId), [subsystemId]);
  const selected = useMemo(() => new Set(permissionIds), [permissionIds]);

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
      <div
        className="sso-modal sso-modal--lg"
        role="dialog"
        aria-modal
        onClick={(e) => e.stopPropagation()}
      >
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
            <label>
              权限点
              <span className="sso-field__meta">已选 {permissionIds.length}</span>
            </label>
            <div className="sso-perm-panel">
              <PermCheckTree
                nodes={permTree}
                selected={selected}
                onChange={(next) => setPermissionIds([...next])}
              />
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
