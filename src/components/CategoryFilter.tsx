import { cn } from "@/lib/utils";
import { categories } from "@/data/products";
import type { CategoryId } from "@/types/product";

interface Props {
  active: CategoryId | "all";
  onChange: (id: CategoryId | "all") => void;
}

export function CategoryFilter({ active, onChange }: Props) {
  return (
    <div
      id="categorias"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {categories.map((c) => {
        const isActive = active === c.id;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => onChange(c.id)}
            aria-pressed={isActive}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-medium transition-all",
              isActive
                ? "border-forest bg-forest text-cream"
                : "border-sand bg-cream/70 text-stone hover:border-copper hover:text-copper",
            )}
          >
            {c.label}
          </button>
        );
      })}
    </div>
  );
}
