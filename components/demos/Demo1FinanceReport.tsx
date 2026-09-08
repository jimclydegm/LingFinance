"use client";

import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Sparkles,
  Send,
  TrendingUp,
  RefreshCw,
  Zap,
  BarChart3,
  AlertCircle,
  FileText,
} from "lucide-react";
import { queryLingFinance } from "@/lib/openrouter";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { cn } from "@/lib/utils";

interface ChartDataPoint {
  period: string;
  hyperscale: number;
  acie: number;
  total: number;
}

const INITIAL_CHART_DATA: ChartDataPoint[] = [
  { period: "FY23 Q4", hyperscale: 2.8, acie: 0.8, total: 3.6 },
  { period: "FY24 Q2", hyperscale: 7.2, acie: 3.1, total: 10.3 },
  { period: "FY24 Q4", hyperscale: 14.5, acie: 3.9, total: 18.4 },
  { period: "FY25 Q2", hyperscale: 22.6, acie: 3.7, total: 26.3 },
  { period: "FY25 Q4", hyperscale: 29.5, acie: 5.6, total: 35.1 },
  { period: "FY26E (Proj)", hyperscale: 38.2, acie: 9.8, total: 48.0 },
];

const NVIDIA_PROMPT =
  "Analyze NVIDIA's shift in growth drivers between Hyperscale cloud providers and ACIE (Accelerated Compute & Infrastructure Enterprise). Specifically break down the margin profiles, capex concentration risks, and enterprise AI adoption trajectories.";

const MICRON_PROMPT =
  "For Micron Technology, analyze its ~$100B in remaining performance obligations (RPO). Frame these obligations as multi-year customer contractual commitments rather than immediate recognized sales, dissecting HBM3e capacity reservation agreements, sovereign AI backlog, and GAAP revenue recognition timing.";

export const Demo1FinanceReport: React.FC = () => {
  const [activeAnalysis, setActiveAnalysis] = useState<"nvidia" | "micron">("nvidia");
  const [prompt, setPrompt] = useState(NVIDIA_PROMPT);
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>(INITIAL_CHART_DATA);
  const [hasExecuted, setHasExecuted] = useState<boolean>(false);

  const handleAnalyzeNvidia = async () => {
    setActiveAnalysis("nvidia");
    setPrompt(NVIDIA_PROMPT);
    setLoading(true);
    setError(null);

    setChartData([
      { period: "FY23 Q4", hyperscale: 2.8, acie: 0.8, total: 3.6 },
      { period: "FY24 Q2", hyperscale: 7.2, acie: 3.1, total: 10.3 },
      { period: "FY24 Q4", hyperscale: 14.5, acie: 3.9, total: 18.4 },
      { period: "FY25 Q2", hyperscale: 22.6, acie: 3.7, total: 26.3 },
      { period: "FY25 Q4", hyperscale: 29.5, acie: 5.6, total: 35.1 },
      { period: "FY26E (Proj)", hyperscale: 38.2, acie: 9.8, total: 48.0 },
    ]);

    try {
      const result = await queryLingFinance(NVIDIA_PROMPT, {
        systemPrompt:
          "You are a Wall Street quantitative equity analyst powered by Ling 3.0 Flash Fin. Provide structured, high-signal financial analysis with bullet points, numerical metrics, margin dynamics, and capital allocation assessments.",
      });
      setResponse(result);
      setHasExecuted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze NVIDIA growth drivers.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeMicron = async () => {
    setActiveAnalysis("micron");
    setPrompt(MICRON_PROMPT);
    setLoading(true);
    setError(null);

    setChartData([
      { period: "FY24 Q4", hyperscale: 4.2, acie: 18.5, total: 22.7 },
      { period: "FY25 Q2", hyperscale: 8.6, acie: 29.4, total: 38.0 },
      { period: "FY25 Q4", hyperscale: 14.1, acie: 42.6, total: 56.7 },
      { period: "FY26E (1H)", hyperscale: 20.4, acie: 58.2, total: 78.6 },
      { period: "FY26E (2H)", hyperscale: 26.8, acie: 72.4, total: 99.2 },
      { period: "FY27E (Proj)", hyperscale: 34.5, acie: 85.0, total: 119.5 },
    ]);

    try {
      const result = await queryLingFinance(MICRON_PROMPT, {
        systemPrompt:
          "You are a Wall Street quantitative equity analyst powered by Ling 3.0 Flash Fin. Specifically frame Micron's ~$100B remaining performance obligations (RPO) as multi-year commitments rather than single-period sales, analyzing HBM3e supply contracts, delivery schedules, and revenue timing.",
      });
      setResponse(result);
      setHasExecuted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to analyze Micron RPO.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomRun = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await queryLingFinance(prompt, {
        systemPrompt:
          "You are a Wall Street quantitative equity analyst powered by Ling 3.0 Flash Fin. Provide structured financial reasoning with clear sections, numerical data, and multi-statement validation.",
      });
      setResponse(result);
      setHasExecuted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Query execution failed.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Demo 1
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Finance Report & Visualization
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Evaluate NVIDIA revenue bifurcation: Hyperscale Cloud Titan CapEx vs ACIE (Accelerated Compute & Infrastructure Enterprise)
          </p>
        </div>

        {/* Action Buttons: NVIDIA and Micron presets */}
        <div className="flex items-center gap-2.5">
          <button
            id="action-analyze-nvidia"
            onClick={handleAnalyzeNvidia}
            disabled={loading}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all transform active:scale-95 shadow-md",
              activeAnalysis === "nvidia"
                ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 shadow-emerald-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            )}
          >
            {loading && activeAnalysis === "nvidia" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Analyze NVIDIA Drivers</span>
          </button>

          <button
            id="action-analyze-micron"
            onClick={handleAnalyzeMicron}
            disabled={loading}
            className={cn(
              "flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all transform active:scale-95 shadow-md",
              activeAnalysis === "micron"
                ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 shadow-cyan-500/20"
                : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
            )}
          >
            {loading && activeAnalysis === "micron" ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Analyze Micron RPO (~$100B)</span>
          </button>
        </div>
      </div>

      {/* Two-Pane View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 min-h-0 overflow-hidden">
        {/* Left Pane: Prompt Input Area & Response Output Container */}
        <div className="lg:col-span-6 flex flex-col space-y-3 min-h-0 overflow-hidden">
          {/* Prompt Input Area */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col space-y-2 shrink-0">
            <div className="flex items-center justify-between">
              <label htmlFor="prompt-input" className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Financial Reasoning Prompt</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">
                Model: inclusionai/ling-3.0-flash-fin:free
              </span>
            </div>

            <textarea
              id="prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={2}
              placeholder="Enter your financial analysis question..."
              className="w-full text-xs font-mono bg-slate-950/80 border border-slate-800 rounded-lg p-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-1 focus:ring-emerald-500/30 transition-all resize-none"
            />

            <div className="flex items-center justify-between pt-0.5">
              <span className="text-[11px] text-slate-400">
                Preset: NVIDIA Growth Drivers (Hyperscale vs ACIE)
              </span>
              <button
                onClick={() => handleAnalyzeNvidia()}
                disabled={loading || !prompt.trim()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors disabled:opacity-40"
              >
                <Send className="w-3 h-3 text-emerald-400" />
                <span>Run Query</span>
              </button>
            </div>
          </div>

          {/* Response Output Container with Fixed Height & Vertical Scrollbar */}
          <div className="flex-1 min-h-0 p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col overflow-hidden relative shadow-lg">
            <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800/80 shrink-0">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold text-slate-200">
                  Model Synthesis & Reasoning Output
                </span>
              </div>
              <div className="flex items-center gap-2">
                {hasExecuted && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Inference Complete
                  </span>
                )}
                {response && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    Vertical Scrollable
                  </span>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400 py-6">
                <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                <p className="text-xs font-medium text-slate-300">
                  Querying OpenRouter API (inclusionai/ling-3.0-flash-fin:free)...
                </p>
                <p className="text-[11px] text-slate-500 max-w-sm text-center">
                  Parsing Hyperscale capital cycles, networking attachment rates, and enterprise ACIE margins.
                </p>
              </div>
            ) : error ? (
              <div className="p-4 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-rose-200">Analysis Error</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed">{error}</p>
                </div>
              </div>
            ) : response ? (
              <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
                <div className="p-2 mb-2 rounded bg-slate-950/80 border border-slate-800/80 text-[10px] text-emerald-300/90 font-mono flex items-center justify-between shrink-0">
                  <span>Engine: inclusionai/ling-3.0-flash-fin:free</span>
                  <span className="text-slate-400">Structured Financial Report</span>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <MarkdownViewer
                    content={response}
                    className="h-full"
                  />
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 text-center p-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center mb-2">
                  <BarChart3 className="w-5 h-5 text-slate-400" />
                </div>
                <h4 className="text-xs font-semibold text-slate-300">No Analysis Executed Yet</h4>
                <p className="text-[11px] text-slate-400 max-w-xs mt-1">
                  Click <span className="text-emerald-400 font-medium">"Analyze NVIDIA growth drivers"</span> above to trigger model reasoning and data generation.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right Pane: Responsive Charting Area using Recharts */}
        <div className="lg:col-span-6 flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Chart Title & Stat Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-sm font-bold text-slate-100">
                    {activeAnalysis === "nvidia"
                      ? "NVIDIA Revenue Shift ($ Billions)"
                      : "Micron Technology RPO Breakdown ($ Billions)"}
                  </h3>
                </div>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {activeAnalysis === "nvidia"
                    ? "Hyperscale (Cloud Service Providers) vs ACIE (Accelerated Compute & Infrastructure Enterprise)"
                    : "Multi-Year Contract Backlog Commitments vs Recognized Product Revenue across Fiscal Years"}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <div className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono">
                  <span className="text-slate-400">
                    {activeAnalysis === "nvidia" ? "FY26E Total: " : "Contract Pool: "}
                  </span>
                  <span className="text-emerald-400 font-bold">
                    {activeAnalysis === "nvidia" ? "$48.0B" : "$119.5B"}
                  </span>
                </div>
                <div className="px-2.5 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-[11px] font-mono">
                  <span className="text-slate-400">
                    {activeAnalysis === "nvidia" ? "ACIE CAGR: " : "RPO Scale: "}
                  </span>
                  <span className="text-cyan-400 font-bold">
                    {activeAnalysis === "nvidia" ? "+85%" : "~$100B Commitments"}
                  </span>
                </div>
              </div>
            </div>

            {/* Recharts Container */}
            <div className="flex-1 w-full min-h-[360px] pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={chartData}
                  margin={{ top: 20, right: 20, left: -10, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis
                    dataKey="period"
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickLine={false}
                    axisLine={{ stroke: "#334155" }}
                    unit="B"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0f172a",
                      borderColor: "#334155",
                      borderRadius: "0.5rem",
                      fontSize: "12px",
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)",
                    }}
                    itemStyle={{ padding: "2px 0" }}
                    formatter={(value: number, name: string) => [
                      `$${value.toFixed(1)}B`,
                      activeAnalysis === "nvidia"
                        ? name === "hyperscale"
                          ? "Hyperscale Cloud Providers"
                          : "ACIE (Enterprise & Sovereign)"
                        : name === "hyperscale"
                        ? "Recognized Revenue"
                        : "Multi-Year RPO Backlog Commitments",
                    ]}
                  />
                  <Legend
                    verticalAlign="top"
                    height={36}
                    wrapperStyle={{ fontSize: "11px", paddingTop: "0px" }}
                    formatter={(value) => (
                      <span className="text-slate-300 font-medium">
                        {activeAnalysis === "nvidia"
                          ? value === "hyperscale"
                            ? "Hyperscale Cloud (AWS/Azure/GCP/OCI)"
                            : "ACIE (Enterprise, Auto & Sovereign AI)"
                          : value === "hyperscale"
                          ? "Recognized Revenue (Current Period)"
                          : "Multi-Year RPO Commitments (Future Delivery)"}
                      </span>
                    )}
                  />
                  <Bar
                    dataKey="hyperscale"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    name="hyperscale"
                  />
                  <Bar
                    dataKey="acie"
                    fill="#06b6d4"
                    radius={[4, 4, 0, 0]}
                    name="acie"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Key Insights Summary Footer */}
            <div className="grid grid-cols-3 gap-3 pt-3 mt-2 border-t border-slate-800/80 text-[11px]">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block">Hyperscale Concentration</span>
                <span className="font-bold text-slate-200 mt-0.5 block">~80% of Data Center</span>
                <span className="text-[10px] text-emerald-400">High Volume / Pricing Pressure</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block">ACIE Segment Growth</span>
                <span className="font-bold text-slate-200 mt-0.5 block">Accelerating to $9.8B</span>
                <span className="text-[10px] text-cyan-400">Enterprise AI & Sovereign Clouds</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-slate-500 block">Blended Gross Margin</span>
                <span className="font-bold text-slate-200 mt-0.5 block">74.5% - 76.0%</span>
                <span className="text-[10px] text-purple-400">Sustained High Returns</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
