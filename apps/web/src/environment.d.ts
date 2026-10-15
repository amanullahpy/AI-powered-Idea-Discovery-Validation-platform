declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'test' | 'production';
      NEXT_PUBLIC_SITE_URL?: string;
      NEXT_PUBLIC_VERCEL_URL?: string;
      NEXT_PUBLIC_SUPABASE_URL: string;
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: string;
      SUPABASE_PROJECT_REF?: string;
      SUPABASE_SECRET_KEY?: string;
      SUPABASE_URL?: string;
      SUPABASE_PUBLISHABLE_KEY?: string;
      SUPABASE_JWKS_URL?: string;
      GROQ_API_KEY?: string;
      OPENROUTER_API_KEY?: string;
      GEMINI_API_KEY?: string;
      GROQ_API_URL?: string;
      OPENROUTER_API_URL?: string;
      GEMINI_API_BASE_URL?: string;
      PORT?: string;
    }
  }
}

export {};
