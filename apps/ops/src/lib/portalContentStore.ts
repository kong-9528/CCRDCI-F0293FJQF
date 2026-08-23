import { useEffect, useState } from "react";
import type { Visibility } from "@/lib/contentStore";
import { VISIBILITY_LABEL } from "@/lib/contentStore";

export { VISIBILITY_LABEL };
export type { Visibility };

export type PortalContentTab = "hero" | "verify" | "audit";

export const PORTAL_TAB_LABEL: Record<PortalContentTab, string> = {
  hero: "焦点区",
  verify: "版权信息核验服务",
  audit: "智能辅助审核服务",
};

/** 门户首屏焦点主题：对齐 HeroCarousel 文案槽位 + 焦点图 */
export type HeroTheme = {
  id: string;
  /** 运营侧主题名称，便于列表识别 */
  name: string;
  weight: number;
  status: Visibility;
  /** 演示用：本地预览 Data URL 或空 */
  imageUrl: string;
  imageName: string;
  eyebrow: string;
  title: string;
  highlight: string;
  lead: string;
  maintainer: string;
  updatedAt: string;
};

/** 门户产品展示区主题：对齐 ProductShowcase */
export type ShowcaseTheme = {
  id: string;
  title: string;
  desc: string;
  /** 关键词，门户用「 · 」分隔展示为 chips */
  visual: string;
  imageUrl: string;
  imageName: string;
  weight: number;
  status: Visibility;
  maintainer: string;
  updatedAt: string;
};

export type ShowcaseSectionMeta = {
  eyebrow: string;
  heading: string;
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
    imageUrl: "",
    imageName: "",
    eyebrow: "Copyright Infrastructure",
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
    imageUrl: "",
    imageName: "",
    eyebrow: "Copyright Verification",
    title: "版权核验服务",
    highlight: "权威可溯",
    lead: "覆盖 DCI 核验、版权信息核验与版权证书核验，支撑业务接入、交易确权与合规审查。",
    maintainer: "运营管理员",
    updatedAt: "2026-03-01 10:05:00",
  },
  {
    id: "hero-3",
    name: "智能审核",
    weight: 30,
    status: "visible",
    imageUrl: "",
    imageName: "",
    eyebrow: "Intelligent Review",
    title: "智能辅助审核服务",
    highlight: "提效合规",
    lead: "涵盖内容安全审核、作品登记查重与疑似侵权审核，辅助缩短人工审核链路。",
    maintainer: "运营管理员",
    updatedAt: "2026-03-01 10:10:00",
  },
];

let verifyMeta: ShowcaseSectionMeta = {
  eyebrow: "Copyright Verification",
  heading: "版权核验服务",
};

let verifyThemes: ShowcaseTheme[] = [
  {
    id: "verify-1",
    title: "DCI核验",
    desc: "对接 DCI 登记信息，快速核验作品登记状态与权利信息，为交易、分发与确权提供可信依据。",
    visual: "登记状态 · 权利主体 · 登记编号",
    imageUrl: "",
    imageName: "",
    weight: 10,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 09:00:00",
  },
  {
    id: "verify-2",
    title: "版权信息核验",
    desc: "核验作品相关版权基础信息，核对权利归属与关键字段，降低业务侧信息不对称风险。",
    visual: "作品信息 · 权利核对 · 结果回传",
    imageUrl: "",
    imageName: "",
    weight: 20,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 09:05:00",
  },
  {
    id: "verify-3",
    title: "版权证书核验",
    desc: "对版权证书真伪与记载内容进行核验，支持单件与批量场景，结果结构化返回便于系统对接。",
    visual: "证书核验 · 批量处理 · 结构化结果",
    imageUrl: "",
    imageName: "",
    weight: 30,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 09:10:00",
  },
];

let auditMeta: ShowcaseSectionMeta = {
  eyebrow: "Intelligent Audit",
  heading: "智能辅助审核服务",
};

let auditThemes: ShowcaseTheme[] = [
  {
    id: "audit-1",
    title: "内容安全审核",
    desc: "对文本、图像等内容进行安全合规筛查，帮助运营前置识别违规与高风险素材。",
    visual: "内容筛查 · 风险标签 · 处置建议",
    imageUrl: "",
    imageName: "",
    weight: 10,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 10:00:00",
  },
  {
    id: "audit-2",
    title: "作品登记查重",
    desc: "对照已登记作品库进行查重比对，辅助发现重复登记与高度相似内容，支撑登记前风控。",
    visual: "相似度 · 比对摘要 · 登记辅助",
    imageUrl: "",
    imageName: "",
    weight: 20,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-03-02 10:05:00",
  },
  {
    id: "audit-3",
    title: "疑似侵权审核",
    desc: "围绕疑似侵权行为提供智能辅助研判与证据线索，便于人工复核与后续处置。",
    visual: "侵权线索 · 风险等级 · 复核工单",
    imageUrl: "",
    imageName: "",
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
  imageUrl: string;
  imageName: string;
  eyebrow: string;
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
      ...input,
      name: input.name.trim(),
      eyebrow: input.eyebrow.trim(),
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
          ...input,
          name: input.name.trim(),
          eyebrow: input.eyebrow.trim(),
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
  title: string;
  desc: string;
  visual: string;
  imageUrl: string;
  imageName: string;
  weight: number;
};

export function updateVerifyMeta(meta: ShowcaseSectionMeta) {
  verifyMeta = { eyebrow: meta.eyebrow.trim(), heading: meta.heading.trim() };
  emit();
}

export function updateAuditMeta(meta: ShowcaseSectionMeta) {
  auditMeta = { eyebrow: meta.eyebrow.trim(), heading: meta.heading.trim() };
  emit();
}

export function addVerifyTheme(input: ShowcaseThemeInput) {
  verifySeq += 1;
  verifyThemes = [
    ...verifyThemes,
    {
      id: `verify-${verifySeq}`,
      title: input.title.trim(),
      desc: input.desc.trim(),
      visual: input.visual.trim(),
      imageUrl: input.imageUrl,
      imageName: input.imageName,
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
      title: input.title.trim(),
      desc: input.desc.trim(),
      visual: input.visual.trim(),
      imageUrl: input.imageUrl,
      imageName: input.imageName,
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
          title: input.title.trim(),
          desc: input.desc.trim(),
          visual: input.visual.trim(),
          imageUrl: input.imageUrl,
          imageName: input.imageName,
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
          title: input.title.trim(),
          desc: input.desc.trim(),
          visual: input.visual.trim(),
          imageUrl: input.imageUrl,
          imageName: input.imageName,
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
