import { createSupabaseClient } from '@/supabase-clients/server';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  action: string;
  userId?: string | null;
  requestId?: string;
  durationMs?: number;
  metadata?: Record<string, any>;
  error?: string;
}

export function logEvent(
  level: LogLevel,
  action: string,
  details: {
    userId?: string | null;
    durationMs?: number;
    metadata?: Record<string, any>;
    error?: unknown;
  } = {}
) {
  const entry: StructuredLog = {
    timestamp: new Date().toISOString(),
    level,
    action,
    userId: details.userId,
    durationMs: details.durationMs,
    metadata: details.metadata,
    error: details.error instanceof Error ? details.error.message : (details.error ? String(details.error) : undefined),
  };

  // Safe structured output without secrets
  const line = JSON.stringify(entry);
  if (level === 'error') {
    console.error(line);
  } else if (level === 'warn') {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export async function emitAuditEvent(params: {
  userId?: string | null;
  eventType: string;
  entityType: string;
  entityId?: string | null;
  metadata?: Record<string, any>;
  ipAddress?: string | null;
}) {
  try {
    const supabase = await createSupabaseClient();
    await supabase.from('audit_events').insert({
      user_id: params.userId || null,
      event_type: params.eventType,
      entity_type: params.entityType,
      entity_id: params.entityId || null,
      metadata: (params.metadata || {}) as any,
      ip_address: params.ipAddress || null,
    });
  } catch (err) {
    // Non-blocking log
    logEvent('warn', 'AUDIT_EMIT_FAILED', { error: err });
  }
}
