import type { ProductCode } from "@/lib/catalog";

export type TenantProfile = {
  companyName: string;
  creditCode: string;
  contactName: string;
  contactPhone: string;
  address: string;
};

export type TenantService = {
  product: ProductCode;
  openedAt: string;
  expireAt: string;
  quotaTotal: number | null;
  usedCount: number;
  status: "active" | "expiring" | "stopped";
};

export type TenantContract = {
  id: string;
  contractNo: string;
  startDate: string;
  endDate: string;
  amount: number;
  periodStatus: "active" | "pending" | "expired";
  files: { id: string; name: string; size?: number }[];
};

export const MOCK_TENANT: TenantProfile = {
  companyName: "太极计算机股份有限公司",
  creditCode: "91110000MA01XXXX3K",
  contactName: "李四",
  contactPhone: "13800001234",
  address: "北京市海淀区中关村大街1号",
};

/** 控制台登录会话（演示） */
export const MOCK_SESSION = {
  /** 登录用户名（顶栏展示） */
  username: "lisi",
  /** 是否已是 DCI 注册中心（决定下拉菜单文案与跳转） */
  isDciRegistryCenter: true,
};

/** 外链门户（账号中心 / DCI 注册中心等） */
export const PORTAL_LINKS = {
  accountCenter: "https://app-ck03sng4kykh.appmiaoda.com/account",
  dciRegistryWorkbench: "https://app-ck03sng4kykh.appmiaoda.com/dashboard/home",
  applyDciRegistry: "https://app-ck03sng4kykh.appmiaoda.com/apply",
} as const;

export const MOCK_TENANT_SERVICES: TenantService[] = [
  {
    product: "dci",
    openedAt: "2025-01-01",
    expireAt: "2026-09-30",
    quotaTotal: 50000,
    usedCount: 12847,
    status: "active",
  },
  {
    product: "info",
    openedAt: "2025-01-01",
    expireAt: "2026-09-30",
    quotaTotal: 30000,
    usedCount: 8432,
    status: "active",
  },
  {
    product: "certificate",
    openedAt: "2025-02-01",
    expireAt: "2026-12-31",
    quotaTotal: 20000,
    usedCount: 3188,
    status: "active",
  },
  {
    product: "workReview",
    openedAt: "2025-06-01",
    expireAt: "2026-08-25",
    quotaTotal: 100000,
    usedCount: 48230,
    status: "expiring",
  },
];

export const MOCK_TENANT_CONTRACTS: TenantContract[] = [
  {
    id: "c1",
    contractNo: "HT-2025-0088",
    startDate: "2025-01-01",
    endDate: "2026-12-31",
    amount: 280000,
    periodStatus: "active",
    files: [
      { id: "f1", name: "服务合同.pdf", size: 1_150_000 },
      { id: "f2", name: "补充协议.pdf", size: 420_000 },
    ],
  },
];
