import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, ready } = useAuth();
  const location = useLocation();

  if (!ready) {
    return (
      <div className="a-layout" style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <div style={{ textAlign: "center", color: "#4e5969" }}>
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>正在加载登录态</div>
          <div style={{ fontSize: 13 }}>请稍候…</div>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
