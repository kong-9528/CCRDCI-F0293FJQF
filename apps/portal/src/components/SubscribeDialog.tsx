"use client";

import { useEffect } from "react";
import type { AnalyticsSubscriptionContact } from "@/lib/content";

type Props = {
  open: boolean;
  onClose: () => void;
  title: string;
  desc: string;
  note: string;
  contacts: AnalyticsSubscriptionContact[];
};

export function SubscribeDialog({ open, onClose, title, desc, note, contacts }: Props) {
  useEffect(() => {
    if (!open) return;
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

  return (
    <div className="p-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="p-modal p-modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="subscribe-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="p-modal__close" aria-label="关闭" onClick={onClose}>
          ×
        </button>
        <h2 id="subscribe-title" className="p-modal__title">
          {title}
        </h2>
        <p className="p-modal__desc">{desc}</p>
        <p className="p-modal__desc" style={{ marginTop: 8, fontSize: 13, color: "var(--n-400)" }}>
          {note}
        </p>

        {contacts.map((contact) => (
          <div key={contact.role} className="p-analytics-contact-card" style={{ marginTop: 24 }}>
            <span className="p-analytics-contact-card__role">{contact.role}</span>
            <p className="p-analytics-contact-card__desc">{contact.desc}</p>
            <dl className="p-analytics-contact-card__details">
              <div>
                <dt>联系电话</dt>
                <dd>
                  <a href={`tel:${contact.phone.replace(/[^\d-]/g, "").split("（")[0]}`}>{contact.phone}</a>
                </dd>
              </div>
              <div>
                <dt>商务邮箱</dt>
                <dd>
                  <a href={`mailto:${contact.email}`}>{contact.email}</a>
                </dd>
              </div>
              <div>
                <dt>服务时间</dt>
                <dd>{contact.hours}</dd>
              </div>
            </dl>
          </div>
        ))}

        <div style={{ marginTop: 24 }}>
          <button type="button" className="p-btn p-btn--primary p-btn--block" onClick={onClose}>
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
