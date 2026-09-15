import type { ReactNode } from "react";

type Props = {
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  children?: ReactNode;
};

export function PageHero({ title, subtitle, align = "center", children }: Props) {
  return (
    <section className={`d-page-hero${align === "left" ? " d-page-hero--left" : ""}`}>
      <div className="d-page-hero__grid" aria-hidden />
      <div className="d-page-hero__deco" aria-hidden />
      <div className="d-container">
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </div>
    </section>
  );
}
