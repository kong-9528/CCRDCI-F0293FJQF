import type { ApiParam } from "./types";

/** 参数表列定义（对齐火山引擎 columns） */
export type ParamTableColumn = {
  title: string;
  dataIndex: string;
  width?: string | number;
  className?: string;
};

/** 参数表行（支持 children 嵌套） */
export type ParamTableRow = {
  rowKey: string;
  name?: string;
  type?: string;
  required?: string;
  desc?: string;
  example?: string;
  children?: ParamTableRow[];
  /** 允许扩展列字段 */
  [key: string]: unknown;
};

/** 一段 JSON 同时定义表头 + 行数据 */
export type ParamTableDoc = {
  columns: ParamTableColumn[];
  data: ParamTableRow[];
};

export type ParseParamTableResult =
  | { ok: true; value: ParamTableDoc }
  | { ok: false; error: string };

const DEFAULT_COLUMNS: ParamTableColumn[] = [
  { title: "参数名", dataIndex: "name", width: "22%" },
  { title: "类型", dataIndex: "type", width: 120 },
  { title: "必填", dataIndex: "required", width: 80 },
  { title: "说明", dataIndex: "desc" },
];

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isParamTableColumn(v: unknown): v is ParamTableColumn {
  if (!isPlainObject(v)) return false;
  return typeof v.title === "string" && typeof v.dataIndex === "string";
}

function isParamTableRow(v: unknown): v is ParamTableRow {
  if (!isPlainObject(v)) return false;
  if (typeof v.rowKey !== "string" || !v.rowKey.trim()) return false;
  if (v.children !== undefined) {
    if (!Array.isArray(v.children)) return false;
    if (!v.children.every(isParamTableRow)) return false;
  }
  return true;
}

export function isParamTableDoc(v: unknown): v is ParamTableDoc {
  if (!isPlainObject(v)) return false;
  if (!Array.isArray(v.columns) || !v.columns.every(isParamTableColumn)) return false;
  if (!Array.isArray(v.data) || !v.data.every(isParamTableRow)) return false;
  return true;
}

export function parseParamTableJson(text: string): ParseParamTableResult {
  const raw = text?.trim();
  if (!raw) return { ok: false, error: "内容为空" };
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: "不是合法的 JSON" };
  }
  if (!isParamTableDoc(parsed)) {
    return {
      ok: false,
      error: "JSON 须包含 columns（列定义数组）与 data（行数据数组），且行需有 rowKey",
    };
  }
  return { ok: true, value: parsed };
}

function requiredToBool(v: unknown): boolean {
  if (typeof v === "boolean") return v;
  if (typeof v === "string") {
    const s = v.trim();
    if (s === "是" || s.toLowerCase() === "true" || s === "必填") return true;
    if (s === "否" || s.toLowerCase() === "false" || s === "可选") return false;
  }
  return false;
}

function flattenRows(rows: ParamTableRow[], out: ApiParam[]): void {
  for (const row of rows) {
    const name = String(row.name ?? "").trim();
    if (name) {
      out.push({
        name,
        type: String(row.type ?? "string"),
        required: requiredToBool(row.required),
        desc: String(row.desc ?? ""),
        example: row.example != null ? String(row.example) : undefined,
      });
    }
    if (Array.isArray(row.children) && row.children.length) {
      flattenRows(row.children, out);
    }
  }
}

/** 嵌套表 → 扁平 ApiParam[]（兼容旧逻辑） */
export function flattenParamTable(doc: ParamTableDoc): ApiParam[] {
  const out: ApiParam[] = [];
  flattenRows(doc.data ?? [], out);
  return out;
}

/** 旧扁平参数 → 默认 columns + 无嵌套的 data */
export function paramsToParamTableDoc(rows: ApiParam[]): ParamTableDoc {
  return {
    columns: DEFAULT_COLUMNS.map((c) => ({ ...c })),
    data: (rows ?? [])
      .filter((r) => r.name?.trim())
      .map((r) => ({
        rowKey: `->${r.name.trim()}`,
        name: r.name.trim(),
        type: r.type || "string",
        required: r.required ? "是" : "否",
        desc: r.desc || "",
        ...(r.example != null && r.example !== "" ? { example: r.example } : {}),
        children: [] as ParamTableRow[],
      })),
  };
}

export function paramsToParamTableJson(rows: ApiParam[]): string {
  return JSON.stringify(paramsToParamTableDoc(rows), null, 2);
}

export function stringifyParamTableDoc(doc: ParamTableDoc): string {
  return JSON.stringify(doc, null, 2);
}

export function defaultParamTableColumns(): ParamTableColumn[] {
  return DEFAULT_COLUMNS.map((c) => ({ ...c }));
}

/** 空表模板（ops 新建时用） */
export function emptyParamTableJson(): string {
  return stringifyParamTableDoc({
    columns: defaultParamTableColumns(),
    data: [],
  });
}
