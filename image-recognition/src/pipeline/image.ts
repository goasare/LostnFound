import sharp from "sharp";

/** Upright, ≤1536px on the long side, JPEG. sharp drops all metadata (EXIF, GPS) by default. */
export async function normalizePhoto(photo: Buffer): Promise<Buffer> {
  return sharp(photo)
    .rotate()
    .resize({ width: 1536, height: 1536, fit: "inside", withoutEnlargement: true })
    .jpeg({ quality: 85 })
    .toBuffer();
}
