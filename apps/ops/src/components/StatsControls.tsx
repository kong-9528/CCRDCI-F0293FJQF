import type { StatsPeriod, TrendRange } from "@/lib/statsData";
import { STATS_PERIOD_LABEL } from "@/lib/statsData";

type Props<T extends string> = {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
};

export function SegmentedControl<T extends string>({ value, options, onChange }: Props<T>) {
  return (
    <div className="a-seg" role="group">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          className={`a-seg__item${value === opt.value ? " is-active" : ""}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function StatsPeriodToggle({
  value,
  onChange,
}: {
  value: StatsPeriod;
  onChange: (v: StatsPeriod) => void;
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      options={(["1d", "7d", "30d"] as const).map((v) => ({
        value: v,
        label: STATS_PERIOD_LABEL[v],
      }))}
    />
  );
}

export function TrendRangeToggle({
  value,
  onChange,
}: {
  value: TrendRange;
  onChange: (v: TrendRange) => void;
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={onChange}
      options={[
        { value: "7d", label: "近7日" },
        { value: "30d", label: "近30日" },
      ]}
    />
  );
}
