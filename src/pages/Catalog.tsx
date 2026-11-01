import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scale, Wand2 } from "lucide-react";
import { CategoryFilter } from "@/components/CategoryFilter";
import { ProductGrid } from "@/components/ProductGrid";
import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/product";

type SortMode = "cost-benefit" | "performance" | "price-asc";

export function Catalog() {
  const [activeCategory, setActiveCategoryFilter] = useState<
    CategoryId | "all"
  >("all");
  const [sortBy, setSortBy] = useState<SortMode>("cost-benefit");

  const navigate = useNavigate();
  const { catalogProducts, setActiveCategory } = useCompare();

  const filtered = useMemo(() => {
    const base = catalogProducts.filter((p) => {
      if (activeCategory !== "all" && p.category !== activeCategory) {
        return false;
      }
      return true;
    });

    return [...base].sort((a, b) => {
      if (sortBy === "cost-benefit") {
        return b.metrics.costBenefit - a.metrics.costBenefit;
      }
      if (sortBy === "performance") {
        return b.metrics.performance - a.metrics.performance;
      }
      return a.price - b.price;
    });
  }, [catalogProducts, activeCategory, sortBy]);

  const handleCompareCurrentCategory = () => {
    if (activeCategory !== "all") {
      setActiveCategory(activeCategory);
    }
    navigate("/comparar");
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold text-copper">
            Catálogo Completo · {catalogProducts.length} Produtos Analisados
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-forest sm:text-5xl">
            Catálogo de Ofertas
          </h1>
          <p className="mt-2 max-w-xl text-sm text-stone">
            Explore nossa seleção por categoria, compare os modelos lado a lado
            dentro do site ou adicione novos produtos com ajuda da IA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-end">
          <Link
            to="/estudio-ia"
            className="inline-flex items-center gap-2 rounded-lg border border-copper/40 bg-white/80 px-4 py-2.5 text-xs font-semibold text-forest transition-colors hover:border-copper hover:text-copper whitespace-nowrap shrink-0"
          >
            <Wand2 className="size-4 text-copper" />
            Subir produto com IA
          </Link>

          <button
            type="button"
            onClick={handleCompareCurrentCategory}
            className="inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft whitespace-nowrap shrink-0"
          >
            <Scale className="size-4" />
            {activeCategory === "all"
              ? "Abrir comparador de produtos"
              : "Comparar esta categoria"}
          </button>
        </div>
      </div>

      {/* Barra de Filtros: Categoria e Ordenação */}
      <div className="mt-8 flex flex-col justify-between gap-4 border-y border-sand py-6 lg:flex-row lg:items-center">
        <CategoryFilter
          active={activeCategory}
          onChange={setActiveCategoryFilter}
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-stone">Ordenar por:</span>
          {(
            [
              { id: "cost-benefit", label: "Melhor Custo-Benefício" },
              { id: "performance", label: "Maior Desempenho" },
              { id: "price-asc", label: "Menor Preço" },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSortBy(opt.id)}
              aria-pressed={sortBy === opt.id}
              className={cn(
                "rounded-md px-2.5 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                sortBy === opt.id
                  ? "bg-forest text-cream font-semibold"
                  : "bg-sand/60 text-stone hover:text-forest",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <ProductGrid products={filtered} />
      </div>
    </section>
  );
}
