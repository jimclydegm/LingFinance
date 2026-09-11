# Ling finance demo: architecture and evidence

Reviewed September 10, 2026. This document replaces the inaccurate earlier report.

## Audit of the incoming version

Commits inspected: `aaaaa55` (initial demos), `f004525` (narrative/data changes), `8e9988c` (tool loop).

The latest commit implemented genuine model function-call dispatch, but its SEC route never fetched SEC data. It returned handwritten strings from `SEC_FILING_DATABASE`, including a placeholder IRS number, invented filing language, and hardcoded `VERIFIED_AUDITED` results. The displayed gain and bridge were independent of model output. Function calling alone did not make these sources authentic.

The NVIDIA history fabricated market splits and confused total revenue with Data Center revenue. Some latest-quarter values were approximately correct, but the comparison mixed reporting bases. The custom Run Query button ignored edited input. The added Micron RPO preset lacked evidence and has been removed.

Alphabet still contained invented actuals, missing hedging, invalid/circular formula text and a constant 5,280 update counter. Its action changed colors without calculating values. Annual FY2025 revenue is $402,836M, not $402,834M. Search, YouTube and Network are revenue categories within Google Services, not separate reportable segments.

Demo 3 changed the task to Spire Global instead of the client's intended Spire Inc. The revised task restores Spire Inc. (SR), CIK 0001126956, whose Storage and Marketing disposals are classified as discontinued operations in the 2026 disclosures. No target answer is embedded.

The API key was included in client bundles through NEXT_PUBLIC configuration. Client code now calls the server only. Rotate the previously exposed key in OpenRouter; moving it server-side cannot invalidate previous copies.

## Current behavior

### Demo 1

`lib/finance-data.ts` holds manually transcribed numeric snapshots with SEC source links. Chart and model receive the same data in USD millions. The comparison uses NVIDIA Q2 FY27 MD&A's recast Q2 FY26 and Q1 FY27 values. Q1's original near-parity split is not comparable to Q2 without the customer reclassification. Edge reconciles Data Center to total company revenue. The model interprets supplied data; it does not browse or generate the chart. A live browser test caught Ling using total company revenue as the Data Center share denominator despite correct source data. The request now explicitly distinguishes both totals and requires structured numeric fields. A deterministic gate checks every period, Data Center subtotal, share and YoY rate (0.02 percentage-point tolerance); malformed or incorrect output is rejected visibly. Narrative interpretation remains unverified.

Source: https://www.sec.gov/Archives/edgar/data/1045810/000104581026000075/nvda-20260726.htm (MD&A Revenue by Market Platform).

### Demo 2

A small browser revenue workbook has three views: Summary, Q2 Actuals, Projections. Seven rows include hedging. Load/reset restores a 10% illustrative estimate; users can change the assumption. Execute maps seven actuals, recalculates Summary total, seven Q3 scenario values and scenario total (nine dependent values), then requests a model explanation. Model failure does not undo application calculations and is reported separately. No Excel file is created or edited; no 5,000-formula claim remains.

Sources:
- Annual: https://www.sec.gov/Archives/edgar/data/1652044/000165204426000018/R44.htm
- Quarterly: https://www.sec.gov/Archives/edgar/data/1652044/000165204426000066/googexhibit991q22026.htm

### Demo 3

The client orchestrates a bounded agent loop through the server OpenRouter proxy. The initial request requires a tool call. `read_filing` accepts only two allowlisted source IDs for Spire Inc. Tool outputs return to the model as tool messages. The terminal counts requests, completions and failures by call ID. Retrieved evidence appears alongside model output. Model content, never an independent hardcoded number, populates findings. Empty responses, upstream errors and exhausted limits are failures rather than successful analyses.

Two explicitly selected source modes:
- **Snapshot (default):** human-reviewed paraphrases with source URLs and review date. No network retrieval is claimed. These omit the numeric income tables and cannot support historical-profit verification. The model should identify that evidence gap.
- **Live:** server fetches the specified SEC URL with SEC_USER_AGENT, timeout and redirect rejection. Cheerio extracts bounded, labeled HTML text excerpts; it is not an XBRL parser. Failures do not silently fall back. The local network returned SEC HTTP 403 during the audit, so successful live retrieval could not be validated here.

Sources:
- https://www.sec.gov/Archives/edgar/data/1126956/000119312526298586/sr-20260708.htm
- https://www.sec.gov/Archives/edgar/data/1126956/000119312526334335/sr-20260630.htm

To demonstrate a complete historical-profit reconciliation reliably, supply the client's intended fiscal period and the recast income/disposal-group tables or an accessible complete filing. A specific profit target is not evidence. This app does not autonomously search the entire internet, audit numbers, or guarantee model conclusions.

## Configuration

Copy `.env.example` to `.env.local` when setting up a fresh checkout. Set `OPENROUTER_API_KEY` (server-only). For live SEC mode also set `SEC_USER_AGENT` to your organization and real contact email. Do not add NEXT_PUBLIC to secret names. Existing local configuration has been migrated without printing the key.

`npm install`, then `npm run dev`. The model remains `inclusionai/ling-3.0-flash-fin:free`; no paid-model fallback. Header reports key configuration only, not a verified connection. The app has no authentication as originally requested and should remain an internal/local demo.

## Verification

- `npm test`: independent reported totals; before/after mapping and assumption sensitivity; agent dispatch, tool-message ordering, turn-limit failure and upstream errors.
- `npm run lint`: TypeScript validation (replaces unsupported `next lint`).
- `npm run build`: production compilation.
- With a running server: `npm run verify` tests configuration, snapshot provenance, invalid tools/sources and malformed messages. `node scripts/verify.mjs --live-model` makes one real model request.
- Real model smoke test returned HTTP 200 and LING_OK using the exact free model.

Known dependency finding: npm audit reports transitive PostCSS issues in Next.js 15.5.25. Its suggested automated remediation is a Next.js 16 major upgrade; this audit does not silently perform that migration. Avoid accepting untrusted CSS/build inputs. Financial sources and external provider availability require periodic review.

Browser tests: research emitted two read_filing calls and explicitly reported insufficient numerical evidence; workbook actuals mapped to $119,796M and its model review returned successfully. Production build and API checks passed. The NVIDIA denominator-error regression is covered by a dedicated test.

The NVIDIA structured-response test also exposed completion truncation at 6,000 output tokens (including internal reasoning). The server budget was raised to 16,000 with a 110-second upstream timeout; truncated responses still fail visibly. Provider latency and free-tier limits remain external dependencies.

For the exact recast presentation, the 8-K links to https://www.sec.gov/Archives/edgar/data/1126956/000119312526298586/sr-ex99_1.htm. Its numeric tables are embedded as slide images; the live HTML extractor does not OCR those images. This is another reason not to claim complete historical earnings extraction.

NVIDIA structured output uses a forced `submit_analysis` function schema, supported by the exact free model, instead of relying on prose instructions for JSON layout. The function is an output envelope, not an external research tool. Numeric validation runs on its arguments before rendering. `node scripts/verify-nvidia.mjs` exercises the real model and validation gate against the running server.

Final real-model structured test passed: Data Center totals 41,096 / 75,246 / 89,023; Hyperscale shares 58.81% / 57.21% / 54.72%; ACIE shares 41.19% / 42.79% / 45.28%; YoY growth 101.55% and 138.14%. This validates one observed response, not a guarantee of subsequent generations.

## Follow-up on user sample outputs

The user sample exposed remaining narrative errors: NVIDIA “nearly doubled” despite +116.62%; Alphabet invented six reportable segments, a double-count warning for valid non-overlapping rows, ignored Other Bets' negative variance, inferred structural decline and compared QoQ scenarios against YoY growth. Updated prompts explicitly constrain these interpretations. Application-generated reference notes show Data Center growth, correct accounting structure and all negative variance rows for the active assumption independently of generated commentary. Demo 3 navigation now says Financial Evidence Review. These changes reduce ambiguity; they do not guarantee all future narrative output. CLIENT_RESPONSE.md contains an unsent client-facing explanation.
