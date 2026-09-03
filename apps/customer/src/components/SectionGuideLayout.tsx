import { useState, type ReactNode } from "react";

export type GuideSection = {
  id: string;
  label: string;
  /** 右侧内容区标题，默认用 label */
  title?: string;
  /** 右侧内容区副标题 */
  description?: string;
  content: ReactNode;
};

type Props = {
  sections: GuideSection[];
  /** 始终显示在右侧底部（如免责声明） */
  footer?: ReactNode;
  defaultSectionId?: string;
  className?: string;
};

export function SectionGuideLayout({
  sections,
  footer,
  defaultSectionId,
  className,
}: Props) {
  const initial =
    defaultSectionId && sections.some((s) => s.id === defaultSectionId)
      ? defaultSectionId
      : sections[0]?.id;
  const [activeId, setActiveId] = useState(initial);
  const active = sections.find((s) => s.id === activeId) ?? sections[0];

  if (!sections.length || !active) return null;

  return (
    <div className={`c-section-guide${className ? ` ${className}` : ""}`}>
      <aside className="c-section-guide__aside" aria-label="板块导航">
        <nav className="c-section-guide__menu">
          {sections.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`c-section-guide__item${s.id === active.id ? " is-active" : ""}`}
              onClick={() => setActiveId(s.id)}
            >
              {s.label}
            </button>
          ))}
        </nav>
      </aside>

      <div className="c-section-guide__main">
        {active.title || active.description ? (
          <div className="c-section-guide__intro">
            {active.title ? (
              <h2 className="c-section-guide__title">{active.title}</h2>
            ) : null}
            {active.description ? (
              <p className="c-section-guide__desc">{active.description}</p>
            ) : null}
          </div>
        ) : null}
        <div className="c-section-guide__body a-stack">{active.content}</div>
        {footer ? <div className="c-section-guide__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
