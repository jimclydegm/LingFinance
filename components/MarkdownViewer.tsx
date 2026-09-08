"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface MarkdownViewerProps {
  content: string;
  className?: string;
  maxHeight?: string;
}

/**
 * Parses inline formatting: **bold**, *italic*, `code`
 */
function parseInline(text: string): React.ReactNode[] {
  // Pattern to match bold, italic, code, or plain text
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(
        <strong
          key={match.index}
          className="font-semibold text-slate-100 bg-slate-800/60 px-1 py-0.5 rounded text-inherit"
        >
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(
        <em key={match.index} className="text-slate-300 italic">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={match.index}
          className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-cyan-300 font-mono text-[11px]"
        >
          {token.slice(1, -1)}
        </code>
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [text];
}

/**
 * Pure React Markdown renderer for financial reports.
 * Eliminates all raw markdown symbols (#, **, *, -) and renders clean typography with bounded scrollable heights.
 */
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  className,
  maxHeight = "h-full",
}) => {
  if (!content) return null;

  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let tableRows: string[][] = [];
  let inTable = false;
  let listItems: React.ReactNode[] = [];
  let inList: "ul" | "ol" | null = null;

  const flushTable = (key: number) => {
    if (tableRows.length === 0) return;
    const headerRow = tableRows[0];
    const dataRows = tableRows.slice(1);

    elements.push(
      <div
        key={`table-${key}`}
        className="my-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950/60"
      >
        <table className="w-full border-collapse text-[11px] font-mono">
          {headerRow && (
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-200">
              <tr>
                {headerRow.map((h, i) => (
                  <th
                    key={i}
                    className="px-3 py-1.5 text-left font-bold border-r border-slate-800/80 last:border-r-0"
                  >
                    {parseInline(h.trim())}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-800/60">
            {dataRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                className={rIdx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-900/30"}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    className="px-3 py-1.5 text-slate-300 border-r border-slate-800/60 last:border-r-0"
                  >
                    {parseInline(cell.trim())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
    tableRows = [];
    inTable = false;
  };

  const flushList = (key: number) => {
    if (listItems.length === 0) return;
    if (inList === "ul") {
      elements.push(
        <ul
          key={`list-${key}`}
          className="my-2 space-y-1 pl-1 text-slate-300 text-xs leading-relaxed"
        >
          {listItems}
        </ul>
      );
    } else if (inList === "ol") {
      elements.push(
        <ol
          key={`list-${key}`}
          className="my-2 space-y-1 pl-1 text-slate-300 text-xs leading-relaxed"
        >
          {listItems}
        </ol>
      );
    }
    listItems = [];
    inList = null;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    // Empty lines
    if (!trimmed) {
      if (inTable) flushTable(idx);
      if (inList) flushList(idx);
      return;
    }

    // Markdown Table row detection: | cell | cell |
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Ignore separator row e.g. |---|---|
      if (/^\|[-:\s|]+\|$/.test(trimmed)) {
        return;
      }
      if (inList) flushList(idx);
      inTable = true;
      const cells = trimmed
        .slice(1, -1)
        .split("|")
        .map((c) => c.trim());
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(idx);
    }

    // Unordered List: - item, * item, + item
    const ulMatch = trimmed.match(/^[-*+]\s+(.+)/);
    if (ulMatch) {
      if (inList !== "ul") {
        flushList(idx);
        inList = "ul";
      }
      listItems.push(
        <li key={idx} className="flex items-start gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          <div className="flex-1">{parseInline(ulMatch[1])}</div>
        </li>
      );
      return;
    }

    // Ordered List: 1. item, 2. item
    const olMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (inList !== "ol") {
        flushList(idx);
        inList = "ol";
      }
      listItems.push(
        <li key={idx} className="flex items-start gap-2">
          <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-cyan-400 font-bold shrink-0">
            {olMatch[1]}
          </span>
          <div className="flex-1">{parseInline(olMatch[2])}</div>
        </li>
      );
      return;
    }

    // If not a list, flush any active list
    if (inList) {
      flushList(idx);
    }

    // H1: # Title
    if (trimmed.startsWith("# ")) {
      elements.push(
        <h1
          key={idx}
          className="text-base font-bold text-white tracking-tight mt-4 mb-2 pb-1 border-b border-slate-800 flex items-center gap-2"
        >
          <span className="w-1.5 h-4 bg-emerald-400 rounded-full inline-block shrink-0" />
          <span>{parseInline(trimmed.slice(2))}</span>
        </h1>
      );
      return;
    }

    // H2: ## Subtitle
    if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={idx}
          className="text-sm font-bold text-slate-100 tracking-tight mt-3 mb-1.5 pb-1 border-b border-slate-800/60 flex items-center gap-1.5"
        >
          <span className="w-1 h-3 bg-cyan-400 rounded-full inline-block shrink-0" />
          <span>{parseInline(trimmed.slice(3))}</span>
        </h2>
      );
      return;
    }

    // H3 / H4: ### Subheading
    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={idx}
          className="text-xs font-bold text-emerald-300 tracking-wide mt-2.5 mb-1 flex items-center gap-1.5"
        >
          <span className="w-1 h-2 bg-purple-400 rounded-full inline-block shrink-0" />
          <span>{parseInline(trimmed.slice(4))}</span>
        </h3>
      );
      return;
    }

    if (trimmed.startsWith("#### ")) {
      elements.push(
        <h4 key={idx} className="text-xs font-semibold text-slate-200 mt-2 mb-1">
          {parseInline(trimmed.slice(5))}
        </h4>
      );
      return;
    }

    // Blockquote: > quote
    if (trimmed.startsWith("> ")) {
      elements.push(
        <blockquote
          key={idx}
          className="my-2 pl-3 py-1.5 border-l-2 border-emerald-500/70 bg-slate-900/60 rounded-r text-slate-300 text-xs italic"
        >
          {parseInline(trimmed.slice(2))}
        </blockquote>
      );
      return;
    }

    // Standard Paragraph
    elements.push(
      <p key={idx} className="my-1.5 text-xs leading-relaxed text-slate-300">
        {parseInline(trimmed)}
      </p>
    );
  });

  // Flush any remaining list or table
  flushTable(lines.length);
  flushList(lines.length);

  return (
    <div
      className={cn(
        "custom-scrollbar overflow-y-auto pr-2 text-xs leading-relaxed text-slate-200 font-sans select-text space-y-1",
        maxHeight,
        className
      )}
    >
      {elements}
    </div>
  );
};
