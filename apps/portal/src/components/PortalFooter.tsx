import { CONTACT_INFO } from "@/lib/content";

export function PortalFooter() {
  return (
    <footer className="p-footer">
      <div className="p-rail p-footer__inner">
        <div className="p-footer__row">
          <div className="p-footer__contact">
            <h2 className="p-footer__contact-title">联系我们</h2>
            <p className="p-footer__contact-line">地址：{CONTACT_INFO.address}</p>
            <p className="p-footer__contact-line">电话：{CONTACT_INFO.phone}</p>
          </div>
          <p className="p-footer__copy">
            中国版权保护中心 ©{" "}
            <a href="https://www.ccopyright.com" target="_blank" rel="noopener noreferrer">
              www.ccopyright.com
            </a>{" "}
            京ICP备09080213号
          </p>
        </div>
      </div>
    </footer>
  );
}
