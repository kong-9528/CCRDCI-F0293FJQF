type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

/** 页面内确认弹窗（替代 window.confirm） */
export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确定",
  cancelText = "取消",
  danger,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="sso-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="sso-modal sso-modal--sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="sso-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sso-modal__head">
          <h3 id="sso-confirm-title">{title}</h3>
          <button type="button" className="sso-modal__close" aria-label="关闭" onClick={onCancel}>
            ×
          </button>
        </div>
        <div className="sso-modal__body">
          <p className="sso-confirm__desc">{description}</p>
        </div>
        <div className="sso-form-actions sso-confirm__actions">
          <button type="button" className="sso-btn sso-btn--ghost" onClick={onCancel}>
            {cancelText}
          </button>
          <button
            type="button"
            className={`sso-btn ${danger ? "sso-btn--danger" : "sso-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
