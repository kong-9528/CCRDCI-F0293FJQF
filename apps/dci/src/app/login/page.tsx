"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { CaptchaCanvas, randomCaptchaCode } from "@/components/CaptchaCanvas";
import {
  DEMO_PASSWORD,
  getPostLoginAction,
  isDemoAccount,
  isValidDemoPassword,
  useAuth,
} from "@/lib/auth";
import { LOGO_WHITE } from "@/lib/content";

function IconUser() {
  return (
    <svg className="d-login-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M5 19c1.2-3.2 3.6-4.8 7-4.8s5.8 1.6 7 4.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconLock() {
  return (
    <svg className="d-login-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg className="d-login-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4h3l1.5 4-2 1.2a12 12 0 0 0 5.3 5.3L16 12.5l4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 5 8.2 2 2 0 0 1 7 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M3 3l18 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
        <path
          d="M10.5 10.6a2 2 0 0 0 2.9 2.9M9.9 5.1A10.5 10.5 0 0 1 12 5c5 0 8.5 4.5 9.5 7-.4 1-1.2 2.4-2.5 3.7M6.2 6.3C4.4 7.7 3.3 9.5 2.5 12c1 2.5 4.5 7 9.5 7 1.3 0 2.5-.3 3.6-.7"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.5 12C3.5 9.5 7 5 12 5s8.5 4.5 9.5 7c-1 2.5-4.5 7-9.5 7s-8.5-4.5-9.5-7Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function IconKey() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="8" cy="14" r="3.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M11 12.5l8-8M16 5.5l2.5 2.5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3l7 3v5c0 4.5-2.8 7.8-7 10-4.2-2.2-7-5.5-7-10V6l7-3Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const FEATURES = [
  { t: "唯一标识", d: "全球唯一 DCI 码，一码溯源" },
  { t: "权威登记", d: "中国版权保护中心权威认证" },
  { t: "便捷查询", d: "输入 DCI 码即可快速查询" },
];

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [tab, setTab] = useState<"account" | "phone">("account");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [captcha, setCaptcha] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [form, setForm] = useState({
    username: "mayi",
    password: DEMO_PASSWORD,
    phone: "",
    captchaInput: "",
    smsCode: "",
  });

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotSmsSent, setForgotSmsSent] = useState(false);
  const [forgotShowPwd, setForgotShowPwd] = useState(false);
  const [forgotCaptcha, setForgotCaptcha] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgot, setForgot] = useState({
    phone: "",
    captchaInput: "",
    smsCode: "",
    password: "",
    confirm: "",
  });

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (key === "phone" || key === "captchaInput") setSmsSent(false);
  };

  const onRefreshCaptcha = useCallback((next: string) => setCaptcha(next), []);
  const onRefreshForgotCaptcha = useCallback((next: string) => setForgotCaptcha(next), []);

  const canSendSms = useMemo(() => {
    if (tab !== "phone") return false;
    if (!form.phone || !/^1[3-9]\d{9}$/.test(form.phone)) return false;
    if (!form.captchaInput.trim()) return false;
    if (form.captchaInput.trim().toUpperCase() !== captcha) return false;
    return true;
  }, [tab, form.phone, form.captchaInput, captcha]);

  const canSendForgotSms = useMemo(() => {
    if (!forgot.phone || !/^1[3-9]\d{9}$/.test(forgot.phone)) return false;
    if (!forgot.captchaInput.trim()) return false;
    if (forgot.captchaInput.trim().toUpperCase() !== forgotCaptcha) return false;
    return true;
  }, [forgot.phone, forgot.captchaInput, forgotCaptcha]);

  const validateLogin = () => {
    if (tab === "account") {
      if (!form.username.trim()) return "请填写账号名";
      return null;
    }
    if (!form.phone.trim()) return "请填写手机号";
    if (!/^1[3-9]\d{9}$/.test(form.phone)) return "手机号格式不正确";
    if (!form.smsCode.trim()) return "请填写短信验证码";
    if (form.smsCode !== "0000") return "短信验证码不正确";
    return null;
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
    if (!form.captchaInput.trim()) {
      showToast("请先填写图形验证码");
      return;
    }
    if (form.captchaInput.toUpperCase() !== captcha) {
      showToast("图形验证码不正确，请重新输入");
      return;
    }
    setSmsSent(true);
    showToast("短信验证码已发送，默认验证码为 0000");
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateLogin();
    if (err) {
      showToast(err);
      return;
    }
    setLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 350));
      if (tab === "account") {
        const name = form.username.trim().toLowerCase();
        if (!isDemoAccount(name)) {
          showToast("账号或密码错误，请重新输入");
          return;
        }
        if (!isValidDemoPassword(form.password)) {
          showToast("账号或密码错误，请重新输入");
          return;
        }
        login(name);
        showToast("登录成功");
        const action = getPostLoginAction(name);
        if (action.type === "customer") {
          window.setTimeout(() => {
            window.location.href = action.url;
          }, 400);
        } else {
          window.setTimeout(() => router.push("/"), 600);
        }
        return;
      }

      // 手机号登录演示：进入纯 C 端用户视角
      login("yachang");
      showToast("登录成功");
      window.setTimeout(() => router.push("/"), 600);
    } finally {
      setLoading(false);
    }
  };

  const openForgot = () => {
    setForgotStep(1);
    setForgotSmsSent(false);
    setForgotShowPwd(false);
    setForgot({ phone: "", captchaInput: "", smsCode: "", password: "", confirm: "" });
    setForgotCaptcha(randomCaptchaCode());
    setForgotOpen(true);
  };

  const sendForgotSms = () => {
    if (!forgot.phone) {
      showToast("请先输入手机号");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(forgot.phone)) {
      showToast("手机号格式不正确");
      return;
    }
    if (!forgot.captchaInput.trim()) {
      showToast("请先填写图形验证码");
      return;
    }
    if (forgot.captchaInput.toUpperCase() !== forgotCaptcha) {
      showToast("图形验证码不正确，请重新输入");
      return;
    }
    setForgotSmsSent(true);
    showToast("短信验证码已发送，默认验证码为 0000");
  };

  const forgotNext = () => {
    if (!forgot.smsCode.trim()) {
      showToast("请填写短信验证码");
      return;
    }
    if (forgot.smsCode !== "0000") {
      showToast("短信验证码不正确");
      return;
    }
    setForgotStep(2);
  };

  const confirmReset = async () => {
    if (!forgot.password || forgot.password.length < 8) {
      showToast("新密码长度至少为8位");
      return;
    }
    if (forgot.password !== forgot.confirm) {
      showToast("两次输入的密码不一致");
      return;
    }
    setForgotLoading(true);
    try {
      await new Promise((r) => setTimeout(r, 400));
      showToast("密码重置成功，请使用新密码登录");
      setForgotOpen(false);
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="d-login">
      {toast ? <div className="d-toast">{toast}</div> : null}

      <div className="d-login__bg" aria-hidden>
        <span className="d-login__blob d-login__blob--1" />
        <span className="d-login__blob d-login__blob--2" />
      </div>

      <div className="d-login__wrap">
        <div className="d-login__card">
          <aside className="d-login__aside">
            <div className="d-login__aside-deco" aria-hidden />
            <div className="d-login__aside-top">
              <img src={LOGO_WHITE} alt="DCI" className="d-login__aside-logo" />
              <h2>数字版权唯一标识符</h2>
              <p>DCI 体系为每一件数字作品提供全球唯一的版权标识，助力数字内容确权、交易与保护。</p>
            </div>
            <div className="d-login__features">
              {FEATURES.map((item) => (
                <div key={item.t} className="d-login__feature">
                  <span className="d-login__feature-icon">
                    <IconShield />
                  </span>
                  <div>
                    <strong>{item.t}</strong>
                    <p>{item.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="d-login__aside-copy">© DCI 数字版权唯一标识符</p>
          </aside>

          <div className="d-login__body">
            <div className="d-login__mobile-brand">
              <img src={LOGO_WHITE} alt="DCI" />
              <h1>账号登录</h1>
            </div>

            <div className="d-login__tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "account"}
                className={`d-login__tab${tab === "account" ? " is-active" : ""}`}
                onClick={() => setTab("account")}
              >
                账号密码登录
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "phone"}
                className={`d-login__tab${tab === "phone" ? " is-active" : ""}`}
                onClick={() => setTab("phone")}
              >
                验证码登录
              </button>
            </div>

            <form className="d-login__form" onSubmit={onSubmit}>
              {tab === "account" ? (
                <>
                  <div className="d-field">
                    <label htmlFor="username">账号名</label>
                    <div className="d-login-input">
                      <IconUser />
                      <input
                        id="username"
                        value={form.username}
                        onChange={(e) => setField("username", e.target.value)}
                        placeholder="请输入账号名"
                      />
                    </div>
                  </div>
                  <div className="d-field">
                    <label htmlFor="password">密码</label>
                    <div className="d-login-input">
                      <IconLock />
                      <input
                        id="password"
                        type={showPwd ? "text" : "password"}
                        value={form.password}
                        onChange={(e) => setField("password", e.target.value)}
                        placeholder="请输入密码"
                      />
                      <button
                        type="button"
                        className="d-login-input__eye"
                        aria-label={showPwd ? "隐藏密码" : "显示密码"}
                        onClick={() => setShowPwd((v) => !v)}
                      >
                        <IconEye off={showPwd} />
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="d-field">
                  <label htmlFor="phone">手机号</label>
                  <div className="d-login-input">
                    <IconPhone />
                    <input
                      id="phone"
                      value={form.phone}
                      onChange={(e) => setField("phone", e.target.value)}
                      placeholder="请输入手机号"
                    />
                  </div>
                </div>
              )}

              <div className="d-field">
                <label>图形验证码</label>
                <div className="d-login-captcha-row">
                  <CaptchaCanvas value={captcha} onRefresh={onRefreshCaptcha} />
                  <input
                    value={form.captchaInput}
                    maxLength={4}
                    onChange={(e) => setField("captchaInput", e.target.value)}
                    placeholder="请输入验证码"
                  />
                </div>
              </div>

              {tab === "phone" ? (
                <div className="d-field">
                  <label htmlFor="smsCode">短信验证码</label>
                  <div className="d-login-sms-row">
                    <input
                      id="smsCode"
                      value={form.smsCode}
                      onChange={(e) => setField("smsCode", e.target.value)}
                      placeholder="请输入短信验证码"
                    />
                    <button
                      type="button"
                      className="d-btn d-btn--ghost d-login-sms-btn"
                      disabled={!canSendSms}
                      onClick={sendSms}
                    >
                      {smsSent ? "已发送" : "获取验证码"}
                    </button>
                  </div>
                </div>
              ) : null}

              <button type="submit" className="d-btn d-login__submit" disabled={loading}>
                {loading ? "登录中..." : "登录"}
              </button>

              <div className="d-login__forgot">
                <button type="button" onClick={openForgot}>
                  <IconKey />
                  找回密码
                </button>
              </div>
            </form>

            <p className="d-login__register-hint">
              还没有账号？ <Link href="/register/">去注册</Link>
            </p>
          </div>
        </div>
      </div>

      {forgotOpen ? (
        <div className="d-modal" role="dialog" aria-modal="true">
          <button type="button" className="d-modal__mask" aria-label="关闭" onClick={() => setForgotOpen(false)} />
          <div className="d-modal__panel">
            <button type="button" className="d-modal__close" onClick={() => setForgotOpen(false)} aria-label="关闭">
              ×
            </button>
            <h3>{forgotStep === 1 ? "找回密码" : "设置新密码"}</h3>
            <p className="d-modal__desc">
              {forgotStep === 1 ? "请输入手机号、图形验证码与短信验证码" : "请设置新的登录密码"}
            </p>

            {forgotStep === 1 ? (
              <div className="d-login__form">
                <div className="d-field">
                  <label>手机号</label>
                  <div className="d-login-input">
                    <IconPhone />
                    <input
                      placeholder="请输入手机号"
                      value={forgot.phone}
                      onChange={(e) => {
                        setForgot((p) => ({ ...p, phone: e.target.value }));
                        setForgotSmsSent(false);
                      }}
                    />
                  </div>
                </div>
                <div className="d-field">
                  <label>图形验证码</label>
                  <div className="d-login-captcha-row">
                    <CaptchaCanvas value={forgotCaptcha} onRefresh={onRefreshForgotCaptcha} />
                    <input
                      placeholder="请输入验证码"
                      maxLength={4}
                      value={forgot.captchaInput}
                      onChange={(e) => {
                        setForgot((p) => ({ ...p, captchaInput: e.target.value }));
                        setForgotSmsSent(false);
                      }}
                    />
                  </div>
                </div>
                <div className="d-field">
                  <label>短信验证码</label>
                  <div className="d-login-sms-row">
                    <input
                      placeholder="请输入短信验证码"
                      value={forgot.smsCode}
                      onChange={(e) => setForgot((p) => ({ ...p, smsCode: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="d-btn d-btn--ghost d-login-sms-btn"
                      disabled={!canSendForgotSms}
                      onClick={sendForgotSms}
                    >
                      {forgotSmsSent ? "已发送" : "获取验证码"}
                    </button>
                  </div>
                </div>
                <button type="button" className="d-btn d-login__submit" onClick={forgotNext}>
                  下一步
                </button>
              </div>
            ) : (
              <div className="d-login__form">
                <div className="d-field">
                  <label>新密码</label>
                  <div className="d-login-input">
                    <IconLock />
                    <input
                      type={forgotShowPwd ? "text" : "password"}
                      placeholder="请输入新密码（至少8位）"
                      value={forgot.password}
                      onChange={(e) => setForgot((p) => ({ ...p, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="d-login-input__eye"
                      onClick={() => setForgotShowPwd((v) => !v)}
                    >
                      <IconEye off={forgotShowPwd} />
                    </button>
                  </div>
                </div>
                <div className="d-field">
                  <label>确认新密码</label>
                  <div className="d-login-input">
                    <IconLock />
                    <input
                      type={forgotShowPwd ? "text" : "password"}
                      placeholder="请再次输入新密码"
                      value={forgot.confirm}
                      onChange={(e) => setForgot((p) => ({ ...p, confirm: e.target.value }))}
                    />
                  </div>
                </div>
                <button type="button" className="d-btn d-login__submit" disabled={forgotLoading} onClick={confirmReset}>
                  {forgotLoading ? "重置中..." : "确认重置密码"}
                </button>
                <button type="button" className="d-btn d-btn--ghost" onClick={() => setForgotStep(1)}>
                  返回上一步
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
