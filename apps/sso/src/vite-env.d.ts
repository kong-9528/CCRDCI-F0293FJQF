/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPS_URL: string;
  readonly VITE_CUSTOMER_URL: string;
  readonly VITE_UCENTER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
