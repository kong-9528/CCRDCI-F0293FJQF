import { useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { IconBell, IconFullscreen, IconSidebarToggle } from "@/components/icons/UiIcons";

type Props = {
  pathname?: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

const PLATFORM_NAME = "DCI®技术服务中心";

export function OpsHeader({ collapsed, onToggleCollapse }: Props) {
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      void document.documentElement.requestFullscreen?.();
    } else {
      void document.exitFullscreen?.();
    }
  };

  return (
    <header className="a-header">
      <div className="a-header__brand">
        <img className="a-header__logo" src="/icon_dci.png" alt="" width={40} height={40} />
        <span className="a-header__logo-text">{PLATFORM_NAME}</span>
        <button
          type="button"
          className="a-header__icon-btn"
          aria-label={collapsed ? "展开侧栏" : "收起侧栏"}
          onClick={onToggleCollapse}
        >
          <IconSidebarToggle />
        </button>
      </div>

      <div className="a-header__actions">
        <button type="button" className="a-header__icon-btn" aria-label="全屏" onClick={toggleFullscreen}>
          <IconFullscreen />
        </button>
        <button type="button" className="a-header__icon-btn a-header__bell" aria-label="通知">
          <IconBell />
          <span className="a-header__badge">3</span>
        </button>

        <div className="a-header__user">
          <button type="button" className="a-header__user-btn" aria-haspopup="menu">
            <span className="a-header__avatar">运</span>
            <span className="a-header__user-meta">
              <span className="a-header__user-role">运营管理员</span>
            </span>
            <span className="a-header__chevron" aria-hidden>
              ▾
            </span>
          </button>
          <div className="a-header__user-dropdown">
            <div className="a-header__user-menu" role="menu">
              <div className="a-header__user-menu-name">运营管理员</div>
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
