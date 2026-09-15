"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { CaptchaCanvas, randomCaptchaCode } from "@/components/CaptchaCanvas";
import {
  DEMO_SMS_CODE,
  getOpenedServicesLabel,
  isValidDemoPassword,
  maskPhone,
  useAuth,
} from "@/lib/auth";

function IconUser() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
      <path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M13.832 16.568a1 1 0 0 0 1.213-.303l.355-.465A2 2 0 0 1 17 15h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2A18 18 0 0 1 2 4a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v3a2 2 0 0 1-.8 1.6l-.468.351a1 1 0 0 0-.292 1.233 14 14 0 0 0 6.392 6.384"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconLock() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="m16 17 5-5-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconEye({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="M14.084 14.158a3 3 0 0 1-4.242-4.242" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path
          d="M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path d="m2 2 20 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function IconWarn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 8v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="d-account__row">
      <span className="d-account__label">{label}</span>
      <div className="d-account__value">{children}</div>
    </div>
  );
}

type Toast = { type: "ok" | "err"; text: string } | null;

export function AccountInfoPanel() {
  const router = useRouter();
  const { user, logout, updatePhone } = useAuth();

  const [phoneOpen, setPhoneOpen] = useState(false);
  const [pwdOpen, setPwdOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [toast, setToast] = useState<Toast>(null);

  const [phoneForm, setPhoneForm] = useState({ phone: "", captcha: "", smsCode: "" });
  const [captchaCode, setCaptchaCode] = useState(() => randomCaptchaCode());
  const [phoneSmsLeft, setPhoneSmsLeft] = useState(0);
  const [phoneBusy, setPhoneBusy] = useState(false);

  const [pwdForm, setPwdForm] = useState({ old: "", next: "", confirm: "" });
  const [pwdShow, setPwdShow] = useState({ old: false, next: false, confirm: false });

  const [cancelForm, setCancelForm] = useState({ password: "", smsCode: "" });
  const [cancelShowPwd, setCancelShowPwd] = useState(false);
  const [cancelSmsLeft, setCancelSmsLeft] = useState(0);
  const [cancelBusy, setCancelBusy] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    if (phoneSmsLeft <= 0) return;
    const t = window.setTimeout(() => setPhoneSmsLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [phoneSmsLeft]);

  useEffect(() => {
    if (cancelSmsLeft <= 0) return;
    const t = window.setTimeout(() => setCancelSmsLeft((v) => v - 1), 1000);
    return () => window.clearTimeout(t);
  }, [cancelSmsLeft]);

  if (!user) return null;

  const services = getOpenedServicesLabel(user);

  const openPhoneModal = () => {
    setPhoneForm({ phone: "", captcha: "", smsCode: "" });
    setCaptchaCode(randomCaptchaCode());
    setPhoneSmsLeft(0);
    setPhoneOpen(true);
  };

  const openPwdModal = () => {
    setPwdForm({ old: "", next: "", confirm: "" });
    setPwdShow({ old: false, next: false, confirm: false });
    setPwdOpen(true);
  };

  const openCancelModal = () => {
    setCancelForm({ password: "", smsCode: "" });
    setCancelShowPwd(false);
    setCancelSmsLeft(0);
    setCancelOpen(true);
  };

  const sendPhoneSms = () => {
    if (!/^1\d{10}$/.test(phoneForm.phone)) {
      setToast({ type: "err", text: "请输入正确的新手机号" });
      return;
    }
    if (phoneForm.captcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setToast({ type: "err", text: "图形验证码错误" });
      setCaptchaCode(randomCaptchaCode());
      return;
    }
    setToast({ type: "ok", text: `短信验证码已发送，演示验证码为 ${DEMO_SMS_CODE}` });
    setPhoneSmsLeft(60);
  };

  const submitPhone = (e: FormEvent) => {
    e.preventDefault();
    if (!/^1\d{10}$/.test(phoneForm.phone)) {
      setToast({ type: "err", text: "请输入正确的新手机号" });
      return;
    }
    if (phoneForm.captcha.trim().toUpperCase() !== captchaCode.toUpperCase()) {
      setToast({ type: "err", text: "图形验证码错误" });
      setCaptchaCode(randomCaptchaCode());
      return;
    }
    if (phoneForm.smsCode !== DEMO_SMS_CODE) {
      setToast({ type: "err", text: "短信验证码错误" });
      return;
    }
    setPhoneBusy(true);
    window.setTimeout(() => {
      updatePhone(phoneForm.phone);
      setPhoneBusy(false);
      setPhoneOpen(false);
      setToast({ type: "ok", text: "手机号修改成功" });
    }, 400);
  };

  const submitPwd = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidDemoPassword(pwdForm.old)) {
      setToast({ type: "err", text: "原密码错误" });
      return;
    }
    if (pwdForm.next.length < 8) {
      setToast({ type: "err", text: "新密码至少 8 位" });
      return;
    }
    if (pwdForm.next !== pwdForm.confirm) {
      setToast({ type: "err", text: "两次输入的新密码不一致" });
      return;
    }
    setPwdOpen(false);
    setToast({ type: "ok", text: "密码修改成功（演示环境仅提示）" });
  };

  const sendCancelSms = () => {
    if (!isValidDemoPassword(cancelForm.password)) {
      setToast({ type: "err", text: "请先输入正确的登录密码" });
      return;
    }
    setToast({ type: "ok", text: `验证码已发送至 ${maskPhone(user.phone)}，演示码 ${DEMO_SMS_CODE}` });
    setCancelSmsLeft(60);
  };

  const submitCancel = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidDemoPassword(cancelForm.password)) {
      setToast({ type: "err", text: "密码错误，请重新输入" });
      return;
    }
    if (cancelForm.smsCode !== DEMO_SMS_CODE) {
      setToast({ type: "err", text: "验证码错误，请重新输入" });
      return;
    }
    setCancelBusy(true);
    window.setTimeout(() => {
      setCancelBusy(false);
      setCancelOpen(false);
      logout();
      setToast({ type: "ok", text: "账号注销成功" });
      router.replace("/");
    }, 500);
  };

  return (
    <>
      <div className="d-account__card">
        <div className="d-account__card-head">
          <div className="d-account__card-title">
            <span className="d-account__card-icon" aria-hidden>
              <IconUser />
            </span>
            <span>账号信息</span>
          </div>
        </div>

        <div className="d-account__card-body">
          <div className="d-account__fields">
            <FieldRow label="账号名">
              <span className="d-account__text">{user.username}</span>
            </FieldRow>

            <FieldRow label="手机号">
              <div className="d-account__inline">
                <span className="d-account__text">{maskPhone(user.phone)}</span>
                <button type="button" className="d-account__action" onClick={openPhoneModal}>
                  <IconPhone /> 修改
                </button>
              </div>
            </FieldRow>

            <FieldRow label="密码">
              <div className="d-account__inline">
                <span className="d-account__text d-account__text--mono">********</span>
                <button type="button" className="d-account__action" onClick={openPwdModal}>
                  <IconLock /> 修改
                </button>
              </div>
            </FieldRow>

            <FieldRow label="已开通服务">
              <span className="d-account__text">{services}</span>
            </FieldRow>
          </div>

          <div className="d-account__danger">
            <div className="d-account__danger-copy">
              <p className="d-account__danger-title">注销账号</p>
              <p className="d-account__danger-desc">注销后账号将无法继续使用，请谨慎操作</p>
            </div>
            <button type="button" className="d-account__action d-account__action--danger" onClick={openCancelModal}>
              <IconLogout /> 注销账号
            </button>
          </div>
        </div>
      </div>

      {toast ? (
        <div className={`d-account__toast${toast.type === "err" ? " is-err" : ""}`} role="status">
          {toast.text}
        </div>
      ) : null}

      {phoneOpen ? (
        <div className="d-modal" role="dialog" aria-modal="true" aria-label="修改手机号">
          <button type="button" className="d-modal__mask" aria-label="关闭" onClick={() => setPhoneOpen(false)} />
          <div className="d-modal__panel d-account__modal">
            <button type="button" className="d-modal__close" onClick={() => setPhoneOpen(false)} aria-label="关闭">
              ×
            </button>
            <h3>修改手机号</h3>
            <p className="d-modal__desc">请输入新手机号、图形验证码并获取短信验证码完成修改</p>
            <form className="d-account__form" onSubmit={submitPhone}>
              <label className="d-account__field">
                <span>新手机号</span>
                <input
                  value={phoneForm.phone}
                  onChange={(e) => setPhoneForm((s) => ({ ...s, phone: e.target.value.replace(/\D/g, "").slice(0, 11) }))}
                  placeholder="请输入新手机号"
                  maxLength={11}
                  inputMode="numeric"
                />
              </label>
              <div className="d-account__field">
                <span>图形验证码</span>
                <div className="d-account__captcha-row">
                  <input
                    value={phoneForm.captcha}
                    onChange={(e) => setPhoneForm((s) => ({ ...s, captcha: e.target.value }))}
                    placeholder="请输入图形验证码"
                    maxLength={4}
                  />
                  <CaptchaCanvas
                    value={captchaCode}
                    onRefresh={(next) => {
                      setCaptchaCode(next);
                      setPhoneForm((s) => ({ ...s, captcha: "" }));
                    }}
                    width={110}
                    height={40}
                  />
                </div>
              </div>
              <div className="d-account__field">
                <span>短信验证码</span>
                <div className="d-account__sms-row">
                  <input
                    value={phoneForm.smsCode}
                    onChange={(e) =>
                      setPhoneForm((s) => ({ ...s, smsCode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
                    }
                    placeholder="请输入短信验证码"
                    maxLength={6}
                    inputMode="numeric"
                  />
                  <button
                    type="button"
                    className="d-btn d-btn--ghost d-account__sms-btn"
                    onClick={sendPhoneSms}
                    disabled={phoneSmsLeft > 0}
                  >
                    {phoneSmsLeft > 0 ? `${phoneSmsLeft}秒后重发` : "获取验证码"}
                  </button>
                </div>
              </div>
              <div className="d-account__form-actions">
                <button type="button" className="d-btn d-btn--ghost" onClick={() => setPhoneOpen(false)}>
                  取消
                </button>
                <button type="submit" className="d-btn" disabled={phoneBusy}>
                  {phoneBusy ? "提交中…" : "确认修改"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {pwdOpen ? (
        <div className="d-modal" role="dialog" aria-modal="true" aria-label="更换密码">
          <button type="button" className="d-modal__mask" aria-label="关闭" onClick={() => setPwdOpen(false)} />
          <div className="d-modal__panel d-account__modal">
            <button type="button" className="d-modal__close" onClick={() => setPwdOpen(false)} aria-label="关闭">
              ×
            </button>
            <h3>更换密码</h3>
            <p className="d-modal__desc">请填写原密码和新密码完成更换</p>
            <form className="d-account__form" onSubmit={submitPwd}>
              {(
                [
                  { key: "old" as const, label: "原密码" },
                  { key: "next" as const, label: "新密码" },
                  { key: "confirm" as const, label: "确认新密码" },
                ] as const
              ).map(({ key, label }) => (
                <label key={key} className="d-account__field">
                  <span>{label}</span>
                  <div className="d-account__pwd-wrap">
                    <input
                      type={pwdShow[key] ? "text" : "password"}
                      value={key === "old" ? pwdForm.old : key === "next" ? pwdForm.next : pwdForm.confirm}
                      onChange={(e) =>
                        setPwdForm((s) =>
                          key === "old"
                            ? { ...s, old: e.target.value }
                            : key === "next"
                              ? { ...s, next: e.target.value }
                              : { ...s, confirm: e.target.value },
                        )
                      }
                      placeholder={`请输入${label}`}
                    />
                    <button
                      type="button"
                      className="d-account__eye"
                      onClick={() => setPwdShow((s) => ({ ...s, [key]: !s[key] }))}
                      aria-label={pwdShow[key] ? "隐藏密码" : "显示密码"}
                    >
                      <IconEye off={pwdShow[key]} />
                    </button>
                  </div>
                </label>
              ))}
              <div className="d-account__form-actions">
                <button type="button" className="d-btn d-btn--ghost" onClick={() => setPwdOpen(false)}>
                  取消
                </button>
                <button type="submit" className="d-btn">
                  确认修改
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {cancelOpen ? (
        <div className="d-modal" role="dialog" aria-modal="true" aria-label="账号注销">
          <button type="button" className="d-modal__mask" aria-label="关闭" onClick={() => setCancelOpen(false)} />
          <div className="d-modal__panel d-account__modal d-account__modal--wide">
            <button type="button" className="d-modal__close" onClick={() => setCancelOpen(false)} aria-label="关闭">
              ×
            </button>
            <h3 className="d-account__modal-warn-title">
              <IconWarn /> 账号注销
            </h3>
            <p className="d-modal__desc">注销后账号将无法继续使用，请确认操作</p>
            <form className="d-account__form" onSubmit={submitCancel}>
              <label className="d-account__field">
                <span>登录密码</span>
                <div className="d-account__pwd-wrap">
                  <input
                    type={cancelShowPwd ? "text" : "password"}
                    value={cancelForm.password}
                    onChange={(e) => setCancelForm((s) => ({ ...s, password: e.target.value }))}
                    placeholder="请输入登录密码"
                  />
                  <button
                    type="button"
                    className="d-account__eye"
                    onClick={() => setCancelShowPwd((v) => !v)}
                    aria-label={cancelShowPwd ? "隐藏密码" : "显示密码"}
                  >
                    <IconEye off={cancelShowPwd} />
                  </button>
                </div>
              </label>
              <div className="d-account__field">
                <span>手机号验证码</span>
                <div className="d-account__sms-row">
                  <div className="d-account__sms-input">
                    <span className="d-account__sms-icon" aria-hidden>
                      <IconPhone />
                    </span>
                    <input
                      value={cancelForm.smsCode}
                      onChange={(e) =>
                        setCancelForm((s) => ({ ...s, smsCode: e.target.value.replace(/\D/g, "").slice(0, 6) }))
                      }
                      placeholder="请输入短信验证码"
                      maxLength={6}
                      inputMode="numeric"
                    />
                  </div>
                  <button
                    type="button"
                    className="d-btn d-btn--ghost d-account__sms-btn"
                    onClick={sendCancelSms}
                    disabled={cancelSmsLeft > 0}
                  >
                    {cancelSmsLeft > 0 ? `${cancelSmsLeft}秒后重发` : "获取验证码"}
                  </button>
                </div>
                <p className="d-account__hint">验证码将发送至绑定手机号 {maskPhone(user.phone)}</p>
              </div>
              <div className="d-account__form-actions">
                <button type="button" className="d-btn d-btn--ghost" onClick={() => setCancelOpen(false)}>
                  取消
                </button>
                <button type="submit" className="d-btn d-btn--danger" disabled={cancelBusy}>
                  {cancelBusy ? "处理中…" : "确认注销"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
