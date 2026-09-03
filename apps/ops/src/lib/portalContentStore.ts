import { useEffect, useState } from "react";
import type { Visibility } from "@/lib/contentStore";
import { VISIBILITY_LABEL } from "@/lib/contentStore";

export { VISIBILITY_LABEL };
export type { Visibility };

export type PortalContentTab = "hero" | "verify" | "audit";

export const PORTAL_TAB_LABEL: Record<PortalContentTab, string> = {
  hero: "焦点区",
  verify: "版权核验",
  audit: "智能辅助审核",
};

/** 焦点区视觉变体（对齐门户 HeroVisual） */
export type HeroVariant = "trust" | "verify" | "audit";

export const HERO_VARIANT_LABEL: Record<HeroVariant, string> = {
  trust: "平台能力",
  verify: "版权核验",
  audit: "智能审核",
};

export const HERO_VARIANTS: HeroVariant[] = ["trust", "verify", "audit"];

/** 版权核验产品视觉 id（对齐 ProductVisual） */
export type VerifyProductKey = "dci" | "info" | "certificate";

export const VERIFY_PRODUCT_KEYS: VerifyProductKey[] = ["dci", "info", "certificate"];

export const VERIFY_PRODUCT_KEY_LABEL: Record<VerifyProductKey, string> = {
  dci: "DCI核验",
  info: "版权登记信息核验",
  certificate: "版权登记证书核验",
};

/** 智能辅助审核产品视觉 id */
export type AuditProductKey = "safety" | "duplicate" | "infringement";

export const AUDIT_PRODUCT_KEYS: AuditProductKey[] = ["safety", "duplicate", "infringement"];

export const AUDIT_PRODUCT_KEY_LABEL: Record<AuditProductKey, string> = {
  safety: "内容安全审核",
  duplicate: "作品登记查重",
  infringement: "疑似侵权审核",
};

/**
 * 门户首屏焦点主题
 * 对齐 HeroCarousel：主标题 / 高亮副标题 / 导语 + 视觉变体
 */
export type HeroTheme = {
  id: string;
  /** 运营侧主题名称，便于列表识别 */
  name: string;
  weight: number;
  status: Visibility;
  /** 驱动右侧插画与轮播 Tab 默认文案 */
  variant: HeroVariant;
  /** 轮播 Tab 文案；空则回退 HERO_VARIANT_LABEL[variant] */
  tabLabel: string;
  title: string;
  highlight: string;
  lead: string;
  maintainer: string;
  updatedAt: string;
};

/**
 * 门户产品展示卡片
 * 对齐 ProductShowcase：产品标题 + 描述 + 视觉 id
 */
export type ShowcaseTheme = {
  id: string;
  /** 产品视觉键，对齐门户 ProductVisual */
  productKey: string;
  title: string;
  desc: string;
  weight: number;
  status: Visibility;
  maintainer: string;
  updatedAt: string;
};

/** 板块级：标题 + 导语（门户无 eyebrow） */
export type ShowcaseSectionMeta = {
  heading: string;
  lead: string;
};

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let heroSeq = 10;
let verifySeq = 10;
let auditSeq = 10;

let heroThemes: HeroTheme[] = [
  {
    id: "hero-1",
    name: "信任主张",
    weight: 10,
    status: "visible",
    variant: "trust",
    tabLabel: "平台能力",
    title: "以可信数据能力",
    highlight: "护航版权经营",
    lead: "面向内容平台与版权机构，提供版权核验、智能辅助审核与开放 API，让每一次确权与用权都可追溯、可计量。",
    maintainer: "运营管理员",
    updatedAt: "2026-03-01 10:00:00",
  },
  {
    id: "hero-2",
    name: "版权核验",
    weight: 20,
    status: "visible",
    variant: "verify",
    tabLabel: "版权核验",
    title: "版权核验",
    highlight: "权威可溯",
    lead: "覆盖 DCI 核验、版权登记信息核验与版权登记证书核验，支撑业务接入、交易确权与合规审查。",
    maintainer: "运营管理员",
    updatedAt: "2026-03-01 10:05:00",
  },
  {
    id: "hero-3",
    name: "智能辅助审核",
    weight: 30,
    status: "visible",
    variant: "audit",
    tabLabel: "智能审核",
    title: "智能辅助审核",
    highlight: "提效合规",
    lead: "涵盖内容安全审核、作品登记查重与疑似侵权审核，辅助缩短人工审核链路。",
    maintainer: "运营管理员",
    updatedAt: "2026-03-01 10:10:00",
  },
];

let verifyMeta: ShowcaseSectionMeta = {
  heading: "版权核验",
  lead: "连接权威登记数据，以下三项产品可独立或组合调用，帮助您在业务接入、交易确权与合规审查中快速确认权利信息。",
};

let verifyThemes: ShowcaseTheme[] = [
  {
    id: "verify-1",
    productKey: "dci",
    title: "DCI核验",
    desc: "通过 DCI 编码，结合作品名称与著作权人信息，核验 DCI 码是否存在，以及与作品、著作权人是否一致。",
    weight: 10,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 09:00:00",
  },
  {
    id: "verify-2",
    productKey: "info",
    title: "版权登记信息核验",
    desc: "通过版权登记号、作品名称与著作权人信息，核验登记号是否存在、登记类型（软件或作品），以及与软件名称/作品名称、著作权人是否一致。",
    weight: 20,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 09:05:00",
  },
  {
    id: "verify-3",
    productKey: "certificate",
    title: "版权登记证书核验",
    desc: "上传版权证书文件或图片，核验该证书是否真实准确，支持业务侧快速验真与留档。",
    weight: 30,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 09:10:00",
  },
];

let auditMeta: ShowcaseSectionMeta = {
  heading: "智能辅助审核",
  lead: "面向内容运营与登记审核场景，以下三项产品提供智能辅助研判能力，帮助缩短人工审核链路、提升处置效率。",
};

let auditThemes: ShowcaseTheme[] = [
  {
    id: "audit-1",
    productKey: "safety",
    title: "内容安全审核",
    desc: "对作品全部登记申请材料进行色情、暴恐、政治敏感等内容安全风险判定参考。",
    weight: 10,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 10:00:00",
  },
  {
    id: "audit-2",
    productKey: "duplicate",
    title: "作品登记查重",
    desc: "对作品登记的样本与已登记样本进行对比，识别高度雷同样本。",
    weight: 20,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 10:05:00",
  },
  {
    id: "audit-3",
    productKey: "infringement",
    title: "疑似侵权审核",
    desc: "对登记作品样本进行肖像/人声识别，知名人物/商标/作品识别，疑似侵权作品识别。",
    weight: 30,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 10:10:00",
  },
];

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function byWeight<T extends { weight: number; updatedAt: string }>(list: T[]) {
  return [...list].sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    return b.updatedAt.localeCompare(a.updatedAt);
  });
}

export function getHeroThemes() {
  return byWeight(heroThemes);
}

export function getVerifyMeta() {
  return verifyMeta;
}

export function getAuditMeta() {
  return auditMeta;
}

export function getVerifyThemes() {
  return byWeight(verifyThemes);
}

export function getAuditThemes() {
  return byWeight(auditThemes);
}

function visibleHeroCount(excludeId?: string) {
  return heroThemes.filter((t) => t.status === "visible" && t.id !== excludeId).length;
}

function visibleShowcaseCount(list: ShowcaseTheme[], excludeId?: string) {
  return list.filter((t) => t.status === "visible" && t.id !== excludeId).length;
}

export type HeroThemeInput = {
  name: string;
  weight: number;
  variant: HeroVariant;
  tabLabel: string;
  title: string;
  highlight: string;
  lead: string;
};

export function createHeroTheme(input: HeroThemeInput) {
  heroSeq += 1;
  heroThemes = [
    ...heroThemes,
    {
      id: `hero-${heroSeq}`,
      name: input.name.trim(),
      weight: input.weight,
      variant: input.variant,
      tabLabel: input.tabLabel.trim(),
      title: input.title.trim(),
      highlight: input.highlight.trim(),
      lead: input.lead.trim(),
      status: "hidden",
      maintainer: "运营管理员",
      updatedAt: nowStamp(),
    },
  ];
  emit();
}

export function updateHeroTheme(id: string, input: HeroThemeInput): string | null {
  if (!heroThemes.some((t) => t.id === id)) return "主题不存在";
  heroThemes = heroThemes.map((t) =>
    t.id === id
      ? {
          ...t,
          name: input.name.trim(),
          weight: input.weight,
          variant: input.variant,
          tabLabel: input.tabLabel.trim(),
          title: input.title.trim(),
          highlight: input.highlight.trim(),
          lead: input.lead.trim(),
          maintainer: "运营管理员",
          updatedAt: nowStamp(),
        }
      : t,
  );
  emit();
  return null;
}

export function deleteHeroTheme(id: string): string | null {
  const row = heroThemes.find((t) => t.id === id);
  if (!row) return "主题不存在";
  if (row.status === "visible" && visibleHeroCount(id) < 1) {
    return "至少需要保留 1 个展示中的焦点主题，无法删除";
  }
  heroThemes = heroThemes.filter((t) => t.id !== id);
  emit();
  return null;
}

export function setHeroThemeVisibility(id: string, status: Visibility): string | null {
  const row = heroThemes.find((t) => t.id === id);
  if (!row) return "主题不存在";
  if (status === "hidden" && row.status === "visible" && visibleHeroCount(id) < 1) {
    return "至少需要保留 1 个展示中的焦点主题";
  }
  heroThemes = heroThemes.map((t) =>
    t.id === id
      ? { ...t, status, updatedAt: nowStamp(), maintainer: "运营管理员" }
      : t,
  );
  emit();
  return null;
}

export type ShowcaseThemeInput = {
  productKey: string;
  title: string;
  desc: string;
  weight: number;
};

export function updateVerifyMeta(meta: ShowcaseSectionMeta) {
  verifyMeta = { heading: meta.heading.trim(), lead: meta.lead.trim() };
  emit();
}

export function updateAuditMeta(meta: ShowcaseSectionMeta) {
  auditMeta = { heading: meta.heading.trim(), lead: meta.lead.trim() };
  emit();
}

export function addVerifyTheme(input: ShowcaseThemeInput) {
  verifySeq += 1;
  verifyThemes = [
    ...verifyThemes,
    {
      id: `verify-${verifySeq}`,
      productKey: input.productKey.trim(),
      title: input.title.trim(),
      desc: input.desc.trim(),
      weight: input.weight,
      status: "hidden",
      maintainer: "运营管理员",
      updatedAt: nowStamp(),
    },
  ];
  emit();
}

export function addAuditTheme(input: ShowcaseThemeInput) {
  auditSeq += 1;
  auditThemes = [
    ...auditThemes,
    {
      id: `audit-${auditSeq}`,
      productKey: input.productKey.trim(),
      title: input.title.trim(),
      desc: input.desc.trim(),
      weight: input.weight,
      status: "hidden",
      maintainer: "运营管理员",
      updatedAt: nowStamp(),
    },
  ];
  emit();
}

export function updateVerifyTheme(id: string, input: ShowcaseThemeInput): string | null {
  if (!verifyThemes.some((t) => t.id === id)) return "主题不存在";
  verifyThemes = verifyThemes.map((t) =>
    t.id === id
      ? {
          ...t,
          productKey: input.productKey.trim(),
          title: input.title.trim(),
          desc: input.desc.trim(),
          weight: input.weight,
          maintainer: "运营管理员",
          updatedAt: nowStamp(),
        }
      : t,
  );
  emit();
  return null;
}

export function updateAuditTheme(id: string, input: ShowcaseThemeInput): string | null {
  if (!auditThemes.some((t) => t.id === id)) return "主题不存在";
  auditThemes = auditThemes.map((t) =>
    t.id === id
      ? {
          ...t,
          productKey: input.productKey.trim(),
          title: input.title.trim(),
          desc: input.desc.trim(),
          weight: input.weight,
          maintainer: "运营管理员",
          updatedAt: nowStamp(),
        }
      : t,
  );
  emit();
  return null;
}

export function deleteVerifyTheme(id: string): string | null {
  const row = verifyThemes.find((t) => t.id === id);
  if (!row) return "主题不存在";
  if (row.status === "visible" && visibleShowcaseCount(verifyThemes, id) < 1) {
    return "至少需要保留 1 个展示中的主题，无法删除";
  }
  verifyThemes = verifyThemes.filter((t) => t.id !== id);
  emit();
  return null;
}

export function deleteAuditTheme(id: string): string | null {
  const row = auditThemes.find((t) => t.id === id);
  if (!row) return "主题不存在";
  if (row.status === "visible" && visibleShowcaseCount(auditThemes, id) < 1) {
    return "至少需要保留 1 个展示中的主题，无法删除";
  }
  auditThemes = auditThemes.filter((t) => t.id !== id);
  emit();
  return null;
}

export function setVerifyThemeVisibility(id: string, status: Visibility): string | null {
  const row = verifyThemes.find((t) => t.id === id);
  if (!row) return "主题不存在";
  if (status === "hidden" && row.status === "visible" && visibleShowcaseCount(verifyThemes, id) < 1) {
    return "至少需要保留 1 个展示中的主题";
  }
  verifyThemes = verifyThemes.map((t) =>
    t.id === id ? { ...t, status, updatedAt: nowStamp(), maintainer: "运营管理员" } : t,
  );
  emit();
  return null;
}

export function setAuditThemeVisibility(id: string, status: Visibility): string | null {
  const row = auditThemes.find((t) => t.id === id);
  if (!row) return "主题不存在";
  if (status === "hidden" && row.status === "visible" && visibleShowcaseCount(auditThemes, id) < 1) {
    return "至少需要保留 1 个展示中的主题";
  }
  auditThemes = auditThemes.map((t) =>
    t.id === id ? { ...t, status, updatedAt: nowStamp(), maintainer: "运营管理员" } : t,
  );
  emit();
  return null;
}

export function usePortalContentStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);

  return {
    heroThemes: getHeroThemes(),
    verifyMeta: getVerifyMeta(),
    auditMeta: getAuditMeta(),
    verifyThemes: getVerifyThemes(),
    auditThemes: getAuditThemes(),
    createHeroTheme,
    updateHeroTheme,
    deleteHeroTheme,
    setHeroThemeVisibility,
    updateVerifyMeta,
    updateAuditMeta,
    addVerifyTheme,
    addAuditTheme,
    updateVerifyTheme,
    updateAuditTheme,
    deleteVerifyTheme,
    deleteAuditTheme,
    setVerifyThemeVisibility,
    setAuditThemeVisibility,
  };
}
