// Single place that registers the service worker. Never registers in dev, previews, iframes,
// native shells (Capacitor) or file:// desktop shells (Electron/Tauri).
const SW_PATH = "sw.js";

function blocked(): boolean {
  if (!import.meta.env.PROD) return true;
  if (window.self !== window.top) return true;
  const { hostname, protocol, search } = window.location;
  if (protocol !== "https:" && hostname !== "localhost") return true;
  if (new URLSearchParams(search).get("sw") === "off") return true;
  if (/^(id-preview--|preview--)/.test(hostname)) return true;
  if (/(^|\.)(lovableproject\.com|lovableproject-dev\.com|beta\.lovable\.dev)$/.test(hostname)) return true;
  const w = window as unknown as { Capacitor?: { isNativePlatform?: () => boolean }; __TAURI__?: unknown; electron?: unknown };
  if (w.Capacitor?.isNativePlatform?.() || w.__TAURI__ || w.electron) return true;
  return false;
}

export async function setupServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  if (blocked()) {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()));
    return;
  }
  try { await navigator.serviceWorker.register(SW_PATH, { scope: "./" }); } catch { /* offline install optional */ }
}
