import type {
  ComparisonPriority,
  Product,
  ProductSpecItem,
} from "../types/product";

export interface PriorityOption {
  id: ComparisonPriority;
  label: string;
  description: string;
}

export const priorityOptions: PriorityOption[] = [
  {
    id: "custo-beneficio",
    label: "Melhor Custo-Benefício",
    description:
      "Equilíbrio ideal entre especificações técnicas, durabilidade e preço pago.",
  },
  {
    id: "desempenho",
    label: "Máximo Desempenho",
    description:
      "Prioriza processador, placa de vídeo dedicada, memória RAM e velocidade.",
  },
  {
    id: "economia",
    label: "Menor Investimento",
    description:
      "Foca na opção mais acessível que entrega qualidade confiável sem gastar além.",
  },
  {
    id: "mobilidade",
    label: "Bateria & Mobilidade",
    description:
      "Destaca leveza, autonomia longe da tomada e conforto para transporte diário.",
  },
];

export interface ComparisonAnalysis {
  /** Pontuação final de cada produto (0 a 100) segundo a prioridade escolhida */
  scoresByProductId: Record<string, number>;
  /** Produto vencedor na prioridade ativa */
  winner: Product;
  /** Produto com maior índice de custo-benefício */
  bestCostBenefit: Product;
  /** Produto com maior desempenho técnico bruto */
  bestPerformance: Product;
  /** Produto mais barato da seleção */
  lowestPrice: Product;
  /** Mapa de chave de especificação -> lista de IDs de produtos que empatam/vencem naquela linha */
  specWinners: Record<string, string[]>;
  /** Mapa de chave de especificação -> lista de IDs de produtos que ficam mais atrás naquela linha */
  specLosers: Record<string, string[]>;
  /** Contagem de quantas especificações técnicas cada produto venceu */
  specWinCountByProductId: Record<string, number>;
  /** Lista legível dos quesitos em que cada produto ganha (ex: ["Placa de Vídeo (GPU)", "Processador (CPU)"]) */
  winningSpecLabelsByProductId: Record<string, string[]>;
  /** Lista legível dos quesitos em que cada produto fica atrás dos rivais */
  losingSpecLabelsByProductId: Record<string, string[]>;
  /** Texto explicativo detalhando o veredito da comparação */
  verdictSummary: string;
  /** Economia máxima entre o mais caro e o melhor custo-benefício (quando aplicável) */
  savingsVsMostExpensive: number;
}

/**
 * Gera uma explicação prática em linguagem simples caso o item não tenha usageNote preenchido.
 */
export function getSpecPracticalExplanation(spec: ProductSpecItem): string {
  if (spec.usageNote && spec.usageNote.trim().length > 0) {
    return spec.usageNote;
  }
  if (spec.score >= 90) {
    return `Excelente nível em ${spec.label.toLowerCase()}, indicado para uso exigente sem limitações.`;
  }
  if (spec.score >= 78) {
    return `Bom equilíbrio em ${spec.label.toLowerCase()}, atendendo muito bem trabalho, estudos e rotina diária.`;
  }
  return `Mais básico em ${spec.label.toLowerCase()}: cumpre o essencial do dia a dia, mas não é o foco principal deste modelo.`;
}

/**
 * Calcula a nota ponderada (0-100) de um produto de acordo com o objetivo do comprador.
 */
export function calculatePriorityScore(
  product: Product,
  priority: ComparisonPriority,
  allComparedProducts: Product[] = [product],
): number {
  const { performance, costBenefit, battery, mobility, buildQuality } =
    product.metrics;

  const prices = allComparedProducts.map((p) => p.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Nota relativa de preço (100 para o mais barato, proporcional até 55 para o mais caro)
  const priceScore =
    maxPrice > minPrice
      ? 100 - ((product.price - minPrice) / (maxPrice - minPrice)) * 45
      : 85;

  let raw = 0;
  switch (priority) {
    case "custo-beneficio":
      raw =
        costBenefit * 0.45 +
        performance * 0.22 +
        buildQuality * 0.13 +
        priceScore * 0.2;
      break;
    case "desempenho":
      raw =
        performance * 0.65 +
        buildQuality * 0.2 +
        costBenefit * 0.1 +
        battery * 0.05;
      break;
    case "economia":
      raw =
        priceScore * 0.5 +
        costBenefit * 0.35 +
        performance * 0.1 +
        buildQuality * 0.05;
      break;
    case "mobilidade":
      raw =
        battery * 0.45 +
        mobility * 0.35 +
        buildQuality * 0.12 +
        costBenefit * 0.08;
      break;
  }

  return Math.round(Math.max(0, Math.min(100, raw)));
}

/**
 * Analisa uma lista de 2 ou mais produtos dentro do nosso site e retorna os vencedores gerais e por especificação.
 */
export function analyzeComparison(
  products: Product[],
  priority: ComparisonPriority = "custo-beneficio",
): ComparisonAnalysis | null {
  if (products.length === 0) return null;

  const scoresByProductId: Record<string, number> = {};
  for (const p of products) {
    scoresByProductId[p.id] = calculatePriorityScore(p, priority, products);
  }

  // Ordena para achar vencedor da prioridade ativa (desempate por costBenefit e menor preço)
  const sortedByPriority = [...products].sort((a, b) => {
    const diff = scoresByProductId[b.id] - scoresByProductId[a.id];
    if (diff !== 0) return diff;
    if (b.metrics.costBenefit !== a.metrics.costBenefit) {
      return b.metrics.costBenefit - a.metrics.costBenefit;
    }
    return a.price - b.price;
  });

  const winner = sortedByPriority[0];

  const bestCostBenefit = [...products].sort((a, b) => {
    const scoreA = calculatePriorityScore(a, "custo-beneficio", products);
    const scoreB = calculatePriorityScore(b, "custo-beneficio", products);
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.price - b.price;
  })[0];

  const bestPerformance = [...products].sort((a, b) => {
    if (b.metrics.performance !== a.metrics.performance) {
      return b.metrics.performance - a.metrics.performance;
    }
    return b.metrics.buildQuality - a.metrics.buildQuality;
  })[0];

  const lowestPrice = [...products].sort((a, b) => a.price - b.price)[0];
  const highestPrice = [...products].sort((a, b) => b.price - a.price)[0];

  // Coletar todas as chaves de especificações presentes nos produtos
  const allSpecKeys = Array.from(
    new Set(products.flatMap((p) => p.specs.map((s) => s.key))),
  );

  const specWinners: Record<string, string[]> = {};
  const specLosers: Record<string, string[]> = {};
  const specWinCountByProductId: Record<string, number> = {};
  const winningSpecLabelsByProductId: Record<string, string[]> = {};
  const losingSpecLabelsByProductId: Record<string, string[]> = {};

  for (const p of products) {
    specWinCountByProductId[p.id] = 0;
    winningSpecLabelsByProductId[p.id] = [];
    losingSpecLabelsByProductId[p.id] = [];
  }

  // Se for o mais barato entre 2+ produtos, ganha em "Menor Preço"
  if (products.length >= 2 && highestPrice.price > lowestPrice.price) {
    specWinners["price"] = products
      .filter((p) => p.price === lowestPrice.price)
      .map((p) => p.id);
    for (const id of specWinners["price"]) {
      winningSpecLabelsByProductId[id]?.push("Menor Preço");
    }
  } else {
    specWinners["price"] = [];
  }

  for (const key of allSpecKeys) {
    const entries = products
      .map((p) => {
        const spec = p.specs.find((s) => s.key === key);
        return spec
          ? { productId: p.id, score: spec.score, label: spec.label }
          : null;
      })
      .filter(
        (
          x,
        ): x is { productId: string; score: number; label: string } =>
          x !== null,
      );

    if (entries.length < 2) continue;

    const maxScore = Math.max(...entries.map((e) => e.score));
    const minScore = Math.min(...entries.map((e) => e.score));
    const label = entries[0].label;

    // Só destaca vencedor se houver diferença real entre os produtos naquela linha
    if (maxScore > minScore) {
      const winningIds = entries
        .filter((e) => e.score === maxScore)
        .map((e) => e.productId);
      specWinners[key] = winningIds;
      for (const id of winningIds) {
        specWinCountByProductId[id] = (specWinCountByProductId[id] ?? 0) + 1;
        winningSpecLabelsByProductId[id]?.push(label);
      }

      // Destaca onde um produto fica atrás (diferença >= 8 pontos para o líder)
      if (maxScore - minScore >= 8) {
        const losingIds = entries
          .filter((e) => e.score === minScore)
          .map((e) => e.productId);
        specLosers[key] = losingIds;
        for (const id of losingIds) {
          losingSpecLabelsByProductId[id]?.push(label);
        }
      } else {
        specLosers[key] = [];
      }
    } else {
      specWinners[key] = [];
      specLosers[key] = [];
    }
  }

  // Se algum produto não venceu nenhuma linha isolada mas tem melhor custo-benefício, adiciona
  for (const p of products) {
    if (
      winningSpecLabelsByProductId[p.id].length === 0 &&
      bestCostBenefit.id === p.id
    ) {
      winningSpecLabelsByProductId[p.id].push("Equilíbrio Custo-Benefício");
    }
  }

  const savingsVsMostExpensive = Math.max(
    0,
    highestPrice.price - bestCostBenefit.price,
  );

  let verdictSummary = "";
  if (products.length === 1) {
    verdictSummary = `Selecione pelo menos mais um produto para comparar lado a lado com o ${winner.shortName}.`;
  } else if (priority === "custo-beneficio") {
    if (bestCostBenefit.id === bestPerformance.id) {
      verdictSummary = `O ${bestCostBenefit.shortName} domina o comparativo: entrega simultaneamente o melhor conjunto técnico (${bestCostBenefit.metrics.performance}/100) e a melhor relação custo-benefício da categoria.`;
    } else {
      verdictSummary = `Para compra inteligente, o ${bestCostBenefit.shortName} ganha no custo-benefício${
        savingsVsMostExpensive > 0
          ? ` (economia de R$ ${savingsVsMostExpensive.toLocaleString("pt-BR")} frente ao mais caro)`
          : ""
      }. Já se você exige poder máximo de placa de vídeo e processador, o ${bestPerformance.shortName} ganha em força bruta.`;
    }
  } else if (priority === "desempenho") {
    verdictSummary = `Com foco em potência bruta, o ${winner.shortName} vence com ${winner.metrics.performance}/100 em hardware (${winner.highlightTitle}), superando os concorrentes nas tarefas mais pesadas.`;
  } else if (priority === "economia") {
    verdictSummary = `Buscando gastar o mínimo com segurança, o ${winner.shortName} ganha pelo menor investimento, mantendo especificações honestas para o dia a dia.`;
  } else {
    verdictSummary = `Para quem trabalha ou estuda em movimento, o ${winner.shortName} ganha pela combinação superior de autonomia de bateria (${winner.metrics.battery}/100) e leveza.`;
  }

  return {
    scoresByProductId,
    winner,
    bestCostBenefit,
    bestPerformance,
    lowestPrice,
    specWinners,
    specLosers,
    specWinCountByProductId,
    winningSpecLabelsByProductId,
    losingSpecLabelsByProductId,
    verdictSummary,
    savingsVsMostExpensive,
  };
}
