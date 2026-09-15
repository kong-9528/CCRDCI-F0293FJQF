import type { ContractFile } from "@/lib/catalog";

/** 单次提交对应的历史审核记录（含申请快照与审核结果） */
export type AuditHistoryStatus = "pending" | "withdrawn" | "approved" | "rejected";

export type AuditHistoryRecord = {
  id: string;
  applicationId: string;
  /** 客户提交时间 */
  submittedAt: string;
  status: AuditHistoryStatus;
  companyName: string;
  /** 组织机构代码 */
  creditCode: string;
  address: string;
  /** 合作领域 */
  cooperationField: string;
  contractStart: string;
  contractEnd: string;
  contractFiles: ContractFile[];
  contactName: string;
  contactPhone: string;
  account: string;
  reviewedAt?: string;
  reviewer?: string;
  rejectReason?: string;
};

export const AUDIT_HISTORY_STATUS_LABEL: Record<AuditHistoryStatus, string> = {
  pending: "审核中",
  withdrawn: "已撤回",
  approved: "已通过",
  rejected: "不通过",
};

const MOCK_AUDIT_HISTORY: AuditHistoryRecord[] = [
  {
    id: "ahist-jn-2",
    applicationId: "app-2",
    submittedAt: "2026-08-27 14:32:00",
    status: "pending",
    companyName: "江南文创集团有限公司",
    creditCode: "91330100MA2HJK5678",
    address: "杭州市西湖区文三路 478 号",
    cooperationField: "文创内容发行与版权保护",
    contractStart: "2026-05-01",
    contractEnd: "2027-04-30",
    contractFiles: [
      { id: "af2", name: "江南文创-服务合同.pdf", size: 1_120_000 },
      { id: "af3", name: "营业执照副本.jpg", size: 320_000 },
    ],
    contactName: "吴浩",
    contactPhone: "13500005678",
    account: "jnwc_group",
  },
  {
    id: "ahist-jn-1",
    applicationId: "app-2",
    submittedAt: "2026-08-10 09:18:00",
    status: "rejected",
    companyName: "江南文创集团有限公司",
    creditCode: "91330100MA2HJK5678",
    address: "杭州市西湖区文三路 478 号",
    cooperationField: "文创内容发行与版权保护",
    contractStart: "2026-05-01",
    contractEnd: "2027-04-30",
    contractFiles: [{ id: "af2-old", name: "江南文创-服务合同.pdf", size: 980_000 }],
    contactName: "吴浩",
    contactPhone: "13500005678",
    account: "jnwc_group",
    reviewedAt: "2026-08-12 11:05:00",
    reviewer: "李运营",
    rejectReason: "合同附件缺少盖章页，请补充完整扫描件后重新提交。",
  },
  {
    id: "ahist-yt-1",
    applicationId: "app-1",
    submittedAt: "2026-08-26 10:15:00",
    status: "pending",
    companyName: "云图数字科技有限公司",
    creditCode: "91110108MA01XY1234",
    address: "北京市海淀区中关村软件园二期 8 号",
    cooperationField: "数字内容版权核验",
    contractStart: "2026-04-01",
    contractEnd: "2027-03-31",
    contractFiles: [{ id: "af1", name: "云图-平台开通申请.pdf", size: 860_000 }],
    contactName: "周婷",
    contactPhone: "13600001234",
    account: "yuntu_tech",
  },
  {
    id: "ahist-zl-1",
    applicationId: "app-3",
    submittedAt: "2026-08-20 09:08:00",
    status: "approved",
    companyName: "前海智链科技有限公司",
    creditCode: "91440300MA5D998877",
    address: "深圳市前海深港合作区梦海大道 5033 号",
    cooperationField: "跨境数字版权服务",
    contractStart: "2026-03-01",
    contractEnd: "2027-02-28",
    contractFiles: [{ id: "af4", name: "智链-开通协议.pdf", size: 740_000 }],
    contactName: "林静",
    contactPhone: "13800009988",
    account: "zhilian_sz",
    reviewedAt: "2026-08-21 11:20:00",
    reviewer: "超级管理员",
  },
  {
    id: "ahist-sj-1",
    applicationId: "app-4",
    submittedAt: "2026-08-22 16:45:00",
    status: "rejected",
    companyName: "蜀锦文化传播工作室",
    creditCode: "91510100MA62AB1122",
    address: "成都市武侯区科华北路 65 号",
    cooperationField: "艺术作品版权登记辅助",
    contractStart: "2026-06-01",
    contractEnd: "2027-05-31",
    contractFiles: [],
    contactName: "何平",
    contactPhone: "13900008877",
    account: "shujin_studio",
    reviewedAt: "2026-08-23 10:05:00",
    reviewer: "超级管理员",
    rejectReason: "提交的合同附件不完整，请补充盖章版合同后重新申请。",
  },
  {
    id: "ahist-sc-1",
    applicationId: "app-5",
    submittedAt: "2026-08-18 11:20:00",
    status: "approved",
    companyName: "申城融媒体科技有限公司",
    creditCode: "91310000MA1FL2XY99",
    address: "上海市静安区南京西路 1266 号",
    cooperationField: "融媒体内容版权核验",
    contractStart: "2026-07-01",
    contractEnd: "2027-06-30",
    contractFiles: [{ id: "af5", name: "申城融媒体-开通合同.pdf", size: 920_000 }],
    contactName: "赵敏",
    contactPhone: "13700006655",
    account: "shencheng_media",
    reviewedAt: "2026-08-19 15:40:00",
    reviewer: "王编辑",
  },
  {
    id: "ahist-yh-1",
    applicationId: "app-6",
    submittedAt: "2026-08-24 09:30:00",
    status: "rejected",
    companyName: "粤海数字创意有限公司",
    creditCode: "91440100MA5K3N7788",
    address: "广州市天河区珠江新城花城大道 85 号",
    cooperationField: "数字创意内容安全审核",
    contractStart: "2026-08-01",
    contractEnd: "2027-07-31",
    contractFiles: [{ id: "af6", name: "粤海-申请材料.zip", size: 2_100_000 }],
    contactName: "陈峰",
    contactPhone: "13600007766",
    account: "yuehai_digital",
    reviewedAt: "2026-08-25 16:12:00",
    reviewer: "李运营",
    rejectReason: "申请账号命名不规范，请按企业简称重新提交。",
  },
];

let auditHistory: AuditHistoryRecord[] = structuredClone(MOCK_AUDIT_HISTORY);

function snapshotFromApplication(
  app: {
    id: string;
    companyName: string;
    creditCode: string;
    address: string;
    cooperationField?: string;
    contractStart: string;
    contractEnd: string;
    contractFiles: ContractFile[];
    contactName: string;
    contactPhone: string;
    account: string;
    submittedAt: string;
  },
  status: AuditHistoryStatus,
  extra?: Partial<Pick<AuditHistoryRecord, "reviewedAt" | "reviewer" | "rejectReason">>,
): AuditHistoryRecord {
  return {
    id: `ahist-${app.id}-${Date.now()}`,
    applicationId: app.id,
    submittedAt: app.submittedAt,
    status,
    companyName: app.companyName,
    creditCode: app.creditCode,
    address: app.address,
    cooperationField: app.cooperationField || "",
    contractStart: app.contractStart,
    contractEnd: app.contractEnd,
    contractFiles: [...app.contractFiles],
    contactName: app.contactName,
    contactPhone: app.contactPhone,
    account: app.account,
    ...extra,
  };
}

/** 按申请时间倒序；同申请内最新提交在前 */
export function getAuditHistoryByApplicationId(applicationId: string): AuditHistoryRecord[] {
  return auditHistory
    .filter((r) => r.applicationId === applicationId)
    .sort((a, b) => (a.submittedAt < b.submittedAt ? 1 : -1));
}

export function upsertAuditHistoryPending(app: Parameters<typeof snapshotFromApplication>[0]) {
  const existingPending = auditHistory.find(
    (r) => r.applicationId === app.id && r.status === "pending" && r.submittedAt === app.submittedAt,
  );
  if (existingPending) return;
  auditHistory = [snapshotFromApplication(app, "pending"), ...auditHistory];
}

export function finalizeAuditHistory(
  applicationId: string,
  status: "approved" | "rejected",
  extra: { reviewedAt: string; reviewer: string; rejectReason?: string },
) {
  const pending = auditHistory.find((r) => r.applicationId === applicationId && r.status === "pending");
  if (pending) {
    auditHistory = auditHistory.map((r) =>
      r.id === pending.id
        ? {
            ...r,
            status,
            reviewedAt: extra.reviewedAt,
            reviewer: extra.reviewer,
            rejectReason: extra.rejectReason,
          }
        : r,
    );
    return;
  }
  // fallback：无 pending 快照时不追加（详情页应已有种子）
}
