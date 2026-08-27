"use client";

import { useEffect } from "react";
import { CONTACT_INFO } from "@/lib/content";

type Props = {
  open: boolean;
  onClose: () => void;
};

export function JoinDialog({ open, onClose }: Props) {
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
        aria-labelledby="join-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="p-modal__close" aria-label="关闭" onClick={onClose}>
          ×
        </button>
        <h2 id="join-title" className="p-modal__title">
          加入合作
        </h2>
        <p className="p-modal__desc">
          平台为企业客户提供线下签约开通服务。请通过以下方式联系我们，商务将协助完成洽谈与开通。
        </p>
        <div className="p-contact-list">
          <div className="p-contact-item">
            <strong>地址</strong>
            <span>{CONTACT_INFO.address}</span>
          </div>
          <div className="p-contact-item">
            <strong>电话</strong>
            <span>{CONTACT_INFO.phone}</span>
          </div>
          <div className="p-contact-item">
            <strong>商务邮箱</strong>
            <span>{CONTACT_INFO.email}</span>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="button" className="p-btn p-btn--primary p-btn--block" onClick={onClose}>
            知道了
          </button>
        </div>
      </div>
    </div>
  );
}
