export type ApiKeyRecord = {
  id: string;
  ak: string;
  sk: string;
  dek: string;
  /** 展示用：2026/9/7 17:08:36 */
  createdAt: string;
  updatedAt: string;
};

export const MAX_API_KEYS = 1;

const STORAGE_KEY = "ctp.customer.apiKey.v1";
const STORAGE_KEY_BY_SCOPE = "ctp.customer.apiKey.v2";

export type ApiKeyScope = "verify" | "review";

function randomAlnum(len: number) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/** 与截图一致：2026/9/7 17:08:36（月日不补零） */
export function formatKeyTimestamp(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");
  return `${y}/${m}/${d} ${hh}:${mm}:${ss}`;
}

export function generateAk() {
  return `AK${randomAlnum(32)}`;
}

export function generateSk() {
  return `SK${randomAlnum(32)}`;
}

export function generateDek() {
  return `DEK${randomAlnum(32)}`;
}

export function createApiKeyDraft(): Pick<ApiKeyRecord, "ak" | "sk" | "dek"> {
  return {
    ak: generateAk(),
    sk: generateSk(),
    dek: generateDek(),
  };
}

export function createApiKeyFromDraft(draft: Pick<ApiKeyRecord, "ak" | "sk" | "dek">): ApiKeyRecord {
  const stamp = formatKeyTimestamp();
  return {
    id: `key_${randomAlnum(8)}`,
    ak: draft.ak,
    sk: draft.sk,
    dek: draft.dek,
    createdAt: stamp,
    updatedAt: stamp,
  };
}

/** 仅重置 SK / DEK，AK 不变 */
export function regenerateSecrets(
  record: ApiKeyRecord,
  next: { sk: string; dek: string },
): ApiKeyRecord {
  return {
    ...record,
    sk: next.sk,
    dek: next.dek,
    updatedAt: formatKeyTimestamp(),
  };
}

/** SK / DEK 默认脱敏：前缀可见 + 星号 */
export function maskSecret(value: string, visible = 8) {
  if (value.length <= visible) return value;
  return `${value.slice(0, visible)}${"*".repeat(Math.max(24, value.length - visible))}`;
}

function readScopeMap(): Partial<Record<ApiKeyScope, ApiKeyRecord>> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_BY_SCOPE);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<Record<ApiKeyScope, ApiKeyRecord>>;
      return parsed && typeof parsed === "object" ? parsed : {};
    }
    // 兼容旧版单 key：迁移到核验服务
    const legacy = localStorage.getItem(STORAGE_KEY);
    if (!legacy) return {};
    const parsed = JSON.parse(legacy) as ApiKeyRecord;
    if (!parsed?.id || !parsed.ak || !parsed.sk || !parsed.dek) return {};
    const migrated = { verify: parsed };
    localStorage.setItem(STORAGE_KEY_BY_SCOPE, JSON.stringify(migrated));
    return migrated;
  } catch {
    return {};
  }
}

export function loadStoredApiKey(scope: ApiKeyScope = "verify"): ApiKeyRecord | null {
  const map = readScopeMap();
  const record = map[scope];
  if (!record?.id || !record.ak || !record.sk || !record.dek) return null;
  return record;
}

export function saveStoredApiKey(record: ApiKeyRecord | null, scope: ApiKeyScope = "verify") {
  try {
    const map = readScopeMap();
    if (!record) delete map[scope];
    else map[scope] = record;
    localStorage.setItem(STORAGE_KEY_BY_SCOPE, JSON.stringify(map));
  } catch {
    // ignore quota / private mode
  }
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
