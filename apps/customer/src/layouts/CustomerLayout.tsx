import { Outlet, useLocation } from "react-router-dom";
import { CustomerHeader } from "@/components/CustomerHeader";

export function CustomerLayout() {
  const { pathname } = useLocation();

  return (
    <div className="a-layout a-layout--topnav">
      <CustomerHeader pathname={pathname} />
      <div className="a-layout__body">
        <div className="a-main">
          {/* 对齐 DCI管理中心：内容区 max-width:1400 + 左右 padding:24 */}
          <div className="a-main__shell">
            <div className="a-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
