import { useEffect, useState } from "react";

export type Visibility = "visible" | "hidden";

export type HelpCatalog = {
  id: string;
  name: string;
  parentId: string | null;
  weight: number;
  status: Visibility;
  createdAt: string;
};

export type HelpArticle = {
  id: string;
  title: string;
  catalogId: string | null;
  weight: number;
  status: Visibility;
  views: number;
  summary: string;
  body: string;
  maintainer: string;
  updatedAt: string;
  deleted: boolean;
};

export type HelpFaq = {
  id: string;
  question: string;
  answer: string;
  weight: number;
  status: Visibility;
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

let catalogSeq = 10;
let articleSeq = 20;
let faqSeq = 20;

let catalogs: HelpCatalog[] = [
  {
    id: "c-account",
    name: "账号与登录",
    parentId: null,
    weight: 10,
    status: "visible",
    createdAt: "2026-01-05 10:00:00",
  },
  {
    id: "c-product",
    name: "产品使用",
    parentId: null,
    weight: 20,
    status: "visible",
    createdAt: "2026-01-05 10:01:00",
  },
  {
    id: "c-api",
    name: "API 接入",
    parentId: "c-product",
    weight: 10,
    status: "visible",
    createdAt: "2026-02-01 09:00:00",
  },
  {
    id: "c-hidden",
    name: "内部说明（隐藏）",
    parentId: null,
    weight: 99,
    status: "hidden",
    createdAt: "2026-03-01 11:00:00",
  },
];

let articles: HelpArticle[] = [
  {
    id: "a-overview",
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
];

let faqs: HelpFaq[] = [
  {
    id: "f1",
    question: "如何注册账号？",
    answer: "平台不提供自助注册。请联系商务完成线下签约，由运营开通企业账号。",
    weight: 10,
    status: "visible",
    maintainer: "运营管理员",
    updatedAt: "2026-08-01 10:00:00",
    deleted: false,
  },
  {
    id: "f2",
    question: "额度不足怎么办？",
    answer: "请联系客户经理按合同约定追加额度，运营在后台完成加额后即可继续使用。",
    weight: 20,
    status: "visible",
    maintainer: "王编辑",
    updatedAt: "2026-07-28 15:00:00",
    deleted: false,
  },
  {
    id: "f3",
    question: "忘记密码如何找回？",
    answer: "在登录弹窗点击「忘记密码」，通过绑定邮箱验证码校验身份。",
    weight: 30,
    status: "hidden",
    maintainer: "运营管理员",
    updatedAt: "2026-06-12 09:40:00",
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

export function getCatalogs() {
  return catalogs;
}

export function getArticles() {
  return articles.filter((a) => !a.deleted);
}

export function getFaqs() {
  return faqs.filter((f) => !f.deleted);
}

export function catalogName(id: string | null) {
  if (!id) return "（根目录）";
  return catalogs.find((c) => c.id === id)?.name ?? "—";
}

export function articleCountOf(catalogId: string) {
  return articles.filter((a) => !a.deleted && a.catalogId === catalogId).length;
}

/** 树形扁平排序：父在前，同父按 weight、createdAt */
export function sortedCatalogs(): HelpCatalog[] {
  const byParent = new Map<string | null, HelpCatalog[]>();
  for (const c of catalogs) {
    const key = c.parentId;
    const list = byParent.get(key) ?? [];
    list.push(c);
    byParent.set(key, list);
  }
  for (const list of byParent.values()) {
    list.sort((a, b) => {
      if (a.weight !== b.weight) return a.weight - b.weight;
      return a.createdAt.localeCompare(b.createdAt);
    });
  }
  const out: HelpCatalog[] = [];
  const walk = (parentId: string | null, depth: number) => {
    const kids = byParent.get(parentId) ?? [];
    for (const k of kids) {
      out.push({ ...k, /* depth encoded via name indent at UI */ });
      void depth;
      walk(k.id, depth + 1);
    }
  };
  walk(null, 0);
  return out;
}

export function catalogDepth(id: string): number {
  let depth = 0;
  let cur = catalogs.find((c) => c.id === id);
  while (cur?.parentId) {
    depth += 1;
    cur = catalogs.find((c) => c.id === cur!.parentId);
    if (depth > 20) break;
  }
  return depth;
}

export type ContentTreeRow =
  | { kind: "catalog"; depth: number; catalog: HelpCatalog }
  | { kind: "article"; depth: number; article: HelpArticle };

/** 目录与文章混排树：同级按 weight，目录/文章均可作为同级节点 */
export function sortedContentTree(): ContentTreeRow[] {
  type Node =
    | { kind: "catalog"; weight: number; tie: string; catalog: HelpCatalog }
    | { kind: "article"; weight: number; tie: string; article: HelpArticle };

  const byParent = new Map<string | null, Node[]>();
  const push = (parentId: string | null, node: Node) => {
    const list = byParent.get(parentId) ?? [];
    list.push(node);
    byParent.set(parentId, list);
  };

  for (const c of catalogs) {
    push(c.parentId, {
      kind: "catalog",
      weight: c.weight,
      tie: c.createdAt,
      catalog: c,
    });
  }
  for (const a of articles) {
    if (a.deleted) continue;
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

/** 下拉选项：缩进展示树 */
export function catalogSelectOptions(excludeId?: string) {
  return sortedCatalogs()
    .filter((c) => c.id !== excludeId)
    .filter((c) => {
      if (!excludeId) return true;
      // 排除自身及子孙
      let cur: HelpCatalog | undefined = c;
      while (cur) {
        if (cur.id === excludeId) return false;
        cur = catalogs.find((x) => x.id === cur!.parentId);
      }
      return true;
    })
    .map((c) => ({
      value: c.id,
      label: `${"— ".repeat(catalogDepth(c.id))}${c.name}`,
    }));
}

export function createCatalog(input: {
  name: string;
  parentId: string | null;
  weight: number;
}) {
  catalogSeq += 1;
  catalogs = [
    ...catalogs,
    {
      id: `c-${catalogSeq}`,
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

export function createArticle(input: {
  title: string;
  catalogId: string | null;
  weight: number;
  summary: string;
  body: string;
}) {
  articleSeq += 1;
  articles = [
    {
      id: `a-${articleSeq}`,
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

export function createFaq(input: { question: string; answer: string; weight: number }) {
  faqSeq += 1;
  faqs = [
    {
      id: `f-${faqSeq}`,
      question: input.question.trim(),
      answer: input.answer.trim(),
      weight: input.weight,
      status: "hidden",
      maintainer: "运营管理员",
      updatedAt: nowStamp(),
      deleted: false,
    },
    ...faqs,
  ];
  emit();
}

export function updateFaq(
  id: string,
  input: { question: string; answer: string; weight: number },
) {
  faqs = faqs.map((f) =>
    f.id === id
      ? {
          ...f,
          question: input.question.trim(),
          answer: input.answer.trim(),
          weight: input.weight,
          updatedAt: nowStamp(),
          maintainer: "运营管理员",
        }
      : f,
  );
  emit();
}

export function softDeleteFaq(id: string) {
  faqs = faqs.map((f) => (f.id === id ? { ...f, deleted: true, updatedAt: nowStamp() } : f));
  emit();
}

export function setFaqVisibility(id: string, status: Visibility) {
  faqs = faqs.map((f) =>
    f.id === id ? { ...f, status, updatedAt: nowStamp(), maintainer: "运营管理员" } : f,
  );
  emit();
}

export function useContentStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    catalogs: getCatalogs(),
    articles: getArticles(),
    faqs: getFaqs(),
    sortedCatalogs: sortedCatalogs(),
    sortedContentTree: sortedContentTree(),
    catalogSelectOptions,
    catalogName,
    articleCountOf,
    catalogDepth,
    createCatalog,
    updateCatalog,
    deleteCatalog,
    setCatalogVisibility,
    createArticle,
    updateArticle,
    softDeleteArticle,
    setArticleVisibility,
    createFaq,
    updateFaq,
    softDeleteFaq,
    setFaqVisibility,
  };
}
