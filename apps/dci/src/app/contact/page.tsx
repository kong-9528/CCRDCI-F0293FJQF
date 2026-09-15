"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { PageHero } from "@/components/PageHero";

function randomCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 4; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export default function ContactPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [captcha, setCaptcha] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [smsSent, setSmsSent] = useState(false);
  const [form, setForm] = useState({
    orgName: "",
    contactName: "",
    phone: "",
    captchaInput: "",
    smsCode: "",
    type: "合作意向",
    detail: "",
  });

  const drawCaptcha = useCallback((code: string) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.fillStyle = "#f1f5f9";
    ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 6; i++) {
      ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.3)`;
      ctx.beginPath();
      ctx.moveTo(Math.random() * w, Math.random() * h);
      ctx.lineTo(Math.random() * w, Math.random() * h);
      ctx.stroke();
    }
    ctx.font = "bold 22px Arial";
    ctx.textBaseline = "middle";
    const start = (w - code.length * 24) / 2 + 8;
    for (let i = 0; i < code.length; i++) {
      ctx.save();
      ctx.translate(start + i * 24, h / 2 + (Math.random() - 0.5) * 6);
      ctx.rotate((Math.random() - 0.5) * 0.4);
      ctx.fillStyle = `rgb(${30 + Math.random() * 100},${30 + Math.random() * 100},${30 + Math.random() * 100})`;
      ctx.fillText(code[i], 0, 0);
      ctx.restore();
    }
  }, []);

  const refreshCaptcha = useCallback(() => {
    const next = randomCaptcha();
    setCaptcha(next);
    drawCaptcha(next);
  }, [drawCaptcha]);

  useEffect(() => {
    refreshCaptcha();
  }, [refreshCaptcha]);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const setField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const sendSms = () => {
    if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) {
      showToast("请先填写正确的手机号码");
      return;
    }
    if (!form.captchaInput.trim()) {
      showToast("请先填写图形验证码");
      return;
    }
    if (form.captchaInput.trim().toUpperCase() !== captcha) {
      showToast("图形验证码不正确");
      refreshCaptcha();
      return;
    }
    setSmsSent(true);
    showToast("短信验证码已发送，默认验证码为 0000");
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.orgName.trim() || !form.contactName.trim() || !form.phone.trim() || !form.detail.trim()) {
      showToast("请完整填写必填项");
      return;
    }
    if (!/^1[3-9]\d{9}$/.test(form.phone.trim())) {
      showToast("手机号格式不正确");
      return;
    }
    if (form.captchaInput.trim().toUpperCase() !== captcha) {
      showToast("图形验证码不正确");
      refreshCaptcha();
      return;
    }
    if (!smsSent || form.smsCode !== "0000") {
      showToast("请先获取并填写正确的短信验证码");
      return;
    }
    showToast("提交成功（演示）");
    setForm({
      orgName: "",
      contactName: "",
      phone: "",
      captchaInput: "",
      smsCode: "",
      type: "合作意向",
      detail: "",
    });
    setSmsSent(false);
    refreshCaptcha();
  };

  return (
    <div>
      {toast ? <div className="d-toast">{toast}</div> : null}
      <PageHero
        title={
          <>
            <span style={{ display: "block", fontSize: 14, letterSpacing: "0.12em", opacity: 0.8, marginBottom: 8 }}>
              CONTACT US
            </span>
            联系我们
          </>
        }
        subtitle="如有任何问题或合作意向，欢迎与我们联系"
      />

      <section className="d-section">
        <div className="d-container">
          <form className="d-card d-form" onSubmit={onSubmit}>
            <div className="d-form__grid">
              <div className="d-field">
                <label>
                  机构主体名称 <span>*</span>
                </label>
                <input value={form.orgName} onChange={(e) => setField("orgName", e.target.value)} />
              </div>
              <div className="d-field">
                <label>
                  联系人 <span>*</span>
                </label>
                <input value={form.contactName} onChange={(e) => setField("contactName", e.target.value)} />
              </div>
              <div className="d-field">
                <label>
                  手机号码 <span>*</span>
                </label>
                <input value={form.phone} onChange={(e) => setField("phone", e.target.value)} />
              </div>
              <div className="d-field">
                <label>
                  图形验证码 <span>*</span>
                </label>
                <div className="d-captcha-row">
                  <input
                    value={form.captchaInput}
                    onChange={(e) => setField("captchaInput", e.target.value)}
                    placeholder="请输入验证码"
                  />
                  <canvas
                    ref={canvasRef}
                    width={120}
                    height={44}
                    onClick={refreshCaptcha}
                    title="点击刷新验证码"
                    style={{ borderRadius: 8, border: "1px solid var(--d-border)", cursor: "pointer" }}
                  />
                </div>
              </div>
              <div className="d-field">
                <label>
                  短信验证码 <span>*</span>
                </label>
                <div className="d-sms-row">
                  <input
                    value={form.smsCode}
                    onChange={(e) => setField("smsCode", e.target.value)}
                    placeholder="默认 0000"
                  />
                  <button type="button" className="d-btn d-btn--ghost" onClick={sendSms}>
                    获取验证码
                  </button>
                </div>
              </div>
              <div className="d-field">
                <label>
                  咨询类型 <span>*</span>
                </label>
                <select value={form.type} onChange={(e) => setField("type", e.target.value)}>
                  <option value="合作意向">合作意向</option>
                  <option value="问题咨询">问题咨询</option>
                </select>
              </div>
              <div className="d-field">
                <label>
                  具体描述 <span>*</span>
                </label>
                <textarea
                  maxLength={200}
                  value={form.detail}
                  onChange={(e) => setField("detail", e.target.value)}
                />
                <div className="d-field__hint">{form.detail.length}/200</div>
              </div>
              <div className="d-form__actions">
                <button type="submit" className="d-btn" style={{ minWidth: 120 }}>
                  提交
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
