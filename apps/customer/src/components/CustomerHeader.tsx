import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconBell } from "@/components/icons/UiIcons";
import { PLATFORM_NAME } from "@/lib/catalog";
import { CUSTOMER_NAV, isNavItemActive } from "@/lib/nav";
import { MOCK_SESSION, MOCK_TENANT, PORTAL_LINKS } from "@/lib/tenant";

type Props = {
  pathname: string;
};

function userInitial(name: string) {
  const t = name.trim();
  return t ? t.slice(0, 1).toUpperCase() : "U";
}

function LogoutIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h4"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path
        d="M14 16l4-4-4-4M18 12H9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CustomerHeader({ pathname }: Props) {
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const username = MOCK_SESSION.username;
  const companyName = MOCK_TENANT.companyName;
  const isDciCenter = MOCK_SESSION.isDciRegistryCenter;
  const apiActive = pathname === "/api" || pathname.startsWith("/api/");
  const onTechDesk = pathname === "/desk" || pathname === "/" || pathname.startsWith("/desk");

  return (
    <header className="a-header">
      <div className="a-header__brand">
        <img className="a-header__logo" src="/icon_dci.png" alt="" width={40} height={40} />
        <span className="a-header__logo-text">{PLATFORM_NAME}</span>
      </div>

      <div className="a-header__right">
        <nav className="a-header__nav" aria-label="主导航">
          {CUSTOMER_NAV.map((item) => {
            const active = isNavItemActive(item, pathname);
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/desk"}
                className={`a-header__nav-link${active ? " is-active" : ""}`}
              >
                {item.label}
              </NavLink>
            );
          })}
          <Link to="/api" className={`a-header__nav-link${apiActive ? " is-active" : ""}`}>
            API管理
          </Link>
          <Link
            to="/help"
            className={`a-header__nav-link${pathname.startsWith("/help") ? " is-active" : ""}`}
          >
            帮助中心
          </Link>
          <Link
            to="/account"
            className={`a-header__nav-link${pathname === "/account" || pathname.startsWith("/account/") ? " is-active" : ""}`}
          >
            机构信息
          </Link>
        </nav>

        <div className="a-header__actions">
          <button type="button" className="a-header__icon-btn a-header__bell" aria-label="通知">
            <IconBell />
            <span className="a-header__badge">3</span>
          </button>

          <div className="a-header__user">
            <button type="button" className="a-header__user-btn" aria-haspopup="menu">
              <span className="a-header__avatar">{userInitial(username)}</span>
              <span className="a-header__user-meta">
                <span className="a-header__user-role" title={username}>
                  {username}
                </span>
              </span>
              <span className="a-header__chevron" aria-hidden>
                ▾
              </span>
            </button>
            <div className="a-header__user-dropdown">
              <div className="a-header__user-menu" role="menu">
                <div className="a-header__user-menu-head">
                  <div className="a-header__user-menu-user">{username}</div>
                  <div className="a-header__user-menu-org">{companyName}</div>
                </div>
                <div className="a-header__user-menu-divider" />
                <a
                  href={PORTAL_LINKS.accountCenter}
                  target="_blank"
                  rel="noreferrer"
                  role="menuitem"
                  className="a-header__user-menu-link"
                >
                  账号中心
                </a>
                {isDciCenter ? (
                  <a
                    href={PORTAL_LINKS.dciRegistryWorkbench}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    className="a-header__user-menu-link"
                  >
                    DCI注册中心工作台
                  </a>
                ) : (
                  <a
                    href={PORTAL_LINKS.applyDciRegistry}
                    target="_blank"
                    rel="noreferrer"
                    role="menuitem"
                    className="a-header__user-menu-link"
                  >
                    申请成为DCI注册中心
                  </a>
                )}
                <Link
                  to="/desk"
                  role="menuitem"
                  className={`a-header__user-menu-link${onTechDesk ? " a-header__user-menu-link--with-note is-current" : ""}`}
                >
                  <span>技术服务中心工作台</span>
                  {onTechDesk ? <span className="a-header__user-menu-note">当前平台</span> : null}
                </Link>
                <div className="a-header__user-menu-divider" />
                <button
                  type="button"
                  role="menuitem"
                  className="a-header__user-menu-item a-header__user-menu-item--logout"
                  onClick={() => setLogoutConfirm(true)}
                >
                  <LogoutIcon />
                  退出登录
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirm}
        title="确认退出登录"
        description="退出后需重新登录才能访问DCI®技术服务中心。确定要退出吗？"
        confirmText="退出登录"
        danger
        onCancel={() => setLogoutConfirm(false)}
        onConfirm={() => {
          setLogoutConfirm(false);
          window.alert("演示环境：已模拟退出登录");
        }}
      />
    </header>
  );
}
