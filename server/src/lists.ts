// Reads the fixed lists from contract Section 4 at startup (single source of truth).
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

export const ROOT = resolve(import.meta.dirname, "../..");
export const OTHER_AREA = "Other / not sure";

function readList(md: string, headingKey: string): string[] {
  const lines = md.split("\n");
  const start = lines.findIndex((l) => l.startsWith("### ") && l.includes(headingKey));
  if (start < 0) throw new Error(`Contract heading not found: ${headingKey}`);
  const items: string[] = [];
  for (let i = start + 1; i < lines.length; i++) {
    const l = lines[i];
    if (l.startsWith("#") || l.trim() === "---") break;
    const m = l.match(/^- (.+)$/);
    if (m) items.push(m[1].trim());
  }
  if (items.length === 0) throw new Error(`Empty list for: ${headingKey}`);
  return items;
}

const md = readFileSync(resolve(ROOT, "docs/foundyou-tool-contract.md"), "utf8");

export const ITEM_TYPES = readList(md, "`item_type`");
export const COLORS = readList(md, "`colors`");
export const CAMPUS_LOCATIONS = readList(md, "Campus locations");
// The prompt tells the model to leave `area` empty for "Other / not sure", so it is not a valid enum value.
export const AREA_ENUM = CAMPUS_LOCATIONS.filter((a) => a !== OTHER_AREA);
