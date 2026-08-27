"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

const MOCK_CODE = "1111";

type Step = 1 | 2 | 3 | 4;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [sentHint, setSentHint] = useState(false);

  const indicators = useMemo(() => [1, 2, 3, 4] as const, []);

  const goSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("请输入有效的邮箱地址");
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
            通过绑定邮箱验证码找回密码。演示环境验证码固定为 <strong>1111</strong>。
          </p>

          <div className="p-steps-indicator" aria-hidden>
            {indicators.map((n) => (
              <span
                key={n}
                className={
                  n < step ? "is-done" : n === step ? "is-current" : undefined
                }
              />
            ))}
          </div>

          {step === 1 ? (
            <form onSubmit={goSendCode}>
              <div className="p-field">
                <label htmlFor="fp-email">绑定邮箱</label>
                <input
                  id="fp-email"
                  className="p-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                />
              </div>
              {error ? <div className="p-field__error">{error}</div> : null}
              <button type="submit" className="p-btn p-btn--primary p-btn--block">
                发送验证码
              </button>
            </form>
          ) : null}

          {step === 2 ? (
            <form onSubmit={goVerify}>
              {sentHint ? (
                <p style={{ color: "var(--n-500)", fontSize: 14, marginTop: 0 }}>
                  验证码已发送至 <strong>{email}</strong>（模拟）。请输入 1111 继续。
                </p>
              ) : null}
              <div className="p-field">
                <label htmlFor="fp-code">邮箱验证码</label>
                <input
                  id="fp-code"
                  className="p-input"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="4 位验证码"
                  inputMode="numeric"
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
                返回修改邮箱
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
