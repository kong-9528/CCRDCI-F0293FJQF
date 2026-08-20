import Link from "next/link";
import { PLATFORM_NAME } from "@/lib/content";

export function PortalFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="p-footer">
      <div className="p-rail p-footer__inner">
        <div className="p-footer__row">
          <div className="p-footer__brand-row">
            <span className="p-footer__mark" aria-hidden>
              版
            </span>
            <span className="p-footer__name">{PLATFORM_NAME}</span>
          </div>
          <nav className="p-footer__nav" aria-label="页脚链接">
            <Link href="/contact">联系我们</Link>
            <Link href="/legal/disclaimer">免责声明</Link>
            <Link href="/legal/privacy">隐私保护</Link>
          </nav>
        </div>
        <p className="p-footer__copy">
          © {year} {PLATFORM_NAME}
        </p>
      </div>
    </footer>
  );
}
