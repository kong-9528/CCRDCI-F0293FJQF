import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { UnifyHeader } from "@/components/UnifyHeader";
import { useAuth } from "@/lib/auth";
import { findNavLabel } from "@/lib/nav";

const PLATFORM_NAME = "Unify 智能辅助审核";

export function AppLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const pageTitle = findNavLabel(location.pathname);
  const { session } = useAuth();

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}`}>
      <UnifyHeader
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        displayName={session?.displayName}
      />
      <div className="a-layout__body">
        <Sidebar collapsed={collapsed} />
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
