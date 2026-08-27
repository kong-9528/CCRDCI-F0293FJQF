"use client";

import Link from "next/link";
import { useState } from "react";
import { ANALYTICS_PAGE } from "@/lib/content";
import { Reveal } from "@/components/Reveal";
import { SubscribeDialog } from "@/components/SubscribeDialog";

function ReportIcon({ reportId }: { reportId: string }) {
  return (
    <div className="p-analytics-report-icon" data-report={reportId} aria-hidden>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="64" height="64" rx="14" fill="rgba(11, 98, 184, 0.08)" />
        {reportId === "topic" && (
          <>
            <rect x="16" y="14" width="32" height="40" rx="4" fill="#fff" stroke="rgba(11,98,184,0.25)" />
            <rect x="22" y="22" width="20" height="3" rx="1.5" fill="rgba(11,98,184,0.5)" />
            <rect x="22" y="30" width="16" height="2" rx="1" fill="rgba(11,98,184,0.25)" />
            <path d="M22 40h20M22 46h14" stroke="rgba(11,98,184,0.3)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="44" cy="44" r="10" fill="rgba(0,184,198,0.2)" stroke="#00B8C6" strokeWidth="1.5" />
            <path d="M40 44h8M44 40v8" stroke="#0B62B8" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {reportId === "annual" && (
          <>
            <rect x="14" y="18" width="36" height="32" rx="4" fill="#fff" stroke="rgba(11,98,184,0.25)" />
            <path d="M20 38l8-10 8 6 10-14" stroke="#0B62B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="20" cy="38" r="2" fill="#00B8C6" />
            <circle cx="28" cy="28" r="2" fill="#00B8C6" />
            <circle cx="36" cy="34" r="2" fill="#00B8C6" />
            <circle cx="46" cy="20" r="2" fill="#00B8C6" />
          </>
        )}
        {reportId === "monthly" && (
          <>
            <rect x="16" y="16" width="32" height="28" rx="4" fill="#fff" stroke="rgba(11,98,184,0.25)" />
            <rect x="16" y="16" width="32" height="8" rx="4" fill="rgba(11,98,184,0.15)" />
            <rect x="22" y="30" width="6" height="10" rx="2" fill="rgba(11,98,184,0.35)" />
            <rect x="29" y="26" width="6" height="14" rx="2" fill="rgba(0,184,198,0.45)" />
            <rect x="36" y="32" width="6" height="8" rx="2" fill="rgba(11,98,184,0.25)" />
          </>
        )}
      </svg>
    </div>
  );
}

function DimensionIcon({ dimensionId }: { dimensionId: string }) {
  const icons: Record<string, React.ReactNode> = {
    registration: (
      <path
        d="M32 12l-14 6v16c0 10 6 18 14 20 8-2 14-10 14-20V18L32 12z"
        fill="rgba(11,98,184,0.12)"
        stroke="#0B62B8"
        strokeWidth="1.5"
      />
    ),
    query: (
      <>
        <circle cx="28" cy="28" r="12" stroke="#0B62B8" strokeWidth="2" fill="none" />
        <path d="M36 36l8 8" stroke="#00B8C6" strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
    verify: (
      <>
        <path d="M32 14l-12 5v14c0 8 5 14 12 16 7-2 12-8 12-16V19L32 14z" fill="rgba(0,184,198,0.15)" stroke="#00B8C6" strokeWidth="1.5" />
        <path d="M26 32l4 4 8-9" stroke="#0B62B8" strokeWidth="2" strokeLinecap="round" />
      </>
    ),
    audit: (
      <>
        <rect x="16" y="20" width="32" height="24" rx="4" fill="rgba(11,98,184,0.08)" stroke="rgba(11,98,184,0.3)" />
        <path d="M22 36h20M22 30h14" stroke="rgba(11,98,184,0.35)" strokeWidth="2" strokeLinecap="round" />
        <circle cx="44" cy="24" r="6" fill="rgba(0,184,198,0.25)" stroke="#00B8C6" />
      </>
    ),
  };

  return (
    <div className="p-analytics-dimension-icon" aria-hidden>
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" fill="rgba(11, 98, 184, 0.06)" />
        {icons[dimensionId]}
      </svg>
    </div>
  );
}

export function AnalyticsPageClient() {
  const { hero, overview, reports, dimensions, useCases, subscription } = ANALYTICS_PAGE;
  const [subscribeOpen, setSubscribeOpen] = useState(false);

  return (
    <div className="p-analytics-page">
      <section className="p-analytics-hero" aria-labelledby="analytics-hero-title">
        <div className="p-analytics-hero__bg" aria-hidden>
          <span className="p-analytics-hero__mesh" />
          <span className="p-analytics-hero__orb p-analytics-hero__orb--a" />
          <span className="p-analytics-hero__orb p-analytics-hero__orb--b" />
        </div>
        <div className="p-container p-analytics-hero__inner">
          <Reveal>
            <h1 id="analytics-hero-title" className="p-analytics-hero__title">
              {hero.title}
              <span className="p-analytics-hero__highlight">{hero.highlight}</span>
            </h1>
            <p className="p-analytics-hero__lead">{hero.lead}</p>
          </Reveal>
        </div>
      </section>

      <section className="p-analytics-overview" aria-labelledby="analytics-overview-title">
        <div className="p-rail">
          <Reveal>
            <h2 id="analytics-overview-title" className="p-analytics-section-title">
              {overview.title}
            </h2>
            {overview.paragraphs.map((p) => (
              <p key={p.slice(0, 24)} className="p-analytics-overview__text">
                {p}
              </p>
            ))}
          </Reveal>
          <div className="p-analytics-highlights">
            {overview.highlights.map((item, i) => (
              <Reveal key={item.title} className={`p-analytics-highlights__item p-analytics-highlights__item--${i + 1}`}>
                <div className="p-analytics-highlight">
                  <span className="p-analytics-highlight__index">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="p-analytics-highlight__title">{item.title}</h3>
                  <p className="p-analytics-highlight__desc">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-analytics-reports" aria-labelledby="analytics-reports-title">
        <div className="p-rail">
          <Reveal>
            <header className="p-analytics-reports__head">
              <h2 id="analytics-reports-title" className="p-analytics-section-title">
                {reports.title}
              </h2>
              <p className="p-analytics-section-lead">{reports.lead}</p>
            </header>
          </Reveal>
          <div className="p-analytics-reports__grid">
            {reports.items.map((report, i) => (
              <Reveal key={report.id} className={`p-analytics-reports__item p-analytics-reports__item--${i + 1}`}>
                <article className="p-analytics-report-card">
                  <ReportIcon reportId={report.id} />
                  <span className="p-analytics-report-card__cadence">{report.cadence}</span>
                  <h3 className="p-analytics-report-card__title">{report.title}</h3>
                  <p className="p-analytics-report-card__desc">{report.desc}</p>
                  <div className="p-analytics-report-card__topics">
                    <h4 className="p-analytics-report-card__label">典型议题</h4>
                    <ul>
                      {report.topics.map((topic) => (
                        <li key={topic}>{topic}</li>
                      ))}
                    </ul>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-analytics-dimensions" aria-labelledby="analytics-dimensions-title">
        <div className="p-rail">
          <Reveal>
            <header className="p-analytics-dimensions__head">
              <h2 id="analytics-dimensions-title" className="p-analytics-section-title">
                {dimensions.title}
              </h2>
              <p className="p-analytics-section-lead">{dimensions.lead}</p>
            </header>
          </Reveal>
          <div className="p-analytics-dimension-list">
            {dimensions.items.map((dim, i) => (
              <Reveal key={dim.id} className={`p-analytics-dimension p-analytics-dimension--${i + 1}`}>
                <article id={dim.id} className="p-analytics-dimension__inner">
                  <div className="p-analytics-dimension__aside">
                    <DimensionIcon dimensionId={dim.id} />
                  </div>
                  <div className="p-analytics-dimension__content">
                    <h3 className="p-analytics-dimension__title">{dim.title}</h3>
                    <p className="p-analytics-dimension__summary">{dim.summary}</p>
                    <p className="p-analytics-dimension__intro">{dim.intro}</p>

                    <div className="p-analytics-dimension__meta">
                      <div className="p-analytics-dimension__block">
                        <h4 className="p-analytics-dimension__label">核心指标</h4>
                        <ul className="p-analytics-dimension__list">
                          {dim.metrics.map((m) => (
                            <li key={m}>{m}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="p-analytics-dimension__block">
                        <h4 className="p-analytics-dimension__label">分析能力</h4>
                        <ul className="p-analytics-dimension__tags">
                          {dim.capabilities.map((cap) => (
                            <li key={cap}>{cap}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {dim.relatedHref && dim.relatedLabel && (
                      <Link href={dim.relatedHref} className="p-analytics-dimension__link">
                        {dim.relatedLabel} →
                      </Link>
                    )}
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-analytics-scenes" aria-labelledby="analytics-scenes-title">
        <div className="p-rail">
          <Reveal>
            <h2 id="analytics-scenes-title" className="p-analytics-section-title">
              适用场景
            </h2>
          </Reveal>
          <div className="p-analytics-scenes__grid">
            {useCases.map((item, i) => (
              <Reveal key={item.title} className={`p-analytics-scenes__item p-analytics-scenes__item--${i + 1}`}>
                <div className="p-analytics-scene-card">
                  <h3 className="p-analytics-scene-card__title">{item.title}</h3>
                  <p className="p-analytics-scene-card__desc">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="p-analytics-subscribe" aria-labelledby="analytics-subscribe-title">
        <div className="p-rail p-analytics-subscribe__inner">
          <Reveal>
            <h2 id="analytics-subscribe-title" className="p-analytics-subscribe__title">
              {subscription.title}
            </h2>
            <p className="p-analytics-subscribe__desc">{subscription.desc}</p>
            <p className="p-analytics-subscribe__note">{subscription.note}</p>

            <div className="p-analytics-subscribe__actions">
              <button
                type="button"
                className="p-btn p-btn--primary"
                onClick={() => setSubscribeOpen(true)}
              >
                订阅报告
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      <SubscribeDialog
        open={subscribeOpen}
        onClose={() => setSubscribeOpen(false)}
        title={subscription.title}
        desc={subscription.desc}
        note={subscription.note}
        contacts={subscription.contacts}
      />
    </div>
  );
}
