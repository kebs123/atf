/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the Kebs API, including the /api prefix. */
  readonly VITE_API_URL?: string;
  /** Optional comma-separated codes shown as one-click chips on /verify. */
  readonly VITE_DEMO_CODES?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
