export const PLATFORM_NAME = "版权技术服务平台";

/** 6 个可售 API 产品（与门户一致） */
export const PRODUCTS = [
  { code: "dci", name: "DCI核验", category: "verify" },
  { code: "info", name: "版权信息核验", category: "verify" },
  { code: "certificate", name: "版权证书核验", category: "verify" },
  { code: "safety", name: "内容安全审核", category: "audit" },
  { code: "duplicate", name: "作品登记查重", category: "audit" },
  { code: "infringement", name: "疑似侵权审核", category: "audit" },
] as const;

export type ProductCode = (typeof PRODUCTS)[number]["code"];

export type AccountStatus = "enabled" | "disabled";
export type ContractPeriodStatus = "pending" | "active" | "expired";

export type CustomerAccount = {
  id: string;
  account: string;
  companyName: string;
  creditCode: string;
  contactName: string;
  contactPhone: string;
  status: AccountStatus;
  products: ProductCode[];
  contractStart: string;
  contractEnd: string;
  periodStatus: ContractPeriodStatus;
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  enabled: "已启用",
  disabled: "已停用",
};

export const PERIOD_STATUS_LABEL: Record<ContractPeriodStatus, string> = {
  pending: "未生效",
  active: "使用中",
  expired: "已到期",
};

export function productName(code: ProductCode) {
  return PRODUCTS.find((p) => p.code === code)?.name ?? code;
}

/** 前端演示数据，后续替换为 API */
export const MOCK_CUSTOMERS: CustomerAccount[] = [
  {
    id: "1",
    account: "acme_corp",
    companyName: "艾克米文化传媒有限公司",
    creditCode: "91110000MA01234567",
    contactName: "王敏",
    contactPhone: "13800001111",
    status: "enabled",
    products: ["dci", "certificate", "safety"],
    contractStart: "2026-01-01",
    contractEnd: "2026-12-31",
    periodStatus: "active",
  },
  {
    id: "2",
    account: "north_press",
    companyName: "北方出版集团股份有限公司",
    creditCode: "91210000MA07654321",
    contactName: "李强",
    contactPhone: "13900002222",
    status: "enabled",
    products: ["dci", "info", "duplicate", "infringement"],
    contractStart: "2025-06-01",
    contractEnd: "2026-05-31",
    periodStatus: "active",
  },
  {
    id: "3",
    account: "pixel_lab",
    companyName: "像素实验室（深圳）有限公司",
    creditCode: "91440300MA98ABCD12",
    contactName: "陈晓",
    contactPhone: "13700003333",
    status: "disabled",
    products: ["safety"],
    contractStart: "2025-03-01",
    contractEnd: "2026-02-28",
    periodStatus: "active",
  },
  {
    id: "4",
    account: "ocean_music",
    companyName: "瀚海音乐文化有限公司",
    creditCode: "91310000MA55EFGH89",
    contactName: "赵琳",
    contactPhone: "13600004444",
    status: "enabled",
    products: ["info", "certificate"],
    contractStart: "2026-09-01",
    contractEnd: "2027-08-31",
    periodStatus: "pending",
  },
  {
    id: "5",
    account: "legacy_art",
    companyName: "传世美术馆管理有限公司",
    creditCode: "91110108MA33IJKL01",
    contactName: "周倩",
    contactPhone: "13500005555",
    status: "enabled",
    products: ["dci", "info", "certificate", "duplicate"],
    contractStart: "2024-01-01",
    contractEnd: "2025-12-31",
    periodStatus: "expired",
  },
  {
    id: "6",
    account: "stream_box",
    companyName: "流盒网络科技有限公司",
    creditCode: "91440101MA22MNOP34",
    contactName: "吴昊",
    contactPhone: "13400006666",
    status: "enabled",
    products: ["safety", "infringement"],
    contractStart: "2026-02-15",
    contractEnd: "2027-02-14",
    periodStatus: "active",
  },
  {
    id: "7",
    account: "cloud_rights",
    companyName: "云权数据服务有限公司",
    creditCode: "91320100MA77QRST56",
    contactName: "郑悦",
    contactPhone: "13300007777",
    status: "disabled",
    products: ["dci"],
    contractStart: "2025-08-01",
    contractEnd: "2026-07-31",
    periodStatus: "active",
  },
  {
    id: "8",
    account: "nova_film",
    companyName: "新星影视制作有限公司",
    creditCode: "91500000MA66UVWX78",
    contactName: "孙磊",
    contactPhone: "13200008888",
    status: "enabled",
    products: ["certificate", "safety", "duplicate", "infringement"],
    contractStart: "2026-04-01",
    contractEnd: "2027-03-31",
    periodStatus: "active",
  },
  {
    id: "9",
    account: "jade_studio",
    companyName: "青玉工作室有限公司",
    creditCode: "91440300MA11YZAB90",
    contactName: "马丽",
    contactPhone: "13100009999",
    status: "enabled",
    products: ["info"],
    contractStart: "2023-05-01",
    contractEnd: "2024-04-30",
    periodStatus: "expired",
  },
  {
    id: "10",
    account: "metro_media",
    companyName: "都会传媒股份有限公司",
    creditCode: "91110000MA44CDEF12",
    contactName: "高翔",
    contactPhone: "13000001010",
    status: "enabled",
    products: ["dci", "info", "certificate", "safety", "duplicate", "infringement"],
    contractStart: "2026-01-15",
    contractEnd: "2026-12-15",
    periodStatus: "active",
  },
  {
    id: "11",
    account: "silk_road",
    companyName: "丝路数字内容有限公司",
    creditCode: "91610000MA88GHIJ34",
    contactName: "林芳",
    contactPhone: "12900001111",
    status: "enabled",
    products: ["duplicate", "infringement"],
    contractStart: "2026-07-01",
    contractEnd: "2027-06-30",
    periodStatus: "pending",
  },
  {
    id: "12",
    account: "beacon_edu",
    companyName: "灯塔教育科技有限公司",
    creditCode: "91330000MA99KLMN56",
    contactName: "何俊",
    contactPhone: "12800001212",
    status: "disabled",
    products: ["info", "safety"],
    contractStart: "2025-01-01",
    contractEnd: "2025-12-31",
    periodStatus: "expired",
  },
];
