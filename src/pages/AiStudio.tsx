import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Check,
  CheckCircle2,
  Cloud,
  FolderPlus,
  KeyRound,
  Link2,
  Loader2,
  Lock,
  LogOut,
  Pencil,
  Plus,
  Scale,
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
              Nova senha de proprietário (mínimo 4 caracteres)
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

      {/* Cabeçalho */}
      <div className="max-w-3xl">
        <p className="text-xs font-semibold text-copper">
          Painel Privado do Dono (/admin) · Banco de Dados Firebase Conectado
        </p>
        <h1
          className="mt-2 font-display text-3xl font-semibold tracking-tight text-forest sm:text-5xl"
          style={{ textWrap: "balance" }}
        >
          Central IA de Produtos e Categorias
        </h1>
        <p className="mt-4 text-base leading-relaxed text-stone">
          Cole apenas o link ou o nome do produto que você quer divulgar. A
          inteligência artificial identifica a categoria ideal, escreve para
          quem o produto é recomendado, analisa cada peça (processador, placa de
          vídeo, câmera, bateria) e já sobe o produto para o site e comparador.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-12">
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
