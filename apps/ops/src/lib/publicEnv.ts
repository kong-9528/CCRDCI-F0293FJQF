/** 本应用对外访问地址，来自部署平台或本地 .env.local */
export const OPS_PUBLIC_URL = (
  import.meta.env.VITE_PUBLIC_URL || "http://localhost:3001"
).replace(/\/$/, "");
