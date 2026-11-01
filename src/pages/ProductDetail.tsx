import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Scale,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { getSpecPracticalExplanation } from "@/lib/comparison";
import { cn, discountPercent, formatBRL, sanitizeExternalUrl } from "@/lib/utils";

export function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    catalogProducts,
    setCategoryProductsForComparison,
  } = useCompare();

  const product = catalogProducts.find((p) => p.id === id);

  const competitors = catalogProducts.filter(
    (p) => p.category === product?.category && p.id !== product?.id,
  );

  // Estado do seletor "Comparar com outras opções"
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [selectedRivalIds, setSelectedRivalIds] = useState<string[]>([]);

  useEffect(() => {
    if (competitors.length > 0) {
      setSelectedRivalIds(competitors.slice(0, 2).map((c) => c.id));
    }
  }, [product?.id, competitors.length]);

  if (!product) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl text-forest">
          Produto não encontrado
        </h1>
        <Link
          to="/catalogo"
          className="mt-6 inline-block text-copper hover:underline"
        >
          Voltar para o catálogo
        </Link>
      </div>
    );
  }

  const off = discountPercent(product.price, product.originalPrice);

  const toggleRival = (rivalId: string) => {
    setSelectedRivalIds((prev) => {
      if (prev.includes(rivalId)) {
        return prev.filter((item) => item !== rivalId);
      }
      // Permite escolher até 2 rivais para comparar até 3 produtos ao mesmo tempo (o atual + 2)
      if (prev.length >= 2) {
        return [...prev.slice(1), rivalId];
      }
      return [...prev, rivalId];
    });
  };

  const handleConfirmComparison = () => {
    const chosenRivals =
      selectedRivalIds.length > 0
        ? selectedRivalIds
        : competitors.slice(0, 2).map((c) => c.id);
    setCategoryProductsForComparison(product.category, [
      product.id,
      ...chosenRivals,
    ]);
    setIsSelectorOpen(false);
    navigate("/comparar");
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <Link
          to="/catalogo"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone transition-colors hover:text-forest"
        >
          <ArrowLeft className="size-4" />
          Voltar para o catálogo
        </Link>

        <button
          type="button"
          onClick={() => setIsSelectorOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-forest bg-white/80 px-4 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-cream whitespace-nowrap shrink-0"
        >
          <Scale className="size-3.5" />
          Comparar com outras opções ({competitors.length} disponíveis)
        </button>
      </div>

      {/* Módulo Principal Contíguo (Imagem Esquerda + Compra Direta Direita) */}
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-6">
          <div className="overflow-hidden rounded-2xl border border-sand bg-sand">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="aspect-[5/4] w-full object-cover"
            />
          </div>

          {/* Índices da Curadoria no Nosso Site */}
          <div className="mt-6 grid grid-cols-3 gap-4 rounded-xl border border-sand bg-white/80 p-4 text-center">
            <div>
              <span className="block text-xs text-stone">Custo-Benefício</span>
              <span className="mt-1 block font-mono text-xl font-bold text-copper tabular-nums">
                {product.metrics.costBenefit}/100
              </span>
            </div>
            <div className="border-x border-sand">
              <span className="block text-xs text-stone">Desempenho</span>
              <span className="mt-1 block font-mono text-xl font-bold text-forest tabular-nums">
                {product.metrics.performance}/100
              </span>
            </div>
            <div>
              <span className="block text-xs text-stone">Bateria / Uso</span>
              <span className="mt-1 block font-mono text-xl font-bold text-forest tabular-nums">
                {product.metrics.battery}/100
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center lg:col-span-6">
          <div className="flex flex-wrap items-center gap-2 text-xs text-stone">
            <span className="font-semibold text-copper">
              {product.highlightTitle}
            </span>
            <span aria-hidden="true">·</span>
            <span>Marca: {product.brand}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono tabular-nums">
              Nota {product.rating}/5 ({product.reviewCount} avaliações)
            </span>
          </div>

          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest sm:text-4xl">
            {product.name}
          </h1>

          <p className="mt-3 text-base leading-relaxed text-stone">
            {product.tagline}
          </p>

          <div className="mt-4 rounded-xl border border-sand bg-white/70 p-4 text-xs leading-relaxed text-ink">
            <strong className="font-semibold text-forest">
              Ideal para quem:{" "}
            </strong>
            {product.idealFor}
          </div>

          {/* Preço e Condição */}
          <div className="mt-6 border-y border-sand py-5">
            <span className="text-xs text-stone">
              Preço da oferta selecionada:
            </span>
            <div className="mt-1 flex items-baseline gap-3">
              <span className="font-mono text-3xl font-bold text-forest tabular-nums">
                {formatBRL(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-mono text-base text-stone line-through tabular-nums">
                  {formatBRL(product.originalPrice)}
                </span>
              )}
              {off !== null && (
                <span className="font-mono text-xs font-semibold text-copper tabular-nums">
                  −{off}% OFF
                </span>
              )}
            </div>
            {product.installmentText && (
              <p className="mt-1 text-xs text-stone">
                {product.installmentText}
              </p>
            )}
          </div>

          {/* Ações Principais: Comprar pelo Link de Afiliado + Comparar com Outras Opções */}
          <div className="mt-6 flex flex-col gap-3">
            <a
              href={sanitizeExternalUrl(product.affiliateUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-6 py-4 text-sm font-semibold text-cream transition-colors hover:bg-forest-soft"
            >
              Comprar agora na oferta oficial
              <ArrowUpRight className="size-4" />
            </a>

            <button
              type="button"
              id="open-compare-options-btn"
              onClick={() => setIsSelectorOpen(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-copper/50 bg-white/90 px-6 py-3.5 text-xs font-semibold text-forest transition-colors hover:border-copper hover:bg-copper/10"
            >
              <Scale className="size-4 text-copper" />
              Comparar com outras opções (escolha quais modelos comparar)
            </button>
          </div>

          <p className="mt-3 flex items-center gap-2 text-xs text-stone">
            <ShieldCheck className="size-4 shrink-0 text-copper" />
            Toda a análise e comparação é feita aqui no Bona Occasio. Ao clicar
            em comprar, você vai direto para a página oficial da oferta.
          </p>
        </div>
      </div>

      {/* Modal / Janela Interativa: Escolha com quais opções você quer comparar */}
      {isSelectorOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Escolher produtos para comparar"
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-xs"
        >
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-sand bg-cream p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4 border-b border-sand pb-4">
              <div>
                <span className="text-xs font-semibold text-copper">
                  Comparador Mano a Mano no Site
                </span>
                <h2 className="mt-1 font-display text-2xl font-semibold text-forest">
                  Com quais opções você quer comparar o {product.shortName}?
                </h2>
                <p className="mt-1 text-xs text-stone">
                  Selecione 1 ou 2 modelos abaixo para comparar até 3 produtos
                  ao mesmo tempo (placa de vídeo, processador, câmera, tela e
                  quem ganha em cada item).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsSelectorOpen(false)}
                aria-label="Fechar janela de seleção"
                className="rounded-lg p-2 text-stone hover:bg-sand hover:text-forest"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Produto Atual Fixado */}
            <div className="mt-5 rounded-xl border border-forest/30 bg-forest/5 p-3.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="inline-flex size-6 items-center justify-center rounded-full bg-forest text-xs font-bold text-cream">
                    1
                  </span>
                  <div>
                    <p className="text-xs font-semibold text-forest">
                      {product.name} (Produto atual)
                    </p>
                    <p className="text-[11px] text-stone">
                      {product.highlightTitle} · {formatBRL(product.price)}
                    </p>
                  </div>
                </div>
                <span className="rounded-md bg-forest px-2.5 py-1 text-[11px] font-semibold text-cream">
                  Selecionado
                </span>
              </div>
            </div>

            {/* Lista de Outras Opções da Mesma Categoria */}
            <div className="mt-5">
              <p className="text-xs font-semibold text-forest">
                Escolha até 2 concorrentes da mesma categoria para comparar lado
                a lado:
              </p>

              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {competitors.map((rival) => {
                  const isChecked = selectedRivalIds.includes(rival.id);
                  const cpuSpec = rival.specs.find(
                    (s) => s.key === "processor" || s.key === "anc" || s.key === "switches",
                  );
                  const gpuSpec = rival.specs.find(
                    (s) => s.key === "gpu" || s.key === "sound" || s.key === "construction",
                  );

                  return (
                    <button
                      key={rival.id}
                      type="button"
                      onClick={() => toggleRival(rival.id)}
                      aria-pressed={isChecked}
                      className={cn(
                        "flex flex-col justify-between rounded-xl border p-4 text-left transition-all",
                        isChecked
                          ? "border-forest bg-white shadow-sm ring-1 ring-forest"
                          : "border-sand bg-white/60 hover:border-copper",
                      )}
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-[11px] font-semibold text-copper">
                            {rival.highlightTitle}
                          </span>
                          <span
                            className={cn(
                              "flex size-5 shrink-0 items-center justify-center rounded-md border",
                              isChecked
                                ? "border-forest bg-forest text-cream"
                                : "border-stone/40 bg-white",
                            )}
                          >
                            {isChecked && <Check className="size-3.5" />}
                          </span>
                        </div>

                        <p className="mt-1 font-display text-base font-semibold text-forest">
                          {rival.name}
                        </p>

                        <p className="mt-1 font-mono text-sm font-bold text-forest tabular-nums">
                          {formatBRL(rival.price)}
                        </p>

                        <div className="mt-2.5 space-y-1 border-t border-sand pt-2 text-[11px] text-stone">
                          {cpuSpec && (
                            <p className="truncate">
                              <strong className="text-ink">
                                {cpuSpec.label}:
                              </strong>{" "}
                              {cpuSpec.value}
                            </p>
                          )}
                          {gpuSpec && (
                            <p className="truncate">
                              <strong className="text-ink">
                                {gpuSpec.label}:
                              </strong>{" "}
                              {gpuSpec.value}
                            </p>
                          )}
                        </div>
                      </div>

                      <p className="mt-3 text-[11px] font-medium text-forest">
                        {isChecked
                          ? "✓ Incluído na comparação"
                          : "+ Clique para incluir na comparação"}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 flex flex-col justify-between gap-3 border-t border-sand pt-5 sm:flex-row sm:items-center">
              <p className="text-xs text-stone">
                Comparando{" "}
                <strong className="text-forest">
                  {1 + selectedRivalIds.length} produtos
                </strong>{" "}
                lado a lado
              </p>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(false)}
                  className="rounded-lg border border-sand px-4 py-2.5 text-xs font-semibold text-stone hover:text-forest"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="confirm-compare-modal-btn"
                  disabled={selectedRivalIds.length === 0}
                  onClick={handleConfirmComparison}
                  className="inline-flex items-center gap-2 rounded-lg bg-forest px-5 py-2.5 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft disabled:opacity-50"
                >
                  <Scale className="size-4" />
                  Comparar {1 + selectedRivalIds.length} modelos agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Ficha Técnica Completa com Explicação Prática de Cada Componente + Veredito Sincero */}
      <div className="mt-16 grid gap-10 border-t border-sand pt-12 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Ficha Técnica Explicada Item por Item
          </h2>
          <p className="mt-1 text-xs text-stone">
            Veja não apenas o nome das peças, mas para que cada componente é
            bom na prática (processador, placa de vídeo, câmera, tela e
            bateria).
          </p>

          <div className="mt-6 divide-y divide-sand rounded-2xl border border-sand bg-white/80 px-6">
            {product.specs.map((spec) => {
              const practicalExplanation = getSpecPracticalExplanation(spec);
              return (
                <div key={spec.key} className="py-4">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-xs font-semibold text-forest">
                      {spec.label}
                    </span>
                    <span className="font-mono text-xs font-semibold text-copper tabular-nums">
                      Nota {spec.score}/100
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-medium text-ink">
                    {spec.value}
                  </p>
                  <p className="mt-1.5 rounded-lg bg-cream/90 px-3 py-2 text-xs leading-relaxed text-stone">
                    <strong className="font-semibold text-forest">
                      Na prática:{" "}
                    </strong>
                    {practicalExplanation}
                  </p>
                  <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                    <div
                      className="h-full rounded-full bg-forest"
                      style={{ width: `${spec.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-5">
          <h2 className="font-display text-2xl font-semibold text-forest">
            Veredito Sincero & Comparação
          </h2>
          <p className="mt-1 text-xs text-stone">
            O que mais gostamos, pontos de atenção e comparação direta com os
            concorrentes.
          </p>

          <div className="mt-6 rounded-2xl border border-sand bg-white/80 p-6">
            <h3 className="text-sm font-semibold text-forest">
              No que este modelo manda muito bem
            </h3>
            <ul className="mt-3 space-y-2.5 text-sm text-ink/90">
              {product.pros.map((pro, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-copper" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 border-t border-sand pt-5">
              <h3 className="text-sm font-semibold text-stone">
                Onde ele não é tão forte (Pontos de Atenção)
              </h3>
              <ul className="mt-3 space-y-2 text-sm text-stone">
                {product.cons.map((con, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-bold text-stone">−</span>
                    <span>{con}</span>
                  </li>
                ))}
              </ul>
            </div>

            {competitors.length > 0 && (
              <div className="mt-6 border-t border-sand pt-5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-copper">
                  <Sparkles className="size-3.5" />
                  <span>Em dúvida entre este e outro modelo?</span>
                </div>
                <p className="mt-1 text-xs leading-relaxed text-stone">
                  Escolha quais concorrentes ({competitors.map((c) => c.shortName).join(", ")})
                  você quer colocar lado a lado com o{" "}
                  <strong className="text-forest">{product.shortName}</strong>{" "}
                  para ver quem ganha em placa de vídeo, processador, câmera e
                  bateria:
                </p>
                <button
                  type="button"
                  onClick={() => setIsSelectorOpen(true)}
                  className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-forest px-4 py-3 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft"
                >
                  <Scale className="size-3.5" />
                  Escolher opções para comparar agora
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
