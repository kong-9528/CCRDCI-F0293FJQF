import {
  ACCOUNT_STATUS_LABEL,
  PERIOD_STATUS_LABEL,
  PRODUCTS,
  derivePeriodStatus,
  productName,
  type ProductCode,
} from "@/lib/catalog";
import { getCustomers, listPeriodStatus } from "@/lib/customersStore";

export type StatsPeriod = "1d" | "7d" | "30d";

export const STATS_PERIOD_LABEL: Record<StatsPeriod, string> = {
  "1d": "昨日",
  "7d": "近7日",
  "30d": "近30日",
};

export type TrendRange = "7d" | "30d";

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function formatDate(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function daysAgo(n: number) {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() - n);
  return d;
}

export function dateRange(days: number): string[] {
  const out: string[] = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    out.push(formatDate(daysAgo(i)));
  }
  return out;
}

function hash(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i += 1) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h;
}

function seeded(seed: number, min: number, max: number) {
  const x = Math.sin(seed) * 10000;
  const r = x - Math.floor(x);
  return Math.floor(min + r * (max - min + 1));
}

export type AccountDayStat = {
  date: string;
  customerId: string;
  account: string;
  companyName: string;
  contactName: string;
  calls: number;
  successRate: number;
  accountStatus: string;
  periodStatus: string;
};

export type AccountProductDayStat = {
  date: string;
  customerId: string;
  account: string;
  companyName: string;
  contactName: string;
  product: ProductCode;
  productLabel: string;
  calls: number;
  successRate: number;
  accountStatus: string;
  periodStatus: string;
};

export type ProductDayStat = {
  date: string;
  product: ProductCode;
  productLabel: string;
  activeAccounts: number;
  calls: number;
  successRate: number;
};

/** 生成近 30 天演示统计（确定性，便于联调） */
function buildMock() {
  const customers = getCustomers();
  const dates = dateRange(30);
  const accountDays: AccountDayStat[] = [];
  const accountProductDays: AccountProductDayStat[] = [];
  const productDays: ProductDayStat[] = [];

  for (const date of dates) {
    for (const c of customers) {
      const base = hash(`${c.id}:${date}`);
      const active = seeded(base, 0, 10) > 2;
      const calls = active ? seeded(base + 1, 20, 480) : 0;
      const successRate =
        calls === 0 ? 0 : Number((90 + seeded(base + 2, 0, 99) / 10).toFixed(1));
      accountDays.push({
        date,
        customerId: c.id,
        account: c.account,
        companyName: c.companyName,
        contactName: c.contactName,
        calls,
        successRate,
        accountStatus: ACCOUNT_STATUS_LABEL[c.status],
        periodStatus: PERIOD_STATUS_LABEL[listPeriodStatus(c)],
      });

      for (const svc of c.productServices) {
        const pb = hash(`${c.id}:${svc.product}:${date}`);
        const pActive = active && seeded(pb, 0, 10) > 3;
        const pCalls = pActive ? seeded(pb + 1, 5, 160) : 0;
        const pRate =
          pCalls === 0 ? 0 : Number((88 + seeded(pb + 2, 0, 110) / 10).toFixed(1));
        accountProductDays.push({
          date,
          customerId: c.id,
          account: c.account,
          companyName: c.companyName,
          contactName: c.contactName,
          product: svc.product,
          productLabel: productName(svc.product),
          calls: pCalls,
          successRate: pRate,
          accountStatus: ACCOUNT_STATUS_LABEL[c.status],
          periodStatus: PERIOD_STATUS_LABEL[derivePeriodStatus(svc.startDate, svc.endDate)],
        });
      }
    }

    for (const p of PRODUCTS) {
      const rows = accountProductDays.filter(
        (r) => r.date === date && r.product === p.code,
      );
      const calls = rows.reduce((s, r) => s + r.calls, 0);
      const activeAccounts = rows.filter((r) => r.calls > 0).length;
      const weighted = rows.reduce((s, r) => s + r.calls * r.successRate, 0);
      productDays.push({
        date,
        product: p.code,
        productLabel: p.name,
        activeAccounts,
        calls,
        successRate: calls === 0 ? 0 : Number((weighted / calls).toFixed(1)),
      });
    }
  }

  return { accountDays, accountProductDays, productDays, customers };
}

let cache: ReturnType<typeof buildMock> | null = null;

export function getStatsData() {
  if (!cache) cache = buildMock();
  return cache;
}

/** 客户变更后可刷新演示数据（本页会话内按需） */
export function refreshStatsData() {
  cache = buildMock();
  return cache;
}

export function periodDays(period: StatsPeriod | TrendRange): number {
  if (period === "1d") return 1;
  if (period === "7d") return 7;
  return 30;
}

export function sliceDates(period: StatsPeriod | TrendRange): string[] {
  return dateRange(periodDays(period));
}

export function sumCalls(rows: { calls: number }[]) {
  return rows.reduce((s, r) => s + r.calls, 0);
}

export function avgSuccessRate(rows: { calls: number; successRate: number }[]) {
  const calls = sumCalls(rows);
  if (!calls) return 0;
  return Number(
    (rows.reduce((s, r) => s + r.calls * r.successRate, 0) / calls).toFixed(1),
  );
}

export function downloadCsv(filename: string, header: string[], rows: string[][]) {
  const lines = [
    header.join(","),
    ...rows.map((r) =>
      r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","),
    ),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportAccountDailyCsv() {
  const { accountDays } = getStatsData();
  downloadCsv(
    "客户使用统计报表.csv",
    [
      "日期",
      "账号",
      "公司名称",
      "联系人姓名",
      "当日调用次数",
      "当日成功率",
      "当日该账号的状态",
      "当日该账号的服务期状态",
    ],
    accountDays.map((r) => [
      r.date,
      r.account,
      r.companyName,
      r.contactName,
      String(r.calls),
      `${r.successRate}%`,
      r.accountStatus,
      r.periodStatus,
    ]),
  );
}

export function exportAccountProductDailyCsv(products?: ProductCode[]) {
  const { accountProductDays } = getStatsData();
  const rows = products?.length
    ? accountProductDays.filter((r) => products.includes(r.product))
    : accountProductDays;
  downloadCsv(
    "账号产品调用明细报表.csv",
    [
      "日期",
      "账号",
      "公司名称",
      "联系人姓名",
      "产品",
      "当日调用次数",
      "当日成功率",
      "当日该账号的状态",
      "当日该账号的服务期状态",
    ],
    rows.map((r) => [
      r.date,
      r.account,
      r.companyName,
      r.contactName,
      r.productLabel,
      String(r.calls),
      `${r.successRate}%`,
      r.accountStatus,
      r.periodStatus,
    ]),
  );
}

export function exportProductDailyCsv(products?: ProductCode[]) {
  const { productDays } = getStatsData();
  const rows = products?.length
    ? productDays.filter((r) => products.includes(r.product))
    : productDays;
  downloadCsv(
    "产品使用统计报表.csv",
    ["日期", "产品名称", "当日调用账号数", "当日调用次数", "当日成功率"],
    rows.map((r) => [
      r.date,
      r.productLabel,
      String(r.activeAccounts),
      String(r.calls),
      `${r.successRate}%`,
    ]),
  );
}
