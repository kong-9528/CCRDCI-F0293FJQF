import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, ready } = useAuth();
  const location = useLocation();
  if (!ready) {
    return (
      <div className="sso-boot">
        <div className="sso-boot__card">加载中…</div>
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}

export function RequirePerm({
  code,
  children,
}: {
  code: string;
  children: React.ReactNode;
}) {
  const { can } = useAuth();
  if (!can(code)) {
    return (
      <div className="sso-card">
        <div className="sso-empty">无权限访问此功能</div>
      </div>
    );
  }
  return <>{children}</>;
}
