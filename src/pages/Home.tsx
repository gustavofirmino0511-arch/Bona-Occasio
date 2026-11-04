import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CheckCircle2,
  Scale,
  Sparkles,
  Wand2,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { ProductGrid } from "@/components/ProductGrid";
import { useCompare } from "@/context/CompareContext";
import { analyzeComparison } from "@/lib/comparison";
import { formatBRL } from "@/lib/utils";
import type { CategoryId } from "@/types/product";

export function Home() {
  const navigate = useNavigate();
  const {
    catalogProducts,
    catalogCategories,
    setActiveCategory,
    setPriority,
    isAdminAuthenticated,
  } = useCompare();

  const featured = catalogProducts.slice(0, 6);
  const topCompared = catalogProducts.slice(0, 3);
  const mainAnalysis = analyzeComparison(topCompared, "custo-beneficio");

  const activeCategories = catalogCategories.filter(
    (c) =>
      c.id !== "all" && catalogProducts.some((p) => p.category === c.id),
  );

  const handleOpenCategoryCompare = (category: CategoryId) => {
    setActiveCategory(category);
    navigate("/comparar");
  };

  return (
    <div>
      <Hero />

      {/* Seção 1: Comparativo Rápido em Destaque dos Produtos Reais */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-copper uppercase tracking-wider">
              Comparativo Direto • Ofertas Reais Verificadas
            </p>
            <h2
              className="mt-1 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl"
              style={{ textWrap: "balance" }}
            >
              Qual fone vale mais a pena hoje?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-stone">
              Comparamos lado a lado cancelamento de ruído, qualidade sonora,
              bateria, conectividade e preço real. Escolha o ideal para o seu
              bolso e vá direto para o produto.
            </p>
          </div>

          <Link
            to="/comparar"
            className="group inline-flex items-center gap-2 rounded-xl bg-forest px-5 py-3 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft whitespace-nowrap shrink-0"
          >
            <Scale className="size-4" />
            Abrir comparador completo
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Cards Lado a Lado dos Fones Reais */}
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {topCompared.map((item) => {
            const isBestCB = mainAnalysis?.bestCostBenefit.id === item.id;
            const isBestPerf = mainAnalysis?.bestPerformance.id === item.id;
            const topSpecs = item.specs.slice(0, 3);

            return (
              <div
                key={item.id}
                className="flex flex-col justify-between rounded-3xl border border-sand bg-white p-6 shadow-xs sm:p-7"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-copper">
                      {isBestCB ? (
                        <span className="inline-flex items-center gap-1.5">
                          <Award className="size-4" />
                          Campeão Custo-Benefício & Qualidade
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-forest">
                          <Sparkles className="size-4 text-copper" />
                          {item.highlightTitle}
                        </span>
                      )}
                    </span>
                    <span className="rounded-lg bg-cream px-2.5 py-1 font-mono font-bold text-forest tabular-nums">
                      Nota {item.metrics.costBenefit}/100
                    </span>
                  </div>

                  <div className="mt-4 flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.shortName}
                      className="size-20 shrink-0 rounded-2xl bg-cream/60 object-contain p-2"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <Link
                        to={`/produto/${item.id}`}
                        className="block font-display text-2xl font-semibold text-forest hover:text-copper"
                      >
                        {item.shortName}
                      </Link>
                      <p className="mt-1 text-sm text-stone">
                        Preço:{" "}
                        <strong className="font-mono text-lg font-bold text-forest tabular-nums">
                          {formatBRL(item.price)}
                        </strong>
                      </p>
                    </div>
                  </div>

                  <dl className="mt-5 space-y-3 border-y border-sand py-4 text-sm">
                    {topSpecs.map((spec, idx) => (
                      <div key={spec.key}>
                        <dt className="text-xs font-semibold text-stone uppercase tracking-wider">
                          {spec.label}
                        </dt>
                        <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
                          <span>{spec.value}</span>
                          {idx === 0 && isBestPerf && (
                            <CheckCircle2
                              className="size-4 shrink-0 text-copper"
                              aria-label="Destaque técnico"
                            />
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory(item.category);
                      setPriority("custo-beneficio");
                      navigate("/comparar");
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-sand bg-cream px-4 py-2.5 text-xs font-semibold text-forest transition-colors hover:border-copper hover:text-copper"
                  >
                    <Scale className="size-3.5" />
                    Comparar lado a lado
                  </button>

                  <a
                    href={item.affiliateUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-xl bg-copper px-5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-copper-dark"
                  >
                    Ir para o produto
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Atalhos rápidos */}
        {activeCategories.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-sand bg-sand/40 px-5 py-3.5 text-xs">
            <span className="font-medium text-forest">
              Categorias ativas no comparador:
            </span>
            <div className="flex flex-wrap gap-2">
              {activeCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleOpenCategoryCompare(cat.id)}
                  className="rounded-lg bg-white px-3.5 py-1.5 font-semibold text-forest transition-colors hover:bg-forest hover:text-cream whitespace-nowrap shrink-0"
                >
                  {cat.label}
                </button>
              ))}
              {isAdminAuthenticated && (
                <Link
                  to="/admin"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-copper px-3.5 py-1.5 font-semibold text-cream transition-colors hover:bg-copper-dark whitespace-nowrap shrink-0"
                >
                  <Wand2 className="size-3.5" />
                  Painel Admin
                </Link>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Seção 2: Catálogo de Ofertas Reais */}
      <section className="mx-auto max-w-6xl border-t border-sand px-5 py-16 sm:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-copper uppercase tracking-wider">
              Curadoria Oficial
            </p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
              Produtos Selecionados
            </h2>
            <p className="mt-2 text-sm text-stone">
              Apenas produtos verificados com link direto e análise sincera.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-2 rounded-xl border border-sand bg-white/70 px-4 py-2.5 text-xs font-semibold text-forest transition-colors hover:border-copper hover:text-copper whitespace-nowrap shrink-0"
          >
            Ver catálogo ({catalogProducts.length} produtos)
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
