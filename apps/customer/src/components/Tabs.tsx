type TabItem<T extends string> = {
  key: T;
  label: string;
};

type Props<T extends string> = {
  items: TabItem<T>[];
  active: T;
  onChange: (key: T) => void;
  className?: string;
};

export function Tabs<T extends string>({ items, active, onChange, className }: Props<T>) {
  return (
    <div className={`a-tabs${className ? ` ${className}` : ""}`} role="tablist">
      {items.map((item) => (
        <button
          key={item.key}
          type="button"
          role="tab"
          aria-selected={active === item.key}
          className={`a-tabs__item${active === item.key ? " is-active" : ""}`}
          onClick={() => onChange(item.key)}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}
