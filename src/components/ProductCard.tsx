import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { cn, discountPercent, formatBRL } from "@/lib/utils";
import type { Product } from "@/types/product";

interface Props {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: Props) {
  const off = discountPercent(product.price, product.originalPrice);

  return (
    <article
      className="animate-fade-up group relative flex flex-col overflow-hidden rounded-2xl border border-sand bg-white/60 transition-all duration-300 hover:-translate-y-1 hover:border-copper/40 hover:shadow-xl hover:shadow-forest/5"
      style={{ animationDelay: `${Math.min(index, 7) * 60}ms` }}
    >
      <Link
        to={`/produto/${product.id}`}
        className="relative block aspect-[4/5] overflow-hidden bg-sand"
      >
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {off !== null && (
          <span className="absolute top-3 left-3 rounded-full bg-forest/90 px-2.5 py-1 text-xs font-semibold text-cream backdrop-blur">
            −{off}%
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col gap-1.5 p-5">
        <Link to={`/produto/${product.id}`}>
          <h3 className="font-display text-lg leading-snug font-semibold text-forest transition-colors group-hover:text-copper">
            {product.name}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-stone">{product.tagline}</p>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-xs text-stone line-through">
                {formatBRL(product.originalPrice)}
              </span>
            )}
            <span
              className={cn(
                "text-xl font-semibold",
                off !== null ? "text-copper" : "text-forest",
              )}
            >
              {formatBRL(product.price)}
            </span>
          </div>

          <a
            href={product.affiliateUrl}
            target="_blank"
            rel="sponsored noopener noreferrer"
            aria-label={`Ver oferta de ${product.name}`}
            className="inline-flex items-center gap-1 rounded-full bg-forest px-3.5 py-2 text-xs font-semibold text-cream transition-all group-hover:bg-copper"
          >
            Ver oferta
            <ArrowUpRight className="size-3.5" />
          </a>
        </div>
      </div>
    </article>
  );
}
