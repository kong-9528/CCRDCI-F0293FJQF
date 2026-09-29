import type { ReactNode } from "react";

type Props = {
  title: string;
  /** 32×32 图标槽内的 18px 图标；默认文档图标 */
  icon?: ReactNode;
  /** 右侧操作区（如 API 文档链接） */
  actions?: ReactNode;
  /** 标题下方说明，左缘与标题文字对齐（32+12） */
  subtitle?: ReactNode;
  as?: "h1" | "h2";
  className?: string;
};

function DefaultDocIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M7 3h7l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M14 3v5h5" stroke="currentColor" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M9 13h6M9 17h6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

/** 对齐 home 注册中心工作台右侧卡片标题：icon + 16px/600/#303133 */
export function PaneHeader({
  title,
  icon,
  actions,
  subtitle,
  as: Tag = "h2",
  className,
}: Props) {
  return (
    <div className={`c-pane-header${className ? ` ${className}` : ""}`}>
      <div className="c-pane-header__row">
        <div className="c-pane-header__left">
          <div className="c-pane-header__icon" aria-hidden>
            {icon ?? <DefaultDocIcon />}
          </div>
          <Tag className="c-pane-header__title">{title}</Tag>
        </div>
        {actions ? <div className="c-pane-header__actions">{actions}</div> : null}
      </div>
      {subtitle ? <div className="c-pane-header__sub">{subtitle}</div> : null}
    </div>
  );
}

export function PaneIconKey() {
  return (
    <svg width="18" height="18" viewBox="0 0 1024 1024" fill="currentColor" aria-hidden>
      <path d="M448 456.064V96a32 32 0 0 1 32-32.064L672 64a32 32 0 0 1 0 64H512v128h160a32 32 0 0 1 0 64H512v128a256 256 0 1 1-64 8.064zM512 896a192 192 0 1 0 0-384 192 192 0 0 0 0 384z" />
    </svg>
  );
}

export function PaneIconChart() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path d="M4 19h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M7 16V9M12 16V5M17 16v-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export function PaneIconShield() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3 5 6v5c0 5 3.2 8.4 7 9.5 3.8-1.1 7-4.5 7-9.5V6l-7-3Z"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d="M9.5 12.5 11 14l3.5-4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PaneIconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="11" cy="11" r="6.5" stroke="currentColor" strokeWidth="1.75" />
      <path d="M16.5 16.5 20 20" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}
