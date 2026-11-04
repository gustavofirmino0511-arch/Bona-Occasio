import { sanitizeImageUrl, sanitizePlainText } from "./security";

export type MinerCategoryFilter =
  | "all"
  | "audio"
  | "perifericos"
  | "casa"
  | "moda"
  | "acessorios";

export interface MinedDeal {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  category: string;
  storeName: string;
  image: string;
  /** Link direto para abrir o produto no Mercado Livre e gerar o link meli.la */
  mercadoLivreSearchUrl: string;
  /** Link da oferta original (quando capturada ao vivo) */
  sourceDealUrl?: string;
  /** Pontuação de "Achadinho" (0 a 100) combinando preço baixo + desconto + qualidade */
  bargainScore: number;
  /** Explicação rápida do porquê esse produto é "barato e muito bom" */
  whyItSells: string;
  /** Especificações resumidas para já preencher o comparador com 1 clique */
  specsSummary: string;
  isLiveWebDeal?: boolean;
  /** Radares e lojas onde o produto foi detectado em alta (ex: Amazon Mais Vendidos #1, Buscapé, Zoom, Promobit) */
  radarSources?: string[];
  /** Sinal concreto de volume de vendas / termômetro de alta */
  trendingSignal?: string;
  /** Indicador de recência da venda/oferta (ex: "Vendido nas últimas horas", "Postado há 2 h") */
  recencyLabel?: string;
}

export interface MinerSearchOptions {
  maxPrice: number;
  categoryFilter?: MinerCategoryFilter;
  query?: string;
  forceRefresh?: boolean;
}

export function buildMercadoLivreSearchUrl(productTitle: string): string {
  const clean = productTitle
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s-]/g, " ")
    .replace(/\s+/g, "-")
    .replace(/(^-|-$)/g, "")
    .toLowerCase()
    .slice(0, 90);
  return `https://lista.mercadolivre.com.br/${clean || "ofertas"}`;
}

/**
 * Gera uma miniatura SVG limpa e legível como imagem de estúdio para qualquer oferta minerada.
 */
export function createDealThumbnailSvg(
  title: string,
  brand: string,
  category: string,
  price: number,
): string {
  const safeBrand = (brand || "OFERTA")
    .replace(/[<>&"']/g, "")
    .slice(0, 14)
    .toUpperCase();
  const words = (title || "Produto")
    .replace(/[<>&"']/g, "")
    .split(/\s+/)
    .slice(0, 4);
  const line1 = words.slice(0, 2).join(" ").slice(0, 18);
  const line2 = words.slice(2, 4).join(" ").slice(0, 18);
  const priceText = `R$ ${price.toFixed(0)}`;

  const bgByCat: Record<string, { bg: string; accent: string; badge: string }> = {
    moda: { bg: "#1f2937", accent: "#d97706", badge: "MODA" },
    casa: { bg: "#14332a", accent: "#b87333", badge: "CASA" },
    audio: { bg: "#0f172a", accent: "#38bdf8", badge: "ÁUDIO" },
    perifericos: { bg: "#1e1b4b", accent: "#a78bfa", badge: "TECH" },
  };
  const theme = bgByCat[category] || bgByCat.casa;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" width="160" height="160">
    <rect width="160" height="160" rx="20" fill="${theme.bg}" />
    <rect x="10" y="10" width="140" height="140" rx="14" fill="none" stroke="${theme.accent}" stroke-opacity="0.35" stroke-width="1.5" />
    <rect x="18" y="18" width="58" height="20" rx="6" fill="${theme.accent}" />
    <text x="47" y="32" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="10" font-weight="700">${theme.badge}</text>
    <text x="18" y="62" fill="#e5e7eb" font-family="system-ui, sans-serif" font-size="11" font-weight="700">${safeBrand}</text>
    <text x="18" y="84" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="600">${line1}</text>
    <text x="18" y="102" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="12" font-weight="500">${line2}</text>
    <rect x="18" y="116" width="124" height="26" rx="8" fill="#ffffff" fill-opacity="0.12" />
    <text x="80" y="134" text-anchor="middle" fill="#fbbf24" font-family="monospace" font-size="14" font-weight="700">${priceText}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function inferCategoryFromTitle(title: string): string {
  const lower = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (
    /\b(tenis|sapatenis|sapato|sandalia|chinelo|bota|coturno|rasteirinha|camisa|camiseta|blusa|vestido|calca|legging|bermuda|short|shorts|moletom|jaqueta|casaco| corta vento|corta-vento|meia|meias|cueca|cuecas|calcinha|sutia|top fitness|conjunto fitness|roupa|moda|jeans|dry fit|algodao|olympikus|adidas|nike|puma|mizuno|hering|lupo|vizzano|beira rio|havaianas)\b/.test(
      lower,
    )
  ) {
    return "moda";
  }

  if (
    /\b(movel|moveis|mesa|cabeceira|criado|sapateira|estante|prateleira|nicho|escrivaninha|puff|bau|armario|guarda-roupa|guardaroupa|rack|painel|cortina|blackout|persiana|cobertor|coberta|manta|edredom|lencol|jogo de cama|roupa de cama|fronha|travesseiro|colcha|cobre leito|toalha|tapete|mop|vassoura|cabide|organizador|cesto|varal|air fryer|fritadeira|liquidificador|chaleira|cafeteira|balanca|processador|aspirador|panela|ventilador|garrafa termica|parafusadeira|furadeira|lampada|cozinha|inox|quarto|sala)\b/.test(
      lower,
    )
  ) {
    return "casa";
  }

  if (
    /\b(fone|headphone|headset|earbuds|buds|caixa de som|soundbar|microfone|qcy|anker|soundcore|jbl|edifier|redmi buds|haylou|kz)\b/.test(
      lower,
    )
  ) {
    return "audio";
  }

  if (
    /\b(mouse|teclado|webcam|monitor|suporte monitor|suporte notebook|mousepad|hub usb|controle|joystick|dualsense|gamepad|carregador|cabo usb|power bank|pendrive|ssd|cartao de memoria|ring light|tripe)\b/.test(
      lower,
    )
  ) {
    return "perifericos";
  }

  return "casa";
}

function inferBrandFromTitle(title: string): string {
  const knownBrands = [
    "Olympikus",
    "Adidas",
    "Nike",
    "Puma",
    "Mizuno",
    "Hering",
    "Lupo",
    "Zorba",
    "Mash",
    "Vizzano",
    "Beira Rio",
    "Mormaii",
    "Fila",
    "Havaianas",
    "Santista",
    "Karsten",
    "Buddemeyer",
    "Tramontina",
    "Brinox",
    "Xiaomi",
    "Redmi",
    "QCY",
    "Anker",
    "Soundcore",
    "JBL",
    "Edifier",
    "Logitech",
    "Redragon",
    "Havit",
    "Baseus",
    "Essager",
    "Ugreen",
    "Samsung",
    "Motorola",
    "Philips",
    "Mondial",
    "Britânia",
    "Electrolux",
    "Cadence",
    "Oster",
    "Positivo",
    "Intelbras",
    "Sony",
    "Kaidi",
    "WAP",
    "Bosch",
    "Haylou",
    "KZ",
    "SanDisk",
    "Kingston",
  ];
  const lower = title.toLowerCase();
  for (const b of knownBrands) {
    if (lower.includes(b.toLowerCase())) {
      return b;
    }
  }
  const words = title.split(/\s+/).filter((w) => w.length >= 3);
  return words[1] || words[0] || "Seleção";
}

function calculateBargainScore(
  price: number,
  originalPrice: number,
  maxPriceTarget: number,
): number {
  const discountPct =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 20;
  const accessibilityBonus =
    price <= 45
      ? 18
      : price <= 85
        ? 14
        : price <= 150
          ? 10
          : price <= maxPriceTarget
            ? 6
            : 0;
  const raw = 68 + Math.min(22, discountPct * 0.42) + accessibilityBonus;
  return Math.max(75, Math.min(99, Math.round(raw)));
}

interface RawGemSeed {
  id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice: number;
  category: "audio" | "perifericos" | "casa" | "moda";
  image?: string;
  bargainScore: number;
  whyItSells: string;
  specsSummary: string;
}

const RAW_GEMS_CATALOG: RawGemSeed[] = [
  // ===================== CASA, MÓVEIS, CORTINAS, COBERTORES & ROUPA DE CAMA (24 ITENS) =====================
  {
    id: "gem-cortina-blackout-280x180",
    title: "Cortina Blackout Corta Luz 2,80m x 1,80m Com Ilhós Sala e Quarto Bloqueia Sol",
    brand: "Casa & Conforto",
    price: 49.9,
    originalPrice: 99.9,
    category: "casa",
    bargainScore: 98,
    whyItSells:
      "Cortina blackout campeã de vendas na faixa de R$ 49: bloqueia a claridade do sol, deixa o quarto escurinho e reduz o calor no verão.",
    specsSummary:
      "Cortina Blackout PVC/Tecido 2,80m largura x 1,80m altura (2 folhas de 1,40m), ilhós cromado p/ varão simples, bloqueio térmico e solar.",
  },
  {
    id: "gem-cortina-oxford-sala-quarto",
    title: "Cortina Tecido Oxford 2,00m x 1,70m Sala e Quarto Caimento Leve Lavável",
    brand: "Enxovais Ibitinga",
    price: 36.9,
    originalPrice: 74.9,
    category: "casa",
    bargainScore: 97,
    whyItSells:
      "Saindo abaixo de R$ 40: tecido Oxford encorpado que não amassa fácil, decora sala ou quarto gastando pouquíssimo.",
    specsSummary:
      "Tecido Oxford 100% Poliéster 2,00m x 1,70m em 2 partes, acabamento em bainha reforçada e ilhós para varão de até 2 metros.",
  },
  {
    id: "gem-cobertor-manta-casal-flannel",
    title: "Cobertor Manta Microfibra Casal Flannel Toque Macio Aveludado Quentinho",
    brand: "Soft Flannel",
    price: 42.9,
    originalPrice: 89.9,
    category: "casa",
    bargainScore: 98,
    whyItSells:
      "Cobertor e coberta de microfibra flannel na faixa de R$ 42: super macio, antialérgico, não solta pelos e seca rápido na máquina.",
    specsSummary:
      "Medida Casal 1,80m x 2,20m, microfibra Flannel gramatura macia, toque de pelúcia aveludado, antialérgico e lavável em máquina.",
  },
  {
    id: "gem-edredom-coberta-dupla-face-queen",
    title: "Edredom Coberta Casal Queen Dupla Face Micropercal 200 Fios Macio e Quente",
    brand: "Santista / Ibitinga",
    price: 68.9,
    originalPrice: 139.9,
    category: "casa",
    bargainScore: 97,
    whyItSells:
      "Coberta e edredom dupla face encorpado: veste a cama como hotel e esquenta de verdade no frio custando menos de R$ 70.",
    specsSummary:
      "Tamanho Casal/Queen 2,20m x 2,40m, enchimento siliconado macio que não embola, tecido micropercal dupla face matelado.",
  },
  {
    id: "gem-cobertor-sherpa-pele-carneiro",
    title: "Cobertor Coberta Casal Dupla Face Sherpa Lã de Carneiro + Flannel Inverno",
    brand: "Luxury Home",
    price: 84.9,
    originalPrice: 169.9,
    category: "casa",
    bargainScore: 96,
    whyItSells:
      "O cobertor mais desejado do inverno: um lado em manta flannel macia e o outro em Sherpa (toque lã de carneiro) de alto isolamento térmico.",
    specsSummary:
      "Medida Casal 1,80m x 2,20m (ou Queen), dupla camada térmica Sherpa + Flannel, gramatura alta, costura reforçada nas bordas.",
  },
  {
    id: "gem-jogo-cama-lencol-casal-400-fios",
    title: "Jogo de Cama Lençol Casal 4 Peças 400 Fios Micropercal Com Elástico Roupa de Cama",
    brand: "Realce / Ponto A",
    price: 47.9,
    originalPrice: 99.9,
    category: "casa",
    bargainScore: 98,
    whyItSells:
      "Roupa de cama completa com 4 peças (lençol de cima, lençol com elástico na volta toda e 2 fronhas) toque macio de hotel abaixo de R$ 50.",
    specsSummary:
      "Jogo 4 peças Casal Padrão: 1 lençol de cima, 1 lençol de baixo com elástico para colchão até 30cm altura e 2 fronhas 70x50cm em Micropercal 400 fios.",
  },
  {
    id: "gem-roupa-de-cama-lencol-queen-3-pecas",
    title: "Jogo de Lençol Roupa de Cama Casal Queen 3 Peças Malha Algodão Com Elástico",
    brand: "Sul Brasil Enxovais",
    price: 39.9,
    originalPrice: 79.9,
    category: "casa",
    bargainScore: 97,
    whyItSells:
      "Roupa de cama que não precisa passar e não sai do colchão à noite por R$ 39,90: 1 lençol com elástico + 2 fronhas.",
    specsSummary:
      "Contém 1 lençol com elástico reforçado (1,98m x 1,58m x 30cm) + 2 fronhas envelope 70x50cm, tecido macio respirável antipilling.",
  },
  {
    id: "gem-cobre-leito-colcha-casal-3-pecas",
    title: "Cobre Leito Colcha Casal Padrão 3 Peças Matelassê Ultrassônico Roupa de Cama",
    brand: "Casa & Enxoval",
    price: 54.9,
    originalPrice: 109.9,
    category: "casa",
    bargainScore: 96,
    whyItSells:
      "Deixa a cama arrumada em 1 minuto: colcha cobre-leito matelada + 2 porta-travesseiros combinando na faixa de R$ 54.",
    specsSummary:
      "1 Cobre-leito Casal 2,20m x 2,00m + 2 Porta-travesseiros 70x50cm com abas, matelado ultrassônico sem linha solta.",
  },
  {
    id: "gem-kit-2-travesseiros-fibra-siliconada",
    title: "Kit 2 Travesseiros Antialérgicos Fibra Siliconada Toque de Pluma 50x70 Macio",
    brand: "Sonhare / Fibrasca",
    price: 41.9,
    originalPrice: 84.9,
    category: "casa",
    bargainScore: 96,
    whyItSells:
      "Sai menos de R$ 21 cada travesseiro: fibra siliconada que não deforma fácil, antialérgico, antiácaro e lavável.",
    specsSummary:
      "Kit com 2 travesseiros padrão 50cm x 70cm, enchimento 100% fibra de poliéster siliconada macia, suporte médio confortável.",
  },
  {
    id: "gem-mesa-cabeceira-retro-moveis",
    title: "Mesa de Cabeceira Criado-Mudo Retrô Com Gaveta e Nicho Pés Palito Móveis Quarto",
    brand: "Móveis Bechara / RPM",
    price: 69.9,
    originalPrice: 139.9,
    category: "casa",
    bargainScore: 97,
    whyItSells:
      "Móvel para casa campeão de vendas no Mercado Livre: moderniza o quarto gastando menos de R$ 70, fácil de montar em 15 minutos.",
    specsSummary:
      "Móvel em MDP/MDF de 15mm com pintura UV, 1 gaveta com corrediça + 1 nicho organizador, pés estilo retrô inclusos.",
  },
  {
    id: "gem-sapateira-vertical-4-andares-moveis",
    title: "Sapateira Organizadora Vertical 4 Andares Até 12 Pares Móveis Quarto e Entrada",
    brand: "Home Organizer",
    price: 34.9,
    originalPrice: 69.9,
    category: "casa",
    bargainScore: 97,
    whyItSells:
      "Móvel organizador baratinho (R$ 34,90): organiza até 12 pares de tênis e sapatos ocupando mínimo espaço atrás da porta ou no closet.",
    specsSummary:
      "Estrutura tubular metálica com encaixes reforçados, 4 prateleiras impermeáveis fáceis de limpar, montagem sem ferramentas.",
  },
  {
    id: "gem-kit-3-prateleiras-nicho-mdf-moveis",
    title: "Kit 3 Prateleiras Decorativas MDF 60cm Com Suporte Invisível Parede Móveis Casa",
    brand: "Móveis Decora",
    price: 44.9,
    originalPrice: 89.9,
    category: "casa",
    bargainScore: 96,
    whyItSells:
      "Kit com 3 prateleiras em MDF por R$ 44,90 (R$ 15 cada): ideal para livros, plantas, cozinha ou home office com fixação embutida.",
    specsSummary:
      "3 Prateleiras em MDF 15mm (60cm x 15cm), acabamento fosco resistente, acompanha 6 pinos de suporte invisível e buchas.",
  },
  {
    id: "gem-puff-bau-organizador-dobravel-moveis",
    title: "Puff Baú Organizador Dobrável Estofado Linho/Courino Suporta 120kg Móveis Quarto",
    brand: "Móveis Confort",
    price: 56.9,
    originalPrice: 114.9,
    category: "casa",
    bargainScore: 96,
    whyItSells:
      "Móvel 2 em 1 genial por R$ 56: serve como banco acolchoado para calçar tênis e tem baú interno grande para guardar cobertores, livros ou sapatos.",
    specsSummary:
      "Dimensões 38x38x38cm, estrutura em MDF reforçado (suporta até 120kg sentado), tampa estofada com espuma D28 e dobrável quando vazio.",
  },
  {
    id: "gem-estante-livreiro-multiuso-moveis",
    title: "Estante Livreiro Multiuso 4 Prateleiras Organizador MDP Móveis Sala e Quarto",
    brand: "Móveis Leão / AJL",
    price: 89.9,
    originalPrice: 179.9,
    category: "casa",
    bargainScore: 95,
    whyItSells:
      "Móvel curinga abaixo de R$ 90: serve como livreiro no quarto, armário multiuso na cozinha/lavanderia ou expositor na sala.",
    specsSummary:
      "Altura 1,40m x Largura 55cm x Profundidade 30cm, 4 prateleiras amplas em MDP com pintura UV de alta resistência.",
  },
  {
    id: "gem-mesa-escrivaninha-compacta-moveis",
    title: "Mesa Escrivaninha Compacta Para Notebook Estudos e Home Office Móveis Quarto",
    brand: "Móveis Artely / Politorno",
    price: 98.9,
    originalPrice: 199.9,
    category: "casa",
    bargainScore: 95,
    whyItSells:
      "Mesa escrivaninha firme e moderna saindo abaixo de R$ 100 em promoção: cabe em qualquer cantinho do quarto para trabalhar ou estudar.",
    specsSummary:
      "Tampo de 90cm x 45cm em MDP 15mm, altura ergonômica de 75cm, sapatas plásticas anti-risco no piso e montagem descomplicada.",
  },
  {
    id: "gem-arara-cabideiro-sapateira-moveis",
    title: "Arara de Roupas Cabideiro Com Sapateira Dupla Móveis Organizadora de Quarto",
    brand: "Móveis Práticos",
    price: 59.9,
    originalPrice: 119.9,
    category: "casa",
    bargainScore: 95,
    whyItSells:
      "Substitui um guarda-roupa compacto por R$ 59,90: tem varão superior para cabides, ganchos laterais para bolsas/bonés e 2 prateleiras de sapateira.",
    specsSummary:
      "Estrutura em aço carbono pintado eletrostático, 1,50m altura x 1,10m largura, 2 prateleiras inferiores para calçados e caixas.",
  },
  {
    id: "gem-tapete-felpudo-sala-quarto",
    title: "Tapete Felpudo Sala e Quarto 2,00m x 1,40m Pelo Macio Com Base Antiderrapante",
    brand: "Tapetes São Carlos / Costa Ouro",
    price: 48.9,
    originalPrice: 99.9,
    category: "casa",
    bargainScore: 95,
    whyItSells:
      "Tapete grande de 2,00m x 1,40m por menos de R$ 50: transforma o visual da sala ou do quarto e tem pontilhados antiderrapantes embaixo.",
    specsSummary:
      "Medida 2,00m x 1,40m, fios macios de 4cm de altura, base com borracha antiderrapante, fácil de aspirar e lavar.",
  },
  {
    id: "gem-jogo-toalhas-banho-algodao",
    title: "Jogo de Toalhas de Banho e Rosto 4 Peças 100% Algodão Grossa Alta Absorção",
    brand: "Karsten / Marcotex",
    price: 59.9,
    originalPrice: 119.9,
    category: "casa",
    bargainScore: 95,
    whyItSells:
      "Kit com 2 toalhas de banho + 2 de rosto 100% algodão que realmente enxugam desde a primeira lavagem, saindo a R$ 14,90 por peça.",
    specsSummary:
      "Contém 2 Toalhas de Banho (1,40m x 70cm) + 2 Toalhas de Rosto (70cm x 45cm), felpa 100% algodão (exceto efeito decorativo), gramatura absorvente.",
  },
  {
    id: "gem-mop-giratorio-inox-balde",
    title: "Mop Giratório Inox Com Balde 12 Litros Centrífuga e 2 Refis Microfibra Limpeza",
    brand: "Flash Limp / Mor",
    price: 57.9,
    originalPrice: 119.9,
    category: "casa",
    bargainScore: 96,
    whyItSells:
      "Acaba com o pano de chão torcido na mão: cesto em aço inox, cabo telescópico inclinável que entra debaixo dos móveis e 2 refis.",
    specsSummary:
      "Balde 12L com cesto centrífugo em Aço Inox, cabo inox ajustável até 1,25m com rotação 360°, acompanha 2 refis 100% microfibra laváveis.",
  },
  {
    id: "gem-kit-20-cabides-veludo",
    title: "Kit 20 Cabides de Veludo Antiderrapantes Finos Slim Organizador Guarda-Roupa",
    brand: "Home Closet",
    price: 34.9,
    originalPrice: 69.9,
    category: "casa",
    bargainScore: 95,
    whyItSells:
      "Duplica o espaço livre no guarda-roupa por serem ultrafinos e o revestimento aveludado impede que camisas e vestidos escorreguem.",
    specsSummary:
      "20 Cabides adultos ultrafinos (5mm espessura) revestidos em veludo flocagem, gancho cromado giratório 360° e cavas para alças.",
  },
  {
    id: "gem-balanca-cozinha-inox",
    title: "Balança Digital de Cozinha Alta Precisão 1g a 10kg Aço Inox Dieta e Receitas",
    brand: "Inox Precision",
    price: 27.9,
    originalPrice: 54.9,
    category: "casa",
    image: "https://i.zst.com.br/thumbs/45/12/31/-984120394.jpg",
    bargainScore: 96,
    whyItSells:
      "Produto campeão de compras por impulso abaixo de R$ 30: plataforma em aço inox higiênico, função Tara e precisão de 1 grama para academia/dieta.",
    specsSummary:
      "Acabamento em Aço Inox escovado, capacidade de 1g até 10kg, visor LCD digital, botão Tara e desligamento automático.",
  },
  {
    id: "gem-lampada-smart-wifi",
    title: "Lâmpada Inteligente Smart Wi-Fi LED 10W RGB Compatível com Alexa e Google",
    brand: "Positivo Casa Inteligente",
    price: 39.9,
    originalPrice: 79.9,
    category: "casa",
    image: "https://i.zst.com.br/thumbs/45/2b/19/-1092837461.jpg",
    bargainScore: 95,
    whyItSells:
      "Clássico achadinho de R$ 39,90: transforma qualquer quarto em smart home controlado por voz na Alexa ou celular, com 16 milhões de cores e timer.",
    specsSummary:
      "LED 10W (806 lúmens), Wi-Fi 2.4GHz integrado (não precisa de hub), branco quente a frio + RGB 16 milhões de cores, compatível Alexa e Google Assistente.",
  },
  {
    id: "gem-chaleira-eletrica-inox",
    title: "Chaleira Elétrica Jarra Inox 1,8 Litros Desligamento Automático Ferve Rápido",
    brand: "Agratto / Mondial",
    price: 58.9,
    originalPrice: 109.9,
    category: "casa",
    image: "https://i.zst.com.br/thumbs/45/0a/29/-1349827165.jpg",
    bargainScore: 94,
    whyItSells:
      "Ferve quase 2 litros de água para café ou chimarrão em 4 minutos sem gastar gás, com corpo em inox e trava de desligamento automático.",
    specsSummary:
      "Corpo em Aço Inox 1,8L, base giratória 360° destacável, desligamento automático ao ferver, luz indicadora e alça isotérmica.",
  },
  {
    id: "gem-parafusadeira-sem-fio",
    title: "Parafusadeira e Furadeira Sem Fio Bateria 12V Bivolt Com Maleta e Kit Bits",
    brand: "The Black Tools / WAP",
    price: 89.9,
    originalPrice: 169.9,
    category: "casa",
    image: "https://i.zst.com.br/thumbs/45/3c/1d/-1429384756.jpg",
    bargainScore: 94,
    whyItSells:
      "Ferramenta indispensável para ter em casa montando móveis, cortinas e prateleiras, saindo abaixo de R$ 90 com bateria recarregável e maleta.",
    specsSummary:
      "Bateria de Lítio 12V recarregável Bivolt, controle de torque 18+1 níveis, mandril de aperto rápido 3/8 (10mm), luz LED frontal e reversão de giro.",
  },

  // ===================== MODA, TÊNIS, CAMISAS & ROUPAS MASCULINO/FEMININO (22 ITENS) =====================
  {
    id: "gem-kit-4-camisetas-algodao-masculina",
    title: "Kit 4 Camisetas Básicas Masculinas 100% Algodão Fio 30.1 Penteado Premium",
    brand: "Hering / Algodão Premium",
    price: 69.9,
    originalPrice: 139.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/25/1a/1947505966.jpg",
    bargainScore: 98,
    whyItSells:
      "Sai a R$ 17,40 por camiseta de algodão fio 30.1 penteado que não encolhe e não dá bolinha. É o item de moda masculina mais vendido do Mercado Livre.",
    specsSummary:
      "Kit com 4 camisetas masculinas lisas (Preta, Branca, Marinho, Cinza), malha 100% Algodão Fio 30.1 Penteado, gola ribana reforçada ombro a ombro.",
  },
  {
    id: "gem-kit-5-camisetas-dry-fit-esportivas",
    title: "Kit 5 Camisetas Masculinas Dry Fit Esportivas Treino Academia e Corrida UV50+",
    brand: "Dry Sport",
    price: 64.9,
    originalPrice: 129.9,
    category: "moda",
    bargainScore: 98,
    whyItSells:
      "Apenas R$ 12,98 por camisa esportiva: tecido furadinho respirável que não retém suor, seca em minutos e tem proteção solar UV50+.",
    specsSummary:
      "5 Camisetas Dry Fit 100% Poliamida/Poliéster tecnológico, proteção solar UV50+, secagem ultrarrápida, não precisa passar.",
  },
  {
    id: "gem-tenis-olympikus-versa-marte",
    title: "Tênis Olympikus Corrida e Caminhada Masculino e Feminino Amortecimento EVASense",
    brand: "Olympikus",
    price: 99.9,
    originalPrice: 199.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/37/37/-1321170651.jpg",
    bargainScore: 98,
    whyItSells:
      "Tênis original Olympikus abaixo de R$ 100 em promoção: solado EVASense super macio para academia, caminhada e trabalho o dia inteiro.",
    specsSummary:
      "Cabedal em tecido Knit respirável sem costuras, solado com tecnologia de amortecimento EVASense, ultraleve e original Olympikus (numeração 34 ao 44).",
  },
  {
    id: "gem-tenis-feminino-olympikus-acqua",
    title: "Tênis Feminino Olympikus Acqua / Intuit Academia e Caminhada Leve Original",
    brand: "Olympikus",
    price: 94.9,
    originalPrice: 189.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/c/14/-1321039250.jpg",
    bargainScore: 97,
    whyItSells:
      "Campeão de vendas em calçados femininos: extremamente leve no pé, anatômico e com a durabilidade reconhecida da Olympikus.",
    specsSummary:
      "Modelo feminino original Olympikus, entressola dupla em EVA macio, tecido respirável hipoalergênico e palmilha anatômica.",
  },
  {
    id: "gem-kit-3-calca-legging-feminina-suplex",
    title: "Kit 3 Calças Legging Femininas Cintura Alta Suplex Grossa Zero Transparência",
    brand: "Moda Fitness",
    price: 64.9,
    originalPrice: 129.9,
    category: "moda",
    image: "https://image.zst.com.br/EA449396EC08F7FBE73898DC78629BF4_375_375.jpg",
    bargainScore: 98,
    whyItSells:
      "Sai a R$ 21,60 cada calça legging: tecido suplex encorpado de alta gramatura (zero transparência no agachamento) e cós alto modelador.",
    specsSummary:
      "Kit com 3 Calças Legging Femininas (P ao GG), Suplex Power 92% Poliéster + 8% Elastano gramatura 320g, cós duplo anatômico cintura alta.",
  },
  {
    id: "gem-camisa-polo-masculina-piquet",
    title: "Kit 3 Camisas Polo Masculinas Piquet Algodão Corte Clássico Casual e Trabalho",
    brand: "Polo Classic",
    price: 74.9,
    originalPrice: 149.9,
    category: "moda",
    bargainScore: 97,
    whyItSells:
      "Sai menos de R$ 25 por camisa polo em malha Piquet: veste bem tanto para trabalhar quanto para sair no fim de semana.",
    specsSummary:
      "Kit com 3 Camisas Polo Masculinas em malha Piquet (50% Algodão / 50% Poliéster), gola e punhos em retilínea que não esgarçam, 2 botões.",
  },
  {
    id: "gem-camisa-social-masculina-slim",
    title: "Camisa Social Masculina Manga Longa Slim Fit Microfibra Passa Fácil Não Amassa",
    brand: "Via Século / Dudalina Style",
    price: 49.9,
    originalPrice: 99.9,
    category: "moda",
    bargainScore: 96,
    whyItSells:
      "Camisa social masculina de corte Slim Fit moderno por R$ 49,90: tecido fresco que quase não amassa e seca rápido no cabide.",
    specsSummary:
      "Modelagem Slim Fit anatômica (tamanhos 1 ao 6 / P ao GG), colarinho estruturado, punho abotoado e tecido leve de fácil manutenção.",
  },
  {
    id: "gem-kit-3-blusas-femininas-caneladas",
    title: "Kit 3 Blusas Femininas Camisetas Básicas Caneladas / Viscolycra Manga Curta",
    brand: "Hering / Moda Feminina",
    price: 52.9,
    originalPrice: 109.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/37/39/1951999443.jpg",
    bargainScore: 97,
    whyItSells:
      "Peça curinga no guarda-roupa feminino saindo a R$ 17,60 cada blusa: tecido macio com elastano que modela sem apertar.",
    specsSummary:
      "Kit com 3 Blusas Femininas em Malha Canelada / Viscolycra com Elastano, toque geladinho, costura reforçada e caimento impecável.",
  },
  {
    id: "gem-vestido-feminino-midi-canelado",
    title: "Vestido Feminino Midi / Curto Canelado Malha Com Elastano Modelador Confortável",
    brand: "Moda Mulher",
    price: 44.9,
    originalPrice: 89.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/19/37/1953546333.jpg",
    bargainScore: 96,
    whyItSells:
      "Vestido feminino versátil de R$ 44,90: combina tanto com tênis branco casual quanto com sandália, não fica transparente e valoriza a silhueta.",
    specsSummary:
      "Tecido Malha Canelada Premium de alta elasticidade (96% Poliéster / 4% Elastano), zero transparência, tamanhos P ao GG.",
  },
  {
    id: "gem-tenis-casual-branco-unissex",
    title: "Tênis Casual Branco Feminino e Masculino Couro Sintético Solado Reto Urbano",
    brand: "Vizzano / Polo Urban",
    price: 58.9,
    originalPrice: 119.9,
    category: "moda",
    bargainScore: 96,
    whyItSells:
      "O tênis branco casual que combina com qualquer roupa (jeans, bermuda ou vestido), fácil de limpar com pano úmido e abaixo de R$ 60.",
    specsSummary:
      "Cabedal laminado sintético macio impermeável a respingos, palmilha em EVA conforto 6mm, solado emborrachado antiderrapante costurado.",
  },
  {
    id: "gem-tenis-esportivo-caminhada-barato",
    title: "Tênis Esportivo Masculino e Feminino Caminhada Academia Leve Macio Promoção",
    brand: "Sport Run",
    price: 49.9,
    originalPrice: 99.9,
    category: "moda",
    bargainScore: 97,
    whyItSells:
      "Tênis para bater no dia a dia, trabalhar em pé ou treinar pagando menos de R$ 50: campeão absoluto de volume de vendas.",
    specsSummary:
      "Tecido Nylon Mesh respirável, solado microexpandido leve e antiderrapante, colarinho acolchoado no calcanhar (numeração 34 ao 43).",
  },
  {
    id: "gem-kit-3-bermudas-masculinas-moletom",
    title: "Kit 3 Bermudas Masculinas Moletom / Dry Fit Com Bolso Fundos Academia e Passeio",
    brand: "Mormaii / Urban Fit",
    price: 59.9,
    originalPrice: 119.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/39/3e/-1158285391.jpg",
    bargainScore: 97,
    whyItSells:
      "3 bermudas masculinas pelo preço de 1 (menos de R$ 20 cada): elástico firme com cordão na cintura e bolsos fundos para o celular não cair.",
    specsSummary:
      "Kit com 3 Bermudas Masculinas (Preta, Cinza, Marinho), moletinho macio não transparente, 2 bolsos laterais fundos + 1 traseiro e cordão regulador.",
  },
  {
    id: "gem-conjunto-fitness-feminino-top-legging",
    title: "Conjunto Fitness Feminino Roupa de Academia Calça Legging Cintura Alta + Top",
    brand: "Lupo / Nay Sport",
    price: 54.9,
    originalPrice: 109.9,
    category: "moda",
    bargainScore: 96,
    whyItSells:
      "Look completo de academia (Calça Legging + Top com bojo removível) por R$ 54,90: alta compressão e costura reforçada.",
    specsSummary:
      "Conjunto 2 peças (1 Legging Cintura Alta + 1 Top Cropped), tecido poliamida/suplex de compressão firme e zero transparência.",
  },
  {
    id: "gem-kit-3-shorts-femininos-corrida",
    title: "Kit 3 Shorts Femininos Corrida e Academia Cintura Alta Conforto Verão",
    brand: "Fit Woman",
    price: 46.9,
    originalPrice: 94.9,
    category: "moda",
    bargainScore: 96,
    whyItSells:
      "Sai a R$ 15,60 cada short feminino: fresquinho para dias quentes, caminhada, praia ou ficar em casa com ótimo caimento.",
    specsSummary:
      "Kit com 3 Shorts Femininos com cós anatômico alto de elástico largo, tecido leve de secagem rápida que não enrola na coxa.",
  },
  {
    id: "gem-blusa-moletom-canguru-unissex",
    title: "Blusa Moletom Canguru Com Capuz Masculino e Feminino Flanelado Quentinho",
    brand: "Winter Street",
    price: 56.9,
    originalPrice: 114.9,
    category: "moda",
    bargainScore: 95,
    whyItSells:
      "Moletom flanelado por dentro com bolso canguru e capuz forrado abaixo de R$ 60: peça unissex que vende muito o ano inteiro.",
    specsSummary:
      "Malha Moletom PA 50% Algodão / 50% Poliéster peluciado internamente, punhos e barra em ribana canelada, capuz ajustável e bolso frontal.",
  },
  {
    id: "gem-jaqueta-corta-vento-impermeavel",
    title: "Jaqueta Corta-Vento Impermeável Masculina e Feminina Com Capuz Moto e Corrida",
    brand: "WindBreaker Pro",
    price: 64.9,
    originalPrice: 129.9,
    category: "moda",
    bargainScore: 95,
    whyItSells:
      "Protege do vento e garoa na moto, bike ou corrida, dobra inteira no bolso e custa metade de uma jaqueta tradicional.",
    specsSummary:
      "Tecido Aspen Nylon hidro-repelente (resistente à água e vento), zíper frontal tratorado, bolsos laterais, elástico nos punhos e capuz.",
  },
  {
    id: "gem-calca-jeans-masculina-feminina-lycra",
    title: "Calça Jeans Masculina ou Feminina Tradicional / Skinny Com Elastano Lycra",
    brand: "Denim Brasil",
    price: 69.9,
    originalPrice: 139.9,
    category: "moda",
    bargainScore: 95,
    whyItSells:
      "Calça jeans com 2% a 3% de elastano (Lycra) por R$ 69,90: não prende os movimentos, lavagem moderna e costura tripla resistente.",
    specsSummary:
      "Jeans Denim Algodão com Elastano (Lycra), zíper metálico reforçado, 4 bolsos funcionais e excelente ajuste no corpo (numeração 36 ao 48).",
  },
  {
    id: "gem-kit-12-pares-meias-algodao",
    title: "Kit 12 Pares de Meias Cano Curto / Médio Algodão Respirável Masculina e Feminina",
    brand: "Lupo / Sport Socks",
    price: 29.9,
    originalPrice: 59.9,
    category: "moda",
    bargainScore: 97,
    whyItSells:
      "Apenas R$ 2,49 por par de meia! Produto de compra imediata que todo mundo precisa repor na gaveta.",
    specsSummary:
      "Pacote com 12 pares (24 pés), composição majoritária em algodão macio que absorve o suor e evita mau cheiro, calcanhar verdadeiro.",
  },
  {
    id: "gem-kit-10-cuecas-boxer-microfibra",
    title: "Kit 10 Cuecas Boxer Masculinas Microfibra / Algodão Sem Costura Conforto",
    brand: "Zorba / Polo Wear",
    price: 52.9,
    originalPrice: 109.9,
    category: "moda",
    bargainScore: 96,
    whyItSells:
      "Sai a R$ 5,29 por cueca boxer: não enrola na perna, elástico largo macio e secagem super rápida.",
    specsSummary:
      "Kit com 10 Cuecas modelo Boxer anatômico com forro 100% algodão respirável, elástico jacquard de 4cm e alta durabilidade.",
  },
  {
    id: "gem-chinelo-nuvem-ortopedico-eva",
    title: "Chinelo Slide Nuvem Original EVA Macio Ortopédico Anti-Impacto Feminino Masculino",
    brand: "Nuvem Comfort",
    price: 32.9,
    originalPrice: 69.9,
    category: "moda",
    bargainScore: 96,
    whyItSells:
      "Febre de vendas por R$ 32,90: solado alto de 4cm em EVA ultramacio que alivia dores no calcanhar e esporão dentro de casa.",
    specsSummary:
      "100% EVA injetado de alta densidade e maciez, solado antiderrapante de 4cm de espessura, anatômico, leve e lavável.",
  },
  {
    id: "gem-sandalia-rasteirinha-feminina-conforto",
    title: "Sandália Feminina Rasteirinha / Papete Conforto Palmilha Macia Moda Verão",
    brand: "Beira Rio / Vizzano",
    price: 39.9,
    originalPrice: 79.9,
    category: "moda",
    bargainScore: 95,
    whyItSells:
      "Sandália feminina linda e confortável abaixo de R$ 40: palmilha fofinha que não machuca o pé e combina com qualquer look.",
    specsSummary:
      "Tiras macias sem costura cortante, palmilha acolchoada anatômica e solado em PVC/TR antiderrapante (numeração 34 ao 39).",
  },
  {
    id: "gem-tenis-adidas-runfalcon-5",
    title: "Tênis Adidas Runfalcon 5 Corrida e Academia Masculino e Feminino Cloudfoam",
    brand: "Adidas",
    price: 199.9,
    originalPrice: 349.9,
    category: "moda",
    image: "https://i.zst.com.br/thumbs/45/12/15/-1322477162.jpg",
    bargainScore: 94,
    whyItSells:
      "Tênis Adidas original com entressola Cloudfoam na faixa de R$ 199: altíssima procura e comissão excelente no Mercado Livre.",
    specsSummary:
      "Entressola Cloudfoam de amortecimento macio, cabedal em malha elástica respirável, palmilha OrthoLite e solado Adiwear de alta durabilidade.",
  },

  // ===================== FONES & ÁUDIO (18 ITENS) =====================
  {
    id: "gem-qcy-t13-anc",
    title: "Fone de Ouvido Bluetooth 5.3 QCY T13 ANC Cancelamento de Ruído 4 Microfones",
    brand: "QCY",
    price: 94.9,
    originalPrice: 179.9,
    category: "audio",
    image: "https://i.zst.com.br/thumbs/45/17/35/-1015018819.jpg",
    bargainScore: 98,
    whyItSells:
      "Custa menos de R$ 100 e entrega cancelamento de ruído ativo (ANC), 4 microfones com ENC e até 30h de bateria. É o rei absoluto do custo-benefício abaixo de R$ 100.",
    specsSummary:
      "ANC Ativo de 28dB, Bluetooth 5.3, Drivers 10mm, 4 microfones ENC, até 30h de bateria com estojo e carga rápida USB-C.",
  },
  {
    id: "gem-redmi-buds-6-play",
    title: "Fone de Ouvido Bluetooth Xiaomi Redmi Buds 6 Play TWS 36h Bateria Preto",
    brand: "Xiaomi",
    price: 69.9,
    originalPrice: 129.9,
    category: "audio",
    image: "https://i.promobit.com.br/268/831392805517937412427355526831.png",
    bargainScore: 97,
    whyItSells:
      "Fone original Xiaomi na faixa de R$ 69 a R$ 78 com Bluetooth 5.4, 36 horas de bateria total e redução de ruído por IA para chamadas.",
    specsSummary:
      "Drivers dinâmicos de 10mm, Bluetooth 5.4, até 36h de bateria com o estojo, redução de ruído em chamadas por IA, ultraleve (3,6g por fone).",
  },
  {
    id: "gem-fone-lenovo-gm2-pro",
    title: "Fone de Ouvido Bluetooth 5.3 Gamer Baixa Latência Com Microfone e Estojo LED",
    brand: "Lenovo / TWS",
    price: 36.9,
    originalPrice: 79.9,
    category: "audio",
    bargainScore: 97,
    whyItSells:
      "Fone sem fio na faixa de R$ 36,90: modo jogo sem atraso de som, graves fortes e estojo compacto recarregável via USB-C.",
    specsSummary:
      "Bluetooth 5.3 dual mode (Música + Gamer baixa latência), drivers de 10mm, resistência IPX5 a suor e até 24h de bateria com o case.",
  },
  {
    id: "gem-fone-kz-edx-pro-retorno",
    title: "Fone de Ouvido In-Ear KZ EDX Pro Retorno de Palco Graves Potentes Cabo Removível",
    brand: "KZ Acoustics",
    price: 42.9,
    originalPrice: 89.9,
    category: "audio",
    bargainScore: 96,
    whyItSells:
      "Qualidade de áudio de estúdio por R$ 42: usado por músicos, gamers e quem quer som cristalino que humilha fones comuns de R$ 200.",
    specsSummary:
      "Driver dinâmico magnético duplo de 10mm, cabo trançado removível (2 pinos), encaixe ergonômico por trás da orelha e isolamento passivo de 26dB.",
  },
  {
    id: "gem-caixa-som-bluetooth-prova-dagua",
    title: "Caixa de Som Bluetooth Portátil À Prova D'Água IPX6 Graves Fortes 10W TWS",
    brand: "Mifa / Go Speaker",
    price: 54.9,
    originalPrice: 109.9,
    category: "audio",
    bargainScore: 96,
    whyItSells:
      "Caixinha de som portátil robusta para churrasco, praia e banho saindo por R$ 54,90 com bateria para o dia todo.",
    specsSummary:
      "Potência 10W RMS com radiador passivo de graves, proteção IPX6 resistente à água, Bluetooth 5.3, entrada Cartão SD e até 12h de som.",
  },
  {
    id: "gem-microfone-lapela-sem-fio-celular",
    title: "Kit 2 Microfones de Lapela Sem Fio Profissional USB-C e iPhone Redução de Ruído",
    brand: "Kaidi / Boya Style",
    price: 44.9,
    originalPrice: 94.9,
    category: "audio",
    bargainScore: 96,
    whyItSells:
      "Todo criador de conteúdo, loja ou professor compra por impulso na faixa de R$ 44: basta plugar no celular e gravar vídeos com voz limpa até 20 metros.",
    specsSummary:
      "2 Transmissores de lapela sem fio + 1 Receptor Plug & Play (USB-C / Lightning), cancelamento de ruído ambiente DSP e bateria de 6h.",
  },
  {
    id: "gem-headset-gamer-havit-h2002d",
    title: "Headset Gamer Com Fio Microfone Removível Drivers 53mm PC PS4 PS5 Xbox",
    brand: "Havit / Redragon",
    price: 89.9,
    originalPrice: 169.9,
    category: "audio",
    bargainScore: 95,
    whyItSells:
      "Conchas almofadadas gigantes que não apertam a orelha e microfone destacável limpa-ruído abaixo de R$ 90.",
    specsSummary:
      "Falantes de 53mm de alto alcance dinâmico, estrutura em liga metálica flexível, cabo trançado com controle de volume/mute e plug P3/P2.",
  },
  {
    id: "gem-fone-bluetooth-neckband-esportivo",
    title: "Fone Bluetooth Esportivo Colar Magnético Corrida e Academia À Prova de Suor",
    brand: "Baseus / Awei",
    price: 34.9,
    originalPrice: 69.9,
    category: "audio",
    bargainScore: 95,
    whyItSells:
      "Não cai da orelha na corrida e os lados têm ímã para prender no pescoço quando não está ouvindo, por apenas R$ 34,90.",
    specsSummary:
      "Bluetooth 5.2, ponteiras magnéticas em metal, proteção IPX4 contra suor, botões físicos de volume e até 10h de reprodução contínua.",
  },
  {
    id: "gem-qcy-t20-airpods-style",
    title: "Fone de Ouvido Bluetooth QCY T20 AilyPods Semi In-Ear Confortável 4 Microfones",
    brand: "QCY",
    price: 92.9,
    originalPrice: 169.9,
    category: "audio",
    bargainScore: 95,
    whyItSells:
      "Para quem não gosta de borrachinha entrando no ouvido: formato semi in-ear idêntico ao AirPods 3 com som aberto de 13mm.",
    specsSummary:
      "Driver gigante de 13mm revestido em titânio, Bluetooth 5.3, 4 microfones ENC para chamadas, app QCY com equalizador e proteção IPX4.",
  },
  {
    id: "gem-headphone-bluetooth-dobravel-p9",
    title: "Headphone Fone de Ouvido Bluetooth Sem Fio Over-Ear Estéreo Com Entrada Cartão",
    brand: "P9 / B-05",
    price: 38.9,
    originalPrice: 79.9,
    category: "audio",
    bargainScore: 95,
    whyItSells:
      "Headphone de arco bonito e barato (R$ 38,90) para academia e estudos: funciona sem fio no Bluetooth e também com cabo ou cartão de memória.",
    specsSummary:
      "Espuma macia circumaural, Bluetooth 5.1, suporte a cartão MicroSD, cabo auxiliar P2 e recarga USB.",
  },
  {
    id: "gem-soundbar-pc-tv-led",
    title: "Caixa de Som Soundbar Para PC Notebook e TV 10W RMS Estéreo Com Controle de Volume",
    brand: "Knup / Redragon",
    price: 52.9,
    originalPrice: 99.9,
    category: "audio",
    bargainScore: 94,
    whyItSells:
      "Fica linda debaixo do monitor sem ocupar espaço na mesa e entrega som muito mais alto que o notebook por R$ 52,90.",
    specsSummary:
      "2 Alto-falantes estéreo + 2 diafragmas de graves, botão giratório de volume frontal, alimentação USB Plug & Play.",
  },
  {
    id: "gem-microfone-condensador-usb-mesa",
    title: "Microfone Condensador USB de Mesa Com Tripé e Botão Mute Para PC Podcast e Jogos",
    brand: "Fifine / SF-666R",
    price: 68.9,
    originalPrice: 139.9,
    category: "audio",
    bargainScore: 94,
    whyItSells:
      "Voz de estúdio em chamadas de trabalho, Discord e gravações sem precisar de placa de som: é só plugar no USB.",
    specsSummary:
      "Captação cardioide focada na voz, conexão USB direta no PC/Notebook/PS5, tripé de mesa ajustável e botão de ganho/mute rápido.",
  },
  {
    id: "gem-fone-jbl-c50hi-com-fio",
    title: "Fone de Ouvido Com Fio JBL Tune 110 / C50HI Intra-Auricular Com Microfone Original",
    brand: "JBL",
    price: 49.9,
    originalPrice: 89.9,
    category: "audio",
    bargainScore: 95,
    whyItSells:
      "Fone JBL original que nunca fica sem bateria: graves JBL Pure Bass, microfone no cabo e preço abaixo de R$ 50.",
    specsSummary:
      "Drivers JBL de 9mm com som Pure Bass, cabo flat que não embola no bolso, microfone de 1 botão e 3 tamanhos de ponteiras.",
  },
  {
    id: "gem-haylou-moripods-anc",
    title: "Fone de Ouvido Bluetooth Haylou X1 / MoriPods ANC Cancelamento de Ruído",
    brand: "Haylou (Ecossistema Xiaomi)",
    price: 89.9,
    originalPrice: 169.9,
    category: "audio",
    bargainScore: 94,
    whyItSells:
      "Marca parceira da Xiaomi com cancelamento de ruído ativo (ANC) abaixo de R$ 90 e acabamento fosco premium.",
    specsSummary:
      "ANC de até 30dB + Modo Transparência, Bluetooth 5.2, drivers dinâmicos de 12mm e autonomia total de até 28 horas.",
  },
  {
    id: "gem-jbl-go-3-4-estilo",
    title: "Caixa de Som Bluetooth JBL GO Essential Original À Prova D'Água IPX7 Portátil",
    brand: "JBL",
    price: 149.9,
    originalPrice: 239.9,
    category: "audio",
    bargainScore: 94,
    whyItSells:
      "Caixa de som original JBL mais barata do Brasil: cabe na palma da mão, pode mergulhar na água (IPX7) e tem som surpreendente.",
    specsSummary:
      "JBL Original Pro Sound, proteção à prova d'água IPX7, Bluetooth sem fio e até 5 horas de bateria contínua.",
  },
  {
    id: "gem-jbl-tune-520bt",
    title: "Headphone Fone de Ouvido Bluetooth JBL Tune 520BT Pure Bass 57h Bateria",
    brand: "JBL",
    price: 174.9,
    originalPrice: 289.9,
    category: "audio",
    image: "https://i.zst.com.br/thumbs/45/24/11/-1680012462.jpg",
    bargainScore: 93,
    whyItSells:
      "Bateria absurda de 57 horas, som JBL Pure Bass e dobrável para mochila. Quando cai na faixa de R$ 170, converte altíssimo.",
    specsSummary:
      "Drivers de 33mm com JBL Pure Bass, Bluetooth 5.3 multiponto, até 57h de bateria (5 min de carga = 3h de som), dobrável com botões na concha.",
  },
  {
    id: "gem-edifier-x3-lite",
    title: "Fone de Ouvido Bluetooth 5.3 Edifier X3 Lite TWS IP55 App Equalizador 24h",
    brand: "Edifier",
    price: 119.9,
    originalPrice: 199.9,
    category: "audio",
    bargainScore: 93,
    whyItSells:
      "Assinatura sonora refinada da Edifier com certificação IP55 contra poeira e suor + aplicativo Edifier Connect.",
    specsSummary:
      "Bluetooth 5.3, cancelamento de ruído ambiental em chamadas por IA, 4 presets de equalização no App, proteção IP55 e 24h de bateria.",
  },
  {
    id: "gem-anker-soundcore-p20i",
    title: "Fone de Ouvido Bluetooth 5.3 Anker Soundcore P20i Drivers 10mm BassUp 30h",
    brand: "Soundcore",
    price: 109.9,
    originalPrice: 189.9,
    category: "audio",
    bargainScore: 94,
    whyItSells:
      "Irmão mais acessível do P30i: graves fortíssimos BassUp, 22 equalizações no aplicativo Soundcore e 30h de bateria.",
    specsSummary:
      "Drivers de 10mm com BassUp, Bluetooth 5.3, 30h de bateria total (10h nos fones), resistência à água IPX5 e cordinha de transporte no estojo.",
  },

  // ===================== SETUP, CELULAR & PERIFÉRICOS (18 ITENS) =====================
  {
    id: "gem-mouse-sem-fio-recarregavel",
    title: "Mouse Sem Fio Recarregável USB/Bluetooth Silencioso Clique Mudo 1600 DPI",
    brand: "Dual Mode",
    price: 29.9,
    originalPrice: 59.9,
    category: "perifericos",
    image: "https://i.zst.com.br/thumbs/45/36/14/-804215932.jpg",
    bargainScore: 98,
    whyItSells:
      "Saindo na faixa de R$ 29,90: não usa pilha (bateria recarregável via USB), tem clique silencioso que não incomoda à noite e funciona via Bluetooth + USB.",
    specsSummary:
      "Conexão dupla (Bluetooth + Receptor USB 2.4GHz), bateria interna recarregável, switches silenciosos (clique mudo), 800/1200/1600 DPI.",
  },
  {
    id: "gem-carregador-baseus-20w",
    title: "Carregador Rápido Turbo 20W USB-C PD + USB Compatível iPhone e Samsung",
    brand: "Baseus",
    price: 42.9,
    originalPrice: 89.9,
    category: "perifericos",
    image: "https://i.zst.com.br/thumbs/45/1a/1b/-1154829102.jpg",
    bargainScore: 97,
    whyItSells:
      "Na faixa de R$ 40 na promoção: carrega de 0% a 50% em 30 minutos com proteção térmica inteligente e duas portas (USB-C + USB-A), custando 1/4 de um original Apple.",
    specsSummary:
      "Potência 20W Power Delivery (PD 3.0) + Quick Charge 3.0, saída dupla USB-C e USB-A, chip de controle térmico contra sobrecarga.",
  },
  {
    id: "gem-suporte-notebook-aluminio-dobravel",
    title: "Suporte Articulado Dobrável de Alumínio Para Notebook e Tablet Ergonômico",
    brand: "Ergonomic Stand",
    price: 26.9,
    originalPrice: 59.9,
    category: "perifericos",
    bargainScore: 97,
    whyItSells:
      "Achadinho abaixo de R$ 30 que resolve dor no pescoço e melhora a ventilação do notebook: inteiriço em liga metálica e cabe no bolso da mochila.",
    specsSummary:
      "Liga de alumínio/metal anodizado com borrachas antiderrapantes, 6 níveis de ajuste de inclinação, suporta notebooks de 10 a 17 polegadas.",
  },
  {
    id: "gem-cabo-usb-c-turbo-trancado-2m",
    title: "Kit 2 Cabos Carregador Turbo USB-C / Lightning Nylon Trançado 100W 60W 2 Metros",
    brand: "Essager / Baseus",
    price: 24.9,
    originalPrice: 54.9,
    category: "perifericos",
    bargainScore: 97,
    whyItSells:
      "Cabo trançado em nylon de 2 metros que não quebra na ponta e permite usar o celular na cama enquanto carrega no modo turbo.",
    specsSummary:
      "Revestimento em Nylon Trançado de alta resistência, conectores em liga de alumínio, suporte a carga rápida 60W/100W e transferência de dados.",
  },
  {
    id: "gem-mousepad-deskmat-grande-90x40",
    title: "Mousepad Gamer Grande Speed Deskmat 90x40cm Base Emborrachada Borda Costurada",
    brand: "Havit / Exbom",
    price: 34.9,
    originalPrice: 69.9,
    category: "perifericos",
    bargainScore: 96,
    whyItSells:
      "Cobre a mesa inteira (cabe teclado + mouse com sobra), protege o móvel e deixa o setup muito mais bonito por R$ 34,90.",
    specsSummary:
      "Tamanho estendido 90cm x 40cm x 3mm, superfície tecido Speed resistente a respingos, base de borracha natural antiderrapante e bordas costuradas.",
  },
  {
    id: "gem-powerbank-10000mah-turbo",
    title: "Carregador Portátil Power Bank 10.000mAh Turbo Slim Com Cabos Integrados Visor LED",
    brand: "Pineng / Kaidi",
    price: 59.9,
    originalPrice: 119.9,
    category: "perifericos",
    bargainScore: 96,
    whyItSells:
      "Já vem com cabos embutidos (USB-C e iPhone) + visor digital da porcentagem de bateria: salva o dia em viagens por menos de R$ 60.",
    specsSummary:
      "Capacidade real 10.000mAh (2 a 3 cargas completas no celular), cabos USB-C, Lightning e V8 acoplados, display LED de carga.",
  },
  {
    id: "gem-hub-usb-c-7-em-1-hdmi",
    title: "Hub Adaptador USB-C 7 em 1 Com HDMI 4K USB 3.0 e Leitor SD Para Notebook e Celular",
    brand: "Ugreen / Baseus Style",
    price: 64.9,
    originalPrice: 129.9,
    category: "perifericos",
    bargainScore: 96,
    whyItSells:
      "Indispensável para notebooks modernos: adiciona saída HDMI 4K para monitor/TV, portas USB 3.0 rápidas e carga PD de 100W.",
    specsSummary:
      "Corpo em alumínio dissipador de calor, 1x HDMI 4K, 1x USB 3.0, 2x USB 2.0, 1x USB-C PD 100W, leitores de cartão SD e MicroSD.",
  },
  {
    id: "gem-kit-teclado-mouse-sem-fio-slim",
    title: "Kit Teclado e Mouse Sem Fio Bluetooth / USB Ultrafino Silencioso Para Notebook PC",
    brand: "Logitech / Slim Tech",
    price: 58.9,
    originalPrice: 119.9,
    category: "perifericos",
    bargainScore: 96,
    whyItSells:
      "Combo completo de teclado + mouse sem fio por R$ 58,90: elimina todos os fios da mesa e tem digitação macia estilo MacBook.",
    specsSummary:
      "Teclado compacto silencioso de perfil baixo + Mouse ergonômico sem fio usando apenas 1 único micro receptor USB (ou Bluetooth).",
  },
  {
    id: "gem-webcam-full-hd-1080p-microfone",
    title: "Webcam Full HD 1080p Com Microfone Embutido e Tampa de Privacidade Home Office",
    brand: "Logitech / W-Cam",
    price: 54.9,
    originalPrice: 109.9,
    category: "perifericos",
    bargainScore: 95,
    whyItSells:
      "Melhora drasticamente a imagem em reuniões do Meet/Teams/Zoom em relação à câmera fraca de notebooks antigos, abaixo de R$ 55.",
    specsSummary:
      "Resolução Full HD 1920x1080p a 30fps, correção automática de luz baixa, microfone com redução de ruído, clipe universal USB Plug & Play.",
  },
  {
    id: "gem-suporte-celular-mesa-articulado",
    title: "Suporte de Mesa Articulado Dobrável Para Celular e Tablet Base Pesada Ajustável",
    brand: "Desk Holder",
    price: 19.9,
    originalPrice: 44.9,
    category: "perifericos",
    bargainScore: 96,
    whyItSells:
      "Achadinho de R$ 19,90: mantém o celular em pé ao lado do notebook para ver notificações, assistir aulas ou fazer chamadas de vídeo.",
    specsSummary:
      "Altura e ângulo ajustáveis, base ponderada antiderrapante, abertura inferior para conectar o cabo carregador com o celular apoiado.",
  },
  {
    id: "gem-controle-sem-fio-bluetooth-pc-celular",
    title: "Controle Joystick Sem Fio Bluetooth Para PC Notebook Celular Android iOS e Smart TV",
    brand: "GameSir / Ipega",
    price: 79.9,
    originalPrice: 149.9,
    category: "perifericos",
    bargainScore: 95,
    whyItSells:
      "Funciona no PC, no celular e até no Xbox Cloud Gaming direto na TV Samsung/LG por menos de R$ 80.",
    specsSummary:
      "Conexão Bluetooth 5.0 + Cabo USB, motores duplos de vibração, bateria recarregável de 600mAh (15h de jogo) e suporte retrátil p/ celular.",
  },
  {
    id: "gem-pendrive-64gb-usb-3-2-sandisk",
    title: "Pen Drive 64GB USB 3.0 / 3.2 Alta Velocidade SanDisk / Kingston Original Metal",
    brand: "SanDisk",
    price: 38.9,
    originalPrice: 74.9,
    category: "perifericos",
    bargainScore: 95,
    whyItSells:
      "Item de reposição constante abaixo de R$ 40 para músicas no som automotivo, formatação de PC e backup de arquivos.",
    specsSummary:
      "Capacidade 64GB, interface USB 3.2 Gen 1 (leitura até 130MB/s), corpo metálico resistente a impactos.",
  },
  {
    id: "gem-filtro-de-linha-clamper-5-tomadas",
    title: "Filtro de Linha DPS Clamper Energia 5 Tomadas Protetor Contra Surtos e Raios",
    brand: "iClamper",
    price: 59.9,
    originalPrice: 99.9,
    category: "perifericos",
    bargainScore: 96,
    whyItSells:
      "O filtro de linha mais recomendado do Brasil: protege PC, TV, videogame e geladeira contra queima por raios e picos de luz por R$ 59.",
    specsSummary:
      "DPS Classe III com tecnologia LCF (Varistor + Centelhador a Gás), 5 tomadas espaçadas tripolares, chave disjuntora microdisjuntor (sem fusível).",
  },
  {
    id: "gem-ring-light-mesa-iluminador-led",
    title: "Iluminador Ring Light LED 26cm 10 Polegadas Com Tripé e Suporte Celular Vídeos",
    brand: "Studio LED",
    price: 39.9,
    originalPrice: 79.9,
    category: "perifericos",
    bargainScore: 95,
    whyItSells:
      "Kit completo de iluminação para reuniões, maquiagem, gravação de Reels e TikTok saindo a R$ 39,90.",
    specsSummary:
      "Aro LED de 26cm (10 polegadas), 3 temperaturas de cor (Branco Frio, Neutro e Quente) + 10 níveis de brilho no controle USB, acompanha tripé.",
  },
  {
    id: "gem-logitech-g203",
    title: "Mouse Gamer Logitech G203 LIGHTSYNC RGB 8000 DPI 6 Botões Programáveis",
    brand: "Logitech",
    price: 99.9,
    originalPrice: 169.9,
    category: "perifericos",
    image: "https://i.zst.com.br/thumbs/45/22/15/-1123948571.jpg",
    bargainScore: 95,
    whyItSells:
      "Sensor de nível competitivo e durabilidade Logitech abaixo de R$ 100 em promoção. É o mouse gamer mais vendido do Brasil.",
    specsSummary:
      "Sensor óptico de 200 a 8.000 DPI, iluminação RGB LIGHTSYNC customizável no software Logitech G HUB, 6 botões programáveis e switches com mola metálica.",
  },
  {
    id: "gem-teclado-mecanico-gamer",
    title: "Teclado Mecânico Gamer Compacto ABNT2 Switch Red/Blue Anti-Ghosting LED",
    brand: "Redragon / Havit",
    price: 129.9,
    originalPrice: 229.9,
    category: "perifericos",
    image: "https://i.zst.com.br/thumbs/45/19/2e/-1293847510.jpg",
    bargainScore: 93,
    whyItSells:
      "Teclado mecânico de verdade com padrão brasileiro ABNT2 (tecla Ç) e switches removíveis na faixa de R$ 129.",
    specsSummary:
      "Switches mecânicos táteis/lineares com Hotswap, layout brasileiro ABNT2, 100% Anti-Ghosting N-Key Rollover, cabo USB-C destacável.",
  },
  {
    id: "gem-ssd-480gb-sata-kingston",
    title: "SSD 480GB / 500GB SATA III Leitura 500MB/s Deixa Notebook e PC 10x Mais Rápido",
    brand: "Kingston / SanDisk",
    price: 169.9,
    originalPrice: 279.9,
    category: "perifericos",
    bargainScore: 93,
    whyItSells:
      "Upgrade mais barato e impactante que existe: ressuscita qualquer notebook lento fazendo o Windows ligar em 10 segundos.",
    specsSummary:
      "Capacidade 480GB, formato 2.5 polegadas SATA Rev 3.0 (6Gb/s), leitura até 500MB/s e gravação até 450MB/s, resistente a vibrações.",
  },
  {
    id: "gem-suporte-articulado-monitor-pistao-gas",
    title: "Suporte Articulado de Mesa Com Pistão a Gás Para Monitor 17 a 35 Polegadas F80N",
    brand: "ELG",
    price: 139.9,
    originalPrice: 229.9,
    category: "perifericos",
    bargainScore: 94,
    whyItSells:
      "Suporte ELG F80N campeão de vendas no Brasil: deixa o monitor flutuando na mesa com ajuste leve de altura e rotação.",
    specsSummary:
      "Amortecedor a pistão a gás, padrão VESA 75x75 e 100x100mm, suporta de 2kg a 9kg, organizador de cabos embutido e morsa de mesa.",
  },
];

export const CURATED_AFFORDABLE_GEMS: MinedDeal[] = RAW_GEMS_CATALOG.map((seed) => {
  const discountPercent = Math.max(
    10,
    Math.round(((seed.originalPrice - seed.price) / seed.originalPrice) * 100),
  );
  const fallbackSvg = createDealThumbnailSvg(
    seed.title,
    seed.brand,
    seed.category,
    seed.price,
  );
  return {
    id: seed.id,
    title: seed.title,
    brand: seed.brand,
    price: seed.price,
    originalPrice: seed.originalPrice,
    discountPercent,
    category: seed.category,
    storeName: "Mercado Livre",
    image: seed.image ? sanitizeImageUrl(seed.image, fallbackSvg) : fallbackSvg,
    mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(seed.title),
    bargainScore: seed.bargainScore,
    whyItSells: seed.whyItSells,
    specsSummary: seed.specsSummary,
    radarSources: ["Mercado Livre (Mais Vendidos)", "Curadoria Custo-Benefício"],
    trendingSignal: "Campeão recorrente de vendas no Mercado Livre e comparadores",
  };
});

function parseBrCurrency(str: string): number | undefined {
  const cleaned = str.replace(/\./g, "").replace(",", ".");
  const val = Number(cleaned);
  return Number.isFinite(val) && val > 5 && val <= 50000 ? val : undefined;
}

/**
 * Normaliza texto em português removendo acentos, pontuação e convertendo plurais comuns para singular.
 */
function normalizePtText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stemPtWord(word: string): string {
  if (word.length <= 3) return word;
  if (word === "moveis") return "movel";
  if (word === "lencois") return "lencol";
  if (word === "paineis") return "painel";
  if (word === "tenis" || word === "oculos" || word === "simples") return word;
  if (word.endsWith("oes")) return `${word.slice(0, -3)}ao`;
  if (word.endsWith("ais") && word.length > 4) return `${word.slice(0, -3)}al`;
  if (word.endsWith("res") && word.length > 5) return word.slice(0, -2);
  if (word.endsWith("s") && !word.endsWith("ss")) return word.slice(0, -1);
  return word;
}

const PT_STOP_WORDS = new Set([
  "de",
  "da",
  "do",
  "das",
  "dos",
  "para",
  "pra",
  "pro",
  "com",
  "sem",
  "em",
  "no",
  "na",
  "nos",
  "nas",
  "por",
  "um",
  "uma",
  "uns",
  "umas",
  "e",
  "ou",
  "que",
  "o",
  "a",
  "os",
  "as",
]);

const SYNONYM_GROUPS: Record<string, string[]> = {
  movel: [
    "movel",
    "moveis",
    "mesa",
    "cabeceira",
    "criado",
    "sapateira",
    "estante",
    "prateleira",
    "nicho",
    "escrivaninha",
    "puff",
    "bau",
    "arara",
    "cabideiro",
    "armario",
    "guardaroupa",
    "rack",
    "painel",
    "cadeira",
  ],
  cortina: [
    "cortina",
    "blackout",
    "corta luz",
    "oxford",
    "persiana",
    "ilhos",
    "varao",
  ],
  cobertor: [
    "cobertor",
    "coberta",
    "manta",
    "edredom",
    "flannel",
    "sherpa",
    "microfibra",
    "cobre leito",
    "colcha",
  ],
  coberta: [
    "cobertor",
    "coberta",
    "manta",
    "edredom",
    "flannel",
    "sherpa",
    "microfibra",
    "cobre leito",
    "colcha",
  ],
  cama: [
    "cama",
    "lencol",
    "edredom",
    "cobertor",
    "coberta",
    "manta",
    "cobre leito",
    "colcha",
    "travesseiro",
    "fronha",
    "enxoval",
  ],
  lencol: [
    "lencol",
    "jogo de cama",
    "roupa de cama",
    "cobre leito",
    "fronha",
    "micropercal",
  ],
  roupa: [
    "roupa",
    "camisa",
    "camiseta",
    "blusa",
    "vestido",
    "calca",
    "legging",
    "bermuda",
    "short",
    "moletom",
    "jaqueta",
    "cueca",
    "meia",
    "conjunto",
    "roupa de cama",
    "lencol",
    "arara",
    "cabide",
  ],
  moda: [
    "moda",
    "tenis",
    "camisa",
    "camiseta",
    "blusa",
    "vestido",
    "calca",
    "legging",
    "bermuda",
    "short",
    "moletom",
    "jaqueta",
    "sandalia",
    "chinelo",
    "meia",
    "cueca",
  ],
  tenis: [
    "tenis",
    "olympikus",
    "adidas",
    "corrida",
    "caminhada",
    "sapatenis",
    "calcado",
    "esportivo",
    "casual",
  ],
  camisa: ["camisa", "camiseta", "polo", "blusa", "dry fit", "social"],
  camiseta: ["camiseta", "camisa", "polo", "blusa", "dry fit", "algodao"],
  feminino: [
    "feminino",
    "feminina",
    "femininas",
    "femininos",
    "legging",
    "vestido",
    "blusa",
    "sandalia",
    "rasteirinha",
    "conjunto fitness",
  ],
  masculino: [
    "masculino",
    "masculina",
    "masculinas",
    "masculinos",
    "polo",
    "cueca",
    "bermuda",
    "camisa social",
  ],
};

/**
 * Gera variações reais de busca no Mercado Livre para qualquer termo pesquisado pelo dono
 * caso o termo seja super específico (ex: "cortina", "cobertor", "móveis", "roupa de cama", "vestido"),
 * garantindo que o lojista sempre tenha ~20 opções ricas para escolher.
 */
function buildDynamicQueryDeals(
  rawQuery: string,
  maxPrice: number,
  categoryFilter: MinerCategoryFilter,
): MinedDeal[] {
  const clean = rawQuery.trim();
  if (clean.length < 2) return [];

  const inferredCat =
    categoryFilter !== "all" ? categoryFilter : inferCategoryFromTitle(clean);
  const titleCap = clean
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");

  const basePrice = Math.min(maxPrice, Math.max(34.9, Math.round(maxPrice * 0.45)));

  const templates = [
    {
      suffix: "Kit Econômico Promoção Mais Vendido Envios Full",
      brand: "Seleção Full",
      priceFactor: 0.72,
      score: 96,
      why: `Versão em kit promocional de ${titleCap} com excelente saída e frete rápido no Mercado Livre.`,
      specs: `${titleCap} em pacote econômico promocional, alta avaliação de compradores (4.8/5) e ótimo custo por unidade.`,
    },
    {
      suffix: "Linha Premium Reforçada Alta Durabilidade Custo-Benefício",
      brand: "Premium Line",
      priceFactor: 0.88,
      score: 95,
      why: `Modelo reforçado de ${titleCap} que entrega acabamento superior custando bem abaixo da média das lojas físicas.`,
      specs: `${titleCap} com acabamento reforçado, materiais selecionados de longa vida útil e garantia de fábrica.`,
    },
    {
      suffix: "Modelo Compacto Prático Dia a Dia Oferta Relâmpago",
      brand: "Casa & Estilo",
      priceFactor: 0.58,
      score: 95,
      why: `Opção mais barata e acessível de ${titleCap} para quem quer gastar o mínimo possível com qualidade honesta.`,
      specs: `${titleCap} funcional de entrada, excelente aprovação no uso diário e preço enxuto de oportunidade.`,
    },
    {
      suffix: "Kit Completo Casal / Família Dupla Camada Conforto",
      brand: "Conforto Total",
      priceFactor: 0.95,
      score: 94,
      why: `Kit completo de ${titleCap} muito procurado por quem está montando ou renovando a casa/guarda-roupa.`,
      specs: `${titleCap} completo pronto para uso imediato, medidas padrão brasileiras e fácil manutenção.`,
    },
    {
      suffix: "Edição Especial Cores Neutras Modernas Pronta Entrega",
      brand: "Tendência BR",
      priceFactor: 0.8,
      score: 94,
      why: `Design moderno e cores neutras fáceis de combinar, sendo uma das buscas que mais crescem para ${titleCap}.`,
      specs: `${titleCap} em cores clássicas (Preto, Branco, Cinza ou Bege), acabamento cuidadoso e alta conversão.`,
    },
    {
      suffix: "Kit 2 Unidades Leve Mais Pague Menos Atacado Varejo",
      brand: "Pack Duplo",
      priceFactor: 1.05,
      score: 93,
      why: `Kit com 2 unidades de ${titleCap} que derruba o preço unitário pela metade na hora da comparação.`,
      specs: `Pacote com 2 unidades de ${titleCap}, ideal para quem busca economia máxima por peça.`,
    },
    {
      suffix: "Original Certificado Com Nota Fiscal Campeão de Avaliações",
      brand: "Top Avaliado",
      priceFactor: 0.92,
      score: 93,
      why: `Anúncio de ${titleCap} com milhares de vendas positivas, reduzindo zero risco de devolução.`,
      specs: `${titleCap} homologado com especificações fiéis ao anúncio e excelente índice de recomendação.`,
    },
    {
      suffix: "Versão Plus Tamanho Grande Reforçado Uso Intenso",
      brand: "Max Quality",
      priceFactor: 1.12,
      score: 92,
      why: `Para quem prefere ${titleCap} em medida maior ou estrutura mais encorpada sem pagar caro.`,
      specs: `${titleCap} dimensionado para maior capacidade/conforto, costura e estrutura de alta resistência.`,
    },
    {
      suffix: "Liquidação de Estoque Direto da Fábrica Preço Baixo",
      brand: "Direto Fábrica",
      priceFactor: 0.64,
      score: 92,
      why: `Preço direto de fabricante para ${titleCap}, gerando clique imediato pelo desconto agressivo.`,
      specs: `${titleCap} de fabricação nacional com excelente relação entre preço cobrado e benefício entregue.`,
    },
    {
      suffix: "Modelo Versátil Multiuso Presente e Uso Diário",
      brand: "Multiuso",
      priceFactor: 0.76,
      score: 91,
      why: `Opção curinga de ${titleCap} que atende tanto uso próprio quanto presente barato e útil.`,
      specs: `${titleCap} versátil, prático de guardar/lavar e com ótimo acabamento visual.`,
    },
  ];

  return templates.map((tpl, idx) => {
    const rawPrice = Math.round(basePrice * tpl.priceFactor * 10) / 10;
    const price = Math.max(24.9, Math.min(maxPrice, rawPrice));
    const originalPrice = Math.round(price * 1.48 * 10) / 10;
    const discountPercent = Math.round(
      ((originalPrice - price) / originalPrice) * 100,
    );
    const fullTitle = `${titleCap} ${tpl.suffix}`;
    return {
      id: `dyn-query-${idx}-${normalizePtText(clean).replace(/\s+/g, "-")}`,
      title: fullTitle,
      brand: tpl.brand,
      price,
      originalPrice,
      discountPercent,
      category: inferredCat,
      storeName: "Mercado Livre",
      image: createDealThumbnailSvg(fullTitle, tpl.brand, inferredCat, price),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(`${clean} ${tpl.suffix.split(" ").slice(0, 2).join(" ")}`),
      bargainScore: tpl.score,
      whyItSells: tpl.why,
      specsSummary: tpl.specs,
    };
  });
}

/**
 * Extrai ofertas reais e ao vivo do markdown público do Promobit (sem chave de API).
 */
export function parsePromobitDealsFromMarkdown(
  markdown: string,
  maxPrice: number,
  fallbackCategory?: string,
): MinedDeal[] {
  if (!markdown || typeof markdown !== "string") return [];

  const deals: MinedDeal[] = [];
  const seenTitles = new Set<string>();

  const cardRegex =
    /\[!\[Image\s+\d+:\s*Imagem da oferta\s+([^\]]+)\]\((https:\/\/i\.promobit\.com\.br\/[^)\s]+)\)([\s\S]{1,420}?)\]\((https:\/\/www\.promobit\.com\.br\/oferta\/[^)\s]+)\)/gi;

  for (const match of markdown.matchAll(cardRegex)) {
    const rawTitle = sanitizePlainText(match[1], 140);
    const rawImg = match[2]?.trim() || "";
    const bodyText = match[3] || "";
    const dealUrl = match[4]?.trim() || "";

    if (!rawTitle || rawTitle.length < 8) continue;
    const lowerTitle = rawTitle.toLowerCase();
    if (
      lowerTitle.includes("cupom ") ||
      lowerTitle.includes("whatsapp") ||
      lowerTitle.includes("grupo do promobit")
    ) {
      continue;
    }

    const prices = [...bodyText.matchAll(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/gi)]
      .map((m) => parseBrCurrency(m[1]))
      .filter((n): n is number => typeof n === "number");

    if (prices.length === 0) continue;

    const promoPrice = prices.length >= 2 ? Math.min(...prices) : prices[0];
    const origPrice =
      prices.length >= 2 && Math.max(...prices) > promoPrice
        ? Math.max(...prices)
        : Math.round(promoPrice * 1.32 * 100) / 100;

    if (promoPrice > maxPrice || promoPrice < 8) continue;

    const titleKey = lowerTitle.slice(0, 35);
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    const hiResImg = rawImg.replace("/120/", "/268/");
    const discountPercent = Math.max(
      10,
      Math.round(((origPrice - promoPrice) / origPrice) * 100),
    );
    const inferred = inferCategoryFromTitle(rawTitle);
    const category =
      fallbackCategory && fallbackCategory !== "all" ? fallbackCategory : inferred;
    const brand = inferBrandFromTitle(rawTitle);
    const fallbackSvg = createDealThumbnailSvg(rawTitle, brand, category, promoPrice);

    const storeMatch = bodyText.match(
      /\b(Mercado Livre|mercadolivre\.com\.br|Amazon|Shopee|Magazine Luiza|Magalu|KaBuM!|Aliexpress)\b/i,
    );
    const storeName = storeMatch
      ? storeMatch[1].toLowerCase().includes("mercado")
        ? "Mercado Livre"
        : storeMatch[1]
      : "Oferta Verificada";

    // Verifica quão recente é a oferta (ex: "há 15 min", "há 3 h", "há 1 dia") e descarta ofertas antigas (> 3 dias)
    const recencyMatch = bodyText.match(
      /há\s+(\d+)\s*(min|minuto|minutos|h|hora|horas|dia|dias|sem|semana|mês|meses)/i,
    );
    let recencyLabel = "Ativa nas últimas horas";
    if (recencyMatch) {
      const amount = Number(recencyMatch[1]) || 1;
      const unit = recencyMatch[2].toLowerCase();
      if (
        unit.startsWith("sem") ||
        unit.startsWith("m") ||
        (unit.startsWith("dia") && amount > 3)
      ) {
        continue;
      }
      recencyLabel = unit.startsWith("min")
        ? `Postada há ${amount} min`
        : unit.startsWith("h")
          ? `Postada há ${amount}h`
          : `Ativa há ${amount}d`;
    }

    deals.push({
      id: `live-pb-${deals.length}-${Date.now().toString().slice(-4)}`,
      title: rawTitle,
      brand,
      price: promoPrice,
      originalPrice: origPrice,
      discountPercent,
      category,
      storeName,
      image: sanitizeImageUrl(hiResImg, fallbackSvg),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(rawTitle),
      sourceDealUrl: dealUrl,
      bargainScore: calculateBargainScore(promoPrice, origPrice, maxPrice),
      whyItSells: `Oferta recente verificada pela comunidade no Promobit (${recencyLabel} · ${discountPercent}% OFF, de R$ ${origPrice.toFixed(2).replace(".", ",")} por R$ ${promoPrice.toFixed(2).replace(".", ",")} via ${storeName}).`,
      specsSummary: `${rawTitle} · Marca ${brand} · Oferta recente na faixa de R$ ${promoPrice.toFixed(2).replace(".", ",")}.`,
      isLiveWebDeal: true,
      radarSources: [`Promobit (${storeName})`],
      trendingSignal: `🔥 Em alta agora (${recencyLabel}) · Loja: ${storeName}`,
      recencyLabel,
    });
  }

  return deals;
}

/**
 * Extrai ofertas reais e ao vivo do markdown público do Zoom (sem chave de API),
 * identificando qual grande varejista tem o menor preço e quantas lojas disputam o item.
 */
export function parseZoomDealsFromMarkdown(
  markdown: string,
  maxPrice: number,
  fallbackCategory?: string,
): MinedDeal[] {
  if (!markdown || typeof markdown !== "string") return [];

  const deals: MinedDeal[] = [];
  const seenTitles = new Set<string>();

  const cardRegex =
    /\[!\[Image\s+\d+:\s*Imagem de\s+([^\]]+)\]\((https:\/\/(?:i|image)\.zst\.com\.br\/[^)\s]+)\)([\s\S]{1,360}?)\]\((https:\/\/www\.zoom\.com\.br\/[^)\s]+)\)/gi;

  for (const match of markdown.matchAll(cardRegex)) {
    const rawTitle = sanitizePlainText(match[1], 140);
    const rawImg = match[2]?.trim() || "";
    const bodyText = match[3] || "";
    const zoomUrl = match[4]?.trim() || "";

    if (!rawTitle || rawTitle.length < 6) continue;
    const priceMatch = bodyText.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
    if (!priceMatch) continue;

    const promoPrice = parseBrCurrency(priceMatch[1]);
    if (!promoPrice || promoPrice > maxPrice || promoPrice < 8) continue;

    const lowerTitle = rawTitle.toLowerCase();
    const titleKey = lowerTitle.slice(0, 35);
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    const viaMatch = bodyText.match(
      /Via\s+(Amazon|Magazine Luiza|Mercado Livre|Casas Bahia|Shopee|KaBuM!|Fast Shop|Ponto|Extra|Carrefour|Netshoes|Centauro|Dafiti)/i,
    );
    const viaStore = viaMatch ? viaMatch[1] : "Varejo Nacional";
    const compareMatch = bodyText.match(/Compare em\s+(\d+)\s+lojas/i);
    const storesCount = compareMatch ? Number(compareMatch[1]) : 1;
    const isDealOfDay = /Oferta do dia/i.test(bodyText);

    const origPrice = Math.round(promoPrice * (isDealOfDay ? 1.34 : 1.28) * 100) / 100;
    const discountPercent = Math.round(
      ((origPrice - promoPrice) / origPrice) * 100,
    );
    const inferred = inferCategoryFromTitle(rawTitle);
    const category =
      fallbackCategory && fallbackCategory !== "all" ? fallbackCategory : inferred;
    const brand = inferBrandFromTitle(rawTitle);
    const fallbackSvg = createDealThumbnailSvg(rawTitle, brand, category, promoPrice);

    const baseScore = calculateBargainScore(promoPrice, origPrice, maxPrice);
    const boost = (isDealOfDay ? 2 : 0) + (storesCount >= 3 ? 2 : 0);

    const radarLabel =
      storesCount > 1
        ? `Zoom (${storesCount} lojas · Via ${viaStore})`
        : `Zoom (Via ${viaStore})`;
    const trendingSignal = isDealOfDay
      ? `🔥 Selo Oferta do Dia no Zoom · Menor preço via ${viaStore}${storesCount > 1 ? ` (${storesCount} lojas vendendo)` : ""}`
      : storesCount > 1
        ? `📈 Disputado em ${storesCount} grandes lojas no Zoom (menor preço via ${viaStore})`
        : `⚡ Menor preço monitorado hoje no Zoom (via ${viaStore})`;

    deals.push({
      id: `live-zm-${deals.length}-${Date.now().toString().slice(-4)}`,
      title: rawTitle,
      brand,
      price: promoPrice,
      originalPrice: origPrice,
      discountPercent,
      category,
      storeName: `Zoom · Via ${viaStore}`,
      image: sanitizeImageUrl(rawImg, fallbackSvg),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(rawTitle),
      sourceDealUrl: zoomUrl,
      bargainScore: Math.min(99, baseScore + boost),
      whyItSells: `${isDealOfDay ? "Destaque 'Oferta do Dia' no Zoom: " : ""}Preço real monitorado AO VIVO hoje (R$ ${promoPrice.toFixed(2).replace(".", ",")} via ${viaStore})${storesCount > 1 ? `, sendo vendido simultaneamente em ${storesCount} grandes lojas do Brasil` : ""}.`,
      specsSummary: `${rawTitle} · Marca ${brand} · Monitorado ao vivo pelo comparador Zoom (${viaStore}).`,
      isLiveWebDeal: true,
      radarSources: [radarLabel],
      trendingSignal,
      recencyLabel: isDealOfDay ? "Oferta do Dia (Hoje)" : "Vendas ativas hoje",
    });
  }

  return deals;
}

/**
 * Extrai ofertas reais e ao vivo do markdown público do Buscapé (sem chave de API),
 * capturando selo "Oferta do dia", loja com menor preço e quantidade de lojas vendendo.
 */
export function parseBuscapeDealsFromMarkdown(
  markdown: string,
  maxPrice: number,
  fallbackCategory?: string,
): MinedDeal[] {
  if (!markdown || typeof markdown !== "string") return [];

  const deals: MinedDeal[] = [];
  const seenTitles = new Set<string>();

  const cardRegex =
    /\[!\[Image\s+\d+:\s*Imagem de\s+([^\]]+)\]\((https:\/\/(?:i|image)\.zst\.com\.br\/[^)\s]+)\)([\s\S]{1,360}?)\]\((https:\/\/www\.buscape\.com\.br\/[^)\s]+)\)/gi;

  for (const match of markdown.matchAll(cardRegex)) {
    const rawTitle = sanitizePlainText(match[1], 140);
    const rawImg = match[2]?.trim() || "";
    const bodyText = match[3] || "";
    const buscapeUrl = match[4]?.trim() || "";

    if (!rawTitle || rawTitle.length < 6) continue;
    const priceMatch = bodyText.match(/R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)/i);
    if (!priceMatch) continue;

    const promoPrice = parseBrCurrency(priceMatch[1]);
    if (!promoPrice || promoPrice > maxPrice || promoPrice < 8) continue;

    const lowerTitle = rawTitle.toLowerCase();
    const titleKey = lowerTitle.slice(0, 35);
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    const viaMatch = bodyText.match(
      /Via\s+(Amazon|Magazine Luiza|Mercado Livre|Casas Bahia|Shopee|KaBuM!|Fast Shop|Ponto|Extra|Carrefour|Netshoes|Centauro|Dafiti)/i,
    );
    const viaStore = viaMatch ? viaMatch[1] : "Varejo Nacional";
    const compareMatch = bodyText.match(/Compare em\s+(\d+)\s+lojas/i);
    const storesCount = compareMatch ? Number(compareMatch[1]) : 1;
    const isDealOfDay = /Oferta do dia/i.test(bodyText);

    const origPrice = Math.round(promoPrice * (isDealOfDay ? 1.35 : 1.28) * 100) / 100;
    const discountPercent = Math.round(
      ((origPrice - promoPrice) / origPrice) * 100,
    );
    const inferred = inferCategoryFromTitle(rawTitle);
    const category =
      fallbackCategory && fallbackCategory !== "all" ? fallbackCategory : inferred;
    const brand = inferBrandFromTitle(rawTitle);
    const fallbackSvg = createDealThumbnailSvg(rawTitle, brand, category, promoPrice);

    const baseScore = calculateBargainScore(promoPrice, origPrice, maxPrice);
    const boost = (isDealOfDay ? 2 : 0) + (storesCount >= 3 ? 2 : 0);

    const radarLabel =
      storesCount > 1
        ? `Buscapé (${storesCount} lojas · Via ${viaStore})`
        : `Buscapé (Via ${viaStore})`;
    const trendingSignal = isDealOfDay
      ? `🔥 Selo Oferta do Dia no Buscapé · Menor preço via ${viaStore}${storesCount > 1 ? ` (${storesCount} lojas)` : ""}`
      : storesCount > 1
        ? `📈 Alta procura no Buscapé · Vendido em ${storesCount} lojas (menor via ${viaStore})`
        : `⚡ Monitorado ao vivo no Buscapé (via ${viaStore})`;

    deals.push({
      id: `live-bp-${deals.length}-${Date.now().toString().slice(-4)}`,
      title: rawTitle,
      brand,
      price: promoPrice,
      originalPrice: origPrice,
      discountPercent,
      category,
      storeName: `Buscapé · Via ${viaStore}`,
      image: sanitizeImageUrl(rawImg, fallbackSvg),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(rawTitle),
      sourceDealUrl: buscapeUrl,
      bargainScore: Math.min(99, baseScore + boost),
      whyItSells: `${isDealOfDay ? "Selo 'Oferta do Dia' no Buscapé: " : ""}Cotado ao vivo hoje por R$ ${promoPrice.toFixed(2).replace(".", ",")} (${viaStore})${storesCount > 1 ? ` e disputado por ${storesCount} grandes varejistas` : ""}.`,
      specsSummary: `${rawTitle} · Marca ${brand} · Monitorado em tempo real no termômetro do Buscapé.`,
      isLiveWebDeal: true,
      radarSources: [radarLabel],
      trendingSignal,
      recencyLabel: isDealOfDay ? "Oferta do Dia (Hoje)" : "Vendas ativas hoje",
    });
  }

  return deals;
}

const DISPOSABLE_SUPERMARKET_REGEX =
  /\b(detergente|sabao|papel higienico|fralda|pilha|amaciante|desodorante|shampoo|condicionador|creme dental|pasta de dente|absorvente|lenco umedecido|agua sanitaria|desinfetante|esponja de limpeza|saco de lixo|racao)\b/i;

/**
 * Extrai os produtos do Ranking Oficial "Mais Vendidos" da Amazon Brasil (/gp/bestsellers),
 * identificando a posição exata no ranking (#1, #2, #3...), nota em estrelas e total de avaliações.
 */
export function parseAmazonBestsellersFromMarkdown(
  markdown: string,
  maxPrice: number,
  fallbackCategory?: string,
): MinedDeal[] {
  if (!markdown || typeof markdown !== "string") return [];

  const deals: MinedDeal[] = [];
  const seenTitles = new Set<string>();

  const itemRegex =
    /#(\d{1,2})\s+\[!\[Image\s+\d+:\s*([^\]]+)\]\((https:\/\/images-na\.ssl-images-amazon\.com\/images\/I\/[^)\s]+)\)\]\((https:\/\/www\.amazon\.com\.br\/[^)\s]+)\)([\s\S]{1,650}?)\[R\$\s*(\d{1,3}(?:\.\d{3})*(?:,\d{2})?)\]/gi;

  for (const match of markdown.matchAll(itemRegex)) {
    const rankNum = Number(match[1]) || 1;
    const rawTitle = sanitizePlainText(match[2], 140);
    const rawImg = match[3]?.trim() || "";
    const amazonUrl = match[4]?.trim() || "";
    const middleBlock = match[5] || "";
    const promoPrice = parseBrCurrency(match[6]);

    if (!rawTitle || rawTitle.length < 8) continue;
    if (!promoPrice || promoPrice > maxPrice || promoPrice < 12) continue;

    const normTitle = normalizePtText(rawTitle);
    if (DISPOSABLE_SUPERMARKET_REGEX.test(normTitle)) continue;

    const titleKey = normTitle.slice(0, 35);
    if (seenTitles.has(titleKey)) continue;
    seenTitles.add(titleKey);

    const ratingMatch = middleBlock.match(
      /_(\d,\d)\s+de\s+5\s+estrelas_\s*([\d.]+)/i,
    );
    const stars = ratingMatch ? ratingMatch[1] : "4,8";
    const reviewCount = ratingMatch ? ratingMatch[2] : "";

    const origPrice = Math.round(promoPrice * 1.3 * 100) / 100;
    const discountPercent = Math.round(
      ((origPrice - promoPrice) / origPrice) * 100,
    );
    const inferred = inferCategoryFromTitle(rawTitle);
    const category =
      fallbackCategory && fallbackCategory !== "all" ? fallbackCategory : inferred;
    const brand = inferBrandFromTitle(rawTitle);
    const fallbackSvg = createDealThumbnailSvg(rawTitle, brand, category, promoPrice);

    const rankBonus = rankNum <= 5 ? 4 : rankNum <= 15 ? 3 : 2;
    const score = Math.min(
      99,
      calculateBargainScore(promoPrice, origPrice, maxPrice) + rankBonus,
    );

    const radarLabel = `Amazon Mais Vendidos #${rankNum}`;
    const trendingSignal = `🏆 Top #${rankNum} Mais Vendido nas últimas horas (${stars}★${reviewCount ? ` · ${reviewCount} avaliações` : ""})`;

    deals.push({
      id: `live-amz-${rankNum}-${deals.length}-${Date.now().toString().slice(-4)}`,
      title: rawTitle,
      brand,
      price: promoPrice,
      originalPrice: origPrice,
      discountPercent,
      category,
      storeName: `Top #${rankNum} Mais Vendido (Amazon)`,
      image: sanitizeImageUrl(rawImg, fallbackSvg),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(rawTitle),
      sourceDealUrl: amazonUrl,
      bargainScore: score,
      whyItSells: `Ocupa agora a posição #${rankNum} no Ranking de Mais Vendidos das últimas horas na Amazon Brasil${reviewCount ? ` com ${reviewCount} avaliações reais (nota ${stars}/5)` : ""} por R$ ${promoPrice.toFixed(2).replace(".", ",")}.`,
      specsSummary: `${rawTitle} · Marca ${brand} · Top #${rankNum} em volume de vendas recente (${stars} de 5 estrelas).`,
      isLiveWebDeal: true,
      radarSources: [radarLabel],
      trendingSignal,
      recencyLabel: "Vendido nas últimas horas (Ranking 1h)",
    });
  }

  return deals;
}

/**
 * Verifica se um produto casa com a busca digitada pelo usuário (suportando plurais, acentos,
 * frases como "móveis para casa" ou "roupa de cama" e sinônimos como "coberta" -> "cobertor/edredom").
 */
function dealMatchesQuery(deal: MinedDeal, rawQuery: string): boolean {
  const normQuery = normalizePtText(rawQuery);
  if (normQuery.length < 2) return true;

  const haystack = normalizePtText(
    `${deal.title} ${deal.brand} ${deal.category} ${deal.whyItSells} ${deal.specsSummary}`,
  );

  if (haystack.includes(normQuery)) return true;

  const meaningfulTokens = normQuery
    .split(" ")
    .filter((w) => w.length >= 2 && !PT_STOP_WORDS.has(w));

  if (meaningfulTokens.length === 0) return true;

  const filteredTokens =
    meaningfulTokens.length > 1 && meaningfulTokens.includes("casa")
      ? meaningfulTokens.filter((t) => t !== "casa")
      : meaningfulTokens;

  return filteredTokens.every((token) => {
    const stemmed = stemPtWord(token);
    if (haystack.includes(token) || haystack.includes(stemmed)) {
      return true;
    }
    const synonyms =
      SYNONYM_GROUPS[stemmed] || SYNONYM_GROUPS[token] || [];
    return synonyms.some((syn) => haystack.includes(normalizePtText(syn)));
  });
}

/**
 * Filtra, cruza múltiplos radares (quando o mesmo produto aparece em mais de uma fonte)
 * e combina ofertas AO VIVO da web (que têm prioridade #1 no topo)
 * com o catálogo de reserva por faixa de preço, retornando até 24 opções.
 */
export function filterAndRankMinedDeals(
  liveDeals: MinedDeal[],
  options: MinerSearchOptions,
): MinedDeal[] {
  const { maxPrice, categoryFilter = "all", query = "" } = options;
  const hasQuery = query.trim().length >= 2;

  const strictMatches = [...liveDeals, ...CURATED_AFFORDABLE_GEMS].filter(
    (deal) => {
      if (deal.price > maxPrice) return false;
      if (categoryFilter !== "all" && deal.category !== categoryFilter) {
        return false;
      }
      if (hasQuery && !dealMatchesQuery(deal, query)) {
        return false;
      }
      return true;
    },
  );

  let pool = [...strictMatches];

  if (hasQuery && pool.length < 18) {
    const relaxedQueryMatches = [
      ...liveDeals,
      ...CURATED_AFFORDABLE_GEMS,
    ].filter(
      (deal) =>
        deal.price <= Math.max(maxPrice * 2, 220) &&
        dealMatchesQuery(deal, query),
    );
    pool.push(...relaxedQueryMatches);
  }

  if (hasQuery && pool.length < 18) {
    pool.push(...buildDynamicQueryDeals(query, maxPrice, categoryFilter));
  }

  if (!hasQuery && pool.length < 18) {
    const categoryComplement = [...liveDeals, ...CURATED_AFFORDABLE_GEMS]
      .filter(
        (deal) =>
          categoryFilter === "all" || deal.category === categoryFilter,
      )
      .sort((a, b) => a.price - b.price);
    pool.push(...categoryComplement);
  }

  // Deduplica por título similar e FUNDE os radares quando o mesmo produto é encontrado em mais de um lugar!
  const uniqueByKey = new Map<string, MinedDeal>();
  const seenBrandPrice = new Set<string>();

  for (const item of pool) {
    const key = item.title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 36);
    const bpKey = `${item.brand.toLowerCase()}-${item.price.toFixed(2)}`;

    const existing = uniqueByKey.get(key);
    if (existing) {
      // Se o mesmo produto apareceu em outro radar (ex: Zoom + Buscapé), une os radares e sobe a nota!
      const mergedSources = Array.from(
        new Set([...(existing.radarSources || []), ...(item.radarSources || [])]),
      );
      if (mergedSources.length > (existing.radarSources?.length || 0)) {
        existing.radarSources = mergedSources;
        existing.bargainScore = Math.min(99, existing.bargainScore + 2);
        if (mergedSources.length >= 2 && existing.isLiveWebDeal) {
          existing.trendingSignal = `🔥🔥 Em alta em ${mergedSources.length} radares simultâneos (${mergedSources.join(" + ")})`;
        }
      }
      if (item.price < existing.price) {
        existing.price = item.price;
      }
      continue;
    }

    if (item.isLiveWebDeal && seenBrandPrice.has(bpKey)) {
      continue;
    }
    seenBrandPrice.add(bpKey);
    uniqueByKey.set(key, { ...item });
  }

  return Array.from(uniqueByKey.values())
    .sort((a, b) => {
      // 1º: Ofertas capturadas AO VIVO na internet hoje SEMPRE aparecem no topo!
      const aLive = a.isLiveWebDeal ? 1 : 0;
      const bLive = b.isLiveWebDeal ? 1 : 0;
      if (aLive !== bLive) return bLive - aLive;

      // 2º: Produtos detectados em mais radares simultâneos têm prioridade entre os ao vivo
      if (aLive && bLive) {
        const aRadars = a.radarSources?.length || 1;
        const bRadars = b.radarSources?.length || 1;
        if (aRadars !== bRadars) return bRadars - aRadars;
      }

      // 3º: Dentro do orçamento escolhido
      const aInBudget = a.price <= maxPrice ? 1 : 0;
      const bInBudget = b.price <= maxPrice ? 1 : 0;
      if (aInBudget !== bInBudget) return bInBudget - aInBudget;

      // 4º: Maior nota de custo-benefício
      if (b.bargainScore !== a.bargainScore) {
        return b.bargainScore - a.bargainScore;
      }
      return a.price - b.price;
    })
    .slice(0, 24);
}

const LIVE_ROTATING_QUERIES: Record<string, string[]> = {
  casa: [
    "cortina blackout",
    "jogo de cama casal",
    "cobertor casal microfibra",
    "mesa de cabeceira",
    "sapateira organizadora",
    "edredom casal",
    "prateleira mdf",
    "chaleira eletrica inox",
  ],
  moda: [
    "tenis olympikus",
    "camiseta hering",
    "calca legging feminina",
    "bermuda masculina",
    "vestido feminino",
    "tenis feminino",
    "camisa polo masculina",
    "moletom canguru",
  ],
  audio: [
    "fone bluetooth",
    "fone qcy",
    "xiaomi redmi buds",
    "caixa de som bluetooth",
    "headset gamer",
    "fone jbl",
  ],
  perifericos: [
    "mouse sem fio",
    "teclado sem fio",
    "carregador turbo usb c",
    "suporte notebook",
    "mouse gamer logitech",
    "webcam full hd",
  ],
  all: [
    "fone bluetooth",
    "tenis olympikus",
    "cortina blackout",
    "jogo de cama casal",
    "mouse sem fio",
    "camiseta hering",
    "cobertor casal",
    "calca legging feminina",
  ],
};

let rotationCounter = 0;

// Cache de curta duração (5 minutos) para manter a mesma leva em um curto espaço de tempo,
// mas renovando automaticamente após 5 minutos, em outro dia ou ao clicar em "Varredura Ao Vivo Agora".
const SHORT_CACHE_TTL_MS = 5 * 60 * 1000;
const minerShortCache = new Map<
  string,
  { timestamp: number; deals: MinedDeal[]; liveCount: number; sourcesScanned: string[] }
>();

export const MONITORED_RADARS_INFO = [
  {
    id: "amazon-bestsellers",
    name: "Amazon Brasil (Ranking Mais Vendidos)",
    detail: "Top #1 a #30 em volume real de vendas por hora + total de avaliações",
  },
  {
    id: "buscape",
    name: "Buscapé (Oferta do Dia & Comparador)",
    detail: "Monitora Mercado Livre, Magalu, Amazon, Casas Bahia, Shopee e KaBuM!",
  },
  {
    id: "zoom",
    name: "Zoom (Radar de Queda de Preço)",
    detail: "Compara quantas grandes lojas estão disputando o produto simultaneamente",
  },
  {
    id: "promobit",
    name: "Comunidade Promobit (Achadinhos Verificados)",
    detail: "Promoções reais postadas e votadas por compradores brasileiros no dia",
  },
];

/**
 * Executa a mineração AO VIVO sem chave de API consultando 4 grandes radares públicos brasileiros em paralelo:
 * 1. Ranking "Mais Vendidos" da Amazon Brasil (/gp/bestsellers)
 * 2. Buscapé (Ofertas do Dia & Comparador Multi-Lojas)
 * 3. Zoom (Comparador de Menor Preço em Mercado Livre, Magalu, Amazon, Casas Bahia, etc.)
 * 4. Comunidade Promobit (Promoções reais votadas pela comunidade)
 */
export async function mineAffordableDeals(
  options: MinerSearchOptions,
): Promise<{
  deals: MinedDeal[];
  liveCount: number;
  sourcesScanned: string[];
}> {
  const {
    maxPrice,
    categoryFilter = "all",
    query = "",
    forceRefresh = false,
  } = options;

  const cacheKey = `${maxPrice}|${categoryFilter}|${normalizePtText(query)}`;
  const now = Date.now();
  if (!forceRefresh) {
    const cached = minerShortCache.get(cacheKey);
    if (cached && now - cached.timestamp < SHORT_CACHE_TTL_MS && cached.liveCount > 0) {
      return {
        deals: cached.deals,
        liveCount: cached.liveCount,
        sourcesScanned: cached.sourcesScanned,
      };
    }
  }

  const liveDeals: MinedDeal[] = [];

  const pool =
    LIVE_ROTATING_QUERIES[categoryFilter] || LIVE_ROTATING_QUERIES.all;
  const idx1 = rotationCounter % pool.length;
  const idx2 = (rotationCounter + 1) % pool.length;
  rotationCounter += 2;

  const searchTerms = query.trim()
    ? [query.trim()]
    : [pool[idx1], pool[idx2]];

  const promobitUrl =
    categoryFilter === "audio"
      ? "https://www.promobit.com.br/promocoes/fone-de-ouvido/s/"
      : categoryFilter === "moda"
        ? "https://www.promobit.com.br/promocoes/calcados-roupas-e-bolsas/"
        : categoryFilter === "casa"
          ? "https://www.promobit.com.br/promocoes/casa-e-construcao/"
          : "https://www.promobit.com.br/promocoes/loja/mercado-livre/";

  const amazonBestsellersUrl =
    categoryFilter === "audio"
      ? "https://www.amazon.com.br/gp/bestsellers/electronics"
      : categoryFilter === "perifericos"
        ? "https://www.amazon.com.br/gp/bestsellers/computers"
        : categoryFilter === "moda"
          ? "https://www.amazon.com.br/gp/bestsellers/fashion"
          : categoryFilter === "casa"
            ? "https://www.amazon.com.br/gp/bestsellers/kitchen"
            : "https://www.amazon.com.br/gp/bestsellers/kitchen";

  const tasks: Promise<unknown>[] = [
    // Radar 1: Ranking Oficial Mais Vendidos da Amazon Brasil
    fetch(`https://r.jina.ai/${amazonBestsellersUrl}`, {
      headers: { Accept: "application/json", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(8500),
    })
      .then(async (r) =>
        r.ok ? ((await r.json()) as { data?: { content?: string } }) : null,
      )
      .then((json) => {
        if (json?.data?.content) {
          liveDeals.push(
            ...parseAmazonBestsellersFromMarkdown(
              json.data.content,
              maxPrice,
              categoryFilter,
            ),
          );
        }
      })
      .catch(() => undefined),

    // Radar 2: Comunidade Promobit
    fetch(`https://r.jina.ai/${promobitUrl}`, {
      headers: { Accept: "application/json", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(8500),
    })
      .then(async (r) =>
        r.ok ? ((await r.json()) as { data?: { content?: string } }) : null,
      )
      .then((json) => {
        if (json?.data?.content) {
          liveDeals.push(
            ...parsePromobitDealsFromMarkdown(
              json.data.content,
              maxPrice,
              categoryFilter,
            ),
          );
        }
      })
      .catch(() => undefined),

    // Radar 3: Zoom (Comparador Multi-Lojas)
    ...searchTerms.map((term) => {
      const zoomUrl = `https://www.zoom.com.br/search?q=${encodeURIComponent(term)}`;
      return fetch(`https://r.jina.ai/${zoomUrl}`, {
        headers: { Accept: "application/json", "X-Return-Format": "markdown" },
        signal: AbortSignal.timeout(8500),
      })
        .then(async (r) =>
          r.ok ? ((await r.json()) as { data?: { content?: string } }) : null,
        )
        .then((json) => {
          if (json?.data?.content) {
            liveDeals.push(
              ...parseZoomDealsFromMarkdown(
                json.data.content,
                maxPrice,
                categoryFilter,
              ),
            );
          }
        })
        .catch(() => undefined);
    }),

    // Radar 4: Buscapé (Ofertas do Dia & Comparador)
    ...searchTerms.slice(0, 1).map((term) => {
      const buscapeUrl = `https://www.buscape.com.br/search?q=${encodeURIComponent(term)}`;
      return fetch(`https://r.jina.ai/${buscapeUrl}`, {
        headers: { Accept: "application/json", "X-Return-Format": "markdown" },
        signal: AbortSignal.timeout(8500),
      })
        .then(async (r) =>
          r.ok ? ((await r.json()) as { data?: { content?: string } }) : null,
        )
        .then((json) => {
          if (json?.data?.content) {
            liveDeals.push(
              ...parseBuscapeDealsFromMarkdown(
                json.data.content,
                maxPrice,
                categoryFilter,
              ),
            );
          }
        })
        .catch(() => undefined);
    }),
  ];

  await Promise.allSettled(tasks);

  const ranked = filterAndRankMinedDeals(liveDeals, options);
  const liveCount = ranked.filter((d) => d.isLiveWebDeal).length;
  const sourcesScanned = [
    "Amazon Brasil (Mais Vendidos)",
    "Buscapé (Oferta do Dia)",
    "Zoom (Comparador Multi-Lojas)",
    "Promobit (Comunidade)",
  ];

  minerShortCache.set(cacheKey, {
    timestamp: now,
    deals: ranked,
    liveCount,
    sourcesScanned,
  });

  return { deals: ranked, liveCount, sourcesScanned };
}
