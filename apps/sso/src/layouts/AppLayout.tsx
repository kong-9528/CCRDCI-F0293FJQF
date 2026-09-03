import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

const ADMIN_LINKS = [
  { to: "/admin/users", label: "用户管理", perm: "sso.users" },
  { to: "/admin/roles", label: "角色管理", perm: "sso.roles" },
  { to: "/admin/permissions", label: "权限目录", perm: "sso.perms" },
  { to: "/admin/subsystems", label: "子系统管理", perm: "sso.subsystems" },
] as const;

export function AppLayout() {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();
  const adminLinks = ADMIN_LINKS.filter((l) => can(l.perm));
  const showAdmin = adminLinks.length > 0;

  return (
    <div className={`sso-shell${showAdmin ? " sso-shell--admin" : ""}`}>
      <header className="sso-header">
        <div className="sso-header__inner">
          <Link to="/" className="sso-brand">
            <span className="sso-brand__mark" aria-hidden />
            <span>
              <strong>集团统一身份认证</strong>
              <em>SSO</em>
            </span>
          </Link>
          <nav className="sso-header__nav" aria-label="主导航">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "is-active" : undefined)}>
              应用入口
            </NavLink>
            {showAdmin
              ? adminLinks.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    className={({ isActive }) => (isActive ? "is-active" : undefined)}
                  >
                    {l.label}
                  </NavLink>
                ))
              : null}
          </nav>
          <div className="sso-header__user">
            <div className="sso-header__meta">
              <span className="sso-header__name">{user?.displayName}</span>
              <span className="sso-header__uname">{user?.username}</span>
            </div>
            {can("sso.password") ? (
              <button
                type="button"
                className="sso-btn sso-btn--ghost"
                onClick={() => navigate("/account/password")}
              >
                修改密码
              </button>
            ) : null}
            <button
              type="button"
              className="sso-btn sso-btn--outline"
              onClick={() => {
                logout();
                navigate("/login", { replace: true });
              }}
            >
              退出
            </button>
          </div>
        </div>
      </header>
      <main className="sso-main">
        <Outlet />
      </main>
    </div>
  );
}
