"use client";

import Link from "next/link";

const FOOTER_LINKS = [
  { label: "DCI查询", href: "/query", icon: "/assets/icons/query.png" },
  { label: "常见问题", href: "/faq", icon: "/assets/icons/faq.png" },
  { label: "联系我们", href: "/contact", icon: "/assets/icons/contact.png" },
] as const;

const FOOTER_DESC =
  "DCI管理中心是数字版权唯一标识符的管理中心，负责DCI体系的顶层设计、标准制定、全局监督与数据治理，确保DCI体系的权威性、规范性及可持续发展";

export function PortalFooter() {
  return (
    <div id="dci-footer" className="portal-footer">
      <div className="footer-inner">
        <div className="footer-main">
          <img
            className="footer-logo"
            src="/assets/logo/logo.png"
            alt=""
          />
          <span className="footer-desc">{FOOTER_DESC}</span>
          <div className="footer-links">
            {FOOTER_LINKS.map((link) => (
              <Link key={link.href} href={link.href} className="footer-link">
                <img
                  className="footer-link-icon"
                  src={link.icon}
                  alt=""
                />
                <span>{link.label}</span>
              </Link>
            ))}
          </div>
        </div>
        <div className="footer-line" />
        <span className="text_49">
          © 2026 中国版权保护中心 京ICP备09080213号-2
        </span>
      </div>
    </div>
  );
}
