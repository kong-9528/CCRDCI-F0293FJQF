import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { CustomerHeader } from "@/components/CustomerHeader";
import { findNavLabel } from "@/lib/nav";
import { PLATFORM_NAME } from "@/lib/catalog";
import { useOnboardingStore } from "@/lib/onboardingStore";

export function CustomerLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { unlocked } = useOnboardingStore();
  const locked = !unlocked;
  const onApply = location.pathname === "/apply" || location.pathname.startsWith("/apply/");
  const pageTitle = findNavLabel(location.pathname);

  if (locked && !onApply) {
    return <Navigate to="/apply" replace />;
  }

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}${locked ? " is-locked" : ""}`}>
      <CustomerHeader
        pathname={location.pathname}
        collapsed={collapsed}
        locked={locked}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div className="a-layout__body">
        <CustomerSidebar collapsed={collapsed} locked={locked} />
        <div className="a-main">
          <div className="a-breadcrumb" aria-label="面包屑">
            <span className="a-breadcrumb__root">{PLATFORM_NAME}</span>
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
