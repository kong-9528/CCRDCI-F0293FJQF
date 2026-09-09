import { useState } from "react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { listUsers } from "@/lib/rbacStore";
import { isAllowedReturnUrl, redirectWithSsoTicket } from "@/lib/ssoEntry";

export function LoginPage() {
  const { user, ready, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get("return_url") || "";
  const from = (location.state as { from?: string } | null)?.from || "/home";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const homeTarget = (target: string) =>
    target === "/login" || target === "/" ? "/home" : target;

  if (ready && user) {
    if (returnUrl && isAllowedReturnUrl(returnUrl)) {
      redirectWithSsoTicket(returnUrl, user);
      return (
        <div className="sso-login">
          <div className="sso-login__panel">
            <p className="sso-login__hint">正在进入业务系统…</p>
          </div>
        </div>
      );
    }
    return <Navigate to={homeTarget(from)} replace />;
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

    if (returnUrl && isAllowedReturnUrl(returnUrl)) {
      const matched = listUsers().find((u) => u.username === username.trim());
      if (matched) {
        redirectWithSsoTicket(returnUrl, matched);
        return;
      }
    }
    navigate(homeTarget(from), { replace: true });
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
          <h1>用户统一认证系统</h1>
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
              placeholder="请输入用户名"
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
            演示：admin / admin123（超管）；wang_editor / demo123456（运营专员）
            {returnUrl ? " · 登录后将返回业务系统" : ""}
          </p>
        </form>
      </div>
    </div>
  );
}
