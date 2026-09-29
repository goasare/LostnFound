// Scripted stand-in for the model (MOCK_MODE=true). No network, no key.
import { AREA_ENUM, COLORS, ITEM_TYPES } from "./lists.js";

export type Msg = {
  role: "system" | "user" | "assistant" | "tool";
  content: string | null;
  tool_calls?: { id: string; type: "function"; function: { name: string; arguments: string } }[];
  tool_call_id?: string;
};

const SYNONYMS: Record<string, string> = {
  airpods: "earbuds", "ear buds": "earbuds", bag: "backpack", "water bottle": "water_bottle",
  hoodie: "sweater_or_hoodie", sweater: "sweater_or_hoodie", wallet: "purse_or_wallet",
  purse: "purse_or_wallet", macbook: "laptop", "id card": "id_card", "student id": "id_card",
};

function guessType(text: string): string {
  const t = text.toLowerCase();
  for (const it of ITEM_TYPES) if (t.includes(it.replace(/_/g, " ")) || t.includes(it)) if (it !== "other") return it;
  for (const [k, v] of Object.entries(SYNONYMS)) if (t.includes(k)) return v;
  return "other";
}

let n = 0;
const callId = () => `mock_${++n}`;

export function mockModel(messages: Msg[]): Msg {
  let lastUser = -1;
  messages.forEach((m, i) => { if (m.role === "user") lastUser = i; });
  const turn = messages.slice(lastUser + 1);
  const userText = messages[lastUser]?.content ?? "";
  const toolMsgs = turn.filter((m) => m.role === "tool");

  if (toolMsgs.length === 0) {
    const t = userText.toLowerCase();
    const args: Record<string, unknown> = { item_type: guessType(userText) };
    const colors = COLORS.filter((c) => t.includes(c));
    if (colors.length) args.colors = colors;
    const area = AREA_ENUM.find((a) => t.includes(a.split(/[ (/]/)[0].toLowerCase()) && a.split(/[ (/]/)[0].length > 3);
    if (area) args.area = area;
    return {
      role: "assistant",
      content: null,
      tool_calls: [{ id: callId(), type: "function", function: { name: "search_items", arguments: JSON.stringify(args) } }],
    };
  }

  if (toolMsgs.length === 1) {
    const res = JSON.parse(toolMsgs[0].content ?? "{}");
    const top = res.results?.[0];
    if (top) {
      return {
        role: "assistant",
        content: null,
        tool_calls: [{ id: callId(), type: "function", function: { name: "get_item", arguments: JSON.stringify({ id: top.id }) } }],
      };
    }
    return { role: "assistant", content: "I don't see anything that fits yet. Items get added as people find them, so it's worth checking back. (mock model)" };
  }

  return { role: "assistant", content: "This could be a match. Take a look, and you can message the finder to check. (mock model)" };
}
