import assert from "node:assert/strict";
const origin = process.env.DEMO_ORIGIN || "http://localhost:3000";
async function post(path, data) {
  const res = await fetch(origin + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return { status: res.status, data: await res.json() };
}
const status = await fetch(origin + "/api/openrouter").then((r) => r.json());
assert.equal(status.model, "inclusionai/ling-3.0-flash-fin:free");
assert.equal(typeof status.configured, "boolean");
const source = await post("/api/sec-edgar", {
  tool: "read_filing",
  arguments: { sourceId: "sr-recast-2026" },
  mode: "snapshot",
});
assert.equal(source.status, 200);
assert.equal(source.data.cik, "0001126956");
assert.equal(source.data.mode, "snapshot");
assert.equal(source.data.retrievedAt, null);
assert.match(source.data.text, /does not include the numeric/);
assert.equal(
  (
    await post("/api/sec-edgar", {
      tool: "verify_debt_payoff",
      arguments: { cik: "0001816017" },
      mode: "snapshot",
    })
  ).status,
  400,
);
assert.equal(
  (
    await post("/api/sec-edgar", {
      tool: "read_filing",
      arguments: { sourceId: "https://example.com" },
      mode: "live",
    })
  ).status,
  400,
);
assert.equal((await post("/api/openrouter", { messages: [] })).status, 400);
console.log(
  "PASS: configuration, source provenance, unknown tools/sources, request validation.",
);
if (process.argv.includes("--live-model")) {
  const result = await post("/api/openrouter", {
    messages: [{ role: "user", content: "Reply with exactly: LING_OK" }],
  });
  console.log(
    "Live model HTTP",
    result.status,
    JSON.stringify(result.data).slice(0, 1200),
  );
  assert.equal(result.status, 200);
}
