export type AIProviderId = 'groq' | 'openrouter' | 'gemini' | 'auto' | 'local';

export interface AIModelDefinition {
  id: string;
  name: string;
  provider: AIProviderId;
  description: string;
  badge: string;
  isFreeTier: boolean;
  contextWindow: number;
  recommendedFor: 'speed' | 'quality' | 'reasoning' | 'budget';
}

export const SUPPORTED_MODELS: AIModelDefinition[] = [
  // Groq Models (Ultra-fast inference, generous free tier)
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    description: 'Ultra-fast, state-of-the-art reasoning for startup validation & roadmaps.',
    badge: '⚡ Groq (Fastest)',
    isFreeTier: true,
    contextWindow: 128000,
    recommendedFor: 'speed',
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    description: 'Instant sub-second responses for quick brainstorming and rapid iterations.',
    badge: '⚡ Groq (Instant)',
    isFreeTier: true,
    contextWindow: 128000,
    recommendedFor: 'speed',
  },

  // OpenRouter Models (Aggregator with generous free models)
  {
    id: 'meta-llama/llama-3.3-70b-instruct:free',
    name: 'Llama 3.3 70B (Free)',
    provider: 'openrouter',
    description: 'Flagship open-weights model via OpenRouter Free Tier.',
    badge: '🆓 OpenRouter Free',
    isFreeTier: true,
    contextWindow: 131072,
    recommendedFor: 'quality',
  },
  {
    id: 'google/gemini-2.0-flash-exp:free',
    name: 'Gemini 2.0 Flash Exp (Free)',
    provider: 'openrouter',
    description: 'Google next-gen high-speed multimodal reasoning model via OpenRouter.',
    badge: '🆓 OpenRouter Free',
    isFreeTier: true,
    contextWindow: 1048576,
    recommendedFor: 'speed',
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (Free)',
    provider: 'openrouter',
    description: 'Deep chain-of-thought reasoning for market validation and financial audits.',
    badge: '🧠 OpenRouter Free',
    isFreeTier: true,
    contextWindow: 64000,
    recommendedFor: 'reasoning',
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct:free',
    name: 'Qwen 2.5 Coder 32B (Free)',
    provider: 'openrouter',
    description: 'Specialized code and technical architecture reasoning for MVP scopes.',
    badge: '💻 OpenRouter Free',
    isFreeTier: true,
    contextWindow: 32768,
    recommendedFor: 'quality',
  },

  // Google Gemini Models (Direct Google AI Studio Free Tier)
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    description: 'Google latest flagship fast intelligence model with native structured output.',
    badge: '💎 Google AI Studio',
    isFreeTier: true,
    contextWindow: 1000000,
    recommendedFor: 'quality',
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    description: 'Ultra-low latency generation with strong problem-solving capabilities.',
    badge: '💎 Google AI Studio',
    isFreeTier: true,
    contextWindow: 1000000,
    recommendedFor: 'speed',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    description: 'Reliable, well-tested workhorse model with 15 requests/min free tier.',
    badge: '💎 Google AI Studio',
    isFreeTier: true,
    contextWindow: 1000000,
    recommendedFor: 'budget',
  },
];

export const DEFAULT_MODEL_ID = 'llama-3.3-70b-versatile';

export interface UserAISettings {
  preferredProvider: AIProviderId;
  preferredModelId: string;
  groqApiKey?: string;
  openrouterApiKey?: string;
  geminiApiKey?: string;
  defaultPersonaArchetype?: string;
}

const STORAGE_KEY = 'ideaforge_ai_settings_v1';

export function getClientAISettings(): UserAISettings {
  if (typeof window === 'undefined') {
    return {
      preferredProvider: 'auto',
      preferredModelId: DEFAULT_MODEL_ID,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return {
        preferredProvider: 'auto',
        preferredModelId: DEFAULT_MODEL_ID,
      };
    }
    return JSON.parse(raw);
  } catch {
    return {
      preferredProvider: 'auto',
      preferredModelId: DEFAULT_MODEL_ID,
    };
  }
}

export function saveClientAISettings(settings: Partial<UserAISettings>): UserAISettings {
  if (typeof window === 'undefined') return { preferredProvider: 'auto', preferredModelId: DEFAULT_MODEL_ID };

  const current = getClientAISettings();
  const updated: UserAISettings = {
    ...current,
    ...settings,
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.warn('Failed to save AI settings to localStorage', err);
  }

  return updated;
}
