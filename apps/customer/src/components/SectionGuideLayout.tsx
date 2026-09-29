import { useEffect, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { PaneHeader } from "@/components/PaneHeader";

export type GuideSection = {
  id: string;
  label: string;
  /** 右侧内容区标题，默认用 label */
  title?: string;
  /** 右侧内容区副标题 */
  description?: string;
  /** 标题左侧图标（对齐 home header-icon-wrapper） */
  icon?: ReactNode;
  /** 标题行右侧操作（如 API 文档链接） */
  headerActions?: ReactNode;
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
  const [searchParams] = useSearchParams();
  const sectionFromUrl = (searchParams.get("section") || "").trim();

  const resolveId = (preferred?: string | null) => {
    if (preferred && sections.some((s) => s.id === preferred)) return preferred;
    if (defaultSectionId && sections.some((s) => s.id === defaultSectionId)) {
      return defaultSectionId;
    }
    return sections[0]?.id;
  };

  const [activeId, setActiveId] = useState(() => resolveId(sectionFromUrl));

  useEffect(() => {
    if (!sectionFromUrl) return;
    if (!sections.some((s) => s.id === sectionFromUrl)) return;
    setActiveId(sectionFromUrl);
  }, [sectionFromUrl, sections]);

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
        <PaneHeader
          title={active.title ?? active.label}
          icon={active.icon}
          actions={active.headerActions}
          subtitle={active.description}
        />
        <div className="c-section-guide__body a-stack">{active.content}</div>
        {footer ? <div className="c-section-guide__footer">{footer}</div> : null}
      </div>
    </div>
  );
}
