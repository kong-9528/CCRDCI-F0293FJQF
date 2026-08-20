export const PLATFORM_NAME = "版权技术服务平台";

export const HERO_SLIDES = [
  {
    id: "trust",
    eyebrow: "Copyright Infrastructure",
    title: "以可信数据能力",
    highlight: "护航版权经营",
    lead: "面向内容平台与版权机构，提供版权核验、智能辅助审核与开放 API，让每一次确权与用权都可追溯、可计量。",
  },
  {
    id: "verify",
    eyebrow: "Copyright Verification",
    title: "版权核验服务",
    highlight: "权威可溯",
    lead: "覆盖 DCI 核验、版权信息核验与版权证书核验，支撑业务接入、交易确权与合规审查。",
  },
  {
    id: "audit",
    eyebrow: "Intelligent Review",
    title: "智能辅助审核服务",
    highlight: "提效合规",
    lead: "涵盖内容安全审核、作品登记查重与疑似侵权审核，辅助缩短人工审核链路。",
  },
];

export const VERIFY_THEMES = [
  {
    id: "dci",
    title: "DCI核验",
    desc: "对接 DCI 登记信息，快速核验作品登记状态与权利信息，为交易、分发与确权提供可信依据。",
    visual: "登记状态 · 权利主体 · 登记编号",
  },
  {
    id: "info",
    title: "版权信息核验",
    desc: "核验作品相关版权基础信息，核对权利归属与关键字段，降低业务侧信息不对称风险。",
    visual: "作品信息 · 权利核对 · 结果回传",
  },
  {
    id: "certificate",
    title: "版权证书核验",
    desc: "对版权证书真伪与记载内容进行核验，支持单件与批量场景，结果结构化返回便于系统对接。",
    visual: "证书核验 · 批量处理 · 结构化结果",
  },
];

export const AUDIT_THEMES = [
  {
    id: "safety",
    title: "内容安全审核",
    desc: "对文本、图像等内容进行安全合规筛查，帮助运营前置识别违规与高风险素材。",
    visual: "内容筛查 · 风险标签 · 处置建议",
  },
  {
    id: "duplicate",
    title: "作品登记查重",
    desc: "对照已登记作品库进行查重比对，辅助发现重复登记与高度相似内容，支撑登记前风控。",
    visual: "相似度 · 比对摘要 · 登记辅助",
  },
  {
    id: "infringement",
    title: "疑似侵权审核",
    desc: "围绕疑似侵权行为提供智能辅助研判与证据线索，便于人工复核与后续处置。",
    visual: "侵权线索 · 风险等级 · 复核工单",
  },
];

export const PROCESS_STEPS = [
  {
    id: "sign",
    title: "线下洽谈签约",
    desc: "确认服务范围与调用额度，完成合同签署。",
    hint: "Contract",
  },
  {
    id: "open",
    title: "运营开通账号",
    desc: "开通企业租户、登录账号及产品权限。",
    hint: "Provision",
  },
  {
    id: "use",
    title: "平台使用与对接",
    desc: "登录版权技术服务平台使用 WebUI，或按文档接入 API。",
    hint: "Connect",
  },
  {
    id: "bill",
    title: "按次计量结算",
    desc: "调用自动记流水扣额度，续费由合同约定处理。",
    hint: "Metering",
  },
] as const;

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
          "本平台为企业客户提供版权数据与智能辅助审核能力。账号需在线下完成合同签署后，由运营人员开通。",
          "开通后您将收到登录用户名与初始密码，首次登录建议立即修改密码。门户不提供自助注册。",
        ],
      },
      {
        id: "console",
        title: "进入版权技术服务平台",
        body: [
          "登录成功后，导航栏将出现「版权技术服务平台」入口，点击即可进入版权技术服务平台。",
          "版权技术服务平台可查看额度、调用流水、API 文档，并对已开通且支持 WebUI 的产品进行在线操作。",
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
        title: "版权核验服务指南",
        body: [
          "版权核验服务包含 DCI核验、版权信息核验、版权证书核验。在版权技术服务平台选择已开通产品，按提示提交后同步返回结果。",
          "若通过 API 对接，请在文档中获取对应产品路径、鉴权方式与错误码说明。",
        ],
      },
      {
        id: "audit-guide",
        title: "智能辅助审核服务指南",
        body: [
          "智能辅助审核服务包含内容安全审核、作品登记查重、疑似侵权审核，支持 WebUI 提交或开放 API 接入。",
          "返回结果包含风险提示与结构化字段，便于业务侧落库与人工复核。",
        ],
      },
      {
        id: "api-key",
        title: "API Key 管理",
        body: [
          "在版权技术服务平台创建 API Key，完整密钥仅在创建时展示一次，请妥善保存。",
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
