import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { OrgTreeMultiSelect } from "@/components/OrgTreeMultiSelect";
import { RequirePerm } from "@/components/RequireAuth";
import { useAuth } from "@/lib/auth";
import {
  SSO_SUBSYSTEM_ID,
  createUser,
  getManagedOrgIds,
  getOrgPathLabel,
  getUser,
  listAssignableOrgUnits,
  listRoles,
  listSubsystems,
  updateUser,
  type EntityStatus,
  type RoleBinding,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

export function UserEditPage() {
  return (
    <RequirePerm code="sso.users.write">
      <UserEditInner />
    </RequirePerm>
  );
}

function UserEditInner() {
  useRbacTick();
  const { user: actor } = useAuth();
  const { id } = useParams();
  const isCreate = !id || id === "new";
  const navigate = useNavigate();
  const existing = !isCreate && id ? getUser(id) : null;

  const managedOrgIds = useMemo(
    () => (actor ? getManagedOrgIds(actor) : new Set<string>()),
    [actor],
  );
  const assignableOrgs = useMemo(
    () => (actor ? listAssignableOrgUnits(actor) : []),
    [actor],
  );

  const defaultOrg =
    existing?.orgUnitId && managedOrgIds.has(existing.orgUnitId)
      ? existing.orgUnitId
      : assignableOrgs[0]?.id ?? "";

  const [username, setUsername] = useState(existing?.username ?? "");
  const [displayName, setDisplayName] = useState(existing?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<EntityStatus>(existing?.status ?? "active");
  const [orgUnitId, setOrgUnitId] = useState(defaultOrg);
  const [roleBindings, setRoleBindings] = useState<RoleBinding[]>(() => {
    if (existing?.roleBindings.length) {
      return existing.roleBindings.map((b) => ({
        roleId: b.roleId,
        orgUnitIds: b.orgUnitIds.filter((oid) => managedOrgIds.has(oid)),
      }));
    }
    return [];
  });
  const [error, setError] = useState("");

  const subsystems = listSubsystems(true);
  const roles = listRoles();

  const rolesBySys = useMemo(() => {
    const map = new Map<string, typeof roles>();
    for (const r of roles) {
      const list = map.get(r.subsystemId) ?? [];
      list.push(r);
      map.set(r.subsystemId, list);
    }
    return map;
  }, [roles]);

  const bindingByRole = useMemo(() => {
    const map = new Map<string, RoleBinding>();
    for (const b of roleBindings) map.set(b.roleId, b);
    return map;
  }, [roleBindings]);

  if (!actor) {
    return (
      <div className="sso-card">
        <div className="sso-empty">未登录</div>
      </div>
    );
  }

  if (!assignableOrgs.length) {
    return (
      <div className="sso-card">
        <div className="sso-empty">
          当前账号没有可管辖的部门（请先在角色履职部门中配置管辖范围），无法维护用户。
        </div>
        <Link to="/admin/users" className="sso-btn sso-btn--ghost">
          返回列表
        </Link>
      </div>
    );
  }

  if (!isCreate && !existing) {
    return (
      <div className="sso-card">
        <div className="sso-empty">用户不存在</div>
        <Link to="/admin/users" className="sso-btn sso-btn--ghost">
          返回列表
        </Link>
      </div>
    );
  }

  const toggleRole = (roleId: string) => {
    setRoleBindings((prev) => {
      const exists = prev.some((b) => b.roleId === roleId);
      if (exists) return prev.filter((b) => b.roleId !== roleId);
      // 刚勾选：默认带入当前归属部门（若归属在管辖范围内）
      const initial =
        orgUnitId && managedOrgIds.has(orgUnitId)
          ? [orgUnitId]
          : assignableOrgs[0]
            ? [assignableOrgs[0].id]
            : [];
      return [...prev, { roleId, orgUnitIds: initial }];
    });
  };

  const toggleRoleOrgs = (roleId: string, orgUnitIds: string[]) => {
    setRoleBindings((prev) =>
      prev.map((b) => (b.roleId === roleId ? { ...b, orgUnitIds } : b)),
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const opts = { managedOrgIds };
    if (isCreate) {
      const result = createUser(
        {
          username,
          displayName,
          password,
          orgUnitId,
          roleBindings,
          status,
        },
        opts,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (existing) {
      const result = updateUser(
        existing.id,
        {
          displayName,
          orgUnitId,
          roleBindings,
          status,
          password: password || undefined,
        },
        opts,
      );
      if (!result.ok) {
        setError(result.message);
        return;
      }
    }
    navigate("/admin/users");
  };

  return (
    <div className="sso-narrow sso-narrow--wide">
      <header className="sso-list-head">
        <div className="sso-list-head__main">
          <Link to="/admin/users" className="sso-back-link">
            ← 返回用户列表
          </Link>
          <h1 className="sso-list-title">{isCreate ? "新增用户" : "编辑用户"}</h1>
          <p className="sso-list-desc">
            用户有唯一归属部门；每个勾选的角色再配置履职部门（可多选，默认同归属）。可选部门限于你账号角色身份的管辖范围。
          </p>
        </div>
      </header>

      <form className="sso-card sso-form" onSubmit={onSubmit}>
        <div className="sso-form-grid">
          <div className="sso-field">
            <label htmlFor="u-name">用户名 {isCreate ? <span className="sso-req">*</span> : null}</label>
            <input
              id="u-name"
              className="sso-input"
              value={username}
              disabled={!isCreate}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="全局唯一，如 zhangsan"
            />
            {!isCreate ? (
              <div className="sso-hint">用户名创建后不可修改</div>
            ) : (
              <div className="sso-hint">字母开头，3–32 位；可与入职邮箱本地部分一致</div>
            )}
          </div>
          <div className="sso-field">
            <label htmlFor="u-display">显示名</label>
            <input
              id="u-display"
              className="sso-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <div className="sso-field">
            <label htmlFor="u-pass">
              {isCreate ? (
                <>
                  初始密码 <span className="sso-req">*</span>
                </>
              ) : (
                "重置密码（可选）"
              )}
            </label>
            <input
              id="u-pass"
              type="password"
              className="sso-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={isCreate ? "至少 6 位" : "留空则不修改"}
            />
          </div>
          <div className="sso-field">
            <label htmlFor="u-status">状态</label>
            <select
              id="u-status"
              className="sso-select"
              value={status}
              onChange={(e) => setStatus(e.target.value as EntityStatus)}
            >
              <option value="active">启用</option>
              <option value="disabled">停用</option>
            </select>
          </div>
          <div className="sso-field sso-form-grid__span">
            <label htmlFor="u-org">
              归属部门 <span className="sso-req">*</span>
            </label>
            <select
              id="u-org"
              className="sso-select"
              value={orgUnitId}
              onChange={(e) => setOrgUnitId(e.target.value)}
            >
              <option value="">请选择归属部门</option>
              {assignableOrgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {getOrgPathLabel(o.id)}
                </option>
              ))}
            </select>
            <div className="sso-hint">改归属不会自动覆盖已勾选角色的履职部门。</div>
          </div>
        </div>

        <div className="sso-role-assign">
          <h2 className="sso-h2">角色与履职部门</h2>
          <p className="sso-hint">勾选角色后，在卡片内选择该角色管辖的一个或多个部门。</p>
          {subsystems.map((sys) => {
            const sysRoles = rolesBySys.get(sys.id) ?? [];
            if (!sysRoles.length) return null;
            return (
              <section key={sys.id} className="sso-role-group">
                <h3>
                  {sys.name}
                  {sys.id === SSO_SUBSYSTEM_ID ? <em>本平台</em> : null}
                </h3>
                <div className="sso-role-cards">
                  {sysRoles.map((r) => {
                    const binding = bindingByRole.get(r.id);
                    const checked = Boolean(binding);
                    return (
                      <div
                        key={r.id}
                        className={`sso-role-card${checked ? " is-checked" : ""}${
                          r.status !== "active" ? " is-disabled" : ""
                        }`}
                      >
                        <label className="sso-role-card__head">
                          <input
                            type="checkbox"
                            checked={checked}
                            disabled={r.status !== "active"}
                            onChange={() => toggleRole(r.id)}
                          />
                          <span>
                            <strong>{r.name}</strong>
                            <small>{r.description}</small>
                          </span>
                        </label>
                        {checked ? (
                          <div className="sso-role-card__orgs">
                            <div className="sso-role-card__orgs-label">履职部门（可多选）</div>
                            <OrgTreeMultiSelect
                              value={binding?.orgUnitIds ?? []}
                              allowedIds={managedOrgIds}
                              onChange={(ids) => toggleRoleOrgs(r.id, ids)}
                              placeholder="从组织树中选择履职部门"
                              error={!binding?.orgUnitIds.length}
                            />
                            {!binding?.orgUnitIds.length ? (
                              <div className="sso-error sso-error--inline">请至少选择一个履职部门</div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {error ? <div className="sso-error">{error}</div> : null}
        <div className="sso-form-actions">
          <Link to="/admin/users" className="sso-btn sso-btn--ghost">
            取消
          </Link>
          <button type="submit" className="sso-btn sso-btn--primary">
            保存
          </button>
        </div>
      </form>
    </div>
  );
}
