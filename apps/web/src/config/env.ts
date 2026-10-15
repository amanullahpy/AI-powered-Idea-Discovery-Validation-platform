import { z } from 'zod';

/**
 * Centralized & Type-Safe Configuration System
 * 
 * Separates client-safe public variables (NEXT_PUBLIC_*) from server-only secrets.
 * - clientEnv: Safe for browser execution, client components, and SSR.
 * - serverEnv: Server-only secrets (API keys, service roles), protected from browser leaks.
 * - env: Unified backwards-compatible proxy accessor.
 */

// Runtime Environment Detection
export const isNode = typeof process !== 'undefined' && Boolean(process.versions?.node);

let simulatedBrowserActive = false;

/**
 * Explicit test helper to simulate browser context in test suites.
 */
export const setSimulateBrowser = (active: boolean): void => {
  simulatedBrowserActive = active;
};

/**
 * Dynamically determines if the current execution context is treated as a browser client.
 * Returns true if:
 * 1. An explicit test simulation is active (setSimulateBrowser, SIMULATE_BROWSER env, or global marker).
 * 2. Real browser runtime: window exists and Node.js runtime is absent.
 * 3. In a Node test, window was manually overridden with a plain object literal (globalThis.window = {}).
 */
export const isBrowserContext = (): boolean => {
  if (simulatedBrowserActive) return true;

  // Real browser client bundle (no Node.js process)
  if (typeof window !== 'undefined' && !isNode) return true;

  // Explicit test environment flags
  if (typeof process !== 'undefined' && process.env?.SIMULATE_BROWSER === 'true') {
    return true;
  }

  if (
    typeof globalThis !== 'undefined' &&
    ((globalThis as Record<string, unknown>).__FORCE_BROWSER_ENV__ === true ||
      (globalThis as Record<string, unknown>).__SIMULATE_BROWSER__ === true)
  ) {
    return true;
  }

  // Simulated browser in Node test runner where window was explicitly mocked as a plain object
  if (
    typeof window !== 'undefined' &&
    isNode &&
    Boolean(window) &&
    (Object.getPrototypeOf(window) === Object.prototype ||
      Object.getPrototypeOf(window) === null ||
      (window as unknown as { constructor?: { name?: string } }).constructor?.name === 'Object')
  ) {
    return true;
  }

  return false;
};

export const isServerContext = (): boolean => !isBrowserContext();

export const isServer = typeof window === 'undefined';

// ============================================================================
// 1. Client Environment Schema & Parser (Browser-safe)
// ============================================================================

export const clientEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_SITE_URL: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_VERCEL_URL: z.string().optional().or(z.literal('')),
  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url('NEXT_PUBLIC_SUPABASE_URL must be a valid URL')
    .default('http://localhost:54321/'),
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: z
    .string()
    .min(1, 'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required')
    .default('publishable_key'),
});

export type ClientEnv = z.infer<typeof clientEnvSchema>;

function getRawClientEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || undefined,
    NEXT_PUBLIC_VERCEL_URL: process.env.NEXT_PUBLIC_VERCEL_URL || undefined,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || undefined,
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || undefined,
  };
}

function parseClientEnv(): ClientEnv {
  const raw = getRawClientEnv();
  const parsed = clientEnvSchema.safeParse(raw);

  if (!parsed.success) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ENV ERROR] Invalid client environment variables:\n', parsed.error.format());
      throw new Error('Invalid client environment configuration');
    } else {
      console.warn('[ENV WARNING] Client environment validation issues in non-production mode:', parsed.error.issues);
      return clientEnvSchema.parse({
        ...raw,
        NEXT_PUBLIC_SUPABASE_URL: raw.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321/',
        NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: raw.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 'publishable_key',
      });
    }
  }

  return parsed.data;
}

// ============================================================================
// 2. Server Environment Schema & Parser (Server-only secrets)
// ============================================================================

export const serverEnvSchema = z.object({
  // Supabase Server Credentials
  SUPABASE_SECRET_KEY: z.string().min(1).optional().or(z.literal('')),
  SUPABASE_PROJECT_REF: z.string().optional().or(z.literal('')),
  SUPABASE_URL: z.string().url().optional().or(z.literal('')),
  SUPABASE_PUBLISHABLE_KEY: z.string().optional().or(z.literal('')),
  SUPABASE_JWKS_URL: z.string().url().optional().or(z.literal('')),

  // AI Provider Keys (Server-side optional with cascade fallback)
  GROQ_API_KEY: z.string().min(1).optional().or(z.literal('')),
  OPENROUTER_API_KEY: z.string().min(1).optional().or(z.literal('')),
  GEMINI_API_KEY: z.string().min(1).optional().or(z.literal('')),

  // External AI Endpoints
  GROQ_API_URL: z.string().url().default('https://api.groq.com/openai/v1/chat/completions'),
  OPENROUTER_API_URL: z.string().url().default('https://openrouter.ai/api/v1/chat/completions'),
  GEMINI_API_BASE_URL: z.string().url().default('https://generativelanguage.googleapis.com/v1beta'),

  // Server Port
  PORT: z.coerce.number().default(3000),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

function getRawServerEnv() {
  return {
    SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY || undefined,
    SUPABASE_PROJECT_REF: process.env.SUPABASE_PROJECT_REF || undefined,
    SUPABASE_URL: process.env.SUPABASE_URL || undefined,
    SUPABASE_PUBLISHABLE_KEY: process.env.SUPABASE_PUBLISHABLE_KEY || undefined,
    SUPABASE_JWKS_URL: process.env.SUPABASE_JWKS_URL || undefined,
    GROQ_API_KEY: process.env.GROQ_API_KEY || undefined,
    OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY || undefined,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || undefined,
    GROQ_API_URL: process.env.GROQ_API_URL || undefined,
    OPENROUTER_API_URL: process.env.OPENROUTER_API_URL || undefined,
    GEMINI_API_BASE_URL: process.env.GEMINI_API_BASE_URL || undefined,
    PORT: process.env.PORT || undefined,
  };
}

function parseServerEnv(): ServerEnv {
  if (isBrowserContext()) {
    throw new Error('[Security Violation] Cannot parse server environment in browser context.');
  }

  const raw = getRawServerEnv();
  const parsed = serverEnvSchema.safeParse(raw);

  if (!parsed.success) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[ENV ERROR] Invalid server environment variables:\n', parsed.error.format());
      throw new Error('Invalid server environment configuration');
    } else {
      console.warn('[ENV WARNING] Server environment validation issues in non-production mode:', parsed.error.issues);
      return serverEnvSchema.parse({
        ...raw,
        GROQ_API_URL: raw.GROQ_API_URL || 'https://api.groq.com/openai/v1/chat/completions',
        OPENROUTER_API_URL: raw.OPENROUTER_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
        GEMINI_API_BASE_URL: raw.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta',
      });
    }
  }

  return parsed.data;
}

// ============================================================================
// 3. Exported Instances & Proxies
// ============================================================================

const cachedClientEnv = parseClientEnv();
const cachedServerEnv = isNode && !isBrowserContext() ? parseServerEnv() : ({} as ServerEnv);

/**
 * Client-safe environment proxy:
 * In development and test environments on Node, dynamically reads process.env to support test mutations.
 * In browser or production, reads validated client values.
 */
export const clientEnv: ClientEnv = new Proxy(cachedClientEnv, {
  get(target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;

    if (isNode && process.env.NODE_ENV !== 'production' && prop in getRawClientEnv()) {
      const dynamicVal = (process.env as Record<string, string | undefined>)[prop];
      if (dynamicVal !== undefined) {
        return dynamicVal === '' ? undefined : dynamicVal;
      }
      if (prop === 'NEXT_PUBLIC_SITE_URL' || prop === 'NEXT_PUBLIC_VERCEL_URL') {
        return undefined;
      }
    }

    return (target as Record<string, unknown>)[prop];
  },
  has(target, prop: string | symbol) {
    return prop in target || (typeof prop === 'string' && prop in getRawClientEnv());
  },
});

/**
 * Server-only environment proxy:
 * Protects server secrets: throws a runtime exception if accessed from browser clients.
 * In server runtime or test runner (Vitest), safely provides secrets unless simulating browser.
 */
export const serverEnv: ServerEnv = new Proxy({} as ServerEnv, {
  get(target, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;

    if (isBrowserContext()) {
      throw new Error(
        `[Security Violation] Attempted to access server-only environment variable "${String(
          prop
        )}" from browser client!`
      );
    }

    if (isNode && process.env.NODE_ENV !== 'production' && prop in getRawServerEnv()) {
      const dynamicVal = (process.env as Record<string, unknown>)[prop];
      if (dynamicVal !== undefined && dynamicVal !== '') {
        return dynamicVal;
      }
    }

    return (cachedServerEnv as Record<string, unknown>)[prop];
  },
  has(target, prop: string | symbol) {
    if (typeof prop !== 'string') return false;

    if (isBrowserContext()) {
      throw new Error(
        `[Security Violation] Attempted to access server-only environment variable "${String(
          prop
        )}" from browser client!`
      );
    }

    return prop in cachedServerEnv || (isNode && prop in getRawServerEnv());
  },
});

/**
 * Backwards-compatible unified environment:
 * Existing code importing `import { env } from '@/config/env'` continues to work seamlessly.
 * In browser runtimes, server-only secret lookups are safely blocked.
 */
export type Env = ClientEnv & ServerEnv;

export const env: Env = new Proxy({} as Env, {
  get(_, prop: string | symbol) {
    if (typeof prop !== 'string') return undefined;

    // Check clientEnv first
    if (prop in clientEnv || prop.startsWith('NEXT_PUBLIC_') || prop === 'NODE_ENV') {
      return (clientEnv as Record<string, unknown>)[prop];
    }

    // Block server secrets in browser context
    if (isBrowserContext()) {
      console.warn(
        `[Security Warning] Blocked attempt to access server-only environment variable "${prop}" from browser context.`
      );
      return undefined;
    }

    // Access from serverEnv
    if (prop in serverEnv) {
      return (serverEnv as Record<string, unknown>)[prop];
    }

    return undefined;
  },
  has(_, prop: string | symbol) {
    if (typeof prop !== 'string') return false;
    if (prop in clientEnv || prop.startsWith('NEXT_PUBLIC_') || prop === 'NODE_ENV') {
      return true;
    }
    if (!isBrowserContext() && prop in serverEnv) {
      return true;
    }
    return false;
  },
});

const currentEnv =
  clientEnv.NODE_ENV ??
  (typeof process !== 'undefined' ? process.env?.NODE_ENV : undefined) ??
  'development';
export const isProduction = currentEnv === 'production';
export const isDevelopment = currentEnv === 'development';
export const isTest = currentEnv === 'test';


