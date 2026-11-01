import { Link } from "react-router-dom";
import { ArrowUpRight, Check, Scale } from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { cn, discountPercent, formatBRL } from "@/lib/utils";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const off = discountPercent(product.price, product.originalPrice);
  const { toggleTrayProduct, isProductInTray } = useCompare();
  const inTray = isProductInTray(product.id);

  const primarySpecs = product.specs.slice(0, 2);

  return (
    <article
      className="animate-fade-up group relative flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/80 transition-transform duration-200 hover:-translate-y-0.5 hover:border-copper/50"
      style={{ animationDelay: `${Math.min(index, 7) * 50}ms` }}
    >
      <Link
        to={`/produto/${product.id}`}
        className="relative block aspect-[5/4] overflow-hidden bg-sand"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-103"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* Metadados limpos sem referência a comparativo externo de lojas */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-stone">
          <span className="font-medium text-forest">{product.brand}</span>
          <span aria-hidden="true">·</span>
          <span className="truncate">{product.highlightTitle}</span>
          <span aria-hidden="true">·</span>
          <span className="font-mono font-medium text-copper tabular-nums">
            CB {product.metrics.costBenefit}/100
          </span>
        </div>

        <Link to={`/produto/${product.id}`} className="mt-1.5 block">
          <h3 className="font-display text-lg leading-snug font-semibold text-forest transition-colors group-hover:text-copper">
            {product.name}
          </h3>
        </Link>

        <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-stone">
          {product.tagline}
        </p>

        {/* Resumo técnico rápido */}
        <div className="mt-4 space-y-1.5 border-y border-sand/80 py-3 text-xs">
          {primarySpecs.map((spec) => (
            <div
              key={spec.key}
              className="flex items-baseline justify-between gap-2"
            >
              <span className="text-stone shrink-0">{spec.label}:</span>
              <span className="truncate font-medium text-ink text-right">
                {spec.value.split("(")[0].trim()}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-auto pt-4">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-xl font-bold text-forest tabular-nums">
                {formatBRL(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-xs text-stone line-through tabular-nums">
                  {formatBRL(product.originalPrice)}
                </span>
              )}
            </div>
            {off !== null && (
              <span className="font-mono text-xs font-semibold text-copper tabular-nums">
                −{off}% OFF
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => toggleTrayProduct(product)}
              aria-pressed={inTray}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0",
                inTray
                  ? "border-copper bg-copper text-cream"
                  : "border-sand bg-cream text-forest hover:border-copper hover:text-copper",
              )}
            >
              {inTray ? (
                <>
                  <Check className="size-3.5" />
                  Comparando
                </>
              ) : (
                <>
                  <Scale className="size-3.5" />
                  Comparar
                </>
              )}
            </button>

            <Link
              to={`/produto/${product.id}`}
              className="inline-flex items-center justify-center gap-1 rounded-lg bg-forest px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft whitespace-nowrap shrink-0"
            >
              Ver produto
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
