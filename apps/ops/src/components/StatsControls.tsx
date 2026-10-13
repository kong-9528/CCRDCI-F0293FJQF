import type { StatsPeriod, TrendGrain, TrendPeriod, TrendRange } from "@/lib/statsData";
import {
  STATS_PERIOD_LABEL,
  TREND_GRAIN_LABEL,
  defaultTrendPeriod,
} from "@/lib/statsData";

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

function clampTrendRange(grain: TrendGrain, start: string, end: string): TrendPeriod {
  if (!start || !end) return defaultTrendPeriod(grain);
  if (start <= end) return { grain, start, end };
  return { grain, start: end, end: start };
}

const YEAR_OPTIONS = (() => {
  const y = new Date().getFullYear();
  const out: number[] = [];
  for (let i = y + 1; i >= y - 15; i -= 1) out.push(i);
  return out;
})();

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function parseYearMonth(value: string): { year: number; month: number } {
  const [ys, ms] = value.split("-");
  const year = Number(ys);
  const month = Number(ms);
  return {
    year: Number.isFinite(year) ? year : new Date().getFullYear(),
    month: Number.isFinite(month) && month >= 1 && month <= 12 ? month : 1,
  };
}

function toYearMonth(year: number, month: number) {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** 中文年月选择（避免原生 type=month 英文展示） */
function ChineseMonthPicker({
  value,
  ariaLabel,
  onChange,
}: {
  value: string;
  ariaLabel: string;
  onChange: (next: string) => void;
}) {
  const { year, month } = parseYearMonth(value);
  return (
    <div className="a-trend-month" role="group" aria-label={ariaLabel}>
      <select
        className="a-select a-trend-month__year"
        value={year}
        aria-label={`${ariaLabel}年份`}
        onChange={(e) => onChange(toYearMonth(Number(e.target.value), month))}
      >
        {YEAR_OPTIONS.map((y) => (
          <option key={y} value={y}>
            {y}年
          </option>
        ))}
      </select>
      <select
        className="a-select a-trend-month__month"
        value={month}
        aria-label={`${ariaLabel}月份`}
        onChange={(e) => onChange(toYearMonth(year, Number(e.target.value)))}
      >
        {MONTH_OPTIONS.map((m) => (
          <option key={m} value={m}>
            {m}月
          </option>
        ))}
      </select>
    </div>
  );
}

const GRAIN_OPTIONS: TrendGrain[] = ["year", "month"];

/**
 * 按年 / 按月 + 自定义时间段（对齐 ops-dci 首页趋势分析交互）。
 * 切换粒度时自动填入默认区间：按月近 12 个月，按年近 5 年。
 */
export function TrendPeriodControls({
  value,
  onChange,
  className,
}: {
  value: TrendPeriod;
  onChange: (v: TrendPeriod) => void;
  className?: string;
}) {
  const onGrainChange = (grain: TrendGrain) => {
    onChange(defaultTrendPeriod(grain));
  };

  return (
    <div className={`a-trend-period${className ? ` ${className}` : ""}`}>
      <select
        className="a-select a-trend-period__grain"
        value={value.grain}
        aria-label="统计粒度"
        onChange={(e) => onGrainChange(e.target.value as TrendGrain)}
      >
        {GRAIN_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {TREND_GRAIN_LABEL[g]}
          </option>
        ))}
      </select>
      <div className="a-date-range a-trend-period__range">
        {value.grain === "month" ? (
          <>
            <ChineseMonthPicker
              value={value.start}
              ariaLabel="开始"
              onChange={(start) => onChange(clampTrendRange("month", start, value.end))}
            />
            <span className="a-date-range__sep">至</span>
            <ChineseMonthPicker
              value={value.end}
              ariaLabel="结束"
              onChange={(end) => onChange(clampTrendRange("month", value.start, end))}
            />
          </>
        ) : (
          <>
            <select
              className="a-select a-trend-period__input a-trend-period__input--year"
              value={value.start}
              aria-label="开始年份"
              onChange={(e) =>
                onChange(clampTrendRange("year", e.target.value, value.end))
              }
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={String(y)}>
                  {y}年
                </option>
              ))}
            </select>
            <span className="a-date-range__sep">至</span>
            <select
              className="a-select a-trend-period__input a-trend-period__input--year"
              value={value.end}
              aria-label="结束年份"
              onChange={(e) =>
                onChange(clampTrendRange("year", value.start, e.target.value))
              }
            >
              {YEAR_OPTIONS.map((y) => (
                <option key={y} value={String(y)}>
                  {y}年
                </option>
              ))}
            </select>
          </>
        )}
      </div>
    </div>
  );
}
