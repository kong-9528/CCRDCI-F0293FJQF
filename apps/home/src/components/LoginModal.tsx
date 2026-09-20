"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

type Props = {
  open: boolean;
  onClose: () => void;
};

type Tab = "sms" | "password";

export function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const [tab, setTab] = useState<Tab>("sms");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [captcha, setCaptcha] = useState("");
  const [password, setPassword] = useState("");
  const [smsCountdown, setSmsCountdown] = useState(0);
  const [error, setError] = useState("");
  const [captchaCode, setCaptchaCode] = useState(generateCaptcha());

  useEffect(() => {
    if (open) {
      setError("");
      setTab("sms");
    }
  }, [open]);

  useEffect(() => {
    if (smsCountdown <= 0) return;
    const t = setTimeout(() => setSmsCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [smsCountdown]);

  if (!open) return null;

  const handleSendSms = () => {
    if (!/^1\d{10}$/.test(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (captcha.toUpperCase() !== captchaCode) {
      setError("图形验证码不正确");
      return;
    }
    setError("");
    setSmsCountdown(60);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (tab === "sms") {
      if (!/^1\d{10}$/.test(phone)) {
        setError("请输入正确的手机号");
        return;
      }
      if (!code) {
        setError("请输入短信验证码");
        return;
      }
    } else {
      if (!phone) {
        setError("请输入账号");
        return;
      }
      if (!password) {
        setError("请输入密码");
        return;
      }
    }
    const result = await login(phone);
    if (result.ok) {
      onClose();
    } else {
      setError(result.message);
    }
  };

  const refreshCaptcha = () => {
    setCaptchaCode(generateCaptcha());
    setCaptcha("");
  };

  return (
    <div
      className="portal-auth-modal-mask"
      onClick={onClose}
    >
      <div
        className="auth-card-body is-login-mode"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="form-content-wrap">
          <div className="login-close-btn" onClick={onClose}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M5 5L15 15M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div className="login-title">登录</div>
          <div className="login-subtitle">欢迎来到DCI管理中心</div>

          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab${tab === "sms" ? " active" : ""}`}
              onClick={() => setTab("sms")}
            >
              短信登录
            </button>
            <button
              type="button"
              className={`login-tab${tab === "password" ? " active" : ""}`}
              onClick={() => setTab("password")}
            >
              密码登录
            </button>
          </div>

          <form className="pure-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">
                手机号
              </label>
              <input
                className="form-input"
                type="text"
                placeholder="请输入手机号"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>

            {tab === "sms" && (
              <>
                <div className="form-group">
                  <label className="form-label">图形验证码</label>
                  <div className="captcha-row">
                    <input
                      className="form-input"
                      type="text"
                      placeholder="请输入图形验证码"
                      value={captcha}
                      onChange={(e) => setCaptcha(e.target.value)}
                      maxLength={4}
                    />
                    <div
                      className="captcha-img cursor-pointer"
                      onClick={refreshCaptcha}
                      title="点击刷新"
                    >
                      {captchaCode}
                    </div>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">短信验证码</label>
                  <div className="sms-row">
                    <input
                      className="form-input"
                      type="text"
                      placeholder="请输入短信验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      maxLength={6}
                    />
                    <button
                      type="button"
                      className="sms-trigger"
                      onClick={handleSendSms}
                      disabled={smsCountdown > 0}
                    >
                      {smsCountdown > 0
                        ? `${smsCountdown}s`
                        : "获取验证码"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {tab === "password" && (
              <div className="form-group">
                <label className="form-label">密码</label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="请输入密码"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            <button type="submit" className="login-submit-btn">
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function generateCaptcha(): string {
  const chars = "ABCDEFGHJKMNPQRSTUVWXY3456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}
