"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function LoginModal({ open, onClose }: Props) {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setError("");
    setPassword("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await login(username, password);
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    onClose();
  };

  return (
    <div className="p-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="p-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="login-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="p-modal__close" aria-label="关闭" onClick={onClose}>
          ×
        </button>
        <h2 id="login-title" className="p-modal__title">
          登录
        </h2>
        <p className="p-modal__desc">使用运营开通的企业账号登录。演示密码：demo123</p>
        <form onSubmit={submit}>
          <div className="p-field">
            <label htmlFor="login-username">用户名</label>
            <input
              id="login-username"
              className="p-input"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
            />
          </div>
          <div className="p-field">
            <label htmlFor="login-password">密码</label>
            <input
              id="login-password"
              type="password"
              className="p-input"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
            />
          </div>
          {error ? <div className="p-field__error">{error}</div> : null}
          <div className="p-modal__footer-links">
            <Link href="/forgot-password" onClick={onClose}>
              忘记密码？
            </Link>
            <span style={{ color: "var(--n-400)", fontSize: 13 }}>账号由运营开通</span>
          </div>
          <button type="submit" className="p-btn p-btn--primary p-btn--block" disabled={loading}>
            {loading ? "登录中…" : "登录"}
          </button>
        </form>
      </div>
    </div>
  );
}
