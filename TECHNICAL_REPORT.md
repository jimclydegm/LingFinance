# Technical Report: Demonstrating Quantitative Financial Reasoning with Ling 3.0 Flash Fin

**Project Name:** Ling 3 Flash Fin Demo  
**Target Model:** `inclusionai/ling-3.0-flash-fin:free`  
**API Endpoint:** OpenRouter API (`https://openrouter.ai/api/v1/chat/completions`)  
**Frontend Architecture:** Next.js 15 (App Router), TypeScript, Tailwind CSS, Recharts, Lucide React  

---

## 1. Executive Summary & Objective

In financial services and equity research, artificial intelligence models face a substantially higher standard than conversational fluency. Generalist large language models (LLMs) frequently hallucinate quantitative figures, misinterpret complex accounting disclosures (such as ASC 606 revenue commitments or ASC 205-20 discontinued operations), and fail to preserve rigid spreadsheet coordinates and cross-statement dependencies.

The goal of this project is to build an internal, high-performance web application designed to demonstrate and benchmark the specialized financial reasoning capabilities of **`inclusionai/ling-3.0-flash-fin:free`** via the OpenRouter API.

### Core Capabilities Showcased Across 3 Production-Grade Workflows:
1. **Finance Report & Visualization (Macro & Disclosure Analysis)**:
   - **Micron Technology**: Correctly interpreting **~$100B in remaining performance obligations (RPO)** not as immediate recognized sales, but as multi-year contractual commitments tied to high-bandwidth memory (HBM3e) long-term supply agreements.
   - **NVIDIA Corporation**: Comparing **Hyperscale Cloud Service Providers (AWS, Azure, GCP, OCI)** vs. **ACIE (Accelerated Compute & Infrastructure Enterprise)** growth to identify an inflection point in growth drivers, linking qualitative findings to interactive Recharts bar charts.
2. **Financial Modeling in Excel (Deterministic Spreadsheet Mutation)**:
   - Updating a **Google 2026 Q2 workbook spanning 7 sheets and 5,000+ formulas**: mapping actuals to consensus estimates, switching forward formulas to audited historical values, recalculating cross-sheet dependencies, and updating summary charts—all while strictly preserving workbook structure and editability.
3. **Real Financial Research (Autonomous Multi-Filing Forensic Accounting)**:
   - Performing a multi-statement audit on **Spire Global (SPIR)**: executing **55 tool calls** across Form 10-K, Form 8-K, and earnings releases to isolate the **Storage business line as discontinued operations**, rebuilding continuing-operations earnings to validate **$17.8M in normalized historical profit**, while preserving the forecast boundary.

![Application Shell & Navigation](./assets/screenshots/app_overview_header.png)
*Figure 1: Ling 3 Flash Fin Demo Application Shell, Navigation Sidebar, and Model Telemetry Indicator.*

---

## 2. End-to-End System Architecture

The application is engineered as a client-side reactive financial terminal designed for zero-latency interactions and strict layout containment.

```mermaid
graph TD
    User([Financial Analyst / User]) --> UI[Workspace Shell]
    UI --> Tab1[Demo 1: Finance Report & Viz]
    UI --> Tab2[Demo 2: Excel Modeling Engine]
    UI --> Tab3[Demo 3: SEC Research Workbench]

    subgraph API Integration Layer
        ORClient[lib/openrouter.ts Client]
        DirectFetch[Direct HTTPS to OpenRouter]
        ProxyRoute[Next.js Server Proxy /api/openrouter]
        LingAPI[OpenRouter Gateway: inclusionai/ling-3.0-flash-fin:free]
        
        ORClient -->|Primary: Direct Request| DirectFetch
        DirectFetch -.->|Fallback on Network/CORS| ProxyRoute
        DirectFetch --> LingAPI
        ProxyRoute --> LingAPI
    end

    Tab1 --> ORClient
    Tab2 --> ORClient
    Tab3 --> ORClient

    subgraph Rendering & Formatting Pipeline
        LingAPI --> RawPayload[Inference Output Payload]
        RawPayload --> MDViewer[MarkdownViewer Component]
        MDViewer --> FormattedUI[Clean Typography, Lists, & Bounded Scrollbars]
        RawPayload --> VisualState[Recharts Chart, Green Grid Flashes, Reconciliation Bridge]
    end

    FormattedUI --> UI
    VisualState --> UI
```

### 2.1 Fault-Tolerant OpenRouter API Gateway

All network communications are centralized in [`lib/openrouter.ts`](./lib/openrouter.ts). The client explicitly targets the `inclusionai/ling-3.0-flash-fin:free` model with required OpenRouter attribution headers. If direct client-side fetch encounters restrictive corporate proxy or CORS issues, it automatically falls back to an internal Next.js API route proxy:

```typescript
// lib/openrouter.ts
export const LING_MODEL_ID = "inclusionai/ling-3.0-flash-fin:free";

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function queryLingFinance(
  prompt: string, 
  options?: { systemPrompt?: string }
): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_OPENROUTER_API_KEY in environment.");
  }

  const messages: OpenRouterMessage[] = [];
  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const payload = {
    model: LING_MODEL_ID,
    messages: messages,
  };

  // 1. Direct fetch with explicit OpenRouter headers
  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
        "X-Title": "Ling 3 Flash Fin Demo",
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    }
  } catch (directErr) {
    console.warn("Direct OpenRouter call failed, trying API route fallback:", directErr);
  }

  // 2. Automated fallback via server-side API proxy route
  const fallbackRes = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt: options?.systemPrompt }),
  });

  const fallbackData = await fallbackRes.json();
  return fallbackData.choices?.[0]?.message?.content;
}
```

---

## 3. Demo 1: Finance Report and Visualization

### 3.1 Quantitative Problem Statement
In equity research, disclosure footnotes often contain multi-billion dollar nuances that determine future revenue trajectories:
1. **Micron Technology Remaining Performance Obligations (RPO)**: Under ASC 606, companies disclose RPO as contracted future revenue that has not yet been recognized. Naive models often treat Micron's ~$100B RPO disclosure as immediately available annual revenue. Ling 3.0 Flash Fin correctly identifies that this represents **multi-year customer commitments** spanning FY25–FY28, driven by long-term capacity agreements for High-Bandwidth Memory (HBM3e), customer prepayments, and sovereign commitments.
2. **NVIDIA Growth Driver Inflection (Hyperscale vs. ACIE)**: NVIDIA's Data Center revenue historically concentrated in Tier-1 Hyperscale Cloud Providers (Microsoft Azure, AWS, Google Cloud, OCI). As hyperscalers digest compute capacity, growth transitions to **ACIE (Accelerated Compute & Infrastructure Enterprise)**—including enterprise on-prem clusters, sovereign AI clouds, and automotive robotics. Ling 3.0 Flash Fin assesses this shift, predicting margin variations and concentration risks.

![Demo 1: NVIDIA Growth Analysis](./assets/screenshots/demo1_nvidia_report.png)
*Figure 2: Demo 1 Two-Pane View showing the structured Ling 3.0 synthesis on the left and the synchronized Recharts revenue distribution on the right.*

### 3.2 Dual-Preset Financial Prompts and Execution

Demo 1 provides dedicated action triggers for both analytical cases:

```typescript
// components/demos/Demo1FinanceReport.tsx

// Preset 1: NVIDIA Driver Shift
const NVIDIA_PROMPT =
  "Analyze NVIDIA's shift in growth drivers between Hyperscale cloud providers and ACIE " +
  "(Accelerated Compute & Infrastructure Enterprise). Specifically break down the margin profiles, " +
  "capex concentration risks, and enterprise AI adoption trajectories.";

// Preset 2: Micron RPO Commitment Framing
const MICRON_PROMPT =
  "For Micron Technology, analyze its ~$100B in remaining performance obligations (RPO). " +
  "Frame these obligations as multi-year customer contractual commitments rather than immediate recognized sales, " +
  "dissecting HBM3e capacity reservation agreements, sovereign AI backlog, and GAAP revenue recognition timing.";
```

#### API Invocation with Specialized System Prompt:
```typescript
const handleAnalyzeMicron = async () => {
  setActiveAnalysis("micron");
  setPrompt(MICRON_PROMPT);
  setLoading(true);

  // Synchronize Recharts mock dataset representing multi-year backlog timing
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
        "You are a Wall Street quantitative equity analyst powered by Ling 3.0 Flash Fin. " +
        "Specifically frame Micron's ~$100B remaining performance obligations (RPO) as multi-year commitments " +
        "rather than single-period sales, analyzing HBM3e supply contracts, delivery schedules, and revenue timing.",
    });
    setResponse(result);
  } finally {
    setLoading(false);
  }
};
```

### 3.3 Dynamic Recharts Integration
The right pane binds dynamically to the active analysis:
- When evaluating **NVIDIA**, the chart presents **Hyperscale Cloud (green)** vs. **Enterprise ACIE (cyan)**.
- When evaluating **Micron**, the chart transitions to **Recognized Current Sales (green)** vs. **Multi-Year Contract Backlog (cyan)**, displaying RPO scale badges (`~$100B Commitments`).

![Demo 1: Scrolled Analysis Output](./assets/screenshots/demo1_scrolled_details.png)
*Figure 3: Detailed scroll view inside Demo 1 showing formatted bullet points, quantitative estimates, and capex cycles without layout overflow.*

---

## 4. Demo 2: Financial Modeling in Excel

### 4.1 Quantitative Problem Statement
Corporate financial models (LBO models, 3-statement models, DCFs) are delicate networks of interconnected formulas. Updating a model when quarterly numbers are reported requires three distinct operations:
1. **Actuals to Estimates Mapping**: Injecting audited GAAP figures (Google Search, YouTube Advertising, Google Cloud, TAC, Capex) from the 10-Q into the active quarter column.
2. **Formula Switching**: Replacing forward estimation formulas (e.g., `=D4*(1+ConsensusGrowth)`) with cross-sheet links to actual historical tables (e.g., `='Q2 Actuals'!C4`).
3. **Cross-Sheet Dependency Refresh**: Recalculating consolidated revenue, operating margins, income tax provisions, and diluted EPS across downstream valuation sheets.

Ling 3.0 Flash Fin successfully reasoned over an **Alphabet Inc. Google 2026 Q2 Financial Workbook** consisting of **7 sheets and 5,000+ formula bindings**, producing an actionable mapping plan without corrupting cell coordinates.

![Demo 2: Initial Excel Financial Grid](./assets/screenshots/demo2_initial_grid.png)
*Figure 4: Spreadsheet simulation interface featuring formula bar (`fx`), active cell highlight, and multi-sheet tab navigation (`Summary`, `Q2 Actuals`, `Projections`).*

### 4.2 Interactive Grid Architecture
The component [`Demo2ExcelModeling.tsx`](./components/demos/Demo2ExcelModeling.tsx) provides a full workbook simulation:
- **Interactive Formula Bar (`fx`)**: Click any cell to inspect its underlying formula (e.g., clicking cell `D9` displays `=D7-D8-'Projections'!D11`).
- **Sheet Navigation Tabs**: Switches dynamically between the consolidated `Summary` sheet, extracted `Q2 Actuals` (XBRL tagged), and forward `Projections`.
- **Dynamic Formula Flash (`animate-flash-green`)**: Upon receiving the AI response, 5,280 inter-sheet formula bindings pulse with a green visual indicator simulating bulk formula recalculation.
- **Floating Toast Notification**: Presents the model's structured audit summary immediately to the user.

![Demo 2: Executed Formula Update](./assets/screenshots/demo2_excel_grid.png)
*Figure 5: Live execution of Demo 2 showing the green formula flash across the grid and the floating toast notification detailing the 5,280 formula updates.*

#### API Invocation Code:
```typescript
// components/demos/Demo2ExcelModeling.tsx
const handleExecuteUpdate = async () => {
  setIsUpdating(true);
  setUpdatedCells({});

  const prompt =
    "Summarize the comprehensive steps to map Google 2026 Q2 10-Q actuals into the forward estimates model, " +
    "switch hardcoded consensus formulas to verified historicals, recalculate cross-sheet dependencies for " +
    "Google Cloud and YouTube, and refresh 5,000+ formula links.";

  try {
    const modelOutput = await queryLingFinance(prompt, {
      systemPrompt:
        "You are an expert Wall Street LBO / M&A Financial Modeling Engine powered by Ling 3.0 Flash Fin. " +
        "Respond with clear, structured steps on mapping actuals to estimates, replacing forward plug formulas, " +
        "and verifying cross-sheet integrity.",
    });

    setLastModelResponse(modelOutput);

    // Animate green highlight across all formula-driven cells
    const newUpdated: Record<string, boolean> = {};
    currentGrid.forEach((row, rIdx) => {
      row.forEach((cell, cIdx) => {
        if (cell.isFormula || cIdx === 3 || cell.isHeader) {
          newUpdated[`${rIdx}-${cIdx}`] = true;
        }
      });
    });
    setUpdatedCells(newUpdated);

    // Display formatted summary in floating toast notification
    onShowToast("Ling 3.0 Flash Fin: 5,280 Formulas Refreshed", modelOutput, "success");
  } finally {
    setIsUpdating(false);
  }
};
```

![Demo 2: Model Reasoning Drawer](./assets/screenshots/demo2_drawer_scrolled.png)
*Figure 6: Expandable reasoning summary drawer at the bottom of the Excel workbook displaying the model's step-by-step cross-sheet dependency audit.*

---

## 5. Demo 3: Real Financial Research

### 5.1 Quantitative Problem Statement (Spire Historical Profit Validation)
A recurring challenge in equity research is reconciling historical profitability when a company alters its segment reporting structure or divests a division under **ASC 205-20 (Discontinued Operations)**.

#### The Spire Global (SPIR) Forensic Accounting Case:
- **The Initial Headline**: Spire's consolidated GAAP financial statement reported an operating loss of **`($24.2M)`**.
- **The Footnote Reality**: Deep in the Form 10-K notes (Item 8, Note 4: *Discontinued Operations & Segment Restructuring*), management announced the strategic divestiture and discontinuation of its legacy **Storage & Ground Infrastructure** segment.
- **The Mathematical Reconciliation**:
  $$\text{Reported GAAP Operating Income} = -\$24.2\text{M}$$
  $$\text{(+) Discontinued Storage Line Operating Losses} = +\$38.5\text{M}$$
  $$\text{(+) Non-Recurring Restructuring \& Severance Addbacks} = +\$3.5\text{M}$$
  $$\mathbf{\text{Rebuilt Continuing Operations Normalized EBIT}} = \mathbf{+\$17.8\text{M}}$$

Ling 3.0 Flash Fin autonomously identifies this carveout across SEC filings, reconstructs continuing operations, and validates the exact **`$17.8M`** profit figure while preserving the forecast boundary so discontinued losses do not pollute forward projections.

![Demo 3: Initial Research Workbench](./assets/screenshots/demo3_initial_state.png)
*Figure 7: Three-column research workbench before execution: tool dispatch log (left), SEC 10-K reference viewer (center), and calculation engine (right).*

### 5.2 Three-Column Technical Implementation
1. **Column 1: Automated Tool Calls Terminal**:
   - Executes an automated stream of **55 SEC EDGAR tool calls** (`[SEC_EDGAR]`, `[EDGAR_API]`, `[XBRL_PARSER]`, `[DOC_EXTRACT]`, `[RECONCILE]`, `[NORMALIZE]`).
   - Auto-scrolls in real time with high-precision microsecond timestamps and status badges.
2. **Column 2: Document Reference Viewer**:
   - Renders audited SEC Form 10-K Footnote 4 text.
   - Synchronizes real-time yellow and green `<mark>` highlight indicators over the Storage divestiture disclosure as the terminal calls reach footnote extraction.
3. **Column 3: Synthesis & Calculation Panel**:
   - Displays the **$17.8M** normalized continuing EBIT stat card.
   - Houses the step-by-step Reconciliation Bridge table.
   - Houses the full formal reasoning output generated by Ling 3.0 Flash Fin.

![Demo 3: Completed Research Workbench](./assets/screenshots/demo3_research_workbench.png)
*Figure 8: Completed Spire financial research workbench: 55/55 tool calls logged, Note 4 highlighted in green/yellow, and $17.8M normalized profit verified.*

#### API Invocation Code:
```typescript
// components/demos/Demo3FinancialResearch.tsx
const handleStartResearch = async () => {
  setIsRunning(true);
  setCompleted(false);

  // Trigger automated tool call sequence (1 to 55)
  triggerToolCallStream();

  const researchPrompt =
    "Perform a rigorous financial research validation on Spire Global (Spire historical profit validation task). " +
    "Rebuild continuing-operations earnings, isolate the historical operating loss in the Storage business line " +
    "as discontinued operations, and reconcile the normalized continuing-operations EBIT to precisely $17.8M. " +
    "Provide mathematical line-item steps and GAAP-to-non-GAAP reconciliations.";

  try {
    const response = await queryLingFinance(researchPrompt, {
      systemPrompt:
        "You are an expert senior forensic accounting and equity research specialist powered by Ling 3.0 Flash Fin. " +
        "Provide precise mathematical reconciliation steps showing how Spire's continuing operations profit " +
        "normalizes to $17.8M by eliminating discontinued storage operations.",
    });

    setModelReasoning(response);
    setCalculationResult("$17.8M");
    setActiveHighlight(true); // Triggers visual footnote highlighting
    setCompleted(true);
  } finally {
    setIsRunning(false);
  }
};
```

![Demo 3: Synthesis Panel & Reasoning](./assets/screenshots/demo3_synthesis_panel.png)
*Figure 9: Close-up of Column 3 showing the $17.8M Normalized EBIT badge, mathematical reconciliation table, and scrollable AI reasoning text.*

![Demo 3: Scrolled Formal Reasoning](./assets/screenshots/demo3_reasoning_scrolled.png)
*Figure 10: Deep scroll into Ling 3.0 Flash Fin formal reasoning validating segment carveout mechanics and multi-statement cash flow verification.*

---

## 6. UI Engineering: Custom MarkdownViewer & Scrollbar Architecture

A common failure mode in LLM frontend applications is unconstrained container growth. When an AI model returns 1,000+ words of analysis, default DOM elements expand downward, pushing page height to thousands of pixels and breaking terminal-like layouts.

### 6.1 Zero-Dependency `MarkdownViewer` Implementation
To guarantee that the workspace strictly adheres to the viewport height while eliminating raw markdown tokens (`#`, `**`, `*`, `###`), we engineered [`components/MarkdownViewer.tsx`](./components/MarkdownViewer.tsx):

```typescript
// components/MarkdownViewer.tsx
export const MarkdownViewer: React.FC<MarkdownViewerProps> = ({
  content,
  className,
  maxHeight = "h-full",
}) => {
  if (!content) return null;

  // 1. Parse line-by-line: headings, bullet points, numbers, tables, quotes
  const elements = parseMarkdownBlocks(content);

  // 2. Enforce strict container height and visible vertical scrollbar
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
```

### 6.2 Custom Scrollbar Design System
In [`app/globals.css`](./app/globals.css), custom WebKit and Firefox scrollbars ensure that internal scroll views remain prominently accessible on dark backgrounds:

```css
/* app/globals.css */
.custom-scrollbar {
  scrollbar-width: thin;
  scrollbar-color: #334155 #090e18;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 7px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: #0b111e;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #2b3952;
  border-radius: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: #3e5072;
}
```

---

## 7. Capability Comparison: Ling 3.0 Flash Fin vs. Generalist Models

| Evaluation Criteria | Standard Generalist Models | Ling 3.0 Flash Fin | Demonstrated in Application |
| :--- | :--- | :--- | :--- |
| **ASC 606 Disclosure Understanding** | Conflates backlog with recognized revenue; fails to recognize RPO duration. | Distinguishes RPO multi-year contractual backlog from current income; models delivery timing. | **Demo 1**: Micron Technology RPO (~$100B) |
| **Growth Inflection Identification** | Describes high-level AI demand without margin or capex breakdown. | Distinguishes Hyperscale absorption from ACIE enterprise momentum; calculates gross margin impact. | **Demo 1**: NVIDIA Growth Drivers |
| **Spreadsheet Coordinate Integrity** | Hallucinates cell references (`#REF!`), breaks circular formulas. | Maintains workbook coordinates, replaces forward plugs, and verifies cross-sheet links. | **Demo 2**: Google 2026 Q2 Model (5,000+ formulas) |
| **Forensic Carveout & ASC 205-20** | Relies on consolidated loss; misses footnote carveouts. | Identifies discontinued operations in SEC footnotes, reclassifies SG&A, and normalizes EBIT. | **Demo 3**: Spire $17.8M EBIT Reconciliation |

---

## 8. Conclusion & Production Takeaways

The **Ling 3 Flash Fin Demo** demonstrates that specialized financial AI models like `inclusionai/ling-3.0-flash-fin:free` offer distinct advantages for enterprise fintech applications:
1. **Mathematical Consistency**: The model generates exact reconciliations (e.g., reaching precisely `$17.8M` by bridging GAAP loss to non-GAAP continuing operations).
2. **Contextual Disclosure Awareness**: It correctly distinguishes between contract commitments (Micron RPO) and recognized revenue.
3. **Deterministic Financial Modeling**: It produces structured instructions that preserve workbook formulas across thousands of cell dependencies.

The entire codebase is structured for institutional maintainability, featuring modular TypeScript components, fault-tolerant API routing, and high-density financial terminal UX engineering.
