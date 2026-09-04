import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Link } from "react-router-dom";

type CommonProps = {
  icon: ReactNode;
  children: ReactNode;
  danger?: boolean;
  className?: string;
  title?: string;
};

type LinkProps = CommonProps & {
  to: string;
  onClick?: ButtonHTMLAttributes<HTMLAnchorElement>["onClick"];
};

type ButtonProps = CommonProps & {
  to?: undefined;
  onClick?: ButtonHTMLAttributes<HTMLButtonElement>["onClick"];
  disabled?: boolean;
};

/** 列表操作列：SVG 图标 + 文字 */
export function TableAction(props: LinkProps | ButtonProps) {
  const { icon, children, danger, className, title } = props;
  const cls = `a-link-action${danger ? " a-link-action--danger" : ""}${className ? ` ${className}` : ""}`;

  if ("to" in props && props.to) {
    return (
      <Link to={props.to} className={cls} title={title} onClick={props.onClick}>
        {icon}
        {children}
      </Link>
    );
  }

  const buttonProps = props as ButtonProps;
  return (
    <button
      type="button"
      className={cls}
      title={title}
      disabled={buttonProps.disabled}
      onClick={buttonProps.onClick}
    >
      {icon}
      {children}
    </button>
  );
}
