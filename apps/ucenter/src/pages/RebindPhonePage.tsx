import { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth";
import {
  isValidMobile,
  rebindPhone,
  sendSmsCode,
  verifySmsCode,
} from "@/lib/accountStore";

/** 已登录态安全能力：换绑手机号（供 customer 等重定向接入） */
export function RebindPhonePage() {
  const { user, ready, refresh } = useAuth();
  const [newPhone, setNewPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [done, setDone] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = window.setInterval(() => setCooldown((n) => Math.max(0, n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [cooldown]);

  if (ready && !user) {
    return <Navigate to="/login?returnUrl=/security/phone" replace />;
  }

  const onSend = () => {
    setError("");
    setInfo("");
    if (!isValidMobile(newPhone)) {
      setError("请输入正确的手机号");
      return;
    }
    const result = sendSmsCode(newPhone, "rebind");
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
    if (!user) return;
    const sms = verifySmsCode(newPhone, code, "rebind");
    if (!sms.ok) {
      setError(sms.message);
      return;
    }
    const result = rebindPhone(user.username, newPhone);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    refresh();
    setDone(true);
  };

  return (
    <AuthLayout
      title="换绑手机号"
      subtitle={user ? `当前绑定：${user.phone}` : undefined}
      footer={<Link to="/security">返回安全设置</Link>}
    >
      {done ? (
        <div className="uc-success">
          <p>手机号已更新。</p>
          <Link className="uc-btn uc-btn--primary uc-btn--block" to="/security">
            完成
          </Link>
        </div>
      ) : (
        <form className="uc-form" onSubmit={onSubmit}>
          <div className="uc-field">
            <label htmlFor="uc-rb-phone">新手机号</label>
            <input
              id="uc-rb-phone"
              className="uc-input"
              inputMode="tel"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="请输入新手机号"
            />
          </div>
          <div className="uc-field">
            <label htmlFor="uc-rb-sms">短信验证码</label>
            <div className="uc-input-row">
              <input
                id="uc-rb-sms"
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
                onClick={onSend}
              >
                {cooldown > 0 ? `${cooldown}s` : "获取验证码"}
              </button>
            </div>
          </div>
          {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
          {info ? <div className="uc-alert uc-alert--info">{info}</div> : null}
          <button type="submit" className="uc-btn uc-btn--primary uc-btn--block">
            确认换绑
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
