import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconBell, IconEnterprise } from "@/components/icons/UiIcons";
import { PLATFORM_NAME } from "@/lib/catalog";
import { CUSTOMER_NAV, isNavItemActive } from "@/lib/nav";
import { MOCK_TENANT } from "@/lib/tenant";

type Props = {
  pathname: string;
};

function tenantInitial(name: string) {
  const t = name.trim();
  return t ? t.slice(0, 1) : "企";
}

export function CustomerHeader({ pathname }: Props) {
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const displayName = MOCK_TENANT.companyName;
  const roleLabel = "企业用户";
  const apiActive = pathname === "/api" || pathname.startsWith("/api/");

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
        </nav>

        <div className="a-header__actions">
          <Link
            to="/account"
            className={`a-header__icon-btn${pathname === "/account" || pathname.startsWith("/account/") ? " is-active" : ""}`}
            aria-label="机构信息"
            title="机构信息"
          >
            <IconEnterprise size={20} />
          </Link>
          <button type="button" className="a-header__icon-btn a-header__bell" aria-label="通知">
            <IconBell />
            <span className="a-header__badge">3</span>
          </button>

          <div className="a-header__user">
            <button type="button" className="a-header__user-btn" aria-haspopup="menu">
              <span className="a-header__avatar">{tenantInitial(displayName)}</span>
              <span className="a-header__user-meta">
                <span className="a-header__user-role">{roleLabel}</span>
              </span>
              <span className="a-header__chevron" aria-hidden>
                ▾
              </span>
            </button>
            <div className="a-header__user-dropdown">
              <div className="a-header__user-menu" role="menu">
                <div className="a-header__user-menu-name">{displayName}</div>
                <button
                  type="button"
                  role="menuitem"
                  className="a-header__user-menu-item"
                  onClick={() => setLogoutConfirm(true)}
                >
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
