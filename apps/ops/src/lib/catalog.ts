export const PLATFORM_NAME = "DCI®技术服务中心";

/** 4 个可售 API 产品（与门户一致） */
export const PRODUCTS = [
  { code: "dci", name: "DCI核验", category: "verify" },
  { code: "info", name: "版权登记信息核验", category: "verify" },
  { code: "certificate", name: "版权登记证书核验", category: "verify" },
  { code: "workReview", name: "作品智能辅助审核", category: "audit" },
] as const;

/** 历史拆分的审核子产品（只读兼容，配置时统一为 workReview） */
export const LEGACY_AUDIT_PRODUCT_CODES = ["safety", "duplicate", "infringement"] as const;

export type LegacyAuditProductCode = (typeof LEGACY_AUDIT_PRODUCT_CODES)[number];
export type ProductCode = (typeof PRODUCTS)[number]["code"] | LegacyAuditProductCode;

export type ConfigurableProductCode = (typeof PRODUCTS)[number]["code"];

/** 产品配置、筛选项等 UI 使用的可售产品列表 */
export const CONFIGURABLE_PRODUCTS = PRODUCTS;

export function normalizeProductCode(code: ProductCode): ConfigurableProductCode {
  if ((LEGACY_AUDIT_PRODUCT_CODES as readonly string[]).includes(code)) {
    return "workReview";
  }
  return code as ConfigurableProductCode;
}

/** 开通业务类型 */
export type BusinessType = "software" | "work" | "dataset";

/** 产品使用方式 */
export type UsageChannel = "web" | "api";

export const BUSINESS_TYPE_OPTIONS = [
  { code: "software" as const, label: "软件" },
  { code: "work" as const, label: "作品" },
  { code: "dataset" as const, label: "数据集" },
];

export const USAGE_CHANNEL_OPTIONS = [
  { code: "web" as const, label: "Web页面" },
  { code: "api" as const, label: "API接口" },
];

export const DEFAULT_BUSINESS_TYPES: BusinessType[] = ["software", "work", "dataset"];
export const DEFAULT_USAGE_CHANNELS: UsageChannel[] = ["web", "api"];

export function businessTypeLabel(code: BusinessType) {
  return BUSINESS_TYPE_OPTIONS.find((o) => o.code === code)?.label ?? code;
}

export function usageChannelLabel(code: UsageChannel) {
  return USAGE_CHANNEL_OPTIONS.find((o) => o.code === code)?.label ?? code;
}

export function formatBusinessTypes(types: BusinessType[]) {
  return types.length ? types.map(businessTypeLabel).join("、") : "—";
}

export function formatUsageChannels(channels: UsageChannel[]) {
  return channels.length ? channels.map(usageChannelLabel).join("、") : "—";
}

/** 版权核验类产品（需单独配置开通类型与使用方式） */
export const VERIFY_PRODUCT_CODES = ["dci", "info", "certificate"] as const;

export type VerifyProductCode = (typeof VERIFY_PRODUCT_CODES)[number];

export function isVerifyProduct(code: ProductCode | ""): code is VerifyProductCode {
  return Boolean(code && (VERIFY_PRODUCT_CODES as readonly string[]).includes(code));
}

export type CustomerType = "enterprise";

export type AccountStatus = "enabled" | "disabled";
export type ContractPeriodStatus = "pending" | "active" | "expired";

/** 额度：不限量 / 有效期内总量 */
export type QuotaType = "unlimited" | "total";

/**
 * 产品服务配置。
 * - 额度仅在 startDate~endDate 内可消耗；过期后 usedCount / 剩余次数均不清零，但不可再调用（WebUI / API）。
 * - 合同服务期仅用于提醒与展示，不参与登录或调用控制。
 * - 账号能否登录仅取决于账号状态（启用/停用）。
 */
export type ProductServiceConfig = {
  product: ProductCode;
  quotaType: QuotaType;
  /** quotaType=total 时的总量 */
  quotaTotal: number | null;
  /** 历史已用次数（过期不清零） */
  usedCount: number;
  startDate: string;
  endDate: string;
  /** 运营侧停用；与日期过期独立 */
  stopped: boolean;
  /** 核验类产品：开通业务类型 */
  businessTypes?: BusinessType[];
  /** 核验类产品：使用方式 */
  usageChannels?: UsageChannel[];
};

export type ContractFile = {
  id: string;
  name: string;
  size: number;
};

/** 单次签约 / 续约合同记录 */
export type CustomerContract = {
  id: string;
  /** 合同编号 */
  contractNo: string;
  startDate: string;
  endDate: string;
  amount: number | null;
  files: ContractFile[];
  createdAt: string;
  updatedAt: string;
};

export type CustomerAccount = {
  id: string;
  customerType: CustomerType;
  creditCode: string;
  companyName: string;
  legalPerson: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  address: string;
  /** 合同历史（首次签约 + 续约等） */
  contracts: CustomerContract[];
  /** 摘要：开始日期最新合同的附件（列表/兼容展示） */
  contractFiles: ContractFile[];
  contractStart: string;
  contractEnd: string;
  contractAmount: number | null;
  account: string;
  /** 演示：明文仅用于重置提示，非真实存储 */
  passwordHint: string;
  status: AccountStatus;
  productServices: ProductServiceConfig[];
  createdAt: string;
  updatedAt: string;
};

export type ProductUsageStat = {
  account: string;
  product: ProductCode;
  serviceStatus: "pending" | "active" | "expired" | "stopped";
  totalCalls: number;
};

export type CustomerOpLog = {
  id: string;
  customerId: string;
  action: "create" | "edit" | "service" | "enable" | "disable";
  summary: string;
  changes: { field: string; before: string; after: string }[];
  operator: string;
  at: string;
};

export const ACCOUNT_STATUS_LABEL: Record<AccountStatus, string> = {
  enabled: "已启用",
  disabled: "已停用",
};

export const PERIOD_STATUS_LABEL: Record<ContractPeriodStatus, string> = {
  pending: "未开始",
  active: "合作中",
  expired: "已到期",
};

export const SERVICE_STATUS_LABEL = {
  pending: "未生效",
  active: "使用中",
  expired: "已到期",
  stopped: "已停止",
} as const;

export const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  enterprise: "企业机构",
};

export function productName(code: ProductCode) {
  return PRODUCTS.find((p) => p.code === normalizeProductCode(code))?.name ?? code;
}

/** 列表展示：合并历史审核子产品为「作品智能辅助审核」 */
export function productServicesForDisplay(
  services: ProductServiceConfig[],
): ProductServiceConfig[] {
  const map = new Map<ConfigurableProductCode, ProductServiceConfig>();
  for (const svc of services) {
    const code = normalizeProductCode(svc.product);
    const existing = map.get(code);
    if (!existing) {
      map.set(code, { ...svc, product: code });
      continue;
    }
    map.set(code, {
      ...existing,
      startDate: existing.startDate < svc.startDate ? existing.startDate : svc.startDate,
      endDate: existing.endDate > svc.endDate ? existing.endDate : svc.endDate,
      stopped: existing.stopped || svc.stopped,
    });
  }
  return [...map.values()];
}

export function customerHasProduct(
  services: ProductServiceConfig[],
  filter: string,
): boolean {
  if (!filter) return true;
  const target = normalizeProductCode(filter as ProductCode);
  return services.some((s) => normalizeProductCode(s.product) === target);
}

export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function derivePeriodStatus(start: string, end: string): ContractPeriodStatus {
  const t = todayISO();
  if (t < start) return "pending";
  if (t > end) return "expired";
  return "active";
}

/** 账号级合同服务期：综合全部合同历史判定状态与展示起止 */
export type AccountContractPeriod = {
  status: ContractPeriodStatus;
  startDate: string;
  endDate: string;
};

export function deriveAccountContractPeriod(
  contracts: CustomerContract[],
): AccountContractPeriod {
  const list = contracts ?? [];
  if (list.length === 0) {
    return { status: "expired", startDate: "", endDate: "" };
  }

  const t = todayISO();

  const active = list.filter((c) => c.startDate <= t && t <= c.endDate);
  if (active.length > 0) {
    const picked = active.sort((a, b) => b.startDate.localeCompare(a.startDate))[0];
    return {
      status: "active",
      startDate: picked.startDate,
      endDate: picked.endDate,
    };
  }

  const future = list.filter((c) => c.startDate > t);
  if (future.length > 0) {
    const picked = future.sort((a, b) => a.startDate.localeCompare(b.startDate))[0];
    return {
      status: "pending",
      startDate: picked.startDate,
      endDate: picked.endDate,
    };
  }

  const picked = list.sort((a, b) => b.endDate.localeCompare(a.endDate))[0];
  return {
    status: "expired",
    startDate: picked.startDate,
    endDate: picked.endDate,
  };
}

/** 合同按开始日期倒序（同日按更新时间） */
export function sortContractsByStartDesc(list: CustomerContract[]): CustomerContract[] {
  return [...list].sort((a, b) => {
    const byStart = b.startDate.localeCompare(a.startDate);
    if (byStart !== 0) return byStart;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function primaryContract(contracts: CustomerContract[]): CustomerContract | null {
  return sortContractsByStartDesc(contracts)[0] ?? null;
}

/** 用最新合同回填账号级合同摘要字段 */
export function withContractSummary(c: CustomerAccount): CustomerAccount {
  const contracts = c.contracts ?? [];
  const p = primaryContract(contracts);
  if (!p) {
    return {
      ...c,
      contracts,
      contractFiles: [],
      contractStart: "",
      contractEnd: "",
      contractAmount: null,
    };
  }
  return {
    ...c,
    contracts,
    contractFiles: [...p.files],
    contractStart: p.startDate,
    contractEnd: p.endDate,
    contractAmount: p.amount,
  };
}

/** 兼容旧 mock：将账号级开通类型/使用方式迁移到各核验产品 */
export function ensureCustomerContracts(
  c: CustomerAccount & { businessTypes?: BusinessType[]; usageChannels?: UsageChannel[] },
): CustomerAccount {
  const legacyBiz = c.businessTypes?.length ? c.businessTypes : [...DEFAULT_BUSINESS_TYPES];
  const legacyUsage = c.usageChannels?.length ? c.usageChannels : [...DEFAULT_USAGE_CHANNELS];
  const productServices = c.productServices.map((svc) => {
    if (!isVerifyProduct(svc.product)) return svc;
    return {
      ...svc,
      businessTypes: svc.businessTypes?.length ? svc.businessTypes : [...legacyBiz],
      usageChannels: svc.usageChannels?.length ? svc.usageChannels : [...legacyUsage],
    };
  });
  const { businessTypes: _bt, usageChannels: _uc, ...rest } = c;
  const normalized: CustomerAccount = { ...rest, productServices };
  if (normalized.contracts && normalized.contracts.length > 0) {
    return withContractSummary(normalized);
  }
  const hasFlat =
    Boolean(normalized.contractStart) ||
    Boolean(normalized.contractEnd) ||
    (normalized.contractFiles?.length ?? 0) > 0 ||
    normalized.contractAmount != null;
  const contracts: CustomerContract[] = hasFlat
    ? [
        {
          id: `ct-${normalized.id}-init`,
          contractNo: `HT${String(normalized.id).padStart(6, "0")}`,
          startDate: normalized.contractStart,
          endDate: normalized.contractEnd,
          amount: normalized.contractAmount,
          files: [...(normalized.contractFiles ?? [])],
          createdAt: normalized.createdAt,
          updatedAt: normalized.updatedAt,
        },
      ]
    : [];
  return withContractSummary({ ...normalized, contracts });
}

export function deriveServiceStatus(
  svc: ProductServiceConfig,
): ProductUsageStat["serviceStatus"] {
  if (svc.stopped) return "stopped";
  return derivePeriodStatus(svc.startDate, svc.endDate);
}

/** 列表展示用：当前已配置产品（含已停止） */
export function customerProductCodes(c: CustomerAccount): ProductCode[] {
  return c.productServices.map((s) => s.product);
}

export function formatQuota(svc: ProductServiceConfig): string {
  if (svc.quotaType === "unlimited") return "不限量";
  const total = svc.quotaTotal ?? 0;
  const left = Math.max(0, total - svc.usedCount);
  return `授权总量 ${total.toLocaleString()}（已用 ${svc.usedCount.toLocaleString()} / 剩余 ${left.toLocaleString()}）`;
}

export function canConsumeQuota(svc: ProductServiceConfig): boolean {
  if (svc.stopped) return false;
  if (derivePeriodStatus(svc.startDate, svc.endDate) !== "active") return false;
  if (svc.quotaType === "unlimited") return true;
  return (svc.quotaTotal ?? 0) > svc.usedCount;
}

const SPECIAL = /[!_@#]/;

/** 大写+小写+数字+特殊符{!_@#}，至少 4 种中的 3 种 */
export function isStrongPassword(pwd: string): boolean {
  if (pwd.length < 8) return false;
  let kinds = 0;
  if (/[A-Z]/.test(pwd)) kinds += 1;
  if (/[a-z]/.test(pwd)) kinds += 1;
  if (/\d/.test(pwd)) kinds += 1;
  if (SPECIAL.test(pwd)) kinds += 1;
  return kinds >= 3;
}

/** 字母开头，字母+数字+下划线，6-20 */
export function isValidAccount(account: string): boolean {
  return /^[A-Za-z][A-Za-z0-9_]{5,19}$/.test(account);
}

export function generateStrongPassword(): string {
  const upper = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const lower = "abcdefghijkmnpqrstuvwxyz";
  const digits = "23456789";
  const special = "!_@#";
  const pick = (s: string) => s[Math.floor(Math.random() * s.length)]!;
  const chars = [pick(upper), pick(lower), pick(digits), pick(special)];
  const all = upper + lower + digits + special;
  while (chars.length < 12) chars.push(pick(all));
  for (let i = chars.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }
  return chars.join("");
}

function svc(
  product: ProductCode,
  quotaType: QuotaType,
  quotaTotal: number | null,
  usedCount: number,
  startDate: string,
  endDate: string,
  stopped = false,
  opts?: { businessTypes?: BusinessType[]; usageChannels?: UsageChannel[] },
): ProductServiceConfig {
  const base: ProductServiceConfig = {
    product,
    quotaType,
    quotaTotal,
    usedCount,
    startDate,
    endDate,
    stopped,
  };
  if (isVerifyProduct(product)) {
    return {
      ...base,
      businessTypes: opts?.businessTypes ?? [...DEFAULT_BUSINESS_TYPES],
      usageChannels: opts?.usageChannels ?? [...DEFAULT_USAGE_CHANNELS],
    };
  }
  return base;
}

/** 前端演示数据，后续替换为 API */
export const MOCK_CUSTOMERS = [
  {
    id: "1",
    customerType: "enterprise",
    creditCode: "91110000MA01234567",
    companyName: "艾克米文化传媒有限公司",
    legalPerson: "张伟",
    contactName: "王敏",
    contactPhone: "13800001111",
    contactEmail: "wangmin@acme.example",
    address: "北京市朝阳区建国路 88 号",
    contractFiles: [
      { id: "f1", name: "艾克米-服务合同.pdf", size: 1_240_000 },
      { id: "f2", name: "附件-盖章页.jpg", size: 420_000 },
    ],
    contractStart: "2026-01-01",
    contractEnd: "2026-12-31",
    contractAmount: 280000,
    account: "acme_corp",
    passwordHint: "Acme#2026demo",
    status: "enabled",
    productServices: [
      svc("dci", "total", 50000, 12840, "2026-01-01", "2026-12-31"),
      svc("certificate", "total", 10000, 3188, "2026-01-01", "2026-12-31"),
      svc("workReview", "total", 50000, 9021, "2026-01-01", "2026-12-31"),
    ],
    createdAt: "2026-01-02 10:00:00",
    updatedAt: "2026-08-01 14:20:00",
  },
  {
    id: "2",
    customerType: "enterprise",
    creditCode: "91210000MA07654321",
    companyName: "北方出版集团股份有限公司",
    legalPerson: "刘洋",
    contactName: "李强",
    contactPhone: "13900002222",
    contactEmail: "liqiang@north.example",
    address: "沈阳市和平区南京街 12 号",
    contractFiles: [{ id: "f3", name: "北方出版-年度合同.pdf", size: 980_000 }],
    contractStart: "2025-06-01",
    contractEnd: "2026-05-31",
    contractAmount: 520000,
    account: "north_press",
    passwordHint: "North_Press9!",
    status: "enabled",
    productServices: [
      svc("dci", "total", 80000, 22100, "2025-06-01", "2026-05-31"),
      svc("info", "total", 30000, 6420, "2025-06-01", "2026-05-31"),
      svc("workReview", "total", 50000, 2984, "2025-06-01", "2026-05-31"),
    ],
    createdAt: "2025-05-28 09:30:00",
    updatedAt: "2026-07-12 11:05:00",
  },
  {
    id: "3",
    customerType: "enterprise",
    creditCode: "91440300MA98ABCD12",
    companyName: "像素实验室（深圳）有限公司",
    legalPerson: "陈凯",
    contactName: "陈晓",
    contactPhone: "13700003333",
    contactEmail: "chenxiao@pixel.example",
    address: "深圳市南山区科技园南路 1 号",
    contractFiles: [],
    contractStart: "2025-03-01",
    contractEnd: "2026-02-28",
    contractAmount: 96000,
    account: "pixel_lab",
    passwordHint: "Pixel_Lab3!",
    status: "disabled",
    productServices: [svc("workReview", "total", 20000, 15002, "2025-03-01", "2026-02-28", true)],
    createdAt: "2025-02-20 16:00:00",
    updatedAt: "2026-06-01 09:00:00",
  },
  {
    id: "4",
    customerType: "enterprise",
    creditCode: "91310000MA55EFGH89",
    companyName: "瀚海音乐文化有限公司",
    legalPerson: "赵峰",
    contactName: "赵琳",
    contactPhone: "13600004444",
    contactEmail: "zhaolin@ocean.example",
    address: "上海市徐汇区淮海中路 200 号",
    contractFiles: [{ id: "f4", name: "瀚海-合作协议.pdf", size: 760_000 }],
    contractStart: "2026-09-01",
    contractEnd: "2027-08-31",
    contractAmount: 180000,
    account: "ocean_music",
    passwordHint: "Ocean#Music26",
    status: "enabled",
    productServices: [
      svc("info", "total", 12000, 0, "2026-09-01", "2027-08-31"),
      svc("certificate", "total", 8000, 0, "2026-09-01", "2027-08-31"),
    ],
    createdAt: "2026-08-10 10:00:00",
    updatedAt: "2026-08-10 10:00:00",
  },
  {
    id: "5",
    customerType: "enterprise",
    creditCode: "91110108MA33IJKL01",
    companyName: "传世美术馆管理有限公司",
    legalPerson: "周明",
    contactName: "周倩",
    contactPhone: "13500005555",
    contactEmail: "zhouqian@legacy.example",
    address: "北京市东城区东四十条 5 号",
    contractFiles: [{ id: "f5", name: "传世-2024合同.pdf", size: 1_100_000 }],
    contractStart: "2024-01-01",
    contractEnd: "2025-12-31",
    contractAmount: 210000,
    account: "legacy_art",
    passwordHint: "Legacy_Art1!",
    status: "enabled",
    productServices: [
      svc("dci", "total", 40000, 39980, "2024-01-01", "2025-12-31"),
      svc("info", "total", 20000, 18800, "2024-01-01", "2025-12-31"),
      svc("certificate", "total", 20000, 5400, "2024-01-01", "2025-12-31"),
      svc("workReview", "total", 5000, 4990, "2024-01-01", "2025-12-31"),
    ],
    createdAt: "2023-12-20 11:00:00",
    updatedAt: "2026-01-05 08:30:00",
  },
  {
    id: "6",
    customerType: "enterprise",
    creditCode: "91440101MA22MNOP34",
    companyName: "流盒网络科技有限公司",
    legalPerson: "吴刚",
    contactName: "吴昊",
    contactPhone: "13400006666",
    contactEmail: "wuhao@stream.example",
    address: "广州市天河区体育西路 66 号",
    contractFiles: [],
    contractStart: "2026-02-15",
    contractEnd: "2027-02-14",
    contractAmount: 150000,
    account: "stream_box",
    passwordHint: "Stream_Box8!",
    status: "enabled",
    productServices: [
      svc("workReview", "total", 30000, 4200, "2026-02-15", "2027-02-14"),
    ],
    createdAt: "2026-02-10 15:00:00",
    updatedAt: "2026-07-01 12:00:00",
  },
  {
    id: "7",
    customerType: "enterprise",
    creditCode: "91320100MA77QRST56",
    companyName: "云权数据服务有限公司",
    legalPerson: "郑浩",
    contactName: "郑悦",
    contactPhone: "13300007777",
    contactEmail: "zhengyue@cloud.example",
    address: "南京市鼓楼区中山路 100 号",
    contractFiles: [{ id: "f6", name: "云权-合同扫描.zip", size: 2_400_000 }],
    contractStart: "2025-08-01",
    contractEnd: "2026-07-31",
    contractAmount: 88000,
    account: "cloud_rights",
    passwordHint: "Cloud_Rights2!",
    status: "disabled",
    productServices: [svc("dci", "total", 10000, 3300, "2025-08-01", "2026-07-31")],
    createdAt: "2025-07-25 09:00:00",
    updatedAt: "2026-05-20 17:40:00",
  },
  {
    id: "8",
    customerType: "enterprise",
    creditCode: "91500000MA66UVWX78",
    companyName: "新星影视制作有限公司",
    legalPerson: "孙涛",
    contactName: "孙磊",
    contactPhone: "13200008888",
    contactEmail: "sunlei@nova.example",
    address: "重庆市渝中区解放碑步行街 8 号",
    contractFiles: [{ id: "f7", name: "新星影视合同.pdf", size: 890_000 }],
    contractStart: "2026-04-01",
    contractEnd: "2027-03-31",
    contractAmount: 360000,
    account: "nova_film",
    passwordHint: "Nova_Film7!",
    status: "enabled",
    productServices: [
      svc("certificate", "total", 20000, 1200, "2026-04-01", "2027-03-31"),
      svc("workReview", "total", 30000, 5600, "2026-04-01", "2027-03-31"),
    ],
    createdAt: "2026-03-28 13:20:00",
    updatedAt: "2026-08-05 10:10:00",
  },
  {
    id: "9",
    customerType: "enterprise",
    creditCode: "91440300MA11YZAB90",
    companyName: "青玉工作室有限公司",
    legalPerson: "马超",
    contactName: "马丽",
    contactPhone: "13100009999",
    contactEmail: "mali@jade.example",
    address: "深圳市福田区福华一路 1 号",
    contractFiles: [],
    contractStart: "2023-05-01",
    contractEnd: "2024-04-30",
    contractAmount: 45000,
    account: "jade_studio",
    passwordHint: "Jade_Studio5!",
    status: "enabled",
    productServices: [svc("info", "total", 5000, 4988, "2023-05-01", "2024-04-30")],
    createdAt: "2023-04-20 10:00:00",
    updatedAt: "2024-05-01 09:00:00",
  },
  {
    id: "10",
    customerType: "enterprise",
    creditCode: "91110000MA44CDEF12",
    companyName: "都会传媒股份有限公司",
    legalPerson: "高远",
    contactName: "高翔",
    contactPhone: "13000001010",
    contactEmail: "gaoxiang@metro.example",
    address: "北京市海淀区中关村大街 1 号",
    contractFiles: [
      { id: "f8", name: "都会传媒主合同.pdf", size: 1_500_000 },
      { id: "f9", name: "增补协议-2026.pdf", size: 320_000 },
    ],
    contractStart: "2026-01-15",
    contractEnd: "2026-12-15",
    contractAmount: 680000,
    account: "metro_media",
    passwordHint: "Metro_Media4!",
    status: "enabled",
    productServices: [
      svc("dci", "total", 100000, 42000, "2026-01-15", "2026-12-15"),
      svc("info", "total", 50000, 18000, "2026-01-15", "2026-12-15"),
      svc("certificate", "total", 30000, 9000, "2026-01-15", "2026-12-15"),
      svc("workReview", "total", 40000, 21000, "2026-01-15", "2026-12-15"),
    ],
    createdAt: "2026-01-10 11:00:00",
    updatedAt: "2026-08-12 16:00:00",
  },
  {
    id: "11",
    customerType: "enterprise",
    creditCode: "91610000MA88GHIJ34",
    companyName: "丝路数字内容有限公司",
    legalPerson: "林海",
    contactName: "林芳",
    contactPhone: "12900001111",
    contactEmail: "linfang@silk.example",
    address: "西安市雁塔区高新一路 20 号",
    contractFiles: [],
    contractStart: "2026-07-01",
    contractEnd: "2027-06-30",
    contractAmount: 120000,
    account: "silk_road",
    passwordHint: "Silk_Road6!",
    status: "enabled",
    productServices: [
      svc("workReview", "total", 9000, 0, "2026-07-01", "2027-06-30"),
    ],
    createdAt: "2026-06-25 14:00:00",
    updatedAt: "2026-06-25 14:00:00",
  },
  {
    id: "12",
    customerType: "enterprise",
    creditCode: "91330000MA99KLMN56",
    companyName: "灯塔教育科技有限公司",
    legalPerson: "何平",
    contactName: "何俊",
    contactPhone: "12800001212",
    contactEmail: "hejun@beacon.example",
    address: "杭州市西湖区文三路 90 号",
    contractFiles: [{ id: "f10", name: "灯塔教育合同.pdf", size: 640_000 }],
    contractStart: "2025-01-01",
    contractEnd: "2025-12-31",
    contractAmount: 72000,
    account: "beacon_edu",
    passwordHint: "Beacon_Edu9!",
    status: "disabled",
    productServices: [
      svc("info", "total", 8000, 8000, "2025-01-01", "2025-12-31"),
      svc("workReview", "total", 8000, 7600, "2025-01-01", "2025-12-31"),
    ],
    createdAt: "2024-12-18 10:30:00",
    updatedAt: "2026-01-02 09:15:00",
  },
  {
    id: "101",
    customerType: "enterprise",
    creditCode: "91440300MA5D998877",
    companyName: "前海智链科技有限公司",
    legalPerson: "黄伟",
    contactName: "林静",
    contactPhone: "13800009988",
    contactEmail: "linjing@zhilian.example",
    address: "深圳市前海深港合作区梦海大道 5033 号",
    contractFiles: [{ id: "af4", name: "智链-开通协议.pdf", size: 740_000 }],
    contractStart: "2026-03-01",
    contractEnd: "2027-02-28",
    contractAmount: 98000,
    account: "zhilian_sz",
    passwordHint: "Zhilian8!",
    status: "enabled",
    productServices: [
      svc("dci", "total", 20000, 3200, "2026-03-01", "2027-02-28"),
      svc("info", "total", 15000, 1800, "2026-03-01", "2027-02-28"),
      svc("workReview", "total", 30000, 5600, "2026-03-01", "2027-02-28"),
    ],
    createdAt: "2026-08-21 11:20:00",
    updatedAt: "2026-08-21 11:20:00",
  },
].map((c) =>
  ensureCustomerContracts({ ...(c as CustomerAccount), contracts: [] }),
);

export const MOCK_OP_LOGS: CustomerOpLog[] = [
  {
    id: "log-1",
    customerId: "1",
    action: "create",
    summary: "创建客户账号",
    changes: [
      { field: "账号", before: "—", after: "acme_corp" },
      { field: "公司全称", before: "—", after: "艾克米文化传媒有限公司" },
    ],
    operator: "运营管理员",
    at: "2026-01-02 10:00:00",
  },
  {
    id: "log-2",
    customerId: "1",
    action: "service",
    summary: "调整产品服务配置",
    changes: [
      { field: "DCI核验·额度", before: "总量 30000", after: "总量 50000" },
    ],
    operator: "运营管理员",
    at: "2026-03-15 11:20:00",
  },
  {
    id: "log-3",
    customerId: "1",
    action: "edit",
    summary: "编辑客户联系信息",
    changes: [
      { field: "联系人电话", before: "13800000000", after: "13800001111" },
    ],
    operator: "运营管理员",
    at: "2026-08-01 14:20:00",
  },
  {
    id: "log-4",
    customerId: "3",
    action: "disable",
    summary: "停用账号",
    changes: [{ field: "状态", before: "已启用", after: "已停用" }],
    operator: "运营管理员",
    at: "2026-06-01 09:00:00",
  },
  {
    id: "log-5",
    customerId: "3",
    action: "service",
    summary: "停止产品服务",
    changes: [{ field: "作品智能辅助审核", before: "生效中", after: "已停止" }],
    operator: "运营管理员",
    at: "2026-05-28 16:40:00",
  },
  {
    id: "log-6",
    customerId: "4",
    action: "create",
    summary: "审核开通创建客户",
    changes: [
      { field: "账号", before: "—", after: "ocean_music" },
      { field: "公司全称", before: "—", after: "瀚海音乐文化有限公司" },
    ],
    operator: "运营管理员",
    at: "2026-08-10 10:05:40",
  },
  {
    id: "log-7",
    customerId: "2",
    action: "service",
    summary: "调整产品服务配置",
    changes: [
      {
        field: "作品智能辅助审核·额度",
        before: "总量 30000",
        after: "总量 50000",
      },
    ],
    operator: "李运营",
    at: "2026-08-19 11:05:00",
  },
  {
    id: "log-8",
    customerId: "1",
    action: "edit",
    summary: "重置登录密码",
    changes: [{ field: "密码", before: "—", after: "（已重置）" }],
    operator: "李运营",
    at: "2026-08-18 09:40:11",
  },
];
