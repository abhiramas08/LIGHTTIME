/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_APP_ENV: string;
  readonly VITE_APP_VERSION: string;
  readonly VITE_NASA_API_KEY: string;
  readonly VITE_NASA_API_BASE_URL: string;
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_SIM_LIGHT_TIME_DELAY_SEC: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
