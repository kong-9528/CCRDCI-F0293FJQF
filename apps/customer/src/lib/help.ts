export type HelpSectionId =
  | "quickstart"
  | "api-guide"
  | "dci"
  | "info"
  | "cert"
  | "review"
  | "keys"
  | "faq";

export type HelpFaqItem = {
  id: string;
  question: string;
  answer: string;
};

export type HelpSection = {
  id: HelpSectionId;
  title: string;
  /** 正文段落与子标题由页面渲染 */
  blocks: HelpBlock[];
};

export type HelpBlock =
  | { type: "p"; text: string }
  | { type: "h3"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "link"; label: string; to: string; hint?: string }
  | { type: "faq"; items: HelpFaqItem[] };

export const HELP_NAV: { id: HelpSectionId; title: string }[] = [
  { id: "quickstart", title: "快速开始" },
  { id: "api-guide", title: "API接入指南" },
  { id: "dci", title: "DCI核验接口" },
  { id: "info", title: "版权登记信息核验接口" },
  { id: "cert", title: "版权登记证书核验接口" },
  { id: "review", title: "智能审核接口" },
  { id: "keys", title: "API Keys" },
  { id: "faq", title: "常见问题" },
];

export const HELP_SECTIONS: Record<HelpSectionId, HelpSection> = {
  quickstart: {
    id: "quickstart",
    title: "快速开始",
    blocks: [
      {
        type: "p",
        text: "欢迎使用 DCI®技术服务中心。本文档将帮助您快速了解平台功能并完成 API 接入。",
      },
      { type: "h3", text: "第一步：获取 API 密钥" },
      {
        type: "p",
        text: "登录工作台后，点击右上角头像，进入「API Keys」页面创建密钥。SecretKey 仅在创建成功时展示一次，请立即保存。",
      },
      { type: "link", label: "前往 API Keys", to: "/keys" },
      { type: "h3", text: "第二步：阅读 API 文档" },
      {
        type: "p",
        text: "每个核验 / 审核服务页面均提供对应的 API 文档入口，包含请求参数、返回格式、错误码等详细信息。也可在「API文档」中浏览全部 29 个接口。",
      },
      { type: "link", label: "打开 API 文档总览", to: "/api-docs" },
      { type: "h3", text: "第三步：调用接口" },
      {
        type: "p",
        text: "使用您的密钥调用接口，每次调用将消耗对应的配额。可在工作台查看实时调用量和剩余配额。",
      },
      { type: "link", label: "返回工作台", to: "/desk" },
    ],
  },
  "api-guide": {
    id: "api-guide",
    title: "API接入指南",
    blocks: [
      {
        type: "p",
        text: "平台接口采用 HTTPS + RESTful 风格。所有业务请求均需携带公共鉴权参数。",
      },
      { type: "h3", text: "公共参数" },
      {
        type: "ul",
        items: [
          "accessKey：接入方标识，在 API Keys 页面获取",
          "timestamp：请求时间戳，格式 yyyy-MM-dd HH:mm:ss",
          "sign：请求签名，按签名说明使用 SecretKey 计算",
        ],
      },
      { type: "h3", text: "请求约定" },
      {
        type: "ul",
        items: [
          "Content-Type：application/json（文件上传类接口除外）",
          "字符编码：UTF-8",
          "成功时业务码 code = 0，失败时返回非 0 与提示信息",
          "响应均包含 requestId，便于排查问题",
        ],
      },
      { type: "h3", text: "配额与限流" },
      {
        type: "p",
        text: "各产品配额相互独立，可在「账号中心 · 我的服务」或工作台查看。配额耗尽后接口将返回错误，请及时联系商务扩容。",
      },
      { type: "link", label: "查看全部接口文档", to: "/api-docs" },
    ],
  },
  dci: {
    id: "dci",
    title: "DCI核验接口",
    blocks: [
      {
        type: "p",
        text: "DCI 核验接口用于根据 DCI 编码查询登记信息、权属状态，并支持批量核验与结果回调。",
      },
      { type: "h3", text: "主要能力" },
      {
        type: "ul",
        items: [
          "DCI 编码单条核验",
          "权属信息 / 作品详情查询",
          "证书真伪验证",
          "批量核验与异步回调",
        ],
      },
      {
        type: "p",
        text: "工作台提供软件 / 作品 / 数据集三类 WebUI 核验入口，便于联调演示。",
      },
      { type: "link", label: "打开 DCI 核验页", to: "/verify/dci" },
      { type: "link", label: "DCI 接口文档", to: "/api-docs/dci", hint: "含 6 个接口" },
    ],
  },
  info: {
    id: "info",
    title: "版权登记信息核验接口",
    blocks: [
      {
        type: "p",
        text: "版权登记信息核验接口提供作品信息检索、权属链查询、登记状态与权利人信息查询等能力。",
      },
      { type: "h3", text: "主要能力" },
      {
        type: "ul",
        items: [
          "作品信息关键词检索",
          "权属链 / 登记状态查询",
          "权利人信息查询",
          "作品分类查询",
        ],
      },
      { type: "link", label: "打开版权登记信息核验页", to: "/verify/info" },
      { type: "link", label: "信息核验接口文档", to: "/api-docs/info", hint: "含 5 个接口" },
    ],
  },
  cert: {
    id: "cert",
    title: "版权登记证书核验接口",
    blocks: [
      {
        type: "p",
        text: "版权登记证书核验接口用于证书真伪验证、详情查询、下载与批量核验。",
      },
      { type: "h3", text: "主要能力" },
      {
        type: "ul",
        items: [
          "证书真伪验证（支持证书编号 / 图片）",
          "证书详情查询与下载",
          "批量证书核验",
        ],
      },
      { type: "link", label: "打开证书核验页", to: "/verify/certificate" },
      { type: "link", label: "证书核验接口文档", to: "/api-docs/cert", hint: "含 4 个接口" },
    ],
  },
  review: {
    id: "review",
    title: "智能审核接口",
    blocks: [
      {
        type: "p",
        text: "智能辅助审核涵盖内容安全审核、作品登记查重与疑似侵权审核三类产品，共 14 个接口。",
      },
      { type: "h3", text: "内容安全审核" },
      {
        type: "p",
        text: "支持文本 / 图片 / 视频审核、批量任务、结果查询、自定义规则与回调通知。",
      },
      { type: "link", label: "内容安全审核", to: "/review/safety" },
      { type: "link", label: "安全审核接口文档", to: "/api-docs/safety" },
      { type: "h3", text: "作品登记查重" },
      {
        type: "p",
        text: "支持文本 / 图片查重与相似度报告生成。",
      },
      { type: "link", label: "作品登记查重", to: "/review/duplicate" },
      { type: "link", label: "查重接口文档", to: "/api-docs/dedup" },
      { type: "h3", text: "疑似侵权审核" },
      {
        type: "p",
        text: "支持侵权检测、相似度分析、风险报告与证据固定。",
      },
      { type: "link", label: "疑似侵权审核", to: "/review/infringement" },
      { type: "link", label: "侵权审核接口文档", to: "/api-docs/infringe" },
    ],
  },
  keys: {
    id: "keys",
    title: "API Keys",
    blocks: [
      {
        type: "p",
        text: "AccessKey ID 与 SecretKey 用于 API 身份认证。每个用户最多创建 1 个 API Key；SecretKey 仅在创建或重置成功时展示一次。",
      },
      { type: "h3", text: "安全建议" },
      {
        type: "ul",
        items: [
          "勿将 SecretKey 写入前端公开代码或提交到版本库",
          "密钥泄露后请立即禁用或重置，旧密钥将立即失效",
          "重置或更换前请通知所有调用方同步更新，避免业务中断",
        ],
      },
      { type: "link", label: "前往 API Keys", to: "/keys" },
    ],
  },
  faq: {
    id: "faq",
    title: "常见问题",
    blocks: [
      {
        type: "faq",
        items: [
          {
            id: "q-quota",
            question: "配额用完了怎么办？",
            answer:
              "配额用完后接口将返回错误码，请及时续费或联系商务扩展配额。可在工作台与「账号中心 · 我的服务」查看已用额度。",
          },
          {
            id: "q-leak",
            question: "密钥泄露了如何处理？",
            answer:
              "请立即在「API Keys」页面禁用或重置密钥，旧密钥将立即失效。重置后请同步修改所有调用方配置。",
          },
          {
            id: "q-types",
            question: "支持哪些作品类型？",
            answer:
              "目前支持计算机软件、文字作品、美术作品、音乐作品、数据集等类型。具体以各核验页表单与 API 文档为准。",
          },
          {
            id: "q-stopped",
            question: "服务显示「已停用」怎么办？",
            answer: "需联系运营恢复服务。停用期间对应接口与 WebUI 不可调用，审核 / 核验记录可能为空。",
          },
          {
            id: "q-contact",
            question: "如何修改企业联系信息？",
            answer:
              "进入「账号中心 · 机构信息」，在联系信息区域点击「编辑」即可修改联系人与手机号。机构/企业名称、统一社会信用代码与机构/企业地址为只读。",
          },
        ],
      },
    ],
  },
};

export function getHelpSection(id: HelpSectionId): HelpSection {
  return HELP_SECTIONS[id];
}
