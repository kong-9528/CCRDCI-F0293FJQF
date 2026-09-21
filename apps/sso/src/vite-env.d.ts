/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_OPS_URL: string;
  readonly VITE_OPS_DCI_URL: string;
  readonly VITE_UCENTER_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
