import { findNavLabel } from "@/lib/nav";

type Props = {
  pathname: string;
  collapsed: boolean;
  onToggleCollapse: () => void;
};

export function OpsHeader({ pathname, collapsed, onToggleCollapse }: Props) {
  const title = findNavLabel(pathname);

  return (
    <header className="a-header">
      <button type="button" className="a-btn a-btn--text a-btn--sm" onClick={onToggleCollapse}>
        {collapsed ? "»" : "«"}
      </button>
      <div className="a-header__crumb">
        运营后台 / <b>{title}</b>
      </div>
      <div className="a-header__actions">
        <div className="a-header__user">
          <span className="a-header__avatar">运</span>
          <span>运营管理员</span>
        </div>
      </div>
    </header>
  );
}
