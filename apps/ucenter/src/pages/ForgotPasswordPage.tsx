import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import {
  findByPhone,
  isValidMobile,
  isValidPassword,
  resetPasswordByPhone,
  sendSmsCode,
  verifySmsCode,
} from "@/lib/accountStore";
import { withReturnUrl } from "@/lib/redirect";

type Step = 1 | 2 | 3 | 4;

export function ForgotPasswordPage() {
  const location = useLocation();
  const [step, setStep] = useState<Step>(1);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [cooldown, setCooldown] = useState(0);

  const indicators = useMemo(() => [1, 2, 3, 4] as const, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  const goSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (!isValidMobile(phone)) {
      setError("请输入正确的手机号");
      return;
    }
    if (!findByPhone(phone)) {
      setError("该手机号未注册");
      return;
    }
    const result = sendSmsCode(phone, "forgot");
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setInfo(result.message);
    setCooldown(60);
    setStep(2);
  };

  const goVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const check = verifySmsCode(phone, code, "forgot");
    if (!check.ok) {
      setError(check.message);
      return;
    }
    setStep(3);
  };

  const goReset = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isValidPassword(password)) {
      setError("密码须为 8–12 位");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    const result = resetPasswordByPhone(phone, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setStep(4);
  };

  return (
    <AuthLayout
      title="找回密码"
      subtitle="通过绑定手机号短信验证后重置密码"
      footer={
        <>
          想起密码了？
          <Link to={withReturnUrl("/login", location.search)}>返回登录</Link>
        </>
      }
    >
      <div className="uc-steps" aria-hidden>
        {indicators.map((n) => (
          <span
            key={n}
            className={n < step ? "is-done" : n === step ? "is-current" : undefined}
          />
        ))}
      </div>

      {step === 1 ? (
        <form className="uc-form" onSubmit={goSendCode}>
          <div className="uc-field">
            <label htmlFor="uc-fp-phone">绑定手机号</label>
            <input
              id="uc-fp-phone"
              className="uc-input"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="请输入 11 位手机号"
            />
          </div>
          {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
          {info ? <div className="uc-alert uc-alert--info">{info}</div> : null}
          <button type="submit" className="uc-btn uc-btn--primary uc-btn--block">
            获取验证码
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <form className="uc-form" onSubmit={goVerify}>
          <div className="uc-field">
            <label htmlFor="uc-fp-code">短信验证码</label>
            <div className="uc-input-row">
              <input
                id="uc-fp-code"
                className="uc-input"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="6 位验证码"
              />
              <button
                type="button"
                className="uc-btn uc-btn--ghost"
                disabled={cooldown > 0}
                onClick={() => {
                  const result = sendSmsCode(phone, "forgot");
                  if (!result.ok) {
                    setError(result.message);
                    return;
                  }
                  setInfo(result.message);
                  setCooldown(60);
                }}
              >
                {cooldown > 0 ? `${cooldown}s` : "重新获取"}
              </button>
            </div>
          </div>
          {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
          {info ? <div className="uc-alert uc-alert--info">{info}</div> : null}
          <button type="submit" className="uc-btn uc-btn--primary uc-btn--block">
            下一步
          </button>
        </form>
      ) : null}

      {step === 3 ? (
        <form className="uc-form" onSubmit={goReset}>
          <div className="uc-field">
            <label htmlFor="uc-fp-pwd">新密码</label>
            <input
              id="uc-fp-pwd"
              type="password"
              className="uc-input"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8–12 位"
            />
          </div>
          <div className="uc-field">
            <label htmlFor="uc-fp-confirm">确认新密码</label>
            <input
              id="uc-fp-confirm"
              type="password"
              className="uc-input"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="再次输入新密码"
            />
          </div>
          {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
          <button type="submit" className="uc-btn uc-btn--primary uc-btn--block">
            重置密码
          </button>
        </form>
      ) : null}

      {step === 4 ? (
        <div className="uc-success">
          <p>密码已重置，请使用新密码登录。</p>
          <Link
            className="uc-btn uc-btn--primary uc-btn--block"
            to={withReturnUrl("/login", location.search)}
          >
            去登录
          </Link>
        </div>
      ) : null}
    </AuthLayout>
  );
}
