import { Link, useLocation } from "react-router-dom";
import { ArrowRight, Scale, X } from "lucide-react";
import { useCompare } from "@/context/CompareContext";

export function CompareTray() {
  const { catalogProducts, trayProductIds, toggleTrayProduct, clearTray } =
    useCompare();
  const location = useLocation();

  if (trayProductIds.length === 0 || location.pathname === "/comparar") {
    return null;
  }

  const trayProducts = trayProductIds
    .map((id) => catalogProducts.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  if (trayProducts.length === 0) return null;

  return (
    <aside
      aria-label="Bandeja de comparação de produtos"
      className="fixed inset-x-0 bottom-4 z-40 mx-auto max-w-3xl px-4"
    >
      <div className="flex items-center justify-between gap-4 rounded-xl border border-forest/20 bg-forest px-4 py-3 text-cream shadow-lg">
        <div className="flex min-w-0 items-center gap-3">
          <Scale className="size-4 shrink-0 text-copper-soft" />
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-cream/90">
              {trayProducts.length === 1
                ? `${trayProducts[0].shortName} selecionado (adicione mais 1 ou clique para comparar com a categoria)`
                : `Comparando: ${trayProducts.map((p) => p.shortName).join(" vs ")}`}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <div className="hidden items-center gap-1.5 sm:flex">
            {trayProducts.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => toggleTrayProduct(item)}
                aria-label={`Remover ${item.shortName} da comparação`}
                className="inline-flex items-center gap-1 rounded-md bg-forest-soft px-2 py-1 text-xs text-cream/90 transition-colors hover:bg-copper hover:text-cream whitespace-nowrap shrink-0"
              >
                <span>{item.shortName}</span>
                <X className="size-3" />
              </button>
            ))}
          </div>

          <Link
            to="/comparar"
            className="inline-flex items-center gap-1.5 rounded-lg bg-copper px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-copper-soft whitespace-nowrap shrink-0"
          >
            Comparar lado a lado
            <ArrowRight className="size-3.5" />
          </Link>

          <button
            type="button"
            onClick={clearTray}
            aria-label="Limpar seleção de comparação"
            className="rounded-lg p-1.5 text-cream/70 transition-colors hover:bg-forest-soft hover:text-cream"
          >
            <X className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
