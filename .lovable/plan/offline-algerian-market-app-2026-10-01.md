# Offline Algerian Market App

## Build
- Replace the placeholder with a mobile-first market tracker in Arabic RTL by default, with English switching and light/dark themes.
- Add Market, Watchlist, Calculator, and Settings views behind a fixed bottom navigation.
- Show about 12 realistic Algerian fruit and vegetable records, DZD pricing, changes, search/filtering, favorites, and 90-day price charts.

## Resilience
- Keep the prices and history endpoints in one configuration module.
- Fetch the remote JSON when available, cache the last successful response locally, and fall back to the cache or bundled mock data.
- Refresh data every five minutes while open, refresh when connectivity returns, and support a pull-down refresh gesture.
- Add an installable service worker and app manifest so the interface and bundled fallback data remain available offline.

## Experience
- Use a calm deep-blue visual system, soft blue surfaces, white cards, deep-navy dark mode, and reserve green/red for price movement.
- Include loading skeletons, offline and stale-data notices, friendly empty states, clear fetch errors, polished transitions, and accessible controls.
- Add route-specific metadata and verify desktop and mobile rendering, navigation, refresh behavior, and the production build signal.

## Technical details
- Implement with the project’s TanStack React stack rather than Flutter, preserving the requested mobile interaction model.
- Persist language, theme, watchlist, and last successful API payload in browser storage; no cloud backend is required.
