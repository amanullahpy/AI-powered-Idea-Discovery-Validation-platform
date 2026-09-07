import { describe, it, expect } from 'vitest';
import { structuredIdeaSchema, extractStructuredIdea, synthesizeIdeaFromPrompt } from './provider';
import { checkRateLimit } from './rate-limiter';
import { buildSystemPrompt } from './prompts';
import { optimizeConversationHistory, compactAssistantMessage } from './memory';

describe('structuredIdeaSchema', () => {
  it('should validate a complete, well-formed structured idea', () => {
    const validIdea = {
      title: 'Valid Startup Idea',
      shortDescription: 'A very detailed short description for this validated test concept.',
      categorySlug: 'saas',
      problem: 'This is an extensive problem description that explains why customers struggle with this issue every day.',
      solution: 'This is an extensive solution description explaining the exact proposed software workflow.',
      targetAudience: 'Early-stage bootstrapped founders and indie hackers.',
      monetization: '$29/month subscription tier with a 14-day free trial.',
      difficulty: 'INTERMEDIATE' as const,
      estimatedCost: '$50 - $100',
      estimatedTime: '2 - 3 weeks',
      mvpFeatures: ['Feature 1', 'Feature 2', 'Feature 3'],
      whyItFits: 'Fits your schedule and software skills perfectly.',
    };

    const parsed = structuredIdeaSchema.safeParse(validIdea);
    expect(parsed.success).toBe(true);
  });

  it('should reject idea with too short problem or title', () => {
    const invalidIdea = {
      title: 'A', // Too short
      shortDescription: 'Short',
      categorySlug: 'saas',
      problem: 'Short',
      solution: 'Short',
      targetAudience: 'All',
      monetization: '$1',
      difficulty: 'INTERMEDIATE',
      estimatedCost: '$0',
      estimatedTime: '1 day',
      mvpFeatures: ['Just one'],
      whyItFits: 'Good',
    };

    const parsed = structuredIdeaSchema.safeParse(invalidIdea);
    expect(parsed.success).toBe(false);
  });
});

describe('checkRateLimit', () => {
  it('should allow requests within limit and reject when exceeded', () => {
    const key = `test-user-${Date.now()}`;
    const config = { maxRequests: 3, windowMs: 10000 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);

    // 4th request exceeds maxRequests of 3
    const fourth = checkRateLimit(key, config);
    expect(fourth.allowed).toBe(false);
    expect(fourth.remaining).toBe(0);
    expect(fourth.retryAfterSec).toBeGreaterThan(0);
  });
});

describe('extractStructuredIdea', () => {
  it('should extract structured idea JSON block from LLM markdown output and clean text', () => {
    const llmOutput = `Here is a validated startup concept for you:

\`\`\`json
{
  "title": "LeadSnip",
  "shortDescription": "Browser extension that extracts verified B2B emails directly from LinkedIn.",
  "categorySlug": "saas",
  "problem": "Sales reps waste 20 hours weekly manually searching and copying emails from social profiles.",
  "solution": "A one-click Chrome extension that integrates with hunter APIs to enrich contacts instantly.",
  "targetAudience": "B2B SDRs, solo recruiters, and early-stage agency founders.",
  "monetization": "$29/month for 500 email lookups.",
  "difficulty": "INTERMEDIATE",
  "estimatedCost": "$50 - $100",
  "estimatedTime": "2 - 3 weeks",
  "mvpFeatures": ["LinkedIn DOM scraper", "SMTP email verification", "CSV Export"],
  "whyItFits": "Matches your Next.js and web extension skills."
}
\`\`\`

Let me know if you would like to adjust the pricing model!`;

    const { idea, cleanText } = extractStructuredIdea(llmOutput);
    expect(idea).not.toBeNull();
    expect(idea?.title).toBe('LeadSnip');
    expect(idea?.categorySlug).toBe('saas');
    expect(cleanText).toContain('Here is a validated startup concept for you:');
    expect(cleanText).toContain('Let me know if you would like to adjust the pricing model!');
    expect(cleanText).not.toContain('```json');
  });
});

describe('synthesizeIdeaFromPrompt', () => {
  it('should generate valid ideas for student / FYP keywords', () => {
    const idea = synthesizeIdeaFromPrompt('I need a final year project idea for students');
    expect(idea.title).toContain('StudyCollab');
    expect(idea.categorySlug).toBe('student-fyp');
    expect(idea.mvpFeatures.length).toBeGreaterThanOrEqual(3);
    const validated = structuredIdeaSchema.safeParse(idea);
    expect(validated.success).toBe(true);
  });

  it('should generate valid low-risk ideas for bootstrapper keywords', () => {
    const idea = synthesizeIdeaFromPrompt('Give me a simple low risk idea with $200 budget in 2 weeks');
    expect(idea.title).toContain('MicroAudit');
    expect(idea.difficulty).toBe('BEGINNER');
    const validated = structuredIdeaSchema.safeParse(idea);
    expect(validated.success).toBe(true);
  });
});

describe('buildSystemPrompt', () => {
  it('should embed user persona, skills, budget, and time into the system prompt', () => {
    const prompt = buildSystemPrompt(
      {
        experienceLevel: 'ADVANCED',
        budgetBracket: '50_TO_250',
        availableTime: '4_TO_8_HRS',
        skills: ['TypeScript', 'Supabase', 'Python'],
        interests: ['AI Products', 'Automation'],
        goals: ['Reach $5k MRR'],
        targetMarket: 'B2B SaaS',
      },
      'bootstrapper'
    );

    expect(prompt).toContain('Solo Bootstrapper');
    expect(prompt).toContain('TypeScript, Supabase, Python');
    expect(prompt).toContain('50_TO_250');
    expect(prompt).toContain('4_TO_8_HRS');
    expect(prompt).toContain('Reach $5k MRR');
  });
});

describe('memory and token optimization', () => {
  it('should compact large JSON code blocks in older assistant turns', () => {
    const oldAssistantMsg = `Here is your blueprint:
\`\`\`json
{
  "title": "CloudSync",
  "shortDescription": "Backup tool",
  "difficulty": "BEGINNER"
}
\`\`\`
Any questions?`;

    const compacted = compactAssistantMessage(oldAssistantMsg);
    expect(compacted).not.toContain('```json');
    expect(compacted).toContain('Referenced Blueprint: "CloudSync"');
    expect(compacted).toContain('Any questions?');
  });

  it('should keep conversation history strictly within budget', () => {
    const longHistory: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [
      { role: 'user', content: 'Tell me an idea for food trucks ' + 'word '.repeat(300) },
      { role: 'assistant', content: 'Food truck idea ' + 'word '.repeat(300) },
      { role: 'user', content: 'What about a fitness app? ' + 'word '.repeat(300) },
      { role: 'assistant', content: 'Fitness app idea ' + 'word '.repeat(300) },
      { role: 'user', content: 'Can we make it for pets?' },
    ];

    const { messages, estimatedTokens } = optimizeConversationHistory(longHistory, 600);
    expect(estimatedTokens).toBeLessThanOrEqual(700);
    expect(messages.length).toBeLessThan(longHistory.length);
    // Should preserve the most recent user message
    expect(messages[messages.length - 1].content).toBe('Can we make it for pets?');
  });
});
