// Where and when the item was found. First source that has it wins:
//   time:     EXIF DateTimeOriginal → device clock at upload → server clock
//   location: EXIF GPS → device location at upload → none
import exifr from "exifr";
import { config } from "../config.js";
import type { LocationSource, TimeSource } from "../schema.js";

export interface DeviceHints { lat?: number; lng?: number; time?: string }

export interface FoundMeta {
  found_at: string;
  time_source: TimeSource;
  lat: number | null;
  lng: number | null;
  location_source: LocationSource;
}

/** UTC offset like "-04:00" for a wall-clock time in the given zone. */
function zoneOffset(wallIso: string, timeZone: string): string {
  const asUtc = new Date(wallIso + "Z");
  const name = new Intl.DateTimeFormat("en-US", { timeZone, timeZoneName: "longOffset" })
    .formatToParts(asUtc).find((p) => p.type === "timeZoneName")?.value ?? "GMT";
  const m = name.match(/GMT([+-]\d{2}):?(\d{2})?/);
  return m ? `${m[1]}:${m[2] ?? "00"}` : "+00:00";
}

/** EXIF "2026:09:27 14:30:00" (+ optional "-04:00") → ISO 8601 with offset. */
function exifTimeToIso(raw: unknown, offset: unknown): string | null {
  if (typeof raw !== "string") return null;
  const m = raw.match(/^(\d{4}):(\d{2}):(\d{2})[ T](\d{2}):(\d{2}):(\d{2})/);
  if (!m) return null;
  const wall = `${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${m[6]}`;
  const off = typeof offset === "string" && /^[+-]\d{2}:\d{2}$/.test(offset) ? offset : zoneOffset(wall, config.timeZone);
  return Number.isNaN(Date.parse(wall + off)) ? null : wall + off;
}

const validCoord = (lat?: number, lng?: number) =>
  typeof lat === "number" && typeof lng === "number" && Number.isFinite(lat) && Number.isFinite(lng)
  && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 && !(lat === 0 && lng === 0);

export async function readFoundMeta(photo: Buffer, device: DeviceHints): Promise<FoundMeta> {
  let exif: Record<string, unknown> = {};
  try {
    exif = (await exifr.parse(photo, { gps: true, reviveValues: false, pick: ["DateTimeOriginal", "OffsetTimeOriginal", "GPSLatitude", "GPSLongitude", "GPSLatitudeRef", "GPSLongitudeRef"] })) ?? {};
  } catch { /* no or unreadable EXIF */ }

  let found_at = exifTimeToIso(exif.DateTimeOriginal, exif.OffsetTimeOriginal);
  let time_source: TimeSource = "exif";
  if (!found_at && device.time && !Number.isNaN(Date.parse(device.time))) { found_at = device.time; time_source = "device"; }
  if (!found_at) { found_at = new Date().toISOString(); time_source = "server"; }

  const exLat = exif.latitude as number | undefined, exLng = exif.longitude as number | undefined;
  if (validCoord(exLat, exLng)) return { found_at, time_source, lat: exLat!, lng: exLng!, location_source: "exif" };
  if (validCoord(device.lat, device.lng)) return { found_at, time_source, lat: device.lat!, lng: device.lng!, location_source: "device" };
  return { found_at, time_source, lat: null, lng: null, location_source: "none" };
}
