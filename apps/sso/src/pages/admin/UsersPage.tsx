import { Link } from "react-router-dom";
import { ListPageHeader } from "@/components/ListPageHeader";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  getOrgPathLabel,
  getRole,
  getSubsystem,
  listRoles,
  listUsers,
  type SsoUser,
} from "@/lib/rbacStore";
import { useClientPagination } from "@/lib/useClientPagination";
import { useRbacTick } from "@/lib/useRbacTick";

/** 子系统单元格：每行一个子系统，格式 系统名(角色1,角色2) */
function formatUserSubsystemsCell(user: SsoUser): string[] {
  const bySys = new Map<string, string[]>();
  for (const binding of user.roleBindings) {
    const role = getRole(binding.roleId);
    if (!role) continue;
    const list = bySys.get(role.subsystemId) ?? [];
    if (!list.includes(role.name)) list.push(role.name);
    bySys.set(role.subsystemId, list);
  }

  const sysIds = [...bySys.keys()].sort((a, b) => {
    const sa = getSubsystem(a);
    const sb = getSubsystem(b);
    return (sa?.sort ?? 999) - (sb?.sort ?? 999) || (sa?.name ?? "").localeCompare(sb?.name ?? "");
  });

  if (!sysIds.length) return [];

  return sysIds.map((sysId) => {
    const name = getSubsystem(sysId)?.name ?? sysId;
    const roles = bySys.get(sysId) ?? [];
    return `${name}(${roles.join(",")})`;
  });
}

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
  const pager = useClientPagination(users);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="用户管理"
        description="用户名全局唯一。每位用户有唯一归属部门，并为每个角色配置履职部门（可多部门）。"
        actions={
          can("sso.users.write") ? (
            <Link to="/admin/users/new" className="sso-btn sso-btn--primary">
              新增用户
            </Link>
          ) : null
        }
      />

      <div className="sso-card sso-card--flush">
        <table className="sso-table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>显示名</th>
              <th>归属部门</th>
              <th>状态</th>
              <th>子系统</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            {pager.pageItems.map((u) => {
              const sysLines = formatUserSubsystemsCell(u);
              return (
                <tr key={u.id}>
                  <td>
                    <code>{u.username}</code>
                  </td>
                  <td>{u.displayName}</td>
                  <td className="sso-cell-ellipsis" title={getOrgPathLabel(u.orgUnitId)}>
                    {getOrgPathLabel(u.orgUnitId)}
                  </td>
                  <td>
                    <span className={`sso-tag${u.status === "active" ? " is-ok" : ""}`}>
                      {u.status === "active" ? "启用" : "停用"}
                    </span>
                  </td>
                  <td title={sysLines.join("\n")}>
                    {sysLines.length ? (
                      <div className="sso-sys-lines">
                        {sysLines.map((line) => (
                          <div key={line} className="sso-sys-lines__item">
                            {line}
                          </div>
                        ))}
                      </div>
                    ) : (
                      "—"
                    )}
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
            {!pager.total ? (
              <tr>
                <td colSpan={6}>
                  <div className="sso-empty">暂无用户</div>
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
    </div>
  );
}

export function roleLabel(roleId: string) {
  const role = listRoles().find((r) => r.id === roleId);
  if (!role) return roleId;
  const sys = getSubsystem(role.subsystemId);
  return `${sys?.name ?? "?"} / ${role.name}`;
}
