export type ApiKeyStatus = "enabled" | "disabled";

/** 列表中持久化的密钥记录（不含 SecretKey） */
export type ApiKeyRecord = {
  id: string;
  accessKeyId: string;
  status: ApiKeyStatus;
  createdAt: string;
  lastUsedAt: string | null;
  lastUsedService: string | null;
  description: string;
};

/** 创建或重置时短暂返回，仅用于一次性展示 */
export type CreatedApiKey = ApiKeyRecord & {
  secretKey: string;
};

export const MAX_API_KEYS = 1;

function randomHex(len: number) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

function formatNow() {
  const now = new Date();
  return now.toISOString().slice(0, 19).replace("T", " ");
}

function generateKeyPair() {
  return {
    accessKeyId: `ak_live_${randomHex(16)}`,
    secretKey: `sk_live_${randomHex(32)}`,
  };
}

export function createApiKey(description: string): CreatedApiKey {
  const { accessKeyId, secretKey } = generateKeyPair();
  return {
    id: `key_${randomHex(8)}`,
    accessKeyId,
    secretKey,
    status: "enabled",
    createdAt: formatNow(),
    lastUsedAt: null,
    lastUsedService: null,
    description: description.trim(),
  };
}

/** 重置密钥对：AccessKey ID 与 SecretKey 均更新，旧密钥立即失效 */
export function resetApiKey(record: ApiKeyRecord): CreatedApiKey {
  const { accessKeyId, secretKey } = generateKeyPair();
  return {
    ...record,
    accessKeyId,
    secretKey,
    status: "enabled",
  };
}

export function setApiKeyStatus(record: ApiKeyRecord, status: ApiKeyStatus): ApiKeyRecord {
  return { ...record, status };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
