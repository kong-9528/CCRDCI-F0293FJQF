import { useState } from "react";
import { Modal } from "@/components/Modal";
import {
  INITIAL_API_KEYS,
  KEY_UPDATE_CONFIRM_TEXT,
  SECRET_MASK,
  copyText,
  rotateApiKeys,
  type ApiKeys,
} from "@/lib/keys";

export function KeysPage() {
  const [keys, setKeys] = useState<ApiKeys>(() => ({ ...INITIAL_API_KEYS }));
  const [secretVisible, setSecretVisible] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<"ak" | "sk" | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2200);
  };

  const onCopy = async (field: "ak" | "sk", value: string) => {
    const ok = await copyText(value);
    if (!ok) {
      showToast("复制失败，请手动选择复制");
      return;
    }
    setCopiedField(field);
    window.setTimeout(() => setCopiedField(null), 1000);
  };

  const openUpdate = () => {
    setConfirmText("");
    setConfirmError(null);
    setUpdateOpen(true);
  };

  const closeUpdate = () => {
    setUpdateOpen(false);
    setConfirmText("");
    setConfirmError(null);
  };

  const doUpdate = () => {
    if (confirmText.trim() !== KEY_UPDATE_CONFIRM_TEXT) {
      setConfirmError(`请输入「${KEY_UPDATE_CONFIRM_TEXT}」`);
      return;
    }
    const next = rotateApiKeys();
    setKeys(next);
    setSecretVisible(false);
    closeUpdate();
    showToast("密钥已更新，旧密钥已失效");
  };

  return (
    <div className="a-stack c-keys-page">
      {toast ? <div className="a-toast">{toast}</div> : null}

      <div className="a-card">
        <div className="a-card__head">
          API密钥管理
          <span className="a-card__extra">用于调用 API 接口时的身份认证</span>
        </div>
        <div className="a-card__body a-stack">
          <div className="c-keys-field">
            <div className="c-keys-field__label">AccessKey</div>
            <div className="c-keys-display">
              <code className="c-keys-value">{keys.accessKey}</code>
              <button
                type="button"
                className="a-btn a-btn--text a-btn--sm"
                onClick={() => onCopy("ak", keys.accessKey)}
              >
                {copiedField === "ak" ? "已复制" : "复制"}
              </button>
            </div>
          </div>

          <div className="c-keys-field">
            <div className="c-keys-field__label">
              AppSecret <span className="c-keys-field__hint">（点击查看）</span>
            </div>
            <div className="c-keys-display">
              <code className={`c-keys-value${secretVisible ? "" : " is-masked"}`}>
                {secretVisible ? keys.appSecret : SECRET_MASK}
              </code>
              <button
                type="button"
                className="a-btn a-btn--text a-btn--sm"
                onClick={() => setSecretVisible((v) => !v)}
              >
                {secretVisible ? "隐藏" : "查看"}
              </button>
              {secretVisible ? (
                <button
                  type="button"
                  className="a-btn a-btn--text a-btn--sm"
                  onClick={() => onCopy("sk", keys.appSecret)}
                >
                  {copiedField === "sk" ? "已复制" : "复制"}
                </button>
              ) : null}
            </div>
          </div>

          <div className="c-keys-foot">
            <button type="button" className="a-btn a-btn--danger a-btn--sm" onClick={openUpdate}>
              更新密钥
            </button>
            <span className="a-field__hint">更新后旧密钥将立即失效</span>
            <span className="a-field__hint c-keys-updated">最近更新：{keys.updatedAt}</span>
          </div>
        </div>
      </div>

      <Modal
        open={updateOpen}
        title="确认更新密钥"
        onClose={closeUpdate}
        footer={
          <>
            <button type="button" className="a-btn" onClick={closeUpdate}>
              取消
            </button>
            <button type="button" className="a-btn a-btn--danger" onClick={doUpdate}>
              确认更新
            </button>
          </>
        }
      >
        <div className="c-keys-warn">
          <div className="c-keys-warn__title">危险操作</div>
          <p className="c-keys-warn__desc">
            更新后旧密钥将立即失效，已发出的请求将中断。请确保已通知所有调用方更新密钥。
          </p>
        </div>
        <div className="a-field a-field--stack" style={{ marginTop: 16 }}>
          <label className="a-field__label" htmlFor="confirm-key-input">
            请输入「{KEY_UPDATE_CONFIRM_TEXT}」以继续
          </label>
          <input
            id="confirm-key-input"
            className="a-input"
            value={confirmText}
            placeholder={KEY_UPDATE_CONFIRM_TEXT}
            onChange={(e) => {
              setConfirmText(e.target.value);
              setConfirmError(null);
            }}
            autoComplete="off"
          />
          {confirmError ? <span className="a-field__error">{confirmError}</span> : null}
        </div>
      </Modal>
    </div>
  );
}
