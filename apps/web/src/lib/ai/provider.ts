import { z } from 'zod';
import { siteConfig } from '@/config/site';
import { buildSystemPrompt, PersonaArchetype } from './prompts';
import { optimizeConversationHistory, estimateTokens } from './memory';
import { AIProviderId } from './models';

export const structuredIdeaSchema = z.object({
  title: z.string().min(3).max(120),
  shortDescription: z.string().min(10).max(300),
  categorySlug: z.string(),
  problem: z.string().min(20).max(2000),
  solution: z.string().min(20).max(2000),
  targetAudience: z.string().min(10).max(1000),
  monetization: z.string().min(10).max(1000),
  difficulty: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'HARD']),
  estimatedCost: z.string(),
  estimatedTime: z.string(),
  mvpFeatures: z.array(z.string()).min(2).max(8),
  whyItFits: z.string().max(500),
});

export type StructuredIdeaOutput = z.infer<typeof structuredIdeaSchema>;

export interface AIMessageContext {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserPersonalizationContext {
  interests?: string[];
  skills?: string[];
  goals?: string[];
  markets?: string[];
  experienceLevel?: string | null;
  budgetBracket?: string | null;
  availableTime?: string | null;
  targetMarket?: string | null;
  personaArchetype?: PersonaArchetype;
}

export interface ProviderCallConfig {
  provider?: AIProviderId;
  modelId?: string;
  customApiKey?: string;
}

export interface GenerationResult {
  idea: StructuredIdeaOutput;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

export interface ChatResult {
  reply: string;
  suggestedIdea?: StructuredIdeaOutput | null;
  model: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  latencyMs: number;
}

/**
 * Intelligent Local Synthesizer:
 * Realistic, domain-tailored generation that runs with zero API keys or during offline/fallback mode.
 */
export function synthesizeIdeaFromPrompt(
  prompt: string,
  userContext?: UserPersonalizationContext
): StructuredIdeaOutput {
  const p = prompt.toLowerCase();

  let categorySlug = 'saas';
  if (p.includes('ai') || p.includes('bot') || p.includes('agent') || p.includes('llm')) categorySlug = 'ai-products';
  else if (p.includes('mobile') || p.includes('ios') || p.includes('android')) categorySlug = 'mobile-apps';
  else if (p.includes('side hustle') || p.includes('passive') || p.includes('cash') || p.includes('part-time')) categorySlug = 'side-hustles';
  else if (p.includes('student') || p.includes('fyp') || p.includes('college') || p.includes('university') || p.includes('exam')) categorySlug = 'student-fyp';
  else if (p.includes('ecommerce') || p.includes('shop') || p.includes('store') || p.includes('product')) categorySlug = 'ecommerce';
  else if (p.includes('dev') || p.includes('code') || p.includes('cli') || p.includes('api') || p.includes('github')) categorySlug = 'developer-tools';
  else if (p.includes('automation') || p.includes('workflow') || p.includes('webhook')) categorySlug = 'automation';
  else if (userContext?.interests?.[0]) {
    categorySlug = userContext.interests[0].toLowerCase().replace(/\s+/g, '-');
  }

  // Base concept derivation
  let title = 'SmartFlow: Automated Workflow Intelligence';
  let shortDesc = 'A focused webhook and micro-automation connector that eliminates repetitive manual SaaS handoffs.';
  let problem = 'Solo founders, agencies, and lean teams spend 12+ hours weekly on tedious manual data entry, customer follow-up syncs, and disconnected SaaS handoffs.';
  let solution = 'A lightweight, zero-overhead connector that monitors incoming triggers (webhooks, forms, emails) and executes conditional multi-step automations with instant error alerts.';
  let targetAudience = 'Solo entrepreneurs, boutique digital agencies, and remote knowledge workers.';
  let monetization = '$19/month solo tier (up to 5,000 tasks), $49/month team tier with priority webhooks.';
  let difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'HARD' = 'INTERMEDIATE';
  let cost = '$20 - $80';
  let time = '2 - 3 weeks';
  let mvpFeatures = [
    'One-click Google Sheets, Slack, and Discord webhook integration',
    'Visual 3-step action builder (Trigger -> Filter -> Action)',
    'Real-time execution log with instant retry functionality',
    'Pre-built template library for 10 common creator/agency workflows',
  ];

  if (p.includes('student') || p.includes('fyp') || userContext?.personaArchetype === 'student') {
    title = 'StudyCollab: AI Campus Exam Prep & Peer Review';
    shortDesc = 'Collaborative revision rooms that turn lecture PDFs and past papers into interactive mock exam questions.';
    problem = 'University students study in isolation, struggle to predict exam question structures, and lack fast peer review feedback on complex practice questions.';
    solution = 'Upload lecture slide PDFs to generate customized practice exams, participate in synchronized timed revision rooms with classmates, and compare detailed explanations.';
    targetAudience = 'Undergraduate university students, study cohorts, and academic tutors.';
    monetization = 'Free for 3 mock exams per month, $5/semester student pass for unlimited generation.';
    difficulty = 'BEGINNER';
    cost = '$0 - $30';
    time = '2 - 3 weeks';
    mvpFeatures = [
      'Lecture slide PDF to interactive quiz transformer',
      'Synchronized multiplayer study room with countdown timer',
      'Peer review answer comparison board with instant scoring',
      'Weakness diagnosis scorecard highlighting syllabus blind spots',
    ];
  } else if (p.includes('dev') || p.includes('code') || p.includes('cli') || p.includes('next.js')) {
    title = 'EnvGuard: Zero-Leak Team Environment Manager';
    shortDesc = 'Lightweight CLI and dashboard that injects verified, encrypted secrets into developer machines without exposing credentials in Git or CI logs.';
    problem = 'Teams accidentally commit production API keys to GitHub, and new engineering onboarding is stalled for days waiting for .env credentials.';
    solution = 'A single binary CLI that pulls encrypted scoped secrets into memory during local execution, with instant audit trails when variables are accessed.';
    targetAudience = 'Full-stack software engineers, indie makers, and early-stage tech startups.';
    monetization = 'Free for solo devs (up to 3 projects), $12/user/mo for teams with RBAC access audit logs.';
    difficulty = 'INTERMEDIATE';
    cost = '$10 - $50';
    time = '1 - 2 weeks';
    mvpFeatures = [
      'Encrypted CLI sync tool (`envguard run -- next dev`)',
      'Project-level team role-based access dashboard',
      'One-click secret rotation webhook notifications',
      'Git pre-commit scanner preventing accidental secret leakage',
    ];
  } else if (p.includes('low risk') || p.includes('simple') || p.includes('2 week') || p.includes('$200') || userContext?.personaArchetype === 'side_hustle') {
    title = 'MicroAudit: 60-Second Conversion Teardown for Founders';
    shortDesc = 'Instant UX and copywriting teardown tool highlighting conversion leaks and friction points for bootstrapped founders.';
    problem = 'Early-stage founders launch landing pages that suffer from high bounce rates and unclear value propositions without knowing why visitors leave.';
    solution = 'Submit any website URL to receive a structured 5-point conversion audit analyzing headline clarity, visual hierarchy, mobile speed, and trust signals.';
    targetAudience = 'Indie hackers, ProductHunt makers, and solo digital creators.';
    monetization = '$15 per full audit scorecard or $39 for 5 teardown credits.';
    difficulty = 'BEGINNER';
    cost = '$0 - $40';
    time = '1 - 2 weeks';
    mvpFeatures = [
      'Automated screenshot & headline extraction engine',
      '5-pillar scoring checklist (Clarity, Value, Proof, CTA, Speed)',
      'Actionable rewrite suggestions for hero section copy',
      'Exportable high-converting PDF teardown scorecard',
    ];
  }

  const skillsList = userContext?.skills?.length ? userContext.skills.slice(0, 3).join(', ') : 'modern web tools';
  const whyItFits = `Tailored for ${userContext?.personaArchetype || 'bootstrapped execution'} using ${skillsList} with minimal capital overhead.`;

  return {
    title,
    shortDescription: shortDesc,
    categorySlug,
    problem,
    solution,
    targetAudience,
    monetization,
    difficulty,
    estimatedCost: cost,
    estimatedTime: time,
    mvpFeatures,
    whyItFits,
  };
}

/**
 * Robust extractor for structured idea JSON from LLM text responses
 */
export function extractStructuredIdea(text: string): { idea: StructuredIdeaOutput | null; cleanText: string } {
  if (!text) return { idea: null, cleanText: '' };

  // Match ```json ... ``` blocks
  const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/;
  const match = text.match(jsonRegex);

  if (match && match[1]) {
    try {
      const parsed = JSON.parse(match[1]);
      const validated = structuredIdeaSchema.safeParse(parsed);
      if (validated.success) {
        // Strip the json block from visible conversational text
        const cleanText = text.replace(jsonRegex, '').trim();
        return { idea: validated.data, cleanText };
      }
    } catch {
      // ignore
    }
  }

  // Fallback: look for naked JSON { ... }
  const rawJsonMatch = text.match(/(\{[\s\S]*"title"[\s\S]*"categorySlug"[\s\S]*\})/);
  if (rawJsonMatch && rawJsonMatch[1]) {
    try {
      const parsed = JSON.parse(rawJsonMatch[1]);
      const validated = structuredIdeaSchema.safeParse(parsed);
      if (validated.success) {
        const cleanText = text.replace(rawJsonMatch[1], '').trim();
        return { idea: validated.data, cleanText };
      }
    } catch {
      // ignore
    }
  }

  return { idea: null, cleanText: text };
}

/**
 * Call Groq API (High Speed, OpenAI-compatible)
 */
async function callGroqAPI(
  messages: Array<{ role: string; content: string }>,
  modelId: string = 'llama-3.3-70b-versatile',
  customKey?: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const apiKey = customKey || process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('No Groq API key available');

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return {
    text,
    inputTokens: data.usage?.prompt_tokens || 100,
    outputTokens: data.usage?.completion_tokens || 250,
  };
}

/**
 * Call OpenRouter API (Free models aggregator, OpenAI-compatible)
 */
async function callOpenRouterAPI(
  messages: Array<{ role: string; content: string }>,
  modelId: string = 'meta-llama/llama-3.3-70b-instruct:free',
  customKey?: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const apiKey = customKey || process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No OpenRouter API key available');

  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': siteConfig.url,
      'X-Title': siteConfig.name,
    },
    body: JSON.stringify({
      model: modelId,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  return {
    text,
    inputTokens: data.usage?.prompt_tokens || 120,
    outputTokens: data.usage?.completion_tokens || 280,
  };
}

/**
 * Call Google Gemini REST API (Native Google AI Studio)
 */
async function callGeminiAPI(
  messages: Array<{ role: string; content: string }>,
  modelId: string = 'gemini-2.0-flash',
  customKey?: string
): Promise<{ text: string; inputTokens: number; outputTokens: number }> {
  const apiKey = customKey || process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('No Gemini API key available');

  // Separate system message if present
  const systemMsg = messages.find((m) => m.role === 'system');
  const userAndAssistantMsgs = messages.filter((m) => m.role !== 'system');

  const contents = userAndAssistantMsgs.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  const payload: any = {
    contents,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 2048,
    },
  };

  if (systemMsg) {
    payload.systemInstruction = {
      parts: [{ text: systemMsg.content }],
    };
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    text,
    inputTokens: data.usageMetadata?.promptTokenCount || 150,
    outputTokens: data.usageMetadata?.candidatesTokenCount || 300,
  };
}

/**
 * Multi-Provider Unified Caller:
 * Dispatches to Groq, OpenRouter, Gemini, or cascade fallback
 */
async function dispatchAICall(
  messages: Array<{ role: string; content: string }>,
  config?: ProviderCallConfig
): Promise<{ text: string; model: string; provider: string; inputTokens: number; outputTokens: number }> {
  const provider = config?.provider || 'auto';
  const requestedModel = config?.modelId;

  // 1. Explicit Groq request
  if (provider === 'groq') {
    const model = requestedModel || 'llama-3.3-70b-versatile';
    const res = await callGroqAPI(messages, model, config?.customApiKey);
    return { ...res, model, provider: 'Groq Cloud' };
  }

  // 2. Explicit OpenRouter request
  if (provider === 'openrouter') {
    const model = requestedModel || 'meta-llama/llama-3.3-70b-instruct:free';
    const res = await callOpenRouterAPI(messages, model, config?.customApiKey);
    return { ...res, model, provider: 'OpenRouter Free' };
  }

  // 3. Explicit Gemini request
  if (provider === 'gemini') {
    const model = requestedModel || 'gemini-2.0-flash';
    const res = await callGeminiAPI(messages, model, config?.customApiKey);
    return { ...res, model, provider: 'Google Gemini' };
  }

  // 4. Auto Mode: Cascade through available keys
  // A. Try Groq if key exists
  if (config?.customApiKey || process.env.GROQ_API_KEY) {
    try {
      const model = requestedModel || 'llama-3.3-70b-versatile';
      const res = await callGroqAPI(messages, model, config?.customApiKey);
      return { ...res, model, provider: 'Groq Cloud' };
    } catch (err) {
      console.warn('Auto mode Groq failed, trying OpenRouter...', err);
    }
  }

  // B. Try OpenRouter if key exists
  if (config?.customApiKey || process.env.OPENROUTER_API_KEY) {
    try {
      const model = requestedModel || 'meta-llama/llama-3.3-70b-instruct:free';
      const res = await callOpenRouterAPI(messages, model, config?.customApiKey);
      return { ...res, model, provider: 'OpenRouter' };
    } catch (err) {
      console.warn('Auto mode OpenRouter failed, trying Gemini...', err);
    }
  }

  // C. Try Gemini if key exists
  if (config?.customApiKey || process.env.GEMINI_API_KEY) {
    try {
      const model = requestedModel || 'gemini-2.0-flash';
      const res = await callGeminiAPI(messages, model, config?.customApiKey);
      return { ...res, model, provider: 'Google Gemini' };
    } catch (err) {
      console.warn('Auto mode Gemini failed, falling back to synthesizer...', err);
    }
  }

  throw new Error('No working AI provider available');
}

/**
 * Main Entry Point: Multi-turn Chat & Structured Idea Generation
 */
export async function generateChatResponse(
  messages: AIMessageContext[],
  userContext?: UserPersonalizationContext,
  config?: ProviderCallConfig
): Promise<ChatResult> {
  const startTime = Date.now();
  const latestMessage = messages[messages.length - 1]?.content || '';

  // 1. Optimize conversation history to stay strictly within token budget
  const { messages: optimizedHistory } = optimizeConversationHistory(messages, 3200);

  // 2. Build system persona prompt
  const systemPrompt = buildSystemPrompt(userContext, userContext?.personaArchetype || 'bootstrapper');

  // Format messages payload with system prompt
  const fullMessages = [
    { role: 'system', content: systemPrompt },
    ...optimizedHistory.map((m) => ({ role: m.role, content: m.content })),
  ];

  // 3. Dispatch to AI Provider with graceful fallback
  try {
    const aiResult = await dispatchAICall(fullMessages, config);
    const latencyMs = Date.now() - startTime;

    // Extract structured idea if present
    const { idea, cleanText } = extractStructuredIdea(aiResult.text);

    return {
      reply: cleanText || aiResult.text,
      suggestedIdea: idea,
      model: aiResult.model,
      provider: aiResult.provider,
      inputTokens: aiResult.inputTokens,
      outputTokens: aiResult.outputTokens,
      latencyMs,
    };
  } catch (err) {
    console.warn('All cloud AI providers failed or no keys set. Using local idea synthesizer engine.', err);

    // Fallback: Local Synthesizer Engine
    const latencyMs = Date.now() - startTime;
    const idea = synthesizeIdeaFromPrompt(latestMessage, userContext);

    const fallbackReply = `I've analyzed your project parameters and generated a tailored concept blueprint for **${idea.title}** below.

### Strategic Highlights
* **Core Problem:** ${idea.problem}
* **Proposed MVP Solution:** ${idea.solution}
* **Target Audience:** ${idea.targetAudience}
* **Monetization Angle:** ${idea.monetization}

You can view the full blueprint details in the card below, or ask me to:
* **Simplify the scope** to ship in under 7 days
* **Test alternative monetization channels** (usage-based, freemium, upfront)
* **Outline the unfair distribution strategy** for organic reach`;

    return {
      reply: fallbackReply,
      suggestedIdea: idea,
      model: 'ideaforge-synthesizer-v2',
      provider: `${siteConfig.name} Local Engine`,
      inputTokens: estimateTokens(latestMessage),
      outputTokens: 380,
      latencyMs,
    };
  }
}

/**
 * Generate a standalone structured idea
 */
export async function generateStructuredIdea(
  prompt: string,
  userContext?: UserPersonalizationContext,
  config?: ProviderCallConfig
): Promise<GenerationResult> {
  const res = await generateChatResponse([{ role: 'user', content: prompt }], userContext, config);
  const idea = res.suggestedIdea || synthesizeIdeaFromPrompt(prompt, userContext);

  return {
    idea,
    model: res.model,
    provider: res.provider,
    inputTokens: res.inputTokens,
    outputTokens: res.outputTokens,
    latencyMs: res.latencyMs,
  };
}
