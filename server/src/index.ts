import { createServer } from "node:http";
import { resolve } from "node:path";
import { ROOT } from "./lists.js";

try { process.loadEnvFile(resolve(ROOT, ".env")); } catch { /* no .env: defaults to mock mode */ }

const { runTurn } = await import("./agent.js");
const { readTodayOverride } = await import("./prompt.js");
const PORT = Number(process.env.SERVER_PORT ?? 8787);

try { readTodayOverride(); } catch (e) { console.warn(`WARNING: ${(e as Error).message} Chat requests will fail until it is fixed.`); }

createServer(async (req, res) => {
  const send = (code: number, body: unknown) => {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(body));
  };
  if (req.method === "GET" && req.url === "/api/health") {
    return send(200, {
      ok: true,
      mock: process.env.MOCK_MODE !== "false",
      today_override: process.env.TODAY_OVERRIDE?.trim() || null,
    });
  }
  if (req.method === "POST" && req.url === "/api/chat") {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    try {
      const { messages } = JSON.parse(raw);
      if (!Array.isArray(messages)) return send(400, { error: "messages must be an array" });
      return send(200, await runTurn(messages));
    } catch (e) {
      return send(500, { error: e instanceof Error ? e.message : "Server error" });
    }
  }
  send(404, { error: "not found" });
}).listen(PORT, () => {
  console.log(`Server on http://localhost:${PORT} (MOCK_MODE=${process.env.MOCK_MODE !== "false"})`);
});
