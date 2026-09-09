import { NextRequest, NextResponse } from "next/server";
import { LING_MODEL_ID } from "@/lib/openrouter";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, systemPrompt, messages: incomingMessages, tools, tool_choice } = body;

    const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenRouter API Key not configured in environment." },
        { status: 500 }
      );
    }

    let messages = incomingMessages;
    if (!messages) {
      if (!prompt) {
        return NextResponse.json({ error: "Prompt or messages array is required" }, { status: 400 });
      }
      messages = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });
    }

    const payload: Record<string, unknown> = {
      model: LING_MODEL_ID,
      messages,
    };

    if (tools && Array.isArray(tools) && tools.length > 0) {
      payload.tools = tools;
      if (tool_choice) {
        payload.tool_choice = tool_choice;
      }
    }

    const openRouterResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": req.headers.get("origin") || "http://localhost:3000",
        "X-Title": "Ling 3 Flash Fin Demo",
      },
      body: JSON.stringify(payload),
    });

    if (!openRouterResponse.ok) {
      const errorText = await openRouterResponse.text();
      return NextResponse.json(
        { error: `OpenRouter returned status ${openRouterResponse.status}: ${errorText}` },
        { status: openRouterResponse.status }
      );
    }

    const data = await openRouterResponse.json();
    return NextResponse.json(data);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
