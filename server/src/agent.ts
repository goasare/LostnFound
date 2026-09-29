import { mockModel, type Msg } from "./mock.js";
import { buildSystemPrompt } from "./prompt.js";
import { cleanSearchArgs, runTool, TOOL_DEFS } from "./tools.js";

const MAX_ROUNDS = 8;
export function getSystemPrompt(now: Date = new Date()) {
  return buildSystemPrompt(now);
}

export interface ToolCallRecord {
  name: string;
  arguments: unknown;
  result: unknown;
}

async function callOpenRouter(messages: Msg[]): Promise<Msg> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key || key === "your-key-here") {
    throw new Error("MOCK_MODE is false but OPENROUTER_API_KEY is empty. Add the key to .env or set MOCK_MODE=true.");
  }
  const model = process.env.OPENROUTER_MODEL;
  if (!model) throw new Error("OPENROUTER_MODEL is not set in .env.");
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({ model, messages, tools: TOOL_DEFS }),
  });
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${(await res.text()).slice(0, 500)}`);
  const data: any = await res.json();
  const msg = data.choices?.[0]?.message;
  if (!msg) throw new Error("OpenRouter returned no message.");
  return { role: "assistant", content: msg.content ?? null, tool_calls: msg.tool_calls?.length ? msg.tool_calls : undefined };
}

/** history: prior conversation (no system message). Returns the new messages for this turn. */
export async function runTurn(history: Msg[]) {
  const mock = process.env.MOCK_MODE !== "false";
  const working: Msg[] = [{ role: "system", content: getSystemPrompt() }, ...history];
  const newMessages: Msg[] = [];
  const toolCalls: ToolCallRecord[] = [];

  for (let round = 0; round < MAX_ROUNDS; round++) {
    const reply = mock ? mockModel(working) : await callOpenRouter(working);
    working.push(reply);
    newMessages.push(reply);
    if (!reply.tool_calls?.length) {
      return { reply: reply.content ?? "", toolCalls, newMessages };
    }
    for (const tc of reply.tool_calls) {
      let args: unknown = {};
      try { args = JSON.parse(tc.function.arguments || "{}"); } catch { args = {}; }
      // The page shows what was actually searched: empty optional args are dropped.
      if (tc.function.name === "search_items") args = cleanSearchArgs(args);
      const result = runTool(tc.function.name, args);
      toolCalls.push({ name: tc.function.name, arguments: args, result });
      const toolMsg: Msg = { role: "tool", tool_call_id: tc.id, content: JSON.stringify(result) };
      working.push(toolMsg);
      newMessages.push(toolMsg);
    }
  }
  return { reply: "(Stopped: too many tool rounds.)", toolCalls, newMessages };
}
