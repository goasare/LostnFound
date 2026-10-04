// MVP storage: one JSON file + an images folder. Keep all persistence behind this module
// so swapping to SQLite/Postgres later touches nothing else.
import { mkdir, readFile, writeFile, rename } from "node:fs/promises";
import { resolve } from "node:path";
import { config } from "./config.js";
import type { Item } from "./schema.js";

const ITEMS_FILE = resolve(config.dataDir, "items.json");
export const IMAGES_DIR = resolve(config.dataDir, "images");

let items: Item[] | null = null;
let writing = Promise.resolve();

async function load(): Promise<Item[]> {
  if (items) return items;
  await mkdir(IMAGES_DIR, { recursive: true });
  try { items = JSON.parse(await readFile(ITEMS_FILE, "utf8")); } catch { items = []; }
  return items!;
}

async function persist() {
  const tmp = ITEMS_FILE + ".tmp";
  await writeFile(tmp, JSON.stringify(items, null, 2));
  await rename(tmp, ITEMS_FILE);
}

export async function nextId(): Promise<string> {
  const all = await load();
  const max = all.reduce((m, it) => Math.max(m, Number(it.id.split("_")[1]) || 0), 0);
  return `item_${String(max + 1).padStart(4, "0")}`;
}

export async function saveImage(id: string, jpeg: Buffer): Promise<string> {
  await load();
  await writeFile(resolve(IMAGES_DIR, `${id}.jpg`), jpeg);
  return `/images/${id}.jpg`;
}

export async function saveItem(item: Item): Promise<void> {
  const all = await load();
  all.push(item);
  writing = writing.then(persist);
  await writing;
}

export async function listItems(): Promise<Item[]> {
  return [...(await load())].reverse();
}

export async function getItem(id: string): Promise<Item | undefined> {
  return (await load()).find((it) => it.id === id);
}
