import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import { products } from "@/data/products";
import { discountPercent, formatBRL } from "@/lib/utils";

export function ProductDetail() {
  const { id } = useParams();
  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-forest">Produto não encontrado</h1>
        <Link to="/catalogo" className="mt-6 inline-block text-copper hover:underline">
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const off = discountPercent(product.price, product.originalPrice);

  return (
    <section className="mx-auto max-w-5xl px-5 py-16 sm:px-8">
      <Link
        to="/catalogo"
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-stone transition-colors hover:text-forest"
      >
        <ArrowLeft className="size-4" />
        Voltar para o catálogo
      </Link>

      <div className="grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="aspect-[4/5] overflow-hidden rounded-2xl border border-sand bg-sand">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <h1 className="font-display text-4xl font-semibold tracking-tight text-forest">
            {product.name}
          </h1>
          <p className="mt-4 text-lg text-stone">{product.tagline}</p>

          <div className="mt-8 flex items-end gap-3">
            <span className="text-3xl font-semibold text-forest">
              {formatBRL(product.price)}
            </span>
            {product.originalPrice && (
              <span className="mb-1 text-lg text-stone line-through">
                {formatBRL(product.originalPrice)}
              </span>
            )}
            {off !== null && (
              <span className="mb-1.5 rounded-full bg-copper/10 px-3 py-1 text-sm font-semibold text-copper">
                −{off}% OFF
              </span>
            )}
          </div>

          <div className="mt-8 flex flex-col gap-3">
            <a
              href={product.affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-forest px-8 py-4 text-base font-semibold text-cream transition-all hover:bg-forest-soft hover:shadow-lg hover:shadow-forest/20"
            >
              Ir para a loja oficial
              <ArrowUpRight className="size-5" />
            </a>
            <p className="mt-2 flex items-center justify-center gap-2 text-xs text-stone">
              <ShieldCheck className="size-4" />
              Compra segura. Você será redirecionado para o site do parceiro.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
