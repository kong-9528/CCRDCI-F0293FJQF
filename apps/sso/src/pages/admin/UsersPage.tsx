import { Link } from "react-router-dom";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  getSubsystem,
  getUserSubsystems,
  listRoles,
  listUsers,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

export function UsersPage() {
  return (
    <RequirePerm code="sso.users">
      <UsersPageInner />
    </RequirePerm>
  );
}

function UsersPageInner() {
  useRbacTick();
  const { can } = useAuth();
  const users = listUsers();
  const roles = listRoles();

  return (
    <div className="sso-admin">
      <header className="sso-page-head sso-page-head--row">
        <div>
          <p className="sso-eyebrow">RBAC</p>
          <h1 className="sso-h1">用户管理</h1>
          <p className="sso-lead">
            SSO 用户名全局唯一。可为同一用户绑定多个子系统下的角色，实现跨系统权限开通。
          </p>
        </div>
        {can("sso.users.write") ? (
          <Link to="/admin/users/new" className="sso-btn sso-btn--primary">
            新增用户
          </Link>
        ) : null}
      </header>

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>显示名</th>
              <th>状态</th>
              <th>已开通子系统</th>
              <th>角色数</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => {
              const sys = getUserSubsystems(u);
              return (
                <tr key={u.id}>
                  <td>
                    <code>{u.username}</code>
                  </td>
                  <td>{u.displayName}</td>
                  <td>
                    <span className={`sso-tag${u.status === "active" ? " is-ok" : ""}`}>
                      {u.status === "active" ? "启用" : "停用"}
                    </span>
                  </td>
                  <td>
                    {sys.length
                      ? sys.map((s) => s.name).join("、")
                      : "—"}
                  </td>
                  <td>
                    {u.roleIds.filter((id) => roles.some((r) => r.id === id)).length}
                  </td>
                  <td>
                    {can("sso.users.write") ? (
                      <Link to={`/admin/users/${u.id}`} className="sso-text-link">
                        编辑
                      </Link>
                    ) : (
                      "—"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function roleLabel(roleId: string) {
  const role = listRoles().find((r) => r.id === roleId);
  if (!role) return roleId;
  const sys = getSubsystem(role.subsystemId);
  return `${sys?.name ?? "?"} / ${role.name}`;
}
