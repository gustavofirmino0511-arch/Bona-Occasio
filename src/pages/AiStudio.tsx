import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  ExternalLink,
  Flame,
  FolderPlus,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Radar,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Wand2,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import {
  buildProductFromAiDraft,
  heuristicAnalyzeProductInput,
  heuristicSuggestCategories,
  resolveProductUrlContent,
} from "@/lib/aiCurator";
import {
  createDealThumbnailSvg,
  filterAndRankMinedDeals,
  mineAffordableDeals,
  MONITORED_RADARS_INFO,
  type MinedDeal,
  type MinerCategoryFilter,
} from "@/lib/dealMiner";
import { OWNER_EMAIL } from "@/lib/firebase";
import { cn, formatBRL } from "@/lib/utils";
import type {
  AiCatalogAdviceResponse,
  AiProductDraft,
  Product,
} from "@/types/product";

const QUICK_EXAMPLES = [
  {
    label: "Link Notebook Dell Inspiron 15 i5 16GB",
    input:
      "https://www.amazon.com.br/Notebook-Dell-Inspiron-I15-i1300-M50P-15-6-Full-HD-120Hz-Intel-Core-i5-1334U-16GB-512GB-SSD/dp/B0D412345",
    price: "3399",
    affiliateUrl: "https://exemplo.com/afiliado/dell-inspiron-15",
  },
  {
    label: 'Link Monitor Gamer LG UltraGear 24" 180Hz',
    input:
      "https://shopee.com.br/Monitor-Gamer-LG-UltraGear-24-Full-HD-IPS-180Hz-1ms-GtG-HDR10-24GS60F-B",
    price: "899",
    affiliateUrl: "https://exemplo.com/afiliado/lg-ultragear-24",
  },
  {
    label: "Link Fone Bluetooth Edifier W820NB Plus ANC",
    input:
      "https://produto.mercadolivre.com.br/MLB-3489120-fone-de-ouvido-bluetooth-edifier-w820nb-plus-anc-hi-res-ldac-49h-bateria",
    price: "319",
    affiliateUrl: "https://exemplo.com/afiliado/edifier-w820nb-plus",
  },
];

export function AiStudio() {
  const navigate = useNavigate();
  const {
    catalogProducts,
    catalogCategories,
    isAdminAuthenticated,
    firebaseUser,
    isCloudSynced,
    loginAsAdmin,
    loginWithGoogleOwner,
    logoutAdmin,
    changeAdminPassword,
    addProductFromAi,
    addCategoryFromAi,
    updateProductPositioning,
    updateProductDetails,
    deleteProductFromCatalog,
  } = useCompare();

  // Estado do Login do Proprietário
  const [passwordInput, setPasswordInput] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showChangePass, setShowChangePass] = useState(false);
  const [newPassInput, setNewPassInput] = useState("");
  const [passChangedFeedback, setPassChangedFeedback] = useState(false);

  // Estado do Importador de Produto por Link/Texto
  const [productTitleHint, setProductTitleHint] = useState("");
  const [rawInput, setRawInput] = useState("");
  const [priceHint, setPriceHint] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [isAnalyzingProduct, setIsAnalyzingProduct] = useState(false);
  const [analyzingStepText, setAnalyzingStepText] = useState(
    "Lendo link da loja e analisando ficha técnica...",
  );
  const [isPublishingProduct, setIsPublishingProduct] = useState(false);
  const [productError, setProductError] = useState<string | null>(null);
  const [draft, setDraft] = useState<AiProductDraft | null>(null);
  const [useSuggestedNewCategory, setUseSuggestedNewCategory] = useState(true);
  const [publishedSuccessId, setPublishedSuccessId] = useState<string | null>(
    null,
  );

  // Estado do Consultor de Categorias & Posicionamento
  const [isAnalyzingCatalog, setIsAnalyzingCatalog] = useState(false);
  const [catalogAdvice, setCatalogAdvice] =
    useState<AiCatalogAdviceResponse | null>(null);
  const [appliedCategoryIds, setAppliedCategoryIds] = useState<string[]>([]);
  const [appliedProductIds, setAppliedProductIds] = useState<string[]>([]);

  // Estado de Edição Rápida de Produto Existente
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState("");
  const [editAffiliateUrl, setEditAffiliateUrl] = useState("");
  const [editIdealFor, setEditIdealFor] = useState("");

  // Estado do Sistema de Mineração de Achadinhos & Promoções Baratas (Sem Chave de API)
  const [minerMaxPrice, setMinerMaxPrice] = useState<number>(150);
  const [minerCategory, setMinerCategory] =
    useState<MinerCategoryFilter>("all");
  const [minerQuery, setMinerQuery] = useState("");
  const [isMiningDeals, setIsMiningDeals] = useState(false);
  const [liveWebDealsCount, setLiveWebDealsCount] = useState(0);
  const [showAllMinedDeals, setShowAllMinedDeals] = useState(false);
  const [minedDeals, setMinedDeals] = useState<MinedDeal[]>(() =>
    filterAndRankMinedDeals([], { maxPrice: 150, categoryFilter: "all" }),
  );
  const [loadedMinedDealId, setLoadedMinedDealId] = useState<string | null>(
    null,
  );

  const handleRunMiner = async (
    nextMaxPrice = minerMaxPrice,
    nextCategory = minerCategory,
    nextQuery = minerQuery,
    forceRefresh = false,
  ) => {
    setMinerMaxPrice(nextMaxPrice);
    setMinerCategory(nextCategory);
    setShowAllMinedDeals(false);
    setIsMiningDeals(true);
    try {
      const res = await fetch("/api/miner/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPrice: nextMaxPrice,
          categoryFilter: nextCategory,
          query: nextQuery,
          forceRefresh,
        }),
      });
      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = (await res.json()) as {
          deals?: MinedDeal[];
          liveCount?: number;
        };
        if (Array.isArray(data.deals)) {
          setMinedDeals(data.deals);
          setLiveWebDealsCount(data.liveCount ?? 0);
          return;
        }
      }
      const fallback = await mineAffordableDeals({
        maxPrice: nextMaxPrice,
        categoryFilter: nextCategory,
        query: nextQuery,
        forceRefresh,
      });
      setMinedDeals(fallback.deals);
      setLiveWebDealsCount(fallback.liveCount);
    } catch {
      const fallback = filterAndRankMinedDeals([], {
        maxPrice: nextMaxPrice,
        categoryFilter: nextCategory,
        query: nextQuery,
      });
      setMinedDeals(fallback);
    } finally {
      setIsMiningDeals(false);
    }
  };

  // Dispara automaticamente a varredura AO VIVO na internet assim que o dono desbloqueia o /admin
  useEffect(() => {
    if (isAdminAuthenticated) {
      void handleRunMiner(150, "all", "");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdminAuthenticated]);

  const handleLoadMinedDealIntoImporter = (deal: MinedDeal) => {
    setLoadedMinedDealId(deal.id);
    setProductTitleHint(deal.title);
    setPriceHint(String(deal.price).replace(".", ","));
    setRawInput(`${deal.title}. ${deal.specsSummary}`);
    setProductError(null);
    setPublishedSuccessId(null);

    const generatedDraft = heuristicAnalyzeProductInput(
      `${deal.title} ${deal.specsSummary}`,
      deal.price,
      {
        title: deal.title,
        detectedPrice: deal.price,
        detectedOriginalPrice: deal.originalPrice,
        detectedBrand: deal.brand,
        imageUrl: deal.image,
      },
    );
    setDraft(generatedDraft);
    setUseSuggestedNewCategory(Boolean(generatedDraft.suggestedNewCategory));

    const el = document.getElementById("secao-cadastro-ia");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOwnerLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const ok = await loginAsAdmin(passwordInput);
      if (!ok) {
        setLoginError(
          "Senha incorreta. Este painel é exclusivo para o proprietário do site.",
        );
      } else {
        setPasswordInput("");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleOwnerLogin = async () => {
    setLoginError(null);
    setIsLoggingIn(true);
    try {
      const res = await loginWithGoogleOwner();
      if (!res.ok && res.error) {
        setLoginError(res.error);
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassInput.trim().length < 4) return;
    changeAdminPassword(newPassInput);
    setNewPassInput("");
    setPassChangedFeedback(true);
    setTimeout(() => {
      setPassChangedFeedback(false);
      setShowChangePass(false);
    }, 2000);
  };

  const handleAnalyzeProduct = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const combinedInput = [productTitleHint.trim(), rawInput.trim(), affiliateUrl.trim()]
      .filter(Boolean)
      .join(" ");

    if (!combinedInput.trim()) {
      setProductError(
        "Digite o nome/modelo do produto ou cole o link do anúncio para a IA estruturar.",
      );
      return;
    }

    // Se o usuário colou um link no campo principal e deixou o link de afiliado em branco, preenche automaticamente
    const detectedUrlInRaw = rawInput.match(/https?:\/\/[^\s"'<>]+/i)?.[0];
    if (detectedUrlInRaw && !affiliateUrl.trim()) {
      setAffiliateUrl(detectedUrlInRaw);
    }

    setProductError(null);
    setPublishedSuccessId(null);
    setIsAnalyzingProduct(true);
    setAnalyzingStepText("Abrindo link e extraindo informações do anúncio...");

    const numericPrice = priceHint
      ? Number(priceHint.replace(/\./g, "").replace(",", "."))
      : undefined;

    try {
      const res = await fetch("/api/ai/analyze-product", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rawInput: combinedInput,
          priceHint: numericPrice,
          existingCategories: catalogCategories,
        }),
      });

      const contentType = res.headers.get("content-type") ?? "";
      if (res.status === 422 && contentType.includes("application/json")) {
        const errData = (await res.json()) as { error?: string };
        setDraft(null);
        setProductError(
          errData.error ||
            "A loja bloqueou a leitura automática deste link encurtado. Preencha o campo 'Nome / Modelo do Produto' logo abaixo (ex: Fone JBL Tune 520BT) junto com o seu link!",
        );
        return;
      }

      if (res.ok && contentType.includes("application/json")) {
        const data = (await res.json()) as {
          draft?: AiProductDraft;
          error?: string;
        };
        if (data.draft) {
          setDraft(data.draft);
          if (!productTitleHint.trim() && data.draft.name) {
            setProductTitleHint(data.draft.name);
          }
          if (!priceHint.trim() && data.draft.price) {
            setPriceHint(String(data.draft.price).replace(".", ","));
          }
          setUseSuggestedNewCategory(Boolean(data.draft.suggestedNewCategory));
          return;
        }
      }

      // Se estiver rodando no Render Static Site (sem backend Node), fazemos a leitura real da URL direto pelo navegador!
      setAnalyzingStepText("Lendo página do produto e calculando notas de 0 a 100...");
      const resolvedMeta = await resolveProductUrlContent(combinedInput);
      const hasTypedProductName =
        productTitleHint.trim().length >= 3 ||
        rawInput.replace(/https?:\/\/[^\s"'<>]+/gi, "").trim().length >= 4;

      if (resolvedMeta.isShortenerBlocked && !hasTypedProductName) {
        setDraft(null);
        setProductError(
          "Este link encurtado (Shopee / Amazon / ML) tem proteção anti-robô que esconde o nome do produto. Basta digitar o Nome / Modelo do produto no primeiro campo abaixo (ex: Notebook Lenovo IdeaPad i5 16GB) que a IA monta toda a ficha técnica dele na hora!",
        );
        return;
      }

      if (!productTitleHint.trim() && resolvedMeta.title) {
        setProductTitleHint(resolvedMeta.title);
      }
      if (!priceHint.trim() && resolvedMeta.detectedPrice) {
        setPriceHint(String(resolvedMeta.detectedPrice).replace(".", ","));
      }

      const fallbackDraft = heuristicAnalyzeProductInput(
        combinedInput,
        numericPrice,
        resolvedMeta,
      );
      setDraft(fallbackDraft);
      setUseSuggestedNewCategory(Boolean(fallbackDraft.suggestedNewCategory));
    } catch {
      const resolvedMeta = await resolveProductUrlContent(combinedInput);
      const hasTypedProductName =
        productTitleHint.trim().length >= 3 ||
        rawInput.replace(/https?:\/\/[^\s"'<>]+/gi, "").trim().length >= 4;

      if (resolvedMeta.isShortenerBlocked && !hasTypedProductName) {
        setDraft(null);
        setProductError(
          "Este link encurtado tem proteção anti-robô da loja. Digite o Nome / Modelo do produto no primeiro campo abaixo para a IA montar a ficha exata dele!",
        );
        return;
      }

      if (!productTitleHint.trim() && resolvedMeta.title) {
        setProductTitleHint(resolvedMeta.title);
      }
      if (!priceHint.trim() && resolvedMeta.detectedPrice) {
        setPriceHint(String(resolvedMeta.detectedPrice).replace(".", ","));
      }

      const fallbackDraft = heuristicAnalyzeProductInput(
        combinedInput,
        numericPrice,
        resolvedMeta,
      );
      setDraft(fallbackDraft);
      setUseSuggestedNewCategory(Boolean(fallbackDraft.suggestedNewCategory));
    } finally {
      setIsAnalyzingProduct(false);
    }
  };

  const handlePublishProduct = async () => {
    if (!draft) return;
    setIsPublishingProduct(true);
    try {
      const finalCategory =
        useSuggestedNewCategory && draft.suggestedNewCategory
          ? draft.suggestedNewCategory.id
          : draft.category;

      const updatedDraft: AiProductDraft = {
        ...draft,
        category: finalCategory,
      };

      const newProduct = buildProductFromAiDraft(updatedDraft, affiliateUrl);
      const newCatObj =
        useSuggestedNewCategory && draft.suggestedNewCategory
          ? {
              id: draft.suggestedNewCategory.id,
              label: draft.suggestedNewCategory.label,
              description: draft.suggestedNewCategory.description,
            }
          : undefined;

      await addProductFromAi(newProduct, newCatObj);
      setPublishedSuccessId(newProduct.id);
    } finally {
      setIsPublishingProduct(false);
    }
  };

  const handleFetchCatalogAdvice = async () => {
    setIsAnalyzingCatalog(true);
    try {
      const res = await fetch("/api/ai/suggest-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          products: catalogProducts,
          categories: catalogCategories,
        }),
      });
      const contentType = res.headers.get("content-type") ?? "";
      if (res.ok && contentType.includes("application/json")) {
        const data = (await res.json()) as { advice?: AiCatalogAdviceResponse };
        if (data.advice) {
          setCatalogAdvice(data.advice);
          return;
        }
      }
      setCatalogAdvice(
        heuristicSuggestCategories(catalogProducts, catalogCategories),
      );
    } catch {
      setCatalogAdvice(
        heuristicSuggestCategories(catalogProducts, catalogCategories),
      );
    } finally {
      setIsAnalyzingCatalog(false);
    }
  };

  const startEditingProduct = (product: Product) => {
    setEditingProductId(product.id);
    setEditPrice(String(product.price));
    setEditAffiliateUrl(product.affiliateUrl);
    setEditIdealFor(product.idealFor);
  };

  const saveProductEdit = async (productId: string) => {
    await updateProductDetails(productId, {
      price: Number(editPrice) || 999,
      affiliateUrl: editAffiliateUrl.trim(),
      idealFor: editIdealFor.trim(),
    });
    setEditingProductId(null);
  };

  // ===================== TELA DE BLOQUEIO (/admin) =====================
  if (!isAdminAuthenticated) {
    return (
      <div className="mx-auto max-w-md px-5 py-20 sm:py-28">
        <div className="rounded-2xl border border-sand bg-white/90 p-7 shadow-sm sm:p-9">
          <div className="inline-flex size-11 items-center justify-center rounded-xl bg-forest/10 text-forest">
            <Lock className="size-5" />
          </div>

          <p className="mt-4 text-xs font-semibold text-copper">
            Endereço /admin · Área do Proprietário
          </p>
          <h1 className="mt-1 font-display text-2xl font-semibold text-forest sm:text-3xl">
            Acesso Exclusivo do Proprietário
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-stone">
            Entre com sua conta Google proprietária ({OWNER_EMAIL}) ou digite
            sua senha de administrador para subir produtos com IA direto no
            banco de dados do site.
          </p>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleGoogleOwnerLogin}
              disabled={isLoggingIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-forest bg-forest/5 px-5 py-3.5 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-cream disabled:opacity-60"
            >
              <Cloud className="size-4 text-copper" />
              Entrar com Google ({OWNER_EMAIL})
            </button>
          </div>

          <div className="my-5 flex items-center gap-3 text-[11px] text-stone">
            <div className="h-px flex-1 bg-sand" />
            <span>ou digite sua senha rápida</span>
            <div className="h-px flex-1 bg-sand" />
          </div>

          <form onSubmit={handleOwnerLogin} className="space-y-4">
            <div>
              <label
                htmlFor="owner-password-input"
                className="block text-xs font-semibold text-forest"
              >
                Senha do Proprietário
              </label>
              <input
                id="owner-password-input"
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Digite sua senha (padrão: bona2026)..."
                autoComplete="current-password"
                className="mt-1.5 w-full rounded-xl border border-sand bg-cream/70 px-4 py-3 text-sm text-ink placeholder:text-stone/60 focus:border-forest focus:outline-none"
              />
            </div>

            {loginError && (
              <p role="alert" className="text-xs font-semibold text-copper">
                {loginError}
              </p>
            )}

            <button
              type="submit"
              id="owner-login-submit-btn"
              disabled={isLoggingIn}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-soft disabled:opacity-60"
            >
              <KeyRound className="size-4" />
              {isLoggingIn
                ? "Verificando..."
                : "Desbloquear Painel do Proprietário"}
            </button>
          </form>

          <p className="mt-5 flex items-center gap-2 border-t border-sand pt-4 text-[11px] text-stone">
            <ShieldCheck className="size-4 shrink-0 text-copper" />
            Esta página só abre pelo endereço /admin. Visitantes comuns não
            vêem nenhum botão para cá.
          </p>
        </div>
      </div>
    );
  }

  // ===================== PAINEL DESBLOQUEADO DO PROPRIETÁRIO =====================
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {/* Barra de Controle de Segurança e Banco de Dados do Proprietário */}
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-forest/25 bg-forest/5 px-5 py-3.5">
        <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-forest">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-copper" />
            Modo Proprietário Ativo (/admin)
          </span>
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1.5 text-stone">
            <Cloud className="size-4 text-forest" />
            {firebaseUser
              ? `Banco de Dados Firebase conectado (${firebaseUser.email})`
              : isCloudSynced
                ? "Banco de Dados Firebase ativo (leitura sincronizada)"
                : "Banco de Dados local ativo"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!firebaseUser && (
            <button
              type="button"
              onClick={handleGoogleOwnerLogin}
              className="inline-flex items-center gap-1.5 rounded-lg border border-copper bg-white px-3 py-1.5 text-xs font-semibold text-forest hover:bg-copper hover:text-cream"
            >
              <Cloud className="size-3.5 text-copper" />
              Vincular Google p/ salvar na nuvem
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowChangePass((prev) => !prev)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-sand bg-white px-3 py-1.5 text-xs font-semibold text-forest hover:border-copper"
          >
            <KeyRound className="size-3.5 text-copper" />
            Alterar minha senha
          </button>

          <button
            type="button"
            onClick={() => void logoutAdmin()}
            className="inline-flex items-center gap-1.5 rounded-lg bg-forest px-3.5 py-1.5 text-xs font-semibold text-cream hover:bg-forest-soft"
          >
            <LogOut className="size-3.5" />
            Bloquear Painel (Sair)
          </button>
        </div>
      </div>

      {showChangePass && (
        <form
          onSubmit={handleSaveNewPassword}
          className="mb-8 flex flex-col gap-3 rounded-xl border border-sand bg-white p-5 sm:flex-row sm:items-end"
        >
          <div className="flex-1">
            <label
              htmlFor="new-owner-pass"
              className="block text-xs font-semibold text-forest"
            >
              Nova senha de proprietário (criptografada com SHA-256 · mín. 4 caracteres)
            </label>
            <input
              id="new-owner-pass"
              type="password"
              value={newPassInput}
              onChange={(e) => setNewPassInput(e.target.value)}
              placeholder="Digite sua nova senha exclusiva..."
              className="mt-1 w-full rounded-lg border border-sand bg-cream px-3.5 py-2 text-sm text-ink"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg bg-copper px-4 py-2 text-xs font-semibold text-cream hover:bg-copper-soft"
          >
            {passChangedFeedback ? "Senha atualizada ✓" : "Salvar nova senha"}
          </button>
        </form>
      )}

      {/* Resumo das Camadas de Blindagem e Segurança Ativas */}
      <div className="mb-8 rounded-2xl border border-sand bg-white/90 p-5 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="inline-flex items-center gap-2 text-xs font-semibold text-forest">
            <ShieldCheck className="size-4 text-copper" />
            Blindagem de Segurança Ativa (5 Camadas de Proteção Contra Ataques)
          </p>
          <span className="rounded-md bg-forest/10 px-2.5 py-1 text-[11px] font-semibold text-forest">
            Sessão expira automaticamente em 4h
          </span>
        </div>
        <div className="mt-3 grid gap-2.5 text-xs text-stone sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-sand/80 bg-cream/40 p-3">
            <p className="font-semibold text-forest">1. Banco Zero-Trust</p>
            <p className="mt-0.5 leading-relaxed">
              Escrita no Firebase travada exclusivamente para o e-mail verificado{" "}
              <span className="font-medium text-ink">{OWNER_EMAIL}</span>.
            </p>
          </div>
          <div className="rounded-xl border border-sand/80 bg-cream/40 p-3">
            <p className="font-semibold text-forest">2. Anti-Força Bruta & Timing</p>
            <p className="mt-0.5 leading-relaxed">
              Comparação criptográfica em tempo constante (SHA-256) e bloqueio por IP após 5 tentativas.
            </p>
          </div>
          <div className="rounded-xl border border-sand/80 bg-cream/40 p-3">
            <p className="font-semibold text-forest">3. Filtro Anti-XSS & HTTPS</p>
            <p className="mt-0.5 leading-relaxed">
              Links de afiliado exigem protocolo <code className="text-forest">https://</code> e bloqueiam scripts <code className="text-forest">javascript:</code>.
            </p>
          </div>
          <div className="rounded-xl border border-sand/80 bg-cream/40 p-3">
            <p className="font-semibold text-forest">4. Escudo Anti-SSRF & CSP</p>
            <p className="mt-0.5 leading-relaxed">
              Cabeçalhos HTTP Content-Security-Policy, Rate-Limit nas rotas de IA e bloqueio de IPs privados.
            </p>
          </div>
        </div>
      </div>

      {/* Cabeçalho */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-copper">
          Painel Privado do Dono (/admin) · Banco de Dados Firebase Conectado
        </p>
        <h1
          className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest sm:text-5xl"
          style={{ textWrap: "balance" }}
        >
          Central IA de Mineração, Produtos e Categorias
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone">
          Minere promoções baratas de alta conversão (ex: R$ 29, R$ 42, R$ 89)
          sem precisar de nenhuma chave de API, pegue seu link de afiliado no
          Mercado Livre com 1 clique e suba o produto direto para o site e
          comparador.
        </p>
      </div>

      {/* ===================== SEÇÃO 00: MINERAÇÃO DE ACHADINHOS SEM API ===================== */}
      <section className="mt-10 rounded-2xl border-2 border-forest/20 bg-white/95 p-6 shadow-xs sm:p-8">
        <div className="flex flex-col justify-between gap-4 border-b border-sand pb-6 lg:flex-row lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-md bg-copper/15 px-2.5 py-1 text-xs font-bold text-copper-dark">
              <Radar className="size-3.5" />
              00. Garimpo Automático de Achadinhos · 100% Sem Chave de API
            </div>
            <h2 className="mt-2 font-display text-2xl font-semibold text-forest sm:text-3xl">
              Minerador de Produtos Baratos & Bons (R$ 20 a R$ 200)
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-relaxed text-stone sm:text-sm">
              Encontra ofertas acessíveis daquelas que o visitante olha e pensa:{" "}
              <strong className="text-forest">
                "Caramba, por R$ 39,90 vale muito a pena!"
              </strong>
              . Você não precisa criar chave de API nenhuma: clique em{" "}
              <strong className="text-forest">1. Abrir no Mercado Livre</strong>{" "}
              para gerar seu link <code className="text-copper-dark">meli.la</code> e depois em{" "}
              <strong className="text-forest">2. Carregar no Cadastro IA</strong>.
            </p>
          </div>

          <button
            type="button"
            disabled={isMiningDeals}
            onClick={() =>
              void handleRunMiner(minerMaxPrice, minerCategory, minerQuery, true)
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-forest px-5 py-3.5 text-xs font-bold text-cream transition-colors hover:bg-forest-soft disabled:opacity-60 shrink-0"
          >
            {isMiningDeals ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Varrendo 4 radares de vendas recentes ao vivo...
              </>
            ) : (
              <>
                <Flame className="size-4 text-copper" />
                Sortear & Buscar Novas Ofertas Ao Vivo Agora
              </>
            )}
          </button>
        </div>

        {/* Painel de Transparência: Onde estamos buscando e como medimos produtos vendidos recentemente */}
        <div className="mt-5 rounded-xl border border-forest/15 bg-forest/5 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-bold text-forest">
              📡 4 Radares de Vendas Recentes Monitorados Simultaneamente (Cruzando Mercado Livre, Amazon, Magalu, Casas Bahia, Shopee e KaBuM!):
            </p>
            <span className="rounded-md bg-white px-2.5 py-0.5 text-[11px] font-semibold text-copper-dark">
              Filtro ativo: apenas vendas e ofertas das últimas horas / hoje
            </span>
          </div>
          <div className="mt-2.5 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {MONITORED_RADARS_INFO.map((radar, idx) => (
              <div
                key={radar.id}
                className="rounded-lg border border-sand/80 bg-white/90 px-3 py-2 text-[11px]"
              >
                <p className="font-bold text-forest">
                  {idx + 1}. {radar.name}
                </p>
                <p className="mt-0.5 leading-snug text-stone">{radar.detail}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros de Preço Máximo e Categoria do Minerador */}
        <div className="mt-6 grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <span className="block text-xs font-semibold text-forest">
              1. Teto de Preço (Foco em Compra Fácil):
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { max: 50, label: "Até R$ 50" },
                { max: 100, label: "Até R$ 100" },
                { max: 150, label: "Até R$ 150" },
                { max: 350, label: "Até R$ 350" },
              ].map((tier) => (
                <button
                  key={tier.max}
                  type="button"
                  onClick={() =>
                    void handleRunMiner(tier.max, minerCategory, minerQuery)
                  }
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    minerMaxPrice === tier.max
                      ? "bg-forest text-cream"
                      : "border border-sand bg-cream/70 text-forest hover:border-copper",
                  )}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5">
            <span className="block text-xs font-semibold text-forest">
              2. Nicho de Produto:
            </span>
            <div className="mt-2 flex flex-wrap gap-2">
              {(
                [
                  { id: "all", label: "Todos" },
                  { id: "casa", label: "Casa, Móveis & Cama" },
                  { id: "moda", label: "Moda, Tênis & Roupas" },
                  { id: "audio", label: "Fones & Áudio" },
                  { id: "perifericos", label: "Setup & Celular" },
                ] as { id: MinerCategoryFilter; label: string }[]
              ).map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() =>
                    void handleRunMiner(minerMaxPrice, cat.id, minerQuery)
                  }
                  className={cn(
                    "rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                    minerCategory === cat.id
                      ? "bg-copper text-cream"
                      : "border border-sand bg-cream/70 text-forest hover:border-copper",
                  )}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <label
              htmlFor="miner-search-query"
              className="block text-xs font-semibold text-forest"
            >
              3. Buscar item (ex: móveis, cortina, tênis):
            </label>
            <div className="mt-2 flex gap-1.5">
              <input
                id="miner-search-query"
                type="text"
                value={minerQuery}
                onChange={(e) => setMinerQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    void handleRunMiner(minerMaxPrice, minerCategory, minerQuery);
                  }
                }}
                placeholder="Ex: móveis, cortinas, cobertor, tênis..."
                className="w-full rounded-xl border border-sand bg-cream/60 px-3 py-2 text-xs text-ink placeholder:text-stone/60 focus:border-forest focus:outline-none"
              />
              <button
                type="button"
                aria-label="Filtrar achadinhos"
                onClick={() =>
                  void handleRunMiner(minerMaxPrice, minerCategory, minerQuery)
                }
                className="inline-flex items-center justify-center rounded-xl border border-forest bg-forest/10 px-3 py-2 text-xs font-semibold text-forest hover:bg-forest hover:text-cream"
              >
                <Search className="size-3.5" />
              </button>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-stone">Buscas rápidas:</span>
              {[
                "móveis",
                "cortinas",
                "cobertor",
                "roupa de cama",
                "tênis",
                "camisa",
              ].map((quickTerm) => (
                <button
                  key={quickTerm}
                  type="button"
                  onClick={() => {
                    setMinerQuery(quickTerm);
                    void handleRunMiner(minerMaxPrice, "all", quickTerm);
                  }}
                  className="rounded-md border border-sand bg-cream/80 px-2 py-0.5 text-[11px] font-medium text-forest hover:border-copper hover:text-copper"
                >
                  {quickTerm}
                </button>
              ))}
              {minerQuery.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setMinerQuery("");
                    void handleRunMiner(minerMaxPrice, minerCategory, "");
                  }}
                  className="rounded-md bg-copper/15 px-2 py-0.5 text-[11px] font-bold text-copper-dark hover:bg-copper/25"
                >
                  Limpar busca ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Grade de Achadinhos Minerados (5 iniciais + Mostrar Mais p/ abrir todas as ~20+ opções) */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-xs text-stone">
          <span>
            Encontradas <strong className="text-forest">{minedDeals.length}</strong>{" "}
            ofertas de alto giro (exibindo{" "}
            <strong className="text-forest">
              {showAllMinedDeals
                ? minedDeals.length
                : Math.min(5, minedDeals.length)}
            </strong>{" "}
            de <strong className="text-forest">{minedDeals.length}</strong>)
            {liveWebDealsCount > 0
              ? ` · ${liveWebDealsCount} capturadas ao vivo na web`
              : ""}
          </span>
          <span className="font-medium text-copper-dark">
            Ordenados pelo maior Índice de Achadinho (Preço Baixo + Qualidade)
          </span>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(showAllMinedDeals ? minedDeals : minedDeals.slice(0, 5)).map(
            (deal) => {
              const isLoaded = loadedMinedDealId === deal.id;
              return (
                <div
                  key={deal.id}
                  className={cn(
                    "flex flex-col justify-between rounded-2xl border p-4 transition-all",
                    isLoaded
                      ? "border-2 border-copper bg-copper/5"
                      : "border-sand bg-cream/40 hover:border-forest/40",
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1 rounded-md bg-forest px-2 py-0.5 font-mono text-[11px] font-bold text-cream tabular-nums">
                        -{deal.discountPercent}% OFF · Nota {deal.bargainScore}/100
                      </span>
                      <span
                        className={cn(
                          "rounded-md px-2 py-0.5 text-[11px] font-bold",
                          deal.isLiveWebDeal
                            ? "bg-copper/15 text-copper-dark"
                            : "text-stone",
                        )}
                      >
                        {deal.isLiveWebDeal
                          ? "⚡ Ao Vivo Hoje na Web"
                          : "Sugestão Campeã"}
                      </span>
                    </div>

                    <div className="mt-3 flex items-start gap-3">
                      <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sand bg-white p-1.5">
                        <img
                          src={deal.image}
                          alt={deal.title}
                          onError={(e) => {
                            const target = e.currentTarget;
                            const fallback = createDealThumbnailSvg(
                              deal.title,
                              deal.brand,
                              deal.category,
                              deal.price,
                            );
                            if (target.src !== fallback) {
                              target.src = fallback;
                            }
                          }}
                          className="max-h-full max-w-full object-contain"
                          loading="lazy"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-[11px] font-bold uppercase tracking-wider text-stone">
                          {deal.brand}
                        </p>
                        <h3 className="mt-0.5 line-clamp-2 text-xs font-bold leading-snug text-forest sm:text-sm">
                          {deal.title}
                        </h3>
                      </div>
                    </div>

                     <div className="mt-3 flex items-baseline gap-2 rounded-xl border border-sand/80 bg-white px-3 py-2">
                      <span className="font-mono text-lg font-bold text-forest tabular-nums">
                        {formatBRL(deal.price)}
                      </span>
                      {deal.originalPrice > deal.price && (
                        <span className="font-mono text-xs text-stone line-through tabular-nums">
                          {formatBRL(deal.originalPrice)}
                        </span>
                      )}
                      <span className="ml-auto text-[11px] font-semibold text-copper-dark">
                        {deal.recencyLabel || "Vendas ativas hoje"}
                      </span>
                    </div>

                    {/* Termômetro de Onde Está Sendo Vendido & Recência */}
                    {(deal.radarSources?.length || deal.trendingSignal) && (
                      <div className="mt-2.5 rounded-xl border border-forest/15 bg-forest/5 px-3 py-2">
                        {deal.trendingSignal && (
                          <p className="text-[11px] font-bold leading-snug text-forest">
                            {deal.trendingSignal}
                          </p>
                        )}
                        {deal.radarSources && deal.radarSources.length > 0 && (
                          <div className="mt-1.5 flex flex-wrap items-center gap-1">
                            <span className="text-[10px] font-semibold text-stone">
                              Detectado em:
                            </span>
                            {deal.radarSources.map((src) => (
                              <span
                                key={src}
                                className="rounded bg-white px-1.5 py-0.5 text-[10px] font-bold text-copper-dark border border-sand"
                              >
                                {src}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    <p className="mt-2.5 text-xs leading-relaxed text-stone">
                      <strong className="text-forest">Por que vende muito: </strong>
                      {deal.whyItSells}
                    </p>
                  </div>

                  <div className="mt-4 space-y-2 border-t border-sand/80 pt-3">
                    <a
                      href={deal.mercadoLivreSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-forest/30 bg-white px-3 py-2 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-cream"
                    >
                      1. Abrir no Mercado Livre (Pegar Link)
                      <ExternalLink className="size-3.5" />
                    </a>

                    <button
                      type="button"
                      onClick={() => handleLoadMinedDealIntoImporter(deal)}
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2.5 text-xs font-bold transition-colors",
                        isLoaded
                          ? "bg-forest text-cream"
                          : "bg-copper text-cream hover:bg-copper-soft",
                      )}
                    >
                      <Sparkles className="size-3.5" />
                      {isLoaded
                        ? "Carregado no Cadastro Abaixo ✓"
                        : "2. Carregar Ficha no Cadastro IA ↓"}
                    </button>
                  </div>
                </div>
              );
            },
          )}
        </div>

        {minedDeals.length > 5 && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              id="miner-toggle-show-more-btn"
              onClick={() => setShowAllMinedDeals((prev) => !prev)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-forest bg-forest/5 px-6 py-3 text-xs font-bold text-forest transition-colors hover:bg-forest hover:text-cream sm:text-sm"
            >
              {showAllMinedDeals
                ? "Mostrar menos (recolher para as 5 primeiras ofertas)"
                : `Mostrar mais ofertas (+${minedDeals.length - 5} opções — abrir todas as ${minedDeals.length} ofertas)`}
            </button>
          </div>
        )}
      </section>

      <div id="secao-cadastro-ia" className="mt-12 grid gap-10 lg:grid-cols-12">
        {/* Coluna Esquerda (7 cols): Subir Produto por Link com IA */}
        <section className="lg:col-span-7">
          <div className="rounded-2xl border border-sand bg-white/85 p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-copper">
                  01. Cadastro Automático por Link ou Nome
                </span>
                <h2 className="mt-1 font-display text-2xl font-semibold text-forest">
                  Subir Novo Produto com IA
                </h2>
              </div>
              <Wand2 className="size-6 text-copper shrink-0" />
            </div>

            {/* Botões de preenchimento rápido para testar */}
            <div className="mt-5">
              <span className="block text-xs text-stone">
                Testar agora com um exemplo de link real:
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {QUICK_EXAMPLES.map((ex) => (
                  <button
                    key={ex.label}
                    type="button"
                    onClick={() => {
                      setProductTitleHint(ex.label.replace(/^Link\s+/i, ""));
                      setRawInput(ex.input);
                      setPriceHint(ex.price);
                      setAffiliateUrl(ex.affiliateUrl);
                      setProductError(null);
                    }}
                    className="rounded-lg border border-sand bg-cream px-3 py-1.5 text-xs font-medium text-forest transition-colors hover:border-copper hover:text-copper whitespace-nowrap shrink-0"
                  >
                    + {ex.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleAnalyzeProduct} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="ai-product-title-hint"
                  className="block text-xs font-semibold text-forest"
                >
                  1. Nome / Modelo do Produto (copie o título do anúncio na loja)
                </label>
                <input
                  id="ai-product-title-hint"
                  type="text"
                  value={productTitleHint}
                  onChange={(e) => setProductTitleHint(e.target.value)}
                  placeholder="Ex: Notebook Acer Nitro V15 Core i5 RTX 4050 16GB SSD 512GB..."
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/60 px-4 py-2.5 text-sm text-ink placeholder:text-stone/60 focus:border-forest focus:outline-none"
                />
                <span className="mt-1 block text-[11px] text-stone">
                  Dica: Links curtos da Shopee/Amazon (`s.shopee.com.br` / `amzn.to`) às vezes bloqueiam robôs. Colando o título do anúncio aqui, a IA identifica 100% o modelo exato!
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="ai-affiliate-url"
                    className="block text-xs font-semibold text-forest"
                  >
                    2. Seu Link de Afiliado (para o botão de compra)
                  </label>
                  <div className="relative mt-1.5">
                    <input
                      id="ai-affiliate-url"
                      type="text"
                      value={affiliateUrl}
                      onChange={(e) => setAffiliateUrl(e.target.value)}
                      placeholder="https://s.shopee.com.br/seu-codigo..."
                      className="w-full rounded-xl border border-sand bg-cream/60 py-2.5 pr-4 pl-9 text-sm text-ink placeholder:text-stone/60 focus:border-forest focus:outline-none"
                    />
                    <Link2 className="pointer-events-none absolute top-3 left-3 size-4 text-stone" />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="ai-product-price"
                    className="block text-xs font-semibold text-forest"
                  >
                    3. Preço da Oferta em R$
                  </label>
                  <input
                    id="ai-product-price"
                    type="text"
                    value={priceHint}
                    onChange={(e) => setPriceHint(e.target.value)}
                    placeholder="Ex: 3399"
                    className="mt-1.5 w-full rounded-xl border border-sand bg-cream/60 px-4 py-2.5 text-sm text-ink placeholder:text-stone/60 focus:border-forest focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="ai-product-input"
                  className="block text-xs font-semibold text-forest"
                >
                  4. Especificações extras ou Link completo da página (opcional)
                </label>
                <textarea
                  id="ai-product-input"
                  rows={2}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  placeholder="Opcional: cole detalhes extras da descrição do anúncio (processador, RAM, tela) ou o link longo da loja..."
                  className="mt-1.5 w-full rounded-xl border border-sand bg-cream/60 px-4 py-2.5 text-sm text-ink placeholder:text-stone/60 focus:border-forest focus:outline-none"
                />
              </div>

              {productError && (
                <div
                  role="alert"
                  className="rounded-xl border border-copper/50 bg-copper/10 p-3.5 text-xs font-medium leading-relaxed text-ink"
                >
                  <strong className="text-copper">Atenção: </strong>
                  {productError}
                </div>
              )}

              <button
                type="submit"
                disabled={isAnalyzingProduct}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-forest px-6 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-forest-soft disabled:opacity-60"
              >
                {isAnalyzingProduct ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    {analyzingStepText}
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Estruturar Produto Automaticamente com IA
                  </>
                )}
              </button>
            </form>

            {/* Resultado Estruturado pela IA (Revisão e Publicação) */}
            {draft && (
              <div className="mt-8 border-t border-sand pt-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-copper">
                    Ficha Gerada pela IA · Pronta para Revisão
                  </span>
                  <span className="font-mono text-xs font-semibold text-forest tabular-nums">
                    Custo-Benefício Calculado: {draft.metrics.costBenefit}/100
                  </span>
                </div>

                <div className="mt-4 space-y-4 rounded-xl border border-sand bg-cream/60 p-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="draft-name-input"
                        className="block text-xs font-semibold text-forest"
                      >
                        Nome do Produto
                      </label>
                      <input
                        id="draft-name-input"
                        type="text"
                        value={draft.name}
                        onChange={(e) =>
                          setDraft({ ...draft, name: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm font-medium text-forest"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="draft-category-select"
                        className="block text-xs font-semibold text-forest"
                      >
                        Categoria Classificada pela IA
                      </label>
                      <select
                        id="draft-category-select"
                        value={draft.category}
                        onChange={(e) =>
                          setDraft({ ...draft, category: e.target.value })
                        }
                        className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm font-medium text-forest"
                      >
                        {catalogCategories
                          .filter((c) => c.id !== "all")
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                      </select>
                    </div>
                  </div>

                  {draft.suggestedNewCategory && (
                    <div className="rounded-lg border border-copper/40 bg-white p-3.5 text-xs">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <span className="font-semibold text-copper">
                            Sugestão de Nova Categoria pela IA:{" "}
                          </span>
                          <strong className="text-forest">
                            {draft.suggestedNewCategory.label}
                          </strong>
                          <p className="mt-0.5 text-stone">
                            {draft.suggestedNewCategory.description}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setUseSuggestedNewCategory((prev) => !prev)
                          }
                          aria-pressed={useSuggestedNewCategory}
                          className={cn(
                            "rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0",
                            useSuggestedNewCategory
                              ? "bg-copper text-cream"
                              : "border border-sand text-stone",
                          )}
                        >
                          {useSuggestedNewCategory
                            ? "Criar nova categoria ✓"
                            : "Usar categoria atual"}
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <label
                      htmlFor="draft-ideal-input"
                      className="block text-xs font-semibold text-forest"
                    >
                      Sugestão da IA — Este produto é ideal para:
                    </label>
                    <input
                      id="draft-ideal-input"
                      type="text"
                      value={draft.idealFor}
                      onChange={(e) =>
                        setDraft({ ...draft, idealFor: e.target.value })
                      }
                      className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink"
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="draft-highlight-input"
                        className="block text-xs font-semibold text-forest"
                      >
                        Selo de Destaque no Comparador
                      </label>
                      <input
                        id="draft-highlight-input"
                        type="text"
                        value={draft.highlightTitle}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            highlightTitle: e.target.value,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 text-sm text-ink"
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="draft-price-edit"
                        className="block text-xs font-semibold text-forest"
                      >
                        Preço Final (BRL)
                      </label>
                      <input
                        id="draft-price-edit"
                        type="number"
                        value={draft.price}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            price: Number(e.target.value) || 0,
                          })
                        }
                        className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 font-mono text-sm font-bold text-forest tabular-nums"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="draft-image-edit"
                      className="block text-xs font-semibold text-forest"
                    >
                      URL da Foto do Produto (opcional — deixe em branco para usar Ilustração de Estúdio automática)
                    </label>
                    <input
                      id="draft-image-edit"
                      type="text"
                      value={draft.image ?? ""}
                      onChange={(e) =>
                        setDraft({
                          ...draft,
                          image: e.target.value.trim() || undefined,
                        })
                      }
                      placeholder="https://... (ou clique com botão direito na foto da loja > Copiar endereço da imagem)"
                      className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 text-xs text-ink"
                    />
                  </div>

                  <div>
                    <span className="block text-xs font-semibold text-forest">
                      Especificações Técnicas e Análise por Componente:
                    </span>
                    <div className="mt-2 divide-y divide-sand rounded-lg border border-sand bg-white px-3.5 py-1 text-xs">
                      {draft.specs.map((spec) => (
                        <div key={spec.key} className="py-2.5">
                          <div className="flex items-center justify-between gap-3">
                            <span className="font-semibold text-forest">
                              {spec.label}:
                            </span>
                            <span className="text-right font-medium text-ink">
                              {spec.value}{" "}
                              <strong className="font-mono text-copper tabular-nums">
                                ({spec.score}/100)
                              </strong>
                            </span>
                          </div>
                          {spec.usageNote && (
                            <p className="mt-1 text-[11px] text-stone">
                              {spec.usageNote}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-stone">
                    <strong className="text-forest">Análise da IA:</strong>{" "}
                    {draft.aiReasoning}
                  </p>

                  {!publishedSuccessId ? (
                    <button
                      type="button"
                      disabled={isPublishingProduct}
                      onClick={() => void handlePublishProduct()}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-copper px-5 py-3.5 text-sm font-semibold text-cream transition-colors hover:bg-copper-soft disabled:opacity-60"
                    >
                      <Plus className="size-4" />
                      {isPublishingProduct
                        ? "Salvando no Banco de Dados..."
                        : `Publicar Produto no Site e Incluir no Comparador (${formatBRL(draft.price)})`}
                    </button>
                  ) : (
                    <div className="flex flex-col gap-3 rounded-xl border border-forest/30 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-xs font-semibold text-forest">
                        <CheckCircle2 className="size-4 shrink-0 text-copper" />
                        <span>
                          Produto publicado e salvo no catálogo do site!
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            navigate(`/produto/${publishedSuccessId}`)
                          }
                          className="rounded-lg border border-sand px-3 py-1.5 text-xs font-semibold text-forest hover:border-forest whitespace-nowrap"
                        >
                          Ver página do produto
                        </button>
                        <button
                          type="button"
                          onClick={() => navigate("/comparar")}
                          className="inline-flex items-center gap-1 rounded-lg bg-forest px-3 py-1.5 text-xs font-semibold text-cream hover:bg-forest-soft whitespace-nowrap"
                        >
                          <Scale className="size-3.5" />
                          Ver no Comparador
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Coluna Direita (5 cols): Consultor IA de Categorias e Otimização Contínua */}
        <section className="lg:col-span-5">
          <div className="rounded-2xl border border-sand bg-white/85 p-6 sm:p-8">
            <span className="text-xs font-semibold text-copper">
              02. Inteligência de Catálogo
            </span>
            <h2 className="mt-1 font-display text-2xl font-semibold text-forest">
              Sugestão de Categorias & Melhorias
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-stone">
              A IA analisa todos os produtos que você já subiu no site para
              sugerir novas categorias lucrativas e refinar os textos de{" "}
              <em>"Ideal para..."</em> de cada item.
            </p>

            <button
              type="button"
              onClick={handleFetchCatalogAdvice}
              disabled={isAnalyzingCatalog}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-forest bg-forest/5 px-4 py-3 text-xs font-semibold text-forest transition-colors hover:bg-forest hover:text-cream disabled:opacity-60"
            >
              {isAnalyzingCatalog ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Analisando catálogo atual ({catalogProducts.length}{" "}
                  produtos)...
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  Analisar Catálogo & Sugerir Categorias com IA
                </>
              )}
            </button>

            {catalogAdvice && (
              <div className="mt-6 space-y-6 border-t border-sand pt-6">
                <p className="text-xs leading-relaxed text-ink/90">
                  <strong className="font-semibold text-forest">
                    Diagnóstico da IA:{" "}
                  </strong>
                  {catalogAdvice.strategicSummary}
                </p>

                <div>
                  <h3 className="text-xs font-semibold text-forest">
                    Novas Categorias Sugeridas para o seu Site:
                  </h3>
                  <div className="mt-3 space-y-3">
                    {catalogAdvice.newCategories.map((cat) => {
                      const alreadyAdded =
                        appliedCategoryIds.includes(cat.id) ||
                        catalogCategories.some((c) => c.id === cat.id);

                      return (
                        <div
                          key={cat.id}
                          className="rounded-xl border border-sand bg-cream/60 p-4 text-xs"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-display text-base font-semibold text-forest">
                                {cat.label}
                              </p>
                              <p className="mt-0.5 text-stone">
                                {cat.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              disabled={alreadyAdded}
                              onClick={() => {
                                void addCategoryFromAi({
                                  id: cat.id,
                                  label: cat.label,
                                  description: cat.description,
                                });
                                setAppliedCategoryIds((prev) => [
                                  ...prev,
                                  cat.id,
                                ]);
                              }}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors whitespace-nowrap shrink-0",
                                alreadyAdded
                                  ? "bg-sand text-forest"
                                  : "bg-forest text-cream hover:bg-forest-soft",
                              )}
                            >
                              {alreadyAdded ? (
                                <>
                                  <Check className="size-3.5" />
                                  Ativa no site
                                </>
                              ) : (
                                <>
                                  <FolderPlus className="size-3.5" />
                                  Criar categoria
                                </>
                              )}
                            </button>
                          </div>

                          <p className="mt-2 text-ink/85">{cat.reason}</p>
                          <p className="mt-1.5 text-[11px] text-stone">
                            <strong>Exemplos em alta:</strong>{" "}
                            {cat.exampleProducts.join(" · ")}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-forest">
                    Sugestões de "Ideal Para" nos Produtos Atuais:
                  </h3>
                  <div className="mt-3 space-y-3">
                    {catalogAdvice.productImprovements.map((imp) => {
                      const applied = appliedProductIds.includes(
                        imp.productId,
                      );
                      return (
                        <div
                          key={imp.productId}
                          className="rounded-xl border border-sand bg-cream/60 p-4 text-xs"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <strong className="font-semibold text-forest">
                              {imp.productName}
                            </strong>
                            <button
                              type="button"
                              disabled={applied}
                              onClick={() => {
                                void updateProductPositioning(
                                  imp.productId,
                                  imp.suggestedIdealFor,
                                  imp.suggestedHighlightTitle,
                                );
                                setAppliedProductIds((prev) => [
                                  ...prev,
                                  imp.productId,
                                ]);
                              }}
                              className={cn(
                                "inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors whitespace-nowrap shrink-0",
                                applied
                                  ? "bg-sand text-forest"
                                  : "bg-copper text-cream hover:bg-copper-soft",
                              )}
                            >
                              {applied ? (
                                <>
                                  <Check className="size-3" />
                                  Aplicado
                                </>
                              ) : (
                                <>
                                  Aplicar no produto
                                  <ArrowRight className="size-3" />
                                </>
                              )}
                            </button>
                          </div>
                          <p className="mt-2 text-ink/90">
                            <span className="font-semibold text-copper">
                              Novo "Ideal para":
                            </span>{" "}
                            {imp.suggestedIdealFor}
                          </p>
                          <p className="mt-1 text-stone">
                            <span className="font-medium text-forest">
                              Destaque sugerido:
                            </span>{" "}
                            {imp.suggestedHighlightTitle}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Seção 03: Gerenciar Produtos Atuais */}
      <section className="mt-12 rounded-2xl border border-sand bg-white/85 p-6 sm:p-8">
        <div>
          <span className="text-xs font-semibold text-copper">
            03. Gestão Exclusiva do Proprietário
          </span>
          <h2 className="mt-1 font-display text-2xl font-semibold text-forest">
            Editar Produtos Ativos ({catalogProducts.length})
          </h2>
          <p className="mt-1 text-xs text-stone">
            Atualize rapidamente o preço, o seu link de afiliado ou a frase de
            recomendação de qualquer produto do catálogo.
          </p>
        </div>

        <div className="mt-6 divide-y divide-sand">
          {catalogProducts.map((product) => {
            const isEditing = editingProductId === product.id;
            return (
              <div key={product.id} className="py-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-forest">
                        {product.name}
                      </span>
                      <span className="rounded-md bg-sand px-2 py-0.5 font-mono text-xs font-bold text-forest tabular-nums">
                        {formatBRL(product.price)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-stone">
                      <strong>Ideal para:</strong> {product.idealFor}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() =>
                        isEditing
                          ? setEditingProductId(null)
                          : startEditingProduct(product)
                      }
                      className="inline-flex items-center gap-1.5 rounded-lg border border-sand bg-cream px-3 py-1.5 text-xs font-semibold text-forest hover:border-copper"
                    >
                      <Pencil className="size-3.5" />
                      {isEditing ? "Cancelar" : "Editar"}
                    </button>

                    <button
                      type="button"
                      onClick={() => void deleteProductFromCatalog(product.id)}
                      aria-label={`Remover ${product.name}`}
                      className="inline-flex items-center gap-1 rounded-lg border border-sand px-2.5 py-1.5 text-xs text-stone hover:border-copper hover:text-copper"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-4 grid gap-3 rounded-xl border border-sand bg-cream/60 p-4 sm:grid-cols-3">
                    <div>
                      <label className="block text-xs font-semibold text-forest">
                        Preço (R$)
                      </label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 font-mono text-xs font-bold text-forest"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-forest">
                        Link de Afiliado
                      </label>
                      <input
                        type="text"
                        value={editAffiliateUrl}
                        onChange={(e) => setEditAffiliateUrl(e.target.value)}
                        className="mt-1 w-full rounded-lg border border-sand bg-white px-3 py-2 text-xs text-ink"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-forest">
                        Ideal para quem:
                      </label>
                      <div className="mt-1 flex gap-2">
                        <input
                          type="text"
                          value={editIdealFor}
                          onChange={(e) => setEditIdealFor(e.target.value)}
                          className="w-full rounded-lg border border-sand bg-white px-3 py-2 text-xs text-ink"
                        />
                        <button
                          type="button"
                          onClick={() => void saveProductEdit(product.id)}
                          className="rounded-lg bg-forest px-3 py-2 text-xs font-semibold text-cream hover:bg-forest-soft shrink-0"
                        >
                          Salvar
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
