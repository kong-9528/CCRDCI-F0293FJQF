import { useEffect, useState } from "react";

export type AlgoModelId =
  | "lowQuality"
  | "autoClassify"
  | "duplicate"
  | "famousWork"
  | "famousTrademark"
  | "contentAnalysis"
  | "safetyAssist";

export type AlgoModel = {
  id: AlgoModelId;
  name: string;
  /** 短描述，卡片副文案 */
  blurb: string;
  enabled: boolean;
  todayCalls: number;
  totalCalls: number;
  todayTokens: number;
  totalTokens: number;
};

const SEED: AlgoModel[] = [
  {
    id: "lowQuality",
    name: "低质作品检测模型",
    blurb: "识别低质、灌水与无效内容",
    enabled: true,
    todayCalls: 1286,
    totalCalls: 482_310,
    todayTokens: 3_420_800,
    totalTokens: 891_204_500,
  },
  {
    id: "autoClassify",
    name: "作品自动分类模型",
    blurb: "多模态作品品类自动归类",
    enabled: true,
    todayCalls: 2450,
    totalCalls: 1_028_640,
    todayTokens: 5_180_200,
    totalTokens: 1_562_441_000,
  },
  {
    id: "duplicate",
    name: "作品查重模型",
    blurb: "跨库相似内容比对与溯源",
    enabled: true,
    todayCalls: 1892,
    totalCalls: 756_220,
    todayTokens: 8_640_100,
    totalTokens: 2_104_880_300,
  },
  {
    id: "famousWork",
    name: "知名作品检测模型",
    blurb: "知名作品特征匹配与预警",
    enabled: true,
    todayCalls: 964,
    totalCalls: 312_580,
    todayTokens: 2_210_400,
    totalTokens: 620_115_200,
  },
  {
    id: "famousTrademark",
    name: "知名商标检测模型",
    blurb: "商标元素识别与侵权提示",
    enabled: false,
    todayCalls: 0,
    totalCalls: 148_920,
    todayTokens: 0,
    totalTokens: 298_440_600,
  },
  {
    id: "contentAnalysis",
    name: "内容分析模型",
    blurb: "语义理解与结构化摘要",
    enabled: true,
    todayCalls: 3210,
    totalCalls: 1_456_700,
    todayTokens: 12_880_500,
    totalTokens: 3_420_660_100,
  },
  {
    id: "safetyAssist",
    name: "版权内容安全辅助审核模型",
    blurb: "合规风险辅助研判与标注",
    enabled: true,
    todayCalls: 1578,
    totalCalls: 624_350,
    todayTokens: 4_560_900,
    totalTokens: 1_188_220_400,
  },
];

let models: AlgoModel[] = SEED.map((m) => ({ ...m }));
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

export function listAlgoModels(): AlgoModel[] {
  return models.map((m) => ({ ...m }));
}

export function setAlgoModelEnabled(id: AlgoModelId, enabled: boolean) {
  const idx = models.findIndex((m) => m.id === id);
  if (idx < 0) return;
  const cur = models[idx]!;
  models[idx] = { ...cur, enabled };
  emit();
}

export function useAlgoModelsStore() {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return {
    models: listAlgoModels(),
    setEnabled: setAlgoModelEnabled,
  };
}

export function formatCompactNumber(n: number): string {
  if (n >= 100_000_000) return `${(n / 100_000_000).toFixed(2)}亿`;
  if (n >= 10_000) return `${(n / 10_000).toFixed(n >= 1_000_000 ? 1 : 2)}万`;
  return n.toLocaleString("zh-CN");
}
