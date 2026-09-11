import { test } from "node:test";
import assert from "node:assert/strict";
import ts from "typescript";
import { readFile } from "node:fs/promises";
async function moduleAt(path) {
  const code = ts.transpileModule(await readFile(path, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  return import(
    `data:text/javascript;base64,${Buffer.from(code).toString("base64")}`
  );
}
const { NVIDIA_DATA, ALPHABET_DATA, sum, calculateWorkbook, validateNvidiaAnalysis } = await moduleAt(
  "lib/finance-data.ts",
);
const { executeLingAgentLoop } = await moduleAt("lib/openrouter.ts");
test("Source totals reconcile including edge and hedging", () => {
  for (const r of NVIDIA_DATA)
    assert.equal(r.hyperscale + r.acie + r.edge, r.total);
  for (const [key, total] of Object.entries({
    fy24: 350018,
    fy25: 402836,
    q225: 96428,
    q226: 119796,
  }))
    assert.equal(sum(ALPHABET_DATA.map((r) => r[key])), total);
});
test("Mapping changes estimates, updates dependencies and preserves historicals", () => {
  const before = calculateWorkbook(10, false),
    after = calculateWorkbook(10, true);
  assert.notEqual(before[0].current, after[0].current);
  assert.equal(after[0].current, 63271);
  assert.equal(after[0].projection, 69598);
  assert.equal(after[0].fy25, before[0].fy25);
  assert.equal(sum(after.map((r) => r.current)), 119796);
  assert.notEqual(
    calculateWorkbook(20, true)[0].projection,
    after[0].projection,
  );
  assert.throws(() => calculateWorkbook(NaN, true));
});
const tools = [
  { type: "function", function: { name: "read_filing", parameters: {} } },
];
test("Agent executes tool results before final response; limits never report success", async () => {
  const original = global.fetch;
  let calls = 0;
  let executed = 0;
  try {
    global.fetch = async (_url, opts) => {
      const p = JSON.parse(opts.body);
      calls++;
      if (calls === 2) assert.equal(p.messages.at(-1).role, "tool");
      return Response.json({
        choices: [
          {
            message:
              calls === 1
                ? {
                    role: "assistant",
                    content: null,
                    tool_calls: [
                      {
                        id: "1",
                        type: "function",
                        function: {
                          name: "read_filing",
                          arguments: '{"sourceId":"sr-recast-2026"}',
                        },
                      },
                    ],
                  }
                : {
                    role: "assistant",
                    content: "Insufficient numerical evidence.",
                  },
          },
        ],
      });
    };
    const result = await executeLingAgentLoop("research", {
      tools,
      executeTool: async () => {
        executed++;
        return "source";
      },
    });
    assert.equal(executed, 1);
    assert.equal(result.totalToolCalls, 1);
    calls = 0;
    await assert.rejects(
      executeLingAgentLoop("research", {
        tools,
        maxTurns: 1,
        executeTool: async () => "source",
      }),
      /Turn limit/,
    );
    global.fetch = async () =>
      Response.json({ error: "No key" }, { status: 500 });
    await assert.rejects(
      executeLingAgentLoop("research", { tools, executeTool: async () => "" }),
      /No key/,
    );
  } finally {
    global.fetch = original;
  }
});

test("NVIDIA gate rejects company-revenue denominators and accepts correct calculations", () => {
  const result = {
    metrics: NVIDIA_DATA.map((r) => ({
      period: r.period,
      dataCenter: r.hyperscale + r.acie,
      hyperscaleShare: (100 * r.hyperscale) / (r.hyperscale + r.acie),
      acieShare: (100 * r.acie) / (r.hyperscale + r.acie),
    })),
    hyperscaleYoy: 100 * (48710 / 24168 - 1),
    acieYoy: 100 * (40313 / 16928 - 1),
    analysis: "Qualitative interpretation.",
  };
  assert.match(
    validateNvidiaAnalysis(JSON.stringify(result)),
    /Checked model calculations/,
  );
  result.metrics[0].hyperscaleShare = (100 * 24168) / 46743;
  assert.throws(
    () => validateNvidiaAnalysis(JSON.stringify(result)),
    /Validation failed/,
  );
});
