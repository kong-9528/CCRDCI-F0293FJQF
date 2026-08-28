import { Outlet, Navigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { CustomerHeader } from "@/components/CustomerHeader";
import { useOnboardingStore } from "@/lib/onboardingStore";

export function CustomerLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { unlocked } = useOnboardingStore();
  const locked = !unlocked;
  const onApply = location.pathname === "/apply" || location.pathname.startsWith("/apply/");

  if (locked && !onApply) {
    return <Navigate to="/apply" replace />;
  }

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}${locked ? " is-locked" : ""}`}>
      <CustomerSidebar collapsed={collapsed} locked={locked} />
      <div className="a-main">
        <CustomerHeader
          pathname={location.pathname}
          collapsed={collapsed}
          locked={locked}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <div className="a-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
