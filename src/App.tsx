import { useMemo, useState } from "react";
import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { Footer } from "@/components/Footer";
import { products } from "@/data/products";
import type { CategoryId } from "@/types/product";

export default function App() {
  const [active, setActive] = useState<CategoryId | "all">("all");

  const filtered = useMemo(
    () =>
      active === "all"
        ? products
        : products.filter((p) => p.category === active),
    [active],
  );

  return (
    <div className="min-h-dvh">
      <Header />
      <main>
        <Hero />

        <section id="ofertas" className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
              Ofertas selecionadas
            </h2>
            <p className="mt-2 text-sm text-stone">
              {filtered.length} {filtered.length === 1 ? "produto" : "produtos"}
            </p>
          </div>

          <div className="mb-10">
            <CategoryFilter active={active} onChange={setActive} />
          </div>

          <ProductGrid products={filtered} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
