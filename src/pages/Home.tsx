import { Link } from "react-router-dom";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { products } from "@/data/products";
import { ArrowRight } from "lucide-react";

export function Home() {
  const featured = products.filter((p) => p.featured).slice(0, 3);

  return (
    <div>
      <Hero />
      
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
              Destaques da semana
            </h2>
            <p className="mt-2 text-sm text-stone">
              As oportunidades que mais chamaram nossa atenção.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-2 rounded-full border border-sand bg-cream/60 px-5 py-2.5 text-sm font-medium text-forest transition-colors hover:border-copper hover:text-copper"
          >
            Ver catálogo completo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
