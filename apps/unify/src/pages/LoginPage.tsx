import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";

export function LoginPage() {
  const { session, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from || "/";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (ready && session) {
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
    <div className="un-login">
      <div className="un-login__bg" aria-hidden />
      <div className="un-login__panel">
        <div className="un-login__brand">
          <h1>统一后台管理系统</h1>
          {/* <p>智能辅助审核安全风险监控</p> */}
        </div>
        <form className="un-login__form" onSubmit={(e) => void onSubmit(e)}>
          <div className="a-field a-field--stack">
            <span className="a-field__label">用户名</span>
            <input
              className="a-input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              placeholder="请输入用户名"
            />
          </div>
          <div className="a-field a-field--stack">
            <span className="a-field__label">密码</span>
            <input
              className="a-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="请输入密码"
            />
          </div>
          {error ? <p className="un-login__error">{error}</p> : null}
          <button type="submit" className="a-btn a-btn--primary" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
        <p className="un-login__hint">演示账号 admin / admin123 · 后续可接入 SSO 子系统</p>
      </div>
    </div>
  );
}
