import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  changePassword,
  getBoundEmail,
  getDemoOldPasswordHint,
  getSendCodeCooldownSec,
  maskEmail,
  resetPasswordChangeFlow,
  sendEmailVerificationCode,
  verifyEmailCode,
  verifyOldPassword,
} from "@/lib/passwordAuth";

type Step = 1 | 2 | 3 | "done";

const STEPS: { key: 1 | 2 | 3; label: string }[] = [
  { key: 1, label: "验证当前密码" },
  { key: 2, label: "邮箱验证" },
  { key: 3, label: "设置新密码" },
];

export function ChangePasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [oldPassword, setOldPassword] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [revokedCount, setRevokedCount] = useState(0);

  useEffect(() => {
    return () => resetPasswordChangeFlow();
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setInterval(() => {
      setCooldown(getSendCodeCooldownSec());
    }, 1000);
    return () => window.clearInterval(timer);
  }, [cooldown]);

  const sendCode = (auto = false) => {
    const result = sendEmailVerificationCode();
    if (!result.ok) {
      if (!auto) setError(result.error);
      if (result.cooldownSec) setCooldown(result.cooldownSec);
      return;
    }
    setError(null);
    setCooldown(result.cooldownSec);
    setInfo(
      `验证码已发送至 ${result.maskedEmail}${result.demoCode ? `（演示验证码：${result.demoCode}）` : ""}`,
    );
  };

  const submitOldPassword = async () => {
    setLoading(true);
    setError(null);
    setInfo(null);
    await new Promise((r) => window.setTimeout(r, 280));
    const result = verifyOldPassword(oldPassword);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setStep(2);
    sendCode(true);
  };

  const submitEmailCode = async () => {
    setLoading(true);
    setError(null);
    await new Promise((r) => window.setTimeout(r, 220));
    const result = verifyEmailCode(emailCode);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setInfo(null);
    setStep(3);
  };

  const submitNewPassword = async () => {
    setLoading(true);
    setError(null);
    await new Promise((r) => window.setTimeout(r, 320));
    const result = changePassword(newPassword, confirmPassword);
    setLoading(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setRevokedCount(result.revokedSessions);
    setStep("done");
  };

  const stepIndex = step === "done" ? 3 : step;

  return (
    <div className="a-card c-password-page">
      <div className="a-card__head">
        修改密码
        <div className="a-card__extra">
          <Link to="/account" className="a-btn a-btn--sm">
            返回账号中心
          </Link>
        </div>
      </div>

      <div className="a-card__body a-stack">
        <p className="c-password-page__intro">
          为保障账号安全，修改密码需依次验证当前密码与绑定邮箱验证码。修改成功后将下线其他设备的登录会话，仅保留当前会话。
        </p>

        <ol className="c-password-steps" aria-label="修改密码步骤">
          {STEPS.map((item) => {
            const done = stepIndex > item.key;
            const active = step === item.key;
            return (
              <li
                key={item.key}
                className={`c-password-steps__item${done ? " is-done" : ""}${active ? " is-active" : ""}`}
              >
                <span className="c-password-steps__index">{done ? "✓" : item.key}</span>
                <span className="c-password-steps__label">{item.label}</span>
              </li>
            );
          })}
        </ol>

        {step === 1 ? (
          <section className="c-password-panel">
            <h3 className="a-form-section__title">第一步：验证当前密码</h3>
            <div className="a-field a-field--stack">
              <label className="a-field__label" htmlFor="old-password">
                当前密码
              </label>
              <input
                id="old-password"
                type="password"
                className="a-input"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                disabled={loading}
              />
              <span className="a-field__hint">
                演示环境当前密码：{getDemoOldPasswordHint()}
              </span>
            </div>
            <div className="c-password-panel__actions">
              <button
                type="button"
                className="a-btn a-btn--primary"
                disabled={loading}
                onClick={() => void submitOldPassword()}
              >
                {loading ? "验证中…" : "下一步"}
              </button>
            </div>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="c-password-panel">
            <h3 className="a-form-section__title">第二步：邮箱验证</h3>
            <p className="c-password-panel__desc">
              已向绑定邮箱 <b>{maskEmail(getBoundEmail())}</b> 发送 6 位验证码，有效期 10 分钟。
            </p>
            <div className="a-field a-field--stack">
              <label className="a-field__label" htmlFor="email-code">
                邮箱验证码
              </label>
              <div className="c-password-code-row">
                <input
                  id="email-code"
                  className="a-input"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="6 位验证码"
                  value={emailCode}
                  onChange={(e) => setEmailCode(e.target.value.replace(/\D/g, ""))}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="a-btn"
                  disabled={loading || cooldown > 0}
                  onClick={() => sendCode(false)}
                >
                  {cooldown > 0 ? `${cooldown}s 后重发` : "重新发送"}
                </button>
              </div>
              <span className="a-field__hint">同一邮箱 60 秒内仅可发送 1 次，每日上限 10 次</span>
            </div>
            <div className="c-password-panel__actions">
              <button
                type="button"
                className="a-btn"
                disabled={loading}
                onClick={() => {
                  resetPasswordChangeFlow();
                  setStep(1);
                  setEmailCode("");
                  setError(null);
                  setInfo(null);
                }}
              >
                上一步
              </button>
              <button
                type="button"
                className="a-btn a-btn--primary"
                disabled={loading}
                onClick={() => void submitEmailCode()}
              >
                {loading ? "验证中…" : "下一步"}
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="c-password-panel">
            <h3 className="a-form-section__title">第三步：设置新密码</h3>
            <div className="a-stack">
              <div className="a-field a-field--stack">
                <label className="a-field__label" htmlFor="new-password">
                  新密码
                </label>
                <input
                  id="new-password"
                  type="password"
                  className="a-input"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <div className="a-field a-field--stack">
                <label className="a-field__label" htmlFor="confirm-password">
                  确认新密码
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  className="a-input"
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
              <span className="a-field__hint">
                至少 8 位，且大写/小写/数字/特殊符 {"{!_@#}"} 中至少满足 3 种
              </span>
            </div>
            <div className="c-password-panel__actions">
              <button
                type="button"
                className="a-btn a-btn--primary"
                disabled={loading}
                onClick={() => void submitNewPassword()}
              >
                {loading ? "提交中…" : "确认修改"}
              </button>
            </div>
          </section>
        ) : null}

        {step === "done" ? (
          <section className="c-password-panel c-password-panel--success">
            <div className="c-password-success">
              <div className="c-password-success__title">密码修改成功</div>
              <p className="c-password-success__desc">
                已强制下线其他 {revokedCount} 个设备的会话，当前浏览器会话仍保持登录。
              </p>
              <div className="c-password-panel__actions">
                <Link to="/account" className="a-btn a-btn--primary">
                  返回账号中心
                </Link>
              </div>
            </div>
          </section>
        ) : null}

        {info ? <div className="a-field__hint c-password-info">{info}</div> : null}
        {error ? <div className="a-field__error">{error}</div> : null}
      </div>
    </div>
  );
}
