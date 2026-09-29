import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// The page only talks to the local server through this proxy. No env vars are exposed to the browser.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, proxy: { "/api": "http://localhost:8787" } },
});
