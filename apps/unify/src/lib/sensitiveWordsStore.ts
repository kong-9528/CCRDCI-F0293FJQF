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

export function importSensitiveWordsCsv(csv: string): { ok: number; fail: string[] } {
  const fail: string[] = [];
  let ok = 0;
  const lines = csv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  lines.forEach((line, i) => {
    if (i === 0 && /词条|word/i.test(line)) return;
    const [word, levelRaw, note = ""] = line.split(",").map((s) => s.trim());
    const level =
      levelRaw === "高危" || levelRaw === "high"
        ? "high"
        : levelRaw === "中危" || levelRaw === "medium"
          ? "medium"
          : levelRaw === "低危" || levelRaw === "low"
            ? "low"
            : null;
    if (!word || !level) {
      fail.push(`第 ${i + 1} 行：格式错误`);
      return;
    }
    const err = upsertSensitiveWord({ word, level, enabled: true, note });
    if (err) fail.push(`第 ${i + 1} 行：${err}`);
    else ok++;
  });
  return { ok, fail };
}

export function exportSensitiveWordsCsv() {
  const header = "词条,危级,状态,备注,更新时间";
  const rows = words.map(
    (w) =>
      `${w.word},${RISK_LEVEL_LABEL[w.level]},${w.enabled ? "启用" : "停用"},${w.note},${w.updatedAt}`,
  );
  return [header, ...rows].join("\n");
}
