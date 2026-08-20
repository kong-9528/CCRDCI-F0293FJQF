"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ShowcaseTheme = {
  id: string;
  title: string;
  desc: string;
  visual: string;
};

type Props = {
  id: string;
  eyebrow: string;
  heading: string;
  themes: ShowcaseTheme[];
  subtle?: boolean;
};

const AUTO_MS = 3000;

export function ProductShowcase({ id, eyebrow, heading, themes, subtle }: Props) {
  const n = themes.length;
  const [index, setIndex] = useState(0);
  const [trackPos, setTrackPos] = useState(1);
  const [withTransition, setWithTransition] = useState(true);
  const [progressKey, setProgressKey] = useState(0);
  const locked = useRef(false);
  const paused = useRef(false);
  const touchX = useRef<number | null>(null);
  const indexRef = useRef(0);
  const trackPosRef = useRef(1);

  indexRef.current = index;
  trackPosRef.current = trackPos;

  const extended = [themes[n - 1], ...themes, themes[0]];

  const slideBy = useCallback(
    (dir: 1 | -1) => {
      if (locked.current) return;
      locked.current = true;
      setWithTransition(true);
      setTrackPos((p) => {
        const next = p + dir;
        trackPosRef.current = next;
        return next;
      });
      setIndex((i) => (i + dir + n) % n);
      setProgressKey((k) => k + 1);
    },
    [n],
  );

  const jumpTo = (target: number) => {
    if (locked.current || target === indexRef.current) return;
    locked.current = true;
    setWithTransition(true);
    setIndex(target);
    const next = target + 1;
    trackPosRef.current = next;
    setTrackPos(next);
    setProgressKey((k) => k + 1);
  };

  const onTransitionEnd = () => {
    const pos = trackPosRef.current;
    if (pos === 0) {
      setWithTransition(false);
      trackPosRef.current = n;
      setTrackPos(n);
    } else if (pos === n + 1) {
      setWithTransition(false);
      trackPosRef.current = 1;
      setTrackPos(1);
    }
    locked.current = false;
  };

  useEffect(() => {
    if (withTransition) return;
    const raf = requestAnimationFrame(() => setWithTransition(true));
    return () => cancelAnimationFrame(raf);
  }, [withTransition, trackPos]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (paused.current) return;
      slideBy(1);
    }, AUTO_MS);
    return () => clearInterval(timer);
  }, [slideBy]);

  return (
    <section
      id={id}
      className={`p-showcase${subtle ? " p-showcase--subtle" : ""}`}
      data-tone={subtle ? "audit" : "verify"}
      aria-label={heading}
      onMouseEnter={() => {
        paused.current = true;
      }}
      onMouseLeave={() => {
        paused.current = false;
        setProgressKey((k) => k + 1);
      }}
    >
      <div className="p-showcase__atmosphere" aria-hidden>
        <span className="p-showcase__orb p-showcase__orb--a" />
        <span className="p-showcase__orb p-showcase__orb--b" />
        <span className="p-showcase__grid" />
      </div>

      <button
        type="button"
        className="p-showcase__arrow p-showcase__arrow--prev"
        aria-label="上一主题"
        onClick={() => slideBy(-1)}
      >
        ‹
      </button>
      <button
        type="button"
        className="p-showcase__arrow p-showcase__arrow--next"
        aria-label="下一主题"
        onClick={() => slideBy(1)}
      >
        ›
      </button>

      <div className="p-rail p-showcase__frame">
        <div className="p-section__head p-showcase__head">
          <div className="p-eyebrow">{eyebrow}</div>
          <h2 className="p-h2" style={{ margin: "12px 0 0" }}>
            {heading}
          </h2>
        </div>

        <div
          className="p-showcase__viewport"
          onTouchStart={(e) => {
            touchX.current = e.touches[0].clientX;
          }}
          onTouchEnd={(e) => {
            if (touchX.current == null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (dx > 48) slideBy(-1);
            else if (dx < -48) slideBy(1);
          }}
        >
          <div
            className={`p-showcase__track${withTransition ? " is-animating" : ""}`}
            style={{ transform: `translate3d(-${trackPos * 100}%, 0, 0)` }}
            onTransitionEnd={onTransitionEnd}
          >
            {extended.map((theme, slot) => {
              const tags = theme.visual.split("·").map((s) => s.trim()).filter(Boolean);
              return (
                <article
                  key={`${theme.id}-${slot}`}
                  className="p-showcase__slide"
                  data-theme={theme.id}
                >
                  <div className="p-showcase__copy">
                    <span className="p-showcase__accent" aria-hidden />
                    <h3 className="p-showcase__title">{theme.title}</h3>
                    <p className="p-showcase__desc">{theme.desc}</p>
                    <ul className="p-showcase__chips">
                      {tags.map((tag) => (
                        <li key={tag}>{tag}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-showcase__visual">
                    <div className="p-showcase__visual-bg" aria-hidden>
                      <span className="p-showcase__beam" />
                      <span className="p-showcase__ring p-showcase__ring--lg" />
                      <span className="p-showcase__ring p-showcase__ring--sm" />
                      <span className="p-showcase__shard p-showcase__shard--1" />
                      <span className="p-showcase__shard p-showcase__shard--2" />
                      <span className="p-showcase__mesh" />
                    </div>
                    <div className="p-showcase__visual-inner">
                      <div className="p-showcase__glass">
                        <div className="p-showcase__visual-title">{theme.title}</div>
                        <div className="p-showcase__visual-tags">{theme.visual}</div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        <div className="p-showcase__dots" role="tablist" aria-label="主题切换">
          {themes.map((t, i) => (
            <button
              key={t.id}
              type="button"
              className={`p-showcase__dot${i === index ? " is-active" : ""}`}
              aria-label={t.title}
              onClick={() => jumpTo(i)}
            >
              {i === index ? (
                <span
                  key={progressKey}
                  className="p-showcase__dot-progress"
                  style={{ animationDuration: `${AUTO_MS}ms` }}
                />
              ) : null}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
