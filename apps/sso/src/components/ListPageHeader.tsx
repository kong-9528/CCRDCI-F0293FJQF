import type { ReactNode } from "react";

type Props = {
  /** @deprecated 顶部已有面包屑，不再展示页面粗体标题 */
  title?: string;
  description?: string;
  actions?: ReactNode;
};

/** 列表页辅助区：仅说明文案（可选）；新增类按钮请放筛选行右侧 */
export function ListPageHeader({ description, actions }: Props) {
  if (!description && !actions) return null;
  return (
    <header className="sso-list-head">
      <div className="sso-list-head__main">
        {description ? <p className="sso-list-desc sso-list-desc--visible">{description}</p> : null}
      </div>
      {actions ? <div className="sso-list-head__actions">{actions}</div> : null}
    </header>
  );
}
