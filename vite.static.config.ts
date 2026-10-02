// Static client-only SPA build for Capacitor (outputs to dist/). The live preview uses vite.config.ts.
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { pwaPlugin } from "./pwa.config";

const r = (p: string) => fileURLToPath(new URL(p, import.meta.url));

export default defineConfig({
  root: r("./static"),
  base: "./",
  publicDir: r("./public"),
  plugins: [react(), tailwindcss(), pwaPlugin()],
  resolve: { alias: { "@": r("./src") } },
  build: { outDir: r("./dist"), emptyOutDir: true },
});
