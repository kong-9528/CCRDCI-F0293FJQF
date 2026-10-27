import { useEffect, useState } from "react";
import { setShelfStatus } from "@/lib/productsStore";

/** 技术服务上架：左侧目录节点 */
export type TechShelfCatalog = {
  id: string;
  name: string;
  /** 目录编码（业务可读，可录入） */
  code: string;
  /** 目录序号（系统生成，不可改） */
  seqNo: number;
  /** null = 根节点 */
  parentId: string | null;
  /** 同级排序，越小越靠前 */
  sort: number;
};

/** 技术服务上架：右侧技术服务项 */
export type TechShelfService = {
  id: string;
  catalogId: string;
  name: string;
  enabled: boolean;
  /** 关联内置产品时同步 productsStore 上下架 */
  productCode?: string;
  sort: number;
};

export type TechShelfCatalogInput = {
  name: string;
  code: string;
  parentId: string | null;
  sort: number;
};

export type TechShelfServiceInput = {
  name: string;
  enabled: boolean;
};

export type TechShelfTreeNode = {
  catalog: TechShelfCatalog;
  depth: number;
  children: TechShelfTreeNode[];
};

const SEED_CATALOGS: TechShelfCatalog[] = [
  { id: "tsc-verify", name: "版权核验", code: "VERIFY", seqNo: 1, parentId: null, sort: 10 },
  { id: "tsc-audit", name: "智能辅助审核", code: "AUDIT", seqNo: 2, parentId: null, sort: 20 },
];

const SEED_SERVICES: TechShelfService[] = [
  {
    id: "tss-dci",
    catalogId: "tsc-verify",
    name: "DCI核验",
    enabled: true,
    productCode: "dci",
    sort: 10,
  },
  {
    id: "tss-info",
    catalogId: "tsc-verify",
    name: "版权登记信息核验",
    enabled: true,
    productCode: "info",
    sort: 20,
  },
  {
    id: "tss-cert",
    catalogId: "tsc-verify",
    name: "版权登记证书核验",
    enabled: true,
    productCode: "certificate",
    sort: 30,
  },
  {
    id: "tss-work",
    catalogId: "tsc-audit",
    name: "作品智能辅助审核",
    enabled: true,
    productCode: "workReview",
    sort: 10,
  },
];

let catalogs: TechShelfCatalog[] = SEED_CATALOGS.map((c) => ({ ...c }));
let services: TechShelfService[] = SEED_SERVICES.map((s) => ({ ...s }));
let catalogSeq = 100;
let catalogSeqNo = Math.max(0, ...SEED_CATALOGS.map((c) => c.seqNo));
let serviceSeq = 100;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((fn) => fn());
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

function bySiblingSort(a: { sort: number; id: string }, b: { sort: number; id: string }) {
  if (a.sort !== b.sort) return a.sort - b.sort;
  return a.id.localeCompare(b.id);
}

export function listTechShelfCatalogs(): TechShelfCatalog[] {
  return catalogs.map((c) => ({ ...c }));
}

export function getTechShelfCatalog(id: string): TechShelfCatalog | undefined {
  return catalogs.find((c) => c.id === id);
}

export function listTechShelfServices(catalogId: string): TechShelfService[] {
  return services
    .filter((s) => s.catalogId === catalogId)
    .sort(bySiblingSort)
    .map((s) => ({ ...s }));
}

export function buildTechShelfTree(): TechShelfTreeNode[] {
  const byParent = new Map<string | null, TechShelfCatalog[]>();
  for (const c of catalogs) {
    const key = c.parentId;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort(bySiblingSort);
  }

  const walk = (parentId: string | null, depth: number): TechShelfTreeNode[] => {
    return (byParent.get(parentId) ?? []).map((catalog) => ({
      catalog,
      depth,
      children: walk(catalog.id, depth + 1),
    }));
  };
  return walk(null, 0);
}

/** 扁平化树（含 depth），用于渲染与下拉 */
export function flattenTechShelfTree(): { catalog: TechShelfCatalog; depth: number }[] {
  const out: { catalog: TechShelfCatalog; depth: number }[] = [];
  const walk = (nodes: TechShelfTreeNode[]) => {
    for (const n of nodes) {
      out.push({ catalog: n.catalog, depth: n.depth });
      walk(n.children);
    }
  };
  walk(buildTechShelfTree());
  return out;
}

/** 父级下拉：排除自身及其子孙，避免成环 */
export function catalogParentOptions(excludeId?: string): { catalog: TechShelfCatalog; depth: number }[] {
  if (!excludeId) return flattenTechShelfTree();
  const blocked = new Set<string>([excludeId]);
  const collect = (parentId: string) => {
    for (const c of catalogs) {
      if (c.parentId === parentId) {
        blocked.add(c.id);
        collect(c.id);
      }
    }
  };
  collect(excludeId);
  return flattenTechShelfTree().filter((row) => !blocked.has(row.catalog.id));
}

function normalizeCatalogCode(raw: string) {
  return raw.trim();
}

function assertCatalogCode(code: string, excludeId?: string) {
  if (!code) throw new Error("请填写目录编码");
  const dup = catalogs.find(
    (c) => c.code.toLowerCase() === code.toLowerCase() && c.id !== excludeId,
  );
  if (dup) throw new Error("目录编码已存在");
}

export function createTechShelfCatalog(input: TechShelfCatalogInput): TechShelfCatalog {
  const name = input.name.trim();
  if (!name) throw new Error("请填写目录名称");
  const code = normalizeCatalogCode(input.code);
  assertCatalogCode(code);
  if (input.parentId && !catalogs.some((c) => c.id === input.parentId)) {
    throw new Error("父级目录不存在");
  }
  catalogSeq += 1;
  catalogSeqNo += 1;
  const created: TechShelfCatalog = {
    id: `tsc-${catalogSeq}`,
    name,
    code,
    seqNo: catalogSeqNo,
    parentId: input.parentId,
    sort: Number.isFinite(input.sort) ? input.sort : 10,
  };
  catalogs = [...catalogs, created];
  emit();
  return created;
}

export function updateTechShelfCatalog(id: string, input: TechShelfCatalogInput): TechShelfCatalog {
  const idx = catalogs.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("目录不存在");
  const name = input.name.trim();
  if (!name) throw new Error("请填写目录名称");
  const code = normalizeCatalogCode(input.code);
  assertCatalogCode(code, id);
  if (input.parentId === id) throw new Error("不能将自身设为父级");
  if (input.parentId) {
    const blocked = new Set<string>([id]);
    const collect = (parentId: string) => {
      for (const c of catalogs) {
        if (c.parentId === parentId) {
          blocked.add(c.id);
          collect(c.id);
        }
      }
    };
    collect(id);
    if (blocked.has(input.parentId)) throw new Error("不能将子孙目录设为父级");
    if (!catalogs.some((c) => c.id === input.parentId)) throw new Error("父级目录不存在");
  }
  const prev = catalogs[idx]!;
  const next: TechShelfCatalog = {
    ...prev,
    name,
    code,
    /* 目录序号创建后不变 */
    seqNo: prev.seqNo,
    parentId: input.parentId,
    sort: Number.isFinite(input.sort) ? input.sort : prev.sort,
  };
  catalogs = catalogs.map((c, i) => (i === idx ? next : c));
  emit();
  return next;
}

export function createTechShelfService(
  catalogId: string,
  input: TechShelfServiceInput,
): TechShelfService {
  if (!catalogs.some((c) => c.id === catalogId)) throw new Error("请先选择左侧目录");
  const name = input.name.trim();
  if (!name) throw new Error("请填写技术服务名称");
  serviceSeq += 1;
  const siblings = services.filter((s) => s.catalogId === catalogId);
  const maxSort = siblings.reduce((m, s) => Math.max(m, s.sort), 0);
  const created: TechShelfService = {
    id: `tss-${serviceSeq}`,
    catalogId,
    name,
    enabled: input.enabled,
    sort: maxSort + 10,
  };
  services = [...services, created];
  emit();
  return created;
}

export function updateTechShelfService(id: string, input: TechShelfServiceInput): TechShelfService {
  const idx = services.findIndex((s) => s.id === id);
  if (idx < 0) throw new Error("技术服务不存在");
  const name = input.name.trim();
  if (!name) throw new Error("请填写技术服务名称");
  const prev = services[idx]!;
  const next: TechShelfService = {
    ...prev,
    name,
    enabled: input.enabled,
  };
  services = services.map((s, i) => (i === idx ? next : s));
  if (next.productCode && next.enabled !== prev.enabled) {
    setShelfStatus(next.productCode, next.enabled ? "online" : "offline");
  }
  emit();
  return next;
}

export function setTechShelfServiceEnabled(id: string, enabled: boolean) {
  const row = services.find((s) => s.id === id);
  if (!row) return;
  updateTechShelfService(id, { name: row.name, enabled });
}

export function useTechShelfStore() {
  const [, bump] = useState(0);
  useEffect(() => {
    const fn = () => bump((n) => n + 1);
    return subscribe(fn);
  }, []);
  return {
    catalogs: listTechShelfCatalogs(),
    tree: buildTechShelfTree(),
    flatTree: flattenTechShelfTree(),
    parentOptions: catalogParentOptions,
    listServices: listTechShelfServices,
    getCatalog: getTechShelfCatalog,
    createCatalog: createTechShelfCatalog,
    updateCatalog: updateTechShelfCatalog,
    createService: createTechShelfService,
    updateService: updateTechShelfService,
    setServiceEnabled: setTechShelfServiceEnabled,
  };
}
