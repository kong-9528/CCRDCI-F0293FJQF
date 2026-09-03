import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconBell } from "@/components/icons/UiIcons";
import { PLATFORM_NAME } from "@/lib/catalog";
import { CUSTOMER_NAV, isNavItemActive } from "@/lib/nav";
import { EXTERNAL_LOGIN_ACCOUNT, demoResetOnboarding, useOnboardingStore } from "@/lib/onboardingStore";
import { MOCK_TENANT } from "@/lib/tenant";

type Props = {
  pathname: string;
  locked?: boolean;
};

function tenantInitial(name: string) {
  const t = name.trim();
  return t ? t.slice(0, 1) : "企";
}

export function CustomerHeader({ pathname, locked }: Props) {
  const navigate = useNavigate();
  const [logoutConfirm, setLogoutConfirm] = useState(false);
  const { unlocked } = useOnboardingStore();
  const displayName = locked ? EXTERNAL_LOGIN_ACCOUNT : MOCK_TENANT.companyName;
  const roleLabel = locked ? "申请人" : "企业用户";

  return (
    <header className="a-header">
      <div className="a-header__brand">
        <img className="a-header__logo" src="/icon_dci.png" alt="" width={40} height={40} />
        <span className="a-header__logo-text">{PLATFORM_NAME}</span>
      </div>

      <div className="a-header__right">
        <nav className="a-header__nav" aria-label="主导航">
          {locked ? (
            <NavLink
              to="/apply"
              end
              className={({ isActive }) => `a-header__nav-link${isActive ? " is-active" : ""}`}
            >
              入驻申请
            </NavLink>
          ) : (
            <>
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
              <Link
                to="/api-docs"
                className={`a-header__nav-link${pathname.startsWith("/api-docs") ? " is-active" : ""}`}
              >
                API文档
              </Link>
              <Link
                to="/help"
                className={`a-header__nav-link${pathname.startsWith("/help") ? " is-active" : ""}`}
              >
                帮助中心
              </Link>
            </>
          )}
        </nav>

        <div className="a-header__actions">
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
                {!locked ? (
                  <>
                    <Link to="/account" role="menuitem" className="a-header__user-menu-link">
                      账号中心
                    </Link>
                    <Link to="/account/password" role="menuitem" className="a-header__user-menu-link">
                      修改密码
                    </Link>
                    <Link to="/keys" role="menuitem" className="a-header__user-menu-link">
                      API Keys
                    </Link>
                    {unlocked ? (
                      <button
                        type="button"
                        role="menuitem"
                        className="a-header__user-menu-item"
                        onClick={() => {
                          demoResetOnboarding();
                          navigate("/apply");
                        }}
                      >
                        演示：模拟未入驻
                      </button>
                    ) : null}
                    <div className="a-header__user-menu-divider" />
                  </>
                ) : null}
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
