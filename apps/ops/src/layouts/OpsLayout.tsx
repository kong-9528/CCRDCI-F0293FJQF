import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { OpsSidebar } from "@/components/OpsSidebar";
import { OpsHeader } from "@/components/OpsHeader";

export function OpsLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}`}>
      <OpsSidebar collapsed={collapsed} />
      <div className="a-main">
        <OpsHeader
          pathname={location.pathname}
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((v) => !v)}
        />
        <div className="a-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
