type SwitchProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** 无障碍名称 */
  "aria-label": string;
  disabled?: boolean;
};

/** 轻量开关：用于上线状态等即时切换 */
export function Switch({
  checked,
  onChange,
  "aria-label": ariaLabel,
  disabled,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      className={`a-switch${checked ? " is-on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="a-switch__track" aria-hidden>
        <span className="a-switch__thumb" />
      </span>
    </button>
  );
}
