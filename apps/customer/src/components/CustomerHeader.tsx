import { useState } from "react";
import { Link } from "react-router-dom";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { PLATFORM_NAME } from "@/lib/catalog";
import { findNavLabel } from "@/lib/nav";
import { MOCK_TENANT } from "@/lib/tenant";

type Props = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

function tenantInitial(name: string) {
  const t = name.trim();
  return t ? t.slice(0, 1) : "企";
}

export function CustomerHeader({ pathname, collapsed, onToggleCollapse }: Props) {
  const title = findNavLabel(pathname);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  return (
    <header className="a-header">
      <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onToggleCollapse}>
        {collapsed ? "»" : "«"}
      </button>
      <div className="a-header__crumb">
        {PLATFORM_NAME} / <b>{title}</b>
      </div>
      <div className="a-header__actions">
        <div className="a-header__text-links">
          <Link
            to="/api-docs"
            className={`a-header__text-link${pathname.startsWith("/api-docs") ? " is-active" : ""}`}
          >
            API文档
          </Link>
          <Link
            to="/help"
            className={`a-header__text-link${pathname.startsWith("/help") ? " is-active" : ""}`}
          >
            帮助中心
          </Link>
        </div>
        <div className="a-header__user">
          <button
            type="button"
            className="a-header__user-btn"
            aria-haspopup="menu"
          >
            <span className="a-header__avatar">{tenantInitial(MOCK_TENANT.companyName)}</span>
            <span>{MOCK_TENANT.companyName}</span>
            <span className="a-header__chevron" aria-hidden>
              ▾
            </span>
          </button>
          <div className="a-header__user-dropdown">
            <div className="a-header__user-menu" role="menu">
              <Link to="/account" role="menuitem" className="a-header__user-menu-link">
                账号中心
              </Link>
              <Link to="/account/password" role="menuitem" className="a-header__user-menu-link">
                修改密码
              </Link>
              <Link to="/keys" role="menuitem" className="a-header__user-menu-link">
                API Keys
              </Link>
              <div className="a-header__user-menu-divider" />
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

      <ConfirmDialog
        open={logoutConfirm}
        title="确认退出登录"
        description="退出后需重新登录才能访问工作台。确定要退出吗？"
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
