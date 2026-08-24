import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  HELP_NAV,
  getHelpSection,
  type HelpBlock,
  type HelpFaqItem,
  type HelpSectionId,
} from "@/lib/help";

function isHelpSectionId(v: string | null): v is HelpSectionId {
  return HELP_NAV.some((n) => n.id === v);
}

export function HelpCenterPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fromQuery = searchParams.get("section");
  const [active, setActive] = useState<HelpSectionId>(
    isHelpSectionId(fromQuery) ? fromQuery : "quickstart",
  );
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    if (isHelpSectionId(fromQuery)) setActive(fromQuery);
    else if (!fromQuery) setActive("quickstart");
  }, [fromQuery]);

  const section = getHelpSection(active);

  const select = (id: HelpSectionId) => {
    setActive(id);
    setOpenFaq(null);
    setSearchParams(id === "quickstart" ? {} : { section: id }, { replace: true });
  };

  return (
    <div className="c-help-layout">
      <aside className="c-help-sidebar" aria-label="帮助目录">
        {HELP_NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`c-help-nav__item${active === item.id ? " is-active" : ""}`}
            onClick={() => select(item.id)}
          >
            {item.title}
          </button>
        ))}
      </aside>
      <article className="a-card c-help-content">
        <div className="a-card__body">
          <h2 className="c-help-content__title">{section.title}</h2>
          {section.blocks.map((block, i) => (
            <HelpBlockView
              key={`${section.id}-${i}`}
              block={block}
              openFaq={openFaq}
              onToggleFaq={(id) => setOpenFaq((cur) => (cur === id ? null : id))}
            />
          ))}
        </div>
      </article>
    </div>
  );
}

function HelpBlockView({
  block,
  openFaq,
  onToggleFaq,
}: {
  block: HelpBlock;
  openFaq: string | null;
  onToggleFaq: (id: string) => void;
}) {
  if (block.type === "p") {
    return <p className="c-help-p">{block.text}</p>;
  }
  if (block.type === "h3") {
    return <h3 className="c-help-h3">{block.text}</h3>;
  }
  if (block.type === "ul") {
    return (
      <ul className="c-help-ul">
        {block.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    );
  }
  if (block.type === "link") {
    return (
      <p className="c-help-link-row">
        <Link to={block.to} className="a-btn a-btn--text a-btn--sm">
          {block.label} →
        </Link>
        {block.hint ? <span className="a-field__hint">{block.hint}</span> : null}
      </p>
    );
  }
  return (
    <div className="c-help-faq">
      {block.items.map((item) => (
        <FaqItem
          key={item.id}
          item={item}
          open={openFaq === item.id}
          onToggle={() => onToggleFaq(item.id)}
        />
      ))}
    </div>
  );
}

function FaqItem({
  item,
  open,
  onToggle,
}: {
  item: HelpFaqItem;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={`c-help-faq__item${open ? " is-open" : ""}`}>
      <button type="button" className="c-help-faq__q" onClick={onToggle} aria-expanded={open}>
        <span>{item.question}</span>
        <span className="c-help-faq__chevron" aria-hidden>
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? <div className="c-help-faq__a">{item.answer}</div> : null}
    </div>
  );
}
