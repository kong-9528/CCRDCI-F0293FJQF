"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";

const NAV = [
  { href: "/account/info/", label: "账号信息" },
  { href: "/account/services/", label: "开通管理" },
] as const;

function normalize(path: string) {
  if (!path) return "/";
  return path.endsWith("/") ? path : `${path}/`;
}

export function AccountShell({ children }: { children: ReactNode }) {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { user, ready } = useAuth();
  const current = normalize(pathname);

  useEffect(() => {
    if (ready && !user) router.replace("/login/");
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="d-account">
        <div className="d-account__wrap">
          <p className="d-account__loading">加载中…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-account">
      <div className="d-account__wrap d-account__layout">
        <aside className="d-account__side" aria-label="账号中心导航">
          <div className="d-account__side-title">账号中心</div>
          <nav className="d-account__side-nav">
            {NAV.map((item) => {
              const active =
                current === normalize(item.href) ||
                (item.href === "/account/services/" && current.startsWith("/account/apply/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`d-account__side-link${active ? " is-active" : ""}`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
        <div className="d-account__main">{children}</div>
      </div>
    </div>
  );
}
