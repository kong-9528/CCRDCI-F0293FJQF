export const PLATFORM_NAME = "版权技术服务平台";

export const PRODUCTS = [
  { code: "dci", name: "DCI核验", category: "verify", path: "/verify/dci" },
  { code: "info", name: "版权信息核验", category: "verify", path: "/verify/info" },
  { code: "certificate", name: "版权证书核验", category: "verify", path: "/verify/certificate" },
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
  "safety",
  "duplicate",
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
  { code: "safety", totalCalls: 9021, monthCalls: 1102, momPercent: 5.6, expireAt: "2026-11-30", daysLeft: 102 },
  { code: "duplicate", totalCalls: 2104, monthCalls: 198, momPercent: -1.4, expireAt: "2026-08-28", daysLeft: 8 },
];

export function productName(code: ProductCode) {
  return PRODUCTS.find((p) => p.code === code)?.name ?? code;
}

export function productPath(code: ProductCode) {
  return PRODUCTS.find((p) => p.code === code)?.path ?? "/";
}
