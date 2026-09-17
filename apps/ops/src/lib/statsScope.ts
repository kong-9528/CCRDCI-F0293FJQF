import type { ProductCode } from "@/lib/catalog";

export type StatsScope = "verify" | "audit";

export type StatsScopeProduct = {
  code: ProductCode;
  name: string;
};

/** 核验统计：3 个核验产品 */
export const VERIFY_STATS_PRODUCTS: StatsScopeProduct[] = [
  { code: "dci", name: "DCI核验" },
  { code: "info", name: "版权登记信息核验" },
  { code: "certificate", name: "版权登记证书核验" },
];

/** 作品智能辅助审核统计：3 个审核能力 */
export const AUDIT_STATS_PRODUCTS: StatsScopeProduct[] = [
  { code: "safety", name: "内容安全审核" },
  { code: "duplicate", name: "作品登记查重" },
  { code: "infringement", name: "疑似侵权审核" },
];

export function statsProductsForScope(scope: StatsScope): StatsScopeProduct[] {
  return scope === "verify" ? VERIFY_STATS_PRODUCTS : AUDIT_STATS_PRODUCTS;
}

export function statsProductCodesForScope(scope: StatsScope): ProductCode[] {
  return statsProductsForScope(scope).map((p) => p.code);
}

export function isStatsScope(value: string | undefined): value is StatsScope {
  return value === "verify" || value === "audit";
}

export function statsScopeTitle(scope: StatsScope) {
  return scope === "verify" ? "核验统计" : "作品智能辅助审核统计";
}
