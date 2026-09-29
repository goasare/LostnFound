// Run: npm run selfcheck (from server/). No network, no key.
import { getSystemPrompt } from "./agent.js";
import { cleanSearchArgs } from "./tools.js";
import { OTHER_AREA } from "./lists.js";
import { get_item, search_items, TOOL_DEFS } from "./tools.js";

let failed = 0;
const check = (name: string, ok: boolean, extra = "") => {
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${extra ? "  " + extra : ""}`);
};

const s: any = search_items({
  item_type: "earbuds", colors: ["white"], brand: "Apple",
  area: "Woodruff Library", lost_after: "2026-09-26T00:00:00Z",
});
const ids = s.results.map((r: any) => r.id);
console.log("earbuds search ids:", ids.join(", "));
check("item_0001 ranks first", ids[0] === "item_0001");
check("item_0006 (resolved) absent", !ids.includes("item_0006"));
check("item_0007 (found 2026-09-20) absent", !ids.includes("item_0007"));
check("item_0008 (MacBook) absent", !ids.includes("item_0008"));

const wide: any = search_items({ item_type: "earbuds", lost_after: "2026-09-01T00:00:00Z" });
check("wide earbuds search excludes resolved item_0006", !wide.results.some((r: any) => r.id === "item_0006"));
check("max 5 results", search_items({ item_type: "backpack" }) && (search_items({ item_type: "backpack" }) as any).results.length === 5);

const all = JSON.stringify([s, wide, get_item({ id: "item_0001" }), get_item({ id: "item_0006" }), get_item({ id: "nope" })]);
check("no finder_id / detected_text / status in tool output", !/finder_id|detected_text|status/.test(all));
check("get_item unknown id -> not found", (get_item({ id: "nope" }) as any).error === "not found");
check("get_item resolved id -> not found", (get_item({ id: "item_0006" }) as any).error === "not found");
check("get_item returns image_url", !!(get_item({ id: "item_0001" }) as any).item.image_url);

const areaEnum: string[] = (TOOL_DEFS[0] as any).function.parameters.properties.area.enum;
check("area enum lacks 'Other / not sure'", !areaEnum.includes(OTHER_AREA));
const prompt = getSystemPrompt(new Date("2026-09-29T16:00:00Z"));
check("prompt includes 'Other / not sure'", prompt.includes(OTHER_AREA));
check("prompt has no placeholder/marker", !prompt.includes("{{") && !prompt.includes("TOOL NAMES UNCONFIRMED"));
check("prompt starts at Role section", prompt.startsWith("## Role"));

// Empty optional args behave as if absent.
const base = { item_type: "earbuds", colors: ["white"], area: "Woodruff Library" };
const cleanedNoisy = search_items({ item_type: "earbuds", brand: "", keywords: "  ", area: "", colors: [] });
const plain = search_items({ item_type: "earbuds" });
check("empty brand/keywords/colors/area == args omitted", JSON.stringify(cleanedNoisy) === JSON.stringify(plain));
const withEmptyColor = search_items({ ...base, colors: ["white", ""], lost_after: "", lost_before: " " });
check("empty color string and empty dates ignored", JSON.stringify(withEmptyColor) === JSON.stringify(search_items(base)));
console.log("cleaned example:", JSON.stringify(cleanSearchArgs({ item_type: "earbuds", colors: [], brand: "", keywords: " ", area: "", lost_after: "2026-09-26T00:00:00Z", lost_before: "" })));

// Date line, built per call (not at startup).
const sun = getSystemPrompt(new Date("2026-09-27T16:00:00Z"));
const tue = getSystemPrompt(new Date("2026-09-29T16:00:00Z"));
const lateNight = getSystemPrompt(new Date("2026-09-30T02:00:00Z")); // still 09-29 in Eastern
check("Sunday line", sun.endsWith("Today is Sunday, 2026-09-27 (Eastern time)."));
check("Tuesday line", tue.endsWith("Today is Tuesday, 2026-09-29 (Eastern time)."));
check("uses Eastern date, not UTC", lateNight.endsWith("Today is Tuesday, 2026-09-29 (Eastern time)."));
check("date line changes per call (not baked in)", sun !== tue);
console.log("final line now:", getSystemPrompt().trim().split("\n").pop());

// TODAY_OVERRIDE (read from the environment per call).
const realNow = new Date("2026-09-29T16:00:00Z");
const saved = process.env.TODAY_OVERRIDE;
delete process.env.TODAY_OVERRIDE;
check("override unset -> real-date line", getSystemPrompt(realNow).endsWith("Today is Tuesday, 2026-09-29 (Eastern time)."));
process.env.TODAY_OVERRIDE = "";
check("override empty -> real-date line", getSystemPrompt(realNow).endsWith("Today is Tuesday, 2026-09-29 (Eastern time)."));
process.env.TODAY_OVERRIDE = "2026-09-27";
check("override 2026-09-27 -> Sunday line", getSystemPrompt(realNow).endsWith("Today is Sunday, 2026-09-27 (Eastern time)."));
process.env.TODAY_OVERRIDE = "2026-09-28";
check("override re-read per call", getSystemPrompt(realNow).endsWith("Today is Monday, 2026-09-28 (Eastern time)."));
for (const bad of ["2026-13-45", "2026-02-30", "09/29/2026", "tomorrow"]) {
  process.env.TODAY_OVERRIDE = bad;
  let msg = "";
  try { getSystemPrompt(realNow); } catch (e) { msg = (e as Error).message; }
  check(`invalid override "${bad}" -> clear error`, msg.includes("TODAY_OVERRIDE") && msg.includes("YYYY-MM-DD"));
  if (bad === "2026-13-45") console.log("error text:", msg);
}
if (saved === undefined) delete process.env.TODAY_OVERRIDE; else process.env.TODAY_OVERRIDE = saved;

process.exit(failed ? 1 : 0);
