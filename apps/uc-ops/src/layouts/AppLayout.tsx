import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { useAuth } from "@/lib/auth";
import { findNavLabel } from "@/lib/nav";

export function AppLayout() {
  const { session, ready, booting, logout, reenter } = useAuth();
  const location = useLocation();

  if (booting || (!ready && !session)) {
    return (
      <div className="uo-boot">
        <div className="uo-boot__card">
          <div className="uo-boot__spinner" aria-hidden />
          <div className="uo-boot__title">正在通过 SSO 校验登录态</div>
          <div className="uo-boot__hint">演示环境 · 不探测真实 SSO 服务</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="uo-boot">
        <div className="uo-boot__card">
          <div className="uo-boot__title">已退出演示会话</div>
          <div className="uo-boot__hint">前端演示可直接重新进入，无需 SSO 服务在线</div>
          <button type="button" className="a-btn a-btn--primary" onClick={reenter}>
            重新进入
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="a-layout uo-layout">
      <Sidebar />
      <div className="a-main">
        <header className="uo-topbar">
          <div className="uo-topbar__crumb">
            <span>用户中心运营</span>
            <span className="uo-topbar__sep">/</span>
            <strong>{findNavLabel(location.pathname)}</strong>
          </div>
          <div className="uo-topbar__user">
            <span>
              {session.displayName}
              <em>
                {session.username}
                {session.source === "demo" ? " · 演示会话" : " · SSO"}
              </em>
            </span>
            <button type="button" className="a-btn a-btn--sm" onClick={logout}>
              退出
            </button>
          </div>
        </header>
        <div className="a-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
