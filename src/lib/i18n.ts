export type Language = "ar" | "en";

export const DEFAULT_LANGUAGE: Language = "ar";

export const translations = {
  ar: {
    app: "سوقي",
    subtitle: "أسعار السوق اليوم",
    market: "السوق",
    watchlist: "المفضلة",
    calculator: "الحاسبة",
    settings: "الإعدادات",
    search: "ابحث عن منتج أو سوق",
    all: "الكل",
    vegetables: "خضروات",
    fruits: "فواكه",
    perUnit: "لكل {unit}",
    updated: "آخر تحديث",
    refreshing: "جاري تحديث الأسعار…",
    live: "بيانات مباشرة",
    offline: "غير متصل — نعرض آخر البيانات المحفوظة",
    mock: "بيانات تجريبية — المصدر غير متاح",
    empty: "لا توجد نتائج",
    emptySub: "جرّب البحث بكلمة أخرى أو غيّر التصنيف.",
    watchEmpty: "قائمة المفضلة فارغة",
    watchSub: "اضغط على القلب بجانب أي منتج لمتابعته هنا.",
    calcTitle: "حاسبة المشتريات",
    product: "المنتج",
    quantity: "الكمية ({unit})",
    total: "المجموع التقديري",
    language: "اللغة",
    switchLanguage: "التبديل إلى الإنجليزية",
    theme: "المظهر",
    arabic: "العربية",
    english: "English",
    light: "فاتح",
    dark: "داكن",
    data: "البيانات",
    auto: "تتجدد تلقائياً كل 60 ثانية",
    pull: "اسحب للأسفل للتحديث",
    retry: "إعادة المحاولة",
    source: "مصدر الأسعار",
    liveSource: "GitHub — بيانات مباشرة",
    history: "تاريخ السعر — 90 يوماً",
    today: "اليوم",
    shortcuts: "اختصارات لوحة المفاتيح",
    scNav: "التنقل بين الأقسام",
    scSearch: "البحث",
    scRefresh: "تحديث الأسعار",
    scTheme: "تبديل المظهر",
    scLang: "تبديل اللغة",
    scEsc: "إلغاء التركيز",
    itemCount: "{count} منتج",
    favoriteAdd: "إضافة {product} إلى المفضلة",
    favoriteRemove: "إزالة {product} من المفضلة",
    units: { kg: "كجم", piece: "حبة" },
    categories: { vegetable: "خضروات", fruit: "فواكه" },
    products: {
      potato: "بطاطا", tomato: "طماطم", onion: "بصل", carrot: "جزر",
      zucchini: "كوسة", pepper: "فلفل", orange: "برتقال", apple: "تفاح",
      banana: "موز", date: "تمر", dates: "تمر", lemon: "ليمون", strawberry: "فراولة",
    },
    markets: {
      boufarik: "بوفاريك", boumerdès: "بومرداس", boumerdes: "بومرداس",
      "el harrach": "الحراش", blida: "البليدة", algiers: "الجزائر",
      médéa: "المدية", medea: "المدية", biskra: "بسكرة", tipaza: "تيبازة",
    },
  },
  en: {
    app: "Souqi",
    subtitle: "Today’s market prices",
    market: "Market",
    watchlist: "Watchlist",
    calculator: "Calculator",
    settings: "Settings",
    search: "Search products or markets",
    all: "All",
    vegetables: "Vegetables",
    fruits: "Fruits",
    perUnit: "per {unit}",
    updated: "Last updated",
    refreshing: "Refreshing prices…",
    live: "Live data",
    offline: "Offline — showing the latest saved data",
    mock: "Demo data — source unavailable",
    empty: "No results found",
    emptySub: "Try another search or change the category.",
    watchEmpty: "Your watchlist is empty",
    watchSub: "Select the heart beside a product to follow it here.",
    calcTitle: "Shopping calculator",
    product: "Product",
    quantity: "Quantity ({unit})",
    total: "Estimated total",
    language: "Language",
    switchLanguage: "Switch to Arabic",
    theme: "Appearance",
    arabic: "العربية",
    english: "English",
    light: "Light",
    dark: "Dark",
    data: "Data",
    auto: "Refreshes automatically every 60 seconds",
    pull: "Pull down to refresh",
    retry: "Try again",
    source: "Price source",
    liveSource: "GitHub — live data",
    history: "Price history — 90 days",
    today: "Today",
    shortcuts: "Keyboard shortcuts",
    scNav: "Switch sections",
    scSearch: "Search",
    scRefresh: "Refresh prices",
    scTheme: "Toggle theme",
    scLang: "Toggle language",
    scEsc: "Leave field",
    itemCount: "{count} items",
    favoriteAdd: "Add {product} to watchlist",
    favoriteRemove: "Remove {product} from watchlist",
    units: { kg: "kg", piece: "piece" },
    categories: { vegetable: "Vegetables", fruit: "Fruits" },
    products: {
      potato: "Potato", tomato: "Tomato", onion: "Onion", carrot: "Carrot",
      zucchini: "Zucchini", pepper: "Pepper", orange: "Orange", apple: "Apple",
      banana: "Banana", date: "Dates", dates: "Dates", lemon: "Lemon", strawberry: "Strawberry",
    },
    markets: {
      boufarik: "Boufarik", boumerdès: "Boumerdès", boumerdes: "Boumerdès",
      "el harrach": "El Harrach", blida: "Blida", algiers: "Algiers",
      médéa: "Médéa", medea: "Médéa", biskra: "Biskra", tipaza: "Tipaza",
    },
  },
} as const;

export type Translation = (typeof translations)[Language];

export function translateTemplate(template: string, values: Record<string, string | number>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ""));
}

export function productLabel(product: string, language: Language) {
  const key = product.trim().toLowerCase() as keyof Translation["products"];
  return translations[language].products[key] ?? product;
}

export function marketLabel(market: string, language: Language) {
  const key = market.trim().toLowerCase() as keyof Translation["markets"];
  return translations[language].markets[key] ?? market;
}

export function unitLabel(unit: "kg" | "piece", language: Language) {
  return translations[language].units[unit];
}