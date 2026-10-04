// Deterministic checks on the model output. The model never gets the last word on these.
import { CATEGORY_OF, type Category, type Extraction } from "../schema.js";

// Runs of 6+ digits (spaces/dashes allowed between) look like card, ID or phone numbers.
const LONG_NUMBER = /\d(?:[\s-]?\d){5,}/g;
const scrub = (s: string) => s.replace(LONG_NUMBER, "[number removed]");
const clean = (xs: string[], max: number) => [...new Set(xs.map((x) => scrub(x).trim()).filter(Boolean))].slice(0, max);

export function postprocess(x: Extraction): Extraction & { category: Category; color_primary: string | null } {
  const hasEvidence = !!x.brand_evidence?.trim();
  const colors = [...new Set(x.colors)].slice(0, 3);
  return {
    ...x,
    observations: scrub(x.observations).slice(0, 600),
    item_type_other: x.item_type.startsWith("other") ? x.item_type_other?.trim() || null : null,
    colors,
    materials: [...new Set(x.materials)],
    brand_evidence: hasEvidence ? scrub(x.brand_evidence!) : null,
    brand: hasEvidence ? x.brand?.trim() || null : null,
    model: hasEvidence ? x.model?.trim() || null : null,
    distinguishing_marks: clean(x.distinguishing_marks, 10),
    detected_text: clean(x.detected_text, 10),
    caption: scrub(x.caption),
    search_terms: clean(x.search_terms, 8),
    category: CATEGORY_OF[x.item_type],
    color_primary: colors[0] ?? null,
  };
}
