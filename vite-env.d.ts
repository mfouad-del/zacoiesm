/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_HCAPTCHA_SITE_KEY: string
  readonly VITE_HCAPTCHA_SECRET: string
  readonly VITE_ENCRYPTION_KEY: string
  readonly VITE_CF_R2_ENDPOINT: string
  readonly VITE_CF_R2_BUCKET: string
  readonly VITE_EMAIL_API_KEY: string
  readonly VITE_EMAIL_FROM: string
  readonly VITE_EMAIL_PROVIDER: string
  readonly VITE_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'papaparse';
declare module 'crypto-js';
declare module '@aws-sdk/client-s3';
