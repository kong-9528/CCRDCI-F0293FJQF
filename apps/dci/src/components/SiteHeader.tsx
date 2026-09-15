"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { UserMenu } from "@/components/UserMenu";
import { useAuth } from "@/lib/auth";
import { LOGO_BLUE, NAV_ITEMS } from "@/lib/content";

function normalizePath(path: string) {
  if (!path) return "/";
  if (path === "/") return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

function isActive(pathname: string, href: string) {
  return normalizePath(pathname) === normalizePath(href);
}

export function SiteHeader() {
  const pathname = usePathname() || "/";
  const { user, ready } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <header className="d-header">
      <div className="d-container d-header__inner">
        <Link href="/" className="d-header__brand" onClick={() => setOpen(false)}>
          <img src={LOGO_BLUE} alt="DCI" />
        </Link>

        <nav className="d-header__nav" aria-label="主导航">
          {NAV_ITEMS.map((item) =>
            item.external ? (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="d-header__link"
              >
                {item.label}
              </a>
            ) : (
              <Link
                key={item.href}
                href={item.href}
                className={`d-header__link${isActive(pathname, item.href) ? " is-active" : ""}`}
              >
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="d-header__actions">
          {ready && user ? (
            <UserMenu />
          ) : (
            <>
              <Link
                href="/login/"
                className={`d-header__auth-btn${isActive(pathname, "/login/") ? " is-active" : ""}`}
              >
                登录
              </Link>
              <Link
                href="/register/"
                className={`d-header__auth-btn${isActive(pathname, "/register/") ? " is-active" : ""}`}
              >
                注册
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="d-header__menu-btn"
          aria-label={open ? "关闭菜单" : "打开菜单"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      <div className={`d-header__drawer${open ? " is-open" : ""}`}>
        {NAV_ITEMS.map((item) =>
          item.external ? (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
            >
              {item.label}
            </a>
          ) : (
            <Link
              key={item.href}
              href={item.href}
              className={isActive(pathname, item.href) ? "is-active" : undefined}
              onClick={() => setOpen(false)}
            >
              {item.label}
            </Link>
          ),
        )}
        {ready && user ? (
          <div className="d-header__drawer-user">
            <UserMenu onNavigate={() => setOpen(false)} />
          </div>
        ) : (
          <>
            <Link href="/login/" onClick={() => setOpen(false)}>
              登录
            </Link>
            <Link href="/register/" onClick={() => setOpen(false)}>
              注册
            </Link>
          </>
        )}
      </div>
    </header>
  );
}
