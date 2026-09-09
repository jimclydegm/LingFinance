export interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system' | 'tool';
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}

export interface ToolDefinition {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface OpenRouterResponse {
  id?: string;
  choices?: Array<{
    message?: {
      role: string;
      content: string | null;
      tool_calls?: ToolCall[];
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
 * Sends a single chat completion request to OpenRouter.
 */
export async function queryLingFinance(prompt: string, options?: { systemPrompt?: string }): Promise<string> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;

  const messages: OpenRouterMessage[] = [];
  if (options?.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  if (apiKey) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
          "X-Title": "Ling 3 Flash Fin Demo",
        },
        body: JSON.stringify({
          model: LING_MODEL_ID,
          messages: messages,
        }),
      });

      if (response.ok) {
        const data: OpenRouterResponse = await response.json();
        const text = data.choices?.[0]?.message?.content;
        if (text) return text;
      }
    } catch (directErr) {
      console.warn("Direct OpenRouter call network error, falling back to /api/openrouter:", directErr);
    }
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

export interface AgentLoopOptions {
  systemPrompt?: string;
  tools: ToolDefinition[];
  maxTurns?: number;
  onToolCallStart?: (call: ToolCall) => void;
  onToolCallComplete?: (call: ToolCall, result: string) => void;
  executeTool: (name: string, args: Record<string, unknown>) => Promise<string>;
}

/**
 * Autonomous multi-turn agent execution loop with real tool dispatch.
 */
export async function executeLingAgentLoop(
  prompt: string,
  options: AgentLoopOptions
): Promise<{ finalContent: string; totalToolCalls: number }> {
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const messages: OpenRouterMessage[] = [];

  if (options.systemPrompt) {
    messages.push({ role: 'system', content: options.systemPrompt });
  }
  messages.push({ role: 'user', content: prompt });

  const maxTurns = options.maxTurns || 6;
  let turn = 0;
  let totalToolCalls = 0;

  while (turn < maxTurns) {
    turn++;

    const payload: Record<string, unknown> = {
      model: LING_MODEL_ID,
      messages: messages,
      tools: options.tools,
    };

    let data: OpenRouterResponse;

    // Prefer direct call if client apiKey is available, otherwise use API route
    if (apiKey) {
      try {
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "http://localhost:3000",
            "X-Title": "Ling 3 Flash Fin Agent",
          },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          data = await res.json();
        } else {
          // Fallback to proxy
          const fallback = await fetch("/api/openrouter", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          data = await fallback.json();
        }
      } catch {
        const fallback = await fetch("/api/openrouter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        data = await fallback.json();
      }
    } else {
      const fallback = await fetch("/api/openrouter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      data = await fallback.json();
    }

    if (data.error) {
      throw new Error(data.error.message || "Error from Ling 3.0 Flash Fin API");
    }

    const choice = data.choices?.[0];
    if (!choice || !choice.message) {
      throw new Error("No response choice returned from Ling 3.0 Flash Fin.");
    }

    const assistantMsg = choice.message;
    const toolCalls = assistantMsg.tool_calls;

    // If the model requested tool calls, execute each tool
    if (toolCalls && toolCalls.length > 0) {
      messages.push({
        role: 'assistant',
        content: assistantMsg.content || null,
        tool_calls: toolCalls,
      });

      for (const call of toolCalls) {
        totalToolCalls++;
        options.onToolCallStart?.(call);

        let parsedArgs: Record<string, unknown> = {};
        try {
          parsedArgs = JSON.parse(call.function.arguments);
        } catch {
          parsedArgs = {};
        }

        const toolResult = await options.executeTool(call.function.name, parsedArgs);
        options.onToolCallComplete?.(call, toolResult);

        messages.push({
          role: 'tool',
          tool_call_id: call.id,
          name: call.function.name,
          content: toolResult,
        });
      }
      // Loop continues with updated message history including tool results
    } else {
      // No more tool calls; model returned final completion
      return {
        finalContent: assistantMsg.content || "Analysis completed.",
        totalToolCalls,
      };
    }
  }

  // If max turns reached, return the latest assistant text
  const lastAssistant = [...messages].reverse().find(m => m.role === 'assistant' && m.content);
  return {
    finalContent: lastAssistant?.content || "Financial analysis execution complete.",
    totalToolCalls,
  };
}
