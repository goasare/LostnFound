import { serve } from "@hono/node-server";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { relative } from "node:path";
import { config } from "./config.js";
import { ingestPhoto } from "./pipeline/ingest.js";
import { getItem, IMAGES_DIR, listItems } from "./store.js";

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024;
const num = (v: unknown) => (typeof v === "string" && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : undefined);

const app = new Hono();

app.get("/api/health", (c) => c.json({ ok: true, model: config.visionModel, key_set: !!config.openrouterKey }));

app.post("/api/items", async (c) => {
  const body = await c.req.parseBody();
  const photo = body.photo;
  if (!(photo instanceof File)) return c.json({ error: "Send the image as multipart field 'photo'." }, 400);
  if (photo.size > MAX_UPLOAD_BYTES) return c.json({ error: "Photo is over 15 MB." }, 413);
  try {
    const item = await ingestPhoto(Buffer.from(await photo.arrayBuffer()), {
      lat: num(body.device_lat), lng: num(body.device_lng),
      time: typeof body.device_time === "string" ? body.device_time : undefined,
    });
    return c.json(item, 201);
  } catch (e) {
    console.error(e);
    return c.json({ error: e instanceof Error ? e.message : "Ingest failed" }, 502);
  }
});

app.get("/api/items", async (c) => c.json(await listItems()));
app.get("/api/items/:id", async (c) => {
  const item = await getItem(c.req.param("id"));
  return item ? c.json(item) : c.json({ error: "not found" }, 404);
});

app.use("/images/*", serveStatic({ root: relative(process.cwd(), IMAGES_DIR), rewriteRequestPath: (p) => p.replace(/^\/images/, "") }));
app.use("/*", serveStatic({ root: relative(process.cwd(), config.publicDir) }));

serve({ fetch: app.fetch, port: config.port }, () => {
  console.log(`FoundYou image recognition on http://localhost:${config.port} (vision: ${config.visionModel}, key ${config.openrouterKey ? "set" : "MISSING"})`);
});
