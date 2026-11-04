import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Check,
  Sparkles,
  Scale,
  ArrowRight,
  SlidersHorizontal,
  Trophy,
  ThumbsUp,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  HelpCircle,
  Eye,
  EyeOff,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import {
  analyzeComparison,
  getSpecPracticalExplanation,
  priorityOptions,
} from "@/lib/comparison";
import { cn } from "@/lib/utils";

const SPEC_HINTS: Record<string, string> = {
  cpu: "Define a velocidade para abrir programas, planilhas pesadas e vários apps ao mesmo tempo.",
  processador:
    "É o cérebro do aparelho: define se vai abrir tudo rápido ou travar com o tempo.",
  gpu: "Determina se roda jogos modernos, edição de vídeo e projetos 3D com fluidez.",
  ram: "Quantos aplicativos ou abas pesadas você consegue deixar abertos sem lentidão.",
  storage:
    "Espaço interno para guardar fotos, vídeos, programas e documentos sem lotar.",
  armazenamento:
    "Espaço interno para guardar fotos, vídeos, jogos e documentos sem lotar.",
  display: "Qualidade do brilho, fidelidade das cores e fluidez ao rolar a imagem.",
  tela: "Qualidade do brilho, nitidez das cores e fluidez ao rolar a imagem.",
  battery: "Tempo real longe da tomada e velocidade de recarga na correria.",
  bateria: "Tempo real longe da tomada e velocidade de recarga na correria.",
  weight: "Conforto para carregar na mochila ou usar por horas seguidas.",
  camera:
    "Nitidez das fotos e estabilidade dos vídeos, principalmente em ambientes internos.",
  anc: "Capacidade de bloquear barulhos de ônibus, avião, rua e conversas ao redor.",
  sound: "Clareza das vozes, definição de instrumentos e força dos graves.",
  som: "Clareza das vozes, definição de instrumentos e força dos graves.",
  mic: "Como a sua voz chega para a outra pessoa em chamadas, reuniões e áudios.",
  microfone:
    "Como a sua voz chega para a outra pessoa em chamadas, reuniões e áudios.",
  comfort: "Encaixe na orelha ou cabeça, leveza e conforto para usar por horas.",
  conforto: "Encaixe na orelha ou cabeça, leveza e conforto para usar por horas.",
  connectivity:
    "Estabilidade da conexão (Bluetooth ou cabo USB-C) e rapidez ao conectar.",
  switch: "Sensação tátil ao digitar, nível de ruído das teclas e durabilidade.",
  layout: "Tamanho na mesa e presença de teclas de função e setas dedicadas.",
  build: "Qualidade do acabamento, amortecimento interno e resistência física.",
};

function getSpecHint(key: string): string {
  const normalized = key.toLowerCase();
  for (const [k, hint] of Object.entries(SPEC_HINTS)) {
    if (normalized.includes(k)) return hint;
  }
  return "Impacta diretamente a experiência de uso e durabilidade no dia a dia.";
}

function formatBRL(value: number): string {
  const hasCents = Math.round(value * 100) % 100 !== 0;
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: hasCents ? 2 : 0,
  });
}

export function Compare() {
  const {
    catalogProducts,
    catalogCategories,
    activeCategory,
    priority,
    setActiveCategory,
    setPriority,
    toggleProductInCategory,
    isProductInComparator,
    comparedProducts,
  } = useCompare();

  const [onlyDifferences, setOnlyDifferences] = useState(false);
  const [showPracticalDetails, setShowPracticalDetails] = useState(false);

  const categoryProducts = useMemo(
    () => catalogProducts.filter((p) => p.category === activeCategory),
    [catalogProducts, activeCategory],
  );

  const selectableCategories = useMemo(
    () =>
      catalogCategories.filter(
        (c) =>
          c.id !== "all" &&
          catalogProducts.some((p) => p.category === c.id),
      ),
    [catalogCategories, catalogProducts],
  );

  const analysis = useMemo(
    () => analyzeComparison(comparedProducts, priority),
    [comparedProducts, priority],
  );

  const allSpecRows = useMemo(() => {
    const map = new Map<string, string>();
    for (const product of comparedProducts) {
      for (const spec of product.specs) {
        if (!map.has(spec.key)) {
          map.set(spec.key, spec.label);
        }
      }
    }
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [comparedProducts]);

  const visibleSpecRows = useMemo(() => {
    if (!onlyDifferences) return allSpecRows;
    return allSpecRows.filter((row) => {
      const values = comparedProducts.map(
        (p) => p.specs.find((s) => s.key === row.key)?.value || "",
      );
      return new Set(values).size > 1;
    });
  }, [allSpecRows, comparedProducts, onlyDifferences]);

  const gridColsClass =
    comparedProducts.length === 2
      ? "grid-cols-1 md:grid-cols-2"
      : "grid-cols-1 lg:grid-cols-3";

  const activePriorityObj = priorityOptions.find((o) => o.id === priority);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Cabeçalho da Página */}
      <div className="mb-10 max-w-3xl">
        <div className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-widest text-copper uppercase">
          <Scale className="size-4" />
          Comparador Lado a Lado • Sem Letras Miúdas
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-forest sm:text-5xl">
          Qual vale mais o seu dinheiro?
        </h1>
        <p className="mt-3 text-base leading-relaxed text-stone sm:text-lg">
          Compare de 2 a 3 produtos com visual limpo e direto ao ponto. Veja o
          preço real, o que cada um tem de melhor e quem ganha em cada peça.
        </p>
      </div>

      {/* Painel de Controles (Passos 1, 2 e 3) */}
      <div className="mb-10 space-y-6 rounded-3xl border border-sand bg-white p-6 shadow-xs sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
          {/* Passo 1: Categoria */}
          <div className="lg:col-span-5">
            <p className="mb-3 text-xs font-bold tracking-wider text-stone uppercase">
              1. Escolha a categoria
            </p>
            <div className="flex flex-wrap gap-2.5">
              {selectableCategories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setActiveCategory(category.id)}
                  className={cn(
                    "rounded-xl px-4 py-2.5 text-sm font-semibold transition-all",
                    activeCategory === category.id
                      ? "bg-forest text-cream shadow-xs"
                      : "bg-cream text-stone hover:bg-sand/70 hover:text-ink",
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Passo 2: Prioridade de Uso */}
          <div className="lg:col-span-7">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-copper" />
              <p className="text-xs font-bold tracking-wider text-stone uppercase">
                2. O que é mais importante para você?
              </p>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {priorityOptions.map((opt) => {
                const active = priority === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setPriority(opt.id)}
                    className={cn(
                      "rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-all",
                      active
                        ? "border-copper bg-copper/10 font-semibold text-forest shadow-2xs"
                        : "border-sand bg-cream/60 text-stone hover:border-forest/30 hover:text-ink",
                    )}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Passo 3: Seleção de Modelos */}
        <div className="border-t border-sand pt-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold tracking-wider text-stone uppercase">
              3. Selecione de 2 a 3 modelos para comparar (
              {comparedProducts.length}/3 selecionados)
            </p>
            <span className="text-xs font-medium text-stone">
              Clique em um produto abaixo para adicionar ou remover da disputa
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {categoryProducts.map((product) => {
              const isSelected = isProductInComparator(product.id);
              const isDisabled = !isSelected && comparedProducts.length >= 3;

              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProductInCategory(product)}
                  disabled={isDisabled}
                  className={cn(
                    "flex items-center gap-3.5 rounded-2xl border p-3.5 text-left transition-all",
                    isSelected
                      ? "border-forest bg-forest/[0.05] ring-1 ring-forest"
                      : "border-sand bg-cream/40 hover:border-forest/30",
                    isDisabled && "cursor-not-allowed opacity-40",
                  )}
                >
                  <img
                    src={product.image}
                    alt={product.shortName}
                    className="size-14 shrink-0 rounded-xl bg-white object-contain p-1.5"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-ink">
                      {product.shortName}
                    </div>
                    <div className="mt-1 flex items-center gap-2 font-mono text-sm font-semibold text-forest">
                      <span>{formatBRL(product.price)}</span>
                      <span className="text-xs font-normal text-stone">
                        • Nota {product.metrics.costBenefit}
                      </span>
                    </div>
                  </div>
                  <div
                    className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                      isSelected
                        ? "border-forest bg-forest text-cream"
                        : "border-stone/40 bg-white",
                    )}
                  >
                    {isSelected && <Check className="size-3.5" />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {comparedProducts.length < 2 || !analysis ? (
        <div className="rounded-3xl border border-dashed border-sand bg-white p-14 text-center">
          <p className="font-display text-xl text-forest">
            Selecione pelo menos 2 produtos acima para abrir o comparativo lado
            a lado.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {/* BLOCO 1: Veredito Rápido e Claro */}
          <section
            aria-label="Veredito da Curadoria"
            className="rounded-3xl bg-forest p-6 text-cream shadow-md sm:p-8"
          >
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-cream/15 pb-5">
              <div className="flex items-center gap-2.5">
                <Sparkles className="size-5 text-copper-soft" />
                <h2 className="font-display text-xl font-semibold sm:text-2xl">
                  Veredito Rápido ({activePriorityObj?.label})
                </h2>
              </div>
              <span className="font-mono text-xs tracking-wider text-cream/80 uppercase">
                Resumo direto para decidir sem dúvida
              </span>
            </div>

            <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
              {/* Campeão do Perfil */}
              <div className="rounded-2xl border border-copper-soft/50 bg-white/10 p-5">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-copper-soft uppercase">
                  <Trophy className="size-4" />
                  1º Lugar na Disputa
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-white">
                  {analysis.winner.shortName}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-cream/90">
                  {analysis.verdictSummary}
                </p>
                {analysis.winningSpecLabelsByProductId[analysis.winner.id]
                  ?.length ? (
                  <div className="mt-4 border-t border-cream/15 pt-3 text-xs leading-relaxed text-cream/90">
                    <span className="font-semibold text-copper-soft">
                      Ganha em:{" "}
                    </span>
                    {analysis.winningSpecLabelsByProductId[analysis.winner.id]
                      .slice(0, 4)
                      .join(" • ")}
                  </div>
                ) : null}
              </div>

              {/* Melhor Custo-Benefício ou Líder Técnico */}
              {analysis.bestCostBenefit.id !== analysis.winner.id ? (
                <div className="rounded-2xl border border-cream/15 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cream/80 uppercase">
                    <ThumbsUp className="size-4 text-copper-soft" />
                    Campeão Custo-Benefício
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold text-white">
                    {analysis.bestCostBenefit.shortName}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-cream/85">
                    Nota{" "}
                    <strong className="font-mono text-white">
                      {analysis.bestCostBenefit.metrics.costBenefit}/100
                    </strong>{" "}
                    por{" "}
                    <strong className="font-mono text-white">
                      {formatBRL(analysis.bestCostBenefit.price)}
                    </strong>
                    . Entrega o pacote mais equilibrado por cada real investido.
                  </p>
                </div>
              ) : (
                <div className="rounded-2xl border border-cream/15 bg-white/5 p-5">
                  <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cream/80 uppercase">
                    <ThumbsUp className="size-4 text-copper-soft" />
                    Destaque em Ficha Técnica
                  </div>
                  <div className="mt-2 font-display text-2xl font-semibold text-white">
                    {analysis.bestPerformance.shortName}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-cream/85">
                    Alcança{" "}
                    <strong className="font-mono text-white">
                      {analysis.bestPerformance.metrics.performance}/100
                    </strong>{" "}
                    em qualidade técnica e vence em{" "}
                    <strong className="font-mono text-white">
                      {analysis.specWinCountByProductId[
                        analysis.bestPerformance.id
                      ] ?? 0}{" "}
                      quesitos
                    </strong>{" "}
                    diretos desta comparação por{" "}
                    <strong className="font-mono text-white">
                      {formatBRL(analysis.bestPerformance.price)}
                    </strong>
                    .
                  </p>
                </div>
              )}

              {/* Opção Mais Barata */}
              <div className="rounded-2xl border border-cream/15 bg-white/5 p-5">
                <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-cream/80 uppercase">
                  <Scale className="size-4 text-copper-soft" />
                  Escolha Mais Econômica
                </div>
                <div className="mt-2 font-display text-2xl font-semibold text-white">
                  {analysis.lowestPrice.shortName}
                </div>
                <p className="mt-2 text-sm leading-relaxed text-cream/85">
                  Custa{" "}
                  <strong className="font-mono text-white">
                    {formatBRL(analysis.lowestPrice.price)}
                  </strong>{" "}
                  e garante{" "}
                  <strong className="font-mono text-white">
                    {Math.round(
                      (analysis.lowestPrice.metrics.costBenefit /
                        analysis.winner.metrics.costBenefit) *
                        100,
                    )}
                    %
                  </strong>{" "}
                  do índice de custo-benefício do líder. Ideal para economizar.
                </p>
              </div>
            </div>
          </section>

          {/* BLOCO 2: Cards Principais Lado a Lado (Visão Geral Ampla) */}
          <section aria-label="Produtos Comparados">
            <div className={cn("grid gap-6", gridColsClass)}>
              {comparedProducts.map((product) => {
                const isOverallWinner = analysis.winner.id === product.id;
                const isRealAffiliate =
                  Boolean(product.affiliateUrl) &&
                  product.affiliateUrl !== "#" &&
                  !product.affiliateUrl.includes("exemplo");
                const discountPercent =
                  product.originalPrice && product.originalPrice > product.price
                    ? Math.round(
                        ((product.originalPrice - product.price) /
                          product.originalPrice) *
                          100,
                      )
                    : 0;
                const wins =
                  analysis.winningSpecLabelsByProductId[product.id] ?? [];

                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex flex-col justify-between rounded-3xl border bg-white p-6 transition-all sm:p-7",
                      isOverallWinner
                        ? "border-forest ring-2 ring-forest/20 shadow-md"
                        : "border-sand shadow-xs",
                    )}
                  >
                    <div>
                      {/* Topo do Card: Selo + Nota */}
                      <div className="mb-4 flex items-center justify-between gap-2">
                        {isOverallWinner ? (
                          <span className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3 py-1 text-xs font-bold tracking-wider text-cream uppercase">
                            <Trophy className="size-3.5 text-copper-soft" />
                            Vencedor da Disputa
                          </span>
                        ) : (
                          <span className="text-xs font-bold tracking-wider text-stone uppercase">
                            {product.brand}
                          </span>
                        )}

                        <span className="rounded-lg bg-cream px-3 py-1 font-mono text-sm font-bold text-forest">
                          Nota{" "}
                          {analysis.scoresByProductId[product.id] ??
                            product.metrics.costBenefit}
                          /100
                        </span>
                      </div>

                      {/* Imagem Ampla */}
                      <div className="relative mb-5 flex h-48 items-center justify-center rounded-2xl bg-cream/60 p-4">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="max-h-full max-w-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                        {discountPercent > 0 && (
                          <span className="absolute top-3 right-3 rounded-lg bg-copper px-2.5 py-1 font-mono text-xs font-bold text-white">
                            -{discountPercent}% OFF
                          </span>
                        )}
                      </div>

                      {/* Título e Destaque */}
                      <div className="text-xs font-bold tracking-wider text-copper uppercase">
                        {product.highlightTitle}
                      </div>
                      <Link
                        to={`/produto/${product.id}`}
                        className="mt-1 block font-display text-2xl font-semibold text-ink transition-colors hover:text-copper"
                      >
                        {product.shortName}
                      </Link>

                      {/* Preço em Destaque */}
                      <div className="mt-4 rounded-2xl bg-cream/80 p-4">
                        {product.originalPrice &&
                          product.originalPrice > product.price && (
                            <div className="font-mono text-xs text-stone line-through">
                              De {formatBRL(product.originalPrice)}
                            </div>
                          )}
                        <div className="mt-0.5 flex items-baseline gap-2">
                          <span className="font-mono text-2xl font-bold text-forest sm:text-3xl">
                            {formatBRL(product.price)}
                          </span>
                          <span className="text-xs font-medium text-stone">
                            à vista
                          </span>
                        </div>
                        {product.installmentText && (
                          <p className="mt-1 text-xs text-stone">
                            {product.installmentText}
                          </p>
                        )}
                      </div>

                      {/* Para quem é ideal */}
                      <div className="mt-5">
                        <p className="text-xs font-bold tracking-wider text-stone uppercase">
                          Para quem vale a pena:
                        </p>
                        <p className="mt-1.5 text-sm leading-relaxed text-ink">
                          {product.idealFor}
                        </p>
                      </div>

                      {/* Onde este modelo ganha */}
                      <div className="mt-4 border-t border-sand pt-4">
                        <p className="text-xs font-bold tracking-wider text-forest uppercase">
                          Vantagens diretas ({wins.length} vitórias):
                        </p>
                        <p className="mt-1 text-sm font-medium text-forest">
                          {wins.length > 0
                            ? wins.join(" • ")
                            : "Opção equilibrada no conjunto geral"}
                        </p>
                      </div>
                    </div>

                    {/* Botões de Ação */}
                    <div className="mt-6 flex flex-col gap-2.5 border-t border-sand pt-5">
                      {isRealAffiliate ? (
                        <a
                          href={product.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-copper px-4 py-3 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-copper-dark"
                        >
                          Ir para o produto
                          <ExternalLink className="size-4" />
                        </a>
                      ) : null}
                      <Link
                        to={`/produto/${product.id}`}
                        className={cn(
                          "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-4 py-3 text-sm font-semibold transition-colors",
                          isRealAffiliate
                            ? "border border-sand bg-cream/60 text-forest hover:bg-sand/60"
                            : "bg-forest text-cream hover:bg-forest-soft",
                        )}
                      >
                        Ver análise completa
                        <ArrowRight className="size-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BLOCO 3: Comparativo Peça por Peça (Espaçoso e Sem Embolar) */}
          <section aria-label="Comparativo Peça por Peça" className="space-y-6">
            <div className="flex flex-col justify-between gap-4 rounded-3xl border border-sand bg-white p-6 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-2xl font-semibold text-forest">
                  Comparativo Peça por Peça
                </h2>
                <p className="mt-1 text-sm text-stone">
                  Cada componente separado em blocos largos e fáceis de ler para
                  você bater o olho e ver quem ganha.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowPracticalDetails((prev) => !prev)}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all",
                    showPracticalDetails
                      ? "border-forest bg-forest text-cream"
                      : "border-sand bg-cream text-forest hover:border-forest/40",
                  )}
                >
                  {showPracticalDetails ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                  {showPracticalDetails
                    ? "Ocultar explicação detalhada"
                    : "Traduzir termos técnicos"}
                </button>

                <label className="inline-flex cursor-pointer items-center gap-2.5 rounded-xl border border-sand bg-cream/60 px-4 py-2.5 text-sm font-medium text-ink select-none hover:border-forest/30">
                  <input
                    type="checkbox"
                    checked={onlyDifferences}
                    onChange={(e) => setOnlyDifferences(e.target.checked)}
                    className="size-4 rounded border-stone text-forest focus:ring-forest"
                  />
                  Mostrar apenas diferenças
                </label>
              </div>
            </div>

            {/* Lista de Peças em Blocos Horizontais Amplos */}
            <div className="space-y-5">
              {visibleSpecRows.map((specRow, index) => {
                const winnerIds = analysis.specWinners[specRow.key] ?? [];
                const loserIds = analysis.specLosers[specRow.key] ?? [];

                return (
                  <div
                    key={specRow.key}
                    className="overflow-hidden rounded-3xl border border-sand bg-white shadow-2xs"
                  >
                    {/* Cabeçalho da Peça */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sand bg-cream/60 px-6 py-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="rounded-md bg-forest/10 px-2.5 py-0.5 font-mono text-xs font-bold text-forest">
                            0{index + 1}
                          </span>
                          <h3 className="font-display text-lg font-semibold text-forest sm:text-xl">
                            {specRow.label}
                          </h3>
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-stone">
                          <HelpCircle className="size-4 shrink-0 text-copper" />
                          {getSpecHint(specRow.key)}
                        </p>
                      </div>
                    </div>

                    {/* Colunas dos Produtos para esta Peça */}
                    <div
                      className={cn(
                        "grid divide-y divide-sand md:divide-y-0 md:divide-x",
                        gridColsClass,
                      )}
                    >
                      {comparedProducts.map((product) => {
                        const specItem = product.specs.find(
                          (s) => s.key === specRow.key,
                        );
                        const isRowWinner = winnerIds.includes(product.id);
                        const isRowLoser = loserIds.includes(product.id);

                        return (
                          <div
                            key={product.id}
                            className={cn(
                              "flex flex-col justify-between p-6 transition-colors",
                              isRowWinner ? "bg-forest/[0.03]" : "bg-white",
                            )}
                          >
                            {specItem ? (
                              <>
                                <div>
                                  {/* Nome do modelo + Badge de vitória na linha */}
                                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                                    <span className="text-xs font-bold tracking-wider text-stone uppercase">
                                      {product.shortName}
                                    </span>

                                    {isRowWinner && (
                                      <span className="inline-flex items-center gap-1 rounded-md bg-forest/10 px-2.5 py-0.5 text-xs font-bold text-forest">
                                        <CheckCircle2 className="size-3.5 text-copper" />
                                        Melhor neste item
                                      </span>
                                    )}

                                    {isRowLoser && !isRowWinner && (
                                      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone">
                                        <AlertCircle className="size-3.5" />
                                        Mais básico
                                      </span>
                                    )}
                                  </div>

                                  {/* Valor Principal da Especificação (Fonte Maior e Legível) */}
                                  <div
                                    className={cn(
                                      "text-base leading-snug sm:text-lg",
                                      isRowWinner
                                        ? "font-bold text-forest"
                                        : "font-medium text-ink",
                                    )}
                                  >
                                    {specItem.value}
                                  </div>

                                  {/* Explicação Prática (Exibida quando ativada pelo usuário) */}
                                  {showPracticalDetails && (
                                    <p
                                      className={cn(
                                        "mt-3 rounded-xl p-3.5 text-sm leading-relaxed",
                                        isRowWinner
                                          ? "border border-forest/20 bg-forest/[0.05] text-ink"
                                          : "bg-cream text-stone",
                                      )}
                                    >
                                      {getSpecPracticalExplanation(specItem)}
                                    </p>
                                  )}
                                </div>

                                {/* Barra de Pontuação da Peça */}
                                <div className="mt-5 flex items-center gap-3 pt-2">
                                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-sand">
                                    <div
                                      className={cn(
                                        "h-full rounded-full transition-all",
                                        isRowWinner
                                          ? "bg-forest"
                                          : "bg-stone/45",
                                      )}
                                      style={{ width: `${specItem.score}%` }}
                                    />
                                  </div>
                                  <span className="font-mono text-sm font-semibold text-stone tabular-nums">
                                    {specItem.score}/100
                                  </span>
                                </div>
                              </>
                            ) : (
                              <span className="text-sm text-stone">
                                Não informado
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* BLOCO 4: Pontos Fortes e Pontos de Atenção Lado a Lado */}
          <section
            aria-label="Pontos Fortes e Pontos de Atenção"
            className="overflow-hidden rounded-3xl border border-sand bg-white shadow-2xs"
          >
            <div className="border-b border-sand bg-cream/60 px-6 py-5">
              <h2 className="font-display text-2xl font-semibold text-forest">
                Prós e Contras Sinceros
              </h2>
              <p className="mt-1 text-sm text-stone">
                O que você vai adorar e o que precisa saber antes de fechar a
                compra.
              </p>
            </div>

            <div
              className={cn(
                "grid divide-y divide-sand md:divide-y-0 md:divide-x",
                gridColsClass,
              )}
            >
              {comparedProducts.map((product) => {
                const isOverallWinner = analysis.winner.id === product.id;
                return (
                  <div
                    key={product.id}
                    className={cn(
                      "flex flex-col justify-between p-6 sm:p-7",
                      isOverallWinner && "bg-forest/[0.03]",
                    )}
                  >
                    <div className="space-y-6">
                      <div className="font-display text-xl font-semibold text-ink">
                        {product.shortName}
                      </div>

                      <div>
                        <p className="text-xs font-bold tracking-wider text-forest uppercase">
                          Pontos Fortes
                        </p>
                        <ul className="mt-3 space-y-2.5 text-sm leading-relaxed text-ink">
                          {product.pros.map((pro, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="mt-0.5 font-bold text-forest">
                                +
                              </span>
                              <span>{pro}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="border-t border-sand pt-5">
                        <p className="text-xs font-bold tracking-wider text-stone uppercase">
                          Pontos de Atenção
                        </p>
                        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-stone">
                          {product.cons.map((con, idx) => (
                            <li key={idx} className="flex items-start gap-2.5">
                              <span className="mt-0.5 font-bold text-copper">
                                −
                              </span>
                              <span>{con}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
