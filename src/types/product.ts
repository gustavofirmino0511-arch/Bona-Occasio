export type CategoryId =
  | "notebooks"
  | "smartphones"
  | "audio"
  | "perifericos"
  | string;

export type ComparisonPriority =
  | "custo-beneficio"
  | "desempenho"
  | "economia"
  | "mobilidade";

export interface ProductSpecItem {
  key: string;
  label: string;
  value: string;
  /** Pontuação de 0 a 100 para comparar quem vence neste quesito técnico */
  score: number;
  /** Explicação prática em linguagem simples (para que serve, no que ganha ou perde) */
  usageNote?: string;
  /** Se verdadeiro, maior pontuação significa melhor (padrão true) */
  higherIsBetter?: boolean;
}

export interface ProductMetrics {
  /** Poder de processamento / hardware bruto (0-100) */
  performance: number;
  /** Índice de custo-benefício (0-100) */
  costBenefit: number;
  /** Autonomia de bateria ou durabilidade (0-100) */
  battery: number;
  /** Portabilidade, peso e ergonomia (0-100) */
  mobility: number;
  /** Construção, tela e acabamento (0-100) */
  buildQuality: number;
}

export interface Product {
  id: string;
  name: string;
  shortName: string;
  brand: string;
  tagline: string;
  image: string;
  price: number;
  originalPrice?: number;
  installmentText?: string;
  category: CategoryId;
  affiliateUrl: string;
  featured?: boolean;
  /** Frase curta explicando para quem o produto é ideal */
  idealFor: string;
  /** Resumo rápido do destaque técnico (ex: "Melhor Placa de Vídeo") */
  highlightTitle: string;
  /** Avaliação média (ex: 4.8) */
  rating: number;
  reviewCount: number;
  /** Métricas normalizadas para cálculo de prioridade */
  metrics: ProductMetrics;
  /** Especificações padronizadas por categoria para comparação lado a lado */
  specs: ProductSpecItem[];
  /** Pontos fortes */
  pros: string[];
  /** Pontos de atenção */
  cons: string[];
}

export interface Category {
  id: CategoryId | "all";
  label: string;
  description?: string;
}

export interface AiProductDraft {
  name: string;
  shortName: string;
  brand: string;
  tagline: string;
  image?: string;
  price: number;
  originalPrice?: number;
  installmentText: string;
  category: CategoryId;
  suggestedNewCategory?: {
    id: string;
    label: string;
    description: string;
  };
  idealFor: string;
  highlightTitle: string;
  metrics: ProductMetrics;
  specs: ProductSpecItem[];
  pros: string[];
  cons: string[];
  aiReasoning: string;
}

export interface AiCategorySuggestion {
  id: string;
  label: string;
  description: string;
  reason: string;
  exampleProducts: string[];
}

export interface AiProductImprovement {
  productId: string;
  productName: string;
  suggestedIdealFor: string;
  suggestedHighlightTitle: string;
  reason: string;
}

export interface AiCatalogAdviceResponse {
  newCategories: AiCategorySuggestion[];
  productImprovements: AiProductImprovement[];
  strategicSummary: string;
}
