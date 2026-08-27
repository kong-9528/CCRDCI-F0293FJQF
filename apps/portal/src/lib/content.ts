export const PLATFORM_NAME = "DCI®技术服务中心";

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
    lead: "覆盖 DCI 核验、版权登记信息核验与版权登记证书核验，支撑业务接入、交易确权与合规审查。",
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
    title: "版权登记信息核验",
    desc: "核验作品相关版权基础信息，核对权利归属与关键字段，降低业务侧信息不对称风险。",
    visual: "作品信息 · 权利核对 · 结果回传",
  },
  {
    id: "certificate",
    title: "版权登记证书核验",
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

/** 帮助中心：左侧树（目录可展开；文章可为根节点或挂在目录下） */
export type HelpGuideNode =
  | {
      type: "folder";
      id: string;
      title: string;
      children: HelpGuideNode[];
    }
  | {
      type: "article";
      id: string;
      title: string;
      /** 富文本 HTML，单篇独立展示 */
      html: string;
    };

export type HelpFaqItem = {
  id: string;
  question: string;
  answerHtml: string;
};

export const HELP_GUIDE: HelpGuideNode[] = [
  {
    type: "article",
    id: "overview",
    title: "平台概览",
    html: `
      <p>${PLATFORM_NAME}面向企业客户，提供<strong>版权核验服务</strong>与<strong>智能辅助审核服务</strong>，支持 WebUI 与开放 API，按调用次数计量。</p>
      <p>门户不提供自助注册，请联系商务完成线下签约后使用。</p>
    `,
  },
  {
    type: "folder",
    id: "folder-account",
    title: "账号与登录",
    children: [
      {
        type: "article",
        id: "account",
        title: "账号开通说明",
        html: `
          <p>本平台为企业客户提供<strong>版权核验服务</strong>与<strong>智能辅助审核服务</strong>。账号需在线下完成合同签署后开通。</p>
          <p>开通后您将收到登录用户名与初始密码，首次登录建议立即修改密码。门户<strong>不提供自助注册</strong>。</p>
          <ul>
            <li>签约完成后开通企业租户与登录账号</li>
            <li>产品权限与调用额度按合同在后台配置</li>
            <li>如需加额度或续期，请联系客户经理</li>
          </ul>
        `,
      },
      {
        type: "article",
        id: "console",
        title: `进入${PLATFORM_NAME}`,
        html: `
          <p>登录成功后，导航栏将出现「${PLATFORM_NAME}」入口，点击即可进入客户工作台。</p>
          <figure class="p-help__figure" role="img" aria-label="登录后导航栏出现平台入口示意">登录后导航栏出现平台入口示意</figure>
          <p>在平台中可查看额度、调用流水、API 文档，并对已开通且支持 WebUI 的产品进行在线操作。</p>
        `,
      },
    ],
  },
  {
    type: "folder",
    id: "folder-products",
    title: "产品使用",
    children: [
      {
        type: "article",
        id: "verify-guide",
        title: "版权核验服务指南",
        html: `
          <p>版权核验服务包含以下产品：</p>
          <ul>
            <li><strong>DCI核验</strong></li>
            <li><strong>版权登记信息核验</strong></li>
            <li><strong>版权登记证书核验</strong></li>
          </ul>
          <p>在${PLATFORM_NAME}选择已开通产品，按提示提交后<strong>同步返回结果</strong>。</p>
          <p>若通过 API 对接，请在文档中获取对应产品路径、鉴权方式与错误码说明。</p>
        `,
      },
      {
        type: "article",
        id: "audit-guide",
        title: "智能辅助审核服务指南",
        html: `
          <p>智能辅助审核服务包含以下产品：</p>
          <ul>
            <li><strong>内容安全审核</strong></li>
            <li><strong>作品登记查重</strong></li>
            <li><strong>疑似侵权审核</strong></li>
          </ul>
          <p>支持 WebUI 提交或开放 API 接入。返回结果包含风险提示与结构化字段，便于业务侧落库与人工复核。</p>
        `,
      },
      {
        type: "article",
        id: "api-key",
        title: "API Key 管理",
        html: `
          <p>在${PLATFORM_NAME}创建 API Key，<strong>完整密钥仅在创建时展示一次</strong>，请妥善保存。</p>
          <ol>
            <li>进入平台后打开密钥管理</li>
            <li>创建密钥并立即复制保存</li>
            <li>可随时吊销；吊销后立即失效，请同步更新业务系统配置</li>
          </ol>
        `,
      },
    ],
  },
];

export const HELP_FAQ: HelpFaqItem[] = [
  {
    id: "faq-register",
    question: "如何注册账号？",
    answerHtml: `<p>平台不提供自助注册。请联系商务完成线下签约后开通企业账号。</p>`,
  },
  {
    id: "faq-quota",
    question: "额度不足怎么办？",
    answerHtml: `<p>调用将返回额度不足提示。请联系客户经理按合同约定追加额度，运营在后台完成加额后即可继续使用。</p>`,
  },
  {
    id: "faq-password",
    question: "忘记密码如何找回？",
    answerHtml: `<p>在登录弹窗点击「忘记密码」，进入找回流程。系统将向账号绑定邮箱发送验证码以校验身份。</p>`,
  },
  {
    id: "faq-products",
    question: "两类服务分别包含哪些产品？",
    answerHtml: `
      <p><strong>版权核验服务：</strong>DCI核验、版权登记信息核验、版权登记证书核验。</p>
      <p><strong>智能辅助审核服务：</strong>内容安全审核、作品登记查重、疑似侵权审核。</p>
    `,
  },
];

export function findHelpArticle(
  nodes: HelpGuideNode[],
  id: string,
): Extract<HelpGuideNode, { type: "article" }> | null {
  for (const node of nodes) {
    if (node.type === "article" && node.id === id) return node;
    if (node.type === "folder") {
      const found = findHelpArticle(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function firstHelpArticleId(nodes: HelpGuideNode[]): string | null {
  for (const node of nodes) {
    if (node.type === "article") return node.id;
    if (node.type === "folder") {
      const id = firstHelpArticleId(node.children);
      if (id) return id;
    }
  }
  return null;
}

export const CONTACT_INFO = {
  phone: "400-000-0000",
  email: "business@copyright-tech.example",
  address: "请通过电话或邮件留资，商务将在 1 个工作日内联系您",
};
