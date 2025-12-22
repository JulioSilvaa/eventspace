/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_APP_ENV: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_CRYPTO_KEY: string
  readonly VITE_ENCRYPTION_VERSION: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}