"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

type Props = {
  open: boolean;
  onClose: () => void;
};

type LoginMode = "password" | "sms";

export function LoginModal({ open, onClose }: Props) {
  const { login, loginWithSms, sendLoginSmsCode } = useAuth();
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
    if (!open) return;
    setError("");
    setInfo("");
    setPassword("");
    setSmsCode("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown((n) => Math.max(0, n - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  if (!open) return null;

  const switchMode = (next: LoginMode) => {
    setMode(next);
    setError("");
    setInfo("");
  };

  const onSendSms = async () => {
    setLoading(true);
    setError("");
    setInfo("");
    const result = await sendLoginSmsCode(phone);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCooldown(60);
    setInfo(
      result.demoCode
        ? `验证码已发送（演示验证码：${result.demoCode}）`
        : "验证码已发送",
    );
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result =
      mode === "password"
        ? await login(username, password)
        : await loginWithSms(phone, smsCode);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="p-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="p-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="p-modal__close" aria-label="关闭" onClick={onClose}>
          ×
        </button>
        <h2 id="login-title" className="p-modal__title">
          登录
        </h2>
        <p className="p-modal__desc">
          支持用户名密码或手机短信验证码登录。演示密码：demo123；演示短信码：123456
        </p>

        <div className="p-login-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "password"}
            className={`p-login-tabs__item${mode === "password" ? " is-active" : ""}`}
            onClick={() => switchMode("password")}
          >
            用户名登录
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sms"}
            className={`p-login-tabs__item${mode === "sms" ? " is-active" : ""}`}
            onClick={() => switchMode("sms")}
          >
            短信验证码登录
          </button>
        </div>

        <form onSubmit={submit}>
          {mode === "password" ? (
            <>
              <div className="p-field">
                <label htmlFor="login-username">用户名</label>
                <input
                  id="login-username"
                  className="p-input"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="请输入用户名"
                />
              </div>
              <div className="p-field">
                <label htmlFor="login-password">密码</label>
                <input
                  id="login-password"
                  type="password"
                  className="p-input"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                />
              </div>
            </>
          ) : (
            <>
              <div className="p-field">
                <label htmlFor="login-phone">手机号</label>
                <input
                  id="login-phone"
                  className="p-input"
                  inputMode="tel"
                  autoComplete="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入绑定手机号"
                />
              </div>
              <div className="p-field">
                <label htmlFor="login-sms">短信验证码</label>
                <div className="p-code-row">
                  <input
                    id="login-sms"
                    className="p-input"
                    inputMode="numeric"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6 位验证码"
                  />
                  <button
                    type="button"
                    className="p-btn p-btn--outline"
                    disabled={loading || cooldown > 0}
                    onClick={() => void onSendSms()}
                  >
                    {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                  </button>
                </div>
              </div>
            </>
          )}
          {info ? <div className="p-field__hint">{info}</div> : null}
          {error ? <div className="p-field__error">{error}</div> : null}
          <div className="p-modal__footer-links">
            <Link href="/forgot-password" onClick={onClose}>
              忘记密码？
            </Link>
          </div>
          <button type="submit" className="p-btn p-btn--primary p-btn--block" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
