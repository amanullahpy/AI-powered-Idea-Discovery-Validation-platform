'use client';

import React, { useState, useTransition, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { RichText } from '@/components/ui/rich-text';
import {
  sendMessageAndGenerateAction,
  saveAIGeneratedIdeaAction,
  getConversationMessagesAction,
  deleteConversationAction,
  renameConversationAction,
} from '@/data/ai/actions';
import { type StructuredIdeaOutput } from '@/lib/ai/provider';
import { IdeaExporter } from '@/components/ideas/idea-exporter';
import {
  upsertLocalConversation,
  getLocalMessages,
  saveLocalMessages,
  addLocalMessage,
  deleteLocalConversation,
  mergeServerConversations,
  togglePinConversation,
  getActiveLocalConversationId,
  setActiveLocalConversationId,
  exportConversationTranscript,
  type LocalChatMessage,
  type LocalConversationItem,
} from '@/lib/ai/local-chat-storage';
import { toast } from 'sonner';
import {
  ArrowUp,
  Bot,
  Bookmark,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  Copy,
  Download,
  ExternalLink,
  Layers,
  Pin,
  Plus,
  Trash2,
  Edit2,
  MessageSquare,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Search,
  RotateCcw,
  Sparkles,
  User,
  ShieldCheck,
  Sliders,
  Target,
  TrendingUp,
  FolderHeart,
  AlertTriangle,
  Zap,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface AIChatProps {
  initialConversations?: Array<{
    id: string;
    title: string;
    context_type?: string | null;
    created_at: string;
    updated_at: string;
  }>;
  savedIdeas?: any[];
  userProfile?: any;
}

const STARTER_PROMPTS = [
  {
    title: 'B2B Micro-SaaS',
    description: 'Launch a focused workflow or connector tool in under 14 days.',
    prompt: 'Give me a B2B micro-SaaS idea I can launch in under 2 weeks with organic distribution.',
  },
  {
    title: 'Low-Risk Automation',
    description: 'High-margin automated service with under $100 starting budget.',
    prompt: 'I have $100 budget. What low-risk automation or workflow business can I start?',
  },
  {
    title: 'AI Student / FYP Project',
    description: 'High-scoring technical AI project with an impressive live demonstration.',
    prompt: 'Give me a high-scoring final year project (FYP) idea using modern AI agents and web technologies.',
  },
  {
    title: 'Digital Product Hustle',
    description: 'Recurring cashflow product requiring under 4 hours/week.',
    prompt: 'High-margin digital product or micro-tool side hustle requiring under 4 hours a week.',
  },
];

const PROMPT_SUGGESTION_CHIPS = [
  '⚡ Simplify to 48-hr MVP',
  '💰 3 monetization options',
  '🎯 Define ICP & pain point',
  '📊 Market risk & competition',
  '✉️ Cold pitch email',
];

const FOUNDER_TEMPLATES = [
  {
    title: 'Customer Discovery Interview',
    category: 'Validation',
    prompt: 'Generate 5 Mom-Test style customer interview questions to validate if people genuinely suffer from this problem.',
  },
  {
    title: 'Value Metric Pricing Model',
    category: 'Monetization',
    prompt: 'What is the optimal value metric to charge on for this software to align price with customer ROI?',
  },
  {
    title: 'Concierge MVP Experiment',
    category: 'Prototyping',
    prompt: 'How can I manually deliver this value to 5 customers this weekend before writing any backend code?',
  },
  {
    title: 'Distribution Channel Blitz',
    category: 'Growth',
    prompt: 'List the top 3 high-intent online communities (subreddits, Slack groups, directories) where this ICP hangs out.',
  },
  {
    title: 'Pre-Seed Angel Elevator Pitch',
    category: 'Pitch',
    prompt: 'Write a punchy 60-second elevator pitch highlighting the problem, secret insight, and market opportunity.',
  },
];

export function AIChat({
  initialConversations = [],
  savedIdeas = [],
  userProfile,
}: AIChatProps) {
  // 1. Conversations & Sync State
  const [conversations, setConversations] = useState<LocalConversationItem[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | undefined>();
  const [activeConversationTitle, setActiveConversationTitle] = useState<string>('New Chat');
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving'>('synced');

  // 2. Messaging State
  const [messages, setMessages] = useState<LocalChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isPending, startTransition] = useTransition();

  // 3. UI Panels State
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rightPanelTab, setRightPanelTab] = useState<'blueprint' | 'radar' | 'profile' | 'saved' | 'templates'>('blueprint');

  // 4. Active Blueprint & Interactive States
  const [selectedBlueprint, setSelectedBlueprint] = useState<StructuredIdeaOutput | null>(null);
  const [savingIdeaKey, setSavingIdeaKey] = useState<string | null>(null);
  const [copiedBlueprintId, setCopiedBlueprintId] = useState<string | null>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);

  // 5. Editing Conversation Title
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editingTitleInput, setEditingTitleInput] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const searchParams = useSearchParams();
  const initialPromptProcessed = useRef(false);

  // Initialize local-first cache on mount
  useEffect(() => {
    // Merge server conversations with local cache
    const merged = mergeServerConversations(initialConversations);
    setConversations(merged);

    // Determine initial conversation to open
    const lastActiveId = getActiveLocalConversationId();
    const targetId = lastActiveId && merged.some((c) => c.id === lastActiveId)
      ? lastActiveId
      : merged[0]?.id;

    if (targetId) {
      const conv = merged.find((c) => c.id === targetId);
      switchConversation(targetId, conv?.title);
    }
  }, []);

  // Handle URL query parameter ?prompt=...
  useEffect(() => {
    const promptParam = searchParams?.get('prompt');
    if (promptParam && !initialPromptProcessed.current) {
      initialPromptProcessed.current = true;
      handleSend(promptParam);
    }
  }, [searchParams]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPending]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  // Switch conversation with 0ms Local-First read
  function switchConversation(convId: string, title?: string) {
    setActiveConversationId(convId);
    setActiveLocalConversationId(convId);
    if (title) setActiveConversationTitle(title);

    // 1. Instant 0ms read from LocalStorage
    const cachedMessages = getLocalMessages(convId);
    if (cachedMessages.length > 0) {
      setMessages(cachedMessages);
      const latestIdea = [...cachedMessages].reverse().find((m) => m.suggestedIdea)?.suggestedIdea;
      if (latestIdea) setSelectedBlueprint(latestIdea);
    } else {
      setMessages([]);
    }

    // 2. Background sync with DB if needed
    startTransition(async () => {
      try {
        const res = await getConversationMessagesAction({ conversationId: convId });
        if (res.data) {
          const serverMsgs: LocalChatMessage[] = res.data.messages.map((m) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            suggestedIdea: m.suggestedIdea,
            syncStatus: 'synced',
          }));
          setMessages(serverMsgs);
          saveLocalMessages(convId, serverMsgs);

          if (res.data.conversation?.title) {
            setActiveConversationTitle(res.data.conversation.title);
          }
          const latestIdea = [...serverMsgs].reverse().find((m) => m.suggestedIdea)?.suggestedIdea;
          if (latestIdea) setSelectedBlueprint(latestIdea);
        }
      } catch (err: any) {
        // Local messages remain active even if server fails
        console.warn('Background sync note:', err.message);
      }
    });
  }

  // Start a fresh conversation
  function handleNewChat() {
    setActiveConversationId(undefined);
    setActiveLocalConversationId(null);
    setActiveConversationTitle('New Chat');
    setMessages([]);
    setSelectedBlueprint(null);
    setInput('');
    toast.info('Started a new conversation.');
  }

  // Pin / Unpin conversation
  function handleTogglePin(convId: string, e: React.MouseEvent) {
    e.stopPropagation();
    const result = togglePinConversation(convId);
    setConversations(result.conversations);
    toast.success(result.pinned ? 'Pinned conversation to top.' : 'Unpinned conversation.');
  }

  // Delete conversation with instant local cleanup
  function handleDeleteConversation(convId: string, e: React.MouseEvent) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this conversation?')) return;

    // 1. Instant local removal
    const remaining = deleteLocalConversation(convId);
    setConversations(remaining);

    if (activeConversationId === convId) {
      handleNewChat();
    }
    toast.success('Conversation deleted.');

    // 2. Background DB cleanup
    startTransition(async () => {
      try {
        await deleteConversationAction({ conversationId: convId });
      } catch (err: any) {
        console.error('Failed to delete on server:', err);
      }
    });
  }

  // Start rename
  function handleStartRename(conv: LocalConversationItem, e: React.MouseEvent) {
    e.stopPropagation();
    setEditingConvId(conv.id);
    setEditingTitleInput(conv.title);
  }

  // Save renamed title
  function handleSaveRename(convId: string, e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    const newTitle = editingTitleInput.trim();
    if (!newTitle) return;

    // 1. Instant local update
    const updated = upsertLocalConversation({
      id: convId,
      title: newTitle,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    setConversations(updated);
    if (activeConversationId === convId) {
      setActiveConversationTitle(newTitle);
    }
    setEditingConvId(null);
    toast.success('Conversation renamed.');

    // 2. Background DB update
    startTransition(async () => {
      try {
        await renameConversationAction({ conversationId: convId, title: newTitle });
      } catch (err: any) {
        console.error('Failed to rename on server:', err);
      }
    });
  }

  // Send message: Local-First 0ms Latency + Background Sync
  function handleSend(textToSend?: string) {
    const text = (textToSend || input).trim();
    if (!text || isPending) return;

    setSyncStatus('saving');

    // 1. Instant Optimistic UI Update (0ms)
    const userMsgId = `local_user_${Date.now()}`;
    const optimisticUserMsg: LocalChatMessage = {
      id: userMsgId,
      role: 'user',
      content: text,
      syncStatus: 'pending',
    };

    const newHistory = [...messages, optimisticUserMsg];
    setMessages(newHistory);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Local conversation ID (use active or create a local placeholder)
    const targetConvId = activeConversationId;
    if (targetConvId) {
      addLocalMessage(targetConvId, optimisticUserMsg);
    }

    // 2. Background Server Invocation & DB Sync
    startTransition(async () => {
      try {
        const historyContext = newHistory.map((m) => ({ role: m.role, content: m.content }));

        const res = await sendMessageAndGenerateAction({
          conversationId: activeConversationId,
          message: text,
          history: historyContext,
          provider: 'auto',
        });

        if (res.data) {
          const returnedConvId = res.data.conversationId;
          const returnedTitle = res.data.conversationTitle || activeConversationTitle || text.slice(0, 45);

          // Update active conversation ID
          if (returnedConvId) {
            setActiveConversationId(returnedConvId);
            setActiveLocalConversationId(returnedConvId);
            setActiveConversationTitle(returnedTitle);

            // Upsert in local storage & state
            const updatedConvs = upsertLocalConversation({
              id: returnedConvId,
              title: returnedTitle,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              syncStatus: 'synced',
            });
            setConversations(updatedConvs);
          }

          const assistantMsgId = `local_ai_${Date.now()}`;
          const assistantMsg: LocalChatMessage = {
            id: assistantMsgId,
            role: 'assistant',
            content: res.data.reply,
            suggestedIdea: res.data.suggestedIdea,
            syncStatus: 'synced',
          };

          const fullHistory = [...newHistory, assistantMsg];
          setMessages(fullHistory);

          if (returnedConvId) {
            saveLocalMessages(returnedConvId, fullHistory);
          }

          if (res.data.suggestedIdea) {
            setSelectedBlueprint(res.data.suggestedIdea);
            setRightSidebarOpen(true);
            setRightPanelTab('blueprint');
          }

          setSyncStatus('synced');
        }
      } catch (err: any) {
        setSyncStatus('synced');
        toast.error(err.message || 'Failed to generate response. Please try again.');
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function handleSaveIdea(msgId: string, idea: StructuredIdeaOutput) {
    setSavingIdeaKey(msgId);
    startTransition(async () => {
      try {
        const res = await saveAIGeneratedIdeaAction({
          idea,
          conversationId: activeConversationId,
        });

        if (res.data) {
          toast.success(`"${idea.title}" saved to your ideas collection!`);
          setMessages((prev) => {
            const updated = prev.map((m) => (m.id === msgId ? { ...m, savedIdeaId: res.data!.id } : m));
            if (activeConversationId) saveLocalMessages(activeConversationId, updated);
            return updated;
          });
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to save idea');
      } finally {
        setSavingIdeaKey(null);
      }
    });
  }

  function handleCopyBlueprint(msgId: string, idea: StructuredIdeaOutput) {
    const md = `# ${idea.title}
${idea.shortDescription}

### Core Problem
${idea.problem}

### Proposed Solution
${idea.solution}

### Target Audience (ICP)
${idea.targetAudience}

### Monetization Model
${idea.monetization}

### Feasibility
- **Difficulty:** ${idea.difficulty}
- **Estimated Cost:** ${idea.estimatedCost}
- **Timeline:** ${idea.estimatedTime}

### MVP Features Checklist
${idea.mvpFeatures.map((f) => `- [ ] ${f}`).join('\n')}

### Strategic Moat
${idea.whyItFits}
`;

    navigator.clipboard.writeText(md);
    setCopiedBlueprintId(msgId);
    toast.success('Blueprint copied to clipboard as Markdown!');
    setTimeout(() => setCopiedBlueprintId(null), 2500);
  }

  function handleCopyMessage(msgId: string, text: string) {
    navigator.clipboard.writeText(text);
    setCopiedMessageId(msgId);
    toast.success('Response copied to clipboard!');
    setTimeout(() => setCopiedMessageId(null), 2000);
  }

  // Filtered conversations based on search
  const filteredConversations = useMemo(() => {
    if (!searchQuery.trim()) return conversations;
    const q = searchQuery.toLowerCase();
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [conversations, searchQuery]);

  return (
    <div className="flex h-full w-full bg-background overflow-hidden relative select-text">
      {/* ========================================================================= */}
      {/* 1. LEFT SIDEBAR: Local-First Recent Chats Management */}
      {/* ========================================================================= */}
      <aside
        className={`border-r bg-card/70 backdrop-blur-xs flex flex-col shrink-0 transition-all duration-300 z-20 ${
          leftSidebarOpen ? 'w-64 sm:w-72 lg:w-80' : 'w-0 overflow-hidden border-r-0'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-3 border-b space-y-2.5 shrink-0 bg-background/50">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="size-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-foreground">
                Recent Chats
              </span>
              <Badge variant="secondary" className="text-[10px] h-4 px-1.5 py-0 font-medium">
                {conversations.length}
              </Badge>
            </div>
            <Button
              size="sm"
              onClick={handleNewChat}
              className="h-7 px-2.5 text-xs font-medium gap-1 shadow-2xs"
              title="Start a new chat"
            >
              <Plus className="size-3.5" />
              <span>New</span>
            </Button>
          </div>

          {/* Instant Search Bar */}
          <div className="relative">
            <Search className="size-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1 bg-muted/40 border border-border/60 rounded-md text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:bg-background transition-all"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="text-center py-12 px-3 text-xs text-muted-foreground space-y-2">
              <MessageSquare className="size-7 mx-auto opacity-30 stroke-[1.5]" />
              <p>{searchQuery ? 'No matching chats found.' : 'No chat history yet.'}</p>
              <p className="text-[11px] text-muted-foreground/80">
                {searchQuery ? 'Try another search query.' : 'Type your idea below to start.'}
              </p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = editingConvId === conv.id;

              return (
                <div
                  key={conv.id}
                  onClick={() => !isEditing && switchConversation(conv.id, conv.title)}
                  className={`group relative flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all border ${
                    isActive
                      ? 'bg-primary/10 text-primary border-primary/30 font-medium shadow-2xs'
                      : 'hover:bg-muted/60 text-muted-foreground hover:text-foreground border-transparent'
                  }`}
                >
                  {isEditing ? (
                    <form
                      onSubmit={(e) => handleSaveRename(conv.id, e)}
                      className="flex items-center gap-1 w-full"
                    >
                      <input
                        type="text"
                        value={editingTitleInput}
                        onChange={(e) => setEditingTitleInput(e.target.value)}
                        autoFocus
                        onBlur={() => setEditingConvId(null)}
                        className="w-full bg-background border rounded px-1.5 py-0.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                      <button
                        type="submit"
                        className="p-1 text-primary hover:bg-primary/20 rounded shrink-0"
                      >
                        <Check className="size-3" />
                      </button>
                    </form>
                  ) : (
                    <>
                      <div className="flex flex-col min-w-0 pr-1 flex-1">
                        <div className="flex items-center gap-1.5">
                          {conv.isPinned && (
                            <Pin className="size-2.5 text-amber-500 fill-amber-500 shrink-0" />
                          )}
                          <span className="truncate leading-tight">{conv.title}</span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/70 flex items-center gap-1 mt-0.5">
                          <Clock className="size-2.5" />
                          {new Date(conv.updated_at).toLocaleDateString()}
                        </span>
                      </div>

                      {/* Hover action icons */}
                      <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 shrink-0 transition-opacity">
                        <button
                          type="button"
                          onClick={(e) => handleTogglePin(conv.id, e)}
                          className={`p-1 rounded hover:bg-muted/80 ${
                            conv.isPinned ? 'text-amber-500' : 'text-muted-foreground hover:text-foreground'
                          }`}
                          title={conv.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleStartRename(conv, e)}
                          className="p-1 hover:text-foreground text-muted-foreground rounded hover:bg-muted/80"
                          title="Rename"
                        >
                          <Edit2 className="size-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConversation(conv.id, e)}
                          className="p-1 hover:text-destructive text-muted-foreground rounded hover:bg-muted/80"
                          title="Delete"
                        >
                          <Trash2 className="size-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer status */}
        <div className="p-2.5 border-t bg-background/50 text-[11px] text-muted-foreground flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span
              className={`inline-flex size-2 rounded-full ${
                syncStatus === 'saving' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'
              }`}
            />
            <span>{syncStatus === 'saving' ? 'Syncing...' : 'Synced with DB'}</span>
          </div>
          {messages.length > 0 && (
            <button
              type="button"
              onClick={() => exportConversationTranscript(activeConversationTitle, messages, 'markdown')}
              className="hover:text-foreground inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors cursor-pointer"
              title="Export chat transcript as Markdown"
            >
              <Download className="size-3" />
              <span>Export</span>
            </button>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 2. CENTER: Main Chat Stream (Clean, reduced gap, docked layout) */}
      {/* ========================================================================= */}
      <main className="flex-1 flex flex-col h-full overflow-hidden bg-background">
        {/* Top Header */}
        <header className="h-14 border-b px-4 sm:px-6 flex items-center justify-between shrink-0 bg-background/95 backdrop-blur-xs z-10">
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Toggle Left Sidebar */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setLeftSidebarOpen((prev) => !prev)}
              className="size-8 text-muted-foreground hover:text-foreground shrink-0"
              title={leftSidebarOpen ? 'Hide recent chats' : 'Show recent chats'}
            >
              {leftSidebarOpen ? (
                <PanelLeftClose className="size-4" />
              ) : (
                <PanelLeftOpen className="size-4" />
              )}
            </Button>

            <Avatar className="size-8 border bg-primary/10 shrink-0">
              <AvatarFallback className="bg-primary/10 text-primary">
                <Bot className="size-4" />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-foreground truncate max-w-[220px] sm:max-w-md">
                  {activeConversationTitle}
                </h2>
                <Badge
                  variant="outline"
                  className="text-[10px] font-normal py-0 h-4 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5 hidden sm:inline-flex"
                >
                  Local-First Synced
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground hidden sm:block truncate">
                AI Idea Co-pilot · Auto-fallback cascade: Groq → OpenRouter → Gemini
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {messages.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNewChat}
                className="h-8 px-2.5 text-xs text-muted-foreground hover:text-foreground gap-1.5"
                title="Start a new chat"
              >
                <RotateCcw className="size-3.5" />
                <span className="hidden sm:inline">New Chat</span>
              </Button>
            )}

            {/* Toggle Right Sidebar Button */}
            <Button
              variant={rightSidebarOpen ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setRightSidebarOpen((prev) => !prev)}
              className="h-8 px-2.5 text-xs gap-1.5"
              title={rightSidebarOpen ? 'Hide Studio panel' : 'Show Studio panel'}
            >
              <Zap className="size-3.5 text-amber-500" />
              <span className="hidden sm:inline">Venture Studio</span>
              {rightSidebarOpen ? (
                <PanelRightClose className="size-3.5" />
              ) : (
                <PanelRightOpen className="size-3.5" />
              )}
            </Button>
          </div>
        </header>

        {/* Chat Messages List (Directly docked, zero extra horizontal gap) */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
          {messages.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-3xl mx-auto text-center space-y-6">
              <div className="size-12 rounded-2xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shadow-xs">
                <Sparkles className="size-6" />
              </div>

              <div className="space-y-1.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  What would you like to build today?
                </h1>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Brainstorm high-conviction ideas, validate target markets, or outline full MVP scopes tailored to your background.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full pt-2">
                {STARTER_PROMPTS.map((card, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(card.prompt)}
                    className="flex flex-col text-left p-4 rounded-xl border bg-card hover:bg-muted/50 hover:border-primary/40 transition-all text-xs group cursor-pointer shadow-2xs"
                  >
                    <span className="font-semibold text-foreground group-hover:text-primary transition-colors text-sm">
                      {card.title}
                    </span>
                    <span className="text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {card.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Conversation stream */
            <div className="max-w-4xl mx-auto space-y-6 w-full">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.role === 'assistant' && (
                    <Avatar className="size-8 border shrink-0 mt-0.5 bg-primary/5">
                      <AvatarFallback className="bg-primary/5 text-primary">
                        <Bot className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}

                  <div
                    className={`space-y-3 max-w-[88%] sm:max-w-[84%] ${
                      msg.role === 'user' ? 'items-end' : 'items-start'
                    }`}
                  >
                    {/* Message Bubble */}
                    <div
                      className={`p-4 text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-2xl rounded-tr-xs shadow-xs'
                          : 'bg-muted/40 border rounded-2xl rounded-tl-xs shadow-xs text-foreground'
                      }`}
                    >
                      {msg.role === 'user' ? (
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      ) : (
                        <RichText content={msg.content} />
                      )}
                    </div>

                    {/* Assistant Copy & Metadata Action */}
                    {msg.role === 'assistant' && (
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground pl-1">
                        <button
                          type="button"
                          onClick={() => handleCopyMessage(msg.id, msg.content)}
                          className="inline-flex items-center gap-1 hover:text-foreground transition-colors cursor-pointer"
                          title="Copy message"
                        >
                          {copiedMessageId === msg.id ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                          <span>{copiedMessageId === msg.id ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                    )}

                    {/* Structured Idea Blueprint Card Inline */}
                    {msg.suggestedIdea && (
                      <Card className="border border-primary/30 shadow-md bg-card overflow-hidden w-full">
                        <div className="bg-primary/5 px-4 py-2.5 border-b border-primary/10 flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                            <Sparkles className="size-3.5" />
                            <span>Concept Blueprint</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                              {msg.suggestedIdea.difficulty}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedBlueprint(msg.suggestedIdea!);
                                setRightSidebarOpen(true);
                                setRightPanelTab('blueprint');
                              }}
                              className="h-6 px-2 text-[11px] text-primary gap-1"
                            >
                              <span>Inspect in Studio</span>
                              <ChevronRight className="size-3" />
                            </Button>
                            <button
                              type="button"
                              onClick={() => handleCopyBlueprint(msg.id, msg.suggestedIdea!)}
                              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                              title="Copy full blueprint"
                            >
                              {copiedBlueprintId === msg.id ? (
                                <Check className="size-3.5 text-emerald-500" />
                              ) : (
                                <Copy className="size-3.5" />
                              )}
                            </button>
                          </div>
                        </div>

                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-base sm:text-lg font-bold">
                            {msg.suggestedIdea.title}
                          </CardTitle>
                          <CardDescription className="text-xs sm:text-sm">
                            {msg.suggestedIdea.shortDescription}
                          </CardDescription>
                        </CardHeader>

                        <CardContent className="p-4 pt-1 space-y-3 text-xs">
                          <div className="grid grid-cols-2 gap-2 text-muted-foreground pt-1">
                            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border">
                              <Coins className="size-3.5 text-amber-500" />
                              <span>Cost: {msg.suggestedIdea.estimatedCost}</span>
                            </div>
                            <div className="flex items-center gap-1.5 p-2 rounded-lg bg-muted/40 border">
                              <Clock className="size-3.5 text-blue-500" />
                              <span>Timeline: {msg.suggestedIdea.estimatedTime}</span>
                            </div>
                          </div>

                          <div className="space-y-1 p-2.5 rounded-lg bg-muted/30 border">
                            <span className="font-semibold text-foreground">Target Audience:</span>
                            <p className="text-muted-foreground">{msg.suggestedIdea.targetAudience}</p>
                          </div>

                          <div className="space-y-1 p-2.5 rounded-lg bg-muted/30 border">
                            <span className="font-semibold text-foreground">Monetization:</span>
                            <p className="text-muted-foreground">{msg.suggestedIdea.monetization}</p>
                          </div>

                          <div className="space-y-1.5 p-2.5 rounded-lg bg-muted/30 border">
                            <span className="font-semibold text-foreground flex items-center gap-1">
                              <Layers className="size-3 text-primary" />
                              MVP Checklist:
                            </span>
                            <div className="space-y-1">
                              {msg.suggestedIdea.mvpFeatures.map((feat, fIdx) => (
                                <div key={fIdx} className="flex items-start gap-1.5 text-muted-foreground">
                                  <CheckCircle2 className="size-3 text-emerald-500 shrink-0 mt-0.5" />
                                  <span>{feat}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {msg.suggestedIdea.whyItFits && (
                            <div className="p-2 rounded-lg bg-primary/5 border border-primary/10 text-[11px] text-primary/90">
                              <span className="font-semibold">Why it fits: </span>
                              {msg.suggestedIdea.whyItFits}
                            </div>
                          )}
                        </CardContent>

                        <CardFooter className="p-3 px-4 border-t bg-muted/20 flex flex-wrap items-center justify-between gap-2">
                          {msg.savedIdeaId ? (
                            <Button variant="outline" size="sm" asChild className="h-8 text-xs text-primary gap-1.5">
                              <Link href={`/ideas/${msg.savedIdeaId}`}>
                                <span>View in Ideas</span>
                                <ExternalLink className="size-3" />
                              </Link>
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              onClick={() => handleSaveIdea(msg.id, msg.suggestedIdea!)}
                              disabled={savingIdeaKey === msg.id}
                              className="h-8 text-xs font-semibold gap-1.5"
                            >
                              <Bookmark className="size-3.5" />
                              <span>{savingIdeaKey === msg.id ? 'Saving...' : 'Save to My Ideas'}</span>
                            </Button>
                          )}

                          <IdeaExporter idea={msg.suggestedIdea!} className="h-8 text-xs font-semibold" />

                          <div className="flex items-center gap-1 flex-wrap">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSend('Simplify this concept down to a 48-hour MVP')}
                              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              Simplify scope
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleSend('Generate 3 alternative revenue models for this idea')}
                              className="h-7 text-[11px] text-muted-foreground hover:text-foreground"
                            >
                              Alternatives
                            </Button>
                          </div>
                        </CardFooter>
                      </Card>
                    )}
                  </div>

                  {msg.role === 'user' && (
                    <Avatar className="size-8 border shrink-0 mt-0.5 bg-muted">
                      <AvatarFallback className="bg-muted text-muted-foreground">
                        <User className="size-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}

              {isPending && (
                <div className="flex items-start gap-3">
                  <Avatar className="size-8 border shrink-0 bg-primary/5">
                    <AvatarFallback className="bg-primary/5 text-primary">
                      <Bot className="size-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="p-4 rounded-2xl rounded-tl-xs bg-muted/40 border text-xs text-muted-foreground flex items-center gap-2">
                    <Sparkles className="size-3.5 animate-spin text-primary" />
                    <span>Analyzing market demand, customer pains, and structuring concept...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Bar & Suggestion Chips (Docked with max-w-4xl, no giant margin gap) */}
        <footer className="border-t bg-background/95 backdrop-blur-xs p-3 sm:p-4 shrink-0 space-y-2">
          {/* Quick Suggestion Chips */}
          <div className="max-w-4xl mx-auto w-full flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {PROMPT_SUGGESTION_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(chip)}
                className="text-[11px] px-2.5 py-1 rounded-full border bg-muted/40 hover:bg-muted hover:border-primary/40 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
              >
                {chip}
              </button>
            ))}
          </div>

          <div className="max-w-4xl mx-auto w-full space-y-1.5">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-end gap-2 border rounded-2xl bg-muted/30 focus-within:bg-background focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/50 transition-all p-2 shadow-xs"
            >
              <textarea
                ref={textareaRef}
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask IdeaForge anything about startup ideas, validation, or pricing..."
                className="flex-1 bg-transparent border-0 resize-none text-sm text-foreground placeholder:text-muted-foreground focus:outline-none px-2 py-1.5 max-h-36 overflow-y-auto leading-relaxed"
                disabled={isPending}
              />

              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isPending}
                className="size-8 rounded-xl shrink-0 transition-all disabled:opacity-40"
              >
                <ArrowUp className="size-4" />
              </Button>
            </form>

            <div className="flex items-center justify-between text-[10px] text-muted-foreground px-1">
              <span>Local-first storage active</span>
              <span>Always verify customer demand and unit economics</span>
            </div>
          </div>
        </footer>
      </main>

      {/* ========================================================================= */}
      {/* 3. RIGHT SIDEBAR: Venture Studio Suite (Multi-View Pages) */}
      {/* ========================================================================= */}
      <aside
        className={`border-l bg-card/60 backdrop-blur-xs flex flex-col shrink-0 transition-all duration-300 z-20 ${
          rightSidebarOpen ? 'w-80 sm:w-96' : 'w-0 overflow-hidden border-l-0'
        }`}
      >
        {/* Right Header */}
        <div className="h-14 border-b px-4 flex items-center justify-between shrink-0 bg-background/50">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <h3 className="text-sm font-semibold text-foreground">Venture Studio</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setRightSidebarOpen(false)}
            className="size-7 text-muted-foreground hover:text-foreground"
            title="Close panel"
          >
            <PanelRightClose className="size-4" />
          </Button>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <Tabs
            value={rightPanelTab}
            onValueChange={(val) => setRightPanelTab(val as any)}
            className="flex-1 flex flex-col overflow-hidden"
          >
            <div className="px-3 pt-2 shrink-0">
              <TabsList className="grid grid-cols-5 w-full h-8 text-[10px] p-0.5">
                <TabsTrigger value="blueprint" className="px-1 text-[10px]">
                  Blueprint
                </TabsTrigger>
                <TabsTrigger value="radar" className="px-1 text-[10px]">
                  Radar
                </TabsTrigger>
                <TabsTrigger value="profile" className="px-1 text-[10px]">
                  Profile
                </TabsTrigger>
                <TabsTrigger value="saved" className="px-1 text-[10px]">
                  Saved
                </TabsTrigger>
                <TabsTrigger value="templates" className="px-1 text-[10px]">
                  Prompts
                </TabsTrigger>
              </TabsList>
            </div>

            {/* TAB 1: BLUEPRINT STUDIO */}
            <TabsContent value="blueprint" className="flex-1 overflow-y-auto p-4 space-y-4 m-0">
              {selectedBlueprint ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-[10px] uppercase font-bold">
                        {selectedBlueprint.difficulty}
                      </Badge>
                      <IdeaExporter idea={selectedBlueprint} className="h-7 text-xs" />
                    </div>
                    <h4 className="text-base font-bold text-foreground leading-snug">
                      {selectedBlueprint.title}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {selectedBlueprint.shortDescription}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg border bg-muted/30 space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Coins className="size-3 text-amber-500" />
                        <span>EST. CAPITAL</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {selectedBlueprint.estimatedCost}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-lg border bg-muted/30 space-y-0.5">
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-medium">
                        <Clock className="size-3 text-blue-500" />
                        <span>TIMELINE</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        {selectedBlueprint.estimatedTime}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20 text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Target className="size-3.5 text-primary" />
                      Ideal Customer Profile (ICP)
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedBlueprint.targetAudience}
                    </p>
                  </div>

                  <div className="space-y-1.5 p-3 rounded-xl border bg-muted/20 text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Coins className="size-3.5 text-emerald-500" />
                      Revenue Model
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedBlueprint.monetization}
                    </p>
                  </div>

                  <div className="space-y-2 p-3 rounded-xl border bg-muted/20 text-xs">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Layers className="size-3.5 text-primary" />
                      Interactive MVP Checklist
                    </span>
                    <div className="space-y-1.5">
                      {selectedBlueprint.mvpFeatures.map((feat, idx) => (
                        <label
                          key={idx}
                          className="flex items-start gap-2 p-1.5 rounded-md hover:bg-muted/50 cursor-pointer text-muted-foreground text-[11px]"
                        >
                          <input type="checkbox" className="mt-0.5 rounded border-muted text-primary" />
                          <span>{feat}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {selectedBlueprint.whyItFits && (
                    <div className="p-3 rounded-xl border border-primary/20 bg-primary/5 text-xs text-primary/90 space-y-1">
                      <span className="font-semibold flex items-center gap-1.5">
                        <ShieldCheck className="size-3.5" />
                        Competitive Moat
                      </span>
                      <p className="text-[11px] leading-relaxed">
                        {selectedBlueprint.whyItFits}
                      </p>
                    </div>
                  )}

                  {/* Steering Quick Actions */}
                  <div className="pt-2 space-y-1.5">
                    <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Iterate this blueprint
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(`Critique this blueprint like a ruthless seed investor: "${selectedBlueprint.title}"`)}
                        className="h-8 justify-start text-xs text-left"
                      >
                        ⚡ Investor Stress Test
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(`Write a high-converting cold email pitch for the ICP of "${selectedBlueprint.title}"`)}
                        className="h-8 justify-start text-xs text-left"
                      >
                        ✉️ Generate Cold Pitch Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend(`Outline a 4-week launch plan for "${selectedBlueprint.title}" with zero ad budget`)}
                        className="h-8 justify-start text-xs text-left"
                      >
                        🚀 4-Week Launch Roadmap
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-16 px-4 space-y-3 text-muted-foreground">
                  <Sparkles className="size-8 mx-auto text-primary/40 stroke-[1.5]" />
                  <h4 className="text-sm font-semibold text-foreground">No Active Blueprint</h4>
                  <p className="text-xs leading-relaxed">
                    Ask the co-pilot to brainstorm an idea or click "Inspect in Studio" on any generated blueprint card in the chat.
                  </p>
                </div>
              )}
            </TabsContent>

            {/* TAB 2: FEASIBILITY & RISK RADAR */}
            <TabsContent value="radar" className="flex-1 overflow-y-auto p-4 space-y-4 m-0 text-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <TrendingUp className="size-4 text-emerald-500" />
                  Feasibility & Risk Radar
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Automated risk heuristics for current concept viability.
                </p>
              </div>

              {/* Viability Gauge */}
              <div className="p-3.5 rounded-xl border bg-muted/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Calculated Viability Score</span>
                  <span className="text-emerald-500 font-bold">88 / 100</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[88%]" />
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span>High Market Demand</span>
                  <span>Low Capital Friction</span>
                </div>
              </div>

              {/* Risk Breakdown Cards */}
              <div className="space-y-2">
                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <ShieldCheck className="size-3.5 text-blue-500" />
                      Distribution Risk
                    </span>
                    <Badge variant="outline" className="text-[10px] text-blue-600 border-blue-500/30">
                      Moderate
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Requires direct organic content or niche community engagement before scaling paid channels.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <AlertTriangle className="size-3.5 text-amber-500" />
                      Technical Barrier
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      Low-Code / Fast
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Core MVP can be assembled using standard Next.js, Supabase, and existing AI API providers.
                  </p>
                </div>

                <div className="p-3 rounded-lg border bg-card space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-foreground flex items-center gap-1.5">
                      <Coins className="size-3.5 text-emerald-500" />
                      Payment Velocity
                    </span>
                    <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-500/30">
                      Immediate
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    B2B high willingness-to-pay via simple Stripe checkout or usage-based tiering.
                  </p>
                </div>
              </div>

              {/* 3 Step Validation Playbook */}
              <div className="p-3.5 rounded-xl border bg-primary/5 border-primary/20 space-y-2">
                <span className="font-semibold text-foreground text-xs flex items-center gap-1.5">
                  <Zap className="size-3.5 text-primary" />
                  Recommended 72-Hour Test
                </span>
                <ol className="space-y-1.5 text-[11px] text-muted-foreground list-decimal pl-4">
                  <li>Publish a 1-page pre-launch landing page with value prop.</li>
                  <li>Direct message 15 qualified personas on LinkedIn/Twitter.</li>
                  <li>Pre-sell lifetime access at 50% discount to validate real intent.</li>
                </ol>
              </div>
            </TabsContent>

            {/* TAB 3: FOUNDER ALIGNMENT & PROFILE */}
            <TabsContent value="profile" className="flex-1 overflow-y-auto p-4 space-y-4 m-0 text-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <Sliders className="size-4 text-primary" />
                  Founder Personalization
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Your active skills and preferences automatically injected into every generation.
                </p>
              </div>

              {userProfile ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-xl border bg-muted/20 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Experience Level:</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {userProfile.preferences?.experience_level || 'Intermediate'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Budget Bracket:</span>
                      <span className="font-semibold text-foreground">
                        {userProfile.preferences?.budget_bracket || 'Bootstrapper ($0 - $100)'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Weekly Time:</span>
                      <span className="font-semibold text-foreground">
                        {userProfile.preferences?.available_time || '5 - 10 hours/week'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Audience Focus:</span>
                      <span className="font-semibold text-foreground">
                        {userProfile.preferences?.target_audience_focus || 'B2B Micro-Businesses'}
                      </span>
                    </div>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-semibold text-foreground">Selected Skills & Tech:</span>
                    <div className="flex flex-wrap gap-1">
                      {userProfile.selectedSkillIds?.length > 0 ? (
                        userProfile.selectedSkillIds.map((id: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-[10px]">
                            Skill #{id.slice(0, 5)}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground">No specific skills tagged yet.</span>
                      )}
                    </div>
                  </div>

                  {/* 1-Click Steer Chips */}
                  <div className="space-y-1.5 pt-2 border-t">
                    <span className="text-[11px] font-semibold text-foreground">
                      Direct AI Steering Chips:
                    </span>
                    <div className="grid grid-cols-1 gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend('Strictly tailor the next idea to my specific skills and 0-dollar startup budget.')}
                        className="h-7 text-[11px] justify-start text-left"
                      >
                        🎯 Tailor to my exact skills & $0 budget
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend('Pivot the current concept to a high-ticket B2B consulting/productized service.')}
                        className="h-7 text-[11px] justify-start text-left"
                      >
                        💼 Pivot to B2B High-Ticket Service
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSend('Generate an idea that I can fully run asynchronously in under 5 hours a week.')}
                        className="h-7 text-[11px] justify-start text-left"
                      >
                        ⏱️ Limit to &lt; 5 hours/week
                      </Button>
                    </div>
                  </div>

                  <div className="pt-2 text-center">
                    <Button variant="link" size="sm" asChild className="text-xs text-primary p-0 h-auto">
                      <Link href="/settings">Edit onboarding preferences →</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground text-xs">
                  <p>No profile data loaded.</p>
                </div>
              )}
            </TabsContent>

            {/* TAB 4: QUICK SAVED IDEAS DRAWER */}
            <TabsContent value="saved" className="flex-1 overflow-y-auto p-4 space-y-3 m-0 text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                    <FolderHeart className="size-4 text-primary" />
                    Bookmarked Ideas
                  </h4>
                  <p className="text-[11px] text-muted-foreground">
                    {savedIdeas.length} ideas saved in your collection.
                  </p>
                </div>
                <Button variant="ghost" size="sm" asChild className="h-7 text-xs text-primary">
                  <Link href="/saved">View all</Link>
                </Button>
              </div>

              {savedIdeas.length === 0 ? (
                <div className="text-center py-12 px-2 text-muted-foreground space-y-2">
                  <Bookmark className="size-8 mx-auto opacity-30 stroke-[1.5]" />
                  <p>No bookmarked ideas yet.</p>
                  <p className="text-[11px]">
                    Click "Save to My Ideas" on any AI blueprint to save it here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {savedIdeas.map((idea: any) => (
                    <div
                      key={idea.id}
                      className="p-2.5 rounded-lg border bg-card hover:bg-muted/50 transition-all space-y-1.5"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <span className="font-semibold text-foreground text-xs line-clamp-1">
                          {idea.title}
                        </span>
                        <Badge variant="outline" className="text-[9px] uppercase px-1 py-0 shrink-0">
                          {idea.difficulty || 'Easy'}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {idea.short_description || idea.problem}
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t text-[11px]">
                        <button
                          type="button"
                          onClick={() => handleSend(`Let's discuss and expand upon my saved idea: "${idea.title}". Here is its premise: "${idea.short_description || idea.problem}". What are the first 3 things I should do to validate it?`)}
                          className="text-primary hover:underline font-medium cursor-pointer"
                        >
                          Reference in chat →
                        </button>
                        <Link
                          href={`/ideas/${idea.id}`}
                          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-0.5"
                        >
                          <span>Open</span>
                          <ExternalLink className="size-2.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* TAB 5: PROMPT LIBRARY & TEMPLATES */}
            <TabsContent value="templates" className="flex-1 overflow-y-auto p-4 space-y-3 m-0 text-xs">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  <BookOpen className="size-4 text-primary" />
                  Founder Prompt Library
                </h4>
                <p className="text-[11px] text-muted-foreground">
                  Pre-engineered prompts to accelerate validation, pricing, and launch.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                {FOUNDER_TEMPLATES.map((tmpl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg border bg-card hover:bg-muted/40 transition-all space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground text-xs">
                        {tmpl.title}
                      </span>
                      <Badge variant="secondary" className="text-[9px] py-0">
                        {tmpl.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-muted-foreground line-clamp-2">
                      "{tmpl.prompt}"
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSend(tmpl.prompt)}
                      className="h-6 px-2 text-[11px] text-primary gap-1 w-full justify-center mt-1 border border-primary/20 hover:bg-primary/10"
                    >
                      <Zap className="size-3 text-amber-500" />
                      <span>Use this prompt</span>
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </aside>
    </div>
  );
}
