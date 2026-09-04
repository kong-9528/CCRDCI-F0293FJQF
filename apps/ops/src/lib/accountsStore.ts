import { useEffect, useState } from "react";
import type { ContractFile, ProductCode } from "@/lib/catalog";
import { createCustomer, isAccountTaken } from "@/lib/customersStore";
import { parseProductServices, type ProductFormRow } from "@/lib/customerForm";
import type { ProductConfigState } from "@/lib/productConfig";
import { defaultProductConfigForApplication, validateProductConfig } from "@/lib/productConfig";
import { getCurrentUser } from "@/lib/usersStore";

export type ApplicationStatus = "pending" | "approved" | "rejected";

export type AccountApplication = {
  id: string;
  status: ApplicationStatus;
  creditCode: string;
  companyName: string;
  contactName: string;
  contactPhone: string;
  address: string;
  contractNo: string;
  contractFiles: ContractFile[];
  contractStart: string;
  contractEnd: string;
  contractAmount: number | null;
  account: string;
  /** 账号绑定手机号 */
  boundPhone: string;
  passwordHint: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewer?: string;
  rejectReason?: string;
  customerId?: string;
  /** 申请开通的产品（待审核/已拒绝展示；已通过时以关联客户配置为准） */
  requestedProducts: ProductCode[];
};

export const APPLICATION_STATUS_LABEL: Record<ApplicationStatus, string> = {
  pending: "待审核",
  approved: "已通过",
  rejected: "已拒绝",
};

const MOCK_APPLICATIONS: AccountApplication[] = [
  {
    id: "app-1",
    status: "pending",
    creditCode: "91110108MA01XY1234",
    companyName: "云图数字科技有限公司",
    contactName: "周婷",
    contactPhone: "13600001234",
    address: "北京市海淀区中关村软件园二期 8 号",
    contractNo: "HT-2026-0318",
    contractFiles: [{ id: "af1", name: "云图-平台开通申请.pdf", size: 860_000 }],
    contractStart: "2026-04-01",
    contractEnd: "2027-03-31",
    contractAmount: 168000,
    account: "yuntu_tech",
    boundPhone: "13600001234",
    passwordHint: "Yuntu#2026",
    submittedAt: "2026-08-26 10:15:00",
    requestedProducts: ["dci", "workReview"],
  },
  {
    id: "app-2",
    status: "pending",
    creditCode: "91330100MA2HJK5678",
    companyName: "江南文创集团有限公司",
    contactName: "吴浩",
    contactPhone: "13500005678",
    address: "杭州市西湖区文三路 478 号",
    contractNo: "HT-2026-0422",
    contractFiles: [
      { id: "af2", name: "江南文创-服务合同.pdf", size: 1_120_000 },
      { id: "af3", name: "营业执照副本.jpg", size: 320_000 },
    ],
    contractStart: "2026-05-01",
    contractEnd: "2027-04-30",
    contractAmount: 256000,
    account: "jnwc_group",
    boundPhone: "13500005678",
    passwordHint: "Jnwc@2026!",
    submittedAt: "2026-08-27 14:32:00",
    requestedProducts: ["certificate", "info", "workReview"],
  },
  {
    id: "app-3",
    status: "approved",
    creditCode: "91440300MA5D998877",
    companyName: "前海智链科技有限公司",
    contactName: "林静",
    contactPhone: "13800009988",
    address: "深圳市前海深港合作区梦海大道 5033 号",
    contractNo: "HT-2026-0208",
    contractFiles: [{ id: "af4", name: "智链-开通协议.pdf", size: 740_000 }],
    contractStart: "2026-03-01",
    contractEnd: "2027-02-28",
    contractAmount: 98000,
    account: "zhilian_sz",
    boundPhone: "13800009988",
    passwordHint: "Zhilian8!",
    submittedAt: "2026-08-20 09:08:00",
    reviewedAt: "2026-08-21 11:20:00",
    reviewer: "超级管理员",
    customerId: "101",
    requestedProducts: ["dci", "info", "workReview"],
  },
  {
    id: "app-4",
    status: "rejected",
    creditCode: "91510100MA62AB1122",
    companyName: "蜀锦文化传播工作室",
    contactName: "何平",
    contactPhone: "13900008877",
    address: "成都市武侯区科华北路 65 号",
    contractNo: "HT-2026-0510",
    contractFiles: [],
    contractStart: "2026-06-01",
    contractEnd: "2027-05-31",
    contractAmount: 48000,
    account: "shujin_studio",
    boundPhone: "13900008877",
    passwordHint: "Shujin#1",
    submittedAt: "2026-08-22 16:45:00",
    reviewedAt: "2026-08-23 10:05:00",
    reviewer: "超级管理员",
    rejectReason: "提交的合同附件不完整，请补充盖章版合同后重新申请。",
    requestedProducts: ["info"],
  },
  {
    id: "app-5",
    status: "approved",
    creditCode: "91310000MA1FL2XY99",
    companyName: "申城融媒体科技有限公司",
    contactName: "赵敏",
    contactPhone: "13700006655",
    address: "上海市静安区南京西路 1266 号",
    contractNo: "HT-2026-0612",
    contractFiles: [{ id: "af5", name: "申城融媒体-开通合同.pdf", size: 920_000 }],
    contractStart: "2026-07-01",
    contractEnd: "2027-06-30",
    contractAmount: 128000,
    account: "shencheng_media",
    boundPhone: "13700006655",
    passwordHint: "ScMedia#26",
    submittedAt: "2026-08-18 11:20:00",
    reviewedAt: "2026-08-19 15:40:00",
    reviewer: "王编辑",
    requestedProducts: ["certificate", "workReview"],
  },
  {
    id: "app-6",
    status: "rejected",
    creditCode: "91440100MA5K3N7788",
    companyName: "粤海数字创意有限公司",
    contactName: "陈峰",
    contactPhone: "13600007766",
    address: "广州市天河区珠江新城花城大道 85 号",
    contractNo: "HT-2026-0701",
    contractFiles: [{ id: "af6", name: "粤海-申请材料.zip", size: 2_100_000 }],
    contractStart: "2026-08-01",
    contractEnd: "2027-07-31",
    contractAmount: 76000,
    account: "yuehai_digital",
    boundPhone: "13600007766",
    passwordHint: "Yuehai@26",
    submittedAt: "2026-08-24 09:30:00",
    reviewedAt: "2026-08-25 16:12:00",
    reviewer: "李运营",
    rejectReason: "申请账号命名不规范，请按企业简称重新提交。",
    requestedProducts: ["dci"],
  },
];

function currentReviewerName() {
  return getCurrentUser()?.displayName?.trim() || "运营管理员";
}

let applications: AccountApplication[] = structuredClone(MOCK_APPLICATIONS);
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getApplications(): AccountApplication[] {
  return applications;
}

export function getApplicationById(id: string): AccountApplication | undefined {
  return applications.find((a) => a.id === id);
}

export function defaultProductRowsForApplication(app: AccountApplication): ProductFormRow[] {
  return defaultProductConfigForApplication(app).productRows;
}

export function approveApplication(
  id: string,
  config: ProductConfigState,
): { ok: true; customerId: string } | { ok: false; error: string } {
  const app = applications.find((a) => a.id === id);
  if (!app) return { ok: false, error: "申请记录不存在" };
  if (app.status !== "pending") return { ok: false, error: "该申请已处理，无法重复审核" };

  const validationError = validateProductConfig(config, { allowEmpty: true });
  if (validationError) return { ok: false, error: validationError };

  const products = parseProductServices(config.productRows, { allowEmpty: true });
  if (!products.ok) return { ok: false, error: products.error };

  if (isAccountTaken(app.account)) {
    return { ok: false, error: "申请账号已被占用，请拒绝后通知客户修改账号重新申请" };
  }

  const stamp = nowStamp();
  const customer = createCustomer({
    customerType: "enterprise",
    creditCode: app.creditCode,
    companyName: app.companyName,
    contactName: app.contactName,
    contactPhone: app.contactPhone,
    address: app.address,
    contracts: [
      {
        id: `ct-app-${id}`,
        contractNo: app.contractNo,
        startDate: app.contractStart,
        endDate: app.contractEnd,
        amount: app.contractAmount,
        files: [...app.contractFiles],
        createdAt: stamp,
        updatedAt: stamp,
      },
    ],
    contractFiles: [...app.contractFiles],
    contractStart: app.contractStart,
    contractEnd: app.contractEnd,
    contractAmount: app.contractAmount,
    account: app.account,
    passwordHint: app.passwordHint,
    productServices: products.value,
    status: "enabled",
  });

  applications = applications.map((row) =>
    row.id === id
      ? {
          ...row,
          status: "approved",
          reviewedAt: stamp,
          reviewer: currentReviewerName(),
          customerId: customer.id,
        }
      : row,
  );
  emit();
  return { ok: true, customerId: customer.id };
}

export function rejectApplication(
  id: string,
  reason: string,
): { ok: true } | { ok: false; error: string } {
  const app = applications.find((a) => a.id === id);
  if (!app) return { ok: false, error: "申请记录不存在" };
  if (app.status !== "pending") return { ok: false, error: "该申请已处理，无法重复审核" };

  const trimmed = reason.trim();
  if (!trimmed) return { ok: false, error: "请填写拒绝原因" };

  applications = applications.map((row) =>
    row.id === id
      ? {
          ...row,
          status: "rejected",
          reviewedAt: nowStamp(),
          reviewer: currentReviewerName(),
          rejectReason: trimmed,
        }
      : row,
  );
  emit();
  return { ok: true };
}

export function useAccountsStore() {
  const [, tick] = useState(0);
  useEffect(() => subscribe(() => tick((n) => n + 1)), []);
  return {
    applications,
    approveApplication,
    rejectApplication,
    getApplicationById,
  };
}
