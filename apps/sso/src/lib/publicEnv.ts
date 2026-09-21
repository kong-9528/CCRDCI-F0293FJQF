function trimBase(url: string | undefined, fallback: string) {
  return (url || fallback).replace(/\/$/, "");
}

/** 来自部署平台或本地 .env.local，构建时注入 */
export const OPS_URL = trimBase(import.meta.env.VITE_OPS_URL, "http://localhost:3001");
export const CUSTOMER_URL = trimBase(
  import.meta.env.VITE_CUSTOMER_URL,
  "http://localhost:3002",
);
export const UCENTER_URL = trimBase(
  import.meta.env.VITE_UCENTER_URL,
  "http://localhost:3005",
);

export const SUBSYSTEM_ORIGINS = [OPS_URL, CUSTOMER_URL, UCENTER_URL].map(
  (url) => new URL(url).origin,
);
