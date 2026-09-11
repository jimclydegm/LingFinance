// Manually transcribed source snapshots, reviewed 2026-09-10. USD millions.
export const NVIDIA_SOURCE =
  "https://www.sec.gov/Archives/edgar/data/1045810/000104581026000075/nvda-20260726.htm";
export const NVIDIA_DATA = [
  {
    period: "FY26 Q2 (recast)",
    hyperscale: 24168,
    acie: 16928,
    edge: 5647,
    total: 46743,
  },
  {
    period: "FY27 Q1 (recast)",
    hyperscale: 43050,
    acie: 32196,
    edge: 6369,
    total: 81615,
  },
  {
    period: "FY27 Q2",
    hyperscale: 48710,
    acie: 40313,
    edge: 7198,
    total: 96221,
  },
];
export const ALPHABET_ANNUAL_SOURCE =
  "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/R44.htm";
export const ALPHABET_Q2_SOURCE =
  "https://www.sec.gov/Archives/edgar/data/1652044/000165204426000066/googexhibit991q22026.htm";
export const ALPHABET_DATA = [
  {
    label: "Google Search & other",
    fy24: 198084,
    fy25: 224532,
    q225: 54190,
    q226: 63271,
  },
  { label: "YouTube ads", fy24: 36147, fy25: 40367, q225: 9796, q226: 11055 },
  { label: "Google Network", fy24: 30359, fy25: 29792, q225: 7354, q226: 7303 },
  {
    label: "Subscriptions, platforms & devices",
    fy24: 40340,
    fy25: 48030,
    q225: 11203,
    q226: 12911,
  },
  { label: "Google Cloud", fy24: 43229, fy25: 58705, q225: 13624, q226: 24768 },
  { label: "Other Bets", fy24: 1648, fy25: 1537, q225: 373, q226: 382 },
  {
    label: "Hedging gains (losses)",
    fy24: 211,
    fy25: -127,
    q225: -112,
    q226: 106,
  },
];
export const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
export const money = (value: number) =>
  value.toLocaleString("en-US", { maximumFractionDigits: 2 });
export function calculateWorkbook(growth: number, mapped: boolean) {
  if (!Number.isFinite(growth) || growth < -100 || growth > 100)
    throw new Error("Growth must be between -100% and 100%.");
  return ALPHABET_DATA.map((row) => {
    const estimate = Math.round(row.q225 * (1 + growth / 100));
    const current = mapped ? row.q226 : estimate;
    return {
      ...row,
      estimate,
      current,
      variance: row.q226 - estimate,
      projection: Math.round(current * (1 + growth / 100)),
    };
  });
}

export function validateNvidiaAnalysis(raw: string): string {
  let value;
  try {
    value = JSON.parse(
      raw
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/, ""),
    );
  } catch {
    throw new Error(
      "Validation failed: Ling did not return the requested structured result. No analysis accepted.",
    );
  }
  const near = (actual: unknown, expected: number, label: string) => {
    if (
      typeof actual !== "number" ||
      !Number.isFinite(actual) ||
      Math.abs(actual - expected) > 0.02
    )
      throw new Error(
        `Validation failed: ${label}; expected ${expected.toFixed(2)}, received ${String(actual)}. No analysis accepted.`,
      );
  };
  if (
    !value ||
    !Array.isArray(value.metrics) ||
    value.metrics.length !== NVIDIA_DATA.length ||
    typeof value.analysis !== "string" ||
    !value.analysis.trim()
  )
    throw new Error("Validation failed: missing metrics or analysis.");
  NVIDIA_DATA.forEach((row, i) => {
    const metric = value.metrics[i];
    if (!metric || metric.period !== row.period)
      throw new Error("Validation failed: period mismatch.");
    const dc = row.hyperscale + row.acie;
    near(metric.dataCenter, dc, `${row.period} Data Center`);
    near(
      metric.hyperscaleShare,
      (100 * row.hyperscale) / dc,
      `${row.period} Hyperscale share (%)`,
    );
    near(
      metric.acieShare,
      (100 * row.acie) / dc,
      `${row.period} ACIE share (%)`,
    );
  });
  near(
    value.hyperscaleYoy,
    100 * (NVIDIA_DATA[2].hyperscale / NVIDIA_DATA[0].hyperscale - 1),
    "Hyperscale YoY (%)",
  );
  near(
    value.acieYoy,
    100 * (NVIDIA_DATA[2].acie / NVIDIA_DATA[0].acie - 1),
    "ACIE YoY (%)",
  );
  return `### Checked model calculations\n\n| Period | Data Center ($M) | Hyperscale share | ACIE share |\n|---|---|---|---|\n${value.metrics.map((m: { period: string; dataCenter: number; hyperscaleShare: number; acieShare: number }) => `| ${m.period} | ${m.dataCenter} | ${m.hyperscaleShare}% | ${m.acieShare}% |`).join("\n")}\n\nHyperscale YoY: ${value.hyperscaleYoy}%. ACIE YoY: ${value.acieYoy}%.\n\n### Model interpretation (not independently verified)\n\n${value.analysis}`;
}

export const NVIDIA_ANALYSIS_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["metrics", "hyperscaleYoy", "acieYoy", "analysis"],
  properties: {
    metrics: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["period", "dataCenter", "hyperscaleShare", "acieShare"],
        properties: {
          period: { type: "string" },
          dataCenter: { type: "number" },
          hyperscaleShare: { type: "number" },
          acieShare: { type: "number" },
        },
      },
    },
    hyperscaleYoy: { type: "number" },
    acieYoy: { type: "number" },
    analysis: { type: "string" },
  },
};
