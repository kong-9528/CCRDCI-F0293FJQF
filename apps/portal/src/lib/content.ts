export const PLATFORM_NAME = "版权技术服务平台";

export const HERO_SLIDES = [
  {
    id: "trust",
    eyebrow: "Copyright Infrastructure",
    title: "以可信数据能力",
    highlight: "护航版权经营",
    lead: "面向内容平台与版权机构，提供核验、智能审核与开放 API，让每一次确权与用权都可追溯、可计量。",
  },
  {
    id: "verify",
    eyebrow: "Verification at Scale",
    title: "海量作品版权核验",
    highlight: "秒级响应",
    lead: "批量证书与作品信息核验，支撑业务侧接入、风控与合规审查，按调用次数清晰计费。",
  },
  {
    id: "audit",
    eyebrow: "Intelligent Review",
    title: "智能审核服务",
    highlight: "提效合规",
    lead: "以模型与规则协同，辅助识别侵权风险与内容合规问题，缩短人工审核链路。",
  },
];

export const VERIFY_THEMES = [
  {
    id: "dci",
    title: "DCI 版权核验",
    desc: "对接权威登记信息，快速核验作品登记状态与权利信息，为交易与分发提供可信依据。",
    visual: "登记状态 · 权利主体 · 作品指纹",
  },
  {
    id: "batch",
    title: "批量核验能力",
    desc: "支持批量文件与多证书场景，一次提交完成多件核验，结果结构化返回便于系统对接。",
    visual: "批量上传 · 多证书解析 · 结构化结果",
  },
  {
    id: "api",
    title: "开放 API 对接",
    desc: "标准 REST 接口，按次计费、额度可控，便于嵌入现有业务系统与工作流。",
    visual: "API Key · 按次计费 · 调用流水",
  },
];

export const AUDIT_THEMES = [
  {
    id: "risk",
    title: "侵权风险识别",
    desc: "围绕文本、图像等形态提供智能比对与风险提示，帮助运营前置拦截高风险内容。",
    visual: "相似度 · 风险等级 · 证据摘要",
  },
  {
    id: "policy",
    title: "合规策略配置",
    desc: "按业务线配置审核策略与阈值，适配不同品类与渠道的合规要求。",
    visual: "策略模板 · 阈值 · 渠道适配",
  },
  {
    id: "human",
    title: "人机协同提效",
    desc: "机器预审 + 人工复核，显著压缩重复劳动，把专家精力留给争议与高价值案件。",
    visual: "预审队列 · 复核工单 · 效率看板",
  },
];

export const PROCESS_STEPS = [
  {
    title: "线下洽谈签约",
    desc: "确认服务范围与调用额度，完成合同签署。",
  },
  {
    title: "运营开通账号",
    desc: "开通企业租户、登录账号及产品权限。",
  },
  {
    title: "平台使用与对接",
    desc: "登录控制台使用 WebUI，或按文档接入 API。",
  },
  {
    title: "按次计量结算",
    desc: "调用自动记流水扣额度，续费由合同约定处理。",
  },
];

export type HelpArticle = {
  id: string;
  title: string;
  body: string[];
  figure?: string;
};

export type HelpSection = {
  id: string;
  title: string;
  children: HelpArticle[];
};

export const HELP_SECTIONS: HelpSection[] = [
  {
    id: "getting-started",
    title: "快速开始",
    children: [
      {
        id: "account",
        title: "账号开通说明",
        body: [
          "本平台为企业客户提供版权数据与智能审核能力。账号需在线下完成合同签署后，由运营人员开通。",
          "开通后您将收到登录用户名与初始密码，首次登录建议立即修改密码。门户不提供自助注册。",
        ],
      },
      {
        id: "console",
        title: "进入控制台",
        body: [
          "登录成功后，导航栏将出现「版权技术服务平台」入口，点击即可进入企业客户控制台。",
          "控制台可查看额度、调用流水、API 文档，并对已开通且支持 WebUI 的产品进行在线操作。",
        ],
        figure: "登录后导航栏出现平台入口示意",
      },
    ],
  },
  {
    id: "products",
    title: "产品使用",
    children: [
      {
        id: "verify-guide",
        title: "版权核验指南",
        body: [
          "在控制台选择已开通的核验产品，按页面提示上传证书或填写核验参数，提交后同步返回结果。",
          "若通过 API 对接，请在文档中获取产品路径、鉴权方式与错误码说明。",
        ],
      },
      {
        id: "audit-guide",
        title: "智能审核指南",
        body: [
          "智能审核产品支持在 WebUI 提交内容样本，或通过开放 API 批量接入业务系统。",
          "返回结果包含风险提示与结构化字段，便于业务侧落库与人工复核。",
        ],
      },
      {
        id: "api-key",
        title: "API Key 管理",
        body: [
          "在控制台创建 API Key，完整密钥仅在创建时展示一次，请妥善保存。",
          "可随时吊销密钥；吊销后立即失效，请同步更新业务系统配置。",
        ],
      },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    children: [
      {
        id: "faq-register",
        title: "如何注册账号？",
        body: [
          "平台不提供自助注册。请联系商务完成线下签约，由运营为您开通企业账号。",
        ],
      },
      {
        id: "faq-quota",
        title: "额度不足怎么办？",
        body: [
          "调用将返回额度不足提示。请联系客户经理按合同约定追加额度，运营在后台完成加额后即可继续使用。",
        ],
      },
      {
        id: "faq-password",
        title: "忘记密码如何找回？",
        body: [
          "在登录弹窗点击「忘记密码」，进入找回流程。系统将向账号绑定邮箱发送验证码以校验身份。",
        ],
      },
    ],
  },
];

export const CONTACT_INFO = {
  phone: "400-000-0000",
  email: "business@copyright-tech.example",
  address: "请通过电话或邮件留资，商务将在 1 个工作日内联系您",
};
