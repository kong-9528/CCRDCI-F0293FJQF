import {
  ACCOUNT_STATUS_LABEL,
  PERIOD_STATUS_LABEL,
  SERVICE_STATUS_LABEL,
  derivePeriodStatus,
  deriveServiceStatus,
  normalizeProductCode,
  productName,
  type ConfigurableProductCode,
  type ProductCode,
} from "@/lib/catalog";
import { getCustomers, listPeriodStatus } from "@/lib/customersStore";
import {
  AUDIT_STATS_PRODUCTS,
  VERIFY_STATS_PRODUCTS,
  statsProductCodesForScope,
  type StatsScope,
} from "@/lib/statsScope";

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
  pageSubmitCalls: number;
  apiCalls: number;
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
  /** 当日总调用 = 页面提交 + API */
  calls: number;
  pageSubmitCalls: number;
  apiCalls: number;
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
  pageSubmitCalls: number;
  apiCalls: number;
  successRate: number;
};

/**
 * 演示日报表生成规则（对齐真实「账号+产品+Web/API」日报）：
 * - 跑表当日若该「账号×产品」未开通（未到有效期 / 已过期 / 已停止）：不写入日报
 * - 若已开通：必须写入一行；当日无调用也记 0，这是「时段内曾具备权限」的依据
 */
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
      const pageSubmitCalls = active ? seeded(base + 4, 0, calls) : 0;
      const apiCalls = calls - pageSubmitCalls;
      const successRate =
        calls === 0 ? 0 : Number((90 + seeded(base + 2, 0, 99) / 10).toFixed(1));
      accountDays.push({
        date,
        customerId: c.id,
        account: c.account,
        companyName: c.companyName,
        contactName: c.contactName,
        calls,
        pageSubmitCalls,
        apiCalls,
        successRate,
        accountStatus: ACCOUNT_STATUS_LABEL[c.status],
        periodStatus: PERIOD_STATUS_LABEL[listPeriodStatus(c)],
      });

      for (const svc of c.productServices) {
        const product = normalizeProductCode(svc.product);
        // 未开通日不落库（演示：停止 或 不在产品有效期内）
        if (svc.stopped) continue;
        if (date < svc.startDate || date > svc.endDate) continue;

        const emitRow = (
          code: ProductCode,
          label: string,
          pCalls: number,
          pageSubmit: number,
          api: number,
          rate: number,
        ) => {
          accountProductDays.push({
            date,
            customerId: c.id,
            account: c.account,
            companyName: c.companyName,
            contactName: c.contactName,
            product: code,
            productLabel: label,
            calls: pCalls,
            pageSubmitCalls: pageSubmit,
            apiCalls: api,
            successRate: rate,
            accountStatus: ACCOUNT_STATUS_LABEL[c.status],
            periodStatus: PERIOD_STATUS_LABEL[derivePeriodStatus(svc.startDate, svc.endDate)],
          });
        };

        if (product === "workReview") {
          // 审核开通拆成 3 个能力维度落库，供「作品智能辅助审核统计」使用
          for (const cap of AUDIT_STATS_PRODUCTS) {
            const pb = hash(`${c.id}:${cap.code}:${date}`);
            const hadTraffic = active && seeded(pb, 0, 10) > 3;
            const pCalls = hadTraffic ? seeded(pb + 1, 3, 80) : 0;
            const pRate =
              pCalls === 0 ? 0 : Number((88 + seeded(pb + 2, 0, 110) / 10).toFixed(1));
            emitRow(cap.code, cap.name, pCalls, 0, pCalls, pRate);
          }
          continue;
        }

        const pb = hash(`${c.id}:${product}:${date}`);
        const hadTraffic = active && seeded(pb, 0, 10) > 3;
        const pCalls = hadTraffic ? seeded(pb + 1, 5, 160) : 0;
        const pageSubmitCalls = pCalls === 0 ? 0 : seeded(pb + 4, 0, pCalls);
        const apiCalls = pCalls - pageSubmitCalls;
        const pRate =
          pCalls === 0 ? 0 : Number((88 + seeded(pb + 2, 0, 110) / 10).toFixed(1));
        emitRow(product, productName(product), pCalls, pageSubmitCalls, apiCalls, pRate);
      }
    }

    for (const p of [...VERIFY_STATS_PRODUCTS, ...AUDIT_STATS_PRODUCTS]) {
      const rows = accountProductDays.filter(
        (r) => r.date === date && r.product === p.code,
      );
      const calls = rows.reduce((s, r) => s + r.calls, 0);
      const pageSubmitCalls = rows.reduce((s, r) => s + r.pageSubmitCalls, 0);
      const apiCalls = rows.reduce((s, r) => s + r.apiCalls, 0);
      const activeAccounts = rows.filter((r) => r.calls > 0).length;
      const weighted = rows.reduce((s, r) => s + r.calls * r.successRate, 0);
      productDays.push({
        date,
        product: p.code,
        productLabel: p.name,
        activeAccounts,
        calls,
        pageSubmitCalls,
        apiCalls,
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

export function sumPageSubmitCalls(rows: { pageSubmitCalls: number }[]) {
  return rows.reduce((s, r) => s + r.pageSubmitCalls, 0);
}

export function sumApiCalls(rows: { apiCalls: number }[]) {
  return rows.reduce((s, r) => s + r.apiCalls, 0);
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
    ["日期", "产品名称", "当日调用机构数", "当日调用次数", "当日成功率"],
    rows.map((r) => [
      r.date,
      r.productLabel,
      String(r.activeAccounts),
      String(r.calls),
      `${r.successRate}%`,
    ]),
  );
}

/**
 * 账号×产品维度：统计周期内的汇总行。
 *
 * 数据源仅为「账号+产品」日报表（见 buildMock 约定）：
 * - 周期内至少有 1 条日报 → 视为时段内曾开通该产品，进入明细/矩阵可填格（汇总可为 0）
 * - 周期内完全无日报 → 未开通/已到期/已停用 → 不进入本汇总，矩阵显示「—」
 */
export type AccountProductSummary = {
  customerId: string;
  account: string;
  companyName: string;
  contactName: string;
  product: ProductCode;
  productLabel: string;
  productCategory: "verify" | "audit";
  calls: number;
  pageSubmitCalls: number;
  apiCalls: number;
  successRate: number;
  /**
   * 有调用天数：所选时段内，该组合「页面提交 + API」之和 > 0 的天数。
   * （日报中 calls = pageSubmitCalls + apiCalls）
   */
  daysWithCalls: number;
  lifetimeUsed: number;
  quotaTotal: number | null;
  quotaUsagePct: number | null;
  serviceStatus: string;
  accountStatus: string;
  periodStatus: string;
};

export type AccountProductMatrix = {
  accounts: { customerId: string; account: string; companyName: string }[];
  products: { code: ProductCode; label: string; category: "verify" | "audit" }[];
  cells: Map<string, number>;
  maxCalls: number;
};

function statsRowCategory(code: ProductCode): "verify" | "audit" {
  if ((AUDIT_STATS_PRODUCTS as readonly { code: string }[]).some((p) => p.code === code)) {
    return "audit";
  }
  return "verify";
}

function statsProductLabel(code: ProductCode) {
  const hit = [...VERIFY_STATS_PRODUCTS, ...AUDIT_STATS_PRODUCTS].find((p) => p.code === code);
  if (hit) return hit.name;
  return productName(normalizeProductCode(code));
}

/**
 * 按筛选条件汇总「账号×产品」日报。
 * 只输出周期内日报中出现过的组合；配置里有开通但时段内无日报的组合不会出现。
 */
export function buildAccountProductSummaries(
  period: StatsPeriod,
  filters?: {
    product?: ProductCode | "";
    /** @deprecated 请用 scope */
    category?: "verify" | "audit" | "";
    scope?: StatsScope;
    accountQuery?: string;
  },
): AccountProductSummary[] {
  const { accountProductDays, customers } = getStatsData();
  const customerById = new Map(customers.map((c) => [c.id, c]));
  const dates = new Set(sliceDates(period));
  const periodRows = accountProductDays.filter((r) => dates.has(r.date));
  const scope = filters?.scope ?? (filters?.category || undefined);
  const scopeCodes = scope ? new Set(statsProductCodesForScope(scope)) : null;

  type Acc = {
    customerId: string;
    account: string;
    companyName: string;
    contactName: string;
    product: ProductCode;
    dayRows: AccountProductDayStat[];
  };
  const groups = new Map<string, Acc>();

  for (const r of periodRows) {
    const product = r.product;
    const cat = statsRowCategory(product);
    if (filters?.product && product !== filters.product) continue;
    if (scopeCodes && !scopeCodes.has(product)) continue;
    if (!scopeCodes && filters?.category && cat !== filters.category) continue;

    const q = filters?.accountQuery?.trim().toLowerCase() ?? "";
    if (
      q &&
      !r.account.toLowerCase().includes(q) &&
      !r.companyName.toLowerCase().includes(q)
    ) {
      continue;
    }

    const key = `${r.customerId}:${product}`;
    const cur = groups.get(key);
    if (cur) {
      cur.dayRows.push(r);
    } else {
      groups.set(key, {
        customerId: r.customerId,
        account: r.account,
        companyName: r.companyName,
        contactName: r.contactName,
        product,
        dayRows: [r],
      });
    }
  }

  const summaries: AccountProductSummary[] = [];
  for (const g of groups.values()) {
    const cat = statsRowCategory(g.product);
    const dayRows = g.dayRows;
    const calls = sumCalls(dayRows);
    const pageSubmitCalls = sumPageSubmitCalls(dayRows);
    const apiCalls = sumApiCalls(dayRows);
    const daysWithCalls = dayRows.filter(
      (r) => r.pageSubmitCalls + r.apiCalls > 0,
    ).length;

    const customer = customerById.get(g.customerId);
    const lookupCode =
      cat === "audit" ? ("workReview" as ConfigurableProductCode) : (g.product as ConfigurableProductCode);
    const svcs =
      customer?.productServices.filter(
        (s) => normalizeProductCode(s.product) === lookupCode,
      ) ?? [];
    const lifetimeUsed = svcs.reduce((s, x) => s + x.usedCount, 0);
    const quotaTotal = svcs.reduce<number | null>((acc, x) => {
      if (x.quotaType === "unlimited") return acc;
      const t = x.quotaTotal ?? 0;
      return (acc ?? 0) + t;
    }, null);
    const quotaUsagePct =
      quotaTotal == null || quotaTotal <= 0
        ? null
        : Math.min(100, Math.round((lifetimeUsed / quotaTotal) * 100));
    const primarySvc = svcs[0];
    const serviceStatus = primarySvc
      ? SERVICE_STATUS_LABEL[deriveServiceStatus(primarySvc)]
      : "—";

    summaries.push({
      customerId: g.customerId,
      account: g.account,
      companyName: g.companyName,
      contactName: g.contactName,
      product: g.product,
      productLabel: statsProductLabel(g.product),
      productCategory: cat,
      calls,
      pageSubmitCalls,
      apiCalls,
      successRate:
        calls === 0
          ? 0
          : Number(
              (
                dayRows.reduce((s, r) => s + r.calls * r.successRate, 0) / calls
              ).toFixed(1),
            ),
      daysWithCalls,
      lifetimeUsed,
      quotaTotal,
      quotaUsagePct,
      serviceStatus,
      accountStatus: dayRows[0]?.accountStatus ?? "—",
      periodStatus: dayRows[0]?.periodStatus ?? "—",
    });
  }

  return summaries.sort((a, b) => b.calls - a.calls || a.account.localeCompare(b.account));
}

export function buildAccountProductMatrix(period: StatsPeriod): AccountProductMatrix {
  const summaries = buildAccountProductSummaries(period);
  const accountMap = new Map<
    string,
    { customerId: string; account: string; companyName: string }
  >();
  const productMap = new Map<
    ProductCode,
    { code: ProductCode; label: string; category: "verify" | "audit" }
  >();
  const cells = new Map<string, number>();
  let maxCalls = 0;

  for (const row of summaries) {
    accountMap.set(row.customerId, {
      customerId: row.customerId,
      account: row.account,
      companyName: row.companyName,
    });
    productMap.set(row.product, {
      code: row.product,
      label: row.productLabel,
      category: row.productCategory,
    });
    const key = `${row.customerId}:${row.product}`;
    cells.set(key, row.calls);
    if (row.calls > maxCalls) maxCalls = row.calls;
  }

  const ordered = [...VERIFY_STATS_PRODUCTS, ...AUDIT_STATS_PRODUCTS]
    .filter((p) => productMap.has(p.code))
    .map((p) => productMap.get(p.code)!);

  return {
    accounts: [...accountMap.values()].sort((a, b) => a.account.localeCompare(b.account)),
    products: ordered,
    cells,
    maxCalls,
  };
}

export function getAccountProductTrend(
  customerId: string,
  product: ProductCode,
  period: StatsPeriod | TrendRange,
) {
  const { accountProductDays } = getStatsData();
  return sliceDates(period).map((date) => {
    const row = accountProductDays.find(
      (r) => r.date === date && r.customerId === customerId && r.product === product,
    );
    return {
      date,
      calls: row?.calls ?? 0,
      successRate: row?.successRate ?? 0,
    };
  });
}

export function exportAccountProductSummaryCsv(
  period: StatsPeriod,
  filters?: Parameters<typeof buildAccountProductSummaries>[1],
) {
  const rows = buildAccountProductSummaries(period, filters);
  downloadCsv(
    `账号产品使用统计_${STATS_PERIOD_LABEL[period]}.csv`,
    [
      "账号",
      "公司名称",
      "联系人",
      "产品",
      "统计周期调用次数",
      "页面提交次数",
      "API调用次数",
      "有调用天数",
      "历史累积调用",
      "额度使用率",
      "服务状态",
      "账号状态",
      "产品有效期状态",
    ],
    rows.map((r) => [
      r.account,
      r.companyName,
      r.contactName,
      r.productLabel,
      String(r.calls),
      String(r.pageSubmitCalls),
      String(r.apiCalls),
      String(r.daysWithCalls),
      String(r.lifetimeUsed),
      r.quotaUsagePct == null ? "—" : `${r.quotaUsagePct}%`,
      r.serviceStatus,
      r.accountStatus,
      r.periodStatus,
    ]),
  );
}
