/** 文档页 mock：对齐 home 文档模块「版本动态 / 文档介绍」结构 */

export type DocsTabKey = "version" | "overview" | "interfaces";

export type DocsVersionItem = {
  version: string;
  date: string;
  content: string;
};

export const DOCS_TABS: { key: DocsTabKey; name: string }[] = [
  { key: "version", name: "版本动态" },
  { key: "overview", name: "文档介绍" },
  { key: "interfaces", name: "接口列表" },
];

/** 版本动态 mock（格式同 home：version / date / content） */
export const DOCS_VERSIONS: DocsVersionItem[] = [
  {
    version: "V1.0",
    date: "2026-08-31",
    content:
      "DCI核验接口、版权登记信息核验接口、版权登记证书核验接口及作品智能辅助审核接口正式上线。",
  },
];

/** 文档介绍 mock（结构同 home：导语 + 核心能力列表） */
export const DOCS_OVERVIEW = {
  summary: "面向接入机构，提供版权核验与作品智能审核开放接口，支持业务系统对接调用。",
  capabilitiesTitle: "核心能力：",
  capabilities: [
    "DCI码及相关信息核验；",
    "版权登记信息核验；",
    "版权登记证书核验；",
    "作品智能辅助审核。",
  ],
} as const;

export function resolveDocsTab(raw: string | null): DocsTabKey {
  if (raw === "overview" || raw === "interfaces" || raw === "version") return raw;
  if (raw === "documents") return "interfaces";
  return "version";
}
