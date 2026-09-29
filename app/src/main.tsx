import { createRoot } from "react-dom/client";
import { App } from "./App";
import { ErrorBoundary } from "./ErrorBoundary";

// Red banner for errors React does not catch (event handlers, async code).
function showBanner(message: string) {
  let banner = document.getElementById("error-banner");
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "error-banner";
    banner.style.cssText = "position:fixed;top:0;left:0;right:0;background:crimson;color:white;padding:8px;font-family:sans-serif;z-index:9999";
    document.body.appendChild(banner);
  }
  banner.textContent = `Error: ${message}`;
}
window.addEventListener("error", (e) => showBanner(e.message));
window.addEventListener("unhandledrejection", (e) =>
  showBanner(e.reason instanceof Error ? e.reason.message : String(e.reason)),
);

createRoot(document.getElementById("root")!).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
