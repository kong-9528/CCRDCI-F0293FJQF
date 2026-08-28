import type { ProductCode } from "@/lib/catalog";

export type TenantProfile = {
  companyName: string;
  creditCode: string;
  legalPerson: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
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
  files: { id: string; name: string }[];
};

export const MOCK_TENANT: TenantProfile = {
  companyName: "太极计算机股份有限公司",
  creditCode: "91110000MA01XXXX3K",
  legalPerson: "张三",
  contactName: "李四",
  contactPhone: "138-0000-1234",
  contactEmail: "admin@huaxin.com",
  address: "北京市海淀区中关村大街1号",
};

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
    amount: 128000,
    periodStatus: "active",
    files: [
      { id: "f1", name: "主合同.pdf" },
      { id: "f2", name: "附件1.pdf" },
    ],
  },
  {
    id: "c2",
    contractNo: "HT-2024-0012",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    amount: 96000,
    periodStatus: "expired",
    files: [{ id: "f3", name: "合同.pdf" }],
  },
];
