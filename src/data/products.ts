import type { Category, Product } from "../types/product";

export const categories: Category[] = [
  {
    id: "all",
    label: "Todas as Categorias",
    description: "Curadoria completa com comparativos técnicos no site",
  },
  {
    id: "audio",
    label: "Fones & Áudio",
    description: "Cancelamento ativo de ruído (ANC), drivers, microfone e autonomia",
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
    id: "perifericos",
    label: "Periféricos & Setup",
    description: "Teclados mecânicos, mouses, conectividade e ergonomia",
  },
  {
    id: "casa",
    label: "Casa, Móveis & Cama",
    description: "Móveis, cortinas, cobertores, roupa de cama, cozinha e utilidades domésticas",
  },
  {
    id: "moda",
    label: "Moda, Tênis & Roupas",
    description: "Tênis, camisas, camisetas, moda masculina e feminina, roupas fitness e calçados",
  },
];

export const products: Product[] = [
  {
    id: "audio-anker-soundcore-p30i",
    name: "Fone de Ouvido Bluetooth 5.4 Anker Soundcore P30i ANC",
    shortName: "Soundcore P30i ANC",
    brand: "Soundcore",
    tagline:
      "Cancelamento de ruído adaptativo inteligente (42dB), graves potentes com tecnologia BassUp, até 45h de reprodução, Bluetooth 5.4 multiponto e estojo 2-em-1 com suporte para celular.",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_2X_760745-MLA95700724020_102025-F.webp",
    price: 199.5,
    originalPrice: 389,
    installmentText: "R$ 199,50 com cupom (48% OFF) ou 6x de R$ 35,00 sem juros",
    category: "audio",
    affiliateUrl: "https://meli.la/2YTze8J",
    featured: true,
    idealFor:
      "Quem quer fone intra-auricular sem fio (TWS) compacto com ANC adaptativo forte, resistência IP54 para academia e estojo que vira suporte de celular",
    highlightTitle: "Melhor Fone Sem Fio TWS & ANC Adaptativo",
    rating: 4.9,
    reviewCount: 1850,
    metrics: {
      performance: 89,
      costBenefit: 98,
      battery: 92,
      mobility: 98,
      buildQuality: 91,
    },
    specs: [
      {
        key: "anc",
        label: "Cancelamento de Ruído (ANC)",
        value: "ANC Adaptativo Inteligente até 42dB + Modo Transparência",
        score: 89,
        usageNote:
          "Detecta automaticamente o barulho do ambiente (ônibus, avião, academia ou escritório) e ajusta o isolamento ativo na hora.",
      },
      {
        key: "sound",
        label: "Qualidade Sonora e Drivers",
        value: "Drivers de 10mm com Tecnologia Exclusiva BassUp + App Soundcore (22 EQs)",
        score: 90,
        usageNote:
          "Graves profundos e encorpados, 4 microfones com IA para chamadas limpas e equalizador completo + Som 3D no aplicativo Soundcore.",
      },
      {
        key: "battery",
        label: "Autonomia de Bateria",
        value: "Até 45h no total com o estojo (10h contínuas nos fones) + Carga Rápida",
        score: 92,
        usageNote:
          "10 minutos na tomada já garantem 2 horas extras de música; dura facilmente mais de uma semana de uso moderado.",
      },
      {
        key: "connectivity",
        label: "Conectividade e Pareamento",
        value: "Bluetooth 5.4 de última geração + Conexão Multiponto (2 aparelhos)",
        score: 95,
        usageNote:
          "Ganha no padrão Bluetooth 5.4 mais recente: pareamento instantâneo e conectado ao celular e notebook ao mesmo tempo.",
      },
      {
        key: "weight",
        label: "Conforto e Peso",
        value: "Intra-auricular ultraleve com Proteção IP54 (suor/poeira) + Estojo Suporte 2-em-1",
        score: 95,
        usageNote:
          "Ganha em portabilidade e engenhosidade: cabe no bolso, resiste a suor de treino (IP54) e a base do estojo abre para apoiar o celular na mesa.",
      },
    ],
    pros: [
      "Oferta com 48% OFF (de R$ 389 por R$ 199,50) em uma das marcas de áudio mais elogiadas do mundo (Anker Soundcore)",
      "Cancelamento de ruído adaptativo de até 42dB, Bluetooth 5.4 multiponto e até 45h de bateria total",
      "Estojo inteligente 2-em-1 que funciona como suporte para assistir vídeos no celular + proteção IP54 contra suor e respingos",
    ],
    cons: [
      "Formato intra-auricular (borrachinha dentro do canal auditivo) para quem prefere headphone grande por cima da orelha",
    ],
  },
  {
    id: "audio-eletric-teck-usbc",
    name: "Fone de Ouvido USB-C Tipo C Com Microfone Eletric Teck",
    shortName: "Fone USB-C Eletric Teck",
    brand: "Eletric Teck",
    tagline:
      "Conexão digital direta USB-C Plug & Play sem atraso de som, microfone integrado com controle de chamadas no cabo e compatibilidade com iPhone 15/16 e Android.",
    image:
      "https://http2.mlstatic.com/D_NQ_NP_2X_693659-MLA113618776783_062026-F.webp",
    price: 22.3,
    originalPrice: 59.99,
    installmentText: "R$ 22,30 à vista no Pix ou cartão (62% OFF)",
    category: "audio",
    affiliateUrl: "https://meli.la/2mHWbch",
    featured: true,
    idealFor:
      "Chamadas nítidas, vídeos sem atraso, aulas online e quem quer gastar o mínimo sem se preocupar em carregar bateria",
    highlightTitle: "Mais Barato & Plug & Play USB-C",
    rating: 4.7,
    reviewCount: 640,
    metrics: {
      performance: 79,
      costBenefit: 96,
      battery: 94,
      mobility: 95,
      buildQuality: 78,
    },
    specs: [
      {
        key: "anc",
        label: "Cancelamento de Ruído (ANC)",
        value: "Isolamento Acústico Passivo Intra-Auricular (Sem ANC Ativo)",
        score: 68,
        usageNote:
          "Atenua ruídos leves pelo encaixe no ouvido, mas por ser um modelo básico de R$ 22,30 não possui cancelamento eletrônico ativo (ANC).",
      },
      {
        key: "sound",
        label: "Qualidade Sonora e Drivers",
        value: "Drivers Estéreo com Microfone Integrado e Controle de Chamadas",
        score: 78,
        usageNote:
          "Som estéreo limpo para chamadas de voz no WhatsApp, reuniões, aulas e vídeos do dia a dia.",
      },
      {
        key: "battery",
        label: "Autonomia de Bateria",
        value: "Alimentação Direta via Cabo USB-C (Uso Contínuo Sem Bateria)",
        score: 94,
        usageNote:
          "Vantagem prática do fio: nunca fica sem bateria no meio de uma reunião ou viagem; basta plugar e usar.",
      },
      {
        key: "connectivity",
        label: "Conectividade e Pareamento",
        value: "Conector USB-C Tipo C Digital Plug & Play (Latência Zero)",
        score: 92,
        usageNote:
          "Conecta direto na porta USB-C do iPhone 15/16/17, Samsung, Xiaomi e Motorola sem atraso de áudio em vídeos e jogos.",
      },
      {
        key: "weight",
        label: "Conforto e Peso",
        value: "Ultraleve de bolso (18g) com botões físicos de volume e chamadas",
        score: 84,
        usageNote:
          "Cabe em qualquer bolso de calça ou mochila; recomenda-se enrolar sem dobrar com força para preservar o cabo.",
      },
    ],
    pros: [
      "Ganha disparado em economia: custa apenas R$ 22,30 (62% OFF sobre R$ 59,99)",
      "Conexão direta USB-C Plug & Play com zero atraso de áudio e sem precisar carregar bateria",
      "Microfone próximo à boca com botões físicos para atender chamadas e ajustar volume",
    ],
    cons: [
      "Não possui cancelamento ativo de ruído (ANC) nem liberdade sem fio Bluetooth",
      "Exige cuidado ao enrolar o cabo para maior durabilidade",
    ],
  },
];
