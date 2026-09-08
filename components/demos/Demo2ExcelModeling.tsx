"use client";

import React, { useState } from "react";
import {
  FileSpreadsheet,
  Play,
  Download,
  Layers,
  Sparkles,
  RefreshCw,
  CheckCircle2,
  Table as TableIcon,
  HelpCircle,
} from "lucide-react";
import { queryLingFinance } from "@/lib/openrouter";
import { MarkdownViewer } from "@/components/MarkdownViewer";
import { cn } from "@/lib/utils";

type SheetTab = "Summary" | "Q2 Actuals" | "Projections";

interface CellData {
  value: string;
  isFormula?: boolean;
  formulaText?: string;
  isHeader?: boolean;
  isUpdated?: boolean;
  align?: "left" | "right" | "center";
}

export interface Demo2ExcelModelingProps {
  onShowToast: (title: string, message: string, type?: "success" | "error" | "info") => void;
}

export const Demo2ExcelModeling: React.FC<Demo2ExcelModelingProps> = ({ onShowToast }) => {
  const [activeSheet, setActiveSheet] = useState<SheetTab>("Summary");
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number }>({ row: 3, col: 3 });
  const [isUpdating, setIsUpdating] = useState<boolean>(false);
  const [isLoadingWorkbook, setIsLoadingWorkbook] = useState<boolean>(false);
  const [workbookLoaded, setWorkbookLoaded] = useState<boolean>(true);
  const [updatedCells, setUpdatedCells] = useState<Record<string, boolean>>({});
  const [totalFormulasUpdated, setTotalFormulasUpdated] = useState<number>(0);
  const [lastModelResponse, setLastModelResponse] = useState<string>("");

  // Sheet 1: Summary Sheet Data
  const summarySheet: CellData[][] = [
    [
      { value: "ALPHABET INC. (GOOGL)", isHeader: true, align: "left" },
      { value: "CONSOLIDATED FINANCIAL MODEL", isHeader: true, align: "left" },
      { value: "CURRENCY: USD ($M)", isHeader: true, align: "right" },
      { value: "MODEL VERSION: v8.4", isHeader: true, align: "right" },
      { value: "STATUS: LIVE", isHeader: true, align: "center" },
      { value: "UPDATED: 2026-Q2", isHeader: true, align: "center" },
    ],
    [
      { value: "Line Item", isHeader: true, align: "left" },
      { value: "FY2025 Actual", isHeader: true, align: "right" },
      { value: "2026 Q1 Actual", isHeader: true, align: "right" },
      { value: "2026 Q2 Actual (Mapped)", isHeader: true, align: "right" },
      { value: "2026 Q3 Estimate", isHeader: true, align: "right" },
      { value: "FY2026 Consensus", isHeader: true, align: "right" },
    ],
    [
      { value: "Google Search & Other", align: "left" },
      { value: "$195,480", align: "right" },
      { value: "$54,210", align: "right" },
      { value: "$59,450", isFormula: true, formulaText: "='Q2 Actuals'!C4", align: "right" },
      { value: "$62,100", isFormula: true, formulaText: "='Projections'!D4", align: "right" },
      { value: "$239,800", isFormula: true, formulaText: "=SUM(C3:F3)", align: "right" },
    ],
    [
      { value: "YouTube Advertising", align: "left" },
      { value: "$36,200", align: "right" },
      { value: "$9,840", align: "right" },
      { value: "$10,720", isFormula: true, formulaText: "='Q2 Actuals'!C5", align: "right" },
      { value: "$11,400", isFormula: true, formulaText: "='Projections'!D5", align: "right" },
      { value: "$43,850", isFormula: true, formulaText: "=SUM(C4:F4)", align: "right" },
    ],
    [
      { value: "Google Cloud Platform & Workspace", align: "left" },
      { value: "$43,120", align: "right" },
      { value: "$12,450", align: "right" },
      { value: "$14,890", isFormula: true, formulaText: "='Q2 Actuals'!C6", align: "right" },
      { value: "$16,500", isFormula: true, formulaText: "='Projections'!D6", align: "right" },
      { value: "$61,500", isFormula: true, formulaText: "=SUM(C5:F5)", align: "right" },
    ],
    [
      { value: "Google Subscriptions, Platforms & Devices", align: "left" },
      { value: "$40,300", align: "right" },
      { value: "$11,200", align: "right" },
      { value: "$11,980", isFormula: true, formulaText: "='Q2 Actuals'!C7", align: "right" },
      { value: "$12,650", isFormula: true, formulaText: "='Projections'!D7", align: "right" },
      { value: "$48,900", isFormula: true, formulaText: "=SUM(C6:F6)", align: "right" },
    ],
    [
      { value: "Total Revenues", isHeader: true, align: "left" },
      { value: "$315,100", align: "right" },
      { value: "$87,700", align: "right" },
      { value: "$97,040", isFormula: true, formulaText: "=SUM(D3:D6)", align: "right" },
      { value: "$102,650", isFormula: true, formulaText: "=SUM(E3:E6)", align: "right" },
      { value: "$394,050", isFormula: true, formulaText: "=SUM(F3:F6)", align: "right" },
    ],
    [
      { value: "Traffic Acquisition Costs (TAC)", align: "left" },
      { value: "($55,200)", align: "right" },
      { value: "($14,800)", align: "right" },
      { value: "($16,100)", isFormula: true, formulaText: "='Q2 Actuals'!C9", align: "right" },
      { value: "($16,900)", isFormula: true, formulaText: "=-0.215*E7", align: "right" },
      { value: "($65,400)", isFormula: true, formulaText: "=SUM(C8:F8)", align: "right" },
    ],
    [
      { value: "Operating Income (EBIT)", isHeader: true, align: "left" },
      { value: "$98,400", align: "right" },
      { value: "$28,500", align: "right" },
      { value: "$32,850", isFormula: true, formulaText: "='Q2 Actuals'!C11", align: "right" },
      { value: "$35,400", isFormula: true, formulaText: "=E7-E8-'Projections'!D11", align: "right" },
      { value: "$134,250", isFormula: true, formulaText: "=SUM(C9:F9)", align: "right" },
    ],
    [
      { value: "Operating Margin (%)", align: "left" },
      { value: "31.2%", align: "right" },
      { value: "32.5%", align: "right" },
      { value: "33.9%", isFormula: true, formulaText: "=D9/D7", align: "right" },
      { value: "34.5%", isFormula: true, formulaText: "=E9/E7", align: "right" },
      { value: "34.1%", isFormula: true, formulaText: "=F9/F7", align: "right" },
    ],
    [
      { value: "Capital Expenditures (AI Compute & TPU)", align: "left" },
      { value: "($52,100)", align: "right" },
      { value: "($15,400)", align: "right" },
      { value: "($18,650)", isFormula: true, formulaText: "='Q2 Actuals'!C14", align: "right" },
      { value: "($19,200)", isFormula: true, formulaText: "='Projections'!D14", align: "right" },
      { value: "($71,850)", isFormula: true, formulaText: "=SUM(C11:F11)", align: "right" },
    ],
    [
      { value: "Diluted EPS (USD)", isHeader: true, align: "left" },
      { value: "$6.85", align: "right" },
      { value: "$1.98", align: "right" },
      { value: "$2.31", isFormula: true, formulaText: "='Q2 Actuals'!C16", align: "right" },
      { value: "$2.48", isFormula: true, formulaText: "='Projections'!D16", align: "right" },
      { value: "$9.32", isFormula: true, formulaText: "=SUM(C12:F12)", align: "right" },
    ],
  ];

  // Sheet 2: Q2 Actuals Data
  const q2ActualsSheet: CellData[][] = [
    [
      { value: "ALPHABET 2026 Q2 10-Q EXTRACTED ACTUALS", isHeader: true, align: "left" },
      { value: "EDGAR XBRL PARSED", isHeader: true, align: "center" },
      { value: "Q2 2026", isHeader: true, align: "right" },
      { value: "YoY Growth", isHeader: true, align: "right" },
      { value: "Variance vs St Consensus", isHeader: true, align: "right" },
      { value: "Formula Tag", isHeader: true, align: "center" },
    ],
    [
      { value: "Google Search & Other", align: "left" },
      { value: "XBRL Tag: SearchRev", align: "center" },
      { value: "$59,450", align: "right" },
      { value: "+14.8%", align: "right" },
      { value: "+$1,250M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "YouTube Ads", align: "left" },
      { value: "XBRL Tag: YTAdsRev", align: "center" },
      { value: "$10,720", align: "right" },
      { value: "+13.1%", align: "right" },
      { value: "+$320M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Google Cloud", align: "left" },
      { value: "XBRL Tag: CloudRev", align: "center" },
      { value: "$14,890", align: "right" },
      { value: "+32.4%", align: "right" },
      { value: "+$890M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Subscriptions & Devices", align: "left" },
      { value: "XBRL Tag: OtherRev", align: "center" },
      { value: "$11,980", align: "right" },
      { value: "+12.0%", align: "right" },
      { value: "+$180M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Consolidated Revenue", isHeader: true, align: "left" },
      { value: "GAAP Total", align: "center" },
      { value: "$97,040", isFormula: true, formulaText: "=SUM(C2:C5)", align: "right" },
      { value: "+17.2%", align: "right" },
      { value: "+$2,640M", align: "right" },
      { value: "CALC_GAAP", align: "center" },
    ],
    [
      { value: "Traffic Acquisition Costs", align: "left" },
      { value: "GAAP TAC", align: "center" },
      { value: "($16,100)", align: "right" },
      { value: "+9.2%", align: "right" },
      { value: "($250M)", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Operating Income", isHeader: true, align: "left" },
      { value: "GAAP EBIT", align: "center" },
      { value: "$32,850", align: "right" },
      { value: "+28.4%", align: "right" },
      { value: "+$1,420M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Capital Expenditures (Cash Flow)", align: "left" },
      { value: "AI Infrastructure", align: "center" },
      { value: "($18,650)", align: "right" },
      { value: "+62.1%", align: "right" },
      { value: "+$2,100M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
  ];

  // Sheet 3: Projections Data
  const projectionsSheet: CellData[][] = [
    [
      { value: "ALPHABET FORWARD PROJECTIONS & COLD ESTIMATES", isHeader: true, align: "left" },
      { value: "Q3 2026E", isHeader: true, align: "right" },
      { value: "Q4 2026E", isHeader: true, align: "right" },
      { value: "FY 2027E", isHeader: true, align: "right" },
      { value: "Driver Assumption", isHeader: true, align: "center" },
    ],
    [
      { value: "Google Search & Other", align: "left" },
      { value: "$62,100", isFormula: true, formulaText: "='Q2 Actuals'!C2*1.045", align: "right" },
      { value: "$67,800", isFormula: true, formulaText: "=C2*1.092", align: "right" },
      { value: "$285,000", isFormula: true, formulaText: "=SUM(B2:C2)*2.2", align: "right" },
      { value: "+4.5% QoQ Momentum", align: "center" },
    ],
    [
      { value: "YouTube Advertising", align: "left" },
      { value: "$11,400", isFormula: true, formulaText: "='Q2 Actuals'!C3*1.063", align: "right" },
      { value: "$13,200", isFormula: true, formulaText: "=C3*1.158", align: "right" },
      { value: "$52,000", isFormula: true, formulaText: "=SUM(B3:C3)*2.15", align: "right" },
      { value: "Holiday Season Surge", align: "center" },
    ],
    [
      { value: "Google Cloud", align: "left" },
      { value: "$16,500", isFormula: true, formulaText: "='Q2 Actuals'!C4*1.108", align: "right" },
      { value: "$18,900", isFormula: true, formulaText: "=C4*1.145", align: "right" },
      { value: "$78,500", isFormula: true, formulaText: "=SUM(B4:C4)*2.25", align: "right" },
      { value: "Enterprise Vertex AI backlog", align: "center" },
    ],
    [
      { value: "Consolidated Revenue", isHeader: true, align: "left" },
      { value: "$102,650", isFormula: true, formulaText: "=SUM(B2:B4)", align: "right" },
      { value: "$113,400", isFormula: true, formulaText: "=SUM(C2:C4)", align: "right" },
      { value: "$465,000", isFormula: true, formulaText: "=SUM(D2:D4)", align: "right" },
      { value: "Cross-Sheet Refresh", align: "center" },
    ],
  ];

  const getActiveGrid = () => {
    switch (activeSheet) {
      case "Q2 Actuals":
        return q2ActualsSheet;
      case "Projections":
        return projectionsSheet;
      case "Summary":
      default:
        return summarySheet;
    }
  };

  const currentGrid = getActiveGrid();
  const currentSelectedCell = currentGrid[selectedCell.row]?.[selectedCell.col];
  const colHeaders = ["A", "B", "C", "D", "E", "F", "G", "H"];

  const handleLoadWorkbook = () => {
    setIsLoadingWorkbook(true);
    setTimeout(() => {
      setWorkbookLoaded(true);
      setIsLoadingWorkbook(false);
      onShowToast(
        "Google 2026 Q2 Workbook Loaded",
        "Successfully initialized 3-statement financial workbook with 5,280 inter-sheet cell bindings, historicals, and baseline projections.",
        "info"
      );
    }, 600);
  };

  const handleExecuteUpdate = async () => {
    setIsUpdating(true);
    setUpdatedCells({});

    const prompt =
      "Summarize the comprehensive steps to map Google 2026 Q2 10-Q actuals into the forward estimates model, switch hardcoded consensus formulas to verified historicals, recalculate cross-sheet dependencies for Google Cloud and YouTube, and refresh 5,000+ formula links.";

    try {
      const modelOutput = await queryLingFinance(prompt, {
        systemPrompt:
          "You are an expert Wall Street LBO / M&A Financial Modeling Engine powered by Ling 3.0 Flash Fin. Respond with clear, structured steps on mapping actuals to estimates, replacing forward plug formulas, and verifying cross-sheet integrity.",
      });

      setLastModelResponse(modelOutput);

      // Animate highlight across all formula cells in the grid
      const newUpdated: Record<string, boolean> = {};
      currentGrid.forEach((row, rIdx) => {
        row.forEach((cell, cIdx) => {
          if (cell.isFormula || cIdx === 3 || cell.isHeader) {
            newUpdated[`${rIdx}-${cIdx}`] = true;
          }
        });
      });
      setUpdatedCells(newUpdated);
      setTotalFormulasUpdated(5280);

      // Display response in floating toast notification as explicitly requested
      onShowToast(
        "Ling 3.0 Flash Fin: 5,280 Formulas Refreshed",
        modelOutput.slice(0, 450) + (modelOutput.length > 450 ? "..." : ""),
        "success"
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to execute workbook update.";
      onShowToast("Model Execution Error", msg, "error");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="h-full flex flex-col p-6 space-y-4 overflow-hidden">
      {/* Top Header & Controls Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              Demo 2
            </span>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Financial Modeling in Excel
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Automated actuals mapping, formula switching, and cross-sheet dependency recalculation
          </p>
        </div>

        {/* Control Panel: Buttons */}
        <div className="flex items-center gap-3">
          <button
            id="btn-load-workbook"
            onClick={handleLoadWorkbook}
            disabled={isLoadingWorkbook || isUpdating}
            className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors disabled:opacity-50"
          >
            {isLoadingWorkbook ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
            ) : (
              <Download className="w-3.5 h-3.5 text-cyan-400" />
            )}
            <span>Load Google 2026 Q2 Workbook</span>
          </button>

          <button
            id="btn-execute-update"
            onClick={handleExecuteUpdate}
            disabled={isUpdating}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-slate-950 font-bold text-xs tracking-wide shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
          >
            {isUpdating ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                <span>Executing 5,000+ Updates...</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 text-slate-950 fill-current" />
                <span>Execute Update</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Spreadsheet Formula Bar & Coordinate Inspector */}
      <div className="flex items-center gap-3 p-2 px-3 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono">
        <div className="px-2 py-1 bg-slate-950 rounded border border-slate-800 text-cyan-400 font-bold min-w-[50px] text-center">
          {colHeaders[selectedCell.col] || "A"}
          {selectedCell.row + 1}
        </div>
        <span className="text-slate-600 font-bold">fx</span>
        <div className="flex-1 bg-slate-950/70 border border-slate-800/80 rounded px-3 py-1 text-slate-200 truncate">
          {currentSelectedCell?.formulaText || currentSelectedCell?.value || ""}
        </div>
        {totalFormulasUpdated > 0 && (
          <div className="flex items-center gap-1.5 text-emerald-400 text-[11px] font-sans">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{totalFormulasUpdated.toLocaleString()} formulas refreshed</span>
          </div>
        )}
      </div>

      {/* Financial Workbook Data Grid */}
      <div className="flex-1 bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-2xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full border-collapse text-xs font-mono select-none">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
                <th className="w-12 py-2 px-2 border-r border-slate-800 text-slate-500 font-semibold text-center bg-slate-900">
                  #
                </th>
                {colHeaders.slice(0, 6).map((col, idx) => (
                  <th
                    key={col}
                    className="py-2 px-4 border-r border-slate-800 text-slate-400 font-semibold text-center min-w-[140px]"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentGrid.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className={cn(
                    "border-b border-slate-800/60 transition-colors",
                    rIdx % 2 === 0 ? "bg-slate-950/40" : "bg-slate-900/20"
                  )}
                >
                  {/* Row Number Column */}
                  <td className="w-12 py-2 px-2 border-r border-slate-800 text-slate-500 text-center font-bold bg-slate-900/60">
                    {rIdx + 1}
                  </td>

                  {/* Row Cells */}
                  {row.map((cell, cIdx) => {
                    const isSelected =
                      selectedCell.row === rIdx && selectedCell.col === cIdx;
                    const isCellUpdated = updatedCells[`${rIdx}-${cIdx}`];

                    return (
                      <td
                        key={cIdx}
                        onClick={() => setSelectedCell({ row: rIdx, col: cIdx })}
                        className={cn(
                          "py-2 px-3 border-r border-slate-800/50 cursor-pointer transition-all duration-300 relative text-xs",
                          cell.isHeader && "font-bold text-slate-100 bg-slate-900/40",
                          cell.align === "right" && "text-right",
                          cell.align === "center" && "text-center",
                          cell.align === "left" && "text-left",
                          isSelected &&
                            "ring-2 ring-cyan-500 bg-cyan-950/30 z-10 text-cyan-200",
                          isCellUpdated &&
                            "animate-flash-green bg-emerald-500/20 text-emerald-300 font-semibold"
                        )}
                      >
                        {cell.isFormula && (
                          <span className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-cyan-500/60" />
                        )}
                        <span className="truncate block">{cell.value}</span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Workbook Bottom Tabs for Sheet Navigation */}
        <div className="h-11 bg-slate-900 border-t border-slate-800 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <span className="text-[11px] font-sans text-slate-500 mr-2 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" /> Sheets:
            </span>
            {(["Summary", "Q2 Actuals", "Projections"] as SheetTab[]).map((tab) => {
              const isActive = activeSheet === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveSheet(tab)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-t border-t border-x transition-all relative top-[2px]",
                    isActive
                      ? "bg-slate-950 border-slate-700 text-cyan-400 font-semibold border-b-2 border-b-cyan-400 shadow-sm"
                      : "bg-slate-900 border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                  )}
                >
                  {tab}
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-400 font-mono hidden sm:flex items-center gap-3">
            <span>Workbook: GOOGL_2026Q2_Model.xlsx</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400">Sync: Clean</span>
          </div>
        </div>
      </div>

      {/* Model Output Inspector Drawer (if triggered) */}
      {lastModelResponse && (
        <div className="p-3.5 rounded-xl bg-slate-900/95 border border-slate-800 text-xs text-slate-300 flex flex-col space-y-2 max-h-44 shrink-0 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 shrink-0">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ling 3.0 Flash Fin Reasoning Summary</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              Vertical Scrollable Breakdown
            </span>
          </div>
          <div className="flex-1 min-h-0 overflow-hidden">
            <MarkdownViewer
              content={lastModelResponse}
              maxHeight="max-h-32"
            />
          </div>
        </div>
      )}
    </div>
  );
};
