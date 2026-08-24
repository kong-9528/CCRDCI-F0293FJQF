import { useEffect, useRef, useState } from "react";
import { ConfirmDialog } from "@/components/ConfirmDialog";
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
  const userRef = useRef<HTMLDivElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  useEffect(() => {
    if (!menuOpen) return;

    const onPointerDown = (e: MouseEvent) => {
      if (!userRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [menuOpen]);

  return (
    <header className="a-header">
      <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onToggleCollapse}>
        {collapsed ? "»" : "«"}
      </button>
      <div className="a-header__crumb">
        控制台 / <b>{title}</b>
      </div>
      <div className="a-header__actions">
        <div className="a-header__user" ref={userRef}>
          <button
            type="button"
            className={`a-header__user-btn${menuOpen ? " is-open" : ""}`}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span className="a-header__avatar">{tenantInitial(MOCK_TENANT.companyName)}</span>
            <span>{MOCK_TENANT.companyName}</span>
            <span className="a-header__chevron" aria-hidden>
              ▾
            </span>
          </button>
          {menuOpen ? (
            <div className="a-header__user-menu" role="menu">
              <button
                type="button"
                role="menuitem"
                className="a-header__user-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  setLogoutConfirm(true);
                }}
              >
                退出登录
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <ConfirmDialog
        open={logoutConfirm}
        title="确认退出登录"
        description="退出后需重新登录才能访问控制台。确定要退出吗？"
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
