import type { Category, Product } from "../types/product";
import {
  createHeadphoneSvg,
  createKeyboardSvg,
  createNotebookSvg,
  createSmartphoneSvg,
} from "./productImages";

export const categories: Category[] = [
  {
    id: "all",
    label: "Todas as Categorias",
    description: "Curadoria completa com comparativos técnicos no site",
  },
  {
    id: "notebooks",
    label: "Notebooks",
    description: "Processador, placa de vídeo, câmera, RAM e bateria lado a lado",
  },
  {
    id: "smartphones",
    label: "Smartphones",
    description: "Câmeras, processador 5G, tela AMOLED e bateria",
  },
  {
    id: "audio",
    label: "Fones & Áudio",
    description: "Cancelamento ativo de ruído (ANC), drivers e autonomia",
  },
  {
    id: "perifericos",
    label: "Periféricos & Setup",
    description: "Teclados mecânicos, switches, conectividade e ergonomia",
  },
];

export const products: Product[] = [
  // ===================== NOTEBOOKS =====================
  {
    id: "notebook-vivobook-ryzen7",
    name: "ASUS Vivobook 15 Ryzen 7 16GB",
    shortName: "ASUS Vivobook 15 R7",
    brand: "ASUS",
    tagline:
      "Processador AMD Ryzen 7 de 8 núcleos e 16GB RAM: o campeão em custo-benefício para trabalho, faculdade e multitarefa pesada.",
    image: createNotebookSvg({
      model: "Vivobook 15",
      chip: "AMD Ryzen 7 7730U · 8 Núcleos",
      gpu: "Radeon Graphics + 16GB RAM",
      screenSpec: '15.6" Full HD IPS · SSD 512GB NVMe',
      chassisColor: "#334155",
      accentColor: "#b87333",
    }),
    price: 3199,
    originalPrice: 3799,
    installmentText: "Em até 10x de R$ 319,90 sem juros",
    category: "notebooks",
    affiliateUrl: "https://exemplo.com/afiliado/vivobook-ryzen7",
    featured: true,
    idealFor:
      "Trabalho intenso, programação, faculdade e multitarefa com dezenas de abas",
    highlightTitle: "Melhor Custo-Benefício Geral",
    rating: 4.8,
    reviewCount: 1420,
    metrics: {
      performance: 84,
      costBenefit: 97,
      battery: 83,
      mobility: 82,
      buildQuality: 85,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "AMD Ryzen 7 7730U (8 núcleos / 16 threads, até 4.5 GHz)",
        score: 86,
        usageNote:
          "Melhor para multitarefa pesada, programação, planilhas grandes e abrir dezenas de abas sem travar, gastando pouca energia.",
      },
      {
        key: "gpu",
        label: "Placa de Vídeo (GPU)",
        value: "AMD Radeon Vega 8 Integrada",
        score: 68,
        usageNote:
          "Boa para edição leve de fotos/vídeos (Canva, CapCut) e jogos leves (Valorant, LoL), mas não é indicada para jogos pesados no ultra.",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "16 GB DDR4 3200MHz (expansível)",
        score: 88,
        usageNote:
          "Já vem com 16 GB prontos para trabalhar com folga por anos, sem precisar gastar com upgrade logo após comprar.",
      },
      {
        key: "storage",
        label: "Armazenamento SSD",
        value: "512 GB SSD NVMe PCIe 3.0",
        score: 85,
        usageNote:
          "Liga o Windows em poucos segundos e tem espaço amplo para documentos, programas e projetos.",
      },
      {
        key: "screen",
        label: "Tela e Qualidade de Imagem",
        value: '15.6" Full HD (1920x1080) IPS Antirreflexo 60Hz',
        score: 80,
        usageNote:
          "Painel IPS não distorce as cores quando visto de lado; ótima para estudar e trabalhar por horas sem cansar a vista.",
      },
      {
        key: "camera",
        label: "Câmera (Webcam) e Áudio",
        value: "Webcam HD 720p com tampa física de privacidade + Cancelamento IA no microfone",
        score: 74,
        usageNote:
          "A câmera não é tão boa em ambientes escuros (resolução 720p básica), mas o microfone filtra barulho externo muito bem em reuniões.",
      },
      {
        key: "battery",
        label: "Autonomia Média de Bateria",
        value: "Até 9 horas de uso misto (42Wh)",
        score: 83,
        usageNote:
          "Ganha dos notebooks gamers em duração fora da tomada, aguentando um turno inteiro de faculdade ou escritório.",
      },
      {
        key: "weight",
        label: "Peso e Portabilidade",
        value: "1,70 kg · Chassi fino com abertura 180°",
        score: 82,
        usageNote:
          "Fácil de levar na mochila todos os dias e abre em 180° sobre a mesa.",
      },
    ],
    pros: [
      "Processador Ryzen 7 muito rápido e frio para a faixa de R$ 3.199",
      "Já vem com 16 GB de RAM de fábrica sem precisar de upgrade imediato",
      "Certificação militar de durabilidade US MIL-STD 810H",
    ],
    cons: [
      "Placa de vídeo integrada (não indicado para jogos pesados no ultra)",
      "Câmera 720p é apenas básica para videochamadas",
    ],
  },
  {
    id: "notebook-acer-nitro-v15",
    name: "Acer Nitro V15 RTX 4050 i5-13420H",
    shortName: "Acer Nitro V15 RTX 4050",
    brand: "Acer",
    tagline:
      "Placa de vídeo dedicada NVIDIA RTX 4050 6GB, tela 144Hz e RAM DDR5: a escolha definitiva para jogos, edição de vídeo 4K e 3D.",
    image: createNotebookSvg({
      model: "Nitro V15 Gamer",
      chip: "Intel Core i5-13420H · 13ª Geração",
      gpu: "NVIDIA GeForce RTX 4050 6GB",
      screenSpec: '15.6" Full HD IPS 144Hz · 16GB DDR5',
      chassisColor: "#18181b",
      accentColor: "#d97706",
    }),
    price: 4599,
    originalPrice: 5499,
    installmentText: "Em até 12x de R$ 383,25 sem juros",
    category: "notebooks",
    affiliateUrl: "https://exemplo.com/afiliado/acer-nitro-v15",
    featured: true,
    idealFor:
      "Jogos pesados, arquitetura (AutoCAD/Revit), edição de vídeo 4K e IA",
    highlightTitle: "Melhor Placa de Vídeo & Processador",
    rating: 4.9,
    reviewCount: 980,
    metrics: {
      performance: 98,
      costBenefit: 91,
      battery: 64,
      mobility: 66,
      buildQuality: 90,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "Intel Core i5-13420H Série H (8 núcleos, até 4.6 GHz, 45W)",
        score: 95,
        usageNote:
          "Processador de alta potência (Série H): ganha disparado em tarefas pesadas como renderização de vídeo, compilação e jogos.",
      },
      {
        key: "gpu",
        label: "Placa de Vídeo (GPU)",
        value: "NVIDIA GeForce RTX 4050 6GB GDDR6 Dedicada (com DLSS 3)",
        score: 98,
        usageNote:
          "Ganha com folga neste quesito: essa placa dedicada é a melhor para rodar jogos atuais no alto, Premiere, Blender, AutoCAD e Revit.",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "16 GB DDR5 5200MHz Dual-Channel (expansível até 32GB)",
        score: 96,
        usageNote:
          "Usa memória DDR5 de nova geração (muito mais rápida que DDR4) e permite expandir até 32 GB no futuro.",
      },
      {
        key: "storage",
        label: "Armazenamento SSD",
        value: "512 GB SSD NVMe PCIe Gen4 x4 (slot M.2 extra livre)",
        score: 94,
        usageNote:
          "SSD Gen4 ultrarrápido para carregar mapas de jogos e arquivos pesados, além de ter espaço livre para instalar um 2º SSD.",
      },
      {
        key: "screen",
        label: "Tela e Qualidade de Imagem",
        value: '15.6" Full HD IPS 144Hz fluida Antirreflexo',
        score: 94,
        usageNote:
          "Ganha em fluidez: a tela de 144Hz é mais que o dobro mais suave que telas comuns de 60Hz, ideal para jogos competitivos.",
      },
      {
        key: "camera",
        label: "Câmera (Webcam) e Áudio",
        value: "Webcam HD 720p com redução temporal de ruído (TNR)",
        score: 72,
        usageNote:
          "A câmera não é o foco deste notebook (é 720p simples para chamadas rápidas) e não tem tampa física na lente.",
      },
      {
        key: "battery",
        label: "Autonomia Média de Bateria",
        value: "Até 5 a 6 horas em uso leve (57Wh)",
        score: 64,
        usageNote:
          "Perde em autonomia: por ter placa de vídeo forte e ventoinhas duplas, exige ficar na tomada durante jogos ou projetos pesados.",
      },
      {
        key: "weight",
        label: "Peso e Portabilidade",
        value: "2,11 kg · Refrigeração dupla com duas ventoinhas",
        score: 66,
        usageNote:
          "É o mais pesado na mochila (2,11 kg mais a fonte grande), pensado para priorizar resfriamento e força bruta.",
      },
    ],
    pros: [
      "Placa dedicada RTX 4050 6GB com DLSS 3 roda qualquer jogo atual e softwares 3D",
      "Memória RAM DDR5 de alta velocidade + tela IPS 144Hz super fluida",
      "Dois slots de SSD NVMe para expansão fácil no futuro",
    ],
    cons: [
      "Mais pesado na mochila (2,11 kg) e câmera webcam apenas básica",
      "Autonomia de bateria menor por conta da placa de vídeo dedicada",
    ],
  },
  {
    id: "notebook-ideapad-slim3",
    name: "Lenovo IdeaPad Slim 3i Core i5",
    shortName: "Lenovo IdeaPad Slim 3i",
    brand: "Lenovo",
    tagline:
      "O melhor notebook de entrada com processador Intel Série H, SSD rápido de 512GB e preço acessível para estudos e escritório.",
    image: createNotebookSvg({
      model: "IdeaPad Slim 3i",
      chip: "Intel Core i5-12450H · 8 Núcleos",
      gpu: "Intel UHD Graphics · 8GB LPDDR5",
      screenSpec: '15.6" Full HD Antirreflexo · 1,62 kg',
      chassisColor: "#64748b",
      accentColor: "#2c5142",
    }),
    price: 2549,
    originalPrice: 3099,
    installmentText: "Em até 12x de R$ 212,41 sem juros",
    category: "notebooks",
    affiliateUrl: "https://exemplo.com/afiliado/ideapad-slim3",
    featured: false,
    idealFor:
      "Estudantes, pacote Office, aulas online, pesquisas e orçamento enxuto",
    highlightTitle: "Escolha Econômica Inteligente",
    rating: 4.7,
    reviewCount: 2150,
    metrics: {
      performance: 74,
      costBenefit: 92,
      battery: 86,
      mobility: 86,
      buildQuality: 78,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "Intel Core i5-12450H (8 núcleos, até 4.4 GHz)",
        score: 80,
        usageNote:
          "Ganha entre os notebooks baratos: é muito rápido para abrir PDFs, Word, Excel, sistema de gestão e navegador sem engasgos.",
      },
      {
        key: "gpu",
        label: "Placa de Vídeo (GPU)",
        value: "Intel UHD Graphics Integrada",
        score: 58,
        usageNote:
          "Placa básica integrada: serve perfeitamente para vídeos em Full HD, aulas e trabalho de escritório, mas não serve para jogos 3D.",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "8 GB LPDDR5 4800MHz",
        score: 72,
        usageNote:
          "Atende muito bem estudos e uso cotidiano, mas fica atrás dos modelos de 16 GB se você abrir muitos programas pesados juntos.",
      },
      {
        key: "storage",
        label: "Armazenamento SSD",
        value: "512 GB SSD NVMe PCIe 4.0",
        score: 86,
        usageNote:
          "Ótimo ponto forte pelo preço: já traz 512 GB rápidos em vez dos 256 GB comuns nessa faixa de valor.",
      },
      {
        key: "screen",
        label: "Tela e Qualidade de Imagem",
        value: '15.6" Full HD (1920x1080) Antirreflexo 60Hz',
        score: 70,
        usageNote:
          "Boa nitidez para leitura de textos e planilhas, porém o contraste e fidelidade de cores são mais simples que nos painéis IPS.",
      },
      {
        key: "camera",
        label: "Câmera (Webcam) e Áudio",
        value: "Webcam 720p com obturador físico de privacidade + Dolby Audio",
        score: 75,
        usageNote:
          "A câmera não é tão boa para gravações (é 720p simples), mas ganha praticidade para aulas online por ter trava física na lente.",
      },
      {
        key: "battery",
        label: "Autonomia Média de Bateria",
        value: "Até 10 horas de uso leve + Carga Rápida (15 min = 2h)",
        score: 86,
        usageNote:
          "Excelente para rotina de estudos: carrega rápido no intervalo e aguenta várias aulas longe da tomada.",
      },
      {
        key: "weight",
        label: "Peso e Portabilidade",
        value: "1,62 kg · Design fino de 1,79 cm",
        score: 86,
        usageNote:
          "Mais leve e fácil de carregar no transporte público ou faculdade do que o ASUS e o Acer Nitro.",
      },
    ],
    pros: [
      "Ganha no menor preço entregando processador Core i5 Série H rápido",
      "Já conta com SSD de 512 GB rápido e webcam com tampa física de privacidade",
      "Leve (1,62 kg) e silencioso para levar à faculdade ou trabalho",
    ],
    cons: [
      "8 GB de RAM soldados (bom para estudos/Office, mas limita uso profissional pesado)",
      "Placa de vídeo e tela são voltadas para estudo, não para jogos ou design",
    ],
  },
  {
    id: "notebook-macbook-air-m2",
    name: 'Apple MacBook Air 13" Chip M2 16GB',
    shortName: "MacBook Air M2 16GB",
    brand: "Apple",
    tagline:
      "Bateria de até 18 horas, câmera 1080p nítida, tela Liquid Retina impecável e 1,24 kg: imbatível em mobilidade e longevidade.",
    image: createNotebookSvg({
      model: "MacBook Air M2",
      chip: "Chip Apple M2 · 8-Core CPU",
      gpu: "GPU 8-Core + 16GB Unificada",
      screenSpec: '13.6" Liquid Retina IPS · 18h Bateria',
      chassisColor: "#94a3b8",
      accentColor: "#38bdf8",
    }),
    price: 6499,
    originalPrice: 7699,
    installmentText: "Em até 10x de R$ 649,90 sem juros",
    category: "notebooks",
    affiliateUrl: "https://exemplo.com/afiliado/macbook-air-m2",
    featured: false,
    idealFor:
      "Profissionais em trânsito, criadores de conteúdo, desenvolvimento iOS/Web e máxima bateria",
    highlightTitle: "Campeão em Bateria, Câmera & Mobilidade",
    rating: 4.9,
    reviewCount: 740,
    metrics: {
      performance: 92,
      costBenefit: 80,
      battery: 99,
      mobility: 99,
      buildQuality: 99,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "Chip Apple M2 (8 núcleos CPU + Neural Engine 16 núcleos)",
        score: 94,
        usageNote:
          "Melhor eficiência do mercado: entrega velocidade máxima mesmo fora da tomada, sem esquentar e sem barulho de ventoinha.",
      },
      {
        key: "gpu",
        label: "Placa de Vídeo (GPU)",
        value: "GPU Apple M2 de 8 núcleos com motor de mídia ProRes",
        score: 86,
        usageNote:
          "Excelente para edição de vídeo 4K no Final Cut/DaVinci e design gráfico, mas não é voltada para jogos de PC (Windows).",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "16 GB de Memória Unificada de alta velocidade",
        score: 92,
        usageNote:
          "Memória unificada conversa direto com processador e placa gráfica, garantindo fluidez instantânea.",
      },
      {
        key: "storage",
        label: "Armazenamento SSD",
        value: "256 GB SSD NVMe ultrarrápido",
        score: 75,
        usageNote:
          "Muito veloz, mas tem metade do espaço (256 GB) dos rivais Windows que já trazem 512 GB.",
      },
      {
        key: "screen",
        label: "Tela e Qualidade de Imagem",
        value: '13.6" Liquid Retina (2560x1664) 500 nits P3 True Tone',
        score: 97,
        usageNote:
          "Ganha em qualidade visual: resolução superior ao Full HD e cores perfeitas para fotógrafos, designers e leitura.",
      },
      {
        key: "camera",
        label: "Câmera (Webcam) e Áudio",
        value: "Câmera FaceTime HD 1080p com processador de sinal de imagem M2 + 4 alto-falantes",
        score: 98,
        usageNote:
          "Ganha disparado em câmera e som: imagem 1080p nítida mesmo com pouca luz, ideal para quem faz muitas reuniões e lives.",
      },
      {
        key: "battery",
        label: "Autonomia Média de Bateria",
        value: "Até 18 horas reais (trabalha o dia todo sem carregador)",
        score: 99,
        usageNote:
          "Ganha em bateria: dura o dobro ou o triplo dos notebooks comuns longe da tomada.",
      },
      {
        key: "weight",
        label: "Peso e Portabilidade",
        value: "1,24 kg · 1,13 cm de espessura · Corpo em alumínio",
        score: 99,
        usageNote:
          "Ganha em leveza: pesa quase 1 kg a menos que um notebook gamer, parecendo um caderno na mochila.",
      },
    ],
    pros: [
      "Autonomia imbatível de até 18h mantendo 100% da velocidade fora da tomada",
      "Melhor câmera 1080p e melhor tela para quem trabalha com imagem e reuniões",
      "Construção toda em alumínio que dura muitos anos e mantém alto valor de revenda",
    ],
    cons: [
      "Preço mais alto da categoria",
      "Armazenamento de 256 GB e não é indicado para jogos de Windows",
    ],
  },

  // ===================== SMARTPHONES =====================
  {
    id: "phone-galaxy-a55",
    name: "Samsung Galaxy A55 5G 256GB",
    shortName: "Galaxy A55 5G",
    brand: "Samsung",
    tagline:
      "Acabamento premium em vidro e metal, proteção IP67 contra água, ótimas câmeras e 4 anos de atualizações.",
    image: createSmartphoneSvg({
      model: "Galaxy A55 5G",
      chip: "Exynos 1480 · 8GB RAM",
      cameraSpec: "50MP OIS + Vídeo 4K",
      screenSpec: '6.6" Super AMOLED 120Hz · IP67',
      bodyColor: "#1e293b",
      accentColor: "#b87333",
    }),
    price: 1799,
    originalPrice: 2299,
    installmentText: "Em até 10x de R$ 179,90 sem juros",
    category: "smartphones",
    affiliateUrl: "https://exemplo.com/afiliado/galaxy-a55",
    featured: true,
    idealFor:
      "Quem busca celular equilibrado em câmeras, resistência à água e durabilidade",
    highlightTitle: "Melhor Câmera & Construção Custo-Benefício",
    rating: 4.8,
    reviewCount: 3120,
    metrics: {
      performance: 84,
      costBenefit: 96,
      battery: 90,
      mobility: 84,
      buildQuality: 93,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "Samsung Exynos 1480 (4nm Octa-Core até 2.75 GHz)",
        score: 84,
        usageNote:
          "Roda todos os aplicativos do dia a dia e redes sociais com muita fluidez e sem esquentar.",
      },
      {
        key: "gpu",
        label: "Placa Gráfica (GPU)",
        value: "Xclipse 530 baseada em arquitetura AMD RDNA",
        score: 83,
        usageNote:
          "Roda bem jogos populares (Free Fire, Call of Duty, Asphalt), ficando atrás apenas do Poco X6 Pro em jogos pesados.",
      },
      {
        key: "camera",
        label: "Conjunto de Câmeras",
        value: "Principal 50MP com OIS + Frontal 32MP (Grava 4K frente e trás)",
        score: 94,
        usageNote:
          "Ganha em câmeras e selfies: grava em 4K tanto na câmera traseira quanto na frontal, com ótima estabilidade para Instagram/TikTok.",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "8 GB LPDDR5 + RAM Plus",
        score: 85,
        usageNote: "Mantém vários aplicativos de banco, redes e fotos abertos ao mesmo tempo.",
      },
      {
        key: "storage",
        label: "Armazenamento",
        value: "256 GB + Expansão via MicroSD",
        score: 88,
        usageNote: "Espaço de sobra para milhares de fotos e vídeos, além de aceitar cartão de memória.",
      },
      {
        key: "screen",
        label: "Tela e Brilho",
        value: '6.6" Super AMOLED FHD+ 120Hz (1000 nits, Gorilla Glass Victus+)',
        score: 92,
        usageNote: "Vidro ultra resistente a riscos e quedas com imagem linda mesmo sob sol forte.",
      },
      {
        key: "battery",
        label: "Bateria e Proteção",
        value: "5.000 mAh (até 2 dias) · Proteção IP67 contra mergulho na água",
        score: 92,
        usageNote:
          "Ganha em proteção: é o único da faixa com certificação IP67 real (resiste até a cair na piscina ou tomar chuva forte).",
      },
    ],
    pros: [
      "Ganha em câmeras (4K frontal e traseira) e acabamento em metal e vidro",
      "Proteção IP67 real contra água e poeira",
      "4 anos de atualizações do sistema Android garantidas",
    ],
    cons: [
      "Carregador incluso na caixa é de 15W (mais lento que os rivais)",
    ],
  },
  {
    id: "phone-poco-x6-pro",
    name: "Xiaomi Poco X6 Pro 5G 512GB 12GB RAM",
    shortName: "Poco X6 Pro 5G",
    brand: "Xiaomi",
    tagline:
      "Processador Dimensity 8300-Ultra de nível topo de linha, 12GB de RAM e 512GB UFS 4.0: velocidade imbatível pelo preço.",
    image: createSmartphoneSvg({
      model: "Poco X6 Pro 5G",
      chip: "Dimensity 8300-Ultra · 12GB",
      cameraSpec: "64MP OIS + Turbo 67W",
      screenSpec: '6.67" AMOLED 1.5K 120Hz · 512GB',
      bodyColor: "#27272a",
      accentColor: "#eab308",
    }),
    price: 2149,
    originalPrice: 2699,
    installmentText: "Em até 10x de R$ 214,90 sem juros",
    category: "smartphones",
    affiliateUrl: "https://exemplo.com/afiliado/poco-x6-pro",
    featured: false,
    idealFor:
      "Jogos pesados no celular, máxima fluidez e 512GB de espaço para tudo",
    highlightTitle: "Melhor Processador & 512GB de Espaço",
    rating: 4.9,
    reviewCount: 1840,
    metrics: {
      performance: 98,
      costBenefit: 94,
      battery: 88,
      mobility: 88,
      buildQuality: 85,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "MediaTek Dimensity 8300-Ultra (4nm, até 3.35 GHz)",
        score: 98,
        usageNote:
          "Ganha disparado em velocidade: tem potência de celular de R$ 4.500, abrindo tudo instantaneamente.",
      },
      {
        key: "gpu",
        label: "Placa Gráfica (GPU)",
        value: "Mali-G615 MC6 (desempenho gamer topo de linha)",
        score: 97,
        usageNote:
          "Melhor para jogos pesados (Genshin Impact, Warzone, PUBG) com gráficos no máximo sem travar.",
      },
      {
        key: "camera",
        label: "Conjunto de Câmeras",
        value: "Principal 64MP com OIS + Frontal 16MP (1080p)",
        score: 82,
        usageNote:
          "Tira boas fotos de dia, mas a câmera frontal e noturna não é tão boa quanto a do Galaxy A55.",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "12 GB LPDDR5X ultrarrápida",
        score: 98,
        usageNote: "Ganha com 12 GB de RAM: sobra memória para qualquer tarefa ou jogo futuro.",
      },
      {
        key: "storage",
        label: "Armazenamento",
        value: "512 GB UFS 4.0 (dobro de espaço dos concorrentes)",
        score: 98,
        usageNote: "Ganha com o dobro de armazenamento (512 GB) para nunca mais apagar fotos ou apps.",
      },
      {
        key: "screen",
        label: "Tela e Brilho",
        value: '6.67" Flow AMOLED 1.5K 120Hz Dolby Vision (1800 nits)',
        score: 96,
        usageNote: "Ganha em resolução (1.5K) e brilho máximo de 1800 nits.",
      },
      {
        key: "battery",
        label: "Bateria e Proteção",
        value: "5.000 mAh + Carregador Turbo 67W na caixa · IP54",
        score: 90,
        usageNote:
          "Ganha em velocidade de recarga (carrega de 0 a 100% em ~45 min), mas não pode mergulhar na água (apenas respingos IP54).",
      },
    ],
    pros: [
      "Ganha em processador, placa gráfica, 12 GB de RAM e 512 GB de memória",
      "Já vem com carregador ultrarrápido de 67W na caixa",
      "Tela 1.5K com bordas finíssimas",
    ],
    cons: [
      "Câmera frontal de selfies é mais simples que a do Galaxy A55",
      "Proteção contra água apenas para respingos leves (IP54)",
    ],
  },
  {
    id: "phone-moto-g84",
    name: "Motorola Moto G84 5G 256GB",
    shortName: "Moto G84 5G",
    brand: "Motorola",
    tagline:
      "Ultraleve (166g), tela pOLED de cores vibrantes, câmera com estabilização óptica e 256GB custando menos de R$ 1.350.",
    image: createSmartphoneSvg({
      model: "Moto G84 5G",
      chip: "Snapdragon 695 · 8GB RAM",
      cameraSpec: "50MP OIS Ultra Pixel",
      screenSpec: '6.55" pOLED 120Hz · 166g Leve',
      bodyColor: "#1e3a2f",
      accentColor: "#d4915a",
    }),
    price: 1299,
    originalPrice: 1699,
    installmentText: "Em até 10x de R$ 129,90 sem juros",
    category: "smartphones",
    affiliateUrl: "https://exemplo.com/afiliado/moto-g84",
    featured: false,
    idealFor:
      "Uso diário fluido, redes sociais, WhatsApp e quem odeia celular pesado no bolso",
    highlightTitle: "Melhor Preço com 256GB & Tela pOLED",
    rating: 4.7,
    reviewCount: 2640,
    metrics: {
      performance: 76,
      costBenefit: 93,
      battery: 88,
      mobility: 96,
      buildQuality: 84,
    },
    specs: [
      {
        key: "processor",
        label: "Processador (CPU)",
        value: "Qualcomm Snapdragon 695 5G Octa-Core",
        score: 75,
        usageNote:
          "Bom e econômico para WhatsApp, bancos, YouTube e navegação, mas mais modesto que o A55 e o Poco.",
      },
      {
        key: "gpu",
        label: "Placa Gráfica (GPU)",
        value: "Adreno 619",
        score: 74,
        usageNote: "Roda jogos casuais tranquilamente, mas não é voltada para jogos pesados.",
      },
      {
        key: "camera",
        label: "Conjunto de Câmeras",
        value: "Principal 50MP com OIS + Frontal 16MP (Grava em Full HD)",
        score: 78,
        usageNote:
          "Tem estabilização óptica para fotos nítidas, mas a câmera de vídeo não grava em 4K (apenas Full HD).",
      },
      {
        key: "ram",
        label: "Memória RAM",
        value: "8 GB RAM física + RAM Boost",
        score: 84,
        usageNote: "Excelente quantidade de RAM para um celular abaixo de R$ 1.350.",
      },
      {
        key: "storage",
        label: "Armazenamento",
        value: "256 GB + Entrada para MicroSD e Fone de Ouvido P2",
        score: 88,
        usageNote:
          "Ganha em praticidade por manter a entrada tradicional para fone com fio (P2) + 256 GB.",
      },
      {
        key: "screen",
        label: "Tela e Brilho",
        value: '6.55" pOLED FHD+ 120Hz (1300 nits, cores 10-bit)',
        score: 89,
        usageNote: "Tela pOLED muito bonita e fina que deixa o aparelho super leve.",
      },
      {
        key: "battery",
        label: "Bateria e Proteção",
        value: "5.000 mAh + Carregador TurboPower 33W incluso · 166g",
        score: 89,
        usageNote:
          "Ganha em leveza e conforto na mão (pesa só 166g) e já vem com carregador rápido de 33W.",
      },
    ],
    pros: [
      "Ganha no menor preço entregando 256 GB e 8 GB de RAM",
      "Mais leve e confortável no bolso (apenas 166g) com entrada para fone P2",
      "Carregador rápido TurboPower 33W incluso na caixa",
    ],
    cons: [
      "Câmera grava vídeos apenas em Full HD (não tem 4K)",
      "Processador mais simples para quem joga pesado",
    ],
  },

  // ===================== ÁUDIO & FONES =====================
  {
    id: "audio-qcy-h3",
    name: "Fone Bluetooth QCY H3 ANC Hi-Res",
    shortName: "QCY H3 ANC",
    brand: "QCY",
    tagline:
      "Cancelamento ativo de ruído híbrido de 43dB, 60 horas de bateria e conexão simultânea em 2 aparelhos por menos de R$ 250.",
    image: createHeadphoneSvg({
      model: "QCY H3 ANC",
      ancSpec: "Cancelamento Ativo 43dB Hi-Res",
      batterySpec: "60h de Bateria · Bluetooth 5.4",
      bodyColor: "#1e293b",
      accentColor: "#b87333",
    }),
    price: 239,
    originalPrice: 329,
    installmentText: "Em até 6x de R$ 39,83 sem juros",
    category: "audio",
    affiliateUrl: "https://exemplo.com/afiliado/qcy-h3",
    featured: true,
    idealFor:
      "Estudo focado, home office, academia e viagens sem gastar uma fortuna",
    highlightTitle: "Imbatível em Custo-Benefício",
    rating: 4.9,
    reviewCount: 4290,
    metrics: {
      performance: 84,
      costBenefit: 99,
      battery: 94,
      mobility: 90,
      buildQuality: 84,
    },
    specs: [
      {
        key: "anc",
        label: "Cancelamento de Ruído (ANC)",
        value: "ANC Híbrido até 43dB + Modo Transparência ajustável por App",
        score: 85,
        usageNote:
          "Reduz muito bem barulho de ventilador, ônibus e conversas ao redor custando uma fração dos rivais.",
      },
      {
        key: "sound",
        label: "Qualidade Sonora e Drivers",
        value: "Drivers dinâmicos de 40mm com certificação Hi-Res Audio",
        score: 84,
        usageNote: "Som equilibrado com bom volume e equalizador completo no aplicativo.",
      },
      {
        key: "battery",
        label: "Autonomia de Bateria",
        value: "Até 60h (ANC desligado) / 35h (ANC ligado)",
        score: 93,
        usageNote: "Dura mais de uma semana inteira de trabalho sem precisar recarregar.",
      },
      {
        key: "connectivity",
        label: "Conectividade e Pareamento",
        value: "Bluetooth 5.4 Multiponto (PC + celular ao mesmo tempo) + Cabo",
        score: 92,
        usageNote:
          "Conecta no notebook e no celular simultaneamente para atender chamadas sem desconectar.",
      },
      {
        key: "weight",
        label: "Conforto e Peso",
        value: "260g · Conchas dobráveis em espuma viscoelástica macia",
        score: 88,
        usageNote: "Espumas bem macias para quem usa óculos durante horas de estudo.",
      },
    ],
    pros: [
      "Entrega recursos de fones de R$ 600+ custando menos de R$ 250",
      "Conexão multiponto real para alternar entre reunião no notebook e celular",
      "Espumas extremamente confortáveis mesmo para quem usa óculos",
    ],
    cons: ["Não acompanha estojo rígido de transporte na caixa"],
  },
  {
    id: "audio-jbl-tune-770nc",
    name: "JBL Tune 770NC Cancelamento Adaptativo",
    shortName: "JBL Tune 770NC",
    brand: "JBL",
    tagline:
      "Incríveis 70 horas de bateria, graves JBL Pure Bass encorpados e carga rápida que rende 3 horas em apenas 5 minutos na tomada.",
    image: createHeadphoneSvg({
      model: "JBL Tune 770NC",
      ancSpec: "ANC Adaptativo + Pure Bass",
      batterySpec: "70h de Bateria · Carga Rápida",
      bodyColor: "#18181b",
      accentColor: "#ea580c",
    }),
    price: 389,
    originalPrice: 499,
    installmentText: "Em até 10x de R$ 38,90 sem juros",
    category: "audio",
    affiliateUrl: "https://exemplo.com/afiliado/jbl-770nc",
    featured: false,
    idealFor:
      "Amantes de graves fortes, música eletrônica/pop e quem esquece de carregar o fone",
    highlightTitle: "Campeão em Bateria (70 horas)",
    rating: 4.8,
    reviewCount: 1950,
    metrics: {
      performance: 88,
      costBenefit: 91,
      battery: 99,
      mobility: 93,
      buildQuality: 88,
    },
    specs: [
      {
        key: "anc",
        label: "Cancelamento de Ruído (ANC)",
        value: "ANC Adaptativo com Smart Ambient e TalkThru",
        score: 87,
        usageNote:
          "Tem botão TalkThru que abaixa a música instantaneamente para você conversar sem tirar o fone.",
      },
      {
        key: "sound",
        label: "Qualidade Sonora e Drivers",
        value: "Drivers de 40mm com assinatura JBL Pure Bass + Equalizador no App",
        score: 88,
        usageNote: "Melhor para quem gosta de graves fortes e marcantes na academia ou no dia a dia.",
      },
      {
        key: "battery",
        label: "Autonomia de Bateria",
        value: "Até 70h (ANC desligado) / 44h (ANC ligado)",
        score: 99,
        usageNote: "Ganha disparado em bateria: chega a 70 horas de duração.",
      },
      {
        key: "connectivity",
        label: "Conectividade e Pareamento",
        value: "Bluetooth 5.3 LE Audio + Multiponto + Cabo destacável",
        score: 94,
        usageNote: "Estável, rápido e com aplicativo oficial JBL Headphones muito completo.",
      },
      {
        key: "weight",
        label: "Conforto e Peso",
        value: "232g · Ultraleve e dobrável para mochila",
        score: 93,
        usageNote: "É o mais leve dos três na cabeça (apenas 232g).",
      },
    ],
    pros: [
      "Bateria recordista de até 70 horas que dura semanas de uso",
      "Garantia nacional ampla JBL e graves potentes",
      "Super leve (232g)",
    ],
    cons: ["Conchas um pouco mais justas para quem tem orelhas grandes"],
  },
  {
    id: "audio-sony-wh1000xm5",
    name: "Sony WH-1000XM5 ANC Referência",
    shortName: "Sony WH-1000XM5",
    brand: "Sony",
    tagline:
      "O melhor cancelamento de ruído do mundo com 8 microfones, dois processadores dedicados e áudio Hi-Res LDAC de estúdio.",
    image: createHeadphoneSvg({
      model: "Sony WH-1000XM5",
      ancSpec: "8 Microfones + Processador QN1",
      batterySpec: "Áudio LDAC Hi-Res · Case Rígido",
      bodyColor: "#334155",
      accentColor: "#d4915a",
    }),
    price: 1899,
    originalPrice: 2399,
    installmentText: "Em até 10x de R$ 189,90 sem juros",
    category: "audio",
    affiliateUrl: "https://exemplo.com/afiliado/sony-xm5",
    featured: false,
    idealFor:
      "Viagens de avião, isolamento absoluto de barulho e chamadas profissionais impecáveis",
    highlightTitle: "Melhor Cancelamento & Microfone",
    rating: 4.9,
    reviewCount: 870,
    metrics: {
      performance: 99,
      costBenefit: 82,
      battery: 85,
      mobility: 88,
      buildQuality: 98,
    },
    specs: [
      {
        key: "anc",
        label: "Cancelamento de Ruído (ANC)",
        value: "Líder absoluto: 8 microfones + Duplo Processador V1 e QN1",
        score: 99,
        usageNote:
          "Ganha com nota máxima: apaga barulho de turbina de avião, obra e escritório barulhento.",
      },
      {
        key: "sound",
        label: "Qualidade Sonora e Drivers",
        value: "Driver fibra de carbono 30mm + Codec LDAC (990 kbps Hi-Res)",
        score: 99,
        usageNote: "Fidelidade sonora de estúdio com riqueza de detalhes muito acima dos fones comuns.",
      },
      {
        key: "battery",
        label: "Autonomia de Bateria",
        value: "Até 40h (ANC desligado) / 30h (ANC ligado) + Carga USB-PD",
        score: 85,
        usageNote: "Dura bastante (30h com ANC), mas menos que as 70h do JBL.",
      },
      {
        key: "connectivity",
        label: "Conectividade e Pareamento",
        value: "Bluetooth Multiponto + Sensores de pausa automática ao tirar",
        score: 97,
        usageNote: "Pausa a música sozinho quando você tira o fone ou começa a falar.",
      },
      {
        key: "weight",
        label: "Conforto e Peso",
        value: "250g · Couro Soft Fit + Estojo rígido incluso",
        score: 96,
        usageNote: "Ganha em acabamento premium e já traz case rígido de viagem.",
      },
    ],
    pros: [
      "Silencia motores de avião, ar-condicionado e vozes ao redor como nenhum outro",
      "Melhor microfone da categoria para chamadas profissionais em ambientes ruidosos",
      "Acabamento de luxo com estojo rígido magnético incluso",
    ],
    cons: ["Investimento de categoria topo de linha"],
  },

  // ===================== PERIFÉRICOS & SETUP =====================
  {
    id: "perif-aula-f75",
    name: "Teclado Mecânico Aula F75 75% Gasket",
    shortName: "Aula F75 Tri-Mode",
    brand: "Aula",
    tagline:
      "Digitação macia com estrutura Gasket Mount, switches pré-lubrificados de fábrica, knob de volume e conexão sem fio Tri-Mode.",
    image: createKeyboardSvg({
      model: "Aula F75 Gasket 75%",
      switchSpec: "Switches Leobog Reaper",
      connSpec: "Tri-Mode Sem Fio",
      caseColor: "#334155",
      keycapAccent: "#b87333",
    }),
    price: 349,
    originalPrice: 469,
    installmentText: "Em até 6x de R$ 58,16 sem juros",
    category: "perifericos",
    affiliateUrl: "https://exemplo.com/afiliado/aula-f75",
    featured: false,
    idealFor:
      "Programadores, gamers e quem quer acústica 'creamy' de teclado customizado pronto de fábrica",
    highlightTitle: "Melhor Custo-Benefício em Teclados",
    rating: 4.9,
    reviewCount: 1620,
    metrics: {
      performance: 94,
      costBenefit: 98,
      battery: 88,
      mobility: 86,
      buildQuality: 92,
    },
    specs: [
      {
        key: "switches",
        label: "Switches e Troca (Hot-Swap)",
        value: "Leobog Reaper Lineares pré-lubrificados · Hot-Swap 5 pinos",
        score: 95,
        usageNote:
          "Ganha em maciez de digitação e resposta rápida de 1000Hz para jogos competitivos.",
      },
      {
        key: "construction",
        label: "Construção e Acústica",
        value: "Gasket Mount com 5 camadas de espuma acústica + Keycaps PBT",
        score: 96,
        usageNote: "Som aveludado de teclado customizado caro já pronto de fábrica.",
      },
      {
        key: "connectivity",
        label: "Conectividade",
        value: "Tri-Mode: Dongle 2.4GHz (1000Hz) + Bluetooth 5.0 + Cabo USB-C",
        score: 95,
        usageNote: "Funciona sem fio tanto por Bluetooth quanto por receptor USB rápido.",
      },
      {
        key: "battery",
        label: "Bateria Interna",
        value: "4.000 mAh recarregável",
        score: 88,
        usageNote: "Boa autonomia, embora o RGB ligado consuma mais que o Logitech.",
      },
    ],
    pros: [
      "Som e sensação de digitação superiores a teclados do dobro do preço",
      "Acompanha dongle 2.4GHz sem atraso para jogos + Bluetooth para 3 dispositivos",
      "Botão giratório (knob) dedicado para controle rápido de volume",
    ],
    cons: [
      "Layout ANSI (padrão internacional sem tecla Ç dedicada, mas faz Ç via atalho)",
    ],
  },
  {
    id: "perif-keychron-k2-pro",
    name: "Keychron K2 Pro QMK/VIA Hot-Swap",
    shortName: "Keychron K2 Pro",
    brand: "Keychron",
    tagline:
      "Totalmente programável via QMK/VIA direto no navegador, compatibilidade nativa com Mac e Windows e keycaps PBT OSA.",
    image: createKeyboardSvg({
      model: "Keychron K2 Pro QMK",
      switchSpec: "Keychron K Pro Red",
      connSpec: "Mac & Windows",
      caseColor: "#18181b",
      keycapAccent: "#dc2626",
    }),
    price: 589,
    originalPrice: 729,
    installmentText: "Em até 10x de R$ 58,90 sem juros",
    category: "perifericos",
    affiliateUrl: "https://exemplo.com/afiliado/keychron-k2-pro",
    featured: false,
    idealFor:
      "Desenvolvedores, usuários de Mac + Windows e fãs de atalhos personalizados via QMK/VIA",
    highlightTitle: "Melhor Customização QMK/VIA",
    rating: 4.8,
    reviewCount: 540,
    metrics: {
      performance: 92,
      costBenefit: 88,
      battery: 88,
      mobility: 84,
      buildQuality: 95,
    },
    specs: [
      {
        key: "switches",
        label: "Switches e Troca (Hot-Swap)",
        value: "Keychron K Pro Red pré-lubrificados · Hot-Swap universal",
        score: 93,
        usageNote: "Permite trocar qualquer switch sem solda e programar macros complexas.",
      },
      {
        key: "construction",
        label: "Construção e Acústica",
        value: "Estabilizadores parafusados no PCB + Espuma de silicone + PBT Double-Shot",
        score: 94,
        usageNote: "Construção sólida e pesada com teclas extras para Mac e Windows na caixa.",
      },
      {
        key: "connectivity",
        label: "Conectividade",
        value: "Bluetooth 5.1 (até 3 aparelhos) + Cabo USB-C · Chave Mac/Win",
        score: 90,
        usageNote: "Não tem dongle 2.4GHz para jogos, focando em Bluetooth e cabo.",
      },
      {
        key: "battery",
        label: "Bateria Interna",
        value: "4.000 mAh (até 72h de digitação contínua)",
        score: 89,
        usageNote: "Aguenta várias semanas usando com iluminação moderada.",
      },
    ],
    pros: [
      "Suporte nativo a QMK e VIA para remapear qualquer tecla e criar macros",
      "Acompanha teclas extras no pacote tanto para macOS quanto para Windows",
      "Estabilizadores parafusados que evitam ruído metálico na barra de espaço",
    ],
    cons: [
      "Não possui dongle 2.4GHz (opera via Bluetooth 5.1 ou cabo USB-C)",
    ],
  },
  {
    id: "perif-logitech-mx-mechanical",
    name: "Logitech MX Mechanical Mini Low-Profile",
    shortName: "Logitech MX Mechanical",
    brand: "Logitech",
    tagline:
      "Teclas mecânicas de perfil baixo ultra silenciosas, topo em alumínio escovado e bateria que dura até 10 meses sem recarregar.",
    image: createKeyboardSvg({
      model: "Logitech MX Mechanical",
      switchSpec: "Tactile Quiet Low-Profile",
      connSpec: "Logi Bolt + Bluetooth",
      caseColor: "#52525b",
      keycapAccent: "#2c5142",
    }),
    price: 799,
    originalPrice: 999,
    installmentText: "Em até 10x de R$ 79,90 sem juros",
    category: "perifericos",
    affiliateUrl: "https://exemplo.com/afiliado/mx-mechanical",
    featured: false,
    idealFor:
      "Escritórios silenciosos, produtividade executiva e portabilidade na mochila",
    highlightTitle: "Melhor Ergonomia Low-Profile & Bateria",
    rating: 4.9,
    reviewCount: 910,
    metrics: {
      performance: 91,
      costBenefit: 83,
      battery: 99,
      mobility: 97,
      buildQuality: 96,
    },
    specs: [
      {
        key: "switches",
        label: "Switches e Troca (Hot-Swap)",
        value: "Switches Mecânicos Low-Profile Tactile Quiet (fixos)",
        score: 88,
        usageNote:
          "Melhor para escritório silencioso: não incomoda colegas ao redor durante chamadas.",
      },
      {
        key: "construction",
        label: "Construção e Acústica",
        value: "Chassi superior em alumínio anodizado ultrafino e silencioso",
        score: 95,
        usageNote: "Ganha em leveza e finura: cabe na pasta junto com o notebook.",
      },
      {
        key: "connectivity",
        label: "Conectividade",
        value: "Receptor Logi Bolt + Bluetooth Easy-Switch (3 dispositivos) + Flow",
        score: 98,
        usageNote: "Ganha em produtividade corporativa e troca de computador com 1 botão.",
      },
      {
        key: "battery",
        label: "Bateria Interna",
        value: "Até 15 dias (iluminação inteligente ligada) ou até 10 meses (desligada)",
        score: 99,
        usageNote: "Ganha disparado em bateria graças aos sensores de presença das mãos.",
      },
    ],
    pros: [
      "Sensores de proximidade acendem as teclas assim que suas mãos se aproximam",
      "Perfil baixo que dispensa apoio de pulso e cabe facilmente na pasta do notebook",
      "Integração Logitech Flow para alternar entre computadores com o mouse",
    ],
    cons: ["Switches não são hot-swap e o investimento é mais alto"],
  },
];
