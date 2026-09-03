import { useEffect, useState } from "react";

/** 技术服务中心内容栏目 */
export type ContentChannel = "portal_guide" | "console_help" | "portal_faq";

export const CONTENT_CHANNEL_LABEL: Record<ContentChannel, string> = {
  portal_guide: "门户接入指南",
  console_help: "控制台帮助中心",
  portal_faq: "门户常见问题",
};

export const CONTENT_CHANNELS: ContentChannel[] = [
  "portal_guide",
  "console_help",
  "portal_faq",
];

export type Visibility = "visible" | "hidden";

export type HelpCatalog = {
  id: string;
  channel: ContentChannel;
  name: string;
  parentId: string | null;
  weight: number;
  status: Visibility;
  createdAt: string;
};

export type HelpArticle = {
  id: string;
  channel: ContentChannel;
  title: string;
  catalogId: string | null;
  weight: number;
  status: Visibility;
  views: number;
  summary: string;
  /** HTML 正文；FAQ 栏目下为回答内容 */
  body: string;
  maintainer: string;
  updatedAt: string;
  deleted: boolean;
};

export const VISIBILITY_LABEL: Record<Visibility, string> = {
  visible: "显示",
  hidden: "隐藏",
};

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let catalogSeq = 40;
let articleSeq = 50;

let catalogs: HelpCatalog[] = [
  // —— 门户接入指南 ——
  {
    id: "c-account",
    channel: "portal_guide",
    name: "账号与登录",
    parentId: null,
    weight: 10,
    status: "visible",
    createdAt: "2026-01-05 10:00:00",
  },
  {
    id: "c-product",
    channel: "portal_guide",
    name: "产品使用",
    parentId: null,
    weight: 20,
    status: "visible",
    createdAt: "2026-01-05 10:01:00",
  },
  {
    id: "c-api",
    channel: "portal_guide",
    name: "API 接入",
    parentId: "c-product",
    weight: 10,
    status: "visible",
    createdAt: "2026-02-01 09:00:00",
  },
  {
    id: "c-hidden",
    channel: "portal_guide",
    name: "内部说明（隐藏）",
    parentId: null,
    weight: 99,
    status: "hidden",
    createdAt: "2026-03-01 11:00:00",
  },
  // —— 控制台帮助中心 ——
  {
    id: "ch-c-start",
    channel: "console_help",
    name: "入门指南",
    parentId: null,
    weight: 10,
    status: "visible",
    createdAt: "2026-01-06 10:00:00",
  },
  {
    id: "ch-c-api",
    channel: "console_help",
    name: "API 与密钥",
    parentId: null,
    weight: 20,
    status: "visible",
    createdAt: "2026-01-06 10:01:00",
  },
  {
    id: "ch-c-api-sub",
    channel: "console_help",
    name: "接口说明",
    parentId: "ch-c-api",
    weight: 10,
    status: "visible",
    createdAt: "2026-02-02 09:00:00",
  },
  // —— 门户常见问题 ——
  {
    id: "faq-c-account",
    channel: "portal_faq",
    name: "账号相关",
    parentId: null,
    weight: 10,
    status: "visible",
    createdAt: "2026-01-07 10:00:00",
  },
  {
    id: "faq-c-usage",
    channel: "portal_faq",
    name: "使用与额度",
    parentId: null,
    weight: 20,
    status: "visible",
    createdAt: "2026-01-07 10:01:00",
  },
];

let articles: HelpArticle[] = [
  // —— 门户接入指南 ——
  {
    id: "a-overview",
    channel: "portal_guide",
    title: "平台概览",
    catalogId: null,
    weight: 1,
    status: "visible",
    views: 1280,
    summary: "平台能力与开通方式总览",
    body: "<p>DCI®技术服务中心面向企业客户，提供版权核验与智能辅助审核服务。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-01 14:00:00",
    deleted: false,
  },
  {
    id: "a-account",
    channel: "portal_guide",
    title: "账号开通说明",
    catalogId: "c-account",
    weight: 10,
    status: "visible",
    views: 860,
    summary: "线下签约后由运营开通账号",
    body: "<p>账号需在线下完成合同签署后，由运营人员开通。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-07-20 10:30:00",
    deleted: false,
  },
  {
    id: "a-console",
    channel: "portal_guide",
    title: "进入DCI®技术服务中心",
    catalogId: "c-account",
    weight: 20,
    status: "visible",
    views: 640,
    summary: "登录后进入客户工作台",
    body: "<p>登录成功后，导航栏将出现「DCI®技术服务中心」入口。</p>",
    maintainer: "王编辑",
    updatedAt: "2026-07-18 16:00:00",
    deleted: false,
  },
  {
    id: "a-dci",
    channel: "portal_guide",
    title: "版权核验服务指南",
    catalogId: "c-product",
    weight: 10,
    status: "visible",
    views: 1520,
    summary: "DCI / 信息 / 证书核验说明",
    body: "<p>在平台选择已开通产品提交后同步返回结果。</p>",
    maintainer: "王编辑",
    updatedAt: "2026-08-10 09:20:00",
    deleted: false,
  },
  {
    id: "a-key",
    channel: "portal_guide",
    title: "API Key 管理",
    catalogId: "c-api",
    weight: 10,
    status: "hidden",
    views: 120,
    summary: "密钥创建与吊销",
    body: "<p>完整密钥仅在创建时展示一次，请妥善保存。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-12 11:00:00",
    deleted: false,
  },
  // —— 控制台帮助中心 ——
  {
    id: "ch-quickstart",
    channel: "console_help",
    title: "快速开始",
    catalogId: "ch-c-start",
    weight: 10,
    status: "visible",
    views: 920,
    summary: "工作台开通与首次调用指引",
    body: "<p>欢迎使用 DCI®技术服务中心。本文档将帮助您快速了解平台功能并完成 API 接入。</p><p>典型路径：确认已开通产品 → 获取密钥 → 按文档联调 → 上线调用。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-01 14:00:00",
    deleted: false,
  },
  {
    id: "ch-api",
    channel: "console_help",
    title: "API接入指南",
    catalogId: "ch-c-api",
    weight: 10,
    status: "visible",
    views: 1100,
    summary: "鉴权、公共参数与调用约定",
    body: "<p>平台接口采用 HTTPS + RESTful 风格。所有业务请求均需携带公共鉴权参数。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-05 10:00:00",
    deleted: false,
  },
  {
    id: "ch-dci",
    channel: "console_help",
    title: "DCI核验接口",
    catalogId: "ch-c-api-sub",
    weight: 10,
    status: "visible",
    views: 640,
    summary: "DCI 编码与作品核验说明",
    body: "<p>在控制台选择已开通的 DCI 核验产品提交后同步返回结果。</p>",
    maintainer: "王编辑",
    updatedAt: "2026-08-10 09:20:00",
    deleted: false,
  },
  {
    id: "ch-keys",
    channel: "console_help",
    title: "API Keys",
    catalogId: "ch-c-api",
    weight: 20,
    status: "visible",
    views: 780,
    summary: "密钥创建、展示与吊销",
    body: "<p>完整密钥仅在创建时展示一次，请妥善保存。勿将 SecretKey 写入前端公开代码。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-12 11:00:00",
    deleted: false,
  },
  {
    id: "ch-faq",
    channel: "console_help",
    title: "常见问题",
    catalogId: null,
    weight: 90,
    status: "hidden",
    views: 120,
    summary: "控制台高频问题汇总",
    body: "<p>额度不足请联系客户经理追加；忘记密码可在登录页通过手机短信验证码找回。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-07-28 15:00:00",
    deleted: false,
  },
  // —— 门户常见问题（标题=问题，正文=回答）——
  {
    id: "faq-register",
    channel: "portal_faq",
    title: "如何注册账号？",
    catalogId: "faq-c-account",
    weight: 10,
    status: "visible",
    views: 500,
    summary: "",
    body: "<p>点击导航「注册/登录」打开登录弹窗，再选择「注册账号」。需填写唯一账号名、8–12 位密码、唯一手机号，并完成图形验证码与短信验证；勾选用户协议与隐私协议后方可注册。产品权限仍需线下签约后开通。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-01 10:00:00",
    deleted: false,
  },
  {
    id: "faq-password",
    channel: "portal_faq",
    title: "忘记密码如何找回？",
    catalogId: "faq-c-account",
    weight: 20,
    status: "visible",
    views: 420,
    summary: "",
    body: "<p>在登录弹窗点击「忘记密码」，进入找回流程。系统将向账号绑定手机号发送短信验证码以校验身份。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-06-12 09:40:00",
    deleted: false,
  },
  {
    id: "faq-quota",
    channel: "portal_faq",
    title: "额度不足怎么办？",
    catalogId: "faq-c-usage",
    weight: 10,
    status: "visible",
    views: 680,
    summary: "",
    body: "<p>调用将返回额度不足提示。请联系客户经理按合同约定追加额度，运营在后台完成加额后即可继续使用。</p>",
    maintainer: "王编辑",
    updatedAt: "2026-07-28 15:00:00",
    deleted: false,
  },
  {
    id: "faq-products",
    channel: "portal_faq",
    title: "两类服务分别包含哪些产品？",
    catalogId: "faq-c-usage",
    weight: 20,
    status: "visible",
    views: 310,
    summary: "",
    body: "<p><strong>版权核验服务：</strong>DCI核验、版权登记信息核验、版权登记证书核验。</p><p><strong>智能辅助审核服务：</strong>内容安全审核、作品登记查重、疑似侵权审核。</p>",
    maintainer: "王编辑",
    updatedAt: "2026-08-05 11:00:00",
    deleted: false,
  },
];

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

export function getCatalogs(channel?: ContentChannel) {
  return channel ? catalogs.filter((c) => c.channel === channel) : catalogs;
}

export function getArticles(channel?: ContentChannel) {
  return articles.filter((a) => !a.deleted && (!channel || a.channel === channel));
}

export function getArticleById(id: string) {
  return articles.find((a) => a.id === id && !a.deleted) ?? null;
}

export function catalogName(id: string | null, channel?: ContentChannel) {
  if (!id) return "（根目录）";
  const list = channel ? getCatalogs(channel) : catalogs;
  return list.find((c) => c.id === id)?.name ?? "—";
}

export function articleCountOf(catalogId: string) {
  return articles.filter((a) => !a.deleted && a.catalogId === catalogId).length;
}

export function catalogDepth(id: string, channel: ContentChannel): number {
  const list = getCatalogs(channel);
  let depth = 0;
  let cur = list.find((c) => c.id === id);
  while (cur?.parentId) {
    depth += 1;
    cur = list.find((c) => c.id === cur!.parentId);
    if (depth > 20) break;
  }
  return depth;
}

export function sortedCatalogs(channel: ContentChannel): HelpCatalog[] {
  const scoped = getCatalogs(channel);
  const byParent = new Map<string | null, HelpCatalog[]>();
  for (const c of scoped) {
    const list = byParent.get(c.parentId) ?? [];
    list.push(c);
    byParent.set(c.parentId, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
  const out: HelpCatalog[] = [];
  const walk = (parentId: string | null) => {
    for (const k of byParent.get(parentId) ?? []) {
      out.push(k);
      walk(k.id);
    }
  };
  walk(null);
  return out;
}

export type ContentTreeRow =
  | { kind: "catalog"; depth: number; catalog: HelpCatalog }
  | { kind: "article"; depth: number; article: HelpArticle };

/** 目录与文章混排树：同级按 weight */
export function sortedContentTree(channel: ContentChannel): ContentTreeRow[] {
  type Node =
    | { kind: "catalog"; weight: number; tie: string; catalog: HelpCatalog }
    | { kind: "article"; weight: number; tie: string; article: HelpArticle };

  const byParent = new Map<string | null, Node[]>();
  const push = (parentId: string | null, node: Node) => {
    const list = byParent.get(parentId) ?? [];
    list.push(node);
    byParent.set(parentId, list);
  };

  for (const c of getCatalogs(channel)) {
    push(c.parentId, {
      kind: "catalog",
      weight: c.weight,
      tie: c.createdAt,
      catalog: c,
    });
  }
  for (const a of getArticles(channel)) {
    push(a.catalogId, {
      kind: "article",
      weight: a.weight,
      tie: a.updatedAt,
      article: a,
    });
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.tie.localeCompare(b.tie);
    });
  }

  const out: ContentTreeRow[] = [];
  const walk = (parentId: string | null, depth: number) => {
    for (const node of byParent.get(parentId) ?? []) {
      if (node.kind === "catalog") {
        out.push({ kind: "catalog", depth, catalog: node.catalog });
        walk(node.catalog.id, depth + 1);
      } else {
        out.push({ kind: "article", depth, article: node.article });
      }
    }
  };
  walk(null, 0);
  return out;
}

/** 仅文章、按树序平铺（门户 FAQ 展示用） */
export function flattenArticlesInTreeOrder(channel: ContentChannel): HelpArticle[] {
  return sortedContentTree(channel)
    .filter((row): row is Extract<ContentTreeRow, { kind: "article" }> => row.kind === "article")
    .map((row) => row.article);
}

export function catalogSelectOptions(channel: ContentChannel, excludeId?: string) {
  return sortedCatalogs(channel)
    .filter((c) => c.id !== excludeId)
    .filter((c) => {
      if (!excludeId) return true;
      let cur: HelpCatalog | undefined = c;
      while (cur) {
        if (cur.id === excludeId) return false;
        cur = getCatalogs(channel).find((x) => x.id === cur!.parentId);
      }
      return true;
    })
    .map((c) => ({
      value: c.id,
      label: `${"— ".repeat(catalogDepth(c.id, channel))}${c.name}`,
    }));
}

export function createCatalog(
  channel: ContentChannel,
  input: { name: string; parentId: string | null; weight: number },
) {
  catalogSeq += 1;
  catalogs = [
    ...catalogs,
    {
      id: `c-${catalogSeq}`,
      channel,
      name: input.name.trim(),
      parentId: input.parentId,
      weight: input.weight,
      status: "visible",
      createdAt: nowStamp(),
    },
  ];
  emit();
}

export function updateCatalog(
  id: string,
  input: { name: string; parentId: string | null; weight: number },
) {
  catalogs = catalogs.map((c) =>
    c.id === id
      ? {
          ...c,
          name: input.name.trim(),
          parentId: input.parentId,
          weight: input.weight,
        }
      : c,
  );
  emit();
}

export function deleteCatalog(id: string): string | null {
  if (articleCountOf(id) > 0) return "该目录下仍有文章，无法删除";
  if (catalogs.some((c) => c.parentId === id)) return "该目录下仍有子目录，请先处理子目录";
  catalogs = catalogs.filter((c) => c.id !== id);
  emit();
  return null;
}

export function setCatalogVisibility(id: string, status: Visibility) {
  catalogs = catalogs.map((c) => (c.id === id ? { ...c, status } : c));
  emit();
}

export function createArticle(
  channel: ContentChannel,
  input: {
    title: string;
    catalogId: string | null;
    weight: number;
    summary: string;
    body: string;
  },
) {
  articleSeq += 1;
  articles = [
    {
      id: `a-${articleSeq}`,
      channel,
      title: input.title.trim(),
      catalogId: input.catalogId,
      weight: input.weight,
      status: "hidden",
      views: 0,
      summary: input.summary.trim(),
      body: input.body,
      maintainer: "运营管理员",
      updatedAt: nowStamp(),
      deleted: false,
    },
    ...articles,
  ];
  emit();
}

export function updateArticle(
  id: string,
  input: {
    title: string;
    catalogId: string | null;
    weight: number;
    summary: string;
    body: string;
  },
) {
  articles = articles.map((a) =>
    a.id === id
      ? {
          ...a,
          title: input.title.trim(),
          catalogId: input.catalogId,
          weight: input.weight,
          summary: input.summary.trim(),
          body: input.body,
          updatedAt: nowStamp(),
          maintainer: "运营管理员",
        }
      : a,
  );
  emit();
}

export function softDeleteArticle(id: string) {
  articles = articles.map((a) => (a.id === id ? { ...a, deleted: true, updatedAt: nowStamp() } : a));
  emit();
}

export function setArticleVisibility(id: string, status: Visibility) {
  articles = articles.map((a) =>
    a.id === id ? { ...a, status, updatedAt: nowStamp(), maintainer: "运营管理员" } : a,
  );
  emit();
}

export function useContentStore(channel: ContentChannel) {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    channel,
    catalogs: getCatalogs(channel),
    articles: getArticles(channel),
    sortedCatalogs: sortedCatalogs(channel),
    sortedContentTree: sortedContentTree(channel),
    flattenArticles: flattenArticlesInTreeOrder(channel),
    catalogSelectOptions: (excludeId?: string) => catalogSelectOptions(channel, excludeId),
    catalogName: (id: string | null) => catalogName(id, channel),
    articleCountOf,
    catalogDepth: (id: string) => catalogDepth(id, channel),
    createCatalog: (input: { name: string; parentId: string | null; weight: number }) =>
      createCatalog(channel, input),
    updateCatalog,
    deleteCatalog,
    setCatalogVisibility,
    createArticle: (input: {
      title: string;
      catalogId: string | null;
      weight: number;
      summary: string;
      body: string;
    }) => createArticle(channel, input),
    updateArticle,
    softDeleteArticle,
    setArticleVisibility,
  };
}
