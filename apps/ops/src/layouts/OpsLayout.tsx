import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { OpsSidebar } from "@/components/OpsSidebar";
import { OpsHeader } from "@/components/OpsHeader";
import { findNavLabel } from "@/lib/nav";

const PLATFORM_NAME = "DCI®技术服务中心";

export function OpsLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const pageTitle = findNavLabel(location.pathname);

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}`}>
      <OpsHeader
        pathname={location.pathname}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
      />
      <div className="a-layout__body">
        <OpsSidebar collapsed={collapsed} />
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
