"use client";

import { useEffect, useRef, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import { useFeedStore } from "@/store/feedStore";

interface FeedProduct {
  id: string;
  title: string;
  description: string;
  category: string;
  price: string;
  sampleAvailable: boolean;
  company: { name: string };
}

interface FeedResponse {
  items: FeedProduct[];
  nextCursor: string | null;
}

const categoryOptions = ["", "Пищевые ингредиенты", "Упаковка", "Оборудование", "Напитки"];

export function FeedClient() {
  const { category, setCategory } = useFeedStore();
  const [items, setItems] = useState<FeedProduct[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const loaderRef = useRef<HTMLDivElement | null>(null);

  async function loadProducts(reset = false) {
    if (isLoading) {
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("take", "8");
      if (category) {
        params.set("category", category);
      }
      if (!reset && nextCursor) {
        params.set("cursor", nextCursor);
      }

      const response = await fetch(`/api/products?${params.toString()}`);
      const data = (await response.json()) as FeedResponse;

      if (!response.ok) {
        throw new Error("Не удалось загрузить новинки");
      }

      setItems((previousItems) => (reset ? data.items : [...previousItems, ...data.items]));
      setNextCursor(data.nextCursor);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProducts(true);
  }, [category]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && nextCursor && !isLoading) {
          void loadProducts();
        }
      },
      { threshold: 1 }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [nextCursor, isLoading]);

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-xl bg-white p-4 shadow-sm">
        <label className="text-sm font-medium text-expoBlue">Категория</label>
        <select
          className="rounded border px-3 py-2"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
        >
          {categoryOptions.map((option) => (
            <option key={option || "all"} value={option}>
              {option || "Все категории"}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            title={product.title}
            description={product.description}
            category={product.category}
            price={product.price}
            sampleAvailable={product.sampleAvailable}
            companyName={product.company.name}
          />
        ))}
      </div>
      <div ref={loaderRef} className="h-8 text-center text-sm text-slate-500">
        {isLoading ? "Загрузка..." : nextCursor ? "Прокрутите для загрузки" : "Больше новинок нет"}
      </div>
    </section>
  );
}
