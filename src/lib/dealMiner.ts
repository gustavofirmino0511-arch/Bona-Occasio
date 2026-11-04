import { sanitizeImageUrl, sanitizePlainText } from "./security";

export type MinerCategoryFilter =
  | "all"
  | "audio"
  | "perifericos"
  | "casa"
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
}

export interface MinerSearchOptions {
  maxPrice: number;
  categoryFilter?: MinerCategoryFilter;
  query?: string;
}

function buildMercadoLivreSearchUrl(productTitle: string): string {
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

function inferCategoryFromTitle(title: string): string {
  const lower = title.toLowerCase();
  if (
    /\b(fone|headphone|headset|earbuds|buds|caixa de som|soundbar|microfone|qcy|anker|jbl|edifier|redmi buds)\b/.test(
      lower,
    )
  ) {
    return "audio";
  }
  if (
    /\b(mouse|teclado|webcam|monitor|suporte monitor|mousepad|hub usb|controle|joystick|dualsense|gamepad)\b/.test(
      lower,
    )
  ) {
    return "perifericos";
  }
  if (
    /\b(air fryer|fritadeira|liquidificador|chaleira|cafeteira|balan[çc]a|processador|aspirador|panela|ventilador|garrafa t[ée]rmica|parafusadeira|furadeira|l[âa]mpada)\b/.test(
      lower,
    )
  ) {
    return "casa";
  }
  return "perifericos";
}

function inferBrandFromTitle(title: string): string {
  const knownBrands = [
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
  // Produtos abaixo de R$ 50 e R$ 100 ganham bônus de acessibilidade (compra rápida por impulso)
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

/**
 * Banco curado de "Achadinhos Campeões de Custo-Benefício" (R$ 19 a R$ 299)
 * que historicamente lideram vendas no Mercado Livre por entregarem alta qualidade custando muito pouco.
 */
export const CURATED_AFFORDABLE_GEMS: MinedDeal[] = [
  {
    id: "gem-qcy-t13-anc",
    title: "Fone de Ouvido Bluetooth 5.3 QCY T13 ANC Cancelamento de Ruído 4 Microfones",
    brand: "QCY",
    price: 94.9,
    originalPrice: 179.9,
    discountPercent: 47,
    category: "audio",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/17/35/-1015018819.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/fone-bluetooth-qcy-t13-anc",
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
    discountPercent: 46,
    category: "audio",
    storeName: "Mercado Livre",
    image:
      "https://i.promobit.com.br/268/831392805517937412427355526831.png",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/xiaomi-redmi-buds-6-play",
    bargainScore: 97,
    whyItSells:
      "Fone original Xiaomi na faixa de R$ 69 a R$ 78 com Bluetooth 5.4, 36 horas de bateria total e redução de ruído por IA para chamadas.",
    specsSummary:
      "Drivers dinâmicos de 10mm, Bluetooth 5.4, até 36h de bateria com o estojo, redução de ruído em chamadas por IA, ultraleve (3,6g por fone).",
  },
  {
    id: "gem-mouse-sem-fio-recarregavel",
    title: "Mouse Sem Fio Recarregável USB/Bluetooth Silencioso Clique Mudo 1600 DPI",
    brand: "Dual Mode",
    price: 29.9,
    originalPrice: 59.9,
    discountPercent: 50,
    category: "perifericos",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/36/14/-804215932.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/mouse-sem-fio-recarregavel-silencioso-bluetooth",
    bargainScore: 96,
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
    discountPercent: 52,
    category: "perifericos",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/1a/1b/-1154829102.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/carregador-turbo-20w-baseus-usb-c",
    bargainScore: 96,
    whyItSells:
      "Na faixa de R$ 40 na promoção: carrega de 0% a 50% em 30 minutos com proteção térmica inteligente e duas portas (USB-C + USB-A), custando 1/4 de um original Apple.",
    specsSummary:
      "Potência 20W Power Delivery (PD 3.0) + Quick Charge 3.0, saída dupla USB-C e USB-A, chip de controle térmico contra sobrecarga.",
  },
  {
    id: "gem-balanca-cozinha-inox",
    title: "Balança Digital de Cozinha Alta Precisão 1g a 10kg Aço Inox Dieta e Receitas",
    brand: "Inox Precision",
    price: 27.9,
    originalPrice: 54.9,
    discountPercent: 49,
    category: "casa",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/12/31/-984120394.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/balanca-digital-cozinha-inox-10kg",
    bargainScore: 95,
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
    discountPercent: 50,
    category: "casa",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/2b/19/-1092837461.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/lampada-inteligente-wifi-alexa-positivo",
    bargainScore: 95,
    whyItSells:
      "Clássico achadinho de R$ 39,90: transforma qualquer quarto em smart home controlado por voz na Alexa ou celular, com 16 milhões de cores e timer.",
    specsSummary:
      "LED 10W (806 lúmens), Wi-Fi 2.4GHz integrado (não precisa de hub), branco quente a frio + RGB 16 milhões de cores, compatível Alexa e Google Assistente.",
  },
  {
    id: "gem-logitech-g203",
    title: "Mouse Gamer Logitech G203 LIGHTSYNC RGB 8000 DPI 6 Botões Programáveis",
    brand: "Logitech",
    price: 99.9,
    originalPrice: 169.9,
    discountPercent: 41,
    category: "perifericos",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/22/15/-1123948571.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/mouse-gamer-logitech-g203-lightsync",
    bargainScore: 95,
    whyItSells:
      "Sensor de nível competitivo e durabilidade Logitech abaixo de R$ 100 em promoção. É o mouse gamer mais vendido do Brasil.",
    specsSummary:
      "Sensor óptico de 200 a 8.000 DPI, iluminação RGB LIGHTSYNC customizável no software Logitech G HUB, 6 botões programáveis e switches com mola metálica.",
  },
  {
    id: "gem-chaleira-eletrica-inox",
    title: "Chaleira Elétrica Jarra Inox 1,8 Litros Desligamento Automático Ferve Rápido",
    brand: "Agratto / Mondial",
    price: 58.9,
    originalPrice: 109.9,
    discountPercent: 46,
    category: "casa",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/0a/29/-1349827165.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/chaleira-eletrica-inox-1-8-litros",
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
    discountPercent: 47,
    category: "casa",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/3c/1d/-1429384756.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/parafusadeira-furadeira-sem-fio-12v-maleta",
    bargainScore: 94,
    whyItSells:
      "Ferramenta indispensável para ter em casa montando móveis e prateleiras, saindo abaixo de R$ 90 com bateria recarregável e kit de brocas/bits.",
    specsSummary:
      "Bateria de Lítio 12V recarregável Bivolt, controle de torque 18+1 níveis, mandril de aperto rápido 3/8 (10mm), luz LED frontal e reversão de giro.",
  },
  {
    id: "gem-jbl-tune-520bt",
    title: "Headphone Fone de Ouvido Bluetooth JBL Tune 520BT Pure Bass 57h Bateria",
    brand: "JBL",
    price: 174.9,
    originalPrice: 289.9,
    discountPercent: 40,
    category: "audio",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/24/11/-1680012462.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/jbl-tune-520bt",
    bargainScore: 93,
    whyItSells:
      "Bateria absurda de 57 horas, som JBL Pure Bass e dobrável para mochila. Quando cai na faixa de R$ 170, converte altíssimo.",
    specsSummary:
      "Drivers de 33mm com JBL Pure Bass, Bluetooth 5.3 multiponto, até 57h de bateria (5 min de carga = 3h de som), dobrável com botões na concha.",
  },
  {
    id: "gem-teclado-mecanico-gamer",
    title: "Teclado Mecânico Gamer Compacto ABNT2 Switch Red/Blue Anti-Ghosting LED",
    brand: "Redragon / Havit",
    price: 129.9,
    originalPrice: 229.9,
    discountPercent: 43,
    category: "perifericos",
    storeName: "Mercado Livre",
    image: "https://i.zst.com.br/thumbs/45/19/2e/-1293847510.jpg",
    mercadoLivreSearchUrl:
      "https://lista.mercadolivre.com.br/teclado-mecanico-gamer-abnt2-switch-red",
    bargainScore: 92,
    whyItSells:
      "Teclado mecânico de verdade com padrão brasileiro ABNT2 (tecla Ç) e switches removíveis na faixa de R$ 129.",
    specsSummary:
      "Switches mecânicos táteis/lineares com Hotswap, layout brasileiro ABNT2, 100% Anti-Ghosting N-Key Rollover, cabo USB-C destacável.",
  },
];

function parseBrCurrency(str: string): number | undefined {
  const cleaned = str.replace(/\./g, "").replace(",", ".");
  const val = Number(cleaned);
  return Number.isFinite(val) && val > 5 && val <= 50000 ? val : undefined;
}

/**
 * Extrai ofertas reais e ao vivo do markdown público do Promobit (sem chave de API).
 */
export function parsePromobitDealsFromMarkdown(
  markdown: string,
  maxPrice: number,
): MinedDeal[] {
  if (!markdown || typeof markdown !== "string") return [];

  const deals: MinedDeal[] = [];
  const seenTitles = new Set<string>();

  // Padrão de card do Promobit: [![Image X: Imagem da oferta TITULO](IMG_URL) ...](OFERTA_URL)
  const cardRegex =
    /\[!\[Image\s+\d+:\s*Imagem da oferta\s+([^\]]+)\]\((https:\/\/i\.promobit\.com\.br\/[^)\s]+)\)([\s\S]{1,420}?)\]\((https:\/\/www\.promobit\.com\.br\/oferta\/[^)\s]+)\)/gi;

  for (const match of markdown.matchAll(cardRegex)) {
    const rawTitle = sanitizePlainText(match[1], 140);
    const rawImg = match[2]?.trim() || "";
    const bodyText = match[3] || "";
    const dealUrl = match[4]?.trim() || "";

    if (!rawTitle || rawTitle.length < 8) continue;
    const lowerTitle = rawTitle.toLowerCase();
    // Ignora banners de cupom genérico ou grupos de WhatsApp
    if (
      lowerTitle.includes("cupom ") ||
      lowerTitle.includes("whatsapp") ||
      lowerTitle.includes("grupo do promobit")
    ) {
      continue;
    }

    // Extrai todos os valores R$ dentro do card (geralmente: R$Original R$Promo ou apenas R$Promo)
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
    const category = inferCategoryFromTitle(rawTitle);
    const brand = inferBrandFromTitle(rawTitle);

    const storeMatch = bodyText.match(
      /\b(Mercado Livre|mercadolivre\.com\.br|Amazon|Shopee|Magazine Luiza|Magalu|KaBuM!|Aliexpress)\b/i,
    );
    const storeName = storeMatch
      ? storeMatch[1].toLowerCase().includes("mercado")
        ? "Mercado Livre"
        : storeMatch[1]
      : "Oferta Verificada";

    deals.push({
      id: `live-pb-${deals.length}-${Date.now().toString().slice(-4)}`,
      title: rawTitle,
      brand,
      price: promoPrice,
      originalPrice: origPrice,
      discountPercent,
      category,
      storeName,
      image: sanitizeImageUrl(hiResImg),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(rawTitle),
      sourceDealUrl: dealUrl,
      bargainScore: calculateBargainScore(promoPrice, origPrice, maxPrice),
      whyItSells: `Oferta monitorada ao vivo (${discountPercent}% OFF, de R$ ${origPrice.toFixed(2).replace(".", ",")} por R$ ${promoPrice.toFixed(2).replace(".", ",")}) na faixa acessível até R$ ${maxPrice}.`,
      specsSummary: `${rawTitle} · Marca ${brand} · Destaque em custo-benefício na faixa de R$ ${promoPrice.toFixed(2).replace(".", ",")}.`,
      isLiveWebDeal: true,
    });
  }

  return deals;
}

/**
 * Extrai ofertas reais e ao vivo do markdown público do Zoom (sem chave de API).
 */
export function parseZoomDealsFromMarkdown(
  markdown: string,
  maxPrice: number,
): MinedDeal[] {
  if (!markdown || typeof markdown !== "string") return [];

  const deals: MinedDeal[] = [];
  const seenTitles = new Set<string>();

  const cardRegex =
    /\[!\[Image\s+\d+:\s*Imagem de\s+([^\]]+)\]\((https:\/\/i\.zst\.com\.br\/[^)\s]+)\)([\s\S]{1,320}?)\]\((https:\/\/www\.zoom\.com\.br\/[^)\s]+)\)/gi;

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

    const origPrice = Math.round(promoPrice * 1.28 * 100) / 100;
    const discountPercent = Math.round(
      ((origPrice - promoPrice) / origPrice) * 100,
    );
    const category = inferCategoryFromTitle(rawTitle);
    const brand = inferBrandFromTitle(rawTitle);

    deals.push({
      id: `live-zm-${deals.length}-${Date.now().toString().slice(-4)}`,
      title: rawTitle,
      brand,
      price: promoPrice,
      originalPrice: origPrice,
      discountPercent,
      category,
      storeName: "Menor Preço Monitorado",
      image: sanitizeImageUrl(rawImg),
      mercadoLivreSearchUrl: buildMercadoLivreSearchUrl(rawTitle),
      sourceDealUrl: zoomUrl,
      bargainScore: calculateBargainScore(promoPrice, origPrice, maxPrice),
      whyItSells: `Menor preço monitorado no Brasil (R$ ${promoPrice.toFixed(2).replace(".", ",")}) com excelente avaliação de compradores.`,
      specsSummary: `${rawTitle} · Marca ${brand} · Selecionado pelo radar de menor preço nacional.`,
      isLiveWebDeal: true,
    });
  }

  return deals;
}

/**
 * Filtra e combina ofertas ao vivo com os Achadinhos Campeões por faixa de preço,
 * ordenando pelo maior Índice de Achadinho (custo-benefício + preço acessível).
 */
export function filterAndRankMinedDeals(
  liveDeals: MinedDeal[],
  options: MinerSearchOptions,
): MinedDeal[] {
  const { maxPrice, categoryFilter = "all", query = "" } = options;
  const cleanQuery = query.trim().toLowerCase();

  const matchesFilter = (deal: MinedDeal): boolean => {
    if (deal.price > maxPrice) return false;
    if (categoryFilter !== "all" && deal.category !== categoryFilter) {
      return false;
    }
    if (cleanQuery.length >= 2) {
      const haystack =
        `${deal.title} ${deal.brand} ${deal.category} ${deal.whyItSells} ${deal.specsSummary}`.toLowerCase();
      const terms = cleanQuery.split(/\s+/).filter((t) => t.length >= 2);
      return terms.every((t) => haystack.includes(t));
    }
    return true;
  };

  const combined = [...liveDeals, ...CURATED_AFFORDABLE_GEMS].filter(
    matchesFilter,
  );

  // Deduplica por título similar
  const unique: MinedDeal[] = [];
  const seenKeys = new Set<string>();
  for (const item of combined) {
    const key = item.title
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "")
      .slice(0, 28);
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      unique.push(item);
    }
  }

  return unique
    .sort((a, b) => {
      if (b.bargainScore !== a.bargainScore) {
        return b.bargainScore - a.bargainScore;
      }
      return a.price - b.price;
    })
    .slice(0, 12);
}

/**
 * Executa a mineração sem chave de API consultando fontes públicas de ofertas (Promobit / Zoom)
 * e combinando com o radar de achadinhos baratos.
 */
export async function mineAffordableDeals(
  options: MinerSearchOptions,
): Promise<{ deals: MinedDeal[]; liveCount: number }> {
  const { maxPrice, categoryFilter = "all", query = "" } = options;
  const liveDeals: MinedDeal[] = [];

  const searchTerm =
    query.trim() ||
    (categoryFilter === "audio"
      ? "fone bluetooth"
      : categoryFilter === "perifericos"
        ? "mouse sem fio teclado"
        : categoryFilter === "casa"
          ? "cozinha inox"
          : "fone bluetooth");

  const promobitUrl =
    categoryFilter === "audio"
      ? "https://www.promobit.com.br/promocoes/fone-de-ouvido/s/"
      : "https://www.promobit.com.br/promocoes/loja/mercado-livre/";

  const zoomUrl = `https://www.zoom.com.br/search?q=${encodeURIComponent(searchTerm)}`;

  const tasks = [
    fetch(`https://r.jina.ai/${promobitUrl}`, {
      headers: { Accept: "application/json", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(7500),
    })
      .then(async (r) => (r.ok ? ((await r.json()) as { data?: { content?: string } }) : null))
      .then((json) => {
        if (json?.data?.content) {
          liveDeals.push(
            ...parsePromobitDealsFromMarkdown(json.data.content, maxPrice),
          );
        }
      })
      .catch(() => undefined),

    fetch(`https://r.jina.ai/${zoomUrl}`, {
      headers: { Accept: "application/json", "X-Return-Format": "markdown" },
      signal: AbortSignal.timeout(7500),
    })
      .then(async (r) => (r.ok ? ((await r.json()) as { data?: { content?: string } }) : null))
      .then((json) => {
        if (json?.data?.content) {
          liveDeals.push(
            ...parseZoomDealsFromMarkdown(json.data.content, maxPrice),
          );
        }
      })
      .catch(() => undefined),
  ];

  await Promise.allSettled(tasks);

  const ranked = filterAndRankMinedDeals(liveDeals, options);
  const liveCount = ranked.filter((d) => d.isLiveWebDeal).length;

  return { deals: ranked, liveCount };
}
