import type { ProductCode } from "@/lib/catalog";

export type ReviewProductCode = Extract<ProductCode, "safety" | "duplicate" | "infringement">;

/** 统一产品开通名称（三个审核接口共用额度展示标题） */
export const WORK_REVIEW_SERVICE_NAME = "作品智能辅助审核";

export type WorkReviewEntitlement = {
  status: "active" | "expiring" | "stopped";
  usedCount: number;
  quotaTotal: number;
  quotaUsagePct: number;
  expireAt: string;
};

/** 作品智能辅助审核统一额度（三个审核接口共用） */
export const WORK_REVIEW_ENTITLEMENT: WorkReviewEntitlement = {
  status: "expiring",
  usedCount: 48230,
  quotaTotal: 100000,
  quotaUsagePct: 48.2,
  expireAt: "2026-08-25",
};

export type ReviewRecordStatus = "success" | "fail" | "partial";

/** 审核记录默认查询天数 */
export const REVIEW_DEFAULT_DAYS = 30;

export type ReviewRecord = {
  id: string;
  calledAt: string;
  apiName: string;
  status: ReviewRecordStatus;
  responseMs: number | null;
  quotaCost: number;
};

export type ReviewServiceConfig = {
  productCode: ReviewProductCode;
  apiDocId: string;
  title: string;
  subtitle: string;
  intro: { label: string; text: string }[];
  records: ReviewRecord[];
};

export const REVIEW_RECORD_STATUS_LABEL: Record<ReviewRecordStatus, string> = {
  success: "成功",
  fail: "失败",
  partial: "部分匹配",
};

const MOCK_SAFETY_RECORDS: ReviewRecord[] = [
  {
    id: "rs1",
    calledAt: "2026-08-19 15:10",
    apiName: "内容安全审核",
    status: "success",
    responseMs: 230,
    quotaCost: 1,
  },
  {
    id: "rs2",
    calledAt: "2026-08-19 14:55",
    apiName: "内容安全审核",
    status: "success",
    responseMs: 185,
    quotaCost: 1,
  },
  {
    id: "rs3",
    calledAt: "2026-08-19 13:20",
    apiName: "内容安全审核",
    status: "fail",
    responseMs: null,
    quotaCost: 0,
  },
];

const MOCK_DEDUP_RECORDS: ReviewRecord[] = [
  {
    id: "rd1",
    calledAt: "2026-08-19 16:30",
    apiName: "作品登记查重",
    status: "success",
    responseMs: 320,
    quotaCost: 1,
  },
  {
    id: "rd2",
    calledAt: "2026-08-19 15:45",
    apiName: "作品登记查重",
    status: "success",
    responseMs: 285,
    quotaCost: 1,
  },
  {
    id: "rd3",
    calledAt: "2026-08-19 14:20",
    apiName: "作品登记查重",
    status: "partial",
    responseMs: 410,
    quotaCost: 1,
  },
];

const MOCK_INFRINGEMENT_RECORDS: ReviewRecord[] = [
  {
    id: "ri1",
    calledAt: "2026-08-19 17:10",
    apiName: "疑似侵权审核",
    status: "success",
    responseMs: 450,
    quotaCost: 2,
  },
  {
    id: "ri2",
    calledAt: "2026-08-19 16:05",
    apiName: "疑似侵权审核",
    status: "success",
    responseMs: 380,
    quotaCost: 2,
  },
  {
    id: "ri3",
    calledAt: "2026-08-19 15:22",
    apiName: "疑似侵权审核",
    status: "partial",
    responseMs: 520,
    quotaCost: 2,
  },
];

export const REVIEW_SERVICES: Record<ReviewProductCode, ReviewServiceConfig> = {
  safety: {
    productCode: "safety",
    apiDocId: "safety",
    title: "内容安全审核",
    subtitle: "",
    intro: [
      {
        label: "服务说明",
        text: "对作品全部登记申请材料进行色情、暴恐、政治敏感等内容安全风险判定参考。",
      },
    ],
    records: MOCK_SAFETY_RECORDS,
  },
  duplicate: {
    productCode: "duplicate",
    apiDocId: "dedup",
    title: "作品登记查重",
    subtitle: "",
    intro: [
      {
        label: "服务说明",
        text: "对作品登记的样本与已登记样本进行对比，识别高度雷同样本",
      },
    ],
    records: MOCK_DEDUP_RECORDS,
  },
  infringement: {
    productCode: "infringement",
    apiDocId: "infringe",
    title: "疑似侵权审核",
    subtitle: "",
    intro: [
      {
        label: "服务说明",
        text: "对登记作品样本进行肖像/人声识别，知名人物/商标/作品识别，疑似侵权作品识别",
      },
    ],
    records: MOCK_INFRINGEMENT_RECORDS,
  },
};

export function getReviewServiceStatus(_productCode: ReviewProductCode) {
  return WORK_REVIEW_ENTITLEMENT.status;
}

export function getReviewQuota(_productCode: ReviewProductCode) {
  return {
    usedCount: WORK_REVIEW_ENTITLEMENT.usedCount,
    quotaTotal: WORK_REVIEW_ENTITLEMENT.quotaTotal,
    quotaUsagePct: WORK_REVIEW_ENTITLEMENT.quotaUsagePct,
    expireAt: WORK_REVIEW_ENTITLEMENT.expireAt,
  };
}

export function formatReviewCount(n: number) {
  return n.toLocaleString("zh-CN");
}
