function trimBase(url: string | undefined, fallback: string) {
  return (url || fallback).replace(/\/$/, "");
}

/** 来自部署平台或本地 .env.local，构建时注入 */
export const OPS_URL = trimBase(import.meta.env.VITE_OPS_URL, "http://localhost:3001");
export const OPS_DCI_URL = trimBase(
  import.meta.env.VITE_OPS_DCI_URL,
  "http://localhost:3030",
);
export const UCENTER_URL = trimBase(
  import.meta.env.VITE_UCENTER_URL,
  "http://localhost:3005",
);

export const SUBSYSTEM_ORIGINS = [OPS_URL, OPS_DCI_URL, UCENTER_URL].map(
  (url) => new URL(url).origin,
);
