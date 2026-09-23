import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { OpsSidebar } from "@/components/OpsSidebar";
import { OpsHeader } from "@/components/OpsHeader";
import { findNavLabel } from "@/lib/nav";
import { useAuth } from "@/lib/auth";
import { TrademarkText } from "@/lib/trademark";

const PLATFORM_NAME = "DCI®技术服务中心";

export function OpsLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const pageTitle = findNavLabel(location.pathname);
  const { session, ready, booting } = useAuth();

  if (booting || !ready || !session) {
    return (
      <div className="a-layout" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "#4e5969" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
            正在通过 SSO 校验登录态
          </div>
          <div style={{ fontSize: 13 }}>请从统一认证门户进入本系统</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}`}>
      <OpsHeader
        pathname={location.pathname}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        displayName={session.displayName}
      />
      <div className="a-layout__body">
        <OpsSidebar collapsed={collapsed} />
        <div className="a-main">
          <div className="a-breadcrumb" aria-label="面包屑">
            <span className="a-breadcrumb__root">
              <TrademarkText text={PLATFORM_NAME} />
            </span>
            <span className="a-breadcrumb__sep">/</span>
            <span className="a-breadcrumb__current">{pageTitle}</span>
          </div>
          <div className="a-content">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
