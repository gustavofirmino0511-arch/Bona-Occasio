import { useCompare } from "@/context/CompareContext";
import { cn } from "@/lib/utils";
import type { CategoryId } from "@/types/product";

interface Props {
  active: CategoryId | "all";
  onChange: (id: CategoryId | "all") => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  const { catalogCategories, catalogProducts } = useCompare();

  const visibleCategories = catalogCategories.filter(
    (c) =>
      c.id === "all" || catalogProducts.some((p) => p.category === c.id),
  );

  return (
    <div
      id="categorias"
      role="group"
      aria-label="Filtrar por categoria"
      className="flex flex-wrap items-center gap-2"
    >
      {visibleCategories.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={cn(
              "rounded-lg border px-4 py-2 text-xs font-semibold transition-all whitespace-nowrap shrink-0",
              isActive
                ? "border-forest bg-forest text-cream"
                : "border-sand bg-white/70 text-stone hover:border-copper hover:text-forest",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
