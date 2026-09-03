import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { RequirePerm } from "@/components/RequireAuth";

export function ChangePasswordPage() {
  return (
    <RequirePerm code="sso.password">
      <ChangePasswordForm />
    </RequirePerm>
  );
}

function ChangePasswordForm() {
  const { changeOwnPassword } = useAuth();
  const navigate = useNavigate();
  const [oldPassword, setOldPassword] = useState("");
  const [nextPassword, setNextPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState(false);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setOk(false);
    if (nextPassword !== confirm) {
      setError("两次输入的新密码不一致");
      return;
    }
    const result = changeOwnPassword(oldPassword, nextPassword);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setOk(true);
    setOldPassword("");
    setNextPassword("");
    setConfirm("");
  };

  return (
    <div className="sso-narrow">
      <header className="sso-list-head">
        <div className="sso-list-head__main">
          <h1 className="sso-list-title">修改密码</h1>
          <p className="sso-list-desc">使用原密码校验后即可更新，无需短信或邮箱二次验证。</p>
        </div>
      </header>
      <div className="sso-card">
        <form className="sso-form" onSubmit={onSubmit}>
          <div className="sso-field">
            <label htmlFor="old-pwd">原密码</label>
            <input
              id="old-pwd"
              type="password"
              className="sso-input"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          <div className="sso-field">
            <label htmlFor="new-pwd">新密码</label>
            <input
              id="new-pwd"
              type="password"
              className="sso-input"
              value={nextPassword}
              onChange={(e) => setNextPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="至少 6 位"
            />
          </div>
          <div className="sso-field">
            <label htmlFor="confirm-pwd">确认新密码</label>
            <input
              id="confirm-pwd"
              type="password"
              className="sso-input"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          {error ? <div className="sso-error">{error}</div> : null}
          {ok ? <div className="sso-success">密码已更新</div> : null}
          <div className="sso-form-actions">
            <Link to="/" className="sso-btn sso-btn--ghost">
              返回
            </Link>
            <button type="submit" className="sso-btn sso-btn--primary">
              保存
            </button>
          </div>
        </form>
      </div>
      <button type="button" className="sso-linkish" onClick={() => navigate(-1)}>
        ← 返回上一页
      </button>
    </div>
  );
}
