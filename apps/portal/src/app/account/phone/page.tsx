"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CaptchaField, useCaptchaGate } from "@/components/CaptchaField";
import { useAuth } from "@/lib/auth";
import {
  findByUsername,
  isPhoneTaken,
  isValidMobile,
  maskPhone,
  rebindPhone,
  sendSmsCode,
  verifySmsCode,
} from "@/lib/accountStore";

export default function RebindPhonePage() {
  const router = useRouter();
  const { user, ready, refreshUserPhone } = useAuth();
  const { captcha, setCaptcha, captchaOk, setCaptchaOk } = useCaptchaGate();

  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [done, setDone] = useState(false);

  const currentPhone = user ? findByUsername(user.username)?.phone ?? "" : "";

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace("/");
  }, [ready, user, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  if (!ready || !user) {
    return (
      <div className="p-page">
        <div className="p-container">
          <div className="p-auth-card">
            <div className="a-empty" style={{ padding: 24 }}>
              加载中…
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onSend = () => {
    setError("");
    setInfo("");
    if (!captchaOk) {
      setError("请先完成图形验证码");
      return;
    }
    if (!isValidMobile(phone)) {
      setError("请输入正确的新手机号");
      return;
    }
    if (isPhoneTaken(phone, user.username)) {
      setError("该手机号已被其他账号绑定");
      return;
    }
    const result = sendSmsCode(phone, "rebind");
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setCooldown(60);
    setInfo(`验证码已发送至新手机号（演示验证码：${result.demoCode}）`);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const sms = verifySmsCode(phone, smsCode, "rebind");
    if (!sms.ok) {
      setError(sms.message);
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 280));
    const result = rebindPhone(user.username, phone, smsCode);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    refreshUserPhone(result.account.phone);
    setDone(true);
  };

  return (
    <div className="p-page">
      <div className="p-container">
        <div className="p-auth-card">
          <h1 className="p-h3" style={{ margin: "0 0 8px" }}>
            换绑手机号
          </h1>
          <p style={{ margin: "0 0 24px", color: "var(--n-500)", fontSize: 14 }}>
            当前绑定：{currentPhone ? maskPhone(currentPhone) : "—"}。新手机号须全局唯一，并通过短信验证。
          </p>

          {done ? (
            <div className="p-success">
              <div className="p-success__icon">✓</div>
              <h2 className="p-h3" style={{ margin: "0 0 8px" }}>
                换绑成功
              </h2>
              <p style={{ color: "var(--n-500)", margin: "0 0 24px" }}>
                新手机号已生效，之后可用新号接收登录与找回密码验证码。
              </p>
              <Link href="/" className="p-btn p-btn--primary">
                返回首页
              </Link>
            </div>
          ) : (
            <form onSubmit={(e) => void onSubmit(e)}>
              <div className="p-field">
                <label htmlFor="rebind-phone">
                  新手机号 <span className="p-req">*</span>
                </label>
                <input
                  id="rebind-phone"
                  className="p-input"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入新手机号"
                />
              </div>
              <CaptchaField
                value={captcha}
                onChange={setCaptcha}
                onVerifiedChange={setCaptchaOk}
                id="rebind-captcha"
              />
              <div className="p-field">
                <label htmlFor="rebind-sms">
                  短信验证码 <span className="p-req">*</span>
                </label>
                <div className="p-code-row">
                  <input
                    id="rebind-sms"
                    className="p-input"
                    inputMode="numeric"
                    maxLength={6}
                    value={smsCode}
                    onChange={(e) => setSmsCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="请输入短信验证码"
                  />
                  <button
                    type="button"
                    className="p-btn p-btn--outline"
                    disabled={loading || cooldown > 0}
                    onClick={onSend}
                  >
                    {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
                  </button>
                </div>
              </div>
              {info ? <div className="p-field__hint">{info}</div> : null}
              {error ? <div className="p-field__error">{error}</div> : null}
              <button type="submit" className="p-btn p-btn--primary p-btn--block" disabled={loading}>
                {loading ? "提交中…" : "确认换绑"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
