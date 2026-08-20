"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { PLATFORM_NAME } from "@/lib/content";
import { JoinDialog } from "@/components/JoinDialog";
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
  const [joinOpen, setJoinOpen] = useState(false);
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

  const goSection = (sectionId: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (pathname === "/") {
      scrollToHash(sectionId);
      history.replaceState(null, "", `#${sectionId}`);
      return;
    }
    router.push(`/#${sectionId}`);
  };

  return (
    <>
      <header className={`p-nav${scrolled ? " is-scrolled" : ""}`}>
        <div className="p-nav__inner">
          <Link href="/" className="p-nav__logo">
            <span className="p-nav__mark">版</span>
            <span>{PLATFORM_NAME}</span>
          </Link>
          <nav className="p-nav__links" aria-label="主导航">
            <Link href="/">首页</Link>
            <a href="/#verify" onClick={goSection("verify")}>
              版权核验
            </a>
            <a href="/#audit" onClick={goSection("audit")}>
              智能审核服务
            </a>
            <Link href="/help">帮助中心</Link>
          </nav>
          <div className="p-nav__actions">
            {ready && user ? (
              <>
                <button
                  type="button"
                  className="p-nav__platform-entry"
                  title="进入控制台（客户平台后续接入）"
                  onClick={() => {
                    window.alert("客户控制台将在后续模块接入。当前为门户演示登录态。");
                  }}
                >
                  {PLATFORM_NAME}
                </button>
                <div className="p-nav__user" ref={userRef}>
                  <button
                    type="button"
                    className="p-nav__user-btn"
                    onClick={() => setUserMenuOpen((v) => !v)}
                    aria-expanded={userMenuOpen}
                  >
                    {user.displayName}
                  </button>
                  {userMenuOpen ? (
                    <div className="p-nav__user-menu" role="menu">
                      <button
                        type="button"
                        role="menuitem"
                        onClick={() => {
                          setUserMenuOpen(false);
                          logout();
                        }}
                      >
                        退出
                      </button>
                    </div>
                  ) : null}
                </div>
              </>
            ) : (
              <>
                <button type="button" className="p-btn p-btn--outline" style={{ height: 40, padding: "0 20px", fontSize: 14 }} onClick={() => setLoginOpen(true)}>
                  登录
                </button>
                <button type="button" className="p-btn p-btn--cta" style={{ height: 40, padding: "0 20px", fontSize: 14 }} onClick={() => setJoinOpen(true)}>
                  加入
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      <LoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
      <JoinDialog open={joinOpen} onClose={() => setJoinOpen(false)} />
    </>
  );
}
