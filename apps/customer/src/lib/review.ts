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
    subtitle: "检测文本/图片/视频中的违规内容",
    intro: [
      { label: "检测内容", text: "文本、图片、视频中的涉黄、涉暴、涉政等违规内容" },
      { label: "适用场景", text: "UGC内容平台、直播平台、社交媒体、论坛社区" },
      { label: "检测维度", text: "色情低俗、暴力恐怖、政治敏感、违法违规、广告引流" },
    ],
    serviceStatus: "active",
    expireAt: "2026-08-25",
    records: MOCK_SAFETY_RECORDS,
  },
  duplicate: {
    productCode: "duplicate",
    apiDocId: "dedup",
    title: "作品登记查重",
    subtitle: "基于DCI权属链的相似度比对",
    intro: [
      { label: "检测内容", text: "新提交作品与已登记作品的相似度比对" },
      { label: "适用场景", text: "作品登记前的原创性预审、版权纠纷预防" },
      { label: "比对范围", text: "中国版权保护中心全量登记数据库（2000年至今）" },
    ],
    serviceStatus: "active",
    records: MOCK_DEDUP_RECORDS,
  },
  infringement: {
    productCode: "infringement",
    apiDocId: "infringe",
    title: "疑似侵权审核",
    subtitle: "检测作品是否存在侵权风险",
    intro: [
      { label: "检测内容", text: "疑似侵权作品与权利作品的相似度分析" },
      { label: "适用场景", text: "版权维权、侵权投诉处理、侵权风险评估" },
      { label: "输出结果", text: "相似度报告、侵权风险等级、相似片段对比" },
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
