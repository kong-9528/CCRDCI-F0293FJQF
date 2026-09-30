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

export type StatsExportPage = "customers" | "products" | "account-products";

type StatsExportFilters = {
  product?: ProductCode | "";
  accountQuery?: string;
};

function exportFilePrefix(
  scope: StatsScope,
  page: StatsExportPage,
  period: StatsPeriod | TrendRange,
) {
  const scopeTag = scope === "verify" ? "版权核验统计" : "审核统计";
  const pageTag =
    page === "customers"
      ? "按机构"
      : page === "products"
        ? scope === "verify"
          ? "按技术服务"
          : "按审核能力"
        : scope === "verify"
          ? "机构与技术服务"
          : "机构与审核能力";
  const dates = sliceDates(period);
  const start = dates[0] ?? "";
  const end = dates[dates.length - 1] ?? start;
  const range = !start ? "" : start === end ? start : `${start}至${end}`;
  return range ? `${scopeTag}_${pageTag}_${range}` : `${scopeTag}_${pageTag}`;
}

function inPeriod(period: StatsPeriod | TrendRange) {
  const dates = new Set(sliceDates(period));
  return (date: string) => dates.has(date);
}

function matchAccountQuery(
  account: string,
  companyName: string,
  contactName: string,
  query?: string,
) {
  const q = query?.trim().toLowerCase() ?? "";
  if (!q) return true;
  return (
    account.toLowerCase().includes(q) ||
    companyName.toLowerCase().includes(q) ||
    contactName.toLowerCase().includes(q)
  );
}

/** 汇总报表（6 个统计页统一入口） */
export function exportStatsSummaryCsv(
  scope: StatsScope,
  page: StatsExportPage,
  period: StatsPeriod | TrendRange,
  filters?: StatsExportFilters,
) {
  const prefix = exportFilePrefix(scope, page, period);
  const scopeCodes = statsProductCodesForScope(scope);
  const keep = inPeriod(period);
  const { accountProductDays, productDays } = getStatsData();

  if (page === "customers") {
    type Acc = {
      account: string;
      companyName: string;
      contactName: string;
      calls: number;
      pageSubmitCalls: number;
      apiCalls: number;
    };
    const map = new Map<string, Acc>();
    for (const r of accountProductDays) {
      if (!keep(r.date) || !scopeCodes.includes(r.product)) continue;
      if (!matchAccountQuery(r.account, r.companyName, r.contactName, filters?.accountQuery)) {
        continue;
      }
      const cur = map.get(r.customerId) ?? {
        account: r.account,
        companyName: r.companyName,
        contactName: r.contactName,
        calls: 0,
        pageSubmitCalls: 0,
        apiCalls: 0,
      };
      cur.calls += r.calls;
      cur.pageSubmitCalls += r.pageSubmitCalls;
      cur.apiCalls += r.apiCalls;
      map.set(r.customerId, cur);
    }
    const rows = [...map.values()].sort((a, b) => b.calls - a.calls);
    if (scope === "verify") {
      downloadCsv(
        `${prefix}_汇总报表.csv`,
        ["机构账号", "机构名称", "联系人", "调用次数", "web页面提交次数", "API调用次数"],
        rows.map((r) => [
          r.account,
          r.companyName,
          r.contactName,
          String(r.calls),
          String(r.pageSubmitCalls),
          String(r.apiCalls),
        ]),
      );
    } else {
      downloadCsv(
        `${prefix}_汇总报表.csv`,
        ["机构账号", "机构名称", "联系人", "调用次数"],
        rows.map((r) => [r.account, r.companyName, r.contactName, String(r.calls)]),
      );
    }
    return;
  }

  if (page === "products") {
    const rows = scopeCodes
      .map((code) => {
        const dayRows = productDays.filter((r) => r.product === code && keep(r.date));
        const hit = [...VERIFY_STATS_PRODUCTS, ...AUDIT_STATS_PRODUCTS].find((p) => p.code === code);
        return {
          label: hit?.name ?? code,
          calls: sumCalls(dayRows),
          pageSubmitCalls: sumPageSubmitCalls(dayRows),
          apiCalls: sumApiCalls(dayRows),
        };
      })
      .sort((a, b) => b.calls - a.calls);
    if (scope === "verify") {
      downloadCsv(
        `${prefix}_汇总报表.csv`,
        ["技术服务", "调用次数", "web页面提交次数", "API调用次数"],
        rows.map((r) => [
          r.label,
          String(r.calls),
          String(r.pageSubmitCalls),
          String(r.apiCalls),
        ]),
      );
    } else {
      downloadCsv(
        `${prefix}_汇总报表.csv`,
        ["审核能力", "调用次数"],
        rows.map((r) => [r.label, String(r.calls)]),
      );
    }
    return;
  }

  // account-products
  const summaries = buildAccountProductSummaries(period, {
    scope,
    product: filters?.product,
    accountQuery: filters?.accountQuery,
  });
  if (scope === "verify") {
    downloadCsv(
      `${prefix}_汇总报表.csv`,
      ["机构账号", "机构名称", "联系人", "技术服务", "调用次数", "web页面提交次数", "API调用次数"],
      summaries.map((r) => [
        r.account,
        r.companyName,
        r.contactName,
        r.productLabel,
        String(r.calls),
        String(r.pageSubmitCalls),
        String(r.apiCalls),
      ]),
    );
  } else {
    downloadCsv(
      `${prefix}_汇总报表.csv`,
      ["机构账号", "机构名称", "联系人", "审核能力", "调用次数"],
      summaries.map((r) => [
        r.account,
        r.companyName,
        r.contactName,
        r.productLabel,
        String(r.calls),
      ]),
    );
  }
}

/** 明细报表（6 个统计页统一入口） */
export function exportStatsDetailCsv(
  scope: StatsScope,
  page: StatsExportPage,
  period: StatsPeriod | TrendRange,
  filters?: StatsExportFilters,
) {
  const prefix = exportFilePrefix(scope, page, period);
  const scopeCodes = statsProductCodesForScope(scope);
  const keep = inPeriod(period);
  const { accountProductDays, productDays } = getStatsData();

  if (page === "customers") {
    type Acc = {
      date: string;
      account: string;
      companyName: string;
      contactName: string;
      calls: number;
      pageSubmitCalls: number;
      apiCalls: number;
      byProduct: Record<string, number>;
    };
    const map = new Map<string, Acc>();
    for (const r of accountProductDays) {
      if (!keep(r.date) || !scopeCodes.includes(r.product)) continue;
      if (!matchAccountQuery(r.account, r.companyName, r.contactName, filters?.accountQuery)) {
        continue;
      }
      const key = `${r.date}:${r.customerId}`;
      const cur = map.get(key) ?? {
        date: r.date,
        account: r.account,
        companyName: r.companyName,
        contactName: r.contactName,
        calls: 0,
        pageSubmitCalls: 0,
        apiCalls: 0,
        byProduct: {},
      };
      cur.calls += r.calls;
      cur.pageSubmitCalls += r.pageSubmitCalls;
      cur.apiCalls += r.apiCalls;
      cur.byProduct[r.product] = (cur.byProduct[r.product] ?? 0) + r.calls;
      map.set(key, cur);
    }
    const rows = [...map.values()].sort(
      (a, b) => a.date.localeCompare(b.date) || b.calls - a.calls,
    );
    if (scope === "verify") {
      downloadCsv(
        `${prefix}_明细报表.csv`,
        [
          "日期",
          "机构账号",
          "机构名称",
          "联系人",
          "当日调用次数",
          "当日web页面提交次数",
          "当日API调用次数",
          "当日DCI核验次数",
          "当日版权登记信息核验次数",
          "当日版权登记证书核验次数",
        ],
        rows.map((r) => [
          r.date,
          r.account,
          r.companyName,
          r.contactName,
          String(r.calls),
          String(r.pageSubmitCalls),
          String(r.apiCalls),
          String(r.byProduct.dci ?? 0),
          String(r.byProduct.info ?? 0),
          String(r.byProduct.certificate ?? 0),
        ]),
      );
    } else {
      downloadCsv(
        `${prefix}_明细报表.csv`,
        ["日期", "机构账号", "机构名称", "联系人", "当日调用次数"],
        rows.map((r) => [
          r.date,
          r.account,
          r.companyName,
          r.contactName,
          String(r.calls),
        ]),
      );
    }
    return;
  }

  if (page === "products") {
    const rows = productDays
      .filter((r) => keep(r.date) && scopeCodes.includes(r.product))
      .sort((a, b) => a.date.localeCompare(b.date) || b.calls - a.calls);
    if (scope === "verify") {
      downloadCsv(
        `${prefix}_明细报表.csv`,
        ["日期", "技术服务", "当日调用次数", "当日web页面提交次数", "当日API调用次数"],
        rows.map((r) => [
          r.date,
          r.productLabel,
          String(r.calls),
          String(r.pageSubmitCalls),
          String(r.apiCalls),
        ]),
      );
    } else {
      downloadCsv(
        `${prefix}_明细报表.csv`,
        ["日期", "审核能力", "当日调用次数"],
        rows.map((r) => [r.date, r.productLabel, String(r.calls)]),
      );
    }
    return;
  }

  // account-products
  const rows = accountProductDays
    .filter((r) => {
      if (!keep(r.date) || !scopeCodes.includes(r.product)) return false;
      if (filters?.product && r.product !== filters.product) return false;
      return matchAccountQuery(r.account, r.companyName, r.contactName, filters?.accountQuery);
    })
    .sort((a, b) => a.date.localeCompare(b.date) || b.calls - a.calls);

  if (scope === "verify") {
    downloadCsv(
      `${prefix}_明细报表.csv`,
      [
        "日期",
        "机构账号",
        "机构名称",
        "联系人",
        "技术服务",
        "当日调用次数",
        "web页面提交次数",
        "API调用次数",
      ],
      rows.map((r) => [
        r.date,
        r.account,
        r.companyName,
        r.contactName,
        r.productLabel,
        String(r.calls),
        String(r.pageSubmitCalls),
        String(r.apiCalls),
      ]),
    );
  } else {
    downloadCsv(
      `${prefix}_明细报表.csv`,
      ["日期", "机构账号", "机构名称", "联系人", "审核能力", "调用次数"],
      rows.map((r) => [
        r.date,
        r.account,
        r.companyName,
        r.contactName,
        r.productLabel,
        String(r.calls),
      ]),
    );
  }
}

/** @deprecated 请用 exportStatsDetailCsv / exportStatsSummaryCsv */
export function exportAccountDailyCsv() {
  exportStatsDetailCsv("verify", "customers", "30d");
}

/** @deprecated 请用 exportStatsDetailCsv */
export function exportAccountProductDailyCsv(products?: ProductCode[]) {
  exportStatsDetailCsv("verify", "account-products", "30d", {
    product: products?.length === 1 ? products[0] : "",
  });
}

/** @deprecated 请用 exportStatsDetailCsv */
export function exportProductDailyCsv(products?: ProductCode[]) {
  void products;
  exportStatsDetailCsv("verify", "products", "30d");
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
  const scope = filters?.scope ?? "verify";
  exportStatsSummaryCsv(scope, "account-products", period, {
    product: filters?.product,
    accountQuery: filters?.accountQuery,
  });
}
