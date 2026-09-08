export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  error?: {
    message: string;
    code?: number;
  };
}

export const LING_MODEL_ID = "inclusionai/ling-3.0-flash-fin:free";

/**
 * Sends a chat completion request to the OpenRouter API targeting Ling 3.0 Flash Fin model.
 */
export async function queryLingFinance(prompt: string, options?: { systemPrompt?: string }): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("Missing NEXT_PUBLIC_OPENROUTER_API_KEY in environment variables.");
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
      const data: OpenRouterResponse = await response.json();
      const text = data.choices?.[0]?.message?.content;
      if (text) return text;
    } else {
      const errorBody = await response.text();
      let errorDetail = errorBody;
      try {
        const parsed = JSON.parse(errorBody);
        errorDetail = parsed.error?.message || errorBody;
      } catch {}
      console.warn("Direct OpenRouter call failed, trying API route fallback:", errorDetail);
    }
  } catch (directErr) {
    console.warn("Direct OpenRouter call network error, falling back to /api/openrouter:", directErr);
  }

  // Fallback to internal API route
  const fallbackRes = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, systemPrompt: options?.systemPrompt }),
  });

  if (!fallbackRes.ok) {
    const errText = await fallbackRes.text();
    throw new Error(`OpenRouter API error: ${errText}`);
  }

  const fallbackData: OpenRouterResponse = await fallbackRes.json();
  const resText = fallbackData.choices?.[0]?.message?.content;
  if (!resText) {
    throw new Error("Received empty completion from Ling 3.0 Flash Fin.");
  }
  return resText;
}
