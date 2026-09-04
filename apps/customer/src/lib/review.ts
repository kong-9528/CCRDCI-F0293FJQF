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
  /** 允许超额继续调用，仅提示不拦截 */
  allowOverQuota: boolean;
};

/** 作品智能辅助审核统一额度（三个审核接口共用）；演示已超额仍可使用 */
export const WORK_REVIEW_ENTITLEMENT: WorkReviewEntitlement = {
  status: "expiring",
  usedCount: 105230,
  quotaTotal: 100000,
  quotaUsagePct: 105.2,
  expireAt: "2026-08-25",
  allowOverQuota: true,
};

/**
 * 异步审核任务状态：
 * - reviewing：已提交，结果未返回
 * - success：查询到审核完成且成功
 * - fail：任务失败或审核未通过
 */
export type ReviewRecordStatus = "success" | "fail" | "reviewing";

/** 审核记录默认查询天数 */
export const REVIEW_DEFAULT_DAYS = 30;

export type ReviewRecord = {
  id: string;
  /** 流水号：提交任务返回，用于查询审核结果 */
  taskId: string;
  submittedAt: string;
  /** 审核完成时间；正在审核时为空 */
  finishedAt: string | null;
  apiName: string;
  productCode: ReviewProductCode;
  status: ReviewRecordStatus;
  quotaCost: number;
};

export type ReviewServiceConfig = {
  productCode: ReviewProductCode;
  apiDocId: string;
  title: string;
  subtitle: string;
  intro: { label: string; text: string }[];
};

export const REVIEW_RECORD_STATUS_LABEL: Record<ReviewRecordStatus, string> = {
  success: "成功",
  fail: "失败",
  reviewing: "正在审核",
};

/** 三个审核接口的共用任务流水（异步：先提交再按流水号查结果） */
export const WORK_REVIEW_RECORDS: ReviewRecord[] = [
  {
    id: "r1",
    taskId: "WR20260819171000421",
    submittedAt: "2026-08-19 17:10:12",
    finishedAt: "2026-08-19 17:12:48",
    apiName: "疑似侵权审核",
    productCode: "infringement",
    status: "success",
    quotaCost: 2,
  },
  {
    id: "r2",
    taskId: "WR20260819165500388",
    submittedAt: "2026-08-19 16:55:03",
    finishedAt: null,
    apiName: "内容安全审核",
    productCode: "safety",
    status: "reviewing",
    quotaCost: 1,
  },
  {
    id: "r3",
    taskId: "WR20260819163000291",
    submittedAt: "2026-08-19 16:30:44",
    finishedAt: "2026-08-19 16:31:18",
    apiName: "作品登记查重",
    productCode: "duplicate",
    status: "success",
    quotaCost: 1,
  },
  {
    id: "r4",
    taskId: "WR20260819152200156",
    submittedAt: "2026-08-19 15:22:09",
    finishedAt: "2026-08-19 15:25:41",
    apiName: "疑似侵权审核",
    productCode: "infringement",
    status: "fail",
    quotaCost: 2,
  },
  {
    id: "r5",
    taskId: "WR20260819145500102",
    submittedAt: "2026-08-19 14:55:27",
    finishedAt: null,
    apiName: "作品登记查重",
    productCode: "duplicate",
    status: "reviewing",
    quotaCost: 1,
  },
  {
    id: "r6",
    taskId: "WR20260819132000087",
    submittedAt: "2026-08-19 13:20:05",
    finishedAt: "2026-08-19 13:20:06",
    apiName: "内容安全审核",
    productCode: "safety",
    status: "fail",
    quotaCost: 0,
  },
  {
    id: "r7",
    taskId: "WR20260819111000061",
    submittedAt: "2026-08-19 11:10:33",
    finishedAt: "2026-08-19 11:11:02",
    apiName: "内容安全审核",
    productCode: "safety",
    status: "success",
    quotaCost: 1,
  },
];

export const REVIEW_SERVICES: Record<ReviewProductCode, ReviewServiceConfig> = {
  safety: {
    productCode: "safety",
    apiDocId: "workReview",
    title: "内容安全审核",
    subtitle: "",
    intro: [
      {
        label: "服务说明",
        text: "对作品全部登记申请材料进行色情、暴恐、政治敏感等内容安全风险判定参考。调用为异步模式：先提交审核任务获取流水号，再凭流水号查询审核结果。",
      },
    ],
  },
  duplicate: {
    productCode: "duplicate",
    apiDocId: "workReview",
    title: "作品登记查重",
    subtitle: "",
    intro: [
      {
        label: "服务说明",
        text: "对作品登记的样本与已登记样本进行对比，识别高度雷同样本。调用为异步模式：先提交审核任务获取流水号，再凭流水号查询审核结果。",
      },
    ],
  },
  infringement: {
    productCode: "infringement",
    apiDocId: "workReview",
    title: "疑似侵权审核",
    subtitle: "",
    intro: [
      {
        label: "服务说明",
        text: "对登记作品样本进行肖像/人声识别，知名人物/商标/作品识别，疑似侵权作品识别。调用为异步模式：先提交审核任务获取流水号，再凭流水号查询审核结果。",
      },
    ],
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
    allowOverQuota: WORK_REVIEW_ENTITLEMENT.allowOverQuota,
    overQuota: WORK_REVIEW_ENTITLEMENT.usedCount > WORK_REVIEW_ENTITLEMENT.quotaTotal,
  };
}

/** 作品智能辅助审核共用任务流水（三接口合并列表） */
export function listWorkReviewRecords() {
  return WORK_REVIEW_RECORDS.slice().sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt),
  );
}

export function formatReviewCount(n: number) {
  return n.toLocaleString("zh-CN");
}
