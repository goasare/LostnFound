import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { CAMPUS_LOCATIONS, ROOT } from "./lists.js";

function basePrompt(): string {
  const raw = readFileSync(resolve(ROOT, "prompts/foundyou-system-prompt.md"), "utf8");
  const lines = raw.split("\n");
  const cut = lines.findIndex((l) => l.trim() === "---");
  const body = (cut >= 0 ? lines.slice(cut + 1) : lines).join("\n");
  return body
    .replace(/\[TOOL NAMES UNCONFIRMED\]\s*/g, "")
    .replace(/\{\{CAMPUS_LOCATIONS\}\}/g, CAMPUS_LOCATIONS.join("; "))
    .trim();
}

/** Optional YYYY-MM-DD from TODAY_OVERRIDE. Unset or empty means off. Throws if set but invalid. */
export function readTodayOverride(raw: string | undefined = process.env.TODAY_OVERRIDE): string | null {
  const v = raw?.trim();
  if (!v) return null;
  const m = v.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const d = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : null;
  if (!m || !d || d.toISOString().slice(0, 10) !== v) {
    throw new Error(`TODAY_OVERRIDE="${v}" is not a valid date. Use YYYY-MM-DD (for example 2026-09-29), or leave it blank.`);
  }
  return v;
}

/** "Today is Tuesday, 2026-09-29 (Eastern time)." Uses the override date if given, else `now` in America/New_York. */
export function dateLine(now: Date, override: string | null = readTodayOverride()): string {
  if (override) {
    const weekday = new Date(`${override}T00:00:00Z`).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
    return `Today is ${weekday}, ${override} (Eastern time).`;
  }
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York", weekday: "long", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)!.value;
  return `Today is ${get("weekday")}, ${get("year")}-${get("month")}-${get("day")} (Eastern time).`;
}

/** Built per request so the date is never stale. */
export function buildSystemPrompt(now: Date, override: string | null = readTodayOverride()): string {
  return `${basePrompt()}\n\n${dateLine(now, override)}`;
}
