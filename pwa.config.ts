// Shared PWA (service worker) settings for both the web build and the static desktop/mobile build.
import { VitePWA } from "vite-plugin-pwa";

export function pwaPlugin() {
  return VitePWA({
    strategies: "generateSW",
    registerType: "autoUpdate",
    injectRegister: null, // registration lives only in src/lib/pwa.ts
    manifest: false, // public/manifest.json is the single manifest
    filename: "sw.js",
    devOptions: { enabled: false },
    workbox: {
      globPatterns: ["**/*.{js,css,png,ico,svg,woff2,json}"],
      navigateFallback: null,
      cleanupOutdatedCaches: true,
      runtimeCaching: [
        {
          urlPattern: ({ request }) => request.mode === "navigate",
          handler: "NetworkFirst",
          options: { cacheName: "souqi-pages", networkTimeoutSeconds: 4 },
        },
        {
          urlPattern: ({ url, sameOrigin }) => sameOrigin && url.pathname.includes("/assets/"),
          handler: "CacheFirst",
          options: { cacheName: "souqi-assets", expiration: { maxEntries: 80 } },
        },
        {
          urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
          handler: "StaleWhileRevalidate",
          options: { cacheName: "souqi-fonts" },
        },
      ],
    },
  });
}
