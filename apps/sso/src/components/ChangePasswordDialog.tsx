import { useState } from "react";
import { useAuth } from "@/lib/auth";

type Props = {
  onClose: () => void;
};

export function ChangePasswordDialog({ onClose }: Props) {
  const { changeOwnPassword } = useAuth();
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
    <div className="sso-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="sso-modal"
        role="dialog"
        aria-modal
        aria-labelledby="sso-pwd-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="sso-pwd-title">修改密码</h3>
        <form className="sso-form" onSubmit={onSubmit}>
          <p className="sso-hint">使用原密码校验后即可更新，无需短信或邮箱二次验证。</p>
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
            <button type="button" className="sso-btn sso-btn--ghost" onClick={onClose}>
              {ok ? "关闭" : "取消"}
            </button>
            <button type="submit" className="sso-btn sso-btn--primary">
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
