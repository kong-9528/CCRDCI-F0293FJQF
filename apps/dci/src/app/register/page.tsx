"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { CaptchaCanvas } from "@/components/CaptchaCanvas";

export default function RegisterPage() {
  const router = useRouter();
  const [showPwd, setShowPwd] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smsLeft, setSmsLeft] = useState(0);
  const [captcha, setCaptcha] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    accountName: "",
    password: "",
    confirmPassword: "",
    phone: "",
    captchaInput: "",
    smsCode: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onRefreshCaptcha = useCallback((next: string) => setCaptcha(next), []);

  useEffect(() => {
    if (smsLeft <= 0) return;
    const t = window.setInterval(() => setSmsLeft((n) => (n <= 1 ? 0 : n - 1)), 1000);
    return () => window.clearInterval(t);
  }, [smsLeft]);

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sendSms = () => {
    if (!form.phone) {
      showToast("请先输入手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      showToast("手机号格式不正确");
      return;
    }
    showToast("短信验证码已发送，默认验证码为 0000");
    setSmsLeft(60);
  };

  const validate = () => {
    if (!form.accountName.trim()) return "请填写账号名";
    if (!form.password) return "请填写密码";
    if (form.password.length < 8) return "密码长度不能少于8位";
    if (form.password.length > 12) return "密码长度不能超过12位";
    if (form.password !== form.confirmPassword) return "两次输入的密码不一致";
    if (!form.phone.trim()) return "请填写手机号";
    if (!/^1[3-9]\d{9}$/.test(form.phone)) return "手机号格式不正确";
    if (!form.captchaInput.trim()) return "请填写图形验证码";
    if (form.captchaInput.toUpperCase() !== captcha) return "图形验证码不正确，请重新输入";
    if (!form.smsCode.trim()) return "请填写短信验证码";
    if (form.smsCode !== "0000") return "短信验证码不正确";
    if (!agreed) return "请先同意隐私协议和用户协议";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      showToast(err);
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      showToast("注册成功");
      window.setTimeout(() => router.push("/login/"), 700);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-register">
      {toast ? <div className="d-toast">{toast}</div> : null}
      <div className="d-register__card">
        <div className="d-register__head">
          <div className="d-register__icon">DCI</div>
          <h1>账号注册</h1>
          <p>创建账号，开启 DCI 服务</p>
        </div>
        <form className="d-login__form" onSubmit={onSubmit}>
          <div className="d-field">
            <label>账号名</label>
            <input
              value={form.accountName}
              onChange={(e) => setField("accountName", e.target.value)}
              placeholder="请输入账号名"
            />
          </div>
          <div className="d-field">
            <label>密码</label>
            <div className="d-login-input" style={{ paddingLeft: 12 }}>
              <input
                type={showPwd ? "text" : "password"}
                value={form.password}
                onChange={(e) => setField("password", e.target.value)}
                placeholder="8-12位密码"
              />
              <button type="button" className="d-login-input__eye" onClick={() => setShowPwd((v) => !v)}>
                {showPwd ? "隐藏" : "显示"}
              </button>
            </div>
          </div>
          <div className="d-field">
            <label>确认密码</label>
            <input
              type={showPwd ? "text" : "password"}
              value={form.confirmPassword}
              onChange={(e) => setField("confirmPassword", e.target.value)}
              placeholder="请再次输入密码"
            />
          </div>
          <div className="d-field">
            <label>手机号</label>
            <input
              value={form.phone}
              onChange={(e) => setField("phone", e.target.value)}
              placeholder="请输入手机号"
            />
          </div>
          <div className="d-field">
            <label>图形验证码</label>
            <div className="d-login-captcha-row">
              <CaptchaCanvas value={captcha} onRefresh={onRefreshCaptcha} />
              <input
                maxLength={4}
                value={form.captchaInput}
                onChange={(e) => setField("captchaInput", e.target.value)}
                placeholder="请输入验证码"
              />
            </div>
          </div>
          <div className="d-field">
            <label>短信验证码</label>
            <div className="d-login-sms-row">
              <input
                value={form.smsCode}
                onChange={(e) => setField("smsCode", e.target.value)}
                placeholder="请输入短信验证码"
              />
              <button
                type="button"
                className="d-btn d-btn--ghost d-login-sms-btn"
                disabled={smsLeft > 0}
                onClick={sendSms}
              >
                {smsLeft > 0 ? `${smsLeft}s` : "获取验证码"}
              </button>
            </div>
          </div>
          <label className="d-register__agree">
            <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)} />
            <span>
              我已阅读并同意《用户协议》和《隐私协议》
            </span>
          </label>
          <button type="submit" className="d-btn d-login__submit" disabled={loading}>
            {loading ? "注册中..." : "注册"}
          </button>
        </form>
        <p className="d-login__register-hint">
          已有账号？ <Link href="/login/">去登录</Link>
        </p>
      </div>
    </div>
  );
}
