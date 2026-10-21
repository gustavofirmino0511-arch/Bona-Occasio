import { useMemo, useState } from "react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { products } from "@/data/products";
import type { CategoryId } from "@/types/product";

export function Catalog() {
  const [active, setActive] = useState<CategoryId | "all">("all");

  const filtered = useMemo(
    () =>
      active === "all"
        ? products
        : products.filter((p) => p.category === active),
    [active],
  );

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      <div className="mb-10 text-center">
        <h1 className="font-display text-4xl font-semibold tracking-tight text-forest sm:text-5xl">
          Catálogo
        </h1>
        <p className="mt-3 text-sm text-stone">
          Explore nossa seleção por categoria.
        </p>
      </div>

      <div className="mb-10">
        <CategoryFilter active={active} onChange={setActive} />
      </div>

      <ProductGrid products={filtered} />
    </section>
  );
}
