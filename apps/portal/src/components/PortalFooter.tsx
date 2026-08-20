import Link from "next/link";
import { CONTACT_INFO, PLATFORM_NAME } from "@/lib/content";

export function PortalFooter() {
  return (
    <footer className="p-footer">
      <div className="p-container">
        <div className="p-footer__grid">
          <div>
            <div className="p-footer__brand">{PLATFORM_NAME}</div>
            <p style={{ margin: 0, maxWidth: 360, lineHeight: 1.7 }}>
              面向企业客户的版权数据服务与智能审核能力平台。线下签约开通，按调用次数计量。
            </p>
          </div>
          <div>
            <div className="p-footer__title">支持</div>
            <div className="p-footer__links">
              <Link href="/help">帮助中心</Link>
              <Link href="/contact">联系我们</Link>
              <Link href="/legal/disclaimer">免责声明</Link>
              <Link href="/legal/privacy">隐私保护</Link>
            </div>
          </div>
          <div>
            <div className="p-footer__title">联系方式</div>
            <div className="p-footer__links">
              <span>电话 {CONTACT_INFO.phone}</span>
              <span>邮箱 {CONTACT_INFO.email}</span>
            </div>
          </div>
        </div>
        <div className="p-footer__bottom">
          <span>© {new Date().getFullYear()} {PLATFORM_NAME}. All rights reserved.</span>
          <span>ICP备案号：待填写</span>
        </div>
      </div>
    </footer>
  );
}
