import { Link, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth";

export function SecurityHomePage() {
  const { user, ready, logout } = useAuth();

  if (ready && !user) {
    return <Navigate to="/login?returnUrl=/security" replace />;
  }

  return (
    <AuthLayout
      title="账号安全"
      subtitle={user ? `${user.username} · ${user.phone}` : undefined}
      footer={
        <button type="button" className="uc-linkish" onClick={logout}>
          退出登录
        </button>
      }
    >
      <nav className="uc-nav-list">
        <Link to="/security/password" className="uc-nav-list__item">
          修改密码
        </Link>
        <Link to="/security/phone" className="uc-nav-list__item">
          换绑手机号
        </Link>
      </nav>
    </AuthLayout>
  );
}
