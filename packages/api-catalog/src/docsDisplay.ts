import type { ApiEndpoint, ApiParam } from "./types";

function formatParamLines(title: string, rows: ApiParam[]) {
  if (!rows.length) return "";
  const lines = rows.map((row) => {
    const req = row.required ? "必填" : "可选";
    const bits = [`${row.name}`, `(${row.type}, ${req})`];
    if (row.desc) bits.push(`: ${row.desc}`);
    return `- ${bits.join(" ")}`;
  });
  return `【${title}】\n${lines.join("\n")}`;
}

/** 解析 ops 配置的请求参数说明（优先文本字段，兼容结构化参数） */
export function resolveRequestParamsText(ep: Pick<
  ApiEndpoint,
  "requestParamsText" | "pathParams" | "queryParams" | "headerParams" | "bodyParams"
>): string {
  if (ep.requestParamsText?.trim()) return ep.requestParamsText.trim();
  return [
    formatParamLines("Path", ep.pathParams),
    formatParamLines("Query", ep.queryParams),
    formatParamLines("Header", ep.headerParams),
    formatParamLines("Body", ep.bodyParams),
  ]
    .filter(Boolean)
    .join("\n\n");
}

/** 解析 ops 配置的响应字段说明 */
export function resolveResponseFieldsText(
  ep: Pick<ApiEndpoint, "responseFieldsText" | "responseParams">,
): string {
  if (ep.responseFieldsText?.trim()) return ep.responseFieldsText.trim();
  return formatParamLines("响应字段", ep.responseParams).replace(/^【响应字段】\n/, "") || "";
}
