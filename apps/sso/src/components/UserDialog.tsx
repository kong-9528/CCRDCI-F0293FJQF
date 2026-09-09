import { useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import {
  SSO_SUBSYSTEM_ID,
  createUser,
  getManagedOrgIds,
  getOrgPathLabel,
  listAssignableOrgUnits,
  listRoles,
  listSubsystems,
  updateUser,
  type EntityStatus,
  type SsoUser,
} from "@/lib/rbacStore";
import { useRbacTick } from "@/lib/useRbacTick";

type Props =
  | { mode: "create"; onClose: () => void }
  | { mode: "edit"; user: SsoUser; onClose: () => void };

export function UserDialog(props: Props) {
  useRbacTick();
  const { user: actor } = useAuth();
  const isCreate = props.mode === "create";
  const existing = props.mode === "edit" ? props.user : null;
  const onClose = props.onClose;

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
  const [roleIds, setRoleIds] = useState<string[]>(
    () => existing?.roleBindings.map((b) => b.roleId) ?? [],
  );
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

  const selectedRoles = useMemo(() => new Set(roleIds), [roleIds]);

  const toggleRole = (roleId: string) => {
    setRoleIds((prev) =>
      prev.includes(roleId) ? prev.filter((id) => id !== roleId) : [...prev, roleId],
    );
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!actor) {
      setError("未登录");
      return;
    }
    if (!assignableOrgs.length) {
      setError("当前账号没有可管辖的部门，无法维护用户");
      return;
    }
    if (!orgUnitId) {
      setError("请选择归属部门");
      return;
    }
    const roleBindings = roleIds.map((roleId) => ({
      roleId,
      orgUnitIds: [orgUnitId],
    }));
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
    onClose();
  };

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sso-modal sso-modal--xl"
        role="dialog"
        aria-modal
        aria-labelledby="sso-user-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="sso-user-dialog-title">{isCreate ? "新增用户" : "编辑用户"}</h3>
        <form className="sso-form" onSubmit={onSubmit}>
          {!assignableOrgs.length ? (
            <div className="sso-empty">当前账号没有可管辖的部门，无法维护用户。</div>
          ) : (
            <>
              <div className="sso-form-grid">
                <div className="sso-field">
                  <label htmlFor="u-name">
                    用户名 {isCreate ? <span className="sso-req">*</span> : null}
                  </label>
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
                </div>
              </div>

              <div className="sso-role-assign">
                <h2 className="sso-h2">角色分配</h2>
                <p className="sso-hint">按子系统勾选需要开通的角色即可。</p>
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
                          const checked = selectedRoles.has(r.id);
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
                            </div>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </>
          )}

          {error ? <div className="sso-error">{error}</div> : null}
          <div className="sso-form-actions">
            <button type="button" className="sso-btn sso-btn--ghost" onClick={onClose}>
              取消
            </button>
            <button
              type="submit"
              className="sso-btn sso-btn--primary"
              disabled={!assignableOrgs.length}
            >
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
