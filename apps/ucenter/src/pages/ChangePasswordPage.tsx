import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { AuthLayout } from "@/components/AuthLayout";
import { useAuth } from "@/lib/auth";
import { changePassword, isValidPassword } from "@/lib/accountStore";

/** 已登录态安全能力：修改密码（供 customer 等重定向接入） */
export function ChangePasswordPage() {
  const { user, ready } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (ready && !user) {
    return <Navigate to="/login?returnUrl=/security/password" replace />;
  }

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) return;
    if (!isValidPassword(password)) {
      setError("新密码须为 8–12 位");
      return;
    }
    if (password !== confirm) {
      setError("两次输入的密码不一致");
      return;
    }
    const result = changePassword(user.username, oldPassword, password);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setDone(true);
  };

  return (
    <AuthLayout
      title="修改密码"
      subtitle="凭原密码设置新密码"
      footer={<Link to="/security">返回安全设置</Link>}
    >
      {done ? (
        <div className="uc-success">
          <p>密码已更新。</p>
          <Link className="uc-btn uc-btn--primary uc-btn--block" to="/security">
            完成
          </Link>
        </div>
      ) : (
        <form className="uc-form" onSubmit={onSubmit}>
          <div className="uc-field">
            <label htmlFor="uc-cp-old">原密码</label>
            <input
              id="uc-cp-old"
              type="password"
              className="uc-input"
              autoComplete="current-password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
            />
          </div>
          <div className="uc-field">
            <label htmlFor="uc-cp-new">新密码</label>
            <input
              id="uc-cp-new"
              type="password"
              className="uc-input"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="8–12 位"
            />
          </div>
          <div className="uc-field">
            <label htmlFor="uc-cp-confirm">确认新密码</label>
            <input
              id="uc-cp-confirm"
              type="password"
              className="uc-input"
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
          </div>
          {error ? <div className="uc-alert uc-alert--error">{error}</div> : null}
          <button type="submit" className="uc-btn uc-btn--primary uc-btn--block">
            保存
          </button>
        </form>
      )}
    </AuthLayout>
  );
}
