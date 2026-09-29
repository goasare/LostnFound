// Mock tools over stubs/foundyou-fake-items.json. Never returns server_only fields.
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { AREA_ENUM, COLORS, ITEM_TYPES, ROOT } from "./lists.js";

// ---- Scoring weights (tune here) -------------------------------------------
export const WEIGHTS = {
  color: 3, // per matching color
  brand: 3, // brand matches (case-insensitive)
  keyword: 2, // per keyword word found as a word in description
};
// -----------------------------------------------------------------------------

const MAX_RESULTS = 5;

interface PublicItem {
  id: string;
  category: string;
  item_type: string;
  colors: string[];
  brand: string | null;
  description: string;
  area: string;
  location_detail: string | null;
  found_at: string;
  image_url: string;
}
interface Record_ {
  public: PublicItem;
  server_only: { finder_id: string; detected_text: string; status: string };
}

const records: Record_[] = JSON.parse(
  readFileSync(resolve(ROOT, "stubs/foundyou-fake-items.json"), "utf8"),
);

const words = (s: string) => s.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);

export interface SearchArgs {
  item_type?: string;
  colors?: string[];
  brand?: string;
  keywords?: string;
  area?: string;
  lost_after?: string;
  lost_before?: string; // accepted, deliberately not used to exclude (item may be found after loss window)
}

/** Treats empty optional values ("", whitespace, []) as not provided. */
export function cleanSearchArgs(raw: any): SearchArgs {
  const a = raw && typeof raw === "object" ? raw : {};
  const str = (v: unknown) => (typeof v === "string" && v.trim() !== "" ? v.trim() : undefined);
  const out: SearchArgs = {};
  const item_type = str(a.item_type);
  if (item_type) out.item_type = item_type;
  const colors = Array.isArray(a.colors) ? (a.colors as unknown[]).map(str).filter((c): c is string => !!c) : [];
  if (colors.length) out.colors = colors;
  for (const k of ["brand", "keywords", "area", "lost_after", "lost_before"] as const) {
    const v = str(a[k]);
    if (v) out[k] = v;
  }
  return out;
}

export function search_items(rawArgs: SearchArgs) {
  const args = cleanSearchArgs(rawArgs);
  if (!args.item_type || !ITEM_TYPES.includes(args.item_type)) {
    return { error: `item_type is required and must be one of the fixed list` };
  }
  const lostAfter = args.lost_after ? Date.parse(args.lost_after) : NaN;
  const wantColors = (args.colors ?? []).map((c: string) => c.toLowerCase());
  const wantBrand = args.brand?.trim().toLowerCase();
  const wantWords = args.keywords ? [...new Set(words(args.keywords))] : [];

  const scored = records
    .filter((r) => r.server_only.status === "available")
    .filter((r) => r.public.item_type === args.item_type)
    .filter((r) => !args.area || r.public.area === args.area)
    .filter((r) => Number.isNaN(lostAfter) || Date.parse(r.public.found_at) >= lostAfter)
    .map((r) => {
      let score = 0;
      for (const c of r.public.colors) if (wantColors.includes(c)) score += WEIGHTS.color;
      if (wantBrand && r.public.brand && r.public.brand.toLowerCase() === wantBrand) score += WEIGHTS.brand;
      const descWords = new Set(words(r.public.description));
      for (const w of wantWords) if (descWords.has(w)) score += WEIGHTS.keyword;
      return { r, score };
    })
    .sort((a, b) => b.score - a.score || Date.parse(b.r.public.found_at) - Date.parse(a.r.public.found_at))
    .slice(0, MAX_RESULTS);

  return {
    results: scored.map(({ r }) => ({
      id: r.public.id,
      item_type: r.public.item_type,
      colors: r.public.colors,
      area: r.public.area,
      date: r.public.found_at.slice(0, 10),
    })),
  };
}

export function get_item(args: { id?: string }) {
  const r = records.find((x) => x.public.id === args?.id && x.server_only.status === "available");
  if (!r) return { error: "not found" };
  return { item: { ...r.public } };
}

export function runTool(name: string, args: any): unknown {
  if (name === "search_items") return search_items(args);
  if (name === "get_item") return get_item(args);
  return { error: `unknown tool: ${name}` };
}

export const TOOL_DEFS = [
  {
    type: "function",
    function: {
      name: "search_items",
      description:
        "Search found items. Returns up to 5 summaries (id, item_type, colors, area, date), best match first.",
      parameters: {
        type: "object",
        properties: {
          item_type: { type: "string", enum: ITEM_TYPES },
          colors: { type: "array", items: { type: "string", enum: COLORS } },
          brand: { type: "string" },
          keywords: { type: "string", description: "Free text" },
          area: { type: "string", enum: AREA_ENUM },
          lost_after: { type: "string", description: "ISO 8601 UTC time window start" },
          lost_before: { type: "string", description: "ISO 8601 UTC time window end" },
        },
        required: ["item_type"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_item",
      description: "Get the full public record (including image_url) for one item id.",
      parameters: {
        type: "object",
        properties: { id: { type: "string" } },
        required: ["id"],
      },
    },
  },
];
