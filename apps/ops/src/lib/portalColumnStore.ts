import { useEffect, useState } from "react";

/** 栏目页面内容字段类型 */
export type ColumnFieldType = "text" | "textarea" | "image" | "url";

export type ColumnFieldDef = {
  key: string;
  label: string;
  type: ColumnFieldType;
  hint?: string;
  rows?: number;
};

export type ColumnSectionDef = {
  id: string;
  title: string;
  fields: ColumnFieldDef[];
};

export type PortalColumn = {
  id: string;
  /** 路由标识，对应门户 path */
  path: string;
  name: string;
  hidden: boolean;
  /** 显示顺序，越小越靠前 */
  sort: number;
  /** 页面内容：扁平 key → 值 */
  content: Record<string, string>;
};

/** 各栏目页面结构（对齐 apps/dci 门户实际版块） */
export const COLUMN_SECTION_SCHEMAS: Record<string, ColumnSectionDef[]> = {
  home: [
    {
      id: "banner1",
      title: "Banner 1（首屏轮播）",
      fields: [
        { key: "banner1_tag", label: "英文标语", type: "text" },
        { key: "banner1_title", label: "主标题", type: "textarea", rows: 2, hint: "可用换行" },
        { key: "banner1_subtitle", label: "副标题", type: "text" },
        { key: "banner1_image", label: "配图 URL", type: "image" },
      ],
    },
    {
      id: "banner2",
      title: "Banner 2（首屏轮播）",
      fields: [
        { key: "banner2_tag", label: "英文标语", type: "text" },
        { key: "banner2_title", label: "主标题", type: "textarea", rows: 2 },
        { key: "banner2_subtitle", label: "副标题", type: "text" },
        { key: "banner2_image", label: "配图 URL", type: "image" },
      ],
    },
    {
      id: "system_teaser",
      title: "板块：DCI体系导览",
      fields: [
        { key: "system_eyebrow", label: "英文眉题", type: "text" },
        { key: "system_title", label: "板块标题", type: "text" },
        { key: "system_body", label: "正文", type: "textarea", rows: 4 },
        { key: "system_link_label", label: "链接文案", type: "text" },
        { key: "system_pillars", label: "支柱标签（逗号分隔）", type: "text", hint: "如：DCI标准,技术协议,产品服务" },
      ],
    },
    {
      id: "standard_teaser",
      title: "板块：DCI标准导览",
      fields: [
        { key: "standard_eyebrow", label: "英文眉题", type: "text" },
        { key: "standard_title", label: "板块标题", type: "text" },
        { key: "standard_card_title", label: "简介卡片标题", type: "text" },
        { key: "standard_body", label: "简介正文", type: "textarea", rows: 4 },
        { key: "standard_link_label", label: "链接文案", type: "text" },
      ],
    },
    {
      id: "registry_cta",
      title: "板块：DCI注册中心 CTA",
      fields: [
        { key: "registry_eyebrow", label: "英文眉题", type: "text" },
        { key: "registry_title", label: "标题", type: "text" },
        { key: "registry_body", label: "正文", type: "textarea", rows: 3 },
        { key: "registry_cta_label", label: "按钮文案", type: "text" },
      ],
    },
    {
      id: "ecology_teaser",
      title: "板块：DCI生态",
      fields: [
        { key: "ecology_eyebrow", label: "英文眉题", type: "text" },
        { key: "ecology_title", label: "板块标题", type: "text" },
        { key: "ecology_tagline", label: "副文案", type: "text" },
        { key: "ecology_cards", label: "三卡内容（JSON：label/en/desc）", type: "textarea", rows: 6 },
        { key: "ecology_link_label", label: "链接文案", type: "text" },
      ],
    },
    {
      id: "lab_teaser",
      title: "板块：DCI实验室",
      fields: [
        { key: "lab_eyebrow", label: "英文眉题", type: "text" },
        { key: "lab_title", label: "板块标题", type: "text" },
        { key: "lab_ring", label: "环状标语", type: "text" },
        { key: "lab_link_label", label: "链接文案", type: "text" },
      ],
    },
  ],
  system: [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_title", label: "主标题", type: "textarea", rows: 2 },
        { key: "hero_subtitle", label: "副标题", type: "textarea", rows: 2 },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "intro",
      title: "板块：体系介绍",
      fields: [
        { key: "intro_p1", label: "正文段落 1", type: "textarea", rows: 4 },
        { key: "intro_p2", label: "正文段落 2", type: "textarea", rows: 4 },
        { key: "pillars", label: "支柱标签（逗号分隔）", type: "text" },
      ],
    },
    {
      id: "history",
      title: "板块：发展历程",
      fields: [
        { key: "history_title", label: "板块标题", type: "text" },
        {
          key: "history_items",
          label: "历程条目（JSON：period/title/badge/points[]）",
          type: "textarea",
          rows: 10,
        },
      ],
    },
  ],
  standard: [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_title", label: "主标题", type: "text" },
        { key: "hero_subtitle", label: "副标题", type: "textarea", rows: 3 },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "define",
      title: "板块：DCI定义",
      fields: [
        { key: "define_body", label: "正文", type: "textarea", rows: 4 },
        { key: "define_image", label: "配图 URL", type: "image" },
      ],
    },
    {
      id: "system_block",
      title: "板块：DCI标准体系",
      fields: [
        { key: "system_title", label: "标题", type: "text" },
        { key: "system_body", label: "正文", type: "textarea", rows: 3 },
        { key: "system_image", label: "配图 URL", type: "image" },
      ],
    },
    {
      id: "national",
      title: "板块：国家标准",
      fields: [
        { key: "national_title", label: "标题", type: "text" },
        { key: "national_body", label: "正文", type: "textarea", rows: 3 },
        { key: "national_image", label: "配图 URL", type: "image" },
      ],
    },
    {
      id: "industry",
      title: "板块：行业标准",
      fields: [
        { key: "industry_title", label: "标题", type: "text" },
        { key: "industry_image", label: "配图 URL", type: "image" },
      ],
    },
    {
      id: "scenes",
      title: "板块：DCI贯标应用",
      fields: [
        { key: "scenes_title", label: "标题", type: "text" },
        { key: "scenes_list", label: "场景列表（逗号分隔）", type: "textarea", rows: 4 },
      ],
    },
  ],
  registry: [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_title", label: "主标题", type: "textarea", rows: 2 },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "duty",
      title: "板块：职责",
      fields: [
        { key: "duty_title", label: "标题", type: "text" },
        { key: "duty_p1", label: "段落 1", type: "textarea", rows: 3 },
        { key: "duty_p2", label: "段落 2", type: "textarea", rows: 3 },
        { key: "duty_p3", label: "段落 3", type: "textarea", rows: 3 },
      ],
    },
    {
      id: "partners",
      title: "板块：合作伙伴",
      fields: [
        { key: "partners_title", label: "标题", type: "text" },
        { key: "partners_list", label: "伙伴名称（逗号分隔）", type: "text" },
      ],
    },
  ],
  ecology: [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_title", label: "主标题", type: "text" },
        { key: "hero_subtitle", label: "副标题", type: "textarea", rows: 2 },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "types",
      title: "板块：DCI可信生态",
      fields: [
        { key: "types_title", label: "板块标题", type: "text" },
        {
          key: "types_cards",
          label: "生态类型（JSON：title/desc）",
          type: "textarea",
          rows: 8,
        },
      ],
    },
  ],
  lab: [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_title", label: "主标题", type: "text" },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "intro",
      title: "板块：基本介绍",
      fields: [
        { key: "intro_title", label: "标题", type: "text" },
        { key: "intro_body", label: "正文", type: "textarea", rows: 4 },
      ],
    },
    {
      id: "directions",
      title: "板块：科研方向",
      fields: [
        { key: "directions_title", label: "标题", type: "text" },
        { key: "directions_intro", label: "导语", type: "textarea", rows: 3 },
        { key: "directions_list", label: "方向列表（逗号分隔）", type: "textarea", rows: 3 },
      ],
    },
    {
      id: "capability",
      title: "板块：能力块",
      fields: [
        { key: "capability_title", label: "标题", type: "text" },
        { key: "capability_summary", label: "摘要", type: "textarea", rows: 2 },
        { key: "capability_points", label: "要点（每行一条）", type: "textarea", rows: 4 },
        { key: "capability_image", label: "配图 URL", type: "image" },
      ],
    },
  ],
  query: [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_title", label: "主标题", type: "text" },
        { key: "hero_subtitle", label: "副标题", type: "textarea", rows: 2 },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "search",
      title: "查询区",
      fields: [
        { key: "search_placeholder", label: "输入框占位文案", type: "text" },
        { key: "search_example", label: "示例说明", type: "textarea", rows: 2 },
        { key: "daily_limit", label: "每日查询上限（数字）", type: "text" },
      ],
    },
  ],
  "tech-service": [
    {
      id: "hero",
      title: "页头 Banner",
      fields: [
        { key: "hero_eyebrow", label: "英文眉题", type: "text" },
        { key: "hero_title", label: "主标题", type: "text" },
        { key: "hero_subtitle", label: "副标题", type: "textarea", rows: 3 },
        { key: "hero_image", label: "Banner 配图 URL", type: "image" },
      ],
    },
    {
      id: "services",
      title: "板块：服务卡片",
      fields: [
        {
          key: "services_cards",
          label: "服务列表（JSON：title/desc）",
          type: "textarea",
          rows: 8,
        },
      ],
    },
    {
      id: "contact",
      title: "板块：联系我们",
      fields: [
        { key: "contact_title", label: "标题", type: "text" },
        { key: "contact_email", label: "邮箱", type: "text" },
        { key: "contact_phone", label: "电话", type: "text" },
        { key: "contact_address", label: "地址", type: "text" },
      ],
    },
  ],
};

/** 门户导航栏目种子（同步至 CMS「导航栏目」目录树） */
export const PORTAL_COLUMN_SEED: PortalColumn[] = [
  {
    id: "col-home",
    path: "/",
    name: "首页",
    hidden: false,
    sort: 10,
    content: {
      banner1_tag: "DCI DIGITAL COPYRIGHT IDENTIFIER",
      banner1_title: "DCI——\n数字版权唯一标识符",
      banner1_subtitle: "数字空间唯一“版权身份证”和“权益凭证”",
      banner1_image:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260722/6666.jpg",
      banner2_tag: "DCI SYSTEMATIC INTEGRATED SOLUTION",
      banner2_title: "构建以DCI体系4.0\n为核心的版权基础设施",
      banner2_subtitle: "全球版权数据中心 · 版权可信数据基础设施",
      banner2_image:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260722/6666.jpg",
      system_eyebrow: "DCI SYSTEMATIC INTEGRATED SOLUTION",
      system_title: "DCI体系",
      system_body:
        "以DCI国家标准为引领，涵盖标准、技术协议、产品服务、新型数智基础设施和生态联盟于一体的体系化解决方案。",
      system_link_label: "了解DCI体系 →",
      system_pillars: "DCI标准,技术协议,产品服务,数智基础设施,生态联盟",
      standard_eyebrow: "DCI STANDARD",
      standard_title: "DCI标准",
      standard_card_title: "简介",
      standard_body: "DCI标准体系支撑数字版权标识、互操作与贯标应用落地。",
      standard_link_label: "了解更多标准 →",
      registry_eyebrow: "DCI REGISTRATION CENTER",
      registry_title: "DCI注册中心",
      registry_body: "负责DCI申领审核与编码分配，保障标识权威与可查验。",
      registry_cta_label: "了解注册中心 →",
      ecology_eyebrow: "DCI ECOLOGY",
      ecology_title: "DCI生态",
      ecology_tagline: "共建 · 共治 · 共享",
      ecology_cards: JSON.stringify(
        [
          { label: "共建", en: "CO-CONSTRUCTED", desc: "与各行业版权生态伙伴共同构建DCI可信数字版权基础设施" },
          { label: "共治", en: "CO-GOVERNED", desc: "多方参与数据治理，建立权威、可信、透明的DCI治理机制" },
          { label: "共享", en: "SHARED", desc: "开放DCI数据资源，共享版权保护与价值变现的完整闭环" },
        ],
        null,
        2,
      ),
      ecology_link_label: "了解DCI生态 →",
      lab_eyebrow: "DCI LAB",
      lab_title: "DCI实验室",
      lab_ring: "技术研究 · 场景应用 · 标准推广",
      lab_link_label: "了解实验室 →",
    },
  },
  {
    id: "col-system",
    path: "/system/",
    name: "DCI体系",
    hidden: false,
    sort: 20,
    content: {
      hero_title: "DCI体系4.0\nAI时代的版权可信数智基础设施",
      hero_subtitle: "",
      hero_image: "",
      intro_p1:
        "DCI体系是以DCI国家标准为引领，以标准化标识为基础手段，以AI、区块链等新技术的系统集成应用为驱动的体系化解决方案。",
      intro_p2: "通过为数字内容与权益主体间的权属关系分配唯一可查验的 DCI，支撑版权全生命周期流通与保护。",
      pillars: "标准,生态联盟,技术协议,新型数字基础设施,产品服务",
      history_title: "DCI体系发展历程",
      history_items: JSON.stringify(
        [
          {
            period: "2011-2017",
            title: "DCI体系1.0",
            points: ["DCI体系概念提出，完成顶层设计", "DCI国家标准研制启动并正式立项"],
          },
          {
            period: "2025-",
            title: "DCI体系4.0",
            badge: "最新",
            points: ["全球版权数据中心正式发布", "推进AI与版权融合创新"],
          },
        ],
        null,
        2,
      ),
    },
  },
  {
    id: "col-standard",
    path: "/standard/",
    name: "DCI标准",
    hidden: false,
    sort: 30,
    content: {
      hero_title: "DCI标准",
      hero_subtitle: "以国家标准为引领，构建数字版权标识与互操作标准体系。",
      hero_image: "",
      define_body: "DCI（Digital Copyright Identifier）是数字网络环境下唯一标识版权权益的一组字符。",
      define_image:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787638650803.png",
      system_title: "DCI标准体系",
      system_body: "覆盖基础标识、系统框架与应用互操作要求。",
      system_image:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787638913113.png",
      national_title: "国家标准",
      national_body: "DCI相关国家标准研制与发布进展。",
      national_image:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787639122278.png",
      industry_title: "行业标准",
      industry_image:
        "https://miaoda-conversation-file.cdn.bcebos.com/user-bmjekvlpgirk/app-ck03sng4kykh/20260825/image_1787646376291.png",
      scenes_title: "DCI贯标应用",
      scenes_list: "终端创作场景,影像交易场景,电商场景,短视频/直播场景,音乐场景",
    },
  },
  {
    id: "col-registry",
    path: "/registry/",
    name: "DCI注册中心",
    hidden: false,
    sort: 40,
    content: {
      hero_title: "DCI注册中心",
      hero_image: "",
      duty_title: "职责",
      duty_p1: "受理 DCI 申领申请并进行审核。",
      duty_p2: "为符合要求的权利人分配 DCI 编码。",
      duty_p3: "同步至中国版权保护中心，保障权威可查验。",
      partners_title: "合作伙伴",
      partners_list: "中国标准化研究院,雅昌文化",
    },
  },
  {
    id: "col-ecology",
    path: "/ecology/",
    name: "DCI生态",
    hidden: false,
    sort: 50,
    content: {
      hero_title: "DCI生态",
      hero_subtitle: "共建、共治、共享的可信数字版权生态。",
      hero_image: "",
      types_title: "DCI可信生态",
      types_cards: JSON.stringify(
        [
          { title: "内容平台类", desc: "拥有海量数字内容生产、存储、传播能力的平台型机构。" },
          { title: "版权专业服务类", desc: "提供版权专业化服务、版权运营等机构。" },
          { title: "学术研究类", desc: "为DCI技术体系和关键标准的科研攻关提供支持。" },
          { title: "技术支撑类", desc: "将前沿核心技术与DCI体系结合。" },
        ],
        null,
        2,
      ),
    },
  },
  {
    id: "col-lab",
    path: "/lab/",
    name: "DCI实验室",
    hidden: false,
    sort: 60,
    content: {
      hero_title: "DCI实验室",
      hero_image: "",
      intro_title: "基本介绍",
      intro_body: "面向技术研究、场景应用与标准推广，持续推进版权智能能力研发。",
      directions_title: "科研方向",
      directions_intro: "围绕基础设施、智能能力、关键标准与产业化应用展开。",
      directions_list: "DCI版权基础设施建设,版权智能能力研发,关键技术标准研制,科研成果产业化应用",
      capability_title: "版权智能能力研发",
      capability_summary: "攻关版权登记智能辅助审核能力，实现“人工智能+版权登记”场景应用",
      capability_points:
        "研发内容风控、作品查重、疑似侵权识别等能力\n建立“机读人审、人机协同”审核体系",
      capability_image: "",
    },
  },
  {
    id: "col-query",
    path: "/query/",
    name: "DCI查询",
    hidden: false,
    sort: 70,
    content: {
      hero_title: "DCI查询",
      hero_subtitle: "输入 DCI 编码或作品信息，查询权属与登记状态。",
      hero_image: "",
      search_placeholder: "请输入 DCI 编码或作品名称",
      search_example: "例如：DCI:RANTQZ010.156.2026070120989764467  《数字版权保护技术规范》",
      daily_limit: "20",
    },
  },
  {
    id: "col-tech",
    path: "/tech-service/",
    name: "DCI®技术服务中心",
    hidden: false,
    sort: 80,
    content: {
      hero_eyebrow: "TECHNICAL SERVICE CENTER",
      hero_title: "DCI®技术服务中心",
      hero_subtitle: "面向内容平台与版权机构，提供标识接入、接口文档与运维保障。",
      hero_image: "",
      services_cards: JSON.stringify(
        [
          { title: "DCI 标识接入", desc: "提供 DCI 标识生成、校验与查询接口的标准化接入方案。" },
          { title: "接口与文档支持", desc: "提供完整接口文档、调用示例与 SDK。" },
          { title: "技术运维保障", desc: "7×24 监控与故障响应，保障服务稳定运行。" },
          { title: "专属技术顾问", desc: "一对一咨询、方案设计与疑难问题解答。" },
        ],
        null,
        2,
      ),
      contact_title: "联系我们",
      contact_email: "tech@dci.gov.cn",
      contact_phone: "010-8888-8888",
      contact_address: "北京市西城区",
    },
  },
];

let columns: PortalColumn[] = PORTAL_COLUMN_SEED.map((c) => ({
  ...c,
  content: { ...c.content },
}));
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

function schemaKeyOf(col: PortalColumn): string {
  if (col.id === "col-home" || col.path === "/") return "home";
  if (col.path.includes("system")) return "system";
  if (col.path.includes("standard")) return "standard";
  if (col.path.includes("registry")) return "registry";
  if (col.path.includes("ecology")) return "ecology";
  if (col.path.includes("lab")) return "lab";
  if (col.path.includes("query")) return "query";
  if (col.path.includes("tech")) return "tech-service";
  return "home";
}

export function getColumnSchemaKey(col: PortalColumn): string {
  return schemaKeyOf(col);
}

export function getColumnSections(col: PortalColumn): ColumnSectionDef[] {
  return COLUMN_SECTION_SCHEMAS[schemaKeyOf(col)] ?? [];
}

export function listPortalColumns(): PortalColumn[] {
  return [...columns]
    .sort((a, b) => a.sort - b.sort || a.id.localeCompare(b.id))
    .map((c) => ({ ...c, content: { ...c.content } }));
}

export function getPortalColumn(id: string): PortalColumn | undefined {
  const c = columns.find((x) => x.id === id);
  return c ? { ...c, content: { ...c.content } } : undefined;
}

export function updatePortalColumnMeta(
  id: string,
  patch: { name: string; hidden: boolean; sort: number },
) {
  const name = patch.name.trim();
  if (!name) throw new Error("请填写栏目名称");
  columns = columns.map((c) =>
    c.id === id ? { ...c, name, hidden: patch.hidden, sort: patch.sort } : c,
  );
  emit();
}

export function updatePortalColumnContent(id: string, content: Record<string, string>) {
  columns = columns.map((c) => (c.id === id ? { ...c, content: { ...content } } : c));
  emit();
}

export function usePortalColumnStore() {
  const [, bump] = useState(0);
  useEffect(() => subscribe(() => bump((n) => n + 1)), []);
  return {
    columns: listPortalColumns(),
    get: getPortalColumn,
    getSections: getColumnSections,
    updateMeta: updatePortalColumnMeta,
    updateContent: updatePortalColumnContent,
  };
}
