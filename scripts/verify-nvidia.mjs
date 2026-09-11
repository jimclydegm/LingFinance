import ts from "typescript";
import { readFile } from "node:fs/promises";
async function mod(path) {
  return import(
    "data:text/javascript;base64," +
      Buffer.from(
        ts.transpileModule(await readFile(path, "utf8"), {
          compilerOptions: {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ES2022,
          },
        }).outputText,
      ).toString("base64")
  );
}
const { NVIDIA_DATA, NVIDIA_ANALYSIS_SCHEMA, validateNvidiaAnalysis } =
  await mod("lib/finance-data.ts");
const { queryLingFinance } = await mod("lib/openrouter.ts");
const original = global.fetch;
global.fetch = (url, opts) =>
  original(new URL(url, "http://localhost:3000"), opts);
const raw = await queryLingFinance(
  `Analyze NVIDIA growth drivers from these USD million rows: ${JSON.stringify(NVIDIA_DATA.map(({total,...r})=>({...r,totalCompanyRevenue:total,dataCenter:r.hyperscale+r.acie})))}. Compare FY27 Q2 to FY26 Q2. Shares must use Hyperscale plus ACIE as denominator. All periods use Q2 FY27 recast basis. ACIE means AI Clouds, Industrial, and Enterprise. The dataCenter field is provided explicitly and excludes Edge. totalCompanyRevenue is not dataCenter. Do not invent demand drivers.`,
  {
    schema: NVIDIA_ANALYSIS_SCHEMA,
    systemPrompt:
      "Call submit_analysis. Calculate Data Center totals, Hyperscale and ACIE shares (%) for all input rows in order, and year-over-year growth (%) comparing last row to first. Round to two decimals. Provide concise qualitative analysis without invented facts.",
  },
);
try { console.log(validateNvidiaAnalysis(raw)); } catch(e) { console.log(e.message); console.log(raw); process.exitCode=1; }
