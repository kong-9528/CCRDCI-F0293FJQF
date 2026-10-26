import { notifyUnify } from "@/lib/useUnifyTick";

export type RiskLevel = "high" | "medium" | "low";

export type SensitiveWord = {
  id: string;
  word: string;
  level: RiskLevel;
  enabled: boolean;
  note: string;
  updatedAt: string;
};

export const RISK_LEVEL_LABEL: Record<RiskLevel, string> = {
  high: "高危",
  medium: "中危",
  low: "低危",
};

const KEY = "ctp.unify.sensitive-words";

function stamp() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function uid() {
  return `sw_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

const SEED: SensitiveWord[] = [
  { id: "sw1", word: "暴恐", level: "high", enabled: true, note: "高危示例", updatedAt: "2026-03-01 10:00:00" },
  { id: "sw2", word: "违禁品", level: "high", enabled: true, note: "", updatedAt: "2026-03-01 10:00:00" },
  { id: "sw3", word: "赌博", level: "medium", enabled: true, note: "", updatedAt: "2026-03-02 11:00:00" },
  { id: "sw4", word: "色情", level: "medium", enabled: true, note: "", updatedAt: "2026-03-02 11:00:00" },
  { id: "sw5", word: "广告引流", level: "low", enabled: true, note: "低危营销", updatedAt: "2026-03-03 09:00:00" },
  { id: "sw6", word: "已停用词", level: "high", enabled: false, note: "测试停用", updatedAt: "2026-03-04 12:00:00" },
];

function load(): SensitiveWord[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as SensitiveWord[];
  } catch {
    /* ignore */
  }
  return structuredClone(SEED);
}

let words = load();

function persist() {
  localStorage.setItem(KEY, JSON.stringify(words));
  notifyUnify();
}

export function listSensitiveWords() {
  return words.map((w) => ({ ...w }));
}

export function listEnabledSensitiveWords() {
  return words.filter((w) => w.enabled);
}

export function upsertSensitiveWord(input: {
  id?: string;
  word: string;
  level: RiskLevel;
  enabled: boolean;
  note: string;
}): string | null {
  const word = input.word.trim();
  if (!word) return "请填写词条";
  const dup = words.find(
    (w) => w.word.toLowerCase() === word.toLowerCase() && w.id !== input.id,
  );
  if (dup) return "词条已存在";

  if (input.id) {
    const idx = words.findIndex((w) => w.id === input.id);
    if (idx < 0) return "记录不存在";
    words[idx] = {
      ...words[idx]!,
      word,
      level: input.level,
      enabled: input.enabled,
      note: input.note.trim(),
      updatedAt: stamp(),
    };
  } else {
    words = [
      {
        id: uid(),
        word,
        level: input.level,
        enabled: input.enabled,
        note: input.note.trim(),
        updatedAt: stamp(),
      },
      ...words,
    ];
  }
  persist();
  return null;
}

export function setSensitiveWordEnabled(id: string, enabled: boolean) {
  const idx = words.findIndex((w) => w.id === id);
  if (idx < 0) return;
  words[idx] = { ...words[idx]!, enabled, updatedAt: stamp() };
  persist();
}

export function deleteSensitiveWord(id: string) {
  words = words.filter((w) => w.id !== id);
  persist();
}

/** 对文本做敏感词匹配，返回命中列表与风险等级 */
export function matchSensitiveText(text: string): {
  hits: { word: string; level: RiskLevel }[];
  riskLevel: RiskLevel | null;
  failed: boolean;
} {
  const enabled = listEnabledSensitiveWords();
  const hits: { word: string; level: RiskLevel }[] = [];
  for (const w of enabled) {
    if (text.includes(w.word)) hits.push({ word: w.word, level: w.level });
  }
  if (!hits.length) return { hits: [], riskLevel: null, failed: false };
  if (hits.some((h) => h.level === "high")) {
    return { hits, riskLevel: "high", failed: true };
  }
  if (hits.some((h) => h.level === "medium")) {
    return { hits, riskLevel: "medium", failed: true };
  }
  return { hits, riskLevel: "low", failed: true };
}

export type SensitiveWordImportRow = {
  line: number;
  word: string;
  level: RiskLevel;
  enabled: boolean;
  note: string;
};

export type SensitiveWordParseResult = {
  valid: SensitiveWordImportRow[];
  fail: string[];
};

/** 导入模板（含表头与示例行） */
export function getSensitiveWordsImportTemplateCsv() {
  return [
    "词条,危级,状态,备注",
    "示例高危词,高危,启用,可删除此行后填写真实词条",
    "示例中危词,中危,启用,",
    "示例低危词,低危,停用,停用状态示例",
  ].join("\n");
}

function parseLevel(raw: string): RiskLevel | null {
  const v = raw.trim();
  if (v === "高危" || v.toLowerCase() === "high") return "high";
  if (v === "中危" || v.toLowerCase() === "medium") return "medium";
  if (v === "低危" || v.toLowerCase() === "low") return "low";
  return null;
}

function parseEnabled(raw: string | undefined): boolean {
  if (raw == null || raw.trim() === "") return true;
  const v = raw.trim();
  if (v === "停用" || v === "禁用" || v.toLowerCase() === "disabled" || v === "0" || v === "false") {
    return false;
  }
  return true;
}

/** 简单 CSV 行拆分（支持双引号包裹字段） */
function splitCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]!;
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
      continue;
    }
    if (ch === '"') {
      inQuotes = true;
      continue;
    }
    if (ch === ",") {
      out.push(cur.trim());
      cur = "";
      continue;
    }
    cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/** 仅解析校验，不写入；用于导入预览 */
export function parseSensitiveWordsCsv(csv: string): SensitiveWordParseResult {
  const text = csv.replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/);
  const valid: SensitiveWordImportRow[] = [];
  const fail: string[] = [];
  const seen = new Set<string>();

  lines.forEach((rawLine, idx) => {
    const lineNo = idx + 1;
    const line = rawLine.trim();
    if (!line) return;
    if (idx === 0 && /词条|word/i.test(line)) return;

    const cols = splitCsvLine(line);
    const word = (cols[0] || "").trim();
    const level = parseLevel(cols[1] || "");
    // 兼容：词条,危级,备注  或  词条,危级,状态,备注
    const hasStatusCol = cols.length >= 4 || /启用|停用|enabled|disabled/i.test(cols[2] || "");
    const enabled = hasStatusCol ? parseEnabled(cols[2]) : true;
    const note = hasStatusCol ? (cols[3] || "").trim() : (cols[2] || "").trim();

    if (!word) {
      fail.push(`第 ${lineNo} 行：词条不能为空`);
      return;
    }
    if (!level) {
      fail.push(`第 ${lineNo} 行：危级须为「高危/中危/低危」`);
      return;
    }
    const key = word.toLowerCase();
    if (seen.has(key)) {
      fail.push(`第 ${lineNo} 行：文件内词条「${word}」重复`);
      return;
    }
    seen.add(key);
    if (words.some((w) => w.word.toLowerCase() === key)) {
      fail.push(`第 ${lineNo} 行：词条「${word}」已存在`);
      return;
    }
    valid.push({ line: lineNo, word, level, enabled, note });
  });

  return { valid, fail };
}

/** 将预览通过的行写入词库 */
export function commitSensitiveWordsImport(rows: SensitiveWordImportRow[]): {
  ok: number;
  fail: string[];
} {
  const fail: string[] = [];
  let ok = 0;
  for (const row of rows) {
    const err = upsertSensitiveWord({
      word: row.word,
      level: row.level,
      enabled: row.enabled,
      note: row.note,
    });
    if (err) fail.push(`第 ${row.line} 行：${err}`);
    else ok++;
  }
  return { ok, fail };
}

/** 解析并直接导入（兼容旧调用） */
export function importSensitiveWordsCsv(csv: string): { ok: number; fail: string[] } {
  const parsed = parseSensitiveWordsCsv(csv);
  if (!parsed.valid.length) return { ok: 0, fail: parsed.fail };
  const committed = commitSensitiveWordsImport(parsed.valid);
  return { ok: committed.ok, fail: [...parsed.fail, ...committed.fail] };
}

export function exportSensitiveWordsCsv() {
  const header = "词条,危级,状态,备注,更新时间";
  const rows = words.map(
    (w) =>
      `${w.word},${RISK_LEVEL_LABEL[w.level]},${w.enabled ? "启用" : "停用"},${w.note},${w.updatedAt}`,
  );
  return [header, ...rows].join("\n");
}

export function downloadTextFile(filename: string, content: string, mime = "text/csv;charset=utf-8") {
  const blob = new Blob(["\uFEFF" + content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
