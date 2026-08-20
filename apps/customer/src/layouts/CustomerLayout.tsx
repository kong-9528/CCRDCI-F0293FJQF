import { Outlet, useLocation } from "react-router-dom";
import { useState } from "react";
import { CustomerSidebar } from "@/components/CustomerSidebar";
import { CustomerHeader } from "@/components/CustomerHeader";

export function CustomerLayout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className={`a-layout${collapsed ? " is-collapsed" : ""}`}>
      <CustomerSidebar collapsed={collapsed} />
      <div className="a-main">
        <CustomerHeader
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
