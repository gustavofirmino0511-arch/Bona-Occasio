import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Award,
  CheckCircle2,
  Cpu,
  Scale,
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

  const featured = catalogProducts.filter((p) => p.featured).slice(0, 3);
  const topNotebooks = catalogProducts
    .filter((p) => p.category === "notebooks")
    .slice(0, 3);
  const notebookAnalysis = analyzeComparison(topNotebooks, "custo-beneficio");

  const handleOpenCategoryCompare = (category: CategoryId) => {
    setActiveCategory(category);
    navigate("/comparar");
  };

  return (
    <div>
      <Hero />

      {/* Seção 1: Comparativo Rápido em Destaque (Notebooks: Processador, Placa de Vídeo e Custo-Benefício) */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-copper">
              Comparativo Técnico dentro do Site
            </p>
            <h2
              className="mt-1 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl"
              style={{ textWrap: "balance" }}
            >
              Qual notebook vale mais a pena hoje?
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-stone">
              Comparamos lado a lado processador, placa de vídeo, câmera,
              memória e custo-benefício diretamente no nosso site. Quando
              escolher o seu, basta entrar no produto e acessar o link oficial
              de compra.
            </p>
          </div>

          <Link
            to="/comparar"
            className="group inline-flex items-center gap-2 rounded-lg bg-forest px-4 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft whitespace-nowrap shrink-0"
          >
            <Scale className="size-3.5" />
            Abrir comparador interativo
            <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Cards Lado a Lado do Duelo de Notebooks */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {topNotebooks.map((nb) => {
            const isBestCB = notebookAnalysis?.bestCostBenefit.id === nb.id;
            const isBestPerf = notebookAnalysis?.bestPerformance.id === nb.id;
            const cpu = nb.specs.find((s) => s.key === "processor")?.value ?? "";
            const gpu = nb.specs.find((s) => s.key === "gpu")?.value ?? "";
            const ram = nb.specs.find((s) => s.key === "ram")?.value ?? "";

            return (
              <div
                key={nb.id}
                className="flex flex-col justify-between rounded-2xl border border-sand bg-white/85 p-6"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-copper">
                      {isBestCB ? (
                        <span className="inline-flex items-center gap-1">
                          <Award className="size-3.5" />
                          Campeão Custo-Benefício
                        </span>
                      ) : isBestPerf ? (
                        <span className="inline-flex items-center gap-1 text-forest">
                          <Cpu className="size-3.5 text-copper" />
                          Melhor Placa de Vídeo & CPU
                        </span>
                      ) : (
                        <span>{nb.highlightTitle}</span>
                      )}
                    </span>
                    <span className="font-mono font-semibold text-forest tabular-nums">
                      CB {nb.metrics.costBenefit}/100
                    </span>
                  </div>

                  <Link
                    to={`/produto/${nb.id}`}
                    className="mt-2 block font-display text-xl font-semibold text-forest hover:text-copper"
                  >
                    {nb.name}
                  </Link>

                  <p className="mt-1 text-xs text-stone">
                    Oferta selecionada:{" "}
                    <strong className="font-mono text-forest tabular-nums">
                      {formatBRL(nb.price)}
                    </strong>
                  </p>

                  <dl className="mt-5 space-y-2.5 border-y border-sand py-4 text-xs">
                    <div>
                      <dt className="text-stone">Processador (CPU)</dt>
                      <dd className="mt-0.5 font-medium text-ink">{cpu}</dd>
                    </div>
                    <div>
                      <dt className="text-stone">Placa de Vídeo (GPU)</dt>
                      <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-ink">
                        <span>{gpu}</span>
                        {isBestPerf && (
                          <CheckCircle2
                            className="size-3.5 shrink-0 text-copper"
                            aria-label="Melhor placa de vídeo"
                          />
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-stone">Memória RAM</dt>
                      <dd className="mt-0.5 font-medium text-ink">{ram}</dd>
                    </div>
                  </dl>
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <span className="text-xs text-stone">
                    Ideal:{" "}
                    <strong className="text-ink">
                      {nb.idealFor.split(",")[0]}
                    </strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveCategory("notebooks");
                      setPriority(isBestPerf ? "desempenho" : "custo-beneficio");
                      navigate("/comparar");
                    }}
                    className="text-xs font-semibold text-forest underline decoration-copper/60 underline-offset-4 hover:text-copper whitespace-nowrap shrink-0"
                  >
                    Comparar detalhes
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Atalhos rápidos para comparar categorias */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand bg-sand/40 px-5 py-3.5 text-xs">
          <span className="font-medium text-forest">
            Escolha uma categoria para abrir o comparador lado a lado:
          </span>
          <div className="flex flex-wrap gap-2">
            {catalogCategories
              .filter((c) => c.id !== "all")
              .map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleOpenCategoryCompare(cat.id)}
                  className="rounded-md bg-white px-3 py-1.5 font-semibold text-forest transition-colors hover:bg-forest hover:text-cream whitespace-nowrap shrink-0"
                >
                  {cat.label}
                </button>
              ))}
            {isAdminAuthenticated && (
              <Link
                to="/estudio-ia"
                className="inline-flex items-center gap-1.5 rounded-md bg-copper px-3 py-1.5 font-semibold text-cream transition-colors hover:bg-copper-soft whitespace-nowrap shrink-0"
              >
                <Wand2 className="size-3.5" />
                Painel do Dono (IA)
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Seção 2: Destaques da Semana */}
      <section className="mx-auto max-w-6xl border-t border-sand px-5 py-16 sm:px-8">
        <div className="mb-10 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-semibold text-copper">Seleção Enxuta</p>
            <h2 className="mt-1 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
              Campeões de Custo-Benefício
            </h2>
            <p className="mt-2 text-sm text-stone">
              Os produtos com a maior nota técnica por real investido nesta
              semana.
            </p>
          </div>
          <Link
            to="/catalogo"
            className="group inline-flex items-center gap-2 rounded-lg border border-sand bg-white/70 px-4 py-2.5 text-xs font-semibold text-forest transition-colors hover:border-copper hover:text-copper whitespace-nowrap shrink-0"
          >
            Ver catálogo completo ({catalogProducts.length} produtos)
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        <ProductGrid products={featured} />
      </section>
    </div>
  );
}
