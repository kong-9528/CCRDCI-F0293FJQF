"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth, buildUserMenuItems } from "@/lib/auth";

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

type Props = {
  onNavigate?: () => void;
};

export function UserMenu({ onNavigate }: Props) {
  const pathname = usePathname() || "";
  const { user, logout } = useAuth();

  if (!user) return null;

  const items = buildUserMenuItems(user, pathname);
  const initial = user.username.trim().slice(0, 1).toUpperCase() || "U";

  const onLogout = () => {
    logout();
    onNavigate?.();
  };

  return (
    <div className="d-user-menu">
      <button type="button" className="d-user-menu__trigger" aria-haspopup="menu">
        <span className="d-user-menu__avatar" aria-hidden>
          {initial}
        </span>
        <span className="d-user-menu__name" title={user.username}>
          {user.username}
        </span>
        <span className="d-user-menu__chevron" aria-hidden>
          ▾
        </span>
      </button>

      <div className="d-user-menu__dropdown">
        <div className="d-user-menu__panel" role="menu">
          <div className="d-user-menu__head">
            <div className="d-user-menu__user">{user.username}</div>
            {user.orgName ? <div className="d-user-menu__org">{user.orgName}</div> : null}
          </div>

          <div className="d-user-menu__divider" />

          {items.map((item) => {
            const className = [
              "d-user-menu__link",
              item.badge ? "d-user-menu__link--with-note" : "",
              item.current ? "is-current" : "",
            ]
              .filter(Boolean)
              .join(" ");

            const body = (
              <>
                <span>{item.label}</span>
                {item.badge ? <span className="d-user-menu__note">{item.badge}</span> : null}
              </>
            );

            if (item.external) {
              return (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  role="menuitem"
                  className={className}
                  onClick={() => onNavigate?.()}
                >
                  {body}
                </a>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                role="menuitem"
                className={className}
                onClick={() => onNavigate?.()}
              >
                {body}
              </Link>
            );
          })}

          <div className="d-user-menu__divider" />

          <button
            type="button"
            role="menuitem"
            className="d-user-menu__item d-user-menu__item--logout"
            onClick={onLogout}
          >
            <LogoutIcon />
            退出登录
          </button>
        </div>
      </div>
    </div>
  );
}
