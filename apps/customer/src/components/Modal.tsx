import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  footer,
  size = "md",
  className,
}: Props) {
  if (!open) return null;

  const sizeClass = size === "lg" ? " a-modal--lg" : size === "md" ? " a-modal--md" : "";

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`a-modal${sizeClass}${className ? ` ${className}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="a-modal__head">
          <div className="a-modal__head-text">
            <h3 id="modal-title" className="a-modal__title">
              {title}
            </h3>
            {description ? <p className="a-modal__desc">{description}</p> : null}
          </div>
          <button type="button" className="a-modal__close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="a-modal__body">{children}</div>
        {footer ? <div className="a-modal__actions">{footer}</div> : null}
      </div>
    </div>
  );
}
