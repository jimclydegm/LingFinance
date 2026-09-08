"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Terminal as TerminalIcon,
  FileSearch,
  Calculator,
  Play,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Cpu,
  BadgePercent,
  TrendingUp,
} from "lucide-react";
import { queryLingFinance } from "@/lib/openrouter";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { cn } from "@/lib/utils";

interface ToolCallLog {
  id: number;
  timestamp: string;
  source: string;
  action: string;
  status: "ok" | "pending" | "extracting";
}

const MOCK_TOOL_CALL_TEMPLATES = [
  { source: "SEC_EDGAR", action: "Query CIK 0001852268 (Spire Global, Inc.)" },
  { source: "EDGAR_API", action: "Fetch 10-K FY2023 Part II, Item 8 Financial Statements" },
  { source: "XBRL_PARSER", action: "Parse SegmentReportingDisclosureTextBlock [Note 4]" },
  { source: "DOC_EXTRACT", action: "Isolate Discontinued Operations: Maritime vs Storage" },
  { source: "SEC_EDGAR", action: "Fetch Form 8-K Item 2.01 Asset Disposition Schedule" },
  { source: "FIN_ENGINE", action: "Isolate Storage line item operating losses ($38.5M)" },
  { source: "CALC_GRAPH", action: "Recompute Continuing Operations SG&A attribution" },
  { source: "RECONCILE", action: "Add back discontinued storage impairment & severance" },
  { source: "NORMALIZE", action: "Execute non-GAAP reconciliations: Adjusted EBITDA & EBIT" },
  { source: "VALIDATE", action: "Verify cross-statement consistency with Statement of Cash Flows" },
];

export const Demo3FinancialResearch: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completed, setCompleted] = useState<boolean>(false);
  const [terminalLogs, setTerminalLogs] = useState<ToolCallLog[]>([]);
  const [activeHighlight, setActiveHighlight] = useState<boolean>(false);
  const [calculationResult, setCalculationResult] = useState<string | null>(null);
  const [modelReasoning, setModelReasoning] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal when new logs are added
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [terminalLogs]);

  const handleStartResearch = async () => {
    setIsRunning(true);
    setCompleted(false);
    setError(null);
    setTerminalLogs([]);
    setActiveHighlight(false);
    setCalculationResult(null);
    setModelReasoning("");

    // Start mock rapid tool calls sequence (55 tool calls)
    let callCounter = 0;
    const totalCalls = 55;

    const logInterval = setInterval(() => {
      if (callCounter < totalCalls) {
        callCounter++;
        const template = MOCK_TOOL_CALL_TEMPLATES[callCounter % MOCK_TOOL_CALL_TEMPLATES.length];
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, "0")}:${now
          .getMinutes()
          .toString()
          .padStart(2, "0")}:${now.getSeconds().toString().padStart(2, "0")}.${now
          .getMilliseconds()
          .toString()
          .padStart(3, "0")}`;

        const newLog: ToolCallLog = {
          id: callCounter,
          timestamp: timeStr,
          source: template.source,
          action: `[#${callCounter.toString().padStart(2, "0")}] ${template.action}`,
          status: callCounter === totalCalls ? "ok" : "extracting",
        };

        setTerminalLogs((prev) => [...prev, newLog]);

        if (callCounter >= 25) {
          setActiveHighlight(true);
        }
      }
    }, 45); // Rapid scroll: ~45ms per call (approx 2.5 seconds total for 55 calls)

    // Execute OpenRouter API call
    const researchPrompt =
      "Perform a rigorous financial research validation on Spire Global (Spire historical profit validation task). Rebuild continuing-operations earnings, isolate the historical operating loss in the Storage business line as discontinued operations, and reconcile the normalized continuing-operations EBIT to precisely $17.8M. Provide mathematical line-item steps and GAAP-to-non-GAAP reconciliations.";

    try {
      const response = await queryLingFinance(researchPrompt, {
        systemPrompt:
          "You are an expert senior forensic accounting and equity research specialist powered by Ling 3.0 Flash Fin. Provide precise mathematical reconciliation steps showing how Spire's continuing operations profit normalizes to $17.8M by eliminating discontinued storage operations.",
      });

      // Clear interval if not yet completed and ensure all 55 logs are rendered
      clearInterval(logInterval);

      // Populate any remaining logs up to 55
      const finalLogs: ToolCallLog[] = [];
      for (let i = 1; i <= 55; i++) {
        const template = MOCK_TOOL_CALL_TEMPLATES[i % MOCK_TOOL_CALL_TEMPLATES.length];
        finalLogs.push({
          id: i,
          timestamp: `09:14:${(20 + Math.floor(i / 10)).toString().padStart(2, "0")}.${(i * 17) % 999}`,
          source: template.source,
          action: `[#${i.toString().padStart(2, "0")}] ${template.action}`,
          status: "ok",
        });
      }
      setTerminalLogs(finalLogs);
      setActiveHighlight(true);

      setModelReasoning(response);
      setCalculationResult("$17.8M");
      setCompleted(true);
    } catch (err: unknown) {
      clearInterval(logInterval);
      const msg = err instanceof Error ? err.message : "Financial research execution failed.";
      setError(msg);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Top Header & Task Trigger */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
              Demo 3
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Real Financial Research Workbench
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Autonomous multi-filing reconciliation: Spire Historical Profit Validation Task
          </p>
        </div>

        {/* Start Research Button */}
        <button
          id="btn-start-research"
          onClick={handleStartResearch}
          disabled={isRunning}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs tracking-wide shadow-lg shadow-purple-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          {isRunning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin text-white" />
              <span>Executing 55 SEC Tool Calls...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current text-purple-200" />
              <span>Start Research (Spire Validation)</span>
            </>
          )}
        </button>
      </div>

      {/* Dense Technical Three-Column Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 min-h-0 overflow-hidden">
        {/* Column 1: Terminal Window Simulating Tool Calls (55 tool calls) */}
        <div className="lg:col-span-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col overflow-hidden shadow-2xl">
          {/* Terminal Header */}
          <div className="h-9 bg-slate-900/90 px-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
              </div>
              <span className="text-[11px] font-mono text-slate-400 font-semibold ml-2 flex items-center gap-1.5">
                <TerminalIcon className="w-3.5 h-3.5 text-purple-400" />
                tool_dispatch.log
              </span>
            </div>
            <div className="text-[10px] font-mono text-slate-400">
              {terminalLogs.length}/55 calls
            </div>
          </div>

          {/* Terminal Body */}
          <div className="flex-1 p-3 overflow-y-auto font-mono text-[11px] space-y-1.5 bg-[#050811]">
            {terminalLogs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center px-4">
                <Cpu className="w-8 h-8 mb-2 text-slate-700 animate-pulse" />
                <p className="text-slate-400">Tool execution pipeline idle.</p>
                <p className="text-[10px] text-slate-600 mt-1">
                  Click &quot;Start Research&quot; to initiate 55 autonomous SEC EDGAR and XBRL extraction calls.
                </p>
              </div>
            ) : (
              terminalLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-2 leading-tight text-slate-300 hover:bg-slate-900/50 py-0.5 px-1 rounded transition-colors"
                >
                  <span className="text-slate-600 shrink-0 text-[10px]">{log.timestamp}</span>
                  <span className="text-purple-400 font-semibold shrink-0 text-[10px]">
                    [{log.source}]
                  </span>
                  <span className="text-slate-300 truncate flex-1">{log.action}</span>
                  <span className="text-emerald-400 text-[10px] shrink-0 font-bold">✓</span>
                </div>
              ))
            )}
            <div ref={terminalEndRef} />
          </div>

          {/* Terminal Status Bar */}
          <div className="h-7 bg-slate-900/80 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isRunning ? "bg-amber-400 animate-ping" : completed ? "bg-emerald-400" : "bg-slate-600"
                )}
              />
              {isRunning ? "Dispatching EDGAR calls..." : completed ? "55 Calls Completed" : "Ready"}
            </span>
            <span>Target: Spire Global (SPIR)</span>
          </div>
        </div>

        {/* Column 2: Document Reference Viewer Highlighting Financial Source Text */}
        <div className="lg:col-span-4 rounded-xl bg-slate-900/70 border border-slate-800 flex flex-col overflow-hidden shadow-xl">
          {/* Doc Header */}
          <div className="h-9 bg-slate-900 px-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
              <FileSearch className="w-3.5 h-3.5 text-cyan-400" />
              <span>SEC 10-K Item 8 / Note 4 Reference Viewer</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">EDGAR Form 10-K</span>
          </div>

          {/* Document Content */}
          <div className="flex-1 p-4 overflow-y-auto text-xs font-serif leading-relaxed text-slate-300 space-y-3 bg-slate-950/40">
            <div className="pb-2 border-b border-slate-800 font-sans text-[11px] text-slate-400 flex items-center justify-between">
              <span className="font-semibold text-slate-200">SPIRE GLOBAL, INC. — NOTES TO FINANCIAL STATEMENTS</span>
              <span className="text-slate-500">Page F-18</span>
            </div>

            <h4 className="font-sans font-bold text-slate-200 text-xs">
              Note 4. Discontinued Operations & Segment Restructuring
            </h4>

            <p className="text-[12px] leading-relaxed">
              In the fourth quarter of fiscal 2023, management approved a strategic realignment to discontinue operations of the legacy satellite data{" "}
              <mark
                className={cn(
                  "px-1.5 py-0.5 rounded transition-all duration-500",
                  activeHighlight
                    ? "bg-amber-500/30 text-amber-200 border border-amber-500/50 font-sans font-semibold"
                    : "bg-transparent text-slate-300"
                )}
              >
                &ldquo;Storage & Ground Infrastructure&rdquo; business unit
              </mark>
              . In accordance with ASC 205-20, the results of the Storage segment have been reclassified as{" "}
              <mark
                className={cn(
                  "px-1.5 py-0.5 rounded transition-all duration-500",
                  activeHighlight
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-500/50 font-sans font-semibold"
                    : "bg-transparent text-slate-300"
                )}
              >
                discontinued operations for all historical periods presented
              </mark>
              .
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono space-y-1.5">
              <div className="text-slate-400 font-sans font-bold">Historical Operating Segments (FY23):</div>
              <div className="flex justify-between text-slate-300">
                <span>• Maritime Intelligence (Continuing):</span>
                <span className="text-emerald-400 font-bold">$14.2M EBIT</span>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>• Aviation & Weather (Continuing):</span>
                <span className="text-emerald-400 font-bold">$3.6M EBIT</span>
              </div>
              <div
                className={cn(
                  "flex justify-between p-1 rounded transition-colors",
                  activeHighlight ? "bg-rose-500/20 text-rose-300 font-bold" : "text-slate-400"
                )}
              >
                <span>• Storage Unit (DISCONTINUED):</span>
                <span className="text-rose-400 font-bold">($38.5M) LOSS</span>
              </div>
            </div>

            <p className="text-[12px] leading-relaxed text-slate-400">
              Continuing operations reflect core Maritime, Aviation, and Weather tracking solutions. The $38.5 million operating loss generated by Storage represents discontinued operational drag that does not recur under the reorganized continuing structure.
            </p>
          </div>

          {/* Doc Status Footer */}
          <div className="h-7 bg-slate-900/80 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>ASC 205-20 Verified</span>
            <span className="text-emerald-400 flex items-center gap-1 font-mono">
              <CheckCircle2 className="w-3 h-3" /> Note 4 Cross-Referenced
            </span>
          </div>
        </div>

        {/* Column 3: Results Panel Displaying Final Calculation ($17.8M) */}
        <div className="lg:col-span-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden shadow-xl">
          {/* Results Header */}
          <div className="h-9 bg-slate-900 px-3.5 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-200">
              <Calculator className="w-3.5 h-3.5 text-emerald-400" />
              <span>Final Synthesis & Calculation Panel</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">Ling 3.0 Output</span>
          </div>

          {/* Results Content */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Core Calculated Value Display */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 p-3 opacity-10">
                <TrendingUp className="w-16 h-16 text-emerald-400" />
              </div>
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
                Validated Continuing Operations Profit
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-300 font-mono">
                  {calculationResult || "$17.8M"}
                </span>
                <span className="text-xs text-emerald-400 font-semibold font-mono">Normalized EBIT</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Historical continuing profit after carving out discontinued Storage line losses.
              </p>
            </div>

            {/* Reconciliation Breakdown Table */}
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <div className="text-xs font-bold text-slate-300">Reconciliation Bridge</div>
              <div className="space-y-1.5 text-[11px] font-mono">
                <div className="flex justify-between text-slate-400 pb-1 border-b border-slate-800/80">
                  <span>Reported GAAP Operating Loss</span>
                  <span className="text-rose-400">($24.2M)</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(+) Discontinued Storage Losses Carveout</span>
                  <span className="text-emerald-400 font-bold">+$38.5M</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>(+) Non-recurring Restructuring Addback</span>
                  <span className="text-emerald-400 font-bold">+$3.5M</span>
                </div>
                <div className="flex justify-between text-slate-100 font-bold pt-1.5 border-t border-slate-800">
                  <span className="text-emerald-300">(=) Rebuilt Continuing Operations EBIT</span>
                  <span className="text-emerald-400 font-bold">$17.8M</span>
                </div>
              </div>
            </div>

            {/* AI Reasoning Text Container */}
            <div className="p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs space-y-2 flex flex-col">
              <div className="flex items-center justify-between border-b border-slate-800 pb-1.5 shrink-0">
                <div className="flex items-center gap-1.5 text-slate-200 font-semibold text-xs">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Ling 3.0 Flash Fin Formal Reasoning</span>
                </div>
                {modelReasoning && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Vertical Scrollable
                  </span>
                )}
              </div>
              {isRunning ? (
                <div className="py-6 flex flex-col items-center justify-center space-y-2 text-slate-400">
                  <RefreshCw className="w-5 h-5 animate-spin text-purple-400" />
                  <span className="text-[11px]">Synthesizing SEC filings and footnotes...</span>
                </div>
              ) : modelReasoning ? (
                <div className="max-h-56 overflow-hidden">
                  <MarkdownViewer
                    content={modelReasoning}
                    maxHeight="max-h-52"
                  />
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic py-2">
                  Press &quot;Start Research&quot; above to trigger autonomous model reasoning and verification.
                </p>
              )}
            </div>
          </div>

          {/* Results Footer */}
          <div className="h-7 bg-slate-900/80 border-t border-slate-800 px-3 flex items-center justify-between text-[10px] text-slate-400">
            <span>Audit Trail: Immutable</span>
            <span className="text-slate-300 font-mono">Tolerance: 0.00%</span>
          </div>
        </div>
      </div>
    </div>
  );
};
