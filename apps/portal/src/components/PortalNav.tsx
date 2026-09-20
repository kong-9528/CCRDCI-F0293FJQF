"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PLATFORM_NAME } from "@/lib/content";
import { LoginModal } from "@/components/LoginModal";

function scrollToHash(hash: string) {
  const id = hash.replace(/^#/, "");
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function PortalNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, ready } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!userRef.current?.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    const hash = window.location.hash;
    if (hash) {
      requestAnimationFrame(() => scrollToHash(hash));
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") {
      setLoginOpen(true);
      params.delete("login");
      const qs = params.toString();
      const next = `${pathname}${qs ? `?${qs}` : ""}${window.location.hash}`;
      window.history.replaceState(null, "", next || pathname);
    }
  }, [pathname]);

  const goSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      scrollToHash(sectionId);
      history.replaceState(null, "", `#${sectionId}`);
      return;
    }
    router.push(`/#${sectionId}`);
  };

  const initial = user?.displayName?.slice(0, 1).toUpperCase() ?? "U";

  return (
    <>
      <header className={`p-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="p-nav__inner">
          <Link href="/" className="p-nav__logo">
            {PLATFORM_NAME}
          </Link>
          <nav className="p-nav__links" aria-label="主导航">
            <Link href="/">首页</Link>
            <Link href="/verify">版权核验</Link>
            <Link href="/audit">智能辅助审核</Link>
            <Link href="/analytics">行业分析报告</Link>
            <Link href="/guide">接入指南</Link>
            <Link href="/faq">常见问题</Link>
          </nav>
          <div className="p-nav__actions">
            {ready && user ? (
              <>
                <a
                  className="p-nav__console"
                  href={process.env.NEXT_PUBLIC_CUSTOMER_URL ?? "http://localhost:3002"}
                  title={`进入${PLATFORM_NAME}`}
                >
                  <span className="p-nav__console-icon" aria-hidden>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect x="1.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="9.5" y="2.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="1.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                      <rect x="9.5" y="8.5" width="5" height="5" rx="1.2" stroke="currentColor" strokeWidth="1.4" />
                    </svg>
                  </span>
                  <span className="p-nav__console-text">进入{PLATFORM_NAME}</span>
                </a>
                <div className="p-nav__user" ref={userRef}>
                  <button
                    type="button"
                    className={`p-nav__account${userMenuOpen ? " is-open" : ""}`}
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                  >
                    <span className="p-nav__avatar" aria-hidden>
                      {initial}
                    </span>
                    <span className="p-nav__account-name">{user.displayName}</span>
                    <span className="p-nav__chevron" aria-hidden>
                      ▾
                    </span>
                  </button>
                  {userMenuOpen ? (
                    <div className="p-nav__user-menu" role="menu">
                      <div className="p-nav__user-meta">
                        <span className="p-nav__avatar p-nav__avatar--lg" aria-hidden>
                          {initial}
                        </span>
                        <div>
                          <div className="p-nav__user-meta-name">{user.displayName}</div>
                          <div className="p-nav__user-meta-role">企业账号</div>
                        </div>
                      </div>
                      <Link
                        href="/account/phone"
                        role="menuitem"
                        className="p-nav__user-menu-item"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        换绑手机号
                      </Link>
                      <button
                        type="button"
                        role="menuitem"
                        className="p-nav__user-menu-item is-danger"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                      >
                        退出登录
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <div className="p-nav__auth">
                <button
                  type="button"
                  className="p-btn p-btn--outline"
                  style={{ height: 40, padding: "0 18px", fontSize: 14 }}
                  onClick={() => setLoginOpen(true)}
                >
                  登录
                </button>
                <Link
                  href="/register"
                  className="p-btn p-btn--primary"
                  style={{ height: 40, padding: "0 18px", fontSize: 14, display: "inline-flex", alignItems: "center" }}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </>
  );
}
