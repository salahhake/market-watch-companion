export const MARKET_ENDPOINTS = {
  prices: "https://raw.githubusercontent.com/salahhake/veggie-prices/main/data/prices.json",
  history: "https://raw.githubusercontent.com/salahhake/veggie-prices/main/data/history.json",
} as const;

export const REFRESH_INTERVAL_MS = 60 * 1000;
export const CACHE_KEYS = {
  prices: "souq-prices-v1",
  history: "souq-history-v1",
  watchlist: "souq-watchlist-v1",
  language: "souq-language-v1",
  theme: "souq-theme-v1",
} as const;
