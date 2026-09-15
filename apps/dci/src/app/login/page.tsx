"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LOGO_WHITE } from "@/lib/content";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"account" | "phone">("account");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [smsCode, setSmsCode] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === "account") {
      if (!username.trim() || !password.trim()) {
        showToast("请填写账号和密码");
        return;
      }
    } else {
      if (!/^1[3-9]\d{9}$/.test(phone.trim())) {
        showToast("请填写正确的手机号");
        return;
      }
      if (smsCode !== "0000") {
        showToast("短信验证码不正确（演示默认 0000）");
        return;
      }
    }
    showToast("登录成功（演示）");
    window.setTimeout(() => router.push("/"), 800);
  };

  return (
    <div className="d-login">
      {toast ? <div className="d-toast">{toast}</div> : null}
      <div className="d-login__card">
        <aside className="d-login__aside">
          <img src={LOGO_WHITE} alt="DCI" width={48} height={48} style={{ filter: "brightness(0) invert(1)" }} />
          <h2>数字版权唯一标识符</h2>
          <p>DCI 体系为每一件数字作品提供全球唯一的版权标识，助力数字内容确权、交易与保护。</p>
        </aside>
        <div className="d-login__body">
          <div className="d-login__tabs">
            <button
              type="button"
              className={`d-login__tab${tab === "account" ? " is-active" : ""}`}
              onClick={() => setTab("account")}
            >
              账号登录
            </button>
            <button
              type="button"
              className={`d-login__tab${tab === "phone" ? " is-active" : ""}`}
              onClick={() => setTab("phone")}
            >
              手机登录
            </button>
          </div>
          <form className="d-form__grid" onSubmit={onSubmit}>
            {tab === "account" ? (
              <>
                <div className="d-field">
                  <label>账号</label>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="请输入账号" />
                </div>
                <div className="d-field">
                  <label>密码</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="d-field">
                  <label>手机号</label>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" />
                </div>
                <div className="d-field">
                  <label>短信验证码</label>
                  <div className="d-sms-row">
                    <input
                      value={smsCode}
                      onChange={(e) => setSmsCode(e.target.value)}
                      placeholder="默认 0000"
                    />
                    <button
                      type="button"
                      className="d-btn d-btn--ghost"
                      onClick={() => showToast("短信验证码已发送，默认 0000")}
                    >
                      获取验证码
                    </button>
                  </div>
                </div>
              </>
            )}
            <button type="submit" className="d-btn" style={{ width: "100%", minHeight: 44 }}>
              登录
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
