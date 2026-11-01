import {
  createGenericStudioSvg,
  createHeadphoneSvg,
  createKeyboardSvg,
  createNotebookSvg,
  createSmartphoneSvg,
} from "../data/productImages";
import type {
  AiCatalogAdviceResponse,
  AiProductDraft,
  Category,
  Product,
} from "../types/product";

/**
 * Gera a ilustração vetorial de estúdio correspondente à categoria do rascunho da IA.
 */
export function generateProductImageForDraft(draft: AiProductDraft): string {
  const cat = draft.category.toLowerCase();
  if (cat === "notebooks" || cat.includes("notebook")) {
    const cpu =
      draft.specs.find((s) => s.key === "processor")?.value ?? draft.brand;
    const gpu =
      draft.specs.find((s) => s.key === "gpu")?.value ?? draft.highlightTitle;
    const screen =
      draft.specs.find((s) => s.key === "screen")?.value ?? "Full HD IPS";
    return createNotebookSvg({
      model: draft.shortName,
      chip: cpu.split("(")[0].trim(),
      gpu: gpu.split("(")[0].trim(),
      screenSpec: screen.split("(")[0].trim(),
      chassisColor: "#334155",
      accentColor: "#b87333",
    });
  }

  if (cat === "smartphones" || cat.includes("celular") || cat.includes("phone")) {
    const cpu =
      draft.specs.find((s) => s.key === "processor")?.value ?? draft.brand;
    const screen =
      draft.specs.find((s) => s.key === "screen")?.value ?? "AMOLED 120Hz";
    return createSmartphoneSvg({
      model: draft.shortName,
      chip: cpu.split("(")[0].trim(),
      cameraSpec: draft.highlightTitle,
      screenSpec: screen.split("(")[0].trim(),
      bodyColor: "#1e293b",
      accentColor: "#d4915a",
    });
  }

  if (cat === "audio" || cat.includes("fone") || cat.includes("audio")) {
    const anc =
      draft.specs.find((s) => s.key === "anc")?.value ?? draft.highlightTitle;
    const bat =
      draft.specs.find((s) => s.key === "battery")?.value ?? "Longa duração";
    return createHeadphoneSvg({
      model: draft.shortName,
      ancSpec: anc.split("+")[0].trim(),
      batterySpec: bat.split("/")[0].trim(),
      bodyColor: "#1e293b",
      accentColor: "#b87333",
    });
  }

  if (cat === "perifericos" || cat.includes("teclado") || cat.includes("mouse")) {
    const sw =
      draft.specs.find((s) => s.key === "switches")?.value ?? draft.brand;
    const conn =
      draft.specs.find((s) => s.key === "connectivity")?.value ?? "Sem Fio";
    return createKeyboardSvg({
      model: draft.shortName,
      switchSpec: sw.split("·")[0].trim(),
      connSpec: conn.split(":")[0].trim(),
      caseColor: "#334155",
      keycapAccent: "#b87333",
    });
  }

  return createGenericStudioSvg({
    brand: draft.brand,
    model: draft.shortName,
    highlight: draft.highlightTitle,
    specLine: draft.specs[0]?.value ?? draft.idealFor,
  });
}

/**
 * Converte um AiProductDraft (vindo da IA) em um objeto Product pronto para o catálogo e comparador.
 */
export function buildProductFromAiDraft(
  draft: AiProductDraft,
  affiliateUrl?: string,
): Product {
  const slug = draft.shortName
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return {
    id: `${draft.category}-${slug}-${Date.now().toString().slice(-4)}`,
    name: draft.name,
    shortName: draft.shortName,
    brand: draft.brand,
    tagline: draft.tagline,
    image: generateProductImageForDraft(draft),
    price: Number(draft.price) || 999,
    originalPrice: draft.originalPrice ? Number(draft.originalPrice) : undefined,
    installmentText:
      draft.installmentText ||
      `Em até 10x de R$ ${((Number(draft.price) || 999) / 10).toFixed(2).replace(".", ",")} sem juros`,
    category: draft.category,
    affiliateUrl:
      affiliateUrl && affiliateUrl.trim().length > 0
        ? affiliateUrl.trim()
        : "https://exemplo.com/afiliado/novo-produto",
    featured: true,
    idealFor: draft.idealFor,
    highlightTitle: draft.highlightTitle,
    rating: 4.8,
    reviewCount: 340,
    metrics: {
      performance: Math.min(100, Math.max(50, Math.round(draft.metrics.performance))),
      costBenefit: Math.min(100, Math.max(50, Math.round(draft.metrics.costBenefit))),
      battery: Math.min(100, Math.max(50, Math.round(draft.metrics.battery))),
      mobility: Math.min(100, Math.max(50, Math.round(draft.metrics.mobility))),
      buildQuality: Math.min(100, Math.max(50, Math.round(draft.metrics.buildQuality))),
    },
    specs: draft.specs,
    pros: draft.pros,
    cons: draft.cons,
  };
}

/**
 * Motor de Benchmark Técnico & Curadoria Inteligente Integrada.
 * Analisa links ou descrições de produtos (Notebooks, PCs, Celulares, Fones, Monitores, Periféricos e Eletros)
 * calculando notas técnicas reais de 0 a 100 baseadas nas peças detectadas e na relação preço vs. categoria.
 */
export function heuristicAnalyzeProductInput(
  rawInput: string,
  priceHint?: number,
): AiProductDraft {
  const text = rawInput.trim();
  const lower = text.toLowerCase();

  // Extrai nome legível mesmo se o usuário colou apenas uma URL de loja (Shopee / Mercado Livre / Amazon)
  let cleanTitle = text;
  if (text.startsWith("http://") || text.startsWith("https://")) {
    try {
      const url = new URL(text);
      const pathSegments = url.pathname
        .split("/")
        .filter(
          (s) =>
            s.length > 3 &&
            !s.startsWith("dp") &&
            !s.startsWith("MLB") &&
            !s.startsWith("p"),
        );
      const bestSegment =
        pathSegments.sort((a, b) => b.length - a.length)[0] ??
        "Produto Selecionado";
      cleanTitle = decodeURIComponent(bestSegment)
        .replace(/[-_+.]/g, " ")
        .replace(/\b(i\.\d+|\d{6,}|html|htm)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();
    } catch {
      cleanTitle = "Produto Selecionado";
    }
  }

  // Detecta preço no texto se não veio no priceHint
  let detectedPrice = priceHint && priceHint > 0 ? priceHint : 0;
  if (!detectedPrice) {
    const priceMatch = text.match(
      /R\$\s?(\d{1,3}(?:\.\d{3})*(?:,\d{2})?|\d+)/i,
    );
    if (priceMatch) {
      detectedPrice = Number(
        priceMatch[1].replace(/\./g, "").replace(",", "."),
      );
    }
  }

  const clampScore = (n: number) => Math.max(45, Math.min(99, Math.round(n)));

  // ============================================================================
  // 1. NOTEBOOKS & COMPUTADORES
  // ============================================================================
  if (
    lower.includes("notebook") ||
    lower.includes("laptop") ||
    lower.includes("macbook") ||
    lower.includes("inspiron") ||
    lower.includes("vivobook") ||
    lower.includes("ideapad") ||
    lower.includes("thinkpad") ||
    lower.includes("galaxy book") ||
    lower.includes("nitro") ||
    lower.includes("predator") ||
    lower.includes("legion") ||
    lower.includes("tuf") ||
    lower.includes("rog") ||
    lower.includes("pc gamer") ||
    lower.includes("computador") ||
    lower.includes("ryzen") ||
    lower.includes("core i3") ||
    lower.includes("core i5") ||
    lower.includes("core i7") ||
    lower.includes("core i9")
  ) {
    // Benchmark real de CPU (0 a 100)
    let cpuLabel = "Intel Core i5 / AMD Ryzen 5 (6 a 8 núcleos)";
    let cpuScore = 84;
    let cpuNote =
      "Roda multitarefa, estudos, pacotes Office, várias abas do navegador e trabalho sem engasgos.";

    if (
      lower.includes("i9") ||
      lower.includes("ryzen 9") ||
      lower.includes("m3 max") ||
      lower.includes("m4")
    ) {
      cpuLabel = lower.includes("ryzen 9")
        ? "AMD Ryzen 9 Alta Performance"
        : lower.includes("m3") || lower.includes("m4")
          ? "Apple Silicon Série M Pro/Max"
          : "Intel Core i9 Série H Alta Performance";
      cpuScore = 97;
      cpuNote =
        "Processador de elite: sobra potência para renderização 3D, compilação pesada, IA e qualquer jogo AAA.";
    } else if (
      lower.includes("i7") ||
      lower.includes("ryzen 7") ||
      lower.includes("m3") ||
      lower.includes("m2") ||
      lower.includes("ultra 7")
    ) {
      cpuLabel = lower.includes("ryzen 7")
        ? "AMD Ryzen 7 (8 núcleos / 16 threads)"
        : lower.includes("m2") || lower.includes("m3")
          ? "Chip Apple Silicon M2 / M3 (8 núcleos)"
          : "Intel Core i7 (até 10/12 núcleos híbridos)";
      cpuScore = 92;
      cpuNote =
        "Excelente fôlego para edição de vídeo, programação pesada, máquinas virtuais e jogos exigentes.";
    } else if (
      lower.includes("i3") ||
      lower.includes("ryzen 3") ||
      lower.includes("celeron") ||
      lower.includes("pentium") ||
      lower.includes("n100")
    ) {
      cpuLabel = lower.includes("celeron")
        ? "Intel Celeron / Série N de Entrada"
        : "Intel Core i3 / AMD Ryzen 3";
      cpuScore = lower.includes("celeron") ? 60 : 75;
      cpuNote = lower.includes("celeron")
        ? "Indicado apenas para tarefas bem básicas (textos e navegação leve); sofre se abrir muitos programas."
        : "Bom para estudos, faculdade, PDFs e vídeos, mas não indicado para edição pesada.";
    }

    // Benchmark real de GPU / Placa de Vídeo (0 a 100)
    let gpuLabel = "Placa Gráfica Integrada (Intel Iris Xe / AMD Radeon)";
    let gpuScore = 68;
    let gpuNote =
      "Atende perfeitamente vídeos em 4K, trabalho e estudos, mas não foi feita para rodar jogos pesados 3D.";
    let hasDedicatedGpu = false;

    if (lower.includes("rtx 4070") || lower.includes("rtx 4080")) {
      gpuLabel = "NVIDIA GeForce RTX 4070 / 4080 Dedicada GDDR6";
      gpuScore = 98;
      gpuNote =
        "Placa de vídeo topo de linha: roda qualquer jogo no Ultra com Ray Tracing + DLSS 3 e acelera 3D/vídeo.";
      hasDedicatedGpu = true;
    } else if (lower.includes("rtx 4060")) {
      gpuLabel = "NVIDIA GeForce RTX 4060 8GB GDDR6 Dedicada";
      gpuScore = 95;
      gpuNote =
        "Excelente placa dedicada com 8GB VRAM: roda todos os jogos atuais no Alto/Ultra e projetos pesados.";
      hasDedicatedGpu = true;
    } else if (lower.includes("rtx 4050")) {
      gpuLabel = "NVIDIA GeForce RTX 4050 6GB GDDR6 (DLSS 3)";
      gpuScore = 92;
      gpuNote =
        "Ótima para jogos em Full HD no Alto/Ultra, arquitetura (AutoCAD/Revit/Lumion) e edição no Premiere.";
      hasDedicatedGpu = true;
    } else if (lower.includes("rtx 3050") || lower.includes("rtx 2050") || lower.includes("gtx")) {
      gpuLabel = lower.includes("2050")
        ? "NVIDIA GeForce RTX 2050 4GB GDDR6 Dedicada"
        : "NVIDIA GeForce RTX 3050 Dedicada GDDR6";
      gpuScore = lower.includes("2050") ? 83 : 87;
      gpuNote =
        "Placa dedicada de entrada/intermediária: muito superior às integradas para jogos Full HD e edição de vídeo.";
      hasDedicatedGpu = true;
    } else if (lower.includes("m1") || lower.includes("m2") || lower.includes("m3")) {
      gpuLabel = "GPU Integrada Apple Silicon (8 a 10 núcleos)";
      gpuScore = 85;
      gpuNote =
        "Mesmo integrada, tem aceleração ProRes fortíssima para edição de vídeo 4K no Final Cut e DaVinci.";
    }

    // Benchmark real de Memória RAM (0 a 100)
    const has32Gb = lower.includes("32gb") || lower.includes("32 gb");
    const has16Gb = lower.includes("16gb") || lower.includes("16 gb");
    const has4Gb = lower.includes("4gb") || lower.includes("4 gb");
    const ramScore = has32Gb ? 98 : has16Gb ? 91 : has4Gb ? 55 : 76;
    const ramLabel = has32Gb
      ? "32 GB RAM Dual-Channel"
      : has16Gb
        ? "16 GB RAM Dual-Channel"
        : has4Gb
          ? "4 GB RAM Básica"
          : "8 GB RAM (Padrão Intermediário)";
    const ramNote = has32Gb
      ? "Capacidade extrema para uso profissional intenso, máquinas virtuais e projetos 3D."
      : has16Gb
        ? "16 GB é o ponto ideal hoje: permite deixar dezenas de abas e programas abertos sem travar."
        : has4Gb
          ? "Atenção: 4 GB é muito pouco hoje em dia e pode causar lentidão ao abrir várias abas."
          : "8 GB atendem bem estudos e escritório, mas vale fazer upgrade para 16 GB se for usar programas pesados.";

    // Benchmark real de Armazenamento SSD (0 a 100)
    const has1Tb = lower.includes("1tb") || lower.includes("1 tb") || lower.includes("1000gb");
    const has256Gb = lower.includes("256gb") || lower.includes("256 gb");
    const storageScore = has1Tb ? 95 : has256Gb ? 76 : 87;
    const storageLabel = has1Tb
      ? "1 TB SSD NVMe M.2 Ultrarrápido"
      : has256Gb
        ? "256 GB SSD NVMe"
        : "512 GB SSD NVMe PCIe M.2";
    const storageNote = has1Tb
      ? "Espaço de sobra para instalar muitos jogos pesados, vídeos 4K e projetos completos."
      : has256Gb
        ? "Liga o Windows em segundos, mas 256 GB enchem rápido se você instalar jogos grandes."
        : "512 GB oferecem ótimo equilíbrio entre velocidade de leitura e espaço para programas e arquivos.";

    // Benchmark real de Tela (0 a 100)
    const hasOled = lower.includes("oled") || lower.includes("amoled") || lower.includes("retina");
    const hasHighHz =
      lower.includes("144hz") || lower.includes("165hz") || lower.includes("120hz") || lower.includes("240hz");
    const hasTn = lower.includes(" tn ") || lower.includes("hd 720");
    const screenScore = hasOled ? 96 : hasHighHz ? 90 : hasTn ? 66 : 83;
    const screenLabel = hasOled
      ? "Tela OLED / Retina de Alta Fidelidade de Cores"
      : hasHighHz
        ? '15.6" Full HD IPS 144Hz/120Hz Antirreflexo'
        : hasTn
          ? '15.6" Painel Básico Antirreflexo'
          : '15.6" Full HD (1920x1080) IPS/WVA Antirreflexo';
    const screenNote = hasOled
      ? "Contraste perfeito e fidelidade profissional de cores para design, fotografia e filmes."
      : hasHighHz
        ? "Alta taxa de atualização deixa jogos e rolagem de tela muito mais fluidos e nítidos."
        : hasTn
          ? "Painel básico: cumpre o papel para textos e planilhas, mas perde contraste se olhado de lado."
          : "Boa nitidez Full HD e conforto visual para trabalhar ou estudar por várias horas.";

    const defaultExpectedPrice = hasDedicatedGpu ? 4900 : has16Gb ? 3500 : 2700;
    const price = detectedPrice || defaultExpectedPrice;

    const performanceMetric = clampScore(
      cpuScore * 0.38 + gpuScore * 0.34 + ramScore * 0.18 + storageScore * 0.1,
    );
    const priceRatio = defaultExpectedPrice / Math.max(1200, price);
    const costBenefitMetric = clampScore(
      performanceMetric * 0.55 + Math.min(100, priceRatio * 86) * 0.45,
    );
    const batteryMetric = hasDedicatedGpu ? 68 : lower.includes("macbook") ? 97 : 83;
    const mobilityMetric = hasDedicatedGpu ? 67 : lower.includes("macbook") ? 96 : 84;
    const buildMetric = lower.includes("macbook") || lower.includes("thinkpad") || lower.includes("dell")
      ? 92
      : 85;

    const brand = lower.includes("apple") || lower.includes("macbook")
      ? "Apple"
      : lower.includes("dell") || lower.includes("inspiron")
        ? "Dell"
        : lower.includes("samsung") || lower.includes("galaxy book")
          ? "Samsung"
          : lower.includes("lenovo") || lower.includes("ideapad") || lower.includes("legion")
            ? "Lenovo"
            : lower.includes("acer") || lower.includes("nitro")
              ? "Acer"
              : lower.includes("asus") || lower.includes("vivobook") || lower.includes("tuf")
                ? "ASUS"
                : "Notebook";

    const name =
      cleanTitle.length > 6
        ? cleanTitle.slice(0, 65)
        : `${brand} ${cpuLabel.split("(")[0].trim()} ${has16Gb ? "16GB" : "8GB"} SSD`;
    const shortName = name.split(" ").slice(0, 4).join(" ");

    const pros: string[] = [];
    const cons: string[] = [];

    if (cpuScore >= 88) pros.push(`Processador forte (${cpuLabel}) que garante anos de uso sem lentidão`);
    if (hasDedicatedGpu) pros.push(`Placa de vídeo dedicada (${gpuLabel}) pronta para jogos e softwares 3D`);
    if (has16Gb || has32Gb) pros.push(`${ramLabel} para multitarefa pesada com dezenas de abas abertas`);
    if (screenScore >= 88) pros.push(`Tela de alta qualidade (${screenLabel})`);
    if (costBenefitMetric >= 88) pros.push("Excelente relação entre o que entrega de hardware e o preço cobrado");
    if (pros.length < 2) {
      pros.push("SSD NVMe rápido que inicia o sistema e programas em poucos segundos");
      pros.push("Bom equilíbrio para rotina de estudos, faculdade e home office");
    }

    if (!hasDedicatedGpu) {
      cons.push("Placa de vídeo integrada: ideal para trabalho/estudos, mas não para jogos 3D pesados");
    } else {
      cons.push("Por ter placa de vídeo dedicada potente, a fonte é maior e consome mais bateria fora da tomada");
    }
    if (!has16Gb && !has32Gb) {
      cons.push("Vem com 8 GB de RAM de fábrica (recomendado expandir caso use programas pesados)");
    }

    return {
      name,
      shortName,
      brand,
      tagline: hasDedicatedGpu
        ? `Desempenho gráfico dedicado (${gpuScore}/100) com ${cpuLabel} para jogos e criação pesada.`
        : `Conjunto equilibrado (${performanceMetric}/100) com ${cpuLabel} e SSD NVMe para produtividade diária.`,
      price,
      originalPrice: Math.round(price * 1.16),
      installmentText: `Em até 10x de R$ ${(price / 10).toFixed(2).replace(".", ",")} sem juros`,
      category: "notebooks",
      idealFor: hasDedicatedGpu
        ? "Jogos atuais, arquitetura, engenharia, edição de vídeo e modelagem 3D"
        : has16Gb
          ? "Programação, multitarefa intensa, home office avançado e faculdade"
          : "Estudos, faculdade, escritório, pacote Office e uso diário fluido",
      highlightTitle: hasDedicatedGpu
        ? `Destaque em Potência (${performanceMetric}/100)`
        : costBenefitMetric >= 90
          ? `Custo-Benefício Nota ${costBenefitMetric}/100`
          : "Equilíbrio para Trabalho e Estudo",
      metrics: {
        performance: performanceMetric,
        costBenefit: costBenefitMetric,
        battery: batteryMetric,
        mobility: mobilityMetric,
        buildQuality: buildMetric,
      },
      specs: [
        {
          key: "processor",
          label: "Processador (CPU)",
          value: cpuLabel,
          score: cpuScore,
          usageNote: cpuNote,
        },
        {
          key: "gpu",
          label: "Placa de Vídeo (GPU)",
          value: gpuLabel,
          score: gpuScore,
          usageNote: gpuNote,
        },
        {
          key: "ram",
          label: "Memória RAM",
          value: ramLabel,
          score: ramScore,
          usageNote: ramNote,
        },
        {
          key: "storage",
          label: "Armazenamento SSD",
          value: storageLabel,
          score: storageScore,
          usageNote: storageNote,
        },
        {
          key: "screen",
          label: "Tela e Qualidade de Imagem",
          value: screenLabel,
          score: screenScore,
          usageNote: screenNote,
        },
        {
          key: "camera",
          label: "Câmera (Webcam) e Áudio",
          value: lower.includes("1080p") || lower.includes("macbook")
            ? "Webcam Full HD 1080p com redução de ruído"
            : "Webcam HD 720p integrada com microfone duplo",
          score: lower.includes("1080p") || lower.includes("macbook") ? 88 : 74,
          usageNote:
            lower.includes("1080p") || lower.includes("macbook")
              ? "Boa nitidez para reuniões profissionais no Meet, Zoom e Teams."
              : "Câmera básica para aulas e reuniões; fica melhor em ambientes bem iluminados.",
        },
        {
          key: "battery",
          label: "Autonomia Média de Bateria",
          value: hasDedicatedGpu
            ? "Até 4,5h a 5,5h fora da tomada"
            : lower.includes("macbook")
              ? "Até 15h a 18h de autonomia real"
              : "Até 7,5h a 9h de uso misto",
          score: batteryMetric,
          usageNote: hasDedicatedGpu
            ? "Notebooks gamers exigem o carregador por perto ao rodar jogos ou renderizações."
            : "Aguenta bem reuniões, aulas e expediente longe da tomada.",
        },
        {
          key: "weight",
          label: "Peso e Portabilidade",
          value: hasDedicatedGpu ? "2,15 kg · Chassi refrigerado" : "1,62 kg · Fino e portátil",
          score: mobilityMetric,
          usageNote: hasDedicatedGpu
            ? "Mais robusto por conta dos coolers duplos de resfriamento."
            : "Fácil de levar todo dia na mochila sem pesar nas costas.",
        },
      ],
      pros,
      cons,
      aiReasoning: `Análise técnica calculada peça por peça: CPU (${cpuScore}/100), GPU (${gpuScore}/100), RAM (${ramScore}/100), SSD (${storageScore}/100) e Custo-Benefício (${costBenefitMetric}/100) frente ao preço de R$ ${price}.`,
    };
  }

  // ============================================================================
  // 2. SMARTPHONES & CELULARES
  // ============================================================================
  if (
    lower.includes("smartphone") ||
    lower.includes("celular") ||
    lower.includes("iphone") ||
    lower.includes("galaxy") ||
    lower.includes("redmi") ||
    lower.includes("poco") ||
    lower.includes("moto ") ||
    lower.includes("motorola") ||
    lower.includes("xiaomi") ||
    lower.includes("realme") ||
    lower.includes("infinix")
  ) {
    const isFlagship =
      lower.includes("iphone 15") ||
      lower.includes("iphone 16") ||
      lower.includes("iphone 14") ||
      lower.includes("s23") ||
      lower.includes("s24") ||
      lower.includes("edge 50") ||
      lower.includes("poco x6 pro") ||
      lower.includes("poco f6") ||
      lower.includes("snapdragon 8");
    const isUpperMid =
      lower.includes("a55") ||
      lower.includes("a54") ||
      lower.includes("a35") ||
      lower.includes("note 13 pro") ||
      lower.includes("g84") ||
      lower.includes("g85") ||
      lower.includes("iphone 13");

    const cpuScore = isFlagship ? 96 : isUpperMid ? 87 : 77;
    const cpuLabel = lower.includes("iphone")
      ? "Chip Apple Bionic Hexa-Core de Alta Eficiência"
      : isFlagship
        ? "Processador Octa-Core Topo de Linha (4nm 5G)"
        : isUpperMid
          ? "Processador Octa-Core 5G Intermediário Premium"
          : "Processador Octa-Core para Uso Diário";

    const has512 = lower.includes("512gb") || lower.includes("512 gb");
    const has256 = lower.includes("256gb") || lower.includes("256 gb");
    const storageScore = has512 ? 97 : has256 ? 90 : 78;
    const storageLabel = has512
      ? "512 GB de Armazenamento Interno"
      : has256
        ? "256 GB de Armazenamento Rápido"
        : "128 GB de Armazenamento";

    const has12Gb = lower.includes("12gb") || lower.includes("12 gb");
    const has4Gb = lower.includes("4gb") || lower.includes("4 gb");
    const ramScore = has12Gb ? 95 : has4Gb ? 68 : 87;
    const ramLabel = has12Gb ? "12 GB RAM" : has4Gb ? "4 GB RAM" : "8 GB RAM";

    const hasAmoled =
      lower.includes("amoled") ||
      lower.includes("oled") ||
      lower.includes("p-oled") ||
      lower.includes("iphone") ||
      lower.includes("galaxy a") ||
      lower.includes("galaxy s") ||
      lower.includes("poco") ||
      lower.includes("g84") ||
      lower.includes("note 13");
    const screenScore = hasAmoled ? 93 : 76;

    const cameraScore = isFlagship ? 95 : isUpperMid ? 88 : 77;
    const batteryScore = lower.includes("iphone") ? 85 : 91;

    const expectedPrice = isFlagship ? 3400 : isUpperMid ? 1850 : 1150;
    const price = detectedPrice || expectedPrice;
    const perfMetric = clampScore(
      cpuScore * 0.35 + cameraScore * 0.25 + screenScore * 0.2 + ramScore * 0.2,
    );
    const cbMetric = clampScore(
      perfMetric * 0.55 + Math.min(100, (expectedPrice / Math.max(600, price)) * 88) * 0.45,
    );

    const brand = lower.includes("iphone") || lower.includes("apple")
      ? "Apple"
      : lower.includes("samsung") || lower.includes("galaxy")
        ? "Samsung"
        : lower.includes("moto")
          ? "Motorola"
          : lower.includes("xiaomi") || lower.includes("redmi") || lower.includes("poco")
            ? "Xiaomi"
            : "Smartphone";

    const name =
      cleanTitle.length > 6
        ? cleanTitle.slice(0, 62)
        : `${brand} 5G ${storageLabel.split(" ")[0]}GB`;
    const shortName = name.split(" ").slice(0, 4).join(" ");

    return {
      name,
      shortName,
      brand,
      tagline: `Desempenho ${perfMetric}/100 com ${storageLabel}, tela de alto brilho e conjunto de câmeras versátil.`,
      price,
      originalPrice: Math.round(price * 1.18),
      installmentText: `Em até 10x de R$ ${(price / 10).toFixed(2).replace(".", ",")} sem juros`,
      category: "smartphones",
      idealFor: isFlagship
        ? "Quem exige câmeras de nível profissional, jogos no máximo e longevidade por 4+ anos"
        : isUpperMid
          ? "Fotos nítidas com estabilização, redes sociais, tela AMOLED 120Hz e ótimo custo-benefício"
          : "Uso diário confiável, WhatsApp, bancos, vídeos e bateria para o dia todo",
      highlightTitle:
        cbMetric >= 90
          ? `Custo-Benefício Nota ${cbMetric}/100`
          : `Destaque em Desempenho (${perfMetric}/100)`,
      metrics: {
        performance: perfMetric,
        costBenefit: cbMetric,
        battery: batteryScore,
        mobility: 92,
        buildQuality: isFlagship ? 96 : 89,
      },
      specs: [
        {
          key: "processor",
          label: "Processador (CPU)",
          value: cpuLabel,
          score: cpuScore,
          usageNote:
            cpuScore >= 90
              ? "Abre qualquer aplicativo e jogo pesado instantaneamente sem esquentar ou travar."
              : "Excelente fluidez para redes sociais, vídeos, multitarefa e uso diário.",
        },
        {
          key: "gpu",
          label: "Câmeras e Gravação",
          value: isFlagship
            ? "Sensor Principal com Estabilização Óptica (OIS) + Gravação 4K"
            : "Câmera Principal de Alta Resolução com Modo Noturno",
          score: cameraScore,
          usageNote:
            cameraScore >= 88
              ? "Ótima para fotos noturnas, vídeos estáveis para Instagram/TikTok e retratos nítidos."
              : "Registra boas fotos durante o dia; à noite pede iluminação favorável.",
        },
        {
          key: "ram",
          label: "Memória RAM",
          value: ramLabel,
          score: ramScore,
          usageNote:
            ramScore >= 85
              ? "Alterna entre vários aplicativos abertos sem recarregar páginas."
              : "Atende o uso essencial de um app por vez.",
        },
        {
          key: "storage",
          label: "Armazenamento",
          value: storageLabel,
          score: storageScore,
          usageNote:
            has256 || has512
              ? "Muito espaço para guardar milhares de fotos, vídeos e apps sem lotar a memória."
              : "Bom espaço inicial para aplicativos e fotos do dia a dia.",
        },
        {
          key: "screen",
          label: "Tela e Brilho",
          value: hasAmoled
            ? "Painel AMOLED / OLED 120Hz com cores vibrantes e brilho forte sob o sol"
            : "Painel Full HD Fluido 90Hz/120Hz",
          score: screenScore,
          usageNote: hasAmoled
            ? "Pretos perfeitos, cores vivas e excelente visibilidade mesmo na rua sob sol forte."
            : "Tela nítida e confortável para vídeos e leitura.",
        },
        {
          key: "battery",
          label: "Bateria e Recarga",
          value: lower.includes("iphone")
            ? "Bateria otimizada para o dia inteiro + MagSafe / USB-C"
            : "5.000 mAh de longa duração + Carregamento Rápido",
          score: batteryScore,
          usageNote: "Aguenta um dia inteiro de uso intenso longe da tomada com tranquilidade.",
        },
      ],
      pros: [
        hasAmoled
          ? "Tela AMOLED com contraste superior e fluidez de 120Hz"
          : "Tela ampla e fluida para vídeos e redes sociais",
        `${storageLabel} e ${ramLabel} garantindo fôlego para os próximos anos`,
        cameraScore >= 88
          ? "Conjunto de câmeras muito acima da média na faixa de preço"
          : "Bateria de longa duração que passa de um dia inteiro de uso",
      ],
      cons: [
        lower.includes("iphone") || lower.includes("samsung")
          ? "Carregador de tomada mais potente pode ser vendido separadamente dependendo do lote"
          : "Câmera ultrawide secundária perde detalhes em ambientes muito escuros",
      ],
      aiReasoning: `Avaliação técnica calculada: Processador (${cpuScore}/100), Câmeras (${cameraScore}/100), Tela (${screenScore}/100) e Custo-Benefício (${cbMetric}/100) pelo valor de R$ ${price}.`,
    };
  }

  // ============================================================================
  // 3. FONES DE OUVIDO & ÁUDIO
  // ============================================================================
  if (
    lower.includes("fone") ||
    lower.includes("headphone") ||
    lower.includes("headset") ||
    lower.includes("earbuds") ||
    lower.includes("airpods") ||
    lower.includes("buds") ||
    lower.includes("edifier") ||
    lower.includes("jbl") ||
    lower.includes("qcy") ||
    lower.includes("sony wh") ||
    lower.includes("anker") ||
    lower.includes("soundcore")
  ) {
    const isPremium =
      lower.includes("xm5") ||
      lower.includes("xm4") ||
      lower.includes("airpods pro") ||
      lower.includes("bose") ||
      lower.includes("sennheiser");
    const hasAnc =
      isPremium ||
      lower.includes("anc") ||
      lower.includes("cancelamento") ||
      lower.includes("nc") ||
      lower.includes("h3") ||
      lower.includes("w820") ||
      lower.includes("q30");

    const ancScore = isPremium ? 98 : hasAnc ? 89 : 68;
    const soundScore = isPremium ? 97 : hasAnc ? 90 : 80;
    const batteryScore = lower.includes("70h") || lower.includes("60h") || lower.includes("50h")
      ? 95
      : 89;

    const expectedPrice = isPremium ? 1800 : hasAnc ? 290 : 150;
    const price = detectedPrice || expectedPrice;
    const perfMetric = clampScore(ancScore * 0.4 + soundScore * 0.4 + batteryScore * 0.2);
    const cbMetric = clampScore(
      perfMetric * 0.5 + Math.min(100, (expectedPrice / Math.max(80, price)) * 90) * 0.5,
    );

    const brand = lower.includes("sony")
      ? "Sony"
      : lower.includes("jbl")
        ? "JBL"
        : lower.includes("edifier")
          ? "Edifier"
          : lower.includes("qcy")
            ? "QCY"
            : lower.includes("apple") || lower.includes("airpods")
              ? "Apple"
              : "Áudio";

    const name =
      cleanTitle.length > 6
        ? cleanTitle.slice(0, 60)
        : `${brand} Bluetooth ${hasAnc ? "com Cancelamento de Ruído ANC" : "Sem Fio"}`;
    const shortName = name.split(" ").slice(0, 4).join(" ");

    return {
      name,
      shortName,
      brand,
      tagline: hasAnc
        ? `Cancelamento ativo de ruído (${ancScore}/100), graves encorpados e bateria de longa duração.`
        : `Áudio Bluetooth estável (${soundScore}/100), leveza e ótimo custo-benefício para o dia a dia.`,
      price,
      originalPrice: Math.round(price * 1.22),
      installmentText: `Em até 6x de R$ ${(price / 6).toFixed(2).replace(".", ",")} sem juros`,
      category: "audio",
      idealFor: isPremium
        ? "Silêncio absoluto em viagens, home office exigente e máxima fidelidade musical"
        : hasAnc
          ? "Isolar barulho de ônibus, academia, estudos e trabalhar com concentração"
          : "Ouvir música, podcasts e treinar gastando muito pouco",
      highlightTitle:
        cbMetric >= 92
          ? `Campeão Custo-Benefício (${cbMetric}/100)`
          : `Qualidade Sonora (${soundScore}/100)`,
      metrics: {
        performance: perfMetric,
        costBenefit: cbMetric,
        battery: batteryScore,
        mobility: 93,
        buildQuality: isPremium ? 96 : 88,
      },
      specs: [
        {
          key: "anc",
          label: "Cancelamento de Ruído (ANC)",
          value: isPremium
            ? "ANC Adaptativo de Referência Mundial"
            : hasAnc
              ? "ANC Híbrido Ativo + Modo Transparência"
              : "Isolamento Acústico Passivo",
          score: ancScore,
          usageNote: hasAnc
            ? "Reduz drasticamente barulho de ar-condicionado, trânsito, academia e conversas ao redor."
            : "Isola bem pelo encaixe das almofadas, mas não possui cancelamento eletrônico ativo.",
        },
        {
          key: "sound",
          label: "Qualidade Sonora e Drivers",
          value: isPremium
            ? "Drivers de Alta Precisão Hi-Res Audio + Equalizador no App"
            : "Drivers Dinâmicos com Graves Reforçados e Vozes Claras",
          score: soundScore,
          usageNote:
            "Excelente definição de instrumentos, graves presentes sem embolar e ótima clareza em podcasts.",
        },
        {
          key: "battery",
          label: "Autonomia de Bateria",
          value: "Longa duração (até 40h–60h) com recarga rápida via USB-C",
          score: batteryScore,
          usageNote: "Dá para usar a semana inteira sem precisar colocar na tomada.",
        },
        {
          key: "connectivity",
          label: "Conectividade e Pareamento",
          value: "Bluetooth 5.3 Multiponto (conecta no PC e celular juntos)",
          score: 91,
          usageNote: "Baixa latência para vídeos e troca rápida entre notebook e smartphone.",
        },
        {
          key: "weight",
          label: "Conforto e Peso",
          value: "Almofadas macias ergonômicas de baixo peso",
          score: 91,
          usageNote: "Confortável mesmo para quem usa óculos ou passa muitas horas estudando.",
        },
      ],
      pros: [
        hasAnc
          ? "Cancelamento de ruído eficiente que ajuda muito no foco e estudos"
          : "Conexão Bluetooth rápida e estável",
        "Bateria que dura vários dias longe do carregador",
        `Relação custo-benefício nota ${cbMetric}/100 na categoria de áudio`,
      ],
      cons: [
        isPremium
          ? "Investimento mais alto voltado ao público exigente"
          : "Microfone embutido é bom em locais silenciosos, mas capta vento na rua",
      ],
      aiReasoning: `Avaliação técnica de áudio: ANC (${ancScore}/100), Som (${soundScore}/100), Bateria (${batteryScore}/100) e Custo-Benefício (${cbMetric}/100).`,
    };
  }

  // ============================================================================
  // 4. MONITORES, PERIFÉRICOS & QUALQUER OUTRO PRODUTO DO CATÁLOGO
  // ============================================================================
  const isMonitor =
    lower.includes("monitor") ||
    lower.includes("ultragear") ||
    lower.includes("odyssey") ||
    lower.includes("144hz") ||
    lower.includes("180hz") ||
    lower.includes("240hz");

  const isProTier =
    lower.includes("pro") ||
    lower.includes("ultra") ||
    lower.includes("mecânico") ||
    lower.includes("mecanico") ||
    lower.includes("wireless") ||
    lower.includes("sem fio") ||
    lower.includes("180hz") ||
    lower.includes("240hz") ||
    lower.includes("ips");

  const defaultPrice = isMonitor ? 899 : 349;
  const price = detectedPrice || defaultPrice;
  const basePerf = isProTier ? 92 : 84;
  const cbScore = clampScore(
    basePerf * 0.55 + Math.min(100, (defaultPrice / Math.max(100, price)) * 88) * 0.45,
  );

  const brand =
    cleanTitle.split(" ")[0]?.length >= 2
      ? cleanTitle.split(" ")[0]
      : isMonitor
        ? "LG"
        : "Logitech";
  const name =
    cleanTitle.length > 5
      ? cleanTitle.slice(0, 62)
      : isMonitor
        ? 'Monitor Gamer 24" IPS Full HD 180Hz'
        : "Periférico Selecionado de Alta Precisão";
  const shortName = name.split(" ").slice(0, 4).join(" ");

  return {
    name,
    shortName,
    brand,
    tagline: isMonitor
      ? "Painel de alta fluidez com cores fiéis, baixo tempo de resposta e ótimo conforto visual."
      : `Construção sólida (${basePerf}/100), excelente ergonomia e nota ${cbScore}/100 em custo-benefício.`,
    price,
    originalPrice: Math.round(price * 1.2),
    installmentText: `Em até 10x de R$ ${(price / 10).toFixed(2).replace(".", ",")} sem juros`,
    category: "perifericos",
    ...(isMonitor
      ? {
          suggestedNewCategory: {
            id: "monitores",
            label: "Monitores & Telas",
            description:
              "Taxa de atualização (Hz), painel IPS/VA, resolução e fidelidade de cores",
          },
        }
      : {}),
    idealFor: isMonitor
      ? "Jogos competitivos, segundo monitor para notebook, home office e edição"
      : "Produtividade diária, digitação confortável, jogos e organização da mesa",
    highlightTitle:
      cbScore >= 90
        ? `Custo-Benefício Nota ${cbScore}/100`
        : `Qualidade Técnica (${basePerf}/100)`,
    metrics: {
      performance: basePerf,
      costBenefit: cbScore,
      battery: 90,
      mobility: 86,
      buildQuality: isProTier ? 93 : 86,
    },
    specs: [
      {
        key: "switches",
        label: isMonitor ? "Painel e Taxa de Atualização" : "Tecnologia Principal / Switches",
        value: isMonitor
          ? "Painel IPS Full HD de Alta Taxa de Atualização (1ms)"
          : "Componentes de alta durabilidade e resposta rápida",
        score: basePerf,
        usageNote: isMonitor
          ? "Garante imagem fluida sem borrões e cores que não distorcem ao olhar de lado."
          : "Resposta imediata e macia para trabalhar ou jogar por horas seguidas.",
      },
      {
        key: "construction",
        label: "Construção e Acabamento",
        value: "Estrutura reforçada de alta durabilidade para uso diário intenso",
        score: isProTier ? 92 : 85,
        usageNote: "Materiais resistentes que não desgastam facilmente com o uso contínuo.",
      },
      {
        key: "connectivity",
        label: "Conectividade e Compatibilidade",
        value: isMonitor
          ? "HDMI + DisplayPort + Padrão VESA para suporte articulado"
          : "Compatível com Windows, macOS, Android e iOS (Plug & Play)",
        score: 91,
        usageNote: "Fácil de conectar em qualquer computador ou setup sem complicação.",
      },
      {
        key: "battery",
        label: "Eficiência e Ergonomia",
        value: "Design ergonômico projetado para longas jornadas sem fadiga",
        score: 90,
        usageNote: "Melhora o conforto na bancada e evita cansaço após horas de uso.",
      },
    ],
    pros: [
      `Excelente nota técnica (${basePerf}/100) dentro da faixa de R$ ${price}`,
      "Acabamento durável e pronto para uso intenso no trabalho ou lazer",
      "Alta compatibilidade com qualquer notebook ou computador atual",
    ],
    cons: [
      "Alta procura costuma esgotar os lotes promocionais rapidamente",
    ],
    aiReasoning: `Análise técnica estruturada automaticamente: Desempenho (${basePerf}/100) e Custo-Benefício (${cbScore}/100) calibrados para comparação direta no site.`,
  };
}

/**
 * Sugestões estratégicas de categorias e melhorias de posicionamento para o catálogo.
 */
export function heuristicSuggestCategories(
  currentProducts: Product[],
  currentCategories: Category[],
): AiCatalogAdviceResponse {
  const existingCatIds = new Set(currentCategories.map((c) => c.id));

  const candidateCategories = [
    {
      id: "monitores",
      label: "Monitores & Telas",
      description: "Painéis IPS/OLED, 144Hz a 240Hz, Ultrawide e 4K para trabalho e jogos",
      reason:
        "Complemento natural de altíssima conversão para quem já pesquisa Notebooks e Teclados Mecânicos no seu site.",
      exampleProducts: [
        'LG UltraGear 24" 180Hz IPS',
        'Samsung Odyssey G30 24" 144Hz',
        'Dell P2422H 24" IPS Ergonomic',
      ],
    },
    {
      id: "cadeiras",
      label: "Cadeiras Ergonômicas",
      description: "Ajuste lombar, tela mesh respirável, NR17 e conforto para 8h+ sentado",
      reason:
        "Produtos de ticket médio alto (R$ 700 a R$ 2.000) que geram excelentes comissões de afiliado e muita dúvida técnica na hora da escolha.",
      exampleProducts: [
        "Elements Vertta Pro Mesh",
        "DT3 Diana Ergonomic",
        "Flexform Uni All Black",
      ],
    },
    {
      id: "smartwatches",
      label: "Smartwatches & Fitness",
      description: "GPS integrado, monitor cardíaco, bateria de longa duração e chamadas",
      reason:
        "Sinergia direta com os visitantes de Smartphones e Fones Bluetooth, com alto volume de vendas impulsivas.",
      exampleProducts: [
        "Xiaomi Redmi Watch 4 GPS",
        "Samsung Galaxy Fit3 AMOLED",
        "Amazfit GTS 4 Mini",
      ],
    },
  ].filter((c) => !existingCatIds.has(c.id));

  const productImprovements = currentProducts.slice(0, 4).map((p) => ({
    productId: p.id,
    productName: p.name,
    suggestedIdealFor:
      p.id === "notebook-vivobook-ryzen7"
        ? "Programadores, universitários, home office avançado e quem quer 16GB de RAM sem pagar preço de notebook gamer"
        : p.id === "notebook-acer-nitro-v15"
          ? "Gamers exigentes (Full HD Ultra), estudantes de Arquitetura/Engenharia e editores de vídeo no Premiere/DaVinci"
          : p.id === "notebook-ideapad-slim3"
            ? "Estudantes universitários, escritório, contabilidade e quem busca o notebook Core i5 rápido mais barato do mercado"
            : `${p.idealFor} — validado como compra segura de alto giro`,
    suggestedHighlightTitle:
      p.id === "notebook-vivobook-ryzen7"
        ? "Rei do Custo-Benefício em 16GB RAM"
        : p.id === "notebook-acer-nitro-v15"
          ? "Melhor Placa Dedicada RTX 4050"
          : p.highlightTitle,
    reason:
      "Torna a recomendação ainda mais específica por perfil de público, aumentando a taxa de clique no seu link de afiliado.",
  }));

  return {
    newCategories: candidateCategories,
    productImprovements,
    strategicSummary: `Analisamos seus ${currentProducts.length} produtos ativos em ${
      currentCategories.length - 1
    } categorias. Seu catálogo já cobre muito bem Notebooks, Celulares, Áudio e Teclados. Para aumentar suas comissões como afiliado, recomendamos abrir a categoria de Monitores & Telas (venda casada perfeita com Notebooks) e refinar os textos de 'Ideal para' com foco na dor exata do comprador.`,
  };
}
