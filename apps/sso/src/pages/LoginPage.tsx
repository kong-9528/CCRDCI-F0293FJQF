import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (ready && user) {
    return <Navigate to={from === "/login" ? "/" : from} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("请输入用户名和密码");
      return;
    }
    setLoading(true);
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    navigate(from === "/login" ? "/" : from, { replace: true });
  };

  return (
    <div className="sso-login">
      <div className="sso-login__bg" aria-hidden>
        <span className="sso-login__mesh" />
        <span className="sso-login__orb sso-login__orb--a" />
        <span className="sso-login__orb sso-login__orb--b" />
      </div>
      <div className="sso-login__panel">
        <div className="sso-login__brand">
          <span className="sso-brand__mark sso-brand__mark--lg" aria-hidden />
          <h1>集团统一身份认证</h1>
          <p>一次登录，安全访问已开通的业务子系统</p>
        </div>
        <form className="sso-login__form" onSubmit={(e) => void onSubmit(e)}>
          <div className="sso-field">
            <label htmlFor="sso-username">用户名</label>
            <input
              id="sso-username"
              className="sso-input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入 SSO 用户名"
            />
          </div>
          <div className="sso-field">
            <label htmlFor="sso-password">密码</label>
            <input
              id="sso-password"
              type="password"
              className="sso-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          {error ? <div className="sso-error">{error}</div> : null}
          <button type="submit" className="sso-btn sso-btn--primary sso-btn--block" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </button>
          <p className="sso-login__hint">
            演示账号：admin / admin123（管理员）；zhangsan / demo123456（员工）
          </p>
        </form>
      </div>
    </div>
  );
}
