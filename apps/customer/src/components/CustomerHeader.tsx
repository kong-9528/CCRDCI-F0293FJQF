import { findNavLabel } from "@/lib/nav";

type Props = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function CustomerHeader({ pathname, collapsed, onToggleCollapse }: Props) {
  const title = findNavLabel(pathname);

  return (
    <header className="a-header">
      <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onToggleCollapse}>
        {collapsed ? "»" : "«"}
      </button>
      <div className="a-header__crumb">
        控制台 / <b>{title}</b>
      </div>
      <div className="a-header__title">{title}</div>
      <div className="a-header__actions">
        <div className="a-header__user">
          <span className="a-header__avatar">企</span>
          <span>艾克米文化传媒</span>
        </div>
      </div>
    </header>
  );
}
