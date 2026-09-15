import Link from "next/link";
import { FOOTER, LOGO_WHITE } from "@/lib/content";

function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.7" />
      <path d="M16.5 16.5L20 20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function IconHelp() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M9.5 9.5a2.5 2.5 0 1 1 3.6 2.2c-.7.4-1.1.9-1.1 1.8"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="17" r="1" fill="currentColor" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 4h3l1.5 4-2 1.2a12 12 0 0 0 5.3 5.3L16 12.5l4 1.5v3a2 2 0 0 1-2.2 2A15 15 0 0 1 5 8.2 2 2 0 0 1 7 4Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const ICONS = [IconSearch, IconHelp, IconPhone];

export function SiteFooter() {
  return (
    <footer className="d-footer">
      <div className="d-container d-footer__grid">
        <div>
          <div className="d-footer__brand">
            <img src={LOGO_WHITE} alt="DCI" />
            <span className="d-footer__brand-name">{FOOTER.title}</span>
          </div>
          <p className="d-footer__desc">{FOOTER.description}</p>
        </div>
        <div>
          <h3 className="d-footer__title">快捷入口</h3>
          <ul className="d-footer__links">
            {FOOTER.quickLinks.map((item, idx) => {
              const Icon = ICONS[idx] ?? IconSearch;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <Icon />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
      <div className="d-footer__bottom">
        <div className="d-container">
          {FOOTER.copyright}　{FOOTER.icp}
        </div>
      </div>
    </footer>
  );
}
