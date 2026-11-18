/** 演示「今天」固定为 2026-11-18，避免本机日期漂移导致 mock 记录过期 */

export const DEMO_TODAY = new Date(2026, 10, 18, 12, 0, 0, 0);

export function demoNow(): Date {
  return new Date(DEMO_TODAY.getTime());
}

/** 相对演示今天往前推 n 天，返回 `YYYY-MM-DD HH:mm:ss` */
export function daysAgo(n: number, hour = 10, minute = 0, second = 0): string {
  const d = demoNow();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, second, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export function nowStamp(hour = 14, minute = 30, second = 0): string {
  const d = demoNow();
  d.setHours(hour, minute, second, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

/** 展示用短日期 MM-DD HH:mm（相对演示今天） */
export function shortDaysAgo(n: number, hour = 10, minute = 0): string {
  const d = demoNow();
  d.setDate(d.getDate() - n);
  d.setHours(hour, minute, 0, 0);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${mm}-${dd} ${hh}:${mi}`;
}

/** 列表页默认查询区间（含演示今天） */
export function defaultDemoDateRange(days: number): { from: string; to: string } {
  const to = demoNow();
  const from = demoNow();
  from.setDate(from.getDate() - days);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);
  return { from: fmt(from), to: fmt(to) };
}
