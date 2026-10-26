import { useEffect, useState } from "react";
import {
  COLUMN_SECTION_SCHEMAS,
  PORTAL_COLUMN_SEED,
  getColumnSchemaKey,
  type ColumnFieldDef,
  type PortalColumn,
} from "@/lib/portalColumnStore";

/** 文章表单字段类型（目录表单编排） */
export type CmsFieldType =
  | "text"
  | "textarea"
  | "richtext"
  | "number"
  | "integer"
  | "numberRange"
  | "radio"
  | "checkbox"
  | "image"
  | "images"
  | "file"
  | "date"
  | "datetime"
  /** 引用一篇文章（存 articleId） */
  | "articleRef"
  /** 引用多篇文章（存 JSON 字符串数组） */
  | "articleRefs";

export type CmsSelectLayout = "dropdown" | "flat";
export type CmsTextFormat = "any" | "email" | "url" | "phone" | "idcard";

export type CmsFieldDef = {
  key: string;
  label: string;
  type: CmsFieldType;
  required?: boolean;
  hint?: string;
  /** 单行文本内容格式 */
  format?: CmsTextFormat;
  rows?: number;
  min?: number;
  max?: number;
  /** 单选/多选选项 */
  options?: string[];
  /** 单选/多选展示：下拉 / 平铺 */
  selectLayout?: CmsSelectLayout;
  /** 多选是否可选「全部」 */
  allowSelectAll?: boolean;
  /** 单图：尺寸与比例约束 */
  imageMinWidth?: number;
  imageMaxWidth?: number;
  imageMinHeight?: number;
  imageMaxHeight?: number;
  /** 如 16:9 */
  imageAspectRatio?: string;
  /** 多图 / 多文章引用上限 */
  maxCount?: number;
};

export const CMS_FIELD_TYPE_LABEL: Record<CmsFieldType, string> = {
  text: "单行文本",
  textarea: "多行文本",
  richtext: "富文本",
  number: "数值",
  integer: "整数",
  numberRange: "数值范围",
  radio: "单选",
  checkbox: "多选",
  image: "上传单个图片",
  images: "上传多个图片",
  file: "上传普通附件",
  date: "日期",
  datetime: "年月日时分",
  articleRef: "引用文章（单选）",
  articleRefs: "引用文章（多选）",
};

export const CMS_TEXT_FORMAT_LABEL: Record<CmsTextFormat, string> = {
  any: "不限",
  email: "邮箱",
  url: "网址",
  phone: "手机号",
  idcard: "身份证号",
};

/** 内置模板（新建目录时可选用，实际字段存于目录） */
export type CmsSchemaTemplateId =
  | "faq"
  | "productDetail"
  | "industry"
  | "topic"
  | "blank";

export const CMS_SCHEMA_TEMPLATES: Record<
  CmsSchemaTemplateId,
  { label: string; description: string; fields: CmsFieldDef[] }
> = {
  blank: {
    label: "空白表单",
    description: "仅含标题，可在表单编排中自由添加字段",
    fields: [{ key: "title", label: "标题", type: "text", required: true }],
  },
  topic: {
    label: "专题条目",
    description: "标题 + 标题图 + 引用文章（排序为文章默认选填字段）",
    fields: [
      { key: "title", label: "标题", type: "text", required: true },
      { key: "cover", label: "标题图", type: "image" },
      {
        key: "refArticle",
        label: "引用的文章",
        type: "articleRef",
        required: true,
        hint: "通过搜索对话框关联一篇源文章",
      },
    ],
  },
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
      { key: "thumb", label: "缩略图", type: "image" },
      { key: "summary", label: "摘要", type: "textarea", rows: 3 },
      { key: "keywords", label: "关键词", type: "text", hint: "逗号分隔" },
      {
        key: "industry",
        label: "行业类别",
        type: "radio",
        selectLayout: "dropdown",
        options: ["传媒", "互联网", "出版", "教育", "文娱", "其他"],
      },
      { key: "body", label: "正文", type: "richtext", required: true, rows: 12 },
    ],
  },
};

/** @deprecated 兼容旧引用 */
export type CmsSchemaId = CmsSchemaTemplateId;
export const CMS_SCHEMAS = CMS_SCHEMA_TEMPLATES;

export type CmsPublishStatus =
  | "draft"
  | "pending"
  | "published"
  | "rejected"
  /** 导航栏目等内容：前台显示 */
  | "visible"
  /** 导航栏目等内容：前台隐藏 */
  | "hidden";

export const CMS_STATUS_LABEL: Record<CmsPublishStatus, string> = {
  draft: "草稿",
  pending: "待审批",
  published: "已发布",
  rejected: "已驳回",
  visible: "显示",
  hidden: "隐藏",
};

export type CmsCatalog = {
  id: string;
  name: string;
  parentId: string | null;
  sort: number;
  /** 该目录文章表单字段（表单编排结果） */
  fields: CmsFieldDef[];
};

export type CmsArticle = {
  id: string;
  catalogId: string;
  /**
   * 默认强制字段：标题（冗余自 fields.title，必填）
   */
  title: string;
  /**
   * 默认强制字段：排序（选填；空表示未设置；数值越小越靠前）
   */
  sort: number | null;
  fields: Record<string, string>;
  status: CmsPublishStatus;
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

function cloneFields(fields: CmsFieldDef[]): CmsFieldDef[] {
  return fields.map((f) => ({
    ...f,
    options: f.options ? [...f.options] : undefined,
  }));
}

function columnFieldToCms(f: ColumnFieldDef): CmsFieldDef {
  if (f.type === "image") {
    return { key: f.key, label: f.label, type: "image", hint: f.hint };
  }
  if (f.type === "textarea") {
    return {
      key: f.key,
      label: f.label,
      type: "textarea",
      rows: f.rows ?? 4,
      hint: f.hint,
    };
  }
  if (f.type === "url") {
    return { key: f.key, label: f.label, type: "text", format: "url", hint: f.hint };
  }
  return { key: f.key, label: f.label, type: "text", hint: f.hint };
}

/** 将门户栏目版块字段扁平为 CMS 表单（含必填 title） */
export function fieldsFromPortalColumn(col: PortalColumn): CmsFieldDef[] {
  const sections = COLUMN_SECTION_SCHEMAS[getColumnSchemaKey(col)] ?? [];
  const fields: CmsFieldDef[] = [
    { key: "title", label: "标题", type: "text", required: true },
  ];
  for (const section of sections) {
    for (const f of section.fields) {
      const cms = columnFieldToCms(f);
      const sectionHint = section.title;
      cms.hint = [sectionHint, cms.hint].filter(Boolean).join(" · ") || undefined;
      fields.push(cms);
    }
  }
  return fields;
}

export function portalColumnCatalogId(col: PortalColumn) {
  return `cms-c-nav-${col.id.replace(/^col-/, "")}`;
}

export function portalColumnArticleId(col: PortalColumn) {
  return `cms-a-nav-${col.id.replace(/^col-/, "")}`;
}

function buildNavColumnSeed(): { catalogs: CmsCatalog[]; articles: CmsArticle[] } {
  const rootId = "cms-c-nav";
  const catalogs: CmsCatalog[] = [
    {
      id: rootId,
      name: "导航栏目",
      parentId: null,
      sort: 5,
      fields: cloneFields(CMS_SCHEMA_TEMPLATES.blank.fields),
    },
  ];
  const articles: CmsArticle[] = [];
  const sorted = [...PORTAL_COLUMN_SEED].sort(
    (a, b) => a.sort - b.sort || a.id.localeCompare(b.id),
  );
  for (const col of sorted) {
    const catId = portalColumnCatalogId(col);
    catalogs.push({
      id: catId,
      name: col.name,
      parentId: rootId,
      sort: col.sort,
      fields: fieldsFromPortalColumn(col),
    });
    articles.push({
      id: portalColumnArticleId(col),
      catalogId: catId,
      title: col.name,
      sort: col.sort,
      fields: { title: col.name, ...col.content },
      status: col.hidden ? "hidden" : "visible",
      changeNote: "",
      rejectReason: "",
      updatedAt: "2026-08-01 10:00:00",
      publishedAt: col.hidden ? null : "2026-08-01 10:00:00",
    });
  }
  return { catalogs, articles };
}

const NAV_COLUMN_SEED = buildNavColumnSeed();

const SEED_CATALOGS: CmsCatalog[] = [
  ...NAV_COLUMN_SEED.catalogs,
  {
    id: "cms-c-faq",
    name: "常见问题",
    parentId: null,
    sort: 10,
    fields: cloneFields(CMS_SCHEMA_TEMPLATES.faq.fields),
  },
  {
    id: "cms-c-product",
    name: "服务详情",
    parentId: null,
    sort: 20,
    fields: cloneFields(CMS_SCHEMA_TEMPLATES.productDetail.fields),
  },
  {
    id: "cms-c-industry",
    name: "行业资讯",
    parentId: null,
    sort: 30,
    fields: cloneFields(CMS_SCHEMA_TEMPLATES.industry.fields),
  },
  {
    id: "cms-c-topic",
    name: "首页专题",
    parentId: null,
    sort: 40,
    fields: cloneFields(CMS_SCHEMA_TEMPLATES.topic.fields),
  },
];

const SEED_ARTICLES: CmsArticle[] = [
  ...NAV_COLUMN_SEED.articles,
  {
    id: "cms-a-1",
    catalogId: "cms-c-faq",
    title: "DCI是什么？",
    sort: 10,
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
    sort: null,
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
  {
    id: "cms-a-topic-1",
    catalogId: "cms-c-topic",
    title: "焦点：数字版权基础设施",
    sort: 10,
    fields: {
      title: "焦点：数字版权基础设施",
      cover:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260722/6666.jpg",
      refArticle: "cms-a-2",
    },
    status: "visible",
    changeNote: "",
    rejectReason: "",
    updatedAt: "2026-09-20 09:00:00",
    publishedAt: "2026-09-20 09:00:00",
  },
];

let catalogs: CmsCatalog[] = SEED_CATALOGS.map((c) => ({
  ...c,
  fields: cloneFields(c.fields),
}));
let articles: CmsArticle[] = SEED_ARTICLES.map((a) => ({
  ...a,
  fields: { ...a.fields },
}));
let catalogSeq = 100;
let articleSeq = 100;
let fieldKeySeq = 1000;
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
  return [...catalogs].sort(bySort).map((c) => ({ ...c, fields: cloneFields(c.fields) }));
}

export function getCmsCatalog(id: string): CmsCatalog | undefined {
  const c = catalogs.find((x) => x.id === id);
  return c ? { ...c, fields: cloneFields(c.fields) } : undefined;
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
      out.push({ catalog: { ...c, fields: cloneFields(c.fields) }, depth });
      walk(c.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

/** 树状下拉展示名（含缩进前缀） */
export function catalogOptionLabel(name: string, depth: number) {
  if (depth <= 0) return name;
  return `${"　".repeat(depth)}└ ${name}`;
}

export function createCmsCatalog(input: {
  name: string;
  parentId: string | null;
  sort: number;
  /** 选用模板初始化字段；默认 blank */
  templateId?: CmsSchemaTemplateId;
  fields?: CmsFieldDef[];
}): CmsCatalog {
  const name = input.name.trim();
  if (!name) throw new Error("请填写目录名称");
  if (input.parentId && !catalogs.some((c) => c.id === input.parentId)) {
    throw new Error("上级目录不存在");
  }
  const templateId = input.templateId ?? "blank";
  const template = CMS_SCHEMA_TEMPLATES[templateId];
  if (!template) throw new Error("无效的表单模板");
  catalogSeq += 1;
  const created: CmsCatalog = {
    id: `cms-c-${catalogSeq}`,
    name,
    parentId: input.parentId,
    sort: input.sort,
    fields: cloneFields(input.fields ?? template.fields),
  };
  catalogs = [...catalogs, created];
  emit();
  return { ...created, fields: cloneFields(created.fields) };
}

export function updateCmsCatalog(
  id: string,
  input: { name: string; sort: number },
): CmsCatalog {
  const idx = catalogs.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("目录不存在");
  const name = input.name.trim();
  if (!name) throw new Error("请填写目录名称");
  const next: CmsCatalog = {
    ...catalogs[idx]!,
    name,
    sort: input.sort,
  };
  catalogs = catalogs.map((c, i) => (i === idx ? next : c));
  emit();
  return { ...next, fields: cloneFields(next.fields) };
}

export function updateCmsCatalogFields(id: string, fields: CmsFieldDef[]): CmsCatalog {
  const idx = catalogs.findIndex((c) => c.id === id);
  if (idx < 0) throw new Error("目录不存在");
  if (!fields.length) throw new Error("请至少保留一个字段");
  if (!fields.some((f) => f.key === "title")) {
    throw new Error("表单须包含字段标识为 title 的标题字段");
  }
  const keys = new Set<string>();
  for (const f of fields) {
    const key = f.key.trim();
    const label = f.label.trim();
    if (!key) throw new Error("字段标识不能为空");
    if (!label) throw new Error("字段名称不能为空");
    if (keys.has(key)) throw new Error(`字段标识重复：${key}`);
    keys.add(key);
    if ((f.type === "radio" || f.type === "checkbox") && !(f.options?.length)) {
      throw new Error(`「${label}」请至少配置一个选项`);
    }
  }
  const next: CmsCatalog = {
    ...catalogs[idx]!,
    fields: cloneFields(fields),
  };
  catalogs = catalogs.map((c, i) => (i === idx ? next : c));
  emit();
  return { ...next, fields: cloneFields(next.fields) };
}

export function deleteCmsCatalog(id: string): string | null {
  if (catalogs.some((c) => c.parentId === id)) return "请先删除子目录";
  if (articles.some((a) => a.catalogId === id)) return "该目录下仍有文章，无法删除";
  catalogs = catalogs.filter((c) => c.id !== id);
  emit();
  return null;
}

export function newCmsFieldKey(type: CmsFieldType) {
  fieldKeySeq += 1;
  return `f_${type}_${fieldKeySeq}`;
}

export function createDefaultField(type: CmsFieldType): CmsFieldDef {
  const key = newCmsFieldKey(type);
  const base: CmsFieldDef = {
    key,
    label: CMS_FIELD_TYPE_LABEL[type],
    type,
    required: false,
  };
  switch (type) {
    case "text":
      return { ...base, format: "any" };
    case "textarea":
      return { ...base, rows: 4 };
    case "richtext":
      return { ...base, rows: 8 };
    case "number":
    case "integer":
      return { ...base };
    case "numberRange":
      return { ...base };
    case "radio":
      return {
        ...base,
        selectLayout: "dropdown",
        options: ["选项一", "选项二"],
      };
    case "checkbox":
      return {
        ...base,
        selectLayout: "flat",
        options: ["选项一", "选项二"],
        allowSelectAll: false,
      };
    case "image":
      return { ...base };
    case "images":
      return { ...base, maxCount: 9 };
    case "articleRef":
      return { ...base, label: "引用的文章" };
    case "articleRefs":
      return { ...base, label: "引用的文章", maxCount: 20 };
    case "file":
      return { ...base };
    case "date":
    case "datetime":
      return { ...base };
    default:
      return base;
  }
}

function byArticleSort(a: CmsArticle, b: CmsArticle) {
  const as = a.sort;
  const bs = b.sort;
  if (as == null && bs == null) return b.updatedAt.localeCompare(a.updatedAt);
  if (as == null) return 1;
  if (bs == null) return -1;
  if (as !== bs) return as - bs;
  return b.updatedAt.localeCompare(a.updatedAt);
}

/** 解析排序输入：空 → null；否则须为整数 */
export function parseArticleSortInput(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (!/^-?\d+$/.test(t)) throw new Error("排序须为整数或留空");
  return Number(t);
}

export function listCmsArticles(catalogId?: string, titleKeyword = ""): CmsArticle[] {
  const kw = titleKeyword.trim().toLowerCase();
  return articles
    .filter((a) => (catalogId ? a.catalogId === catalogId : true))
    .filter((a) => (kw ? a.title.toLowerCase().includes(kw) : true))
    .sort(byArticleSort)
    .map((a) => ({ ...a, fields: { ...a.fields } }));
}

/** 搜索可选被引用文章（排除指定文章自身；可按目录筛选） */
export function searchCmsArticlesForRef(opts: {
  keyword?: string;
  catalogId?: string;
  excludeArticleId?: string;
}): CmsArticle[] {
  const kw = (opts.keyword ?? "").trim().toLowerCase();
  return articles
    .filter((a) => (opts.excludeArticleId ? a.id !== opts.excludeArticleId : true))
    .filter((a) => (opts.catalogId ? a.catalogId === opts.catalogId : true))
    .filter((a) => {
      if (!kw) return true;
      return (
        a.title.toLowerCase().includes(kw) ||
        a.id.toLowerCase().includes(kw) ||
        a.catalogId.toLowerCase().includes(kw)
      );
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((a) => ({ ...a, fields: { ...a.fields } }));
}

export function getCmsArticle(id: string): CmsArticle | undefined {
  const a = articles.find((x) => x.id === id);
  return a ? { ...a, fields: { ...a.fields } } : undefined;
}

function parseArticleIdList(raw: string): string[] {
  try {
    const v = JSON.parse(raw || "[]");
    return Array.isArray(v) ? v.map(String).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function validateFields(fieldDefs: CmsFieldDef[], fields: Record<string, string>) {
  for (const f of fieldDefs) {
    const raw = String(fields[f.key] ?? "").trim();

    if (f.type === "articleRefs") {
      const ids = parseArticleIdList(raw || "[]");
      if (f.required && ids.length === 0) {
        throw new Error(`请选择${f.label}`);
      }
      if (f.maxCount != null && ids.length > f.maxCount) {
        throw new Error(`${f.label}最多选择 ${f.maxCount} 篇`);
      }
      for (const id of ids) {
        if (!articles.some((a) => a.id === id)) {
          throw new Error(`${f.label}中的文章不存在：${id}`);
        }
      }
      continue;
    }

    if (f.type === "articleRef") {
      if (f.required && !raw) {
        throw new Error(`请选择${f.label}`);
      }
      if (raw && !articles.some((a) => a.id === raw)) {
        throw new Error(`${f.label}关联的文章不存在：${raw}`);
      }
      continue;
    }

    if (f.required && !raw) {
      throw new Error(`请填写${f.label}`);
    }
    if (!raw) continue;
    if (f.type === "integer" && !/^-?\d+$/.test(raw)) {
      throw new Error(`${f.label}须为整数`);
    }
    if (f.type === "number" && Number.isNaN(Number(raw))) {
      throw new Error(`${f.label}须为数值`);
    }
    if (f.type === "numberRange") {
      try {
        const parsed = JSON.parse(raw) as { min?: string; max?: string };
        if (f.required && !String(parsed.min ?? "").trim() && !String(parsed.max ?? "").trim()) {
          throw new Error(`请填写${f.label}`);
        }
      } catch (e) {
        if (e instanceof Error && e.message.startsWith("请填写")) throw e;
        throw new Error(`${f.label}格式无效`);
      }
    }
    if (f.type === "text" && f.format && f.format !== "any") {
      if (f.format === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
        throw new Error(`${f.label}须为有效邮箱`);
      }
      if (f.format === "url" && !/^https?:\/\//i.test(raw)) {
        throw new Error(`${f.label}须为 http(s) 网址`);
      }
      if (f.format === "phone" && !/^1\d{10}$/.test(raw)) {
        throw new Error(`${f.label}须为 11 位手机号`);
      }
      if (f.format === "idcard" && !/^\d{17}[\dXx]$/.test(raw)) {
        throw new Error(`${f.label}须为身份证号`);
      }
    }
  }
}

export function createCmsArticle(input: {
  catalogId: string;
  fields: Record<string, string>;
  sort?: number | null;
}): CmsArticle {
  const catalog = getCmsCatalog(input.catalogId);
  if (!catalog) throw new Error("请选择目录");
  if (catalog.id === "cms-c-nav") {
    throw new Error("请在「导航栏目」的子目录下创建文章");
  }
  if (
    catalog.parentId === "cms-c-nav" &&
    articles.some((a) => a.catalogId === catalog.id)
  ) {
    throw new Error("导航栏目子目录仅允许配置一篇文章，请编辑已有文章");
  }
  validateFields(catalog.fields, input.fields);
  const title = (input.fields.title || "").trim() || "未命名文章";
  articleSeq += 1;
  const created: CmsArticle = {
    id: `cms-a-${articleSeq}`,
    catalogId: input.catalogId,
    title,
    sort: input.sort ?? null,
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
  input: { fields: Record<string, string>; sort?: number | null },
): CmsArticle {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("文章不存在");
  const prev = articles[idx]!;
  if (prev.status === "pending") throw new Error("待审批中，暂不可编辑");
  const catalog = getCmsCatalog(prev.catalogId);
  if (!catalog) throw new Error("所属目录不存在");
  validateFields(catalog.fields, input.fields);
  const title = (input.fields.title || "").trim() || prev.title;
  const next: CmsArticle = {
    ...prev,
    title,
    sort: input.sort !== undefined ? input.sort : prev.sort,
    fields: { ...input.fields },
    // 已发布稿再改 → 草稿需重审；显示/隐藏类导航内容保持状态
    status:
      prev.status === "published"
        ? "draft"
        : prev.status === "rejected"
          ? "draft"
          : prev.status,
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

/** 是否为「导航栏目」或其子目录（门户栏目迁移） */
export function isNavColumnCatalog(catalogId: string): boolean {
  const c = catalogs.find((x) => x.id === catalogId);
  if (!c) return false;
  return c.id === "cms-c-nav" || c.parentId === "cms-c-nav";
}

/** 切换导航类文章显示/隐藏 */
export function setCmsArticleVisibility(id: string, visible: boolean) {
  const idx = articles.findIndex((a) => a.id === id);
  if (idx < 0) throw new Error("文章不存在");
  const prev = articles[idx]!;
  if (prev.status !== "visible" && prev.status !== "hidden") {
    throw new Error("仅「显示/隐藏」状态的文章可切换可见性");
  }
  const stamp = nowStamp();
  articles = articles.map((a, i) =>
    i === idx
      ? {
          ...a,
          status: visible ? ("visible" as const) : ("hidden" as const),
          publishedAt: visible ? a.publishedAt ?? stamp : a.publishedAt,
          updatedAt: stamp,
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
    searchArticlesForRef: searchCmsArticlesForRef,
    getCatalog: getCmsCatalog,
    getArticle: getCmsArticle,
    createCatalog: createCmsCatalog,
    updateCatalog: updateCmsCatalog,
    updateCatalogFields: updateCmsCatalogFields,
    deleteCatalog: deleteCmsCatalog,
    createArticle: createCmsArticle,
    updateArticle: updateCmsArticle,
    deleteArticle: deleteCmsArticle,
    submit: submitCmsArticle,
    approve: approveCmsArticle,
    reject: rejectCmsArticle,
    setVisibility: setCmsArticleVisibility,
    isNavColumnCatalog,
  };
}
