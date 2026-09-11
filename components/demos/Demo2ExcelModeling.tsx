"use client";
import { useState } from "react";
import { queryLingFinance } from "@/lib/openrouter";
import {
  ALPHABET_ANNUAL_SOURCE,
  ALPHABET_Q2_SOURCE,
  calculateWorkbook,
  sum,
  money,
} from "@/lib/finance-data";
import { MarkdownViewer } from "@/components/MarkdownViewer";
export interface Demo2ExcelModelingProps {
  onShowToast: (
    title: string,
    message: string,
    type?: "success" | "error" | "info",
  ) => void;
}
export function Demo2ExcelModeling({ onShowToast }: Demo2ExcelModelingProps) {
  const [sheet, setSheet] = useState("Summary"),
    [mapped, setMapped] = useState(false),
    [growth, setGrowth] = useState(10),
    [busy, setBusy] = useState(false),
    [output, setOutput] = useState("");
  const rows = calculateWorkbook(growth, mapped);
  const headers =
    sheet === "Summary"
      ? [
          "Revenue category",
          "FY2024 actual",
          "FY2025 actual",
          `Q2 2026 ${mapped ? "mapped actual" : "illustrative estimate"}`,
          "Actual − estimate",
        ]
      : sheet === "Q2 Actuals"
        ? ["Revenue category", "Q2 2025 actual", "Q2 2026 actual"]
        : ["Revenue category", "Q3 2026 scenario", "Formula"];
  async function run() {
    setBusy(true);
    setOutput("");
    const updated = calculateWorkbook(growth, true);
    // These application calculations are independent of the model's explanation.
    setMapped(true);
    try {
      const result = await queryLingFinance(
        `Review this browser revenue workbook. Explain mapping Q2 Actuals into Summary, actual-minus-estimate variances, and the Q3 scenario. Data in USD millions: ${JSON.stringify(updated)}. Illustrative growth assumption: ${growth}%, not consensus. Estimates=round(Q2 2025*(1+growth/100)); Q3 scenario=round(mapped Q2 2026*(1+growth/100)). Totals=sum all seven rows, including hedging. Historical source ${ALPHABET_ANNUAL_SOURCE}; quarterly source ${ALPHABET_Q2_SOURCE}. Report any discrepancies. This is a small in-browser workbook, not Excel automation; app maps 7 values and recalculates 2 totals plus 7 projections. You have no live retrieval tools and do not edit cells. Alphabet reports segment results as Google Services, Google Cloud and Other Bets (a combination of operating segments). Search/YouTube/Network/subscriptions are components of Google Services. The seven non-overlapping rows correctly sum to consolidated revenue including hedging; adding the Google Services subtotal again would double-count. Application-calculated negative variance rows: ${JSON.stringify(updated.filter((r) => r.variance < 0).map((r) => ({ category: r.label, variance: r.variance })))}. The illustrative Q3 growth is quarter-over-quarter; observed Q2 annual growth is year-over-year. These are different time bases.`,
        {
          systemPrompt:
            "Review only the supplied workbook evidence. The app maps and updates values; you provide commentary and do not edit cells. Distinguish application calculations from model judgments. Do not invent a segment count or warn that summing non-overlapping rows double-counts. Identify all negative variance categories from the supplied list. A variance against an illustrative assumption is not an accounting discrepancy or a consensus surprise. Do not infer structural decline from one YoY observation. Do not label the Q3 scenario conservative or aggressive by comparing its QoQ growth to YoY growth. Treat the common growth rate, especially for hedging, as a mechanical sensitivity exercise, not a forecast. Limit the review to mapping, observed variances and evidence limitations.",
        },
      );
      setOutput(result);
      onShowToast(
        "Workbook mapped; model review received",
        "7 actuals mapped and 9 dependent values recalculated by the app.",
        "success",
      );
    } catch (e) {
      onShowToast(
        "Model review unavailable",
        `${e instanceof Error ? e.message : "Request failed"}. Workbook mapping completed independently.`,
        "error",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="h-full overflow-y-auto p-6 space-y-5">
      <section
        className="rounded-lg border border-cyan-900 bg-slate-900 p-3 text-xs text-slate-300"
        aria-label="Workbook interpretation checks"
      >
        <p>
          Accounting structure: Google Services, Google Cloud and Other Bets.
          The seven rows include non-overlapping revenue categories and hedging;
          summing them does not double-count.
        </p>
        <p className="mt-2">
          Negative actual-minus-estimate variances at the selected assumption:{" "}
          {rows
            .filter((r) => r.variance < 0)
            .map((r) => `${r.label}: ${money(r.variance)}M`)
            .join("; ") || "None"}
          .
        </p>
        <p className="mt-2">
          Q3 is a mechanical QoQ sensitivity scenario. A comparison with YoY
          growth cannot establish whether it is conservative. One annual decline
          does not establish a structural trend.
        </p>
      </section>
      <div>
        <p className="text-cyan-400 text-xs">DEMO 2 · FINANCIAL WORKBOOK</p>
        <h2 className="text-xl font-bold mt-2">
          Alphabet actuals → scenario model
        </h2>
        <p className="text-sm text-slate-400 mt-2">
          Source snapshots and working calculations in a browser grid. No Excel
          file or live spreadsheet connection.
        </p>
      </div>
      <div className="flex flex-wrap gap-4 items-center">
        <button
          id="btn-load-workbook"
          className="bg-slate-700 rounded px-4 py-2"
          disabled={busy}
          onClick={() => {
            setMapped(false);
            setOutput("");
            setGrowth(10);
          }}
        >
          Load / reset Google 2026 Q2 Workbook
        </button>
        <button
          id="btn-execute-update"
          disabled={busy}
          className="bg-cyan-700 rounded px-4 py-2 disabled:opacity-50"
          onClick={() => void run()}
        >
          {busy ? "Reviewing with Ling…" : "Execute Update & Review"}
        </button>
        <label className="text-sm">
          Illustrative growth %{" "}
          <input
            aria-label="Illustrative growth percent"
            type="number"
            min={-100}
            max={100}
            value={growth}
            disabled={busy}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n))
                setGrowth(Math.max(-100, Math.min(100, n)));
            }}
            className="w-20 bg-slate-800 p-2 rounded"
          />
        </label>
      </div>
      <p className="text-xs text-amber-200">
        {mapped
          ? "7 actuals mapped; 9 dependent values recalculated. Green cells show mapped values. Calculations are performed by the app."
          : "Before update: Q2 estimates = Q2 2025 actuals × your illustrative growth assumption."}
      </p>
      <div className="border border-slate-700 rounded-xl overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-slate-800">
            <tr>
              {headers.map((h) => (
                <th key={h} className="p-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} className="border-t border-slate-800">
                <td className="p-3 text-left">{r.label}</td>
                {sheet === "Summary" ? (
                  <>
                    <td>{money(r.fy24)}</td>
                    <td>{money(r.fy25)}</td>
                    <td
                      title={
                        mapped
                          ? `='Q2 Actuals'!C${i + 2}`
                          : `=ROUND('Q2 Actuals'!B${i + 2}*(1+${growth}/100),0)`
                      }
                      className={
                        mapped ? "bg-emerald-900/40 text-emerald-300" : ""
                      }
                    >
                      {money(r.current)}
                    </td>
                    <td>{money(r.variance)}</td>
                  </>
                ) : sheet === "Q2 Actuals" ? (
                  <>
                    <td>{money(r.q225)}</td>
                    <td>{money(r.q226)}</td>
                  </>
                ) : (
                  <>
                    <td>{money(r.projection)}</td>
                    <td className="pr-3 text-xs font-mono">
                      =ROUND(Summary!D{i + 2}*(1+{growth}/100),0)
                    </td>
                  </>
                )}
              </tr>
            ))}
            <tr className="border-t border-cyan-700 bg-slate-800 font-bold">
              <td className="p-3 text-left">Total revenue ($M)</td>
              {(sheet === "Summary"
                ? (["fy24", "fy25", "current", "variance"] as const)
                : sheet === "Q2 Actuals"
                  ? (["q225", "q226"] as const)
                  : (["projection"] as const)
              ).map((k) => (
                <td key={k}>{money(sum(rows.map((r) => r[k])))}</td>
              ))}
              {sheet === "Projections" && <td>=SUM(B2:B8)</td>}
            </tr>
          </tbody>
        </table>
        <div className="flex gap-1 p-2 bg-slate-950">
          {["Summary", "Q2 Actuals", "Projections"].map((t) => (
            <button
              key={t}
              onClick={() => setSheet(t)}
              className={`px-4 py-2 rounded ${sheet === t ? "bg-cyan-900 text-cyan-200" : "bg-slate-800"}`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs text-slate-400">
        FY2024 $350,018M · FY2025 $402,836M · Q2 2026 $119,796M. Includes
        hedging. Quarterly results are unaudited. Q3 is an illustrative
        scenario, not company guidance or consensus.
      </p>
      <div className="flex gap-5 text-xs text-cyan-400 underline">
        <a href={ALPHABET_ANNUAL_SOURCE} target="_blank" rel="noreferrer">
          2025 10-K revenue table
        </a>
        <a href={ALPHABET_Q2_SOURCE} target="_blank" rel="noreferrer">
          Q2 2026 earnings release
        </a>
      </div>
      {output && (
        <section className="p-5 rounded-xl border border-slate-800 bg-slate-900">
          <h3 className="mb-3">
            Ling workbook review · unverified model commentary
          </h3>
          <MarkdownViewer content={output} />
        </section>
      )}
    </div>
  );
}
