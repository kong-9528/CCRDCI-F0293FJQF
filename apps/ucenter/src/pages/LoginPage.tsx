import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth";
import { resolveReturnUrl, withReturnUrl } from "@/lib/redirect";

type LoginMode = "password" | "sms";

export function LoginPage() {
  const { login, loginWithSms, sendLoginSms } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const returnUrl = resolveReturnUrl(location.search);

  const [mode, setMode] = useState<LoginMode>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const finishOk = () => {
    window.location.assign(returnUrl);
  };

  const onSendSms = async () => {
    setError("");
    setInfo("");
    const result = await sendLoginSms(phone);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setInfo(result.message);
    setCooldown(60);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    setLoading(true);
    const result =
      mode === "password" ? await login(username, password) : await loginWithSms(phone, smsCode);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    finishOk();
  };

  return (
    <AuthLayout
      title="登录"
      subtitle="使用统一账号访问门户与业务系统"
      footer={
        <>
          <Link to={withReturnUrl("/forgot-password", location.search)}>忘记密码</Link>
          <span className="uc-dot">·</span>
          <Link to={withReturnUrl("/register", location.search)}>注册账号</Link>
        </>
      }
    >
      <div className="uc-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "password"}
          className={`uc-tabs__item${mode === "password" ? " is-active" : ""}`}
          onClick={() => {
            setMode("password");
            setError("");
            setInfo("");
          }}
        >
          密码登录
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "sms"}
          className={`uc-tabs__item${mode === "sms" ? " is-active" : ""}`}
          onClick={() => {
            setMode("sms");
            setError("");
            setInfo("");
          }}
        >
          短信登录
        </button>
      </div>

      <form className="uc-form" onSubmit={(e) => void onSubmit(e)}>
        {mode === "password" ? (
          <>
            <div className="uc-field">
              <label htmlFor="uc-login-user">用户名</label>
              <input
                id="uc-login-user"
                className="uc-input"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="请输入用户名"
              />
            </div>
            <div className="uc-field">
              <label htmlFor="uc-login-pwd">密码</label>
              <input
                id="uc-login-pwd"
                type="password"
                className="uc-input"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="请输入密码"
              />
            </div>
          </>
        ) : (
          <>
            <div className="uc-field">
              <label htmlFor="uc-login-phone">手机号</label>
              <input
                id="uc-login-phone"
                className="uc-input"
                inputMode="tel"
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="请输入绑定手机号"
              />
            </div>
            <div className="uc-field">
              <label htmlFor="uc-login-sms">短信验证码</label>
              <div className="uc-input-row">
                <input
                  id="uc-login-sms"
                  className="uc-input"
                  inputMode="numeric"
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value)}
                  placeholder="6 位验证码"
                />
                <button
                  type="button"
                  className="uc-btn uc-btn--ghost"
                  disabled={cooldown > 0}
                  onClick={() => void onSendSms()}
                >
                  {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                </button>
              </div>
            </div>
          </>
        )}

        {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
        {info ? <div className="uc-alert uc-alert--info">{info}</div> : null}

        <button type="submit" className="uc-btn uc-btn--primary uc-btn--block" disabled={loading}>
          {loading ? "登录中…" : "登录"}
        </button>
        <p className="uc-hint">演示账号：demo / demo123456；短信验证码固定 123456</p>
        <button type="button" className="uc-linkish" onClick={() => navigate("/")}>
          已登录可进入安全设置
        </button>
      </form>
    </AuthLayout>
  );
}
