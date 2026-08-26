import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { findNavLabel } from "@/lib/nav";

type Props = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function OpsHeader({ pathname, collapsed, onToggleCollapse }: Props) {
  const title = findNavLabel(pathname);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  return (
    <header className="a-header">
      <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onToggleCollapse}>
        {collapsed ? "»" : "«"}
      </button>
      <div className="a-header__crumb">
        运营后台 / <b>{title}</b>
      </div>
      <div className="a-header__actions">
        <div className="a-header__user">
          <button type="button" className="a-header__user-btn" aria-haspopup="menu">
            <span className="a-header__avatar">运</span>
            <span>运营管理员</span>
            <span className="a-header__chevron" aria-hidden>
              ▾
            </span>
          </button>
          <div className="a-header__user-dropdown">
            <div className="a-header__user-menu" role="menu">
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
        description="退出后需重新登录才能继续使用运营后台。"
        confirmText="退出"
        danger
        onCancel={() => setLogoutConfirm(false)}
        onConfirm={() => {
          setLogoutConfirm(false);
          window.location.reload();
        }}
      />
    </header>
  );
}
