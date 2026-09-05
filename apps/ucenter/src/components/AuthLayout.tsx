import { Link } from "react-router-dom";
import type { ReactNode } from "react";

type AuthLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  return (
    <div className="uc-shell">
      <div className="uc-shell__bg" aria-hidden>
        <span className="uc-shell__grid" />
        <span className="uc-shell__wash" />
      </div>
      <header className="uc-shell__top">
        <Link to="/login" className="uc-brand">
          <span className="uc-brand__mark" aria-hidden />
          <span className="uc-brand__text">统一用户中心</span>
        </Link>
      </header>
      <main className="uc-shell__main">
        <section className="uc-panel">
          <h1 className="uc-panel__title">{title}</h1>
          {subtitle ? <p className="uc-panel__sub">{subtitle}</p> : null}
          {children}
          {footer ? <div className="uc-panel__footer">{footer}</div> : null}
        </section>
      </main>
    </div>
  );
}
