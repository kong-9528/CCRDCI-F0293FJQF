import type { ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg";
};

export function Modal({ open, title, onClose, children, footer, size = "md" }: Props) {
  if (!open) return null;

  const sizeClass = size === "lg" ? " a-modal--lg" : size === "md" ? " a-modal--md" : "";

  return (
    <div className="a-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className={`a-modal${sizeClass}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 id="modal-title" className="a-modal__title">
          {title}
        </h3>
        <div className="a-modal__body">{children}</div>
        {footer ? <div className="a-modal__actions">{footer}</div> : null}
      </div>
    </div>
  );
}
