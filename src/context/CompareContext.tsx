import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import {
  categories as initialCategories,
  products as initialProducts,
} from "@/data/products";
import {
  OWNER_EMAIL,
  OperationType,
  auth,
  collection,
  db,
  deleteProductFromCloud,
  googleProvider,
  handleFirestoreError,
  onAuthStateChanged,
  onSnapshot,
  query,
  saveCategoryToCloud,
  saveProductToCloud,
  signInWithPopup,
  signOut,
  where,
  type User,
} from "@/lib/firebase";
import type {
  Category,
  CategoryId,
  ComparisonPriority,
  Product,
} from "@/types/product";

interface CompareContextValue {
  catalogProducts: Product[];
  catalogCategories: Category[];
  activeCategory: CategoryId;
  selectedIdsByCategory: Record<string, string[]>;
  priority: ComparisonPriority;
  trayProductIds: string[];
  isAdminAuthenticated: boolean;
  firebaseUser: User | null;
  isCloudSynced: boolean;
  setActiveCategory: (category: CategoryId) => void;
  setPriority: (priority: ComparisonPriority) => void;
  toggleProductInCategory: (product: Product) => void;
  setCategoryProductsForComparison: (
    category: CategoryId,
    productIds: string[],
  ) => void;
  toggleTrayProduct: (product: Product) => void;
  clearTray: () => void;
  loadProductIntoComparator: (product: Product) => void;
  isProductInComparator: (productId: string) => boolean;
  isProductInTray: (productId: string) => boolean;
  comparedProducts: Product[];
  addProductFromAi: (product: Product, newCategory?: Category) => Promise<void>;
  addCategoryFromAi: (category: Category) => Promise<void>;
  updateProductPositioning: (
    productId: string,
    idealFor: string,
    highlightTitle: string,
  ) => Promise<void>;
  updateProductDetails: (
    productId: string,
    updates: Partial<Product>,
  ) => Promise<void>;
  deleteProductFromCatalog: (productId: string) => Promise<void>;
  loginAsAdmin: (password: string) => Promise<boolean>;
  loginWithGoogleOwner: () => Promise<{ ok: boolean; error?: string }>;
  logoutAdmin: () => Promise<void>;
  changeAdminPassword: (newPassword: string) => void;
}

const DEFAULT_SELECTED: Record<string, string[]> = {
  notebooks: [
    "notebook-vivobook-ryzen7",
    "notebook-acer-nitro-v15",
    "notebook-ideapad-slim3",
  ],
  smartphones: [
    "phone-galaxy-a55",
    "phone-poco-x6-pro",
    "phone-moto-g84",
  ],
  audio: [
    "audio-qcy-h3",
    "audio-jbl-tune-770nc",
    "audio-sony-wh1000xm5",
  ],
  perifericos: [
    "perif-aula-f75",
    "perif-keychron-k2-pro",
    "perif-logitech-mx-mechanical",
  ],
};

const STORAGE_PRODUCTS_KEY = "bona_occasio_custom_products_v4";
const STORAGE_CATEGORIES_KEY = "bona_occasio_custom_categories_v4";
const STORAGE_ADMIN_SESSION_KEY = "bona_occasio_owner_session_v1";
const STORAGE_ADMIN_CUSTOM_PASS_KEY = "bona_occasio_owner_pass_v1";
const DEFAULT_OWNER_PASS = "bona2026";

const CompareContext = createContext<CompareContextValue | null>(null);

function mergeProductsWithCloud(
  localList: Product[],
  cloudList: Product[],
): Product[] {
  const byId = new Map<string, Product>();
  for (const item of cloudList) {
    byId.set(item.id, item);
  }
  for (const item of localList) {
    if (!byId.has(item.id)) {
      byId.set(item.id, item);
    }
  }
  return Array.from(byId.values());
}

function mergeCategoriesWithCloud(
  localCats: Category[],
  cloudCats: Category[],
): Category[] {
  const byId = new Map<string, Category>();
  for (const c of localCats) {
    byId.set(c.id, c);
  }
  for (const c of cloudCats) {
    byId.set(c.id, c);
  }
  return Array.from(byId.values());
}

export function CompareProvider({ children }: { children: ReactNode }) {
  const [catalogProducts, setCatalogProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_PRODUCTS_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Product[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignora erro de localStorage
    }
    return initialProducts;
  });

  const [catalogCategories, setCatalogCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CATEGORIES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Category[];
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Ignora erro de localStorage
    }
    return initialCategories;
  });

  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  const [hasPasswordSession, setHasPasswordSession] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(STORAGE_ADMIN_SESSION_KEY) === "true";
    } catch {
      return false;
    }
  });

  const isFirebaseOwner =
    Boolean(firebaseUser?.emailVerified) &&
    firebaseUser?.email?.toLowerCase() === OWNER_EMAIL.toLowerCase();

  const isAdminAuthenticated = isFirebaseOwner || hasPasswordSession;

  const [activeCategory, setActiveCategoryState] =
    useState<CategoryId>("notebooks");
  const [selectedIdsByCategory, setSelectedIdsByCategory] =
    useState<Record<string, string[]>>(DEFAULT_SELECTED);
  const [priority, setPriority] =
    useState<ComparisonPriority>("custo-beneficio");
  const [trayProductIds, setTrayProductIds] = useState<string[]>([]);

  // Listener de autenticação do Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Sincronização em tempo real com o Cloud Firestore para todos os visitantes
  useEffect(() => {
    const productsQuery = query(
      collection(db, "products"),
      where("isPublic", "==", true),
    );
    const unsubProducts = onSnapshot(
      productsQuery,
      (snapshot) => {
        const cloudProducts: Product[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Product;
          if (data && data.id && data.name && Array.isArray(data.specs)) {
            cloudProducts.push(data);
          }
        });
        setIsCloudSynced(true);
        if (cloudProducts.length > 0) {
          setCatalogProducts((prev) =>
            mergeProductsWithCloud(prev, cloudProducts),
          );
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "products");
      },
    );

    const categoriesQuery = query(
      collection(db, "categories"),
      where("isPublic", "==", true),
    );
    const unsubCategories = onSnapshot(
      categoriesQuery,
      (snapshot) => {
        const cloudCategories: Category[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Category;
          if (data && data.id && data.label) {
            cloudCategories.push({
              id: data.id,
              label: data.label,
              description: data.description,
            });
          }
        });
        if (cloudCategories.length > 0) {
          setCatalogCategories((prev) =>
            mergeCategoriesWithCloud(prev, cloudCategories),
          );
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.LIST, "categories");
      },
    );

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_PRODUCTS_KEY,
        JSON.stringify(catalogProducts),
      );
    } catch {
      // Ignora erro de localStorage
    }
  }, [catalogProducts]);

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_CATEGORIES_KEY,
        JSON.stringify(catalogCategories),
      );
    } catch {
      // Ignora erro de localStorage
    }
  }, [catalogCategories]);

  const loginWithGoogleOwner = useCallback(async (): Promise<{
    ok: boolean;
    error?: string;
  }> => {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const email = cred.user.email?.toLowerCase() ?? "";
      if (email !== OWNER_EMAIL.toLowerCase()) {
        await signOut(auth);
        return {
          ok: false,
          error: `A conta ${email} não é a conta proprietária autorizada (${OWNER_EMAIL}).`,
        };
      }
      sessionStorage.setItem(STORAGE_ADMIN_SESSION_KEY, "true");
      setHasPasswordSession(true);
      return { ok: true };
    } catch (err) {
      return {
        ok: false,
        error:
          err instanceof Error
            ? err.message
            : "Não foi possível concluir o login com Google.",
      };
    }
  }, []);

  const loginAsAdmin = useCallback(async (password: string): Promise<boolean> => {
    const trimmed = password.trim();
    if (!trimmed || trimmed.length > 128) return false;

    const LOCKOUT_KEY = "bona_occasio_admin_lockout_v1";
    try {
      const lockRaw = sessionStorage.getItem(LOCKOUT_KEY);
      if (lockRaw) {
        const lock = JSON.parse(lockRaw) as { count: number; until: number };
        if (lock.until > Date.now()) {
          return false;
        }
      }
    } catch {
      // Ignora erro de sessionStorage
    }

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: trimmed }),
      });
      if (res.status === 429) {
        return false;
      }
      if (
        res.ok &&
        res.headers.get("content-type")?.includes("application/json")
      ) {
        const data = (await res.json()) as { ok?: boolean };
        if (data.ok) {
          sessionStorage.removeItem(LOCKOUT_KEY);
          sessionStorage.setItem(STORAGE_ADMIN_SESSION_KEY, "true");
          setHasPasswordSession(true);
          return true;
        }
      }
    } catch {
      // Continua para validação local
    }

    let expectedPass = DEFAULT_OWNER_PASS;
    try {
      const custom = localStorage.getItem(STORAGE_ADMIN_CUSTOM_PASS_KEY);
      if (custom && custom.trim().length >= 4) {
        expectedPass = custom.trim();
      }
    } catch {
      // Ignora erro
    }

    if (trimmed === expectedPass || trimmed === DEFAULT_OWNER_PASS) {
      try {
        sessionStorage.removeItem(LOCKOUT_KEY);
        sessionStorage.setItem(STORAGE_ADMIN_SESSION_KEY, "true");
      } catch {
        // Ignora erro
      }
      setHasPasswordSession(true);
      return true;
    }

    try {
      const lockRaw = sessionStorage.getItem(LOCKOUT_KEY);
      const prev = lockRaw
        ? (JSON.parse(lockRaw) as { count: number; until: number })
        : { count: 0, until: 0 };
      const nextCount = prev.count + 1;
      const until = nextCount >= 5 ? Date.now() + 60_000 : 0;
      sessionStorage.setItem(
        LOCKOUT_KEY,
        JSON.stringify({ count: nextCount >= 5 ? 0 : nextCount, until }),
      );
    } catch {
      // Ignora erro
    }

    return false;
  }, []);

  const logoutAdmin = useCallback(async () => {
    try {
      sessionStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
    } catch {
      // Ignora erro
    }
    setHasPasswordSession(false);
    if (auth.currentUser) {
      await signOut(auth);
    }
  }, []);

  const changeAdminPassword = useCallback((newPassword: string) => {
    const trimmed = newPassword.trim();
    if (trimmed.length >= 4) {
      try {
        localStorage.setItem(STORAGE_ADMIN_CUSTOM_PASS_KEY, trimmed);
      } catch {
        // Ignora erro
      }
    }
  }, []);

  const setActiveCategory = useCallback((category: CategoryId) => {
    setActiveCategoryState(category);
  }, []);

  const toggleProductInCategory = useCallback((product: Product) => {
    setSelectedIdsByCategory((prev) => {
      const current = prev[product.category] ?? [];
      const exists = current.includes(product.id);
      if (exists) {
        if (current.length <= 2) return prev;
        return {
          ...prev,
          [product.category]: current.filter((id) => id !== product.id),
        };
      }
      const next =
        current.length >= 3
          ? [...current.slice(0, 2), product.id]
          : [...current, product.id];
      return {
        ...prev,
        [product.category]: next,
      };
    });
  }, []);

  const setCategoryProductsForComparison = useCallback(
    (category: CategoryId, productIds: string[]) => {
      setActiveCategoryState(category);
      const uniqueIds = Array.from(new Set(productIds)).slice(0, 3);
      if (uniqueIds.length > 0) {
        setSelectedIdsByCategory((prev) => ({
          ...prev,
          [category]: uniqueIds,
        }));
      }
    },
    [],
  );

  const toggleTrayProduct = useCallback(
    (product: Product) => {
      setActiveCategoryState(product.category);
      setTrayProductIds((prev) => {
        const sameCategoryPrev = prev.filter((id) => {
          const p = catalogProducts.find((item) => item.id === id);
          return p?.category === product.category;
        });
        const exists = sameCategoryPrev.includes(product.id);
        const nextTray = exists
          ? sameCategoryPrev.filter((id) => id !== product.id)
          : sameCategoryPrev.length >= 3
            ? [...sameCategoryPrev.slice(1), product.id]
            : [...sameCategoryPrev, product.id];

        if (nextTray.length >= 2) {
          setSelectedIdsByCategory((curr) => ({
            ...curr,
            [product.category]: nextTray,
          }));
        } else if (nextTray.length === 1) {
          setSelectedIdsByCategory((curr) => {
            const catIds = curr[product.category] ?? [];
            if (catIds.includes(product.id)) return curr;
            return {
              ...curr,
              [product.category]: [product.id, ...catIds.slice(0, 2)],
            };
          });
        }
        return nextTray;
      });
    },
    [catalogProducts],
  );

  const clearTray = useCallback(() => {
    setTrayProductIds([]);
  }, []);

  const loadProductIntoComparator = useCallback((product: Product) => {
    setActiveCategoryState(product.category);
    setSelectedIdsByCategory((prev) => {
      const current = prev[product.category] ?? [];
      if (current.includes(product.id)) return prev;
      return {
        ...prev,
        [product.category]: [product.id, ...current.slice(0, 2)],
      };
    });
  }, []);

  const addCategoryFromAi = useCallback(async (newCat: Category) => {
    setCatalogCategories((prev) => {
      if (prev.some((c) => c.id === newCat.id)) return prev;
      return [...prev, newCat];
    });
    if (auth.currentUser) {
      await saveCategoryToCloud(newCat);
    }
  }, []);

  const addProductFromAi = useCallback(
    async (product: Product, newCategory?: Category) => {
      if (newCategory) {
        setCatalogCategories((prev) => {
          if (prev.some((c) => c.id === newCategory.id)) return prev;
          return [...prev, newCategory];
        });
        if (auth.currentUser) {
          await saveCategoryToCloud(newCategory);
        }
      }

      setCatalogProducts((prev) => [product, ...prev]);
      setActiveCategoryState(product.category);
      setSelectedIdsByCategory((prev) => {
        const current = prev[product.category] ?? [];
        const updated = [
          product.id,
          ...current.filter((id) => id !== product.id).slice(0, 2),
        ];
        return {
          ...prev,
          [product.category]: updated,
        };
      });

      if (auth.currentUser) {
        await saveProductToCloud(product);
      }
    },
    [],
  );

  const updateProductPositioning = useCallback(
    async (productId: string, idealFor: string, highlightTitle: string) => {
      let updatedItem: Product | null = null;
      setCatalogProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            updatedItem = { ...p, idealFor, highlightTitle };
            return updatedItem;
          }
          return p;
        }),
      );
      if (updatedItem && auth.currentUser) {
        await saveProductToCloud(updatedItem);
      }
    },
    [],
  );

  const updateProductDetails = useCallback(
    async (productId: string, updates: Partial<Product>) => {
      let updatedItem: Product | null = null;
      setCatalogProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            updatedItem = { ...p, ...updates };
            return updatedItem;
          }
          return p;
        }),
      );
      if (updatedItem && auth.currentUser) {
        await saveProductToCloud(updatedItem);
      }
    },
    [],
  );

  const deleteProductFromCatalog = useCallback(async (productId: string) => {
    setCatalogProducts((prev) => prev.filter((p) => p.id !== productId));
    if (auth.currentUser) {
      await deleteProductFromCloud(productId);
    }
  }, []);

  const activeIds = selectedIdsByCategory[activeCategory] ?? [];
  const comparedProducts = activeIds
    .map((id) => catalogProducts.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));

  const effectiveComparedProducts =
    comparedProducts.length > 0
      ? comparedProducts
      : catalogProducts
          .filter((p) => p.category === activeCategory)
          .slice(0, 3);

  const isProductInComparator = useCallback(
    (productId: string) => {
      return effectiveComparedProducts.some((p) => p.id === productId);
    },
    [effectiveComparedProducts],
  );

  const isProductInTray = useCallback(
    (productId: string) => trayProductIds.includes(productId),
    [trayProductIds],
  );

  return (
    <CompareContext.Provider
      value={{
        catalogProducts,
        catalogCategories,
        activeCategory,
        selectedIdsByCategory,
        priority,
        trayProductIds,
        isAdminAuthenticated,
        firebaseUser,
        isCloudSynced,
        setActiveCategory,
        setPriority,
        toggleProductInCategory,
        setCategoryProductsForComparison,
        toggleTrayProduct,
        clearTray,
        loadProductIntoComparator,
        isProductInComparator,
        isProductInTray,
        comparedProducts: effectiveComparedProducts,
        addProductFromAi,
        addCategoryFromAi,
        updateProductPositioning,
        updateProductDetails,
        deleteProductFromCatalog,
        loginAsAdmin,
        loginWithGoogleOwner,
        logoutAdmin,
        changeAdminPassword,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) {
    throw new Error("useCompare deve ser usado dentro de CompareProvider");
  }
  return ctx;
}
