"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { CUSTOMER_CONSOLE_URL, hasRegistryWorkbench, hasTechWorkbench, useAuth } from "@/lib/auth";

export default function RegistryDashboardPage() {
  const router = useRouter();
  const { user, ready } = useAuth();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace("/login/");
      return;
    }
    if (!hasRegistryWorkbench(user)) {
      router.replace("/account/services/");
    }
  }, [ready, user, router]);

  if (!ready || !user || !hasRegistryWorkbench(user)) {
    return (
      <div className="d-section">
        <div className="d-container">
          <p style={{ color: "var(--d-muted)" }}>加载中…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="d-section">
      <div className="d-container" style={{ maxWidth: 800 }}>
        <h1 className="d-section__title">DCI注册中心工作台</h1>
        <p className="d-section__desc">
          当前账号「{user.username}」已开通 DCI 注册中心能力。完整控制台能力可在后续版本接入；技术服务能力请进入 customer
          工作台。
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginTop: 20 }}>
          <Link href="/account/info/" className="d-btn d-btn--ghost">
            返回账号中心
          </Link>
          {hasTechWorkbench(user) ? (
            <a href={CUSTOMER_CONSOLE_URL} target="_blank" rel="noopener noreferrer" className="d-btn">
              打开技术服务中心工作台
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
