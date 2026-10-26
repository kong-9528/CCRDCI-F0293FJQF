import type { ButtonHTMLAttributes, ReactNode } from "react";

type Props = {
  icon: ReactNode;
  children: ReactNode;
  danger?: boolean;
  className?: string;
  title?: string;
  disabled?: boolean;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
};

/** 列表操作列：SVG 图标 + 文字，无按钮框 */
export function TableAction({
  icon,
  children,
  danger,
  className,
  title,
  disabled,
  onClick,
}: Props) {
  const cls = `a-link-action${danger ? " a-link-action--danger" : ""}${className ? ` ${className}` : ""}`;
  return (
    <button type="button" className={cls} title={title} disabled={disabled} onClick={onClick}>
      {icon}
      {children}
    </button>
  );
}
