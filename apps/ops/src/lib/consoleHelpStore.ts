import { useEffect, useState } from "react";
import type { Visibility } from "@/lib/contentStore";

export type ConsoleHelpArticle = {
  id: string;
  title: string;
  weight: number;
  status: Visibility;
  views: number;
  summary: string;
  body: string;
  maintainer: string;
  updatedAt: string;
  deleted: boolean;
};

function nowStamp() {
  return new Date().toISOString().slice(0, 19).replace("T", " ");
}

let articleSeq = 30;

let articles: ConsoleHelpArticle[] = [
  {
    id: "ch-quickstart",
    title: "快速开始",
    weight: 10,
    status: "visible",
    views: 920,
    summary: "工作台开通与首次调用指引",
    body: "<p>欢迎使用 DCI®技术服务中心。本文档将帮助您快速了解平台功能并完成 API 接入。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-08-01 14:00:00",
    deleted: false,
  },
  {
    id: "ch-api",
    title: "API接入指南",
    weight: 20,
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
    title: "DCI核验接口",
    weight: 30,
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
    title: "API Keys",
    weight: 40,
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
    title: "常见问题",
    weight: 50,
    status: "hidden",
    views: 120,
    summary: "控制台高频问题汇总",
    body: "<p>额度不足请联系客户经理追加；忘记密码可在登录页通过手机短信验证码找回。</p>",
    maintainer: "运营管理员",
    updatedAt: "2026-07-28 15:00:00",
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

export function getConsoleHelpArticles() {
  return articles.filter((a) => !a.deleted);
}

/** 扁平列表：按权重升序，权重相同按更新时间 */
export function sortedConsoleHelpArticles(): ConsoleHelpArticle[] {
  return getConsoleHelpArticles().slice().sort((a, b) => {
    if (a.weight !== b.weight) return a.weight - b.weight;
    return a.updatedAt.localeCompare(b.updatedAt);
  });
}

export function createConsoleHelpArticle(input: {
  title: string;
  weight: number;
  summary: string;
  body: string;
}) {
  articleSeq += 1;
  articles = [
    {
      id: `ch-${articleSeq}`,
      title: input.title.trim(),
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

export function updateConsoleHelpArticle(
  id: string,
  input: { title: string; weight: number; summary: string; body: string },
) {
  articles = articles.map((a) =>
    a.id === id
      ? {
          ...a,
          title: input.title.trim(),
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

export function softDeleteConsoleHelpArticle(id: string) {
  articles = articles.map((a) =>
    a.id === id ? { ...a, deleted: true, updatedAt: nowStamp() } : a,
  );
  emit();
}

export function setConsoleHelpArticleVisibility(id: string, status: Visibility) {
  articles = articles.map((a) =>
    a.id === id ? { ...a, status, updatedAt: nowStamp(), maintainer: "运营管理员" } : a,
  );
  emit();
}

export function useConsoleHelpStore() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    return subscribe(onChange);
  }, []);
  return {
    articles: getConsoleHelpArticles(),
    sortedArticles: sortedConsoleHelpArticles(),
    createArticle: createConsoleHelpArticle,
    updateArticle: updateConsoleHelpArticle,
    softDeleteArticle: softDeleteConsoleHelpArticle,
    setArticleVisibility: setConsoleHelpArticleVisibility,
  };
}
