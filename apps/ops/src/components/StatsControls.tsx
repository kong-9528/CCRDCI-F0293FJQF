import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { StatsPeriod, TrendGrain, TrendPeriod, TrendRange } from "@/lib/statsData";
import {
  STATS_PERIOD_LABEL,
  TREND_GRAIN_LABEL,
  defaultTrendPeriod,
  formatDate,
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

const GRAIN_OPTIONS: TrendGrain[] = ["month", "year"];
const WEEKDAYS = ["日", "一", "二", "三", "四", "五", "六"];

function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  date.setHours(12, 0, 0, 0);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthMatrix(year: number, month: number): Date[] {
  const first = new Date(year, month, 1);
  first.setHours(12, 0, 0, 0);
  const start = new Date(first);
  start.setDate(1 - first.getDay());
  return Array.from({ length: 42 }, (_, i) => {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    return day;
  });
}

function shiftMonth(year: number, month: number, delta: number) {
  const date = new Date(year, month + delta, 1);
  return { year: date.getFullYear(), month: date.getMonth() };
}

/**
 * 对齐 ops-dci 首页 el-date-picker type="daterange" size="small"。
 * 先点开始日期，再点结束日期。
 */
function DateRangeEditor({
  start,
  end,
  onChange,
}: {
  start: string;
  end: string;
  onChange: (start: string, end: string) => void;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const [draftStart, setDraftStart] = useState(start);
  const [draftEnd, setDraftEnd] = useState(end);
  const [awaitingEnd, setAwaitingEnd] = useState(false);
  const [hover, setHover] = useState("");
  const initial = parseIsoDate(start) ?? new Date();
  const [viewYear, setViewYear] = useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = useState(initial.getMonth());

  useEffect(() => {
    if (open) return;
    setDraftStart(start);
    setDraftEnd(end);
    setAwaitingEnd(false);
  }, [start, end, open]);

  useEffect(() => {
    if (!open) return;
    const place = () => {
      const box = rootRef.current?.getBoundingClientRect();
      if (!box) return;
      const width = 468;
      const left = Math.min(Math.max(8, box.left), window.innerWidth - width - 8);
      setPos({ top: box.bottom + 6, left });
    };
    const onPointer = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target) || popRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    place();
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    window.addEventListener("resize", place);
    window.addEventListener("scroll", place, true);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", place);
      window.removeEventListener("scroll", place, true);
    };
  }, [open]);

  const openPanel = () => {
    const anchor = parseIsoDate(start) ?? new Date();
    setViewYear(anchor.getFullYear());
    setViewMonth(anchor.getMonth());
    setDraftStart(start);
    setDraftEnd(end);
    setAwaitingEnd(false);
    setHover("");
    setOpen(true);
  };

  const pick = (iso: string) => {
    if (!awaitingEnd || !draftStart) {
      setDraftStart(iso);
      setDraftEnd("");
      setAwaitingEnd(true);
      setHover("");
      return;
    }
    const nextStart = iso < draftStart ? iso : draftStart;
    const nextEnd = iso < draftStart ? draftStart : iso;
    setDraftStart(nextStart);
    setDraftEnd(nextEnd);
    setAwaitingEnd(false);
    onChange(nextStart, nextEnd);
    setOpen(false);
  };

  const shownStart = open ? draftStart : start;
  const shownEnd = open ? draftEnd : end;
  const next = shiftMonth(viewYear, viewMonth, 1);
  const previewEnd = awaitingEnd && hover ? hover : draftEnd;
  const rangeStart =
    previewEnd && draftStart && previewEnd < draftStart ? previewEnd : draftStart;
  const rangeEnd =
    previewEnd && draftStart && previewEnd < draftStart ? draftStart : previewEnd;

  const renderMonth = (year: number, month: number) => (
    <div className="a-range-cal">
      <div className="a-range-cal__title">
        {year}年 {month + 1}月
      </div>
      <div className="a-range-cal__week">
        {WEEKDAYS.map((day) => (
          <span key={day}>{day}</span>
        ))}
      </div>
      <div className="a-range-cal__grid">
        {monthMatrix(year, month).map((day) => {
          const iso = formatDate(day);
          const outside = day.getMonth() !== month;
          const inRange = Boolean(rangeStart && rangeEnd && iso >= rangeStart && iso <= rangeEnd);
          const isEdge = iso === rangeStart || iso === rangeEnd;
          return (
            <button
              key={iso + month}
              type="button"
              className={`a-range-cal__day${outside ? " is-out" : ""}${inRange ? " is-in" : ""}${isEdge ? " is-edge" : ""}`}
              onMouseEnter={() => setHover(iso)}
              onClick={() => pick(iso)}
            >
              {day.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className={`a-range-editor${open ? " is-open" : ""}`} ref={rootRef}>
      <button type="button" className="a-range-editor__box" onClick={openPanel} aria-label="时间范围">
        <span className={`a-range-editor__text${shownStart ? "" : " is-placeholder"}`}>
          {shownStart || "开始日期"}
        </span>
        <span className="a-range-editor__sep">至</span>
        <span className={`a-range-editor__text${shownEnd ? "" : " is-placeholder"}`}>
          {shownEnd || "结束日期"}
        </span>
        <svg className="a-range-editor__icon" viewBox="0 0 16 16" aria-hidden="true">
          <rect x="1.6" y="2.6" width="12.8" height="11.2" rx="1.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
          <path d="M1.6 6.2h12.8M5 1.4v2.4M11 1.4v2.4" fill="none" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      </button>
      {open
        ? createPortal(
            <div
              ref={popRef}
              className="a-range-pop"
              role="dialog"
              aria-label="选择日期范围"
              style={{ top: pos.top, left: pos.left }}
            >
              <div className="a-range-pop__nav">
                <button
                  type="button"
                  aria-label="上个月"
                  onClick={() => {
                    const prev = shiftMonth(viewYear, viewMonth, -1);
                    setViewYear(prev.year);
                    setViewMonth(prev.month);
                  }}
                >
                  ‹
                </button>
                <span />
                <button
                  type="button"
                  aria-label="下个月"
                  onClick={() => {
                    setViewYear(next.year);
                    setViewMonth(next.month);
                  }}
                >
                  ›
                </button>
              </div>
              <div className="a-range-pop__months">
                {renderMonth(viewYear, viewMonth)}
                {renderMonth(next.year, next.month)}
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}

/**
 * 按月 / 按年 + 日期范围（对齐 ops-dci 首页：daterange + 粒度）。
 * 默认按月、近 12 个月；切到按年时改为近 5 年。日期范围对两种粒度共用同一控件。
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
  return (
    <div className={`a-trend-period${className ? ` ${className}` : ""}`}>
      <DateRangeEditor
        start={value.start}
        end={value.end}
        onChange={(start, end) => onChange({ ...value, start, end })}
      />
      <select
        className="a-select a-trend-period__grain"
        value={value.grain}
        aria-label="统计粒度"
        onChange={(e) => onChange(defaultTrendPeriod(e.target.value as TrendGrain))}
      >
        {GRAIN_OPTIONS.map((g) => (
          <option key={g} value={g}>
            {TREND_GRAIN_LABEL[g]}
          </option>
        ))}
      </select>
    </div>
  );
}
