"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const MOCK_CODE = "123456";

type Step = 1 | 2 | 3 | 4;

function normalizePhone(phone: string) {
  return phone.replace(/[\s-]/g, "");
}

function isValidMobile(phone: string) {
  return /^1\d{10}$/.test(normalizePhone(phone));
}

function maskPhone(phone: string) {
  const digits = normalizePhone(phone);
  return `${digits.slice(0, 3)}****${digits.slice(-4)}`;
}

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [sentHint, setSentHint] = useState(false);

  const indicators = useMemo(() => [1, 2, 3, 4] as const, []);

  const goSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidMobile(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    setSentHint(true);
    setStep(2);
  };

  const goVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (code.trim() !== MOCK_CODE) {
      setError("验证码错误，请重试");
      return;
    }
    setStep(3);
  };

  const goReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("密码至少 6 位");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    setStep(4);
  };

  return (
    <div className="p-page">
      <div className="p-container">
        <div className="p-auth-card">
          <h1 className="p-h3" style={{ margin: "0 0 8px" }}>
            忘记密码
          </h1>
          <p style={{ margin: "0 0 8px", color: "var(--n-500)", fontSize: 14 }}>
            通过绑定手机号短信验证码找回密码。演示环境验证码固定为 <strong>123456</strong>。
          </p>

          <div className="p-steps-indicator" aria-hidden>
            {indicators.map((n) => (
              <span
                key={n}
                className={n < step ? "is-done" : n === step ? "is-current" : undefined}
              />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={goSendCode}>
              <div className="p-field">
                <label htmlFor="fp-phone">绑定手机号</label>
                <input
                  id="fp-phone"
                  className="p-input"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入 11 位手机号"
                />
              </div>
              {error ? <div className="p-field__error">{error}</div> : null}
              <button type="submit" className="p-btn p-btn--primary p-btn--block">
                发送短信验证码
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={goVerify}>
              {sentHint ? (
                <p style={{ color: "var(--n-500)", fontSize: 14, marginTop: 0 }}>
                  验证码已发送至 <strong>{maskPhone(phone)}</strong>（模拟）。请输入 123456
                  继续。
                </p>
              ) : null}
              <div className="p-field">
                <label htmlFor="fp-code">短信验证码</label>
                <input
                  id="fp-code"
                  className="p-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="6 位验证码"
                  inputMode="numeric"
                  maxLength={6}
                />
              </div>
              {error ? <div className="p-field__error">{error}</div> : null}
              <button type="submit" className="p-btn p-btn--primary p-btn--block">
                验证
              </button>
              <button
                type="button"
                className="p-btn p-btn--outline p-btn--block"
                style={{ marginTop: 12 }}
                onClick={() => {
                  setError("");
                  setStep(1);
                }}
              >
                返回修改手机号
              </button>
            </form>
          ) : null}

          {step === 3 ? (
            <form onSubmit={goReset}>
              <div className="p-field">
                <label htmlFor="fp-pass">新密码</label>
                <input
                  id="fp-pass"
                  type="password"
                  className="p-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 位"
                />
              </div>
              <div className="p-field">
                <label htmlFor="fp-confirm">确认新密码</label>
                <input
                  id="fp-confirm"
                  type="password"
                  className="p-input"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="再次输入新密码"
                />
              </div>
              {error ? <div className="p-field__error">{error}</div> : null}
              <button type="submit" className="p-btn p-btn--primary p-btn--block">
                重置密码
              </button>
            </form>
          ) : null}

          {step === 4 ? (
            <div className="p-success">
              <div className="p-success__icon">✓</div>
              <h2 className="p-h3" style={{ margin: "0 0 8px" }}>
                密码已重置
              </h2>
              <p style={{ color: "var(--n-500)", margin: "0 0 24px" }}>
                请返回首页，使用新密码登录。（当前为前端模拟，不会写入真实账号库）
              </p>
              <Link href="/" className="p-btn p-btn--primary">
                返回首页登录
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
