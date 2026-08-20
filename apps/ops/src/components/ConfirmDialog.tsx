type Props = {
  open: boolean;
  title: string;
  description: string;
  confirmText?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  description,
  confirmText = "确定",
  danger,
  onConfirm,
  onCancel,
}: Props) {
  if (!open) return null;

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onCancel}>
      <div
        className="a-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ops-confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="ops-confirm-title" className="a-modal__title">
          {title}
        </h3>
        <p className="a-modal__desc">{description}</p>
        <div className="a-modal__actions">
          <button type="button" className="a-btn" onClick={onCancel}>
            取消
          </button>
          <button
            type="button"
            className={`a-btn ${danger ? "a-btn--danger" : "a-btn--primary"}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
