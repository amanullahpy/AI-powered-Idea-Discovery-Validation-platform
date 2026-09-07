'use client';

import React, { useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface RichTextProps {
  content: string;
  className?: string;
}

export function RichText({ content, className = '' }: RichTextProps) {
  if (!content) return null;

  // Split content by code blocks first
  const blocks = splitCodeBlocks(content);

  return (
    <div className={`space-y-3 text-sm leading-relaxed ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'code') {
          return <CodeBlock key={idx} code={block.content} language={block.lang} />;
        }
        return <FormattedMarkdownSection key={idx} text={block.content} />;
      })}
    </div>
  );
}

function splitCodeBlocks(text: string): Array<{ type: 'text' | 'code'; content: string; lang?: string }> {
  const parts: Array<{ type: 'text' | 'code'; content: string; lang?: string }> = [];
  const regex = /```([a-zA-Z0-9_-]*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({
      type: 'code',
      lang: match[1] || 'plaintext',
      content: match[2].trim(),
    });
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
}

function CodeBlock({ code, language }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="relative my-3 rounded-lg overflow-hidden border border-border/80 bg-zinc-950 text-zinc-100 font-mono text-xs shadow-inner">
      <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-900 border-b border-zinc-800 text-[11px] text-zinc-400">
        <span className="font-semibold uppercase tracking-wider">{language || 'CODE'}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 hover:text-zinc-100 transition-colors cursor-pointer py-0.5 px-1 rounded hover:bg-zinc-800"
          type="button"
          title="Copy code"
        >
          {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>
      <pre className="p-3 overflow-x-auto leading-normal selection:bg-primary/40">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function FormattedMarkdownSection({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: { type: 'ul' | 'ol'; items: string[] } | null = null;
  let currentTable: string[] | null = null;

  function flushList() {
    if (!currentList) return;
    if (currentList.type === 'ul') {
      elements.push(
        <ul key={`ul-${elements.length}`} className="my-2 ml-4 list-disc space-y-1 text-inherit">
          {currentList.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ul>
      );
    } else {
      elements.push(
        <ol key={`ol-${elements.length}`} className="my-2 ml-4 list-decimal space-y-1 text-inherit">
          {currentList.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </ol>
      );
    }
    currentList = null;
  }

  function flushTable() {
    if (!currentTable || currentTable.length === 0) return;
    elements.push(<MarkdownTable key={`tbl-${elements.length}`} rawLines={currentTable} />);
    currentTable = null;
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Table row detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList();
      if (!currentTable) currentTable = [];
      currentTable.push(trimmed);
      continue;
    } else {
      flushTable();
    }

    // Headings
    if (trimmed.startsWith('### ')) {
      flushList();
      elements.push(
        <h4 key={i} className="text-sm font-bold tracking-tight text-foreground mt-3 mb-1">
          {renderInline(trimmed.slice(4))}
        </h4>
      );
      continue;
    }
    if (trimmed.startsWith('## ')) {
      flushList();
      elements.push(
        <h3 key={i} className="text-base font-bold tracking-tight text-foreground mt-4 mb-1.5">
          {renderInline(trimmed.slice(3))}
        </h3>
      );
      continue;
    }
    if (trimmed.startsWith('# ')) {
      flushList();
      elements.push(
        <h2 key={i} className="text-lg font-extrabold tracking-tight text-foreground mt-4 mb-2">
          {renderInline(trimmed.slice(2))}
        </h2>
      );
      continue;
    }

    // Blockquote
    if (trimmed.startsWith('> ')) {
      flushList();
      elements.push(
        <blockquote
          key={i}
          className="border-l-2 border-primary/60 bg-muted/40 pl-3 py-1 my-2 italic text-muted-foreground text-xs rounded-r"
        >
          {renderInline(trimmed.slice(2))}
        </blockquote>
      );
      continue;
    }

    // Unordered list item
    const ulMatch = trimmed.match(/^[-*•]\s+(.*)$/);
    if (ulMatch) {
      if (!currentList || currentList.type !== 'ul') {
        flushList();
        currentList = { type: 'ul', items: [] };
      }
      currentList.items.push(ulMatch[1]);
      continue;
    }

    // Ordered list item
    const olMatch = trimmed.match(/^\d+\.\s+(.*)$/);
    if (olMatch) {
      if (!currentList || currentList.type !== 'ol') {
        flushList();
        currentList = { type: 'ol', items: [] };
      }
      currentList.items.push(olMatch[1]);
      continue;
    }

    // Regular empty line
    if (!trimmed) {
      flushList();
      continue;
    }

    // Normal paragraph
    flushList();
    elements.push(
      <p key={i} className="my-1">
        {renderInline(line)}
      </p>
    );
  }

  flushList();
  flushTable();

  return <>{elements}</>;
}

function MarkdownTable({ rawLines }: { rawLines: string[] }) {
  if (rawLines.length < 2) return null;

  const parseRow = (line: string) =>
    line
      .slice(1, -1)
      .split('|')
      .map((c) => c.trim());

  const headers = parseRow(rawLines[0]);
  // row 1 is usually separator (|---|---|), check if it matches
  const hasSeparator = rawLines[1]?.includes('---');
  const dataRows = (hasSeparator ? rawLines.slice(2) : rawLines.slice(1)).map(parseRow);

  return (
    <div className="my-3 overflow-x-auto rounded-lg border border-border bg-card">
      <table className="w-full text-xs text-left">
        <thead className="bg-muted/60 text-foreground font-semibold border-b border-border">
          <tr>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2">
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/60">
          {dataRows.map((row, rIdx) => (
            <tr key={rIdx} className="hover:bg-muted/30 transition-colors">
              {row.map((cell, cIdx) => (
                <td key={cIdx} className="px-3 py-2 text-muted-foreground">
                  {renderInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Render inline markdown elements: **bold**, *italic*, `code`, and [link](url)
 */
function renderInline(text: string): React.ReactNode {
  if (!text) return null;

  // Tokenize text into bold, italic, code, links
  const tokens: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Inline code `code`
    const codeMatch = remaining.match(/^`([^`]+)`/);
    if (codeMatch) {
      tokens.push(
        <code
          key={key++}
          className="px-1 py-0.5 rounded bg-muted text-foreground font-mono text-[12px] border border-border/50"
        >
          {codeMatch[1]}
        </code>
      );
      remaining = remaining.slice(codeMatch[0].length);
      continue;
    }

    // Bold **text**
    const boldMatch = remaining.match(/^\*\*([^*]+)\*\*/);
    if (boldMatch) {
      tokens.push(
        <strong key={key++} className="font-bold text-foreground">
          {boldMatch[1]}
        </strong>
      );
      remaining = remaining.slice(boldMatch[0].length);
      continue;
    }

    // Italic *text*
    const italicMatch = remaining.match(/^\*([^*]+)\*/);
    if (italicMatch) {
      tokens.push(
        <em key={key++} className="italic">
          {italicMatch[1]}
        </em>
      );
      remaining = remaining.slice(italicMatch[0].length);
      continue;
    }

    // Link [text](url)
    const linkMatch = remaining.match(/^\[([^\]]+)\]\(([^)]+)\)/);
    if (linkMatch) {
      tokens.push(
        <a
          key={key++}
          href={linkMatch[2]}
          target="_blank"
          rel="noreferrer"
          className="text-primary underline underline-offset-2 hover:opacity-80 font-medium"
        >
          {linkMatch[1]}
        </a>
      );
      remaining = remaining.slice(linkMatch[0].length);
      continue;
    }

    // Plain text up to next potential markdown token
    const nextSpecial = remaining.search(/[`*[]/);
    if (nextSpecial === -1) {
      tokens.push(remaining);
      break;
    } else if (nextSpecial === 0) {
      // character couldn't be parsed as token, consume 1 char
      tokens.push(remaining[0]);
      remaining = remaining.slice(1);
    } else {
      tokens.push(remaining.slice(0, nextSpecial));
      remaining = remaining.slice(nextSpecial);
    }
  }

  return <>{tokens}</>;
}
