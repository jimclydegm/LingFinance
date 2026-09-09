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
      { value: "FY2024 Actual", isHeader: true, align: "right" },
      { value: "FY2025 Actual", isHeader: true, align: "right" },
      { value: "2026 Q1 Actual", isHeader: true, align: "right" },
      { value: "2026 Q2 Actual (Mapped)", isHeader: true, align: "right" },
      { value: "FY2026 Consensus", isHeader: true, align: "right" },
    ],
    [
      { value: "Google Search & Other", align: "left" },
      { value: "$198,111", align: "right" },
      { value: "$228,450", align: "right" },
      { value: "$61,500", align: "right" },
      { value: "$66,200", isFormula: true, formulaText: "='Q2 Actuals'!C3", align: "right" },
      { value: "$272,500", isFormula: true, formulaText: "=SUM(D3:G3)", align: "right" },
    ],
    [
      { value: "YouTube Advertising", align: "left" },
      { value: "$36,147", align: "right" },
      { value: "$41,820", align: "right" },
      { value: "$10,850", align: "right" },
      { value: "$11,900", isFormula: true, formulaText: "='Q2 Actuals'!C4", align: "right" },
      { value: "$49,600", isFormula: true, formulaText: "=SUM(D4:G4)", align: "right" },
    ],
    [
      { value: "Google Network", align: "left" },
      { value: "$30,358", align: "right" },
      { value: "$31,480", align: "right" },
      { value: "$7,520", align: "right" },
      { value: "$7,840", isFormula: true, formulaText: "='Q2 Actuals'!C5", align: "right" },
      { value: "$31,800", isFormula: true, formulaText: "=SUM(D5:G5)", align: "right" },
    ],
    [
      { value: "Google Subscriptions, Platforms & Devices", align: "left" },
      { value: "$40,317", align: "right" },
      { value: "$45,850", align: "right" },
      { value: "$12,400", align: "right" },
      { value: "$13,250", isFormula: true, formulaText: "='Q2 Actuals'!C6", align: "right" },
      { value: "$54,100", isFormula: true, formulaText: "=SUM(D6:G6)", align: "right" },
    ],
    [
      { value: "Google Cloud Platform & Workspace", align: "left" },
      { value: "$43,248", align: "right" },
      { value: "$53,420", align: "right" },
      { value: "$14,650", align: "right" },
      { value: "$17,250", isFormula: true, formulaText: "='Q2 Actuals'!C7", align: "right" },
      { value: "$71,200", isFormula: true, formulaText: "=SUM(D7:G7)", align: "right" },
    ],
    [
      { value: "Other Bets", align: "left" },
      { value: "$1,623", align: "right" },
      { value: "$1,814", align: "right" },
      { value: "$490", align: "right" },
      { value: "$540", isFormula: true, formulaText: "='Q2 Actuals'!C8", align: "right" },
      { value: "$2,250", isFormula: true, formulaText: "=SUM(D8:G8)", align: "right" },
    ],
    [
      { value: "Total Revenues", isHeader: true, align: "left" },
      { value: "$350,018", align: "right" },
      { value: "$402,834", align: "right" },
      { value: "$107,410", align: "right" },
      { value: "$116,980", isFormula: true, formulaText: "=SUM(E3:E8)", align: "right" },
      { value: "$481,450", isFormula: true, formulaText: "=SUM(F3:F8)", align: "right" },
    ],
    [
      { value: "Traffic Acquisition Costs (TAC)", align: "left" },
      { value: "($54,850)", align: "right" },
      { value: "($61,200)", align: "right" },
      { value: "($15,950)", align: "right" },
      { value: "($17,300)", isFormula: true, formulaText: "='Q2 Actuals'!C10", align: "right" },
      { value: "($71,500)", isFormula: true, formulaText: "=SUM(D10:G10)", align: "right" },
    ],
    [
      { value: "Operating Income (EBIT)", isHeader: true, align: "left" },
      { value: "$118,300", align: "right" },
      { value: "$129,050", align: "right" },
      { value: "$36,200", align: "right" },
      { value: "$40,850", isFormula: true, formulaText: "='Q2 Actuals'!C11", align: "right" },
      { value: "$165,200", isFormula: true, formulaText: "=SUM(D11:G11)", align: "right" },
    ],
    [
      { value: "Operating Margin (%)", align: "left" },
      { value: "33.8%", align: "right" },
      { value: "32.0%", align: "right" },
      { value: "33.7%", align: "right" },
      { value: "34.9%", isFormula: true, formulaText: "=E11/E9", align: "right" },
      { value: "34.3%", isFormula: true, formulaText: "=F11/F9", align: "right" },
    ],
    [
      { value: "Capital Expenditures (AI Compute & TPU)", align: "left" },
      { value: "($52,500)", align: "right" },
      { value: "($75,000)", align: "right" },
      { value: "($21,500)", align: "right" },
      { value: "($24,200)", isFormula: true, formulaText: "='Q2 Actuals'!C13", align: "right" },
      { value: "($96,000)", isFormula: true, formulaText: "=SUM(D13:G13)", align: "right" },
    ],
    [
      { value: "Diluted EPS (USD)", isHeader: true, align: "left" },
      { value: "$8.04", align: "right" },
      { value: "$9.12", align: "right" },
      { value: "$2.55", align: "right" },
      { value: "$2.88", isFormula: true, formulaText: "='Q2 Actuals'!C15", align: "right" },
      { value: "$11.45", isFormula: true, formulaText: "=SUM(D14:G14)", align: "right" },
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
      { value: "$66,200", align: "right" },
      { value: "+14.8%", align: "right" },
      { value: "+$1,250M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "YouTube Advertising", align: "left" },
      { value: "XBRL Tag: YTAdsRev", align: "center" },
      { value: "$11,900", align: "right" },
      { value: "+13.1%", align: "right" },
      { value: "+$320M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Google Network", align: "left" },
      { value: "XBRL Tag: NetworkRev", align: "center" },
      { value: "$7,840", align: "right" },
      { value: "+1.2%", align: "right" },
      { value: "+$80M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Google Subscriptions, Platforms & Devices", align: "left" },
      { value: "XBRL Tag: SubscriptionsRev", align: "center" },
      { value: "$13,250", align: "right" },
      { value: "+15.4%", align: "right" },
      { value: "+$350M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Google Cloud", align: "left" },
      { value: "XBRL Tag: CloudRev", align: "center" },
      { value: "$17,250", align: "right" },
      { value: "+31.8%", align: "right" },
      { value: "+$890M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Other Bets", align: "left" },
      { value: "XBRL Tag: OtherBetsRev", align: "center" },
      { value: "$540", align: "right" },
      { value: "+21.2%", align: "right" },
      { value: "+$40M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Consolidated Revenue", isHeader: true, align: "left" },
      { value: "GAAP Total", align: "center" },
      { value: "$116,980", isFormula: true, formulaText: "=SUM(C2:C7)", align: "right" },
      { value: "+17.6%", align: "right" },
      { value: "+$2,930M", align: "right" },
      { value: "CALC_GAAP", align: "center" },
    ],
    [
      { value: "Traffic Acquisition Costs", align: "left" },
      { value: "GAAP TAC", align: "center" },
      { value: "($17,300)", align: "right" },
      { value: "+9.2%", align: "right" },
      { value: "($250M)", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Operating Income", isHeader: true, align: "left" },
      { value: "GAAP EBIT", align: "center" },
      { value: "$40,850", align: "right" },
      { value: "+28.4%", align: "right" },
      { value: "+$1,420M", align: "right" },
      { value: "HARD_ACTUAL", align: "center" },
    ],
    [
      { value: "Capital Expenditures (Cash Flow)", align: "left" },
      { value: "AI Infrastructure", align: "center" },
      { value: "($24,200)", align: "right" },
      { value: "+45.1%", align: "right" },
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
      { value: "$69,500", isFormula: true, formulaText: "='Q2 Actuals'!C2*1.050", align: "right" },
      { value: "$75,300", isFormula: true, formulaText: "=C2*1.083", align: "right" },
      { value: "$310,000", isFormula: true, formulaText: "=SUM(B2:C2)*2.15", align: "right" },
      { value: "+5.0% QoQ AI Overviews", align: "center" },
    ],
    [
      { value: "YouTube Advertising", align: "left" },
      { value: "$12,800", isFormula: true, formulaText: "='Q2 Actuals'!C3*1.075", align: "right" },
      { value: "$14,500", isFormula: true, formulaText: "=C3*1.133", align: "right" },
      { value: "$58,500", isFormula: true, formulaText: "=SUM(B3:C3)*2.14", align: "right" },
      { value: "Holiday Season Surge", align: "center" },
    ],
    [
      { value: "Google Network", align: "left" },
      { value: "$8,050", isFormula: true, formulaText: "='Q2 Actuals'!C4*1.026", align: "right" },
      { value: "$8,400", isFormula: true, formulaText: "=C4*1.043", align: "right" },
      { value: "$34,200", isFormula: true, formulaText: "=SUM(B4:C4)*2.08", align: "right" },
      { value: "Programmatic Stabilization", align: "center" },
    ],
    [
      { value: "Google Subscriptions, Platforms & Devices", align: "left" },
      { value: "$13,900", isFormula: true, formulaText: "='Q2 Actuals'!C5*1.049", align: "right" },
      { value: "$15,200", isFormula: true, formulaText: "=C5*1.094", align: "right" },
      { value: "$62,400", isFormula: true, formulaText: "=SUM(B5:C5)*2.14", align: "right" },
      { value: "Pixel & YouTube Music/Premium", align: "center" },
    ],
    [
      { value: "Google Cloud", align: "left" },
      { value: "$19,100", isFormula: true, formulaText: "='Q2 Actuals'!C6*1.107", align: "right" },
      { value: "$21,600", isFormula: true, formulaText: "=C6*1.131", align: "right" },
      { value: "$91,500", isFormula: true, formulaText: "=SUM(B6:C6)*2.25", align: "right" },
      { value: "Enterprise Vertex AI backlog", align: "center" },
    ],
    [
      { value: "Other Bets", align: "left" },
      { value: "$580", isFormula: true, formulaText: "='Q2 Actuals'!C7*1.074", align: "right" },
      { value: "$640", isFormula: true, formulaText: "=C7*1.103", align: "right" },
      { value: "$2,650", isFormula: true, formulaText: "=SUM(B7:C7)*2.17", align: "right" },
      { value: "Waymo commercial expansion", align: "center" },
    ],
    [
      { value: "Consolidated Revenue", isHeader: true, align: "left" },
      { value: "$123,930", isFormula: true, formulaText: "=SUM(B2:B7)", align: "right" },
      { value: "$135,640", isFormula: true, formulaText: "=SUM(C2:C7)", align: "right" },
      { value: "$559,250", isFormula: true, formulaText: "=SUM(D2:D7)", align: "right" },
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
      "Summarize the comprehensive steps to map Alphabet 2026 Q2 10-Q actuals into the consolidated financial model across all 6 reporting segments (Search, YouTube, Network, Subscriptions/Devices, Cloud, and Other Bets), reconcile audited historical actuals ($350.0B FY24, $402.8B FY25) to forward estimates, recalculate cross-sheet dependencies, and refresh 5,000+ formula links.";

    try {
      const modelOutput = await queryLingFinance(prompt, {
        systemPrompt:
          "You are an expert Wall Street Financial Modeling Engine powered by Ling 3.0 Flash Fin. Respond with clear, structured steps on mapping audited actuals to estimates across Alphabet's 6 reporting segments, verifying consolidated revenues exceeding $400B run-rate, and preserving cross-sheet workbook integrity.",
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
