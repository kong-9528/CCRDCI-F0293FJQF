export type ApiKeys = {
  accessKey: string;
  appSecret: string;
  updatedAt: string;
};

const MASK = "sk_live_••••••••••••••••";

export const INITIAL_API_KEYS: ApiKeys = {
  accessKey: "ak_live_7f3d2e1c4b5a6789",
  appSecret: "sk_live_7f3d2e1c4b5a6789abcdef0123456789",
  updatedAt: "2026-01-15 10:22",
};

export const SECRET_MASK = MASK;

export const KEY_UPDATE_CONFIRM_TEXT = "确认更新";

function randomHex(len: number) {
  const chars = "0123456789abcdef";
  let out = "";
  for (let i = 0; i < len; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function rotateApiKeys(): ApiKeys {
  const now = new Date();
  const stamp = now.toISOString().slice(0, 19).replace("T", " ");
  return {
    accessKey: `ak_live_${randomHex(16)}`,
    appSecret: `sk_live_${randomHex(32)}`,
    updatedAt: stamp,
  };
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
