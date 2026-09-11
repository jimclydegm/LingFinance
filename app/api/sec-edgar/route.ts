import { NextRequest, NextResponse } from "next/server";
import { load } from "cheerio";
import { RESEARCH_SOURCES } from "@/data/research-sources";

export async function POST(req: NextRequest) {
  try {
    const { tool, arguments: args, mode } = await req.json();
    if (
      tool !== "read_filing" ||
      !args ||
      typeof args.sourceId !== "string" ||
      !["snapshot", "live"].includes(mode)
    ) {
      return NextResponse.json(
        {
          error:
            "Expected read_filing, sourceId and explicit snapshot/live mode.",
        },
        { status: 400 },
      );
    }
    const source = RESEARCH_SOURCES.find((s) => s.id === args.sourceId);
    if (!source)
      return NextResponse.json(
        {
          error:
            "Unknown source. Only Spire Inc. CIK 0001126956 filings are supported.",
        },
        { status: 400 },
      );
    if (mode === "snapshot")
      return NextResponse.json({
        ...source,
        mode,
        retrievedAt: null,
        reviewedAt: "2026-09-10",
        text: source.summary,
        truncated: false,
      });
    const userAgent = process.env.SEC_USER_AGENT;
    if (!userAgent)
      return NextResponse.json(
        {
          error:
            "Set SEC_USER_AGENT to your organization and contact email for live SEC retrieval. Snapshot mode is available separately.",
        },
        { status: 503 },
      );
    const response = await fetch(source.url, {
      headers: { "User-Agent": userAgent, Accept: "text/html" },
      signal: AbortSignal.timeout(25000),
      cache: "no-store",
      redirect: "error",
    });
    if (!response.ok)
      return NextResponse.json(
        {
          error: `SEC HTTP ${response.status}. No filing retrieved. Select snapshot mode explicitly if needed.`,
        },
        { status: 502 },
      );
    const html = await response.text();
    if (html.length > 12000000) throw new Error("Filing exceeds size limit.");
    const $ = load(html);
    $("script,style,ix\\:header,ix\\:hidden").remove();
    $("td,th").append(" | ");
    $("tr,p,div").append("\n");
    const text = $("body")
      .text()
      .replace(/[\t\r ]+/g, " ")
      .replace(/\n\s*\n/g, "\n")
      .trim();
    if (!/Spire/i.test(text) || !/discontinued/i.test(text))
      throw new Error("Response did not contain expected filing content.");
    // Return bounded excerpts with offsets. Never claim to parse XBRL or audit accounting.
    const ranges: { start: number; end: number }[] = [
      { start: 0, end: Math.min(6000, text.length) },
    ];
    const pattern =
      /discontinued operations|income from continuing|net income|Spire Storage/gi;
    let match;
    while ((match = pattern.exec(text)) && ranges.length < 20) {
      const start = Math.max(0, match.index - 700),
        end = Math.min(text.length, match.index + 2000);
      const last = ranges[ranges.length - 1];
      if (start <= last.end) last.end = Math.max(last.end, end);
      else ranges.push({ start, end });
    }
    const excerpts = ranges.map((r) => ({
      ...r,
      text: text.slice(r.start, r.end),
    }));
    return NextResponse.json({
      id: source.id,
      title: source.title,
      cik: source.cik,
      url: source.url,
      mode,
      retrievedAt: new Date().toISOString(),
      truncated: true,
      text: excerpts
        .map((e) => `[Characters ${e.start}-${e.end}]\n${e.text}`)
        .join("\n\n"),
      notice:
        "Selected HTML text excerpts, not full filing or XBRL extraction. Check column headers and consolidated entity before using numbers.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Source retrieval failed",
      },
      { status: 502 },
    );
  }
}
