export const LING_MODEL_ID = "inclusionai/ling-3.0-flash-fin:free";
export interface ToolCall {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
}
export interface OpenRouterMessage {
  role: "user" | "assistant" | "system" | "tool";
  content?: string | null;
  tool_calls?: ToolCall[];
  tool_call_id?: string;
  name?: string;
}
export interface ToolDefinition {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}
export interface OpenRouterResponse {
  choices?: { message?: OpenRouterMessage; finish_reason?: string }[];
  error?: { message: string } | string;
}
async function completion(payload: object): Promise<OpenRouterMessage> {
  const res = await fetch("/api/openrouter", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(120000),
  });
  const data: OpenRouterResponse = await res.json();
  if (!res.ok || data.error)
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : data.error?.message || `OpenRouter HTTP ${res.status}`,
    );
  const choice = data.choices?.[0];
  if (choice?.finish_reason === "length")
    throw new Error(
      "Model output exceeded the token limit. No completed analysis was produced.",
    );
  if (!choice?.message)
    throw new Error("OpenRouter returned no assistant message.");
  return choice.message;
}
export async function queryLingFinance(
  prompt: string,
  options?: { systemPrompt?: string; schema?: Record<string, unknown> },
) {
  const message = await completion({
    ...(options?.schema
      ? {
          tools: [
            {
              type: "function",
              function: {
                name: "submit_analysis",
                description:
                  "Submit the requested financial analysis with calculated metrics.",
                parameters: options.schema,
              },
            },
          ],
          tool_choice: {
            type: "function",
            function: { name: "submit_analysis" },
          },
        }
      : {}),
    messages: [
      {
        role: "system",
        content:
          options?.systemPrompt ||
          "Use only supplied evidence. Clearly separate facts, calculations and hypotheses. Do not invent sources.",
      },
      { role: "user", content: prompt },
    ],
  });
  if (options?.schema) {
    const calls = message.tool_calls;
    if (calls?.length !== 1 || calls[0].function.name !== "submit_analysis")
      throw new Error("Model did not submit the required analysis structure.");
    return calls[0].function.arguments;
  }
  if (!message.content?.trim()) throw new Error("Model returned empty output.");
  return message.content;
}
export interface AgentLoopOptions {
  systemPrompt?: string;
  tools: ToolDefinition[];
  maxTurns?: number;
  onToolCallStart?: (call: ToolCall) => void;
  onToolCallComplete?: (call: ToolCall, result: string) => void;
  executeTool: (name: string, args: Record<string, unknown>) => Promise<string>;
}
export async function executeLingAgentLoop(
  prompt: string,
  options: AgentLoopOptions,
) {
  const messages: OpenRouterMessage[] = [
    { role: "system", content: options.systemPrompt || "" },
    { role: "user", content: prompt },
  ];
  let totalToolCalls = 0;
  for (let turn = 0; turn < (options.maxTurns ?? 6); turn++) {
    const message = await completion({
      messages,
      tools: options.tools,
      tool_choice: turn === 0 ? "required" : "auto",
    });
    messages.push(message);
    if (!message.tool_calls?.length) {
      if (!totalToolCalls || !message.content?.trim())
        throw new Error("Research ended without tools or a final response.");
      return { finalContent: message.content, totalToolCalls };
    }
    for (const call of message.tool_calls) {
      if (++totalToolCalls > 12)
        throw new Error("Tool limit reached; research incomplete.");
      options.onToolCallStart?.(call);
      if (!options.tools.some((t) => t.function.name === call.function.name))
        throw new Error("Model requested an unsupported tool.");
      const args = JSON.parse(call.function.arguments);
      if (!args || typeof args !== "object" || Array.isArray(args))
        throw new Error("Invalid tool arguments.");
      const result = await options.executeTool(call.function.name, args);
      options.onToolCallComplete?.(call, result);
      messages.push({ role: "tool", tool_call_id: call.id, content: result });
    }
  }
  throw new Error(
    "Turn limit reached; research incomplete. No verified result.",
  );
}
