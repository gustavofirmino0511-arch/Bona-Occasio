import { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle,
  ArrowUpRight,
  Award,
  Check,
  CheckCircle2,
  Cpu,
  Scale,
  SlidersHorizontal,
  Sparkles,
  TrendingDown,
  Trophy,
  Wand2,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import {
  analyzeComparison,
  getSpecPracticalExplanation,
  priorityOptions,
} from "@/lib/comparison";
import { cn, discountPercent, formatBRL } from "@/lib/utils";
import type { CategoryId } from "@/types/product";

export function Compare() {
  const {
    catalogProducts,
    catalogCategories,
    activeCategory,
    setActiveCategory,
    priority,
    setPriority,
    comparedProducts,
    toggleProductInCategory,
    isProductInComparator,
    isAdminAuthenticated,
  } = useCompare();

  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState(false);

  const categoryProducts = catalogProducts.filter(
    (p) => p.category === activeCategory,
  );
  const compareCategories = catalogCategories.filter(
    (c): c is { id: CategoryId; label: string; description?: string } =>
      c.id !== "all",
  );

  const analysis = analyzeComparison(comparedProducts, priority);

  const specDefinitions =
    comparedProducts[0]?.specs.map((s) => ({
      key: s.key,
      label: s.label,
    })) ?? [];

  const visibleSpecs = highlightDiffsOnly
    ? specDefinitions.filter((spec) => {
        const winners = analysis?.specWinners[spec.key] ?? [];
        return winners.length > 0 && winners.length < comparedProducts.length;
      })
    : specDefinitions;

  const activePriorityObj =
    priorityOptions.find((p) => p.id === priority) ?? priorityOptions[0];

  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {/* Cabeçalho da Página */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div className="max-w-3xl">
          <p className="text-xs font-medium text-copper">
            Comparação 100% no Site · Análise Peça por Peça
          </p>
          <h1
            className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest sm:text-5xl"
            style={{ textWrap: "balance" }}
          >
            Comparador de Produtos e Ficha Técnica
          </h1>
          <p className="mt-4 text-base leading-relaxed text-stone">
            Escolha 2 ou 3 produtos para ver lado a lado qual processador, placa
            de vídeo, câmera, tela e bateria leva vantagem — e descubra
            exatamente em que cada modelo ganha ou perde.
          </p>
        </div>

        {isAdminAuthenticated && (
          <Link
            to="/estudio-ia"
            className="inline-flex items-center gap-2 self-start rounded-lg border border-copper/40 bg-white/80 px-4 py-2.5 text-xs font-semibold text-forest transition-colors hover:border-copper hover:text-copper sm:self-end whitespace-nowrap shrink-0"
          >
            <Wand2 className="size-3.5 text-copper" />
            Painel do Dono: Subir com IA
          </Link>
        )}
      </div>

      {/* Controles Passo 1 e Passo 2 */}
      <div className="mt-10 grid gap-6 border-y border-sand py-8 lg:grid-cols-12">
        {/* Seletor de Categoria */}
        <div className="lg:col-span-5">
          <span className="block text-xs font-semibold text-forest">
            01. Escolha a categoria de produtos
          </span>
          <div
            role="group"
            aria-label="Categoria para comparação"
            className="mt-3 flex flex-wrap gap-2"
          >
            {compareCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setActiveCategory(cat.id)}
                  aria-pressed={isActive}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors whitespace-nowrap shrink-0",
                    isActive
                      ? "bg-forest text-cream shadow-xs"
                      : "border border-sand bg-white/70 text-stone hover:border-copper hover:text-forest",
                  )}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-stone">
            {
              compareCategories.find((c) => c.id === activeCategory)
                ?.description
            }
          </p>
        </div>

        {/* Seletor de Prioridade (Objetivo de Compra) */}
        <div className="lg:col-span-7 lg:border-l lg:border-sand lg:pl-8">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-forest">
              02. Qual é o seu foco principal na compra?
            </span>
            <span className="text-xs text-stone">
              Recalcula o vencedor automaticamente
            </span>
          </div>
          <div
            role="group"
            aria-label="Prioridade de compra"
            className="mt-3 flex flex-wrap gap-2"
          >
            {priorityOptions.map((option) => {
              const isSelected = priority === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setPriority(option.id)}
                  aria-pressed={isSelected}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-left text-xs font-semibold transition-all whitespace-nowrap shrink-0",
                    isSelected
                      ? "bg-copper text-cream shadow-xs"
                      : "border border-sand bg-white/70 text-stone hover:border-copper hover:text-forest",
                  )}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2.5 text-xs text-stone">
            {activePriorityObj.description}
          </p>
        </div>
      </div>

      {/* Passo 3: Seleção dos Modelos na Categoria */}
      <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <span className="text-xs font-semibold text-forest">
            03. Escolha quais opções você quer comparar lado a lado (2 ou 3 ao
            mesmo tempo):
          </span>
          <div className="mt-2 flex flex-wrap gap-2">
            {categoryProducts.map((product) => {
              const selected = isProductInComparator(product.id);
              return (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => toggleProductInCategory(product)}
                  aria-pressed={selected}
                  className={cn(
                    "inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0",
                    selected
                      ? "border-forest bg-forest/10 font-semibold text-forest"
                      : "border-sand bg-white/50 text-stone hover:border-copper hover:text-forest",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-4 items-center justify-center rounded-xs border text-[10px]",
                      selected
                        ? "border-forest bg-forest text-cream"
                        : "border-stone/40 bg-transparent",
                    )}
                  >
                    {selected && <Check className="size-3" />}
                  </span>
                  <span>{product.shortName}</span>
                  <span className="font-mono text-[11px] text-stone tabular-nums">
                    {formatBRL(product.price)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setHighlightDiffsOnly((prev) => !prev)}
          aria-pressed={highlightDiffsOnly}
          className={cn(
            "inline-flex items-center gap-2 self-start rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors sm:self-end whitespace-nowrap shrink-0",
            highlightDiffsOnly
              ? "border-forest bg-forest text-cream"
              : "border-sand bg-white/70 text-stone hover:border-forest hover:text-forest",
          )}
        >
          <SlidersHorizontal className="size-3.5" />
          {highlightDiffsOnly
            ? "Mostrando apenas diferenças"
            : "Destacar apenas diferenças"}
        </button>
      </div>

      {/* Painel de Veredito Automático + Placar Mano a Mano ("Quem ganha em quê") */}
      {analysis && (
        <section
          aria-label="Veredito da comparação"
          className="mt-8 rounded-2xl border border-sand bg-white/85 p-6 sm:p-8"
        >
          <div className="grid gap-6 border-b border-sand pb-6 md:grid-cols-3">
            {/* Destaque 1: Vencedor na Prioridade do Usuário */}
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-copper">
                <Award className="size-4 shrink-0" />
                <span>Melhor para: {activePriorityObj.label}</span>
              </div>
              <p className="mt-2 font-display text-xl font-semibold text-forest">
                {analysis.winner.shortName}
              </p>
              <p className="mt-1 text-xs text-stone">
                Nota{" "}
                <strong className="font-mono font-semibold text-forest tabular-nums">
                  {analysis.scoresByProductId[analysis.winner.id]}/100
                </strong>{" "}
                · {analysis.winner.highlightTitle}
              </p>
            </div>

            {/* Destaque 2: Campeão Custo-Benefício */}
            <div className="md:border-l md:border-sand md:pl-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                <Scale className="size-4 shrink-0 text-copper" />
                <span>Campeão Custo-Benefício</span>
              </div>
              <p className="mt-2 font-display text-xl font-semibold text-forest">
                {analysis.bestCostBenefit.shortName}
              </p>
              <p className="mt-1 text-xs text-stone">
                <span className="font-mono font-semibold text-forest tabular-nums">
                  {formatBRL(analysis.bestCostBenefit.price)}
                </span>{" "}
                · Índice{" "}
                <span className="font-mono tabular-nums">
                  {analysis.bestCostBenefit.metrics.costBenefit}/100
                </span>
              </p>
            </div>

            {/* Destaque 3: Líder Técnico / Hardware */}
            <div className="md:border-l md:border-sand md:pl-6">
              <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                <Cpu className="size-4 shrink-0 text-copper" />
                <span>Mais Potente (Ficha Técnica)</span>
              </div>
              <p className="mt-2 font-display text-xl font-semibold text-forest">
                {analysis.bestPerformance.shortName}
              </p>
              <p className="mt-1 text-xs text-stone">
                Vence em{" "}
                <strong className="font-mono font-semibold text-forest tabular-nums">
                  {analysis.specWinCountByProductId[
                    analysis.bestPerformance.id
                  ] ?? 0}
                </strong>{" "}
                quesitos técnicos · Hardware{" "}
                <span className="font-mono tabular-nums">
                  {analysis.bestPerformance.metrics.performance}/100
                </span>
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p className="text-sm leading-relaxed text-ink/90">
              <strong className="font-semibold text-forest">
                Resumo da análise:{" "}
              </strong>
              {analysis.verdictSummary}
            </p>
            {analysis.savingsVsMostExpensive > 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-copper whitespace-nowrap shrink-0">
                <TrendingDown className="size-4" />
                Economia de {formatBRL(analysis.savingsVsMostExpensive)} no
                custo-benefício
              </span>
            )}
          </div>

          {/* Placar Mano a Mano: Esse ganha nisso vs Aquele ganha naquilo */}
          {comparedProducts.length >= 2 && (
            <div className="mt-6 border-t border-sand pt-6">
              <h2 className="text-xs font-semibold tracking-wide text-forest uppercase">
                Resumo Mano a Mano: Quem ganha em quê e onde cada um fica atrás
              </h2>

              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {comparedProducts.map((product) => {
                  const wins =
                    analysis.winningSpecLabelsByProductId[product.id] ?? [];
                  const losses =
                    analysis.losingSpecLabelsByProductId[product.id] ?? [];
                  const isWinner = analysis.winner.id === product.id;

                  return (
                    <div
                      key={product.id}
                      className={cn(
                        "rounded-xl border p-4 text-xs",
                        isWinner
                          ? "border-forest/40 bg-forest/[0.04]"
                          : "border-sand bg-cream/60",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-display text-base font-semibold text-forest">
                          {product.shortName}
                        </span>
                        <span className="font-mono font-bold text-copper tabular-nums">
                          {formatBRL(product.price)}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2.5">
                        <div>
                          <span className="inline-flex items-center gap-1 font-semibold text-forest">
                            <Trophy className="size-3.5 text-copper" />
                            Esse ganha em:
                          </span>
                          <p className="mt-0.5 leading-relaxed text-ink/90">
                            {wins.length > 0
                              ? wins.join(" · ")
                              : product.highlightTitle}
                          </p>
                        </div>

                        <div>
                          <span className="font-semibold text-forest">
                            É melhor para:
                          </span>
                          <p className="mt-0.5 leading-relaxed text-stone">
                            {product.idealFor}
                          </p>
                        </div>

                        <div className="border-t border-sand pt-2">
                          <span className="inline-flex items-center gap-1 font-semibold text-stone">
                            <AlertCircle className="size-3.5 text-stone" />
                            Ponto mais simples / fica atrás:
                          </span>
                          <p className="mt-0.5 leading-relaxed text-stone">
                            {product.cons[0] ??
                              (losses.length > 0
                                ? `Fica atrás em: ${losses.join(", ")}`
                                : "Sem pontos fracos graves na faixa de preço")}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Matriz Lado a Lado Peça por Peça */}
      {comparedProducts.length > 0 && analysis && (
        <div className="mt-10 overflow-x-auto pb-4">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead>
              <tr>
                <th className="w-56 border-b border-sand pb-6 pr-6 align-bottom">
                  <span className="text-xs font-semibold text-stone">
                    Comparação no Site
                  </span>
                  <p className="mt-2 font-display text-xl font-semibold text-forest">
                    Peça por Peça
                  </p>
                  <p className="mt-1 text-xs font-normal text-stone">
                    Explicação prática de cada componente para o perfil:{" "}
                    <strong className="text-forest">
                      {activePriorityObj.label}
                    </strong>
                  </p>
                </th>

                {comparedProducts.map((product) => {
                  const isWinner = analysis.winner.id === product.id;
                  const score = analysis.scoresByProductId[product.id] ?? 0;
                  const off = discountPercent(
                    product.price,
                    product.originalPrice,
                  );

                  return (
                    <th
                      key={product.id}
                      className={cn(
                        "w-72 border-b border-sand p-5 align-top transition-colors",
                        isWinner
                          ? "rounded-t-2xl bg-forest/[0.04]"
                          : "bg-transparent",
                      )}
                    >
                      <div className="mb-3 flex h-6 items-center justify-between gap-2 text-xs">
                        {isWinner ? (
                          <span className="inline-flex min-w-0 items-center gap-1.5 truncate font-semibold text-copper">
                            <Sparkles className="size-3.5 shrink-0" />
                            <span className="truncate">
                              Vencedor ({activePriorityObj.label})
                            </span>
                          </span>
                        ) : (
                          <span className="truncate text-stone">
                            {product.highlightTitle}
                          </span>
                        )}
                        <span className="font-mono text-xs font-bold text-forest tabular-nums shrink-0">
                          {score}/100
                        </span>
                      </div>

                      <Link
                        to={`/produto/${product.id}`}
                        className="group block overflow-hidden rounded-xl border border-sand bg-sand"
                      >
                        <img
                          src={product.image}
                          alt={product.name}
                          referrerPolicy="no-referrer"
                          className="aspect-[5/4] w-full object-cover transition-transform duration-300 group-hover:scale-102"
                        />
                      </Link>

                      <div className="mt-4 flex flex-col">
                        <div className="flex items-center gap-1.5 text-xs font-normal text-stone">
                          <span>{product.brand}</span>
                          <span aria-hidden="true">·</span>
                          <span>CB {product.metrics.costBenefit}/100</span>
                        </div>

                        <Link
                          to={`/produto/${product.id}`}
                          className="mt-1 line-clamp-2 min-h-[2.75rem] font-display text-lg leading-snug font-semibold text-forest hover:text-copper"
                        >
                          {product.name}
                        </Link>

                        <p className="mt-2 line-clamp-2 min-h-[2.5rem] text-xs font-normal leading-relaxed text-stone">
                          <strong className="font-medium text-ink">
                            Ideal para:
                          </strong>{" "}
                          {product.idealFor}
                        </p>

                        <div className="mt-4 flex items-baseline gap-2">
                          <span className="font-mono text-2xl font-bold text-forest tabular-nums">
                            {formatBRL(product.price)}
                          </span>
                          {product.originalPrice && (
                            <span className="font-mono text-xs font-normal text-stone line-through tabular-nums">
                              {formatBRL(product.originalPrice)}
                            </span>
                          )}
                          {off !== null && (
                            <span className="font-mono text-xs font-semibold text-copper tabular-nums">
                              −{off}%
                            </span>
                          )}
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                          <Link
                            to={`/produto/${product.id}`}
                            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-forest px-3.5 py-2 text-xs font-semibold text-cream transition-colors hover:bg-forest-soft whitespace-nowrap"
                          >
                            Escolher produto
                            <ArrowUpRight className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>

            <tbody className="divide-y divide-sand text-sm">
              {/* Linha de Índice de Custo-Benefício & Desempenho */}
              <tr>
                <td className="py-5 pr-6 align-top font-medium text-forest">
                  <div>Índices da Curadoria</div>
                  <div className="mt-1 text-xs font-normal text-stone">
                    Pontuação técnica de 0 a 100
                  </div>
                </td>
                {comparedProducts.map((product) => {
                  const isWinner = analysis.winner.id === product.id;
                  return (
                    <td
                      key={product.id}
                      className={cn(
                        "p-5 align-top",
                        isWinner && "bg-forest/[0.04]",
                      )}
                    >
                      <div className="space-y-2.5 text-xs">
                        <div>
                          <div className="flex justify-between text-stone">
                            <span>Custo-Benefício</span>
                            <span className="font-mono font-semibold text-forest tabular-nums">
                              {product.metrics.costBenefit}/100
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                            <div
                              className="h-full rounded-full bg-copper"
                              style={{
                                width: `${product.metrics.costBenefit}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone">
                            <span>Desempenho Bruto</span>
                            <span className="font-mono font-semibold text-forest tabular-nums">
                              {product.metrics.performance}/100
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                            <div
                              className="h-full rounded-full bg-forest"
                              style={{
                                width: `${product.metrics.performance}%`,
                              }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-stone">
                            <span>Bateria & Mobilidade</span>
                            <span className="font-mono font-semibold text-forest tabular-nums">
                              {product.metrics.battery}/100
                            </span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-sand">
                            <div
                              className="h-full rounded-full bg-forest-soft"
                              style={{
                                width: `${product.metrics.battery}%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* Linhas de Especificações Técnicas com Explicação Prática */}
              {visibleSpecs.map((specDef) => {
                const winningIds = analysis.specWinners[specDef.key] ?? [];
                const losingIds = analysis.specLosers[specDef.key] ?? [];

                return (
                  <tr key={specDef.key}>
                    <td className="py-5 pr-6 align-top font-medium text-forest">
                      <div>{specDef.label}</div>
                      <div className="mt-1 text-xs font-normal text-stone">
                        Peça + para que serve na prática
                      </div>
                    </td>

                    {comparedProducts.map((product) => {
                      const specItem = product.specs.find(
                        (s) => s.key === specDef.key,
                      );
                      const isRowWinner = winningIds.includes(product.id);
                      const isRowLoser =
                        losingIds.includes(product.id) && !isRowWinner;
                      const isOverallWinner =
                        analysis.winner.id === product.id;

                      return (
                        <td
                          key={product.id}
                          className={cn(
                            "p-5 align-top",
                            isOverallWinner && "bg-forest/[0.04]",
                          )}
                        >
                          {specItem ? (
                            <div>
                              <div className="flex items-start justify-between gap-2">
                                <span
                                  className={cn(
                                    "text-sm leading-snug",
                                    isRowWinner
                                      ? "font-semibold text-forest"
                                      : "text-ink/90",
                                  )}
                                >
                                  {specItem.value}
                                </span>
                              </div>

                              {/* Explicação Prática da Peça */}
                              <p
                                className={cn(
                                  "mt-2 rounded-lg p-2.5 text-xs leading-relaxed",
                                  isRowWinner
                                    ? "border border-forest/20 bg-forest/[0.06] text-ink"
                                    : "bg-cream/80 text-stone",
                                )}
                              >
                                {getSpecPracticalExplanation(specItem)}
                              </p>

                              <div className="mt-3 flex items-center justify-between gap-3">
                                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-sand">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      isRowWinner
                                        ? "bg-forest"
                                        : "bg-stone/40",
                                    )}
                                    style={{ width: `${specItem.score}%` }}
                                  />
                                </div>
                                <span className="font-mono text-xs text-stone tabular-nums">
                                  {specItem.score}/100
                                </span>
                              </div>

                              {isRowWinner && (
                                <p className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-copper">
                                  <CheckCircle2 className="size-3.5 shrink-0" />
                                  Ganha neste quesito
                                </p>
                              )}

                              {isRowLoser && (
                                <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone">
                                  <AlertCircle className="size-3.5 shrink-0" />
                                  Mais simples neste item
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-stone">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}

              {/* Linha de Pontos Fortes e Pontos de Atenção */}
              <tr>
                <td className="py-5 pr-6 align-top font-medium text-forest">
                  <div>Prós & Pontos de Atenção</div>
                  <div className="mt-1 text-xs font-normal text-stone">
                    Resumo sincero antes de comprar
                  </div>
                </td>

                {comparedProducts.map((product) => {
                  const isOverallWinner = analysis.winner.id === product.id;
                  return (
                    <td
                      key={product.id}
                      className={cn(
                        "rounded-b-2xl p-5 align-top",
                        isOverallWinner && "bg-forest/[0.04]",
                      )}
                    >
                      <div className="space-y-3 text-xs">
                        <div>
                          <p className="font-semibold text-forest">
                            Pontos fortes:
                          </p>
                          <ul className="mt-1.5 space-y-1.5 text-ink/85">
                            {product.pros.map((pro, idx) => (
                              <li key={idx} className="leading-relaxed">
                                + {pro}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="border-t border-sand pt-2.5">
                          <p className="font-semibold text-stone">
                            Vale observar:
                          </p>
                          <ul className="mt-1.5 space-y-1 text-stone">
                            {product.cons.map((con, idx) => (
                              <li key={idx} className="leading-relaxed">
                                − {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
