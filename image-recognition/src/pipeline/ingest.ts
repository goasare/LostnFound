// Photo in → stored item out. The finder supplies only the photo (plus whatever the browser
// can tell us about where and when it was uploaded).
import { saveImage, saveItem, nextId } from "../store.js";
import type { Item } from "../schema.js";
import { areaFor } from "./areas.js";
import { normalizePhoto } from "./image.js";
import { readFoundMeta, type DeviceHints } from "./metadata.js";
import { postprocess } from "./postprocess.js";
import { extract, PROMPT_VERSION } from "./vision.js";

export async function ingestPhoto(photo: Buffer, device: DeviceHints): Promise<Item> {
  const meta = await readFoundMeta(photo, device); // read EXIF before normalizing strips it
  const jpeg = await normalizePhoto(photo);
  const vision = await extract(jpeg);
  const x = postprocess(vision.extraction);
  const id = await nextId();

  const item: Item = {
    id,
    image_url: await saveImage(id, jpeg),
    found_at: meta.found_at,
    area: meta.lat != null && meta.lng != null ? areaFor(meta.lat, meta.lng).area : null,
    category: x.category,
    item_type: x.item_type,
    item_type_other: x.item_type_other,
    colors: x.colors,
    color_primary: x.color_primary,
    pattern: x.pattern,
    materials: x.materials,
    brand: x.brand,
    model: x.model,
    distinguishing_marks: x.distinguishing_marks,
    detected_text: x.detected_text,
    caption: x.caption,
    search_terms: x.search_terms,
    system: {
      found_lat: meta.lat,
      found_lng: meta.lng,
      location_source: meta.location_source,
      time_source: meta.time_source,
      observations: x.observations,
      brand_evidence: x.brand_evidence,
      status: "available",
      created_at: new Date().toISOString(),
      extraction: { model: vision.model, prompt_version: PROMPT_VERSION, latency_ms: vision.latency_ms, cost_usd: vision.cost_usd },
    },
  };
  await saveItem(item);
  return item;
}
