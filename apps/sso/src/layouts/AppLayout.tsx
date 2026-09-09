import { useEffect, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

type NavItem = {
  to: string;
  label: string;
  perm?: string;
  end?: boolean;
};

type NavGroup = {
  /** 有 title 时作为可展开收起的目录 */
  title?: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    items: [{ to: "/home", label: "首页", perm: "sso.launcher", end: true }],
  },
  {
    title: "门户用户管理",
    items: [{ to: "/admin/portal-users", label: "门户用户列表", perm: "sso.portal.users" }],
  },
  {
    title: "系统管理",
    items: [
      { to: "/admin/users", label: "用户管理", perm: "sso.users" },
      { to: "/admin/org", label: "组织结构", perm: "sso.org" },
      { to: "/admin/roles", label: "角色管理", perm: "sso.roles" },
      { to: "/admin/permissions", label: "菜单管理", perm: "sso.perms" },
      { to: "/admin/subsystems", label: "子系统管理", perm: "sso.subsystems" },
      { to: "/admin/apis", label: "接口管理", perm: "sso.apis" },
    ],
  },
];

const TITLE_MAP: { match: (path: string) => boolean; title: string }[] = [
  { match: (p) => p === "/home", title: "首页" },
  { match: (p) => p.startsWith("/account/password"), title: "修改密码" },
  { match: (p) => /^\/admin\/portal-users\/[^/]+/.test(p), title: "门户用户详情" },
  { match: (p) => p.startsWith("/admin/portal-users"), title: "门户用户列表" },
  { match: (p) => p.startsWith("/admin/users"), title: "用户管理" },
  { match: (p) => p.startsWith("/admin/org"), title: "组织结构" },
  { match: (p) => p.startsWith("/admin/roles"), title: "角色管理" },
  { match: (p) => p.startsWith("/admin/permissions"), title: "菜单管理" },
  { match: (p) => p.startsWith("/admin/subsystems"), title: "子系统管理" },
  { match: (p) => p.startsWith("/admin/apis"), title: "接口管理" },
];

function pageTitle(pathname: string) {
  return TITLE_MAP.find((t) => t.match(pathname))?.title ?? "用户统一认证系统";
}

function crumbParent(pathname: string) {
  if (pathname.startsWith("/admin/portal-users")) return "门户用户管理";
  if (pathname.startsWith("/admin/")) return "系统管理";
  return "统一认证";
}

function groupHasActive(items: NavItem[], pathname: string) {
  return items.some((item) =>
    item.end ? pathname === item.to : pathname === item.to || pathname.startsWith(`${item.to}/`),
  );
}

export function AppLayout() {
  const { user, can, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  /** 目录展开状态：默认展开业务目录 */
  const [openDirs, setOpenDirs] = useState<Record<string, boolean>>({
    门户用户管理: true,
    系统管理: true,
  });
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const groups = NAV_GROUPS.map((g) => ({
    ...g,
    items: g.items.filter((item) => !item.perm || can(item.perm)),
  })).filter((g) => g.items.length > 0);

  useEffect(() => {
    for (const group of NAV_GROUPS) {
      if (!group.title) continue;
      const items = group.items.filter((item) => !item.perm || can(item.perm));
      if (groupHasActive(items, location.pathname)) {
        setOpenDirs((prev) => (prev[group.title!] ? prev : { ...prev, [group.title!]: true }));
      }
    }
  }, [location.pathname, can]);

  useEffect(() => {
    setUserMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!userMenuOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (!userMenuRef.current?.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [userMenuOpen]);

  const toggleDir = (title: string) => {
    setOpenDirs((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const initial = (user?.displayName || user?.username || "用").slice(0, 1);

  return (
    <div className="sso-shell sso-shell--rbac">
      <aside className="sso-sider" aria-label="侧栏导航">
        <div className="sso-sider__brand">
          <Link to="/home" className="sso-brand">
            <span className="sso-brand__mark" aria-hidden />
            <span>
              <strong>用户统一认证系统</strong>
            </span>
          </Link>
        </div>

        <nav className="sso-sider__nav">
          {groups.map((group, gi) => {
            if (!group.title) {
              return (
                <div key={`g-${gi}`} className="sso-sider__group">
                  <ul className="sso-sider__menu">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `sso-sider__link${isActive ? " is-active" : ""}`
                          }
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            }

            const open = openDirs[group.title] ?? true;
            const hasActive = groupHasActive(group.items, location.pathname);

            return (
              <div
                key={group.title}
                className={`sso-sider__acc${open ? " is-open" : ""}${hasActive ? " has-active" : ""}`}
              >
                <button
                  type="button"
                  className="sso-sider__dir"
                  aria-expanded={open}
                  onClick={() => toggleDir(group.title!)}
                >
                  <span className="sso-sider__dir-label">{group.title}</span>
                  <span className={`sso-sider__caret${open ? " is-open" : ""}`} aria-hidden>
                    ▾
                  </span>
                </button>
                {open ? (
                  <ul className="sso-sider__menu sso-sider__menu--sub">
                    {group.items.map((item) => (
                      <li key={item.to}>
                        <NavLink
                          to={item.to}
                          end={item.end}
                          className={({ isActive }) =>
                            `sso-sider__link sso-sider__link--sub${isActive ? " is-active" : ""}`
                          }
                        >
                          {item.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            );
          })}
        </nav>
      </aside>

      <div className="sso-workspace">
        <header className="sso-topbar">
          <div className="sso-topbar__crumb">
            <span>{crumbParent(location.pathname)}</span>
            <span className="sso-topbar__sep" aria-hidden>
              /
            </span>
            <strong>{pageTitle(location.pathname)}</strong>
          </div>
          <div className="sso-topbar__actions">
            <div className={`sso-user-menu${userMenuOpen ? " is-open" : ""}`} ref={userMenuRef}>
              <button
                type="button"
                className="sso-user-menu__trigger"
                aria-haspopup="menu"
                aria-expanded={userMenuOpen}
                onClick={() => setUserMenuOpen((v) => !v)}
              >
                <span className="sso-user-menu__avatar" aria-hidden>
                  {initial}
                </span>
                <span className="sso-user-menu__meta">
                  <span className="sso-user-menu__name">{user?.displayName}</span>
                  <span className="sso-user-menu__uname">{user?.username}</span>
                </span>
                <span className={`sso-user-menu__chevron${userMenuOpen ? " is-open" : ""}`} aria-hidden>
                  ▾
                </span>
              </button>
              {userMenuOpen ? (
                <div className="sso-user-menu__dropdown" role="menu">
                  <div className="sso-user-menu__head">
                    <div className="sso-user-menu__head-name">{user?.displayName}</div>
                    <div className="sso-user-menu__head-id">{user?.username}</div>
                  </div>
                  {can("sso.password") ? (
                    <button
                      type="button"
                      role="menuitem"
                      className="sso-user-menu__item"
                      onClick={() => {
                        setUserMenuOpen(false);
                        navigate("/account/password");
                      }}
                    >
                      修改密码
                    </button>
                  ) : null}
                  <button
                    type="button"
                    role="menuitem"
                    className="sso-user-menu__item sso-user-menu__item--danger"
                    onClick={() => {
                      setUserMenuOpen(false);
                      logout();
                      navigate("/login", { replace: true });
                    }}
                  >
                    退出登录
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </header>
        <main className="sso-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
