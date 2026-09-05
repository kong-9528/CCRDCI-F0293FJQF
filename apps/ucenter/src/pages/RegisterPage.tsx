import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth";
import {
  isPhoneTaken,
  isUsernameTaken,
  isValidMobile,
  isValidPassword,
  isValidUsername,
  registerAccount,
  sendSmsCode,
  verifySmsCode,
} from "@/lib/accountStore";
import { resolveReturnUrl, withReturnUrl } from "@/lib/redirect";

export function RegisterPage() {
  const { loginAfterRegister } = useAuth();
  const location = useLocation();
  const returnUrl = resolveReturnUrl(location.search);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const onSendSms = () => {
    setError("");
    setInfo("");
    if (!isValidMobile(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (isPhoneTaken(phone)) {
      setError("该手机号已注册");
      return;
    }
    const result = sendSmsCode(phone, "register");
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setInfo(result.message);
    setCooldown(60);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isValidUsername(username)) {
      setError("用户名须为 4–20 位，字母开头，仅含字母数字下划线");
      return;
    }
    if (isUsernameTaken(username)) {
      setError("用户名已被占用");
      return;
    }
    if (!isValidPassword(password)) {
      setError("密码须为 8–12 位");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    if (!isValidMobile(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (!agreed) {
      setError("请先同意用户协议");
      return;
    }

    const sms = verifySmsCode(phone, smsCode, "register");
    if (!sms.ok) {
      setError(sms.message);
      return;
    }

    setLoading(true);
    const result = registerAccount({ username, password, phone });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    loginAfterRegister(result.account);
    window.location.assign(returnUrl);
  };

  return (
    <AuthLayout
      title="注册账号"
      subtitle="用户名、密码、手机号与短信验证码完成注册"
      footer={
        <>
          已有账号？
          <Link to={withReturnUrl("/login", location.search)}>去登录</Link>
        </>
      }
    >
      <form className="uc-form" onSubmit={onSubmit}>
        <div className="uc-field">
          <label htmlFor="uc-reg-user">用户名</label>
          <input
            id="uc-reg-user"
            className="uc-input"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="字母开头，4–20 位"
          />
        </div>
        <div className="uc-field">
          <label htmlFor="uc-reg-pwd">密码</label>
          <input
            id="uc-reg-pwd"
            type="password"
            className="uc-input"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="8–12 位"
          />
        </div>
        <div className="uc-field">
          <label htmlFor="uc-reg-confirm">确认密码</label>
          <input
            id="uc-reg-confirm"
            type="password"
            className="uc-input"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="再次输入密码"
          />
        </div>
        <div className="uc-field">
          <label htmlFor="uc-reg-phone">手机号</label>
          <input
            id="uc-reg-phone"
            className="uc-input"
            inputMode="tel"
            autoComplete="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="用于验明正身与找回密码"
          />
        </div>
        <div className="uc-field">
          <label htmlFor="uc-reg-sms">短信验证码</label>
          <div className="uc-input-row">
            <input
              id="uc-reg-sms"
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
              onClick={onSendSms}
            >
              {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
            </button>
          </div>
        </div>

        <label className="uc-check">
          <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
          <span>
            我已阅读并同意 <a href="#">《用户服务协议》</a> 与 <a href="#">《隐私政策》</a>
          </span>
        </label>

        {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
        {info ? <div className="uc-alert uc-alert--info">{info}</div> : null}

        <button type="submit" className="uc-btn uc-btn--primary uc-btn--block" disabled={loading}>
          {loading ? "注册中…" : "注册并登录"}
        </button>
      </form>
    </AuthLayout>
  );
}
