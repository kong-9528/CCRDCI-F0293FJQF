import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  actions?: ReactNode;
};

/** 列表页页头：标题 + 说明 + 右侧操作，非欢迎页风格 */
export function ListPageHeader({ title, description, actions }: Props) {
  return (
    <header className="sso-list-head">
      <div className="sso-list-head__main">
        <h1 className="sso-list-title">{title}</h1>
        {description ? <p className="sso-list-desc">{description}</p> : null}
      </div>
      {actions ? <div className="sso-list-head__actions">{actions}</div> : null}
    </header>
  );
}
