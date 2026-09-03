import { useAuth } from "@/lib/auth";
import { listRoles } from "@/lib/rbacStore";

export function LauncherPage() {
  const { user, subsystems, can } = useAuth();

  if (!can("sso.launcher")) {
    return (
      <div className="sso-card">
        <div className="sso-empty">当前账号无权访问应用入口，请联系管理员。</div>
      </div>
    );
  }

  const roleNamesBySys = new Map<string, string[]>();
  if (user) {
    for (const rid of user.roleIds) {
      const role = listRoles().find((r) => r.id === rid);
      if (!role || role.status !== "active") continue;
      const list = roleNamesBySys.get(role.subsystemId) ?? [];
      list.push(role.name);
      roleNamesBySys.set(role.subsystemId, list);
    }
  }

  return (
    <div className="sso-launcher">
      <header className="sso-page-head">
        <div>
          <p className="sso-eyebrow">Application portal</p>
          <h1 className="sso-h1">
            你好，{user?.displayName}
            <span>已为你开通 {subsystems.length} 个业务系统</span>
          </h1>
          <p className="sso-lead">点击卡片进入对应子系统。权限由 SSO 统一用户名下的多系统角色决定。</p>
        </div>
      </header>

      {subsystems.length === 0 ? (
        <div className="sso-card">
          <div className="sso-empty">暂未开通任何业务子系统，请联系管理员分配角色。</div>
        </div>
      ) : (
        <div className="sso-app-grid">
          {subsystems.map((sys, i) => {
            const roles = roleNamesBySys.get(sys.id) ?? [];
            return (
              <a
                key={sys.id}
                className={`sso-app-card sso-app-card--${(i % 4) + 1}`}
                href={sys.entryUrl || "#"}
                target="_blank"
                rel="noopener noreferrer"
                style={{ ["--sso-accent" as string]: sys.accent }}
              >
                <div className="sso-app-card__icon" aria-hidden>
                  {sys.name.slice(0, 1)}
                </div>
                <div className="sso-app-card__body">
                  <h2>{sys.name}</h2>
                  <p>{sys.description}</p>
                  {roles.length ? (
                    <div className="sso-app-card__tags">
                      {roles.map((r) => (
                        <span key={r}>{r}</span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <span className="sso-app-card__cta">进入系统 →</span>
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
