export const PLATFORM_NAME = "DCI®技术服务中心";

export const HERO_SLIDES = [
  {
    id: "trust",
    title: "以可信数据能力",
    highlight: "护航版权经营",
    lead: "面向内容平台与版权机构，提供版权核验、智能辅助审核与开放 API，让每一次确权与用权都可追溯、可计量。",
  },
  {
    id: "verify",
    title: "版权核验",
    highlight: "权威可溯",
    lead: "覆盖 DCI 核验、版权登记信息核验与版权登记证书核验，支撑业务接入、交易确权与合规审查。",
  },
  {
    id: "audit",
    title: "智能辅助审核",
    highlight: "提效合规",
    lead: "涵盖内容安全审核、作品登记查重与疑似侵权审核，辅助缩短人工审核链路。",
  },
];

export type HomeProduct = {
  id: string;
  title: string;
  desc: string;
};

export type HomeProductSection = {
  id: string;
  heading: string;
  lead: string;
  products: HomeProduct[];
};

export const VERIFY_SECTION: HomeProductSection = {
  id: "verify",
  heading: "版权核验",
  lead: "连接权威登记数据，以下三项产品可独立或组合调用，帮助您在业务接入、交易确权与合规审查中快速确认权利信息。",
  products: [
    {
      id: "dci",
      title: "DCI核验",
      desc: "通过 DCI 编码，结合作品名称与著作权人信息，核验 DCI 码是否存在，以及与作品、著作权人是否一致。",
    },
    {
      id: "info",
      title: "版权登记信息核验",
      desc: "通过版权登记号、作品名称与著作权人信息，核验登记号是否存在、登记类型（软件或作品），以及与软件名称/作品名称、著作权人是否一致。",
    },
    {
      id: "certificate",
      title: "版权登记证书核验",
      desc: "上传版权证书文件或图片，核验该证书是否真实准确，支持业务侧快速验真与留档。",
    },
  ],
};

export type VerifyHighlight = {
  title: string;
  desc: string;
};

export type VerifyProductDetail = {
  id: string;
  title: string;
  summary: string;
  intro: string;
  scenarios: string[];
  inputs: string[];
  outputs: string[];
};

export type VerifyPageContent = {
  hero: {
    title: string;
    highlight: string;
    lead: string;
  };
  overview: {
    title: string;
    paragraphs: string[];
    highlights: VerifyHighlight[];
  };
  products: VerifyProductDetail[];
  useCases: VerifyHighlight[];
  cta: {
    title: string;
    desc: string;
  };
};

export const VERIFY_PAGE: VerifyPageContent = {
  hero: {
    title: "版权核验",
    highlight: "权威可溯 · 一秒验真",
    lead: "连接国家级版权登记与 DCI 权威数据，在业务接入、交易确权与合规审查的关键节点，帮您快速确认「权利是否真实、信息是否一致、凭证是否有效」。",
  },
  overview: {
    title: "为什么需要版权核验",
    paragraphs: [
      "在内容平台接入、版权交易撮合与合规审查的日常工作中，合作方提供的 DCI 编码、登记号或证书扫描件，往往是判断「能不能用、敢不敢用」的第一手依据。但这些信息是否真实存在？是否与所述作品、著作权人完全一致？单靠人工核对，既耗时又难以规模化。",
      "版权核验服务正是为此而设计：三项产品可独立调用，也可组合印证——从 DCI 编码到登记信息，再到证书原件，层层递进，让每一次确权与用权都有据可查、有链可溯。",
    ],
    highlights: [
      {
        title: "权威数据源",
        desc: "对接版权登记与 DCI 体系，核验结果可追溯到权威登记记录。",
      },
      {
        title: "多维交叉验证",
        desc: "编码、登记号、证书三条路径可组合使用，相互印证，降低信息不对称风险。",
      },
      {
        title: "同步结构化回传",
        desc: "WebUI 与 API 同步返回结构化结果，便于业务系统落库、留档与自动化决策。",
      },
    ],
  },
  products: [
    {
      id: "dci",
      title: "DCI核验",
      summary:
        "通过 DCI 编码，结合作品名称与著作权人信息，核验 DCI 码是否存在，以及与作品、著作权人是否一致。",
      intro:
        "DCI（Digital Copyright Identifier，数字版权标识）是作品的「数字身份码」。在 UGC 平台创作者确权、版权交易撮合、渠道内容审核等场景中，合作方常提交 DCI 编码作为权利凭证——但编码是否真实有效？是否与所述作品名称、著作权人信息一致？任何一环对不上，都可能埋下侵权或纠纷隐患。DCI 核验产品即针对这一痛点：您提交编码与关键字段，系统在权威数据源中实时比对，同步返回是否存在、是否一致的明确结论。",
      scenarios: [
        "内容平台创作者 / UP 主接入前的权属确认",
        "版权交易、授权洽谈前的权利真实性校验",
        "批量 API 接入场景下的自动化权属筛查",
      ],
      inputs: ["DCI 编码", "作品名称", "著作权人信息"],
      outputs: ["DCI 码是否存在", "与作品名称是否一致", "与著作权人是否一致", "登记摘要信息"],
    },
    {
      id: "info",
      title: "版权登记信息核验",
      summary:
        "通过版权登记号、作品名称与著作权人信息，核验登记号是否存在、登记类型（软件或作品），以及与软件名称/作品名称、著作权人是否一致。",
      intro:
        "著作权登记号是权利存在的核心索引——无论是软件著作权还是作品著作权，登记号背后都对应着一套经官方审核的权利记录。然而在实务中，登记号被误填、冒用，或作品名称、著作权人与登记簿记载不一致的情况并不罕见。版权登记信息核验产品，让您通过登记号主动「问一问」：这条登记是否真实存在？是软件还是作品？名称与著作权人是否与登记簿一致？一次调用，即可为合规审查与合同尽调提供清晰依据。",
      scenarios: [
        "企业合规审查与知识产权尽职调查",
        "软件上架、应用商店权属材料核对",
        "合同签约、授权许可前的权利信息确认",
      ],
      inputs: ["版权登记号", "作品名称", "著作权人信息"],
      outputs: [
        "登记号是否存在",
        "登记类型（软件 / 作品）",
        "与软件名称 / 作品名称是否一致",
        "与著作权人是否一致",
      ],
    },
    {
      id: "certificate",
      title: "版权登记证书核验",
      summary: "上传版权证书文件或图片，核验该证书是否真实准确，支持业务侧快速验真与留档。",
      intro:
        "在线下授权、司法举证与档案电子化等场景中，纸质或电子证书仍是最常见、也最具「说服力」的权利证明文件。但伪造、变造证书的风险始终存在——版式相似、章印逼真，肉眼难以分辨。版权登记证书核验产品支持上传证书 PDF 或图片，系统在权威数据层面对证书真伪及记载内容进行核验，帮助审核人员从「凭经验看」升级为「有依据判」，大幅缩短验真周期，并为后续留档提供结构化记录。",
      scenarios: [
        "线下授权、许可协议审核中的证书验真",
        "司法、仲裁相关材料的真伪辅助判断",
        "内部档案电子化过程中的批量证书核检",
      ],
      inputs: ["版权证书 PDF 文件", "版权证书图片"],
      outputs: ["证书是否真实有效", "证书记载内容解析", "验真结论与关键字段"],
    },
  ],
  useCases: [
    {
      title: "内容平台接入审核",
      desc: "在用户上传、创作者入驻、内容分发前，批量或单笔核验权利凭证，降低平台侵权风险。",
    },
    {
      title: "版权交易与授权",
      desc: "在交易撮合、许可谈判环节，快速确认卖方权利真实性，为定价与合同条款提供可信底座。",
    },
    {
      title: "合规与风控审查",
      desc: "为企业内控、法务尽调、监管报送等场景提供可留痕、可复现的核验记录与结构化结果。",
    },
  ],
  cta: {
    title: "准备接入版权核验服务？",
    desc: "平台为企业客户提供线下签约开通，支持 WebUI 在线调用与开放 API 对接。查看接入指南了解鉴权、联调与额度说明。",
  },
};

export const AUDIT_SECTION: HomeProductSection = {
  id: "audit",
  heading: "智能辅助审核",
  lead: "面向内容运营与登记审核场景，以下三项产品提供智能辅助研判能力，帮助缩短人工审核链路、提升处置效率。",
  products: [
    {
      id: "safety",
      title: "内容安全审核",
      desc: "对作品全部登记申请材料进行色情、暴恐、政治敏感等内容安全风险判定参考。",
    },
    {
      id: "duplicate",
      title: "作品登记查重",
      desc: "对作品登记的样本与已登记样本进行对比，识别高度雷同样本。",
    },
    {
      id: "infringement",
      title: "疑似侵权审核",
      desc: "对登记作品样本进行肖像/人声识别，知名人物/商标/作品识别，疑似侵权作品识别。",
    },
  ],
};

export const AUDIT_PAGE: VerifyPageContent = {
  hero: {
    title: "智能辅助审核",
    highlight: "提效合规 · 智能研判",
    lead: "面向作品登记与内容审核场景，在受理、审查与风控环节提供 AI 辅助研判能力——让审核人员从重复劳动中解放，把精力集中在关键决策上。",
  },
  overview: {
    title: "为什么需要智能辅助审核",
    paragraphs: [
      "作品著作权登记受理过程中，审核人员需要面对海量申请材料：既要排查内容安全风险，又要识别重复登记与疑似侵权情形。传统纯人工模式效率有限，且不同审核员的标准与经验难以完全统一，容易出现漏判、误判或审核周期过长的问题。",
      "智能辅助审核服务正是为登记审核链路而设计：三项产品可独立调用，也可组合使用——从内容安全筛查，到样本查重比对，再到肖像、人声与知名要素识别，层层辅助、人机协同，显著缩短审核周期，提升处置一致性与可追溯性。",
    ],
    highlights: [
      {
        title: "全链路辅助",
        desc: "覆盖登记申请材料的安全筛查、查重比对与侵权研判，贯穿受理审核主要环节。",
      },
      {
        title: "多维智能识别",
        desc: "融合内容理解、相似度分析与知名人物/商标/作品识别，提供多维度参考结论。",
      },
      {
        title: "人机协同决策",
        desc: "系统输出结构化风险标签与研判摘要，最终结论由人工复核确认，兼顾效率与合规。",
      },
    ],
  },
  products: [
    {
      id: "safety",
      title: "内容安全审核",
      summary:
        "对作品全部登记申请材料进行色情、暴恐、政治敏感等内容安全风险判定参考。",
      intro:
        "登记申请材料往往包含文字说明、作品样本、附图乃至音视频片段——内容形态多样，人工逐份浏览不仅耗时，也易受主观因素影响。内容安全审核产品针对登记材料的「内容合规性」提供智能辅助：系统对全部登记申请材料进行扫描与分析，识别色情、暴恐、政治敏感等风险要素，并给出安全风险等级与命中类型标签，作为审核人员的判定参考，帮助在受理环节前置拦截明显违规内容。",
      scenarios: [
        "作品登记受理前的申请材料合规预审",
        "批量登记案件的内容安全风险筛查",
        "人工复核前的风险标签预分拣与优先级排序",
      ],
      inputs: ["登记申请材料（文本、图片等）", "作品样本附件", "补充说明材料"],
      outputs: ["内容安全风险等级", "命中风险类型标签", "判定参考说明"],
    },
    {
      id: "duplicate",
      title: "作品登记查重",
      summary: "对作品登记的样本与已登记样本进行对比，识别高度雷同样本。",
      intro:
        "重复登记、高度相似登记是登记审核中的常见难点——同一作品或实质相似作品被多次提交，既占用审核资源，也可能引发后续权利冲突。作品登记查重产品将待登记样本与已登记样本库进行智能比对，计算相似度并识别高度雷同样本，为审核人员提供「是否重复」的客观参考，支撑登记前风控与重复案件快速分流。",
      scenarios: [
        "登记受理环节的重复登记识别",
        "高度相似作品的预警与人工复核触发",
        "批量案件中的雷同样本自动分拣",
      ],
      inputs: ["待登记作品样本", "作品类型信息"],
      outputs: ["与已登记样本相似度", "命中样本摘要信息", "高度雷同样本识别结论"],
    },
    {
      id: "infringement",
      title: "疑似侵权审核",
      summary:
        "对登记作品样本进行肖像/人声识别，知名人物/商标/作品识别，疑似侵权作品识别。",
      intro:
        "登记作品中涉及他人肖像、人声，或使用知名人物、商标、已有作品等要素的情形并不罕见——若未获授权，可能构成侵权，需要在审核阶段予以关注。疑似侵权审核产品对登记作品样本进行多模态智能分析：识别肖像与人声特征，比对知名人物、商标与已有作品库，标记疑似侵权要素并给出风险研判结论，帮助审核人员快速定位高风险案件，缩短排查周期。",
      scenarios: [
        "涉及肖像权、声音权的高风险案件识别",
        "知名商标、 logo 或经典作品要素的撞库比对",
        "疑似侵权作品的辅助研判与复核工单分流",
      ],
      inputs: ["登记作品样本", "作品类型与元数据"],
      outputs: [
        "肖像 / 人声识别结果",
        "知名人物 / 商标 / 作品命中情况",
        "疑似侵权研判结论与风险等级",
      ],
    },
  ],
  useCases: [
    {
      title: "作品登记受理审核",
      desc: "在登记受理环节对申请材料进行安全、查重与侵权多维辅助审查，提升整体吞吐与一致性。",
    },
    {
      title: "登记材料合规筛查",
      desc: "对批量申请材料进行内容安全风险预筛，优先处理高风险案件，降低违规内容流入后续环节。",
    },
    {
      title: "侵权风险前置识别",
      desc: "在正式发证前识别涉及肖像、知名要素的疑似侵权情形，为人工复核提供线索与依据。",
    },
  ],
  cta: {
    title: "准备接入智能辅助审核服务？",
    desc: "平台为企业客户提供线下签约开通，支持开放 API 对接。查看接入指南了解鉴权、联调与额度说明。",
  },
};

export type AnalyticsReportItem = {
  id: string;
  title: string;
  cadence: string;
  desc: string;
  topics: string[];
};

export type AnalyticsDimensionItem = {
  id: string;
  title: string;
  summary: string;
  intro: string;
  metrics: string[];
  capabilities: string[];
  relatedHref?: string;
  relatedLabel?: string;
};

export type AnalyticsSubscriptionContact = {
  role: string;
  desc: string;
  phone: string;
  email: string;
  hours: string;
};

export type AnalyticsPageContent = {
  hero: {
    title: string;
    highlight: string;
    lead: string;
  };
  overview: {
    title: string;
    paragraphs: string[];
    highlights: VerifyHighlight[];
  };
  reports: {
    title: string;
    lead: string;
    items: AnalyticsReportItem[];
  };
  dimensions: {
    title: string;
    lead: string;
    items: AnalyticsDimensionItem[];
  };
  useCases: VerifyHighlight[];
  subscription: {
    title: string;
    desc: string;
    note: string;
    contacts: AnalyticsSubscriptionContact[];
  };
};

export const ANALYTICS_PAGE: AnalyticsPageContent = {
  hero: {
    title: "行业分析报告",
    highlight: "洞察行业 · 驱动决策",
    lead: "汇聚版权登记、查询、核验与智能审核全链路数据，定期输出行业专题、年度与月度报告——让趋势可见、风险可预警、决策有依据。",
  },
  overview: {
    title: "为什么需要行业分析报告",
    paragraphs: [
      "版权行业的日常运转涉及大量登记、查询、核验与审核行为：个人与机构提交软件或作品登记申请，权利人查询登记状态，业务方调用核验接口确认权利真伪，登记机构借助智能辅助审核提升审查效率。这些行为沉淀为海量结构化数据，却长期缺乏面向行业视角的系统化梳理与发布。",
      "行业分析报告正是为此而设：围绕平台服务能力与版权领域关键指标，定期输出行业专题报告、年度报告与月度报告，从登记趋势、查询热点到核验与审核风险分布，帮助版权机构、内容平台与研究机构把握行业脉搏，支撑战略规划、产品优化与合规风控。",
    ],
    highlights: [
      {
        title: "全链路数据视角",
        desc: "覆盖登记、查询、核验与智能审核四大业务维度，形成贯通版权生态的行业报告分析框架。",
      },
      {
        title: "多周期报告体系",
        desc: "行业专题、年度回顾与月度追踪相结合，满足不同决策节奏下的信息需求。",
      },
      {
        title: "可订阅定制服务",
        desc: "支持按机构需求订阅标准报告或洽谈定制报告方案，线下对接专属业务咨询。",
      },
    ],
  },
  reports: {
    title: "报告体系",
    lead: "三类行业分析报告覆盖不同时间粒度与专题深度，持续更新版权领域关键洞察。",
    items: [
      {
        id: "topic",
        title: "行业专题报告",
        cadence: "不定期发布",
        desc: "聚焦版权领域特定议题或细分赛道，进行深度专题研究。例如软件著作权登记结构变化、视听作品登记热点、文字作品类型分布、区域登记活跃度对比等——帮助读者在某一垂直方向上获得系统性认知。",
        topics: [
          "软件著作权登记结构与趋势",
          "作品著作权类型分布与热点",
          "区域登记活跃度对比",
          "新兴内容形态登记观察",
        ],
      },
      {
        id: "annual",
        title: "年度报告",
        cadence: "每年发布",
        desc: "对全年版权登记、查询、核验与智能审核数据进行全景回顾与综合解读。总结年度总量与增速、结构变化、风险特征与行业亮点，为机构年度规划、政策研究与市场研判提供权威参考。",
        topics: [
          "全年登记总量与类型结构",
          "查询与核验服务调用概览",
          "智能审核风险分布年度回顾",
          "行业趋势研判与展望",
        ],
      },
      {
        id: "monthly",
        title: "月度报告",
        cadence: "每月发布",
        desc: "以月为周期追踪版权领域核心指标波动，及时反映登记量变化、查询热点迁移、核验调用趋势及审核风险信号。适合需要快速掌握近期动态、及时调整业务策略的机构与用户。",
        topics: [
          "月度登记量与环比变化",
          "登记查询热点追踪",
          "核验服务调用趋势",
          "审核风险信号月度速览",
        ],
      },
    ],
  },
  dimensions: {
    title: "四大分析维度",
    lead: "行业分析报告从用户与机构在版权全生命周期中的核心诉求出发，构建可分析、可对比、可追踪的数据指标体系。",
    items: [
      {
        id: "registration",
        title: "版权登记分析",
        summary: "围绕个人与机构提交软件、作品等著作权登记的行为数据，洞察登记趋势与结构特征。",
        intro:
          "著作权登记是权利确认的起点。无论是软件著作权还是作品著作权，登记申请的时间分布、类型构成、主体特征与区域分布，都折射出版权市场的活跃方向。本维度对登记全量数据进行统计与挖掘，帮助登记机构优化受理资源配置，也为行业研究提供一手素材。",
        metrics: [
          "登记申请量趋势（日 / 月 / 年）",
          "软件 vs 作品登记占比",
          "作品类型分布（文字、美术、视听等）",
          "登记主体类型与区域分布",
        ],
        capabilities: [
          "软件著作权登记趋势分析",
          "作品著作权登记结构分析",
          "登记高峰时段与季节性特征",
          "重点类型作品登记增速追踪",
        ],
      },
      {
        id: "query",
        title: "登记查询分析",
        summary: "分析用户查询版权登记情况的行为数据，识别查询热点与权利关注方向。",
        intro:
          "登记信息的公开查询是权利人、合作方与研究机构了解作品权利状态的重要通道。查询频次、查询类型、热点登记号与关注作品类型，能够反映市场对哪些权利领域最为敏感。本维度对查询行为进行聚合分析，为登记信息公开策略与行业关注热点研判提供参考。",
        metrics: [
          "登记查询总量与趋势",
          "查询类型分布（按登记号 / 作品名等）",
          "高频查询作品类型",
          "机构 vs 个人查询行为对比",
        ],
        capabilities: [
          "登记状态查询热度排行",
          "查询高峰与业务周期关联",
          "重点作品类型查询追踪",
          "查询失败 / 未命中原因分布",
        ],
      },
      {
        id: "verify",
        title: "版权核验分析",
        summary: "基于 DCI 核验、登记信息核验与证书核验三类服务的调用数据，分析核验需求与验真特征。",
        intro:
          "在业务接入、交易确权与合规审查环节，机构与用户日益依赖核验服务确认权利真伪。本维度对三项核验产品的调用量、命中率、不一致类型与行业分布进行统计，揭示「谁在验、验什么、验出了什么」——为产品优化与风控策略提供数据支撑。",
        metrics: [
          "三项核验产品调用量对比",
          "核验命中率与不一致类型分布",
          "DCI / 登记号 / 证书核验趋势",
          "行业 / 机构调用排行（脱敏）",
        ],
        capabilities: ["DCI 核验调用与命中分析", "版权登记信息核验趋势", "版权登记证书验真分析"],
        relatedHref: "/verify",
        relatedLabel: "了解版权核验能力",
      },
      {
        id: "audit",
        title: "智能辅助审核分析",
        summary: "基于内容安全审核、作品登记查重与疑似侵权审核三类能力的数据，刻画审核风险全景。",
        intro:
          "登记审核环节产生的风险信号——内容安全命中、高度雷同样本、疑似侵权要素——是行业合规态势的重要晴雨表。本维度对三项智能辅助审核产品的处理量、风险等级分布、命中类型与处置趋势进行汇总分析，帮助登记机构把握审核压力与风险结构，也为内容平台了解行业侵权与合规热点提供参考。",
        metrics: [
          "三项审核产品处理量与趋势",
          "内容安全风险等级分布",
          "查重高度雷同比例变化",
          "疑似侵权命中类型统计",
        ],
        capabilities: ["内容安全审核风险分布", "作品登记查重雷同分析", "疑似侵权要素命中追踪"],
        relatedHref: "/audit",
        relatedLabel: "了解智能辅助审核能力",
      },
    ],
  },
  useCases: [
    {
      title: "版权机构决策支持",
      desc: "为登记中心、版权保护机构提供登记趋势、审核风险与行业热点报告，支撑资源配置与政策研究。",
    },
    {
      title: "内容平台战略规划",
      desc: "通过月度与专题报告了解权利登记与核验需求变化，指导产品接入、风控规则与创作者运营策略。",
    },
    {
      title: "研究与咨询引用",
      desc: "为高校、智库与咨询机构提供可引用的行业分析报告与趋势解读，降低独立采集与清洗成本。",
    },
  ],
  subscription: {
    title: "订阅行业分析报告",
    desc: "平台目前提供线下订阅与商务接洽方式。如需获取行业专题报告、年度报告、月度报告，或洽谈定制行业分析报告方案，请通过以下业务咨询渠道与我们取得联系。",
    note: "订阅范围、交付周期与定制需求将在接洽过程中由专属业务人员为您说明并确认。",
    contacts: [
      {
        role: "业务咨询",
        desc: "负责行业分析报告订阅、数据服务合作与定制报告需求的接洽与方案沟通。",
        phone: "010-83771600（总机）",
        email: "business@copyright-tech.example",
        hours: "工作日 9:00 – 17:30",
      },
    ],
  },
};

/** @deprecated 保留旧结构别名，供运营内容管理等场景对齐字段 */
export const VERIFY_THEMES = VERIFY_SECTION.products.map((p) => ({
  id: p.id,
  title: p.title,
  desc: p.desc,
  visual: "",
}));

/** @deprecated 保留旧结构别名，供运营内容管理等场景对齐字段 */
export const AUDIT_THEMES = AUDIT_SECTION.products.map((p) => ({
  id: p.id,
  title: p.title,
  desc: p.desc,
  visual: "",
}));

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

export const INTEGRATION_GUIDE: HelpGuideNode[] = [
  {
    type: "article",
    id: "integration-overview",
    title: "接入概览",
    html: `
      <p>${PLATFORM_NAME}面向企业客户提供<strong>版权核验服务</strong>与<strong>智能辅助审核服务</strong>，支持 WebUI 在线调用与开放 API 接入，按调用次数计量。</p>
      <p>典型接入路径如下：</p>
      <ol>
        <li>线下完成商务签约与账号开通</li>
        <li>登录客户工作台，确认已开通产品与调用额度</li>
        <li>获取 API 文档与密钥（如需 API 对接）</li>
        <li>按产品说明完成联调，上线生产调用</li>
      </ol>
      <p>门户不提供自助注册；如需开通或追加产品，请联系商务。</p>
    `,
  },
  {
    type: "folder",
    id: "folder-onboarding",
    title: "开通与准备",
    children: [
      {
        type: "article",
        id: "contract",
        title: "签约开通流程",
        html: `
          <p>企业客户需先完成线下合同签署，运营侧将为您开通租户账号并配置产品权限。</p>
          <ul>
            <li>提交企业资质与联系人信息</li>
            <li>确认接入产品与预估调用量</li>
            <li>签约完成后 1–3 个工作日内开通账号</li>
            <li>收到用户名、初始密码及已开通产品清单</li>
          </ul>
          <p>首次登录后建议立即修改密码，并在工作台核对产品与额度配置是否与合同一致。</p>
        `,
      },
      {
        type: "article",
        id: "environment",
        title: "环境与网络要求",
        html: `
          <p>API 接入需满足以下基本要求：</p>
          <ul>
            <li>服务端可访问 HTTPS 公网接口（TLS 1.2 及以上）</li>
            <li>请求超时建议不低于 30 秒（证书核验等场景可能耗时较长）</li>
            <li>上传类接口需支持 multipart/form-data</li>
            <li>建议业务侧实现幂等与重试，并记录请求流水便于排查</li>
          </ul>
          <p>如需 IP 白名单或专线接入，请在签约阶段与商务确认。</p>
        `,
      },
    ],
  },
  {
    type: "folder",
    id: "folder-api",
    title: "API 接入",
    children: [
      {
        type: "article",
        id: "auth",
        title: "鉴权方式",
        html: `
          <p>开放 API 采用 <strong>API Key</strong> 鉴权。每次请求需在 Header 中携带：</p>
          <pre><code>Authorization: Bearer &lt;您的 API Key&gt;</code></pre>
          <p>密钥与客户租户绑定，仅可调用该租户已开通且状态有效的产品。密钥泄露请立即在工作台吊销并重新创建。</p>
        `,
      },
      {
        type: "article",
        id: "request-spec",
        title: "请求规范",
        html: `
          <p>通用约定：</p>
          <ul>
            <li>Base URL 与接口路径以工作台「API 文档」为准</li>
            <li>请求与响应均为 JSON（文件上传接口除外）</li>
            <li>统一返回 <code>code</code>、<code>message</code>、<code>data</code> 结构</li>
            <li><code>code = 0</code> 表示成功，非 0 为业务或系统错误</li>
          </ul>
          <p>调用前请确认当前产品额度充足；额度不足时将返回明确错误码，不会部分扣费。</p>
        `,
      },
      {
        type: "article",
        id: "api-key",
        title: "API Key 管理",
        html: `
          <p>在${PLATFORM_NAME}工作台进入「密钥管理」：</p>
          <ol>
            <li>点击创建密钥，<strong>完整 Key 仅展示一次</strong>，请立即复制保存</li>
            <li>为不同环境（测试/生产）建议使用独立密钥</li>
            <li>人员变动或疑似泄露时，先创建新密钥并完成切换，再吊销旧密钥</li>
          </ol>
          <p>吊销后旧密钥即时失效，请同步更新业务系统配置，避免生产中断。</p>
        `,
      },
    ],
  },
  {
    type: "folder",
    id: "folder-verify",
    title: "版权核验服务接入",
    children: [
      {
        type: "article",
        id: "dci-api",
        title: "DCI核验",
        html: `
          <p>提交 DCI 编码、作品名称与著作权人信息，核验 DCI 码是否存在及与作品、著作权人是否一致。</p>
          <p><strong>主要参数：</strong>DCI 编码、作品名称、著作权人（名称或证件信息，以文档为准）</p>
          <p><strong>返回要点：</strong>是否存在、是否一致、登记摘要信息等。适用于交易确权、内容分发前校验等场景。</p>
        `,
      },
      {
        type: "article",
        id: "info-api",
        title: "版权登记信息核验",
        html: `
          <p>提交版权登记号、作品名称与著作权人信息，核验登记是否存在、类型（软件/作品）及字段是否一致。</p>
          <p><strong>主要参数：</strong>登记号、作品/软件名称、著作权人信息</p>
          <p><strong>返回要点：</strong>登记状态、作品类型、名称与著作权人匹配结果。适用于合规审查与权属核对。</p>
        `,
      },
      {
        type: "article",
        id: "cert-api",
        title: "版权登记证书核验",
        html: `
          <p>上传版权证书 PDF 或图片，核验证书真伪及记载内容是否准确。</p>
          <p><strong>主要参数：</strong>证书文件（支持常见图片格式与 PDF）</p>
          <p><strong>返回要点：</strong>验真结果、证书关键字段解析。建议单文件大小不超过文档限制，批量场景可分批调用。</p>
        `,
      },
    ],
  },
  {
    type: "folder",
    id: "folder-audit",
    title: "智能辅助审核服务接入",
    children: [
      {
        type: "article",
        id: "safety-api",
        title: "内容安全审核",
        html: `
          <p>提交文本、图片或视频等内容，获取违规与高风险标签及处置建议。</p>
          <p>按媒体类型调用对应子接口；返回结构化风险等级与命中规则摘要，便于运营复核与自动拦截策略配置。</p>
        `,
      },
      {
        type: "article",
        id: "duplicate-api",
        title: "作品登记查重",
        html: `
          <p>提交待登记作品内容，与已登记库比对相似度，辅助登记前风控。</p>
          <p>返回相似度分值、命中作品摘要与建议结论，可与人工审核流程结合使用。</p>
        `,
      },
      {
        type: "article",
        id: "infringe-api",
        title: "疑似侵权审核",
        html: `
          <p>提交疑似侵权线索与对比材料，获取相似度分析与风险研判结果。</p>
          <p>适用于平台侵权投诉、版权监测等场景的辅助研判，最终结果建议结合人工复核。</p>
        `,
      },
    ],
  },
  {
    type: "folder",
    id: "folder-ops",
    title: "运维与排查",
    children: [
      {
        type: "article",
        id: "error-codes",
        title: "错误码与排查",
        html: `
          <p>常见错误类型：</p>
          <ul>
            <li><strong>鉴权失败</strong>：检查 Key 是否正确、是否已吊销、Header 格式</li>
            <li><strong>产品未开通</strong>：确认合同产品已在后台配置并生效</li>
            <li><strong>额度不足</strong>：联系客户经理追加额度</li>
            <li><strong>参数错误</strong>：对照 API 文档核对必填项与格式</li>
          </ul>
          <p>排查时请记录请求 ID、时间与完整错误码，便于客服与技术支持定位。</p>
        `,
      },
      {
        type: "article",
        id: "billing",
        title: "额度与计费",
        html: `
          <p>各产品按<strong>成功调用次数</strong>计量，具体单价与套餐以合同约定为准。</p>
          <p>工作台可查看剩余额度与调用流水。额度即将用尽时建议提前联系商务续期或加购，避免业务中断。</p>
        `,
      },
    ],
  },
];

/** @deprecated 使用 INTEGRATION_GUIDE */
export const HELP_GUIDE = INTEGRATION_GUIDE;

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
    answerHtml: `<p>在登录弹窗点击「忘记密码」，进入找回流程。系统将向账号绑定手机号发送短信验证码以校验身份。</p>`,
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
  address: "北京市丰台区汽车博物馆西路9号院6号楼",
  phone: "010-83771600（总机）",
  email: "business@copyright-tech.example",
};
