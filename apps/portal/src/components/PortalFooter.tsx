import Link from "next/link";

export function PortalFooter() {
  return (
    <footer className="p-footer">
      <div className="p-rail p-footer__inner">
        <div className="p-footer__row">
          <nav className="p-footer__nav" aria-label="页脚链接">
            <Link href="/contact">联系我们</Link>
            <Link href="/legal/disclaimer">免责声明</Link>
            <Link href="/legal/privacy">隐私保护</Link>
          </nav>
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
