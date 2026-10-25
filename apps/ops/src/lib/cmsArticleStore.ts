import { useEffect, useState } from "react";

/** 文章字段类型：用于按目录二次开发不同表单 */
export type CmsFieldType = "text" | "textarea" | "richtext" | "image" | "select";

export type CmsFieldDef = {
  key: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
  options?: string[];
  rows?: number;
  hint?: string;
};

/** 内置文章内容模型（目录可绑定） */
export type CmsSchemaId = "faq" | "productDetail" | "industry";

export const CMS_SCHEMAS: Record<
  CmsSchemaId,
  { label: string; description: string; fields: CmsFieldDef[] }
> = {
  faq: {
    label: "常见问题",
    description: "标题 + 单个富文本（问答）",
    fields: [
      { key: "title", label: "问题标题", type: "text", required: true },
      { key: "body", label: "回答内容", type: "richtext", required: true, rows: 10 },
    ],
  },
  productDetail: {
    label: "商品/服务详情",
    description: "标题 + 多个富文本版块",
    fields: [
      { key: "title", label: "标题", type: "text", required: true },
      { key: "bodyIntro", label: "产品介绍", type: "richtext", required: true, rows: 6 },
      { key: "bodySpec", label: "规格说明", type: "richtext", rows: 6 },
      { key: "bodyNotice", label: "使用须知", type: "richtext", rows: 6 },
    ],
  },
  industry: {
    label: "行业文章",
    description: "标题、缩略图、摘要、关键词、行业类别、正文",
    fields: [
      { key: "title", label: "标题", type: "text", required: true },
      { key: "thumb", label: "缩略图 URL", type: "image" },
      { key: "summary", label: "摘要", type: "textarea", rows: 3 },
      { key: "keywords", label: "关键词", type: "text", hint: "逗号分隔" },
      {
        key: "industry",
        label: "行业类别",
        type: "select",
        options: ["传媒", "互联网", "出版", "教育", "文娱", "其他"],
      },
      { key: "body", label: "正文", type: "richtext", required: true, rows: 12 },
    ],
  },
};

export type CmsPublishStatus = "draft" | "pending" | "published" | "rejected";

export const CMS_STATUS_LABEL: Record<CmsPublishStatus, string> = {
  draft: "草稿",
  pending: "待审批",
  published: "已发布",
  rejected: "已驳回",
};

export type CmsCatalog = {
  id: string;
  name: string;
  parentId: string | null;
  sort: number;
  schemaId: CmsSchemaId;
};

export type CmsArticle = {
  id: string;
  catalogId: string;
  /** 列表展示用标题（冗余自 fields.title） */
  title: string;
  fields: Record<string, string>;
  status: CmsPublishStatus;
  /** 待审批时相对已发布稿的变更说明 */
  changeNote: string;
  rejectReason: string;
  updatedAt: string;
  publishedAt: string | null;
};

function nowStamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const SEED_CATALOGS: CmsCatalog[] = [
  { id: "cms-c-faq", name: "常见问题", parentId: null, sort: 10, schemaId: "faq" },
  { id: "cms-c-product", name: "服务详情", parentId: null, sort: 20, schemaId: "productDetail" },
  { id: "cms-c-industry", name: "行业资讯", parentId: null, sort: 30, schemaId: "industry" },
];

const SEED_ARTICLES: CmsArticle[] = [
  {
    id: "cms-a-1",
    catalogId: "cms-c-faq",
    title: "DCI是什么？",
    fields: {
      title: "DCI是什么？",
      body: "<p>DCI，英文全称 Digital Copyright Identifier，中文名称为数字版权唯一标识符……</p>",
    },
    status: "published",
    changeNote: "",
    rejectReason: "",
    updatedAt: "2026-08-01 10:00:00",
    publishedAt: "2026-08-01 10:00:00",
  },
  {
    id: "cms-a-2",
    catalogId: "cms-c-industry",
    title: "数字版权基础设施发展趋势",
    fields: {
      title: "数字版权基础设施发展趋势",
      thumb: "",
      summary: "围绕 DCI 体系 4.0 与可信数据基础设施的观察。",
      keywords: "DCI,数字版权,基础设施",
      industry: "互联网",
      body: "<p>随着 AI 与版权融合加速，可信标识与数据治理成为关键能力。</p>",
    },
    status: "draft",
    changeNote: "",
    rejectReason: "",
    updatedAt: "2026-09-12 14:20:00",
    publishedAt: null,
  },
];

let catalogs: CmsCatalog[] = SEED_CATALOGS.map((c) => ({ ...c }));
let articles: CmsArticle[] = SEED_ARTICLES.map((a) => ({
  ...a,
  fields: { ...a.fields },
}));
let catalogSeq = 100;
let articleSeq = 100;
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

function bySort(a: { sort: number; id: string }, b: { sort: number; id: string }) {
  if (a.sort !== b.sort) return a.sort - b.sort;
  return a.id.localeCompare(b.id);
}

export function listCmsCatalogs(): CmsCatalog[] {
  return [...catalogs].sort(bySort).map((c) => ({ ...c }));
}

export function getCmsCatalog(id: string): CmsCatalog | undefined {
  return catalogs.find((c) => c.id === id);
}

export function flattenCmsCatalogTree(): { catalog: CmsCatalog; depth: number }[] {
  const byParent = new Map<string | null, CmsCatalog[]>();
  for (const c of catalogs) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  for (const list of byParent.values()) list.sort(bySort);
  const out: { catalog: CmsCatalog; depth: number }[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const c of byParent.get(parentId) ?? []) {
      out.push({ catalog: c, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export function createCmsCatalog(input: {
  name: string;
  parentId: string | null;
  sort: number;
  schemaId: CmsSchemaId;
}): CmsCatalog {
  const name = input.name.trim();
  if (!name) throw new Error("请填写目录名称");
  if (!CMS_SCHEMAS[input.schemaId]) throw new Error("请选择内容模型");
  if (input.parentId && !catalogs.some((c) => c.id === input.parentId)) {
    throw new Error("上级目录不存在");
  }
  catalogSeq += 1;
  const created: CmsCatalog = {
    id: `cms-c-${catalogSeq}`,
    name,
    parentId: input.parentId,
    sort: input.sort,
    schemaId: input.schemaId,
  };
  catalogs = [...catalogs, created];
  emit();
  return created;
}

export function updateCmsCatalog(
  id: string,
  input: { name: string; parentId: string | null; sort: number; schemaId: CmsSchemaId },
): CmsCatalog {
  const idx = catalogs.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("目录不存在");
  const name = input.name.trim();
  if (!name) throw new Error("请填写目录名称");
  if (input.parentId === id) throw new Error("不能将自身设为上级");
  const next: CmsCatalog = {
    ...catalogs[idx]!,
    name,
    parentId: input.parentId,
    sort: input.sort,
    schemaId: input.schemaId,
  };
  catalogs = catalogs.map((c, i) => (i === idx ? next : c));
  emit();
  return next;
}

export function deleteCmsCatalog(id: string): string | null {
  if (catalogs.some((c) => c.parentId === id)) return "请先删除子目录";
  if (articles.some((a) => a.catalogId === id)) return "该目录下仍有文章，无法删除";
  catalogs = catalogs.filter((c) => c.id !== id);
  emit();
  return null;
}

export function listCmsArticles(catalogId?: string): CmsArticle[] {
  return articles
    .filter((a) => (catalogId ? a.catalogId === catalogId : true))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((a) => ({ ...a, fields: { ...a.fields } }));
}

export function getCmsArticle(id: string): CmsArticle | undefined {
  const a = articles.find((x) => x.id === id);
  return a ? { ...a, fields: { ...a.fields } } : undefined;
}

function validateFields(schemaId: CmsSchemaId, fields: Record<string, string>) {
  const schema = CMS_SCHEMAS[schemaId];
  for (const f of schema.fields) {
    if (f.required && !String(fields[f.key] ?? "").trim()) {
      throw new Error(`请填写${f.label}`);
    }
  }
}

export function createCmsArticle(input: {
  catalogId: string;
  fields: Record<string, string>;
}): CmsArticle {
  const catalog = getCmsCatalog(input.catalogId);
  if (!catalog) throw new Error("请选择目录");
  validateFields(catalog.schemaId, input.fields);
  const title = (input.fields.title || "").trim() || "未命名文章";
  articleSeq += 1;
  const created: CmsArticle = {
    id: `cms-a-${articleSeq}`,
    catalogId: input.catalogId,
    title,
    fields: { ...input.fields },
    status: "draft",
    changeNote: "",
    rejectReason: "",
    updatedAt: nowStamp(),
    publishedAt: null,
  };
  articles = [...articles, created];
  emit();
  return created;
}

export function updateCmsArticle(
  id: string,
  input: { fields: Record<string, string> },
): CmsArticle {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("文章不存在");
  const prev = articles[idx]!;
  if (prev.status === "pending") throw new Error("待审批中，暂不可编辑");
  const catalog = getCmsCatalog(prev.catalogId);
  if (!catalog) throw new Error("所属目录不存在");
  validateFields(catalog.schemaId, input.fields);
  const title = (input.fields.title || "").trim() || prev.title;
  const next: CmsArticle = {
    ...prev,
    title,
    fields: { ...input.fields },
    // 已发布稿再次修改 → 回到草稿，需重新提交审批
    status: prev.status === "published" ? "draft" : prev.status === "rejected" ? "draft" : prev.status,
    rejectReason: "",
    updatedAt: nowStamp(),
  };
  articles = articles.map((a, i) => (i === idx ? next : a));
  emit();
  return next;
}

export function deleteCmsArticle(id: string): string | null {
  const row = articles.find((a) => a.id === id);
  if (!row) return "文章不存在";
  if (row.status === "pending") return "待审批文章不可删除，请先驳回或完成审批";
  articles = articles.filter((a) => a.id !== id);
  emit();
  return null;
}

/** 提交审批 */
export function submitCmsArticle(id: string, changeNote = "") {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("文章不存在");
  const prev = articles[idx]!;
  if (prev.status !== "draft" && prev.status !== "rejected") {
    throw new Error("仅草稿或已驳回文章可提交审批");
  }
  articles = articles.map((a, i) =>
    i === idx
      ? {
          ...a,
          status: "pending" as const,
          changeNote: changeNote.trim(),
          rejectReason: "",
          updatedAt: nowStamp(),
        }
      : a,
  );
  emit();
}

export function approveCmsArticle(id: string) {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("文章不存在");
  if (articles[idx]!.status !== "pending") throw new Error("仅待审批文章可通过");
  const stamp = nowStamp();
  articles = articles.map((a, i) =>
    i === idx
      ? {
          ...a,
          status: "published" as const,
          publishedAt: stamp,
          updatedAt: stamp,
          changeNote: "",
          rejectReason: "",
        }
      : a,
  );
  emit();
}

export function rejectCmsArticle(id: string, reason: string) {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("文章不存在");
  if (articles[idx]!.status !== "pending") throw new Error("仅待审批文章可驳回");
  const rejectReason = reason.trim() || "不符合发布要求";
  articles = articles.map((a, i) =>
    i === idx
      ? {
          ...a,
          status: "rejected" as const,
          rejectReason,
          updatedAt: nowStamp(),
        }
      : a,
  );
  emit();
}

export function useCmsArticleStore() {
  const [, bump] = useState(0);
  useEffect(() => subscribe(() => bump((n) => n + 1)), []);
  return {
    catalogs: listCmsCatalogs(),
    flatCatalogs: flattenCmsCatalogTree(),
    listArticles: listCmsArticles,
    getCatalog: getCmsCatalog,
    getArticle: getCmsArticle,
    createCatalog: createCmsCatalog,
    updateCatalog: updateCmsCatalog,
    deleteCatalog: deleteCmsCatalog,
    createArticle: createCmsArticle,
    updateArticle: updateCmsArticle,
    deleteArticle: deleteCmsArticle,
    submit: submitCmsArticle,
    approve: approveCmsArticle,
    reject: rejectCmsArticle,
  };
}
