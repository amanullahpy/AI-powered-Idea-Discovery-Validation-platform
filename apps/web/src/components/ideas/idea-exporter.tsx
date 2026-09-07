'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Check, Copy, Download, FileText, Printer } from 'lucide-react';
import { toast } from 'sonner';

interface IdeaExporterProps {
  idea: {
    title: string;
    short_description?: string;
    shortDescription?: string;
    description?: string | null;
    problem?: string | null;
    solution?: string | null;
    target_audience?: string | null;
    targetAudience?: string | null;
    monetization?: string | null;
    difficulty?: string | null;
    estimated_cost?: string | null;
    estimatedCost?: string | null;
    estimated_time?: string | null;
    estimatedTime?: string | null;
    mvp_features?: string[] | any;
    mvpFeatures?: string[] | any;
    slug?: string;
  };
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export function generateIdeaMarkdown(idea: IdeaExporterProps['idea']): string {
  const shortDesc = idea.short_description || idea.shortDescription || '';
  const targetAudience = idea.target_audience || idea.targetAudience || 'Not specified';
  const estimatedCost = idea.estimated_cost || idea.estimatedCost || 'Not specified';
  const estimatedTime = idea.estimated_time || idea.estimatedTime || 'Not specified';
  const mvpList = Array.isArray(idea.mvp_features)
    ? idea.mvp_features
    : Array.isArray(idea.mvpFeatures)
    ? idea.mvpFeatures
    : [];

  return `# ${idea.title}
> ${shortDesc}

---

## 🎯 Executive Summary
- **Difficulty:** ${idea.difficulty || 'Intermediate'}
- **Estimated Launch Budget:** ${estimatedCost}
- **Estimated Time to MVP:** ${estimatedTime}
- **Target Audience:** ${targetAudience}
- **Monetization Model:** ${idea.monetization || 'Not specified'}

---

## 🛑 Problem Statement
${idea.problem || 'No problem statement documented.'}

---

## 💡 Proposed Solution
${idea.solution || 'No solution statement documented.'}

---

## 🚀 MVP Features (Phase 1)
${mvpList.length > 0 ? mvpList.map((f: string) => `- [ ] ${f}`).join('\n') : '- [ ] Core workflow prototype'}

---

*Generated & Exported via Idea Discovery & Validation Platform*
`;
}

export function IdeaExporter({
  idea,
  variant = 'outline',
  size = 'sm',
  className,
}: IdeaExporterProps) {
  const [copied, setCopied] = useState(false);

  function handleCopyMarkdown() {
    const md = generateIdeaMarkdown(idea);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(md);
      setCopied(true);
      toast.success('Idea blueprint copied as Markdown!');
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error('Clipboard access not available.');
    }
  }

  function handleDownloadMarkdown() {
    const md = generateIdeaMarkdown(idea);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const filename = `${idea.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-blueprint.md`;
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${filename}!`);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Download className="size-3.5 mr-1.5" />
          Export Blueprint
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel className="text-xs">Export Format</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleCopyMarkdown}>
          {copied ? <Check className="size-3.5 mr-2 text-emerald-500" /> : <Copy className="size-3.5 mr-2" />}
          Copy as Markdown
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadMarkdown}>
          <FileText className="size-3.5 mr-2" />
          Download .md file
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handlePrint}>
          <Printer className="size-3.5 mr-2" />
          Print / Save as PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
