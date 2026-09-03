/**
 * 控制台帮助中心：目录树 + 文章（与门户接入指南同构）
 * 对齐运营后台「控制台帮助中心」栏目模型。
 */

export type ConsoleHelpNode =
  | {
      type: "folder";
      id: string;
      title: string;
      children: ConsoleHelpNode[];
    }
  | {
      type: "article";
      id: string;
      title: string;
      /** 富文本 HTML */
      html: string;
    };

export const CONSOLE_HELP: ConsoleHelpNode[] = [
  {
    type: "folder",
    id: "ch-c-start",
    title: "入门指南",
    children: [
      {
        type: "article",
        id: "ch-quickstart",
        title: "快速开始",
        html: `
          <p>欢迎使用 DCI®技术服务中心。本文档将帮助您快速了解平台功能并完成 API 接入。</p>
          <h3>第一步：获取 API 密钥</h3>
          <p>登录工作台后，点击右上角头像，进入「API Keys」页面创建密钥。SecretKey 仅在创建成功时展示一次，请立即保存。</p>
          <p><a href="/keys">前往 API Keys →</a></p>
          <h3>第二步：阅读 API 文档</h3>
          <p>每个核验 / 审核服务页面均提供对应的 API 文档入口，包含请求参数、返回格式、错误码等详细信息。也可在「API文档」中浏览全部接口。</p>
          <p><a href="/api-docs">打开 API 文档总览 →</a></p>
          <h3>第三步：调用接口</h3>
          <p>使用您的密钥调用接口，每次调用将消耗对应的配额。可在工作台查看实时调用量和剩余配额。</p>
          <p><a href="/desk">返回工作台 →</a></p>
        `,
      },
    ],
  },
  {
    type: "folder",
    id: "ch-c-api",
    title: "API 与密钥",
    children: [
      {
        type: "article",
        id: "ch-api",
        title: "API接入指南",
        html: `
          <p>平台接口采用 HTTPS + RESTful 风格。所有业务请求均需携带公共鉴权参数。</p>
          <h3>公共参数</h3>
          <ul>
            <li>AccessKey / 签名或 Bearer Token（以控制台创建的密钥为准）</li>
            <li>请求时间戳与随机串（防重放，按接口文档约定）</li>
            <li>Content-Type：application/json 或 multipart/form-data</li>
          </ul>
          <p>完整参数与错误码请参阅各产品 API 文档。</p>
          <p><a href="/api-docs">浏览 API 文档 →</a></p>
        `,
      },
      {
        type: "article",
        id: "ch-keys",
        title: "API Keys",
        html: `
          <p>完整密钥仅在创建时展示一次，请妥善保存。勿将 SecretKey 写入前端公开代码。</p>
          <ul>
            <li>可为不同环境创建多把密钥并分别吊销</li>
            <li>发现泄露请立即在工作台吊销并重新创建</li>
            <li>密钥与租户及已开通产品绑定</li>
          </ul>
          <p><a href="/keys">管理 API Keys →</a></p>
        `,
      },
      {
        type: "folder",
        id: "ch-c-api-sub",
        title: "接口说明",
        children: [
          {
            type: "article",
            id: "ch-dci",
            title: "DCI核验接口",
            html: `
              <p>在控制台选择已开通的 DCI 核验产品提交后同步返回结果。</p>
              <p>可用于校验 DCI 编码与作品信息的一致性，支持 WebUI 与开放 API。</p>
              <p><a href="/verify/dci">打开 DCI 核验 →</a></p>
            `,
          },
        ],
      },
    ],
  },
];

export function findConsoleHelpArticle(
  nodes: ConsoleHelpNode[],
  id: string,
): Extract<ConsoleHelpNode, { type: "article" }> | null {
  for (const node of nodes) {
    if (node.type === "article" && node.id === id) return node;
    if (node.type === "folder") {
      const found = findConsoleHelpArticle(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function firstConsoleHelpArticleId(nodes: ConsoleHelpNode[]): string | null {
  for (const node of nodes) {
    if (node.type === "article") return node.id;
    if (node.type === "folder") {
      const id = firstConsoleHelpArticleId(node.children);
      if (id) return id;
    }
  }
  return null;
}

export function collectConsoleFolderIds(nodes: ConsoleHelpNode[]): string[] {
  const ids: string[] = [];
  for (const node of nodes) {
    if (node.type === "folder") {
      ids.push(node.id);
      ids.push(...collectConsoleFolderIds(node.children));
    }
  }
  return ids;
}
