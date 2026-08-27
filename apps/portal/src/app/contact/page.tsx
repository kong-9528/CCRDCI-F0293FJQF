import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_INFO } from "@/lib/content";

export const metadata: Metadata = {
  title: "联系我们",
};

export default function ContactPage() {
  return (
    <div className="p-page">
      <div className="p-container p-page__prose">
        <h1 className="p-h1">联系我们</h1>
        <p>如需了解产品能力、商务合作或账号开通，请通过以下方式联系。</p>
        <div className="p-contact-list" style={{ marginTop: 32, maxWidth: 520 }}>
          <div className="p-contact-item">
            <strong>商务电话</strong>
            <span>{CONTACT_INFO.phone}</span>
          </div>
          <div className="p-contact-item">
            <strong>商务邮箱</strong>
            <span>{CONTACT_INFO.email}</span>
          </div>
          <div className="p-contact-item">
            <strong>响应说明</strong>
            <span>{CONTACT_INFO.address}</span>
          </div>
        </div>
        <p style={{ marginTop: 32 }}>
          <Link href="/" className="p-btn p-btn--outline">
            返回首页
          </Link>
        </p>
      </div>
    </div>
  );
}
