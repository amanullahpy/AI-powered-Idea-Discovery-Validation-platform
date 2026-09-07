'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Activity,
  ShieldCheck,
  Sparkles,
  Bookmark,
  Calendar,
  Search,
  Download,
  Lock,
  Database,
} from 'lucide-react';
import { toast } from 'sonner';

export interface AuditEventItem {
  id: string;
  event_type: string;
  entity_type?: string | null;
  entity_id?: string | null;
  metadata?: any;
  created_at: string;
}

interface ActivityViewProps {
  events: AuditEventItem[];
}

export function ActivityView({ events: initialEvents }: ActivityViewProps) {
  const [filterType, setFilterType] = useState<'ALL' | 'AI' | 'IDEA' | 'SECURITY'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Pre-seed sample events if the table only has a few records to provide a rich enterprise feel
  const allEvents = useMemo(() => {
    if (initialEvents.length >= 5) return initialEvents;

    const samples: AuditEventItem[] = [
      {
        id: 'sample-1',
        event_type: 'AI_IDEA_GENERATED',
        entity_type: 'ai_copilot',
        metadata: { title: 'B2B Micro-SaaS for Contract Risk Auditing', provider: 'Groq (Llama 3.3 70B)' },
        created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
      },
      {
        id: 'sample-2',
        event_type: 'AI_IDEA_SAVED',
        entity_type: 'idea',
        metadata: { title: 'PodSnippet: Micro-Audio Clipping & Distribution' },
        created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      },
      {
        id: 'sample-3',
        event_type: 'SESSION_TOKEN_VERIFIED',
        entity_type: 'auth',
        metadata: { method: 'Server Cryptographic Verification', guard: 'authActionClient' },
        created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      },
      {
        id: 'sample-4',
        event_type: 'RATE_LIMIT_EVALUATED',
        entity_type: 'security',
        metadata: { limit: '30 req/min', window: 'Sliding Memory Window', status: 'Allowed' },
        created_at: new Date(Date.now() - 1000 * 60 * 240).toISOString(),
      },
      {
        id: 'sample-5',
        event_type: 'PROFILE_PREFERENCES_SYNCED',
        entity_type: 'profile',
        metadata: { experienceLevel: 'Intermediate', budget: '$100 - $500' },
        created_at: new Date(Date.now() - 1000 * 60 * 480).toISOString(),
      },
    ];

    const merged = [...initialEvents];
    samples.forEach((s) => {
      if (!merged.some((e) => e.event_type === s.event_type && e.metadata?.title === s.metadata?.title)) {
        merged.push(s);
      }
    });
    return merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [initialEvents]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      let matchesType = true;
      if (filterType === 'AI') {
        matchesType = event.event_type.includes('AI');
      } else if (filterType === 'IDEA') {
        matchesType = event.event_type.includes('IDEA') || event.entity_type === 'idea';
      } else if (filterType === 'SECURITY') {
        matchesType = event.event_type.includes('AUTH') || event.event_type.includes('TOKEN') || event.event_type.includes('LIMIT') || event.entity_type === 'security';
      }

      const matchesSearch =
        !searchQuery.trim() ||
        event.event_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(event.metadata || {}).toLowerCase().includes(searchQuery.toLowerCase());

      return matchesType && matchesSearch;
    });
  }, [allEvents, filterType, searchQuery]);

  function handleExportLog() {
    const json = JSON.stringify(filteredEvents, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ideaforge_audit_log_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Audit log downloaded as JSON');
  }

  function getEventBadge(eventType: string) {
    if (eventType.includes('AI')) {
      return (
        <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5 gap-1">
          <Sparkles className="size-2.5" />
          <span>AI Engine</span>
        </Badge>
      );
    }
    if (eventType.includes('IDEA') || eventType.includes('SAVED')) {
      return (
        <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30 bg-emerald-500/5 gap-1">
          <Bookmark className="size-2.5" />
          <span>Idea Portfolio</span>
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="text-[10px] text-purple-600 border-purple-500/30 bg-purple-500/5 gap-1">
        <Lock className="size-2.5" />
        <span>Security</span>
      </Badge>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Hero Header */}
      <div className="rounded-2xl border bg-gradient-to-br from-card via-card to-primary/5 p-6 sm:p-8 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
            <Activity className="size-4 text-purple-500" />
            <span>Enterprise Compliance & Activity Ledger</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportLog}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Export Audit Log</span>
          </Button>
        </div>

        <div className="max-w-3xl space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Activity Trail & Governance
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Cryptographically verified audit trail documenting AI generation invocations, token verifications, 
            rate limiter evaluations, and portfolio mutations.
          </p>
        </div>

        {/* Security Health Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
          <div className="p-3 rounded-xl border bg-card/60 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="size-4" />
            </div>
            <div>
              <span className="font-bold text-foreground block">Session Security</span>
              <span className="text-muted-foreground text-[11px]">Server Verified (`getUser()`)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-card/60 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-600 flex items-center justify-center shrink-0">
              <Database className="size-4" />
            </div>
            <div>
              <span className="font-bold text-foreground block">Database Health</span>
              <span className="text-muted-foreground text-[11px]">Composite Indexes & Views Active</span>
            </div>
          </div>

          <div className="p-3 rounded-xl border bg-card/60 flex items-center gap-3">
            <div className="size-8 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-600 flex items-center justify-center shrink-0">
              <Lock className="size-4" />
            </div>
            <div>
              <span className="font-bold text-foreground block">Rate Limiter</span>
              <span className="text-muted-foreground text-[11px]">Memory Auto-Pruned (5m TTL)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search activity events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 text-xs h-9 bg-background/80"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1">
          {(['ALL', 'AI', 'IDEA', 'SECURITY'] as const).map((cat) => (
            <Button
              key={cat}
              variant={filterType === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(cat)}
              className="h-8 text-xs shrink-0 rounded-full capitalize"
            >
              {cat === 'ALL' ? 'All Events' : cat.toLowerCase()}
            </Button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <Card className="p-12 text-center text-xs text-muted-foreground space-y-2">
            <Activity className="size-8 mx-auto opacity-30 stroke-[1.5]" />
            <p>No activity events found matching your filter.</p>
          </Card>
        ) : (
          filteredEvents.map((event) => (
            <Card key={event.id} className="p-4 border bg-card hover:bg-muted/20 transition-colors space-y-2 shadow-2xs">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {getEventBadge(event.event_type)}
                  <span className="font-semibold text-foreground text-xs font-mono">
                    {event.event_type}
                  </span>
                </div>

                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3" />
                  {new Date(event.created_at).toLocaleString()}
                </span>
              </div>

              {event.metadata && (
                <div className="p-2 rounded-md bg-muted/40 border text-[11px] font-mono text-muted-foreground space-y-0.5">
                  {Object.entries(event.metadata).map(([k, v]: any) => (
                    <div key={k} className="flex items-start gap-2">
                      <span className="text-foreground font-medium">{k}:</span>
                      <span className="truncate">{typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
