export const SITE_NAME = "DCI管理中心";
export const SITE_TITLE = "DCI管理中心门户系统";
export const SITE_DESC =
  "DCI门户系统是一个展示数字版权唯一标识符体系信息的Web网站，提供DCI查询、申领指引、标准说明等功能。";

export const LOGO_BLUE =
  "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260824/logo-蓝.png";
export const LOGO_WHITE =
  "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260626/Image1.png";

export type NavItem = {
  label: string;
  href: string;
  external?: boolean;
};

export const NAV_ITEMS: NavItem[] = [
  { label: "首页", href: "/" },
  { label: "DCI体系", href: "/system/" },
  { label: "DCI标准", href: "/standard/" },
  { label: "DCI注册中心", href: "/registry/" },
  { label: "DCI生态", href: "/ecology/" },
  { label: "DCI实验室", href: "/lab/" },
  { label: "DCI查询", href: "/query/" },
  { label: "常见问题", href: "/faq/" },
  { label: "联系我们", href: "/contact/" },
  { label: "DCI®技术服务中心", href: "/tech-service/" },
];

export const FOOTER = {
  title: SITE_NAME,
  description:
    "DCI管理中心是数字版权唯一标识符的管理中心，负责DCI体系的顶层设计、标准制定、全局监督与数据治理，确保DCI体系的权威性、规范性及可持续发展",
  quickLinks: [
    { label: "DCI查询", href: "/query/" },
    { label: "常见问题", href: "/faq/" },
    { label: "联系我们", href: "/contact/" },
  ],
  copyright: "中国版权保护中心",
  icp: "京ICP备XXXXXX号",
};

export const HOME_SLIDES = [
  {
    tag: "DCI DIGITAL COPYRIGHT IDENTIFIER",
    title: "DCI——\n数字版权唯一标识符",
    subtitle: "数字空间唯一“版权身份证”和“权益凭证”",
    img: "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260722/6666.jpg",
  },
  {
    tag: "DCI SYSTEMATIC INTEGRATED SOLUTION",
    title: "构建以DCI体系4.0\n为核心的版权基础设施",
    subtitle: "全球版权数据中心 · 版权可信数据基础设施",
    img: "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260722/6666.jpg",
  },
];

export const HOME_PILLARS = [
  { label: "DCI标准", href: "/standard/" },
  { label: "技术协议", href: "/standard/" },
  { label: "产品服务", href: "/system/" },
  { label: "数智基础设施", href: "/system/" },
  { label: "生态联盟", href: "/ecology/" },
];

export const HOME_ECOLOGY = [
  {
    label: "共建",
    en: "CO-CONSTRUCTED",
    desc: "与各行业版权生态伙伴共同构建DCI可信数字版权基础设施",
  },
  {
    label: "共治",
    en: "CO-GOVERNED",
    desc: "多方参与数据治理，建立权威、可信、透明的DCI治理机制",
  },
  {
    label: "共享",
    en: "SHARED",
    desc: "开放DCI数据资源，共享版权保护与价值变现的完整闭环",
  },
];

export const SYSTEM_PILLARS = [
  { label: "标准" },
  { label: "生态联盟" },
  { label: "技术协议" },
  { label: "新型数字基础设施" },
  { label: "产品服务" },
];

export const SYSTEM_HISTORY = [
  {
    period: "2011-2017",
    title: "DCI体系1.0",
    accent: "default" as const,
    points: [
      "DCI体系概念提出，完成DCI体系顶层设计",
      "DCI国家标准研制启动并正式立项",
      "构建DCI体系基础标准、标识、系统框架",
    ],
  },
  {
    period: "2018-2021",
    title: "DCI体系2.0",
    accent: "default" as const,
    points: [
      "DCI体系2.0正式发布",
      "面向内容创作传播源头部署DCI核心能力",
      "数字作品登记覆盖核心应用领域",
    ],
  },
  {
    period: "2022-2024",
    title: "DCI体系3.0",
    accent: "blue" as const,
    points: [
      "DCI体系3.0正式发布",
      "以区块链+人工智能融合技术驱动DCI体系升级",
      "联合伙伴共建DCI可信生态，夯实服务技术底座",
    ],
  },
  {
    period: "2025-",
    title: "DCI体系4.0",
    accent: "red" as const,
    badge: "最新",
    points: [
      "DCI体系4.0（全球版权数据中心）正式发布",
      "以DCI国家标准发布为契机，创新版权数据治理",
      "推进AI新技术与版权融合创新，建设全球版权数据中心",
    ],
  },
];

export const STANDARD_SCENES = [
  "终端创作场景",
  "影像交易场景",
  "电商场景",
  "短视频/直播场景",
  "音乐场景",
  "编辑工具场景",
  "社交场景",
  "剧本交易场景",
  "媒资场景",
  "在线教育场景",
  "线上维权场景",
  "律师取证场景",
  "法院司法场景",
  "诉前调解场景",
  "资产管理场景",
  "资产证券场景",
  "金融场景",
];

export const STANDARD_IMAGES = {
  intro:
    "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787638650803.png",
  system:
    "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787638913113.png",
  national:
    "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787639122278.png",
  industry:
    "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787646376291.png",
};

export const REGISTRY_PARTNERS = [
  { name: "中国标准化研究院" },
  { name: "雅昌文化" },
];

export const ECOLOGY_TYPES = [
  {
    title: "内容平台类",
    desc: "拥有海量数字内容生产、存储、传播能力的平台型机构。汇集着原创内容的提供方、内容的运营者、以及版权的终端消费者",
  },
  {
    title: "版权专业服务类",
    desc: "提供版权专业化服务、版权运营等机构。",
  },
  {
    title: "学术研究类",
    desc: "为DCI技术体系和关键标准的科研攻关提供有力支持",
  },
  {
    title: "技术支撑类",
    desc: "以自身技术方面的研发优势，将最前沿、最核心的技术与DCI体系结合",
  },
];

export const LAB_DIRECTIONS = [
  "DCI版权基础设施建设",
  "版权智能能力研发",
  "关键技术标准研制",
  "科研成果产业化应用",
];

export const LAB_CAPABILITY = {
  title: "版权智能能力研发",
  summary: "攻关版权登记智能辅助审核能力，实现“人工智能+版权登记”场景应用",
  points: [
    "研发内容风控、作品查重、疑似侵权识别等版权登记智能辅助审核能力",
    "建立“机读人审、人机协同”版权登记智能辅助审核体系",
  ],
};

export const FAQ_ITEMS = [
  {
    q: "DCI是什么？",
    a: "DCI，英文全称Digital Copyright Identifier，中文名称为数字版权唯一标识符，是数字网络环境下用于唯一标识和描述权利人对其符合作品特征的智力成果享有权益的一组字符，适用于版权创造、运用、保护、管理、服务等全生命周期的标识体系构建与数据互操作。",
  },
  {
    q: "DCI体系是什么？",
    a: "DCI体系是以DCI国家标准为引领，以标准化标识为基础手段，以AI、区块链等新技术的系统集成应用为驱动，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。DCI体系的基础核心是通过为数字网络环境下每一个版权内容与其相关权益主体间一一对应的权属关系和权益状态分配唯一的、可查验的“版权身份证”——DCI，实现从版权内容产生的源头明确权属关系、权益状态的同时，进一步支撑版权内容全网跨平台畅通流转、高效配置、价值释放和有效保护。",
  },
  {
    q: "权利人如何获得DCI？申请流程是什么？",
    a: "权利人可通过DCI申领平台提交申请材料经由DCI注册中心审核，符合要求的可获分配DCI编码，并同步至中国版权保护中心（即数字版权唯一标识符管理中心），完成DCI申领。",
  },
  {
    q: "获得DCI申领服务都需要提交哪些资料？",
    a: "权利人需要通过实名认证后，按DCI标准的元数据的要求提交相关资料。",
  },
  {
    q: "DCI申领业务都支持哪些作品？",
    a: "著作权法规定的作品都支持，包括文字作品；口述作品；音乐、戏剧、曲艺、舞蹈、杂技艺术作品；美术、建筑作品；视听作品；图形作品与模型作品；计算机软件；符合作品特征的其他智力成果（如数据集、AI生成内容（需满足独创性）等）。",
  },
];

export const TECH_SERVICES = [
  {
    title: "DCI 标识接入",
    desc: "为内容平台、专业服务机构提供 DCI 标识生成、校验与查询接口的标准化接入方案，保障数字版权标识的唯一性与可追溯。",
  },
  {
    title: "接口与文档支持",
    desc: "提供完整的接口文档、调用示例与 SDK，协助注册中心快速对接 DCI 注册、查询、存证等核心能力。",
  },
  {
    title: "技术运维保障",
    desc: "7×24 小时系统监控与故障响应，确保 DCI 服务稳定运行，提供版本升级与安全加固支持。",
  },
  {
    title: "专属技术顾问",
    desc: "配备专属技术顾问团队，提供一对一咨询、方案设计与疑难问题解答，助力业务高效落地。",
  },
];

export const TECH_CONTACT = {
  email: "tech@dci.gov.cn",
  phone: "010-8888-8888",
  address: "北京市西城区",
};

export const QUERY_EXAMPLE =
  "例如：DCI:RANTQZ010.156.2026070120989764467  《数字版权保护技术规范》";
