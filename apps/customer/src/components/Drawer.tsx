import { useEffect, type ReactNode } from "react";

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  width?: number;
};

export function Drawer({ open, title, onClose, children, width = 480 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="c-drawer-root" role="presentation">
      <div className="c-drawer-backdrop" onClick={onClose} />
      <aside
        className="c-drawer"
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="c-drawer-title"
      >
        <header className="c-drawer__head">
          <h2 id="c-drawer-title" className="c-drawer__title">
            {title}
          </h2>
          <button type="button" className="c-drawer__close" aria-label="关闭" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="c-drawer__body">{children}</div>
      </aside>
    </div>
  );
}
