import { Suspense } from 'react';
import { getCachedLoggedInUserId } from '@/rsc-data/supabase';
import { createSupabaseClient } from '@/supabase-clients/server';
import { ActivityView, type AuditEventItem } from './activity-view';
import { redirect } from 'next/navigation';
import { siteConfig } from '@/config/site';

export const instant = false;

export const metadata = {
  title: `Activity & Audit Trail — ${siteConfig.name}`,
  description: `Cryptographically verified event stream, security logs, and AI invocation ledger on ${siteConfig.name}.`,
};

export default async function ActivityPage() {
  const userId = await getCachedLoggedInUserId();
  if (!userId) {
    redirect('/login');
  }

  const supabase = await createSupabaseClient();
  const { data } = await supabase
    .from('audit_events')
    .select('id, event_type, entity_type, entity_id, metadata, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const events: AuditEventItem[] = (data || []).map((row) => ({
    id: row.id,
    event_type: row.event_type,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    metadata: row.metadata,
    created_at: row.created_at,
  }));

  return (
    <div className="flex-1 overflow-y-auto">
      <Suspense fallback={null}>
        <ActivityView events={events} />
      </Suspense>
    </div>
  );
}
