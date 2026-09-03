'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  sendMessageAndGenerateAction,
  saveAIGeneratedIdeaAction,
} from '@/data/ai/actions';
import { type StructuredIdeaOutput } from '@/lib/ai/provider';
import { toast } from 'sonner';
import {
  ArrowRight,
  Bot,
  Bookmark,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  Layers,
  Lightbulb,
  Send,
  Sparkles,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestedIdea?: StructuredIdeaOutput | null;
  savedIdeaId?: string | null;
}

const QUICK_PROMPTS = [
  'Give me a SaaS idea I can launch in 2 weeks',
  'I have $200. What low-risk business can I start?',
  'Give me an AI workflow tool for students',
  'Micro developer tool for Next.js builders',
  'High-margin digital product side hustle',
];

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `👋 **Welcome to your AI Idea Co-pilot!**\n\nTell me what kind of project or business you're looking for, or choose a quick prompt below. I'll analyze market demand, budget, and skills to generate an actionable concept with full MVP scope.`,
    },
  ]);
  const [input, setInput] = useState('');
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();
  const [savingIdeaKey, setSavingIdeaKey] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend(textToSend?: string) {
    const text = textToSend || input;
    if (!text.trim() || isPending) return;

    const userMsgId = Math.random().toString(36).substring(7);
    const newHistory = [...messages, { id: userMsgId, role: 'user' as const, content: text }];
    setMessages(newHistory);
    setInput('');

    startTransition(async () => {
      try {
        const historyContext = newHistory
          .filter((m) => m.id !== 'welcome')
          .map((m) => ({ role: m.role, content: m.content }));

        const res = await sendMessageAndGenerateAction({
          conversationId,
          message: text,
          history: historyContext,
        });

        if (res.data) {
          if (res.data.conversationId) setConversationId(res.data.conversationId);
          setMessages((prev) => [
            ...prev,
            {
              id: Math.random().toString(36).substring(7),
              role: 'assistant',
              content: res.data!.reply,
              suggestedIdea: res.data!.suggestedIdea,
            },
          ]);
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to generate response. Please try again.');
      }
    });
  }

  function handleSaveIdea(msgId: string, idea: StructuredIdeaOutput) {
    setSavingIdeaKey(msgId);
    startTransition(async () => {
      try {
        const res = await saveAIGeneratedIdeaAction({
          idea,
          conversationId,
        });

        if (res.data) {
          toast.success(`"${idea.title}" saved to your ideas!`);
          setMessages((prev) =>
            prev.map((m) => (m.id === msgId ? { ...m, savedIdeaId: res.data!.id } : m))
          );
        }
      } catch (err: any) {
        toast.error(err.message || 'Failed to save idea');
      } finally {
        setSavingIdeaKey(null);
      }
    });
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8.5rem)] max-w-4xl mx-auto border rounded-xl overflow-hidden bg-card shadow-sm">
      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'assistant' && (
              <div className="size-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                <Bot className="size-4" />
              </div>
            )}

            <div className={`space-y-3 max-w-xl ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div
                className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-tr-none'
                    : 'bg-muted/70 text-foreground rounded-tl-none border'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>

              {/* Inline Structured Idea Card if generated */}
              {msg.suggestedIdea && (
                <Card className="border border-primary/30 shadow-md bg-background overflow-hidden">
                  <div className="bg-primary/5 px-4 py-2 border-b border-primary/10 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <Sparkles className="size-3.5" />
                      Generated Concept Blueprint
                    </div>
                    <Badge variant="outline" className="text-[11px] uppercase tracking-wider font-semibold">
                      {msg.suggestedIdea.difficulty}
                    </Badge>
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
                      <div className="flex items-center gap-1">
                        <Coins className="size-3 text-foreground" />
                        <span>Cost: {msg.suggestedIdea.estimatedCost}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="size-3 text-foreground" />
                        <span>Timeline: {msg.suggestedIdea.estimatedTime}</span>
                      </div>
                    </div>

                    <div className="space-y-1 rounded-md bg-muted/40 p-2.5">
                      <span className="font-semibold text-foreground">Core Problem:</span>
                      <p className="text-muted-foreground">{msg.suggestedIdea.problem}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Layers className="size-3 text-primary" />
                        MVP Launch Checklist:
                      </span>
                      <ul className="space-y-1">
                        {msg.suggestedIdea.mvpFeatures.slice(0, 3).map((feat, idx) => (
                          <li key={idx} className="flex items-start gap-1.5 text-muted-foreground">
                            <CheckCircle2 className="size-3.5 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>

                  <CardFooter className="p-3 px-4 border-t bg-muted/20 flex items-center justify-between">
                    {msg.savedIdeaId ? (
                      <Button variant="outline" size="sm" asChild className="h-8 text-xs text-primary">
                        <Link href={`/ideas/${msg.savedIdeaId}`}>
                          View in My Ideas
                          <ExternalLink className="size-3 ml-1.5" />
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => handleSaveIdea(msg.id, msg.suggestedIdea!)}
                        disabled={savingIdeaKey === msg.id}
                        className="h-8 text-xs font-semibold"
                      >
                        <Bookmark className="size-3.5 mr-1.5" />
                        {savingIdeaKey === msg.id ? 'Saving...' : 'Save to My Ideas'}
                      </Button>
                    )}

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSend('Make it simpler to build in 1 week')}
                        className="h-8 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Make simpler
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSend('Give me 2 alternatives with different revenue models')}
                        className="h-8 text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Alternatives
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="size-8 rounded-full bg-muted text-muted-foreground flex items-center justify-center shrink-0 mt-0.5">
                <User className="size-4" />
              </div>
            )}
          </div>
        ))}

        {isPending && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground pl-11">
            <Sparkles className="size-3.5 animate-spin text-primary" />
            <span>Analyzing market opportunities and synthesizing blueprint...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestions & Input footer */}
      <div className="border-t p-3 sm:p-4 bg-muted/10 space-y-3">
        {/* Quick prompt suggestions */}
        {messages.length <= 2 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-muted-foreground text-[11px] shrink-0 font-medium mr-1">
              Suggestions:
            </span>
            {QUICK_PROMPTS.map((qp, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSend(qp)}
                className="px-2.5 py-1 rounded-full border bg-background hover:bg-accent text-muted-foreground hover:text-foreground shrink-0 text-xs transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tell me what you want to build (e.g. 'SaaS tool for lawyers' or 'Make it simpler')..."
            className="flex-1 text-sm h-10"
            disabled={isPending}
          />
          <Button type="submit" size="sm" disabled={!input.trim() || isPending} className="h-10 px-4 font-semibold">
            <Send className="size-4 mr-1.5" />
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
