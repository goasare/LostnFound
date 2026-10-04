// Single source of truth for the item schema: fixed lists, the extraction schema the
// vision model must fill, and the stored item record.
import { z } from "zod";

export const TAXONOMY = {
  electronics: ["phone", "laptop", "tablet", "earbuds", "headphones", "smartwatch_or_tracker", "charger_or_cable", "power_bank", "calculator", "camera", "storage_or_peripheral", "other_electronics"],
  bags: ["backpack", "tote_bag", "handbag_or_purse", "gym_or_duffel_bag", "pouch_or_pencil_case", "laptop_sleeve"],
  wallets_ids_cards: ["wallet", "card_holder_or_lanyard", "student_id", "gov_id_or_passport", "payment_card", "other_card"],
  keys: ["keys"],
  clothing: ["jacket_or_coat", "sweater_or_hoodie", "hat", "scarf", "gloves", "shoes", "other_clothing"],
  accessories: ["glasses", "sunglasses", "jewelry", "watch", "umbrella", "hair_accessory"],
  drinkware: ["water_bottle", "mug_or_tumbler"],
  books_stationery: ["notebook_or_binder", "book_or_textbook", "folder_or_papers"],
  other: ["sports_equipment", "medication_or_medical", "other"],
} as const;

export type Category = keyof typeof TAXONOMY;
export const ITEM_TYPES = Object.values(TAXONOMY).flat() as [string, ...string[]];
export const CATEGORY_OF: Record<string, Category> = Object.fromEntries(
  Object.entries(TAXONOMY).flatMap(([cat, types]) => types.map((t) => [t, cat as Category])),
);

export const COLORS = ["black", "white", "gray", "brown", "beige", "red", "orange", "yellow", "green", "blue", "purple", "pink", "silver", "gold", "clear"] as const;
export const PATTERNS = ["solid", "striped", "plaid_or_checked", "camo", "floral", "polka_dot", "animal_print", "graphic_or_logo", "colorblock", "other"] as const;
export const MATERIALS = ["fabric", "leather_or_faux", "plastic", "metal", "glass", "rubber_or_silicone", "paper", "wood", "other"] as const;

// What the vision model returns. Field order is deliberate: observations first, conclusions after.
// Strict structured outputs require every key to be present, so "optional" means nullable / empty array.
export const Extraction = z.strictObject({
  observations: z.string().describe("What is visible, written before classifying. Max ~400 characters."),
  item_type: z.enum(ITEM_TYPES).describe("Use an other_* value rather than guess."),
  item_type_other: z.string().nullable().describe("Plain name, only when item_type is an other_* value. Otherwise null."),
  colors: z.array(z.enum(COLORS)).describe("1-3 base colors of the object, dominant first."),
  pattern: z.enum(PATTERNS).nullable().describe("Null unless clearly visible."),
  materials: z.array(z.enum(MATERIALS)).describe("Empty unless obvious."),
  brand_evidence: z.string().nullable().describe("Exact logo, wordmark or label text you can read. Null if none."),
  brand: z.string().nullable().describe("Null unless brand_evidence shows it."),
  model: z.string().nullable().describe("Null unless printed or legible on the item."),
  distinguishing_marks: z.array(z.string()).describe("Stickers, damage, engravings, attached things. Empty unless clearly visible."),
  detected_text: z.array(z.string()).describe("Legible words and names on the item. Never card, ID or phone numbers."),
  caption: z.string().describe("2-4 factual sentences a person would recognise their own item from."),
  search_terms: z.array(z.string()).describe("Up to 8 words people use for this kind of item."),
});
export type Extraction = z.infer<typeof Extraction>;

export type LocationSource = "exif" | "device" | "none";
export type TimeSource = "exif" | "device" | "server";

export interface Item {
  id: string;
  image_url: string;
  found_at: string;
  area: string | null;
  category: Category;
  item_type: string;
  item_type_other: string | null;
  colors: string[];
  color_primary: string | null;
  pattern: string | null;
  materials: string[];
  brand: string | null;
  model: string | null;
  distinguishing_marks: string[];
  detected_text: string[];
  caption: string;
  search_terms: string[];
  system: {
    found_lat: number | null;
    found_lng: number | null;
    location_source: LocationSource;
    time_source: TimeSource;
    observations: string;
    brand_evidence: string | null;
    status: "available" | "resolved";
    created_at: string;
    extraction: { model: string; prompt_version: string; latency_ms: number; cost_usd: number | null };
  };
}
