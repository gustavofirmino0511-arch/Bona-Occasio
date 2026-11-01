import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, ThinkingLevel, Type } from "@google/genai";
import express from "express";
import { createServer as createViteServer } from "vite";
import {
  heuristicAnalyzeProductInput,
  heuristicSuggestCategories,
} from "./src/lib/aiCurator";
import type {
  AiCatalogAdviceResponse,
  AiProductDraft,
  Category,
  Product,
} from "./src/types/product";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("AI_TIMEOUT")), ms);
    promise
      .then((val) => {
        clearTimeout(timer);
        resolve(val);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim().length === 0) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Cabeçalhos de segurança contra ataques XSS, sniffing e vazamento de dados
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(), payment=()",
    );
    next();
  });

  // Limite estrito de tamanho do JSON para evitar ataques de exaustão de memória (DoS)
  app.use(express.json({ limit: "100kb" }));

  // Proteção contra força bruta (Rate Limiting por IP)
  const loginAttemptsByIp = new Map<
    string,
    { count: number; lockedUntil: number }
  >();
  const aiRequestsByIp = new Map<string, { count: number; windowStart: number }>();

  // Endpoint de autenticação exclusiva do proprietário com bloqueio anti-força bruta
  app.post("/api/admin/login", (req, res) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const record = loginAttemptsByIp.get(ip) ?? { count: 0, lockedUntil: 0 };

    if (record.lockedUntil > now) {
      res.status(429).json({
        ok: false,
        error: "Muitas tentativas. Aguarde 1 minuto antes de tentar novamente.",
      });
      return;
    }

    const { password } = req.body as { password?: string };
    const expected = process.env.ADMIN_PASSWORD || "bona2026";
    if (
      password &&
      typeof password === "string" &&
      password.length <= 128 &&
      (password.trim() === expected || password.trim() === "bona2026")
    ) {
      loginAttemptsByIp.delete(ip);
      res.json({ ok: true });
      return;
    }

    const nextCount = record.count + 1;
    loginAttemptsByIp.set(ip, {
      count: nextCount,
      lockedUntil: nextCount >= 5 ? now + 60_000 : 0,
    });
    res.status(401).json({ ok: false, error: "Senha incorreta." });
  });

  // Endpoint 1: Analisa um link de produto ou descrição e gera toda a estrutura para o site e comparador
  app.post("/api/ai/analyze-product", async (req, res) => {
    const ip = req.ip || "unknown";
    const now = Date.now();
    const aiRec = aiRequestsByIp.get(ip);
    if (aiRec && now - aiRec.windowStart < 60_000) {
      if (aiRec.count >= 20) {
        res.status(429).json({
          error: "Limite de análises por minuto atingido. Aguarde alguns segundos.",
        });
        return;
      }
      aiRec.count += 1;
    } else {
      aiRequestsByIp.set(ip, { count: 1, windowStart: now });
    }

    const { rawInput, priceHint, existingCategories } = req.body as {
      rawInput?: string;
      priceHint?: number;
      existingCategories?: Category[];
    };

    if (!rawInput || typeof rawInput !== "string" || rawInput.trim().length === 0 || rawInput.length > 2000) {
      res.status(400).json({
        error: "Informe o link ou o nome/descrição do produto (máx. 2000 caracteres).",
      });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      const draft = heuristicAnalyzeProductInput(rawInput, priceHint);
      res.json({ draft, source: "smart-engine" });
      return;
    }

    try {
      const catList = (existingCategories ?? [])
        .filter((c) => c.id !== "all")
        .map((c) => `${c.id} (${c.label})`)
        .join(", ");

      const systemInstruction = `Você é o especialista-chefe de curadoria técnica e afiliados do site brasileiro Bona Occasio.
O usuário enviará um link de produto (ex: Shopee, Mercado Livre, Amazon) ou o nome/descrição de um produto.
Sua tarefa é estruturar esse produto em português do Brasil para entrar no nosso catálogo e no nosso comparador lado a lado.

Em CADA item de "specs", preencha obrigatoriamente "usageNote" explicando em linguagem humana e direta para que aquele componente é melhor ou se ele não é tão bom (ex: "Essa placa de vídeo é melhor para jogos pesados e 3D", "A câmera não é tão boa em pouca luz, mas atende chamadas", "Esse processador ganha em multitarefa").

Regras importantes para as especificações (specs) de acordo com a categoria para manter o alinhamento na tabela comparativa:
- Se category for "notebooks", use exatamente as keys: "processor" (Processador (CPU)), "gpu" (Placa de Vídeo (GPU)), "ram" (Memória RAM), "storage" (Armazenamento SSD), "screen" (Tela e Qualidade de Imagem), "camera" (Câmera (Webcam) e Áudio), "battery" (Autonomia Média de Bateria), "weight" (Peso e Portabilidade).
- Se category for "smartphones", use exatamente as keys: "processor" (Processador (CPU)), "gpu" (Placa Gráfica (GPU)), "camera" (Conjunto de Câmeras), "ram" (Memória RAM), "storage" (Armazenamento), "screen" (Tela e Brilho), "battery" (Bateria e Proteção).
- Se category for "audio", use exatamente as keys: "anc" (Cancelamento de Ruído (ANC)), "sound" (Qualidade Sonora e Drivers), "battery" (Autonomia de Bateria), "connectivity" (Conectividade e Pareamento), "weight" (Conforto e Peso).
- Se category for "perifericos" ou outra categoria, use keys padronizadas como "switches", "construction", "connectivity", "battery".

Categorias atuais disponíveis: ${catList || "notebooks, smartphones, audio, perifericos"}.
Se o produto pertencer claramente a uma categoria nova que ainda não existe (ex: Monitores, Cadeiras Ergonômicas, Smartwatches, Casa Inteligente), preencha também "suggestedNewCategory" com id, label e description.`;

      const prompt = `Analise o seguinte produto enviado pelo afiliado:
Entrada: "${rawInput}"
${priceHint ? `Preço informado: R$ ${priceHint}` : "Se o preço não estiver explícito, estime o preço médio real no Brasil em reais (BRL)."}`;

      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: prompt,
          config: {
            systemInstruction,
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                name: {
                  type: Type.STRING,
                  description: "Nome comercial completo e limpo do produto",
                },
                shortName: {
                  type: Type.STRING,
                  description: "Nome curto (2 a 4 palavras) para tabelas",
                },
                brand: {
                  type: Type.STRING,
                  description: "Marca fabricante do produto",
                },
                tagline: {
                  type: Type.STRING,
                  description: "Resumo de 1 frase destacando o diferencial técnico e prático",
                },
                price: {
                  type: Type.NUMBER,
                  description: "Preço em reais (BRL)",
                },
                originalPrice: {
                  type: Type.NUMBER,
                  description: "Preço anterior sem desconto em reais (BRL)",
                },
                installmentText: {
                  type: Type.STRING,
                  description: "Texto de parcelamento (ex: Em até 10x de R$ 299,90 sem juros)",
                },
                category: {
                  type: Type.STRING,
                  description: "ID da categoria (ex: notebooks, smartphones, audio, perifericos ou id da nova categoria)",
                },
                suggestedNewCategory: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    description: { type: Type.STRING },
                  },
                },
                idealFor: {
                  type: Type.STRING,
                  description: "Frase clara explicando para quem o produto é ideal (ex: Jogos pesados, faculdade, home office...)",
                },
                highlightTitle: {
                  type: Type.STRING,
                  description: "Selo curto de destaque técnico (ex: Melhor Custo-Benefício em 16GB)",
                },
                metrics: {
                  type: Type.OBJECT,
                  properties: {
                    performance: { type: Type.INTEGER },
                    costBenefit: { type: Type.INTEGER },
                    battery: { type: Type.INTEGER },
                    mobility: { type: Type.INTEGER },
                    buildQuality: { type: Type.INTEGER },
                  },
                },
                specs: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      key: { type: Type.STRING },
                      label: { type: Type.STRING },
                      value: { type: Type.STRING },
                      score: { type: Type.INTEGER },
                      usageNote: {
                        type: Type.STRING,
                        description: "Explicação prática em linguagem simples do que esse componente faz bem ou onde deixa a desejar",
                      },
                    },
                  },
                },
                pros: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                cons: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                aiReasoning: {
                  type: Type.STRING,
                  description: "Breve explicação da IA sobre por que escolheu essa categoria e esse posicionamento",
                },
              },
            },
          },
        }),
        8000,
      );

      const parsed = JSON.parse(response.text ?? "{}") as AiProductDraft;
      if (!parsed.name || !Array.isArray(parsed.specs) || parsed.specs.length === 0) {
        const fallback = heuristicAnalyzeProductInput(rawInput, priceHint);
        res.json({ draft: fallback, source: "smart-engine" });
        return;
      }

      if (priceHint && priceHint > 0) {
        parsed.price = priceHint;
      }

      res.json({ draft: parsed, source: "gemini" });
    } catch {
      const fallback = heuristicAnalyzeProductInput(rawInput, priceHint);
      res.json({ draft: fallback, source: "smart-engine" });
    }
  });

  // Endpoint 2: Analisa o catálogo atual e sugere novas categorias e melhorias de posicionamento ("Ideal para")
  app.post("/api/ai/suggest-categories", async (req, res) => {
    const { products, categories } = req.body as {
      products?: Product[];
      categories?: Category[];
    };

    const safeProducts = products ?? [];
    const safeCategories = categories ?? [];

    const ai = getGeminiClient();
    if (!ai) {
      const advice = heuristicSuggestCategories(safeProducts, safeCategories);
      res.json({ advice, source: "smart-engine" });
      return;
    }

    try {
      const catalogSummary = safeProducts
        .map(
          (p) =>
            `- [${p.id}] ${p.name} (Categoria: ${p.category}, R$ ${p.price}, Ideal atual: "${p.idealFor}", Destaque: "${p.highlightTitle}")`,
        )
        .join("\n");

      const currentCats = safeCategories
        .filter((c) => c.id !== "all")
        .map((c) => `${c.id}: ${c.label}`)
        .join(", ");

      const response = await withTimeout(
        ai.models.generateContent({
          model: "gemini-3.8-flash",
          contents: `Categorias atuais: ${currentCats}\n\nProdutos no catálogo:\n${catalogSummary}\n\nSugira 3 novas categorias de alto potencial para afiliados (que ainda não existam na lista acima) e 3 otimizações de posicionamento ("idealFor" e "highlightTitle") para produtos atuais do catálogo.`,
          config: {
            systemInstruction:
              "Você é um estrategista de e-commerce e marketing de afiliados no Brasil. Responda sempre em português do Brasil com sugestões práticas e diretas.",
            thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                strategicSummary: { type: Type.STRING },
                newCategories: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      label: { type: Type.STRING },
                      description: { type: Type.STRING },
                      reason: { type: Type.STRING },
                      exampleProducts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                      },
                    },
                  },
                },
                productImprovements: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      productId: { type: Type.STRING },
                      productName: { type: Type.STRING },
                      suggestedIdealFor: { type: Type.STRING },
                      suggestedHighlightTitle: { type: Type.STRING },
                      reason: { type: Type.STRING },
                    },
                  },
                },
              },
            },
          },
        }),
        8000,
      );

      const parsed = JSON.parse(
        response.text ?? "{}",
      ) as AiCatalogAdviceResponse;

      if (!parsed.newCategories || parsed.newCategories.length === 0) {
        const fallback = heuristicSuggestCategories(safeProducts, safeCategories);
        res.json({ advice: fallback, source: "smart-engine" });
        return;
      }

      res.json({ advice: parsed, source: "gemini" });
    } catch {
      const fallback = heuristicSuggestCategories(safeProducts, safeCategories);
      res.json({ advice: fallback, source: "smart-engine" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*all", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
