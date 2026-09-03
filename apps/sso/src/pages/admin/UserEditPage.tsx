import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { RequirePerm } from "@/components/RequireAuth";
import {
  SSO_SUBSYSTEM_ID,
  createUser,
  getOrgPathLabel,
  getUser,
  listOrgUnits,
  listRoles,
  listSubsystems,
  updateUser,
  type EntityStatus,
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
  const { id } = useParams();
  const isCreate = !id || id === "new";
  const navigate = useNavigate();
  const existing = !isCreate && id ? getUser(id) : null;

  const [username, setUsername] = useState(existing?.username ?? "");
  const [displayName, setDisplayName] = useState(existing?.displayName ?? "");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<EntityStatus>(existing?.status ?? "active");
  const [roleIds, setRoleIds] = useState<string[]>(existing?.roleIds ?? ["r-sso-user"]);
  const [orgUnitId, setOrgUnitId] = useState(existing?.orgUnitId ?? "");
  const [error, setError] = useState("");

  const subsystems = listSubsystems(true);
  const roles = listRoles();
  const orgs = listOrgUnits().filter((o) => o.status === "active");

  const rolesBySys = useMemo(() => {
    const map = new Map<string, typeof roles>();
    for (const r of roles) {
      const list = map.get(r.subsystemId) ?? [];
      list.push(r);
      map.set(r.subsystemId, list);
    }
    return map;
  }, [roles]);

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

  const toggleRole = (rid: string) => {
    setRoleIds((prev) => (prev.includes(rid) ? prev.filter((x) => x !== rid) : [...prev, rid]));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (isCreate) {
      const result = createUser({
        username,
        displayName,
        password,
        roleIds,
        status,
        orgUnitId: orgUnitId || null,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } else if (existing) {
      const result = updateUser(existing.id, {
        displayName,
        roleIds,
        status,
        password: password || undefined,
        orgUnitId: orgUnitId || null,
      });
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
          <h1 className="sso-list-title">{isCreate ? "新增用户" : "编辑用户"}</h1>
          <p className="sso-list-desc">勾选各子系统角色即可开通对应系统入口与权限。</p>
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
            <label htmlFor="u-org">所属组织</label>
            <select
              id="u-org"
              className="sso-select"
              value={orgUnitId}
              onChange={(e) => setOrgUnitId(e.target.value)}
            >
              <option value="">未分配</option>
              {orgs.map((o) => (
                <option key={o.id} value={o.id}>
                  {getOrgPathLabel(o.id)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="sso-role-assign">
          <h2 className="sso-h2">跨系统角色</h2>
          {subsystems.map((sys) => {
            const sysRoles = rolesBySys.get(sys.id) ?? [];
            if (!sysRoles.length) return null;
            return (
              <section key={sys.id} className="sso-role-group">
                <h3>
                  {sys.name}
                  {sys.id === SSO_SUBSYSTEM_ID ? <em>本平台</em> : null}
                </h3>
                <div className="sso-check-grid">
                  {sysRoles.map((r) => (
                    <label key={r.id} className="sso-check">
                      <input
                        type="checkbox"
                        checked={roleIds.includes(r.id)}
                        onChange={() => toggleRole(r.id)}
                        disabled={r.status !== "active"}
                      />
                      <span>
                        <strong>{r.name}</strong>
                        <small>{r.description}</small>
                      </span>
                    </label>
                  ))}
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
