import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ListPageHeader } from "@/components/ListPageHeader";
import { SsoPagination } from "@/components/SsoPagination";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  getOrgPathLabel,
  getOrgUnit,
  getRole,
  getSubsystem,
  listRoles,
  listUsers,
  type EntityStatus,
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

type Filters = {
  keyword: string;
  status: "" | EntityStatus;
};

const EMPTY: Filters = { keyword: "", status: "" };

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
  const [draft, setDraft] = useState<Filters>(EMPTY);
  const [applied, setApplied] = useState<Filters>(EMPTY);

  const filtered = useMemo(() => {
    const q = applied.keyword.trim().toLowerCase();
    return listUsers().filter((u) => {
      if (applied.status && u.status !== applied.status) return false;
      if (!q) return true;
      return (
        u.username.toLowerCase().includes(q) ||
        u.displayName.toLowerCase().includes(q) ||
        (getOrgUnit(u.orgUnitId)?.name ?? "").toLowerCase().includes(q) ||
        getOrgPathLabel(u.orgUnitId).toLowerCase().includes(q)
      );
    });
  }, [applied]);

  const pager = useClientPagination(filtered);

  return (
    <div className="sso-admin">
      <ListPageHeader
        title="用户管理"
        description="用户名全局唯一。每位用户有唯一归属部门，并可绑定各子系统角色。"
        actions={
          can("sso.users.write") ? (
            <Link to="/admin/users/new" className="sso-btn sso-btn--primary">
              新增用户
            </Link>
          ) : null
        }
      />

      <div className="sso-filters">
        <label className="sso-filters__item">
          <span>关键词</span>
          <input
            className="sso-input"
            value={draft.keyword}
            onChange={(e) => setDraft((p) => ({ ...p, keyword: e.target.value }))}
            placeholder="用户名 / 显示名 / 部门"
          />
        </label>
        <label className="sso-filters__item">
          <span>状态</span>
          <select
            className="sso-select"
            value={draft.status}
            onChange={(e) => setDraft((p) => ({ ...p, status: e.target.value as Filters["status"] }))}
          >
            <option value="">全部</option>
            <option value="active">启用</option>
            <option value="disabled">停用</option>
          </select>
        </label>
        <div className="sso-filters__actions">
          <button
            type="button"
            className="sso-btn sso-btn--primary"
            onClick={() => {
              setApplied(draft);
              pager.resetPage();
            }}
          >
            查询
          </button>
          <button
            type="button"
            className="sso-btn sso-btn--outline"
            onClick={() => {
              setDraft(EMPTY);
              setApplied(EMPTY);
              pager.resetPage();
            }}
          >
            重置
          </button>
        </div>
      </div>

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
                    {getOrgUnit(u.orgUnitId)?.name ?? "—"}
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
