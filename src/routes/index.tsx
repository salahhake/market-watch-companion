import { createFileRoute } from "@tanstack/react-router";
import { MarketApp } from "@/components/MarketApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "سوقي — أسعار الخضر والفواكه في الجزائر" },
      { name: "description", content: "تابع أسعار الخضر والفواكه يومياً في الأسواق الجزائرية، مع وضع دون اتصال وحاسبة مشتريات." },
      { property: "og:title", content: "سوقي — أسعار السوق الجزائرية" },
      { property: "og:description", content: "أسعار يومية للخضر والفواكه، متاحة حتى دون اتصال." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MarketApp,
});
