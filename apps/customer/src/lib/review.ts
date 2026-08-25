import type { ProductCode } from "@/lib/catalog";
import { DASHBOARD_PRODUCTS } from "@/lib/dashboard";

export type ReviewProductCode = Extract<ProductCode, "safety" | "duplicate" | "infringement">;

export type ReviewRecordStatus = "success" | "fail" | "partial";

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
  serviceStatus: "active" | "expiring" | "stopped";
  expireAt?: string;
  stoppedNote?: string;
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
    serviceStatus: "active",
    expireAt: "2026-08-25",
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
    serviceStatus: "active",
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
    serviceStatus: "stopped",
    stoppedNote: "需联系运营恢复",
    records: [],
  },
};

export function getReviewQuota(productCode: ReviewProductCode) {
  const p = DASHBOARD_PRODUCTS.find((d) => d.code === productCode);
  if (!p) return null;
  return {
    usedCount: p.usedCount,
    quotaTotal: p.quotaTotal,
    quotaUsagePct: p.quotaUsagePct,
    expireAt: p.expireAt,
  };
}

export function formatReviewCount(n: number) {
  return n.toLocaleString("zh-CN");
}
