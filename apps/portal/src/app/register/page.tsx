"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CaptchaField, useCaptchaGate } from "@/components/CaptchaField";
import { useAuth } from "@/lib/auth";
import {
  isPhoneTaken,
  isUsernameTaken,
  isValidMobile,
  isValidRegisterPassword,
  isValidUsername,
  registerAccount,
  sendSmsCode,
  verifySmsCode,
} from "@/lib/accountStore";

function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M5 19.5c1.8-3.2 4.2-4.8 7-4.8s5.2 1.6 7 4.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M8 10V7a4 4 0 0 1 8 0v3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M8 3.5h8A2.5 2.5 0 0 1 18.5 6v12a2.5 2.5 0 0 1-2.5 2.5H8A2.5 2.5 0 0 1 5.5 18V6A2.5 2.5 0 0 1 8 3.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M10 18.5h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

function IconEye({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 4l16 16M9.9 9.9A3.2 3.2 0 0 0 12 15.2c.6 0 1.1-.15 1.6-.4M6.1 6.3C4.2 7.5 2.8 9.1 2 12c1.6 5 5.4 7.5 10 7.5 1.8 0 3.5-.4 5-.1M10.6 5.2A10 10 0 0 1 12 5c4.6 0 8.4 2.5 10 7.5-.4 1.2-1 2.3-1.7 3.2"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2 12c1.6-5 5.4-7.5 10-7.5S20.4 7 22 12c-1.6 5-5.4 7.5-10 7.5S3.6 17 2 12Z"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="12" cy="12" r="3.2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  );
}

export default function RegisterPage() {
  const router = useRouter();
  const { loginAfterRegister } = useAuth();
  const { captcha, setCaptcha, captchaOk, setCaptchaOk } = useCaptchaGate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!captchaOk) {
      setError("请先完成图形验证码");
      return;
    }
    if (!isValidMobile(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (isPhoneTaken(phone)) {
      setError("该手机号已被注册");
      return;
    }
    const result = sendSmsCode(phone, "register");
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCooldown(60);
    setInfo(`验证码已发送（演示验证码：${result.demoCode}）`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!isValidUsername(username)) {
      setError("账号名须字母开头，仅含字母/数字/下划线，长度 4–20");
      return;
    }
    if (isUsernameTaken(username)) {
      setError("账号名已被占用");
      return;
    }
    if (!isValidRegisterPassword(password)) {
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
    if (!captchaOk) {
      setError("请先完成图形验证码");
      return;
    }
    const sms = verifySmsCode(phone, smsCode, "register");
    if (!sms.ok) {
      setError(sms.message);
      return;
    }
    if (!agreed) {
      setError("请先阅读并勾选用户协议与隐私协议");
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 320));
    const result = registerAccount({ username, password, phone });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    loginAfterRegister(result.account);
    router.push("/");
  };

  return (
    <div className="p-page p-page--register">
      <div className="p-container">
        <div className="p-auth-card p-auth-card--register">
          <header className="p-reg__head">
            <h1 className="p-reg__title">
              注册<span>账号</span>
            </h1>
          </header>

          <form className="p-reg__form" onSubmit={(e) => void onSubmit(e)}>
            <div className="p-field">
              <label htmlFor="reg-username">
                账号名 <span className="p-req">*</span>
              </label>
              <div className="p-input-icon">
                <span className="p-input-icon__lead">
                  <IconUser />
                </span>
                <input
                  id="reg-username"
                  className="p-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入账号名"
                  autoComplete="username"
                />
              </div>
              <p className="p-reg__tip">字母开头，4–20 位，仅含字母 / 数字 / 下划线</p>
            </div>

            <div className="p-field">
              <label htmlFor="reg-password">
                密码 <span className="p-req">*</span>
              </label>
              <div className="p-input-icon">
                <span className="p-input-icon__lead">
                  <IconLock />
                </span>
                <input
                  id="reg-password"
                  className="p-input"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入8-12位密码"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="p-input-icon__trail"
                  onClick={() => setShowPwd((v) => !v)}
                  aria-label={showPwd ? "隐藏密码" : "显示密码"}
                >
                  <IconEye off={showPwd} />
                </button>
              </div>
            </div>

            <div className="p-field">
              <label htmlFor="reg-confirm">
                确认密码 <span className="p-req">*</span>
              </label>
              <div className="p-input-icon">
                <span className="p-input-icon__lead">
                  <IconLock />
                </span>
                <input
                  id="reg-confirm"
                  className="p-input"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="请再次输入密码"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="p-input-icon__trail"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? "隐藏密码" : "显示密码"}
                >
                  <IconEye off={showConfirm} />
                </button>
              </div>
            </div>

            <div className="p-field">
              <label htmlFor="reg-phone">
                手机号 <span className="p-req">*</span>
              </label>
              <div className="p-input-icon">
                <span className="p-input-icon__lead">
                  <IconPhone />
                </span>
                <input
                  id="reg-phone"
                  className="p-input"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  autoComplete="tel"
                />
              </div>
            </div>

            <CaptchaField
              value={captcha}
              onChange={setCaptcha}
              onVerifiedChange={setCaptchaOk}
              id="reg-captcha"
            />

            <div className="p-field">
              <label htmlFor="reg-sms">
                短信验证码 <span className="p-req">*</span>
              </label>
              <div className="p-input-combo">
                <span className="p-input-combo__lead">
                  <IconPhone />
                </span>
                <input
                  id="reg-sms"
                  className="p-input-combo__input"
                  inputMode="numeric"
                  maxLength={6}
                  value={smsCode}
                  onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="请输入短信验证码"
                />
                <button
                  type="button"
                  className="p-input-combo__action"
                  disabled={loading || cooldown > 0}
                  onClick={onSendSms}
                >
                  {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                </button>
              </div>
            </div>

            <div className="p-reg__agree">
              <label className="p-agree">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span>
                  已同意{" "}
                  <Link href="/legal/privacy" target="_blank">
                    隐私协议
                  </Link>
                  、
                  <Link href="/legal/terms" target="_blank">
                    用户协议
                  </Link>
                </span>
              </label>
              <p className="p-agree__hint">请仔细阅读协议内容，勾选后方可完成注册</p>
            </div>

            {info ? <div className="p-field__hint">{info}</div> : null}
            {error ? <div className="p-field__error p-reg__error">{error}</div> : null}

            <button
              type="submit"
              className="p-btn p-btn--primary p-btn--block p-reg__submit"
              disabled={loading}
            >
              {loading ? "注册中…" : "注册"}
            </button>

            <p className="p-auth-switch">
              已有账号？{" "}
              <Link href="/?login=1" className="p-auth-switch__link">
                返回登录
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
