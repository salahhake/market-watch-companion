<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting published git history.
<!-- LOVABLE:END -->

- Keep remote market endpoints centralized in `src/lib/market-config.ts` so deployment data sources can be swapped without touching UI logic.
- Keep offline fallback datasets deterministic and bundled with the app so first launch works without network access.
- Static Capacitor build: `npm run build:static` uses vite.static.config.ts + static/ entry with hash history -> dist/; keeps SSR build untouched.
