// Env variables type definitions

namespace NodeJS {
  interface ProcessEnv {
    BETTER_AUTH_SECRET: string;
    BETTER_AUTH_URL: string;
    NEON_DATABASE_URL: string;
    OAUTH_GOOGLE_CLIENT_SECRET: string;
    OAUTH_GOOGLE_CLIENT_ID: string;
    CLOUDFLARE_ACCOUNT_ID: string;
    CLOUDFLARE_KV_NAMESPACE_ID: string;
    CLOUDFLARE_API_TOKEN: string;
    OPENAI_API_KEY: string;
    AGORA_APP_ID: string;
    AGORA_APP_CERTIFICATE?: string;
    AGORA_CUSTOMER_ID?: string;
    AGORA_CUSTOMER_SECRET?: string;
    NEXT_PUBLIC_AGORA_APP_ID: string;
    ELEVENLABS_API_KEY?: string;
    AZURE_TTS_KEY?: string;
    AZURE_TTS_REGION?: string;
    GEMINI_API_KEY: string;
    ADMIN_EDIT_PIN?: string;
  }
}
