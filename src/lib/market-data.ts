export type Category = "vegetable" | "fruit";

export interface PriceItem {
  product: string;
  category: Category;
  price: number;
  unit: "kg" | "piece";
  market: string;
  currency: "DZD";
  date: string;
  change: number;
}

export interface PricesResponse {
  generated_at: string;
  prices: Record<string, PriceItem>;
}

export interface HistoryPoint { date: string; price: number }
export type HistoryResponse = Record<string, HistoryPoint[]>;

const items: Array<[string, Category, number, string, number]> = [
  ["potato", "vegetable", 85, "Boufarik", 5],
  ["tomato", "vegetable", 120, "Boumerdès", -8],
  ["onion", "vegetable", 75, "El Harrach", 0],
  ["carrot", "vegetable", 95, "Boufarik", 3],
  ["zucchini", "vegetable", 110, "Blida", -5],
  ["pepper", "vegetable", 145, "El Harrach", 7],
  ["orange", "fruit", 160, "Boufarik", -4],
  ["apple", "fruit", 280, "Médéa", 10],
  ["banana", "fruit", 420, "Algiers", 12],
  ["date", "fruit", 650, "Biskra", 0],
  ["lemon", "fruit", 190, "Blida", -6],
  ["strawberry", "fruit", 360, "Tipaza", 15],
];

const today = new Date("2026-10-01T05:00:00Z");
const toDate = (d: Date) => d.toISOString().slice(0, 10);

export const mockPrices: PricesResponse = {
  generated_at: today.toISOString(),
  prices: Object.fromEntries(items.map(([product, category, price, market, change]) => [
    `${product}@${market}`,
    { product, category, price, unit: "kg", market, currency: "DZD", date: toDate(today), change },
  ])),
};

export const mockHistory: HistoryResponse = Object.fromEntries(
  items.map(([product, , price, market], itemIndex) => {
    const points = Array.from({ length: 90 }, (_, index) => {
      const date = new Date(today);
      date.setUTCDate(date.getUTCDate() - (89 - index));
      const wave = Math.sin((index + itemIndex * 2) / 7) * price * 0.045;
      const trend = (index - 89) * price * 0.0007;
      return { date: toDate(date), price: Math.max(10, Math.round(price + wave + trend)) };
    });
    points[points.length - 1] = { date: toDate(today), price };
    return [`${product}@${market}`, points];
  }),
);

export function validPrices(value: unknown): value is PricesResponse {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<PricesResponse>;
  return typeof candidate.generated_at === "string" && !!candidate.prices && typeof candidate.prices === "object";
}

export function validHistory(value: unknown): value is HistoryResponse {
  return !!value && typeof value === "object" && Object.values(value).every(Array.isArray);
}
