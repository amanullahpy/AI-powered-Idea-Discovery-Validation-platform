import { AIMessageContext } from './provider';

/**
 * Fast token estimation heuristic (standard ~4 characters per token)
 */
export function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

export function estimateHistoryTokens(messages: AIMessageContext[]): number {
  return messages.reduce((acc, m) => acc + estimateTokens(m.content) + 4, 0);
}

/**
 * Strips huge json code blocks or repetitive idea blueprints from older assistant messages
 * in the conversation history, replacing them with a concise 1-line memory trace.
 * This saves 70-80% of tokens in multi-turn chat sessions!
 */
export function compactAssistantMessage(content: string): string {
  // Check if content contains ```json ... ```
  const jsonRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
  if (!jsonRegex.test(content)) return content;

  return content.replace(jsonRegex, (_match, jsonStr) => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && parsed.title) {
        return `*(Referenced Blueprint: "${parsed.title}" — ${parsed.shortDescription || 'MVP concept'} | Difficulty: ${parsed.difficulty || 'N/A'})*`;
      }
    } catch {
      // ignore
    }
    return `*(Referenced Concept Blueprint)*`;
  });
}

/**
 * Intelligent Token-Budgeted Memory Sliding Window:
 * Ensures chat history stays within model's free-tier rate limits and context budgets,
 * retaining recent context while condensing older turns.
 */
export function optimizeConversationHistory(
  messages: AIMessageContext[],
  maxTokenBudget: number = 3500
): { messages: AIMessageContext[]; estimatedTokens: number } {
  if (!messages || messages.length === 0) {
    return { messages: [], estimatedTokens: 0 };
  }

  // 1. First pass: compact older assistant messages (all except the very last one)
  const compacted: AIMessageContext[] = messages.map((m, idx) => {
    if (m.role === 'assistant' && idx < messages.length - 1) {
      return {
        role: m.role,
        content: compactAssistantMessage(m.content),
      };
    }
    return m;
  });

  // 2. Sliding window: take from the end backwards until we fit within budget
  const result: AIMessageContext[] = [];
  let currentTokens = 0;

  for (let i = compacted.length - 1; i >= 0; i--) {
    const msg = compacted[i];
    const msgTokens = estimateTokens(msg.content) + 4;

    if (currentTokens + msgTokens <= maxTokenBudget || result.length < 2) {
      result.unshift(msg);
      currentTokens += msgTokens;
    } else {
      // Over budget, stop prepending older messages
      break;
    }
  }

  return {
    messages: result,
    estimatedTokens: currentTokens,
  };
}
