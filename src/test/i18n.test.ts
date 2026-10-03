import { describe, expect, it } from "vitest";

import { marketLabel, productLabel, translateTemplate, translations, unitLabel } from "@/lib/i18n";

describe("English and Arabic translations", () => {
  it("translates product and category names", () => {
    expect(productLabel("potato", "ar")).toBe("بطاطا");
    expect(productLabel("potato", "en")).toBe("Potato");
    expect(translations.ar.categories.vegetable).toBe("خضروات");
    expect(translations.en.categories.vegetable).toBe("Vegetables");
  });

  it("translates units and markets", () => {
    expect(unitLabel("kg", "ar")).toBe("كجم");
    expect(unitLabel("kg", "en")).toBe("kg");
    expect(marketLabel("Boufarik", "ar")).toBe("بوفاريك");
    expect(marketLabel("Boufarik", "en")).toBe("Boufarik");
  });

  it("fills translated labels with dynamic values", () => {
    expect(translateTemplate(translations.ar.quantity, { unit: "كجم" })).toBe("الكمية (كجم)");
    expect(translateTemplate(translations.en.itemCount, { count: 12 })).toBe("12 items");
  });
});