import { useEffect, useState } from "react";

export type PortalHomeStatus = "published" | "withdrawn" | "draft";

export type PortalHomeModule = "home" | "faq";

/**
 * 区域行：对应「配置 id → 区域关联表」中的一条记录。
 * 未来后端可对 removed=true 做软删除，前端列表只展示未移除项。
 */
export type PortalHomeRegion = {
  id: number;
  content: string;
  removed: boolean;
};

export type PortalHomeItem = {
  /** 固定配置 ID，不可修改，供前端引用 */
  id: number;
  module: PortalHomeModule;
  moduleLabel: string;
  columnKey: string;
  columnLabel: string;
  /** 该配置下的区域清单（含已软删标记） */
  regions: PortalHomeRegion[];
  status: PortalHomeStatus;
  updatedAt: string;
};

export const PORTAL_HOME_STATUS_LABEL: Record<PortalHomeStatus, string> = {
  published: "已发布",
  withdrawn: "已撤回",
  draft: "草稿",
};

export const PORTAL_HOME_MODULE_LABEL: Record<PortalHomeModule, string> = {
  home: "首页",
  faq: "FAQ",
};

const TEXT_LIMIT = 1000;
export const PORTAL_HOME_TEXT_LIMIT = TEXT_LIMIT;
/** 有效区域数量上限 */
export const PORTAL_HOME_REGION_MAX = 5;
/** 有效区域数量下限 */
export const PORTAL_HOME_REGION_MIN = 1;

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: Listener) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let nextRegionId = 1000;

function createRegions(contents: string[]): PortalHomeRegion[] {
  return contents.map((content) => ({
    id: nextRegionId++,
    content: content.slice(0, TEXT_LIMIT),
    removed: false,
  }));
}

/** 仅返回未移除区域（列表 / 编辑展示用） */
export function activeRegions(regions: PortalHomeRegion[]): PortalHomeRegion[] {
  return regions.filter((r) => !r.removed);
}

/** 列表预览：取有效区域文案 */
export function activeRegionTexts(item: PortalHomeItem): string[] {
  return activeRegions(item.regions).map((r) => r.content);
}

function cloneItem(item: PortalHomeItem): PortalHomeItem {
  return {
    ...item,
    regions: item.regions.map((r) => ({ ...r })),
  };
}

/** 固定配置项（不可新增/删除配置本身） */
const SEED: PortalHomeItem[] = [
  {
    id: 1,
    module: "home",
    moduleLabel: "首页",
    columnKey: "focus-1",
    columnLabel: "焦点区1",
    regions: createRegions([
      "以可信数据能力",
      "护航版权经营",
      "面向内容平台与版权机构，提供版权核验、智能辅助审核与开放 API，让每一次确权与用权都可追溯、可计量。",
    ]),
    status: "published",
    updatedAt: "2026-08-20 10:00:00",
  },
  {
    id: 2,
    module: "home",
    moduleLabel: "首页",
    columnKey: "focus-2",
    columnLabel: "焦点区2",
    regions: createRegions([
      "版权核验服务",
      "权威可溯",
      "覆盖 DCI 核验、版权登记信息核验与版权登记证书核验，支撑业务接入、交易确权与合规审查。",
    ]),
    status: "published",
    updatedAt: "2026-08-20 10:05:00",
  },
  {
    id: 3,
    module: "home",
    moduleLabel: "首页",
    columnKey: "focus-3",
    columnLabel: "焦点区3",
    regions: createRegions([
      "智能辅助审核服务",
      "提效合规",
      "涵盖内容安全审核、作品登记查重与疑似侵权审核，辅助缩短人工审核链路。",
    ]),
    status: "draft",
    updatedAt: "2026-08-21 09:12:00",
  },
  {
    id: 4,
    module: "home",
    moduleLabel: "首页",
    columnKey: "verify-product-1",
    columnLabel: "版权核验产品1",
    regions: createRegions([
      "DCI核验",
      "对接 DCI 登记信息，快速核验作品登记状态与权利信息，为交易、分发与确权提供可信依据。",
      "登记状态 · 权利主体 · 登记编号",
    ]),
    status: "published",
    updatedAt: "2026-08-19 14:20:00",
  },
  {
    id: 5,
    module: "home",
    moduleLabel: "首页",
    columnKey: "verify-product-2",
    columnLabel: "版权核验产品2",
    regions: createRegions([
      "版权登记信息核验",
      "核验作品相关版权基础信息，核对权利归属与关键字段，降低业务侧信息不对称风险。",
      "作品信息 · 权利核对 · 结果回传",
    ]),
    status: "published",
    updatedAt: "2026-08-19 14:22:00",
  },
  {
    id: 6,
    module: "home",
    moduleLabel: "首页",
    columnKey: "verify-product-3",
    columnLabel: "版权核验产品3",
    regions: createRegions([
      "版权登记证书核验",
      "对版权证书真伪与记载内容进行核验，支持单件与批量场景，结果结构化返回便于系统对接。",
      "证书核验 · 批量处理 · 结构化结果",
    ]),
    status: "withdrawn",
    updatedAt: "2026-08-18 16:40:00",
  },
  {
    id: 7,
    module: "home",
    moduleLabel: "首页",
    columnKey: "audit-product-1",
    columnLabel: "智能辅助审核产品1",
    regions: createRegions([
      "内容安全审核",
      "对文本、图像等内容进行安全合规筛查，帮助运营前置识别违规与高风险素材。",
      "内容筛查 · 风险标签 · 处置建议",
    ]),
    status: "published",
    updatedAt: "2026-08-17 11:00:00",
  },
  {
    id: 8,
    module: "home",
    moduleLabel: "首页",
    columnKey: "audit-product-2",
    columnLabel: "智能辅助审核产品2",
    regions: createRegions([
      "作品登记查重",
      "对照已登记作品库进行查重比对，辅助发现重复登记与高度相似内容，支撑登记前风控。",
      "相似度 · 比对摘要 · 登记辅助",
    ]),
    status: "draft",
    updatedAt: "2026-08-22 08:30:00",
  },
  {
    id: 9,
    module: "home",
    moduleLabel: "首页",
    columnKey: "audit-product-3",
    columnLabel: "智能辅助审核产品3",
    regions: createRegions([
      "疑似侵权审核",
      "围绕疑似侵权行为提供智能辅助研判与证据线索，便于人工复核与后续处置。",
      "侵权线索 · 风险等级 · 复核工单",
    ]),
    status: "withdrawn",
    updatedAt: "2026-08-16 19:05:00",
  },
  {
    id: 10,
    module: "faq",
    moduleLabel: "FAQ",
    columnKey: "faq",
    columnLabel: "FAQ",
    regions: createRegions([
      "如何开通平台服务？",
      "登录后进入账号中心申请开通对应产品；审核通过后即可在控制台使用页面提交或 API 调用。",
      "API 调用失败常见原因有哪些？",
      "请检查 AccessKey 是否启用、签名是否正确、配额是否充足，以及请求时间戳是否在有效窗口内。",
    ]),
    status: "draft",
    updatedAt: "2026-08-26 09:00:00",
  },
];

let items: PortalHomeItem[] = SEED.map(cloneItem);

/** 前端新建区域时分配临时 id（对接后端后由服务端生成） */
export function allocRegionId() {
  return nextRegionId++;
}

export function listPortalHomeItems() {
  return items.map(cloneItem);
}

export function getPortalHomeItem(id: number) {
  const hit = items.find((item) => item.id === id);
  return hit ? cloneItem(hit) : undefined;
}

export function getPortalHomeColumns() {
  return SEED.map((item) => ({ key: item.columnKey, label: item.columnLabel }));
}

/**
 * 保存区域清单：以当前有效区域为准覆盖写入；
 * 原有区域若不在新清单中则标记 removed（模拟关联表软删）。
 */
export function updatePortalHomeRegions(id: number, nextActive: PortalHomeRegion[]) {
  const idx = items.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, message: "配置项不存在" };
  const cur = items[idx];
  if (cur.status === "published") {
    return { ok: false as const, message: "已发布内容不可直接编辑，请先撤回" };
  }

  const active = nextActive
    .filter((r) => !r.removed)
    .map((r) => ({
      id: r.id,
      content: r.content.slice(0, TEXT_LIMIT).trimEnd(),
      removed: false as const,
    }));

  if (active.length < PORTAL_HOME_REGION_MIN) {
    return { ok: false as const, message: `至少保留 ${PORTAL_HOME_REGION_MIN} 个区域` };
  }
  if (active.length > PORTAL_HOME_REGION_MAX) {
    return { ok: false as const, message: `最多配置 ${PORTAL_HOME_REGION_MAX} 个区域` };
  }
  for (let i = 0; i < active.length; i += 1) {
    if (active[i].content.length > TEXT_LIMIT) {
      return { ok: false as const, message: `区域${i + 1}超过 ${TEXT_LIMIT} 字符上限` };
    }
  }

  const activeIds = new Set(active.map((r) => r.id));
  const softRemoved = cur.regions
    .filter((r) => !r.removed && !activeIds.has(r.id))
    .map((r) => ({ ...r, removed: true }));
  const alreadyRemoved = cur.regions.filter((r) => r.removed);

  items[idx] = {
    ...cur,
    regions: [...active, ...softRemoved, ...alreadyRemoved],
    status: "draft",
    updatedAt: nowStamp(),
  };
  emit();
  return { ok: true as const };
}

export function publishPortalHomeItem(id: number) {
  const idx = items.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, message: "配置项不存在" };
  const cur = items[idx];
  if (cur.status === "published") {
    return { ok: false as const, message: "当前已是发布状态" };
  }
  items[idx] = {
    ...cur,
    status: "published",
    updatedAt: nowStamp(),
  };
  emit();
  return { ok: true as const };
}

export function withdrawPortalHomeItem(id: number) {
  const idx = items.findIndex((item) => item.id === id);
  if (idx < 0) return { ok: false as const, message: "配置项不存在" };
  const cur = items[idx];
  if (cur.status !== "published") {
    return { ok: false as const, message: "仅已发布内容可撤回" };
  }
  items[idx] = {
    ...cur,
    status: "withdrawn",
    updatedAt: nowStamp(),
  };
  emit();
  return { ok: true as const };
}

export function usePortalHomeStore() {
  const [, setTick] = useState(0);
  useEffect(() => subscribe(() => setTick((n) => n + 1)), []);
  return {
    items: listPortalHomeItems(),
    getItem: getPortalHomeItem,
    columns: getPortalHomeColumns(),
    updateRegions: updatePortalHomeRegions,
    publish: publishPortalHomeItem,
    withdraw: withdrawPortalHomeItem,
  };
}
