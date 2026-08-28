export const PLATFORM_NAME = "DCI®技术服务中心";

export const PRODUCTS = [
  { code: "dci", name: "DCI核验", category: "verify", path: "/verify/dci" },
  { code: "info", name: "版权登记信息核验", category: "verify", path: "/verify/info" },
  { code: "certificate", name: "版权登记证书核验", category: "verify", path: "/verify/certificate" },
  { code: "workReview", name: "作品智能辅助审核", category: "audit", path: "/review/safety" },
  { code: "safety", name: "内容安全审核", category: "audit", path: "/review/safety" },
  { code: "duplicate", name: "作品登记查重", category: "audit", path: "/review/duplicate" },
  { code: "infringement", name: "疑似侵权审核", category: "audit", path: "/review/infringement" },
] as const;

export type ProductCode = (typeof PRODUCTS)[number]["code"];

/** 演示：当前租户已开通产品 */
export const OPENED_PRODUCTS: ProductCode[] = [
  "dci",
  "info",
  "certificate",
  "workReview",
];

export type ProductUsage = {
  code: ProductCode;
  totalCalls: number;
  monthCalls: number;
  momPercent: number;
  expireAt: string;
  daysLeft: number;
};

export const MOCK_USAGE: ProductUsage[] = [
  { code: "dci", totalCalls: 12840, monthCalls: 1260, momPercent: 12.4, expireAt: "2026-12-31", daysLeft: 133 },
  { code: "info", totalCalls: 6420, monthCalls: 580, momPercent: -3.2, expireAt: "2026-09-15", daysLeft: 26 },
  { code: "certificate", totalCalls: 3188, monthCalls: 420, momPercent: 8.1, expireAt: "2026-12-31", daysLeft: 133 },
  { code: "workReview", totalCalls: 48230, monthCalls: 1200, momPercent: 12.8, expireAt: "2026-08-25", daysLeft: 5 },
];

export function productName(code: ProductCode) {
  return PRODUCTS.find((p) => p.code === code)?.name ?? code;
}

export function productPath(code: ProductCode) {
  return PRODUCTS.find((p) => p.code === code)?.path ?? "/desk";
}
