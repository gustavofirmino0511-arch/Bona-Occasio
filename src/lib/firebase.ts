import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";
import type { Category, Product } from "../types/product";
import { sanitizeExternalUrl } from "./utils";

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const OWNER_EMAIL = "gustavofirmino0511@gmail.com";

export enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null,
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Validate connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, "products", "notebook-vivobook-ryzen7"));
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("the client is offline")
    ) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();

// Blueprint validation constants matching firebase-blueprint.json & firestore.rules
const ID_REGEX = /^[a-zA-Z0-9_-]+$/;

function sanitizeId(raw: string, maxLen = 128): string {
  const cleaned = raw
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "-")
    .slice(0, maxLen);
  return ID_REGEX.test(cleaned) && cleaned.length >= 2 ? cleaned : "item-id";
}

export function sanitizeProductPayload(
  product: Product,
  authorUid: string,
) {
  const safeId = sanitizeId(product.id, 128);
  const safeCategory = sanitizeId(product.category, 64);

  const payload: Record<string, unknown> = {
    id: safeId,
    name: (product.name || "Produto").trim().slice(0, 160),
    shortName: (product.shortName || product.name || "Produto")
      .trim()
      .slice(0, 80),
    brand: (product.brand || "Marca").trim().slice(0, 60),
    tagline: (product.tagline || product.idealFor || "Oferta selecionada")
      .trim()
      .slice(0, 400),
    image: (product.image || "https://exemplo.com/img.svg").slice(0, 50000),
    price: Math.max(0, Math.min(1000000, Number(product.price) || 0)),
    category: safeCategory,
    affiliateUrl: sanitizeExternalUrl(product.affiliateUrl).slice(0, 1000),
    featured: Boolean(product.featured),
    idealFor: (product.idealFor || "Uso geral").trim().slice(0, 300),
    highlightTitle: (product.highlightTitle || "Destaque")
      .trim()
      .slice(0, 120),
    rating: Math.max(0, Math.min(5, Number(product.rating) || 4.8)),
    reviewCount: Math.max(
      0,
      Math.min(1000000, Number(product.reviewCount) || 100),
    ),
    metrics: {
      performance: Math.max(
        0,
        Math.min(100, Math.round(product.metrics.performance || 80)),
      ),
      costBenefit: Math.max(
        0,
        Math.min(100, Math.round(product.metrics.costBenefit || 85)),
      ),
      battery: Math.max(
        0,
        Math.min(100, Math.round(product.metrics.battery || 80)),
      ),
      mobility: Math.max(
        0,
        Math.min(100, Math.round(product.metrics.mobility || 80)),
      ),
      buildQuality: Math.max(
        0,
        Math.min(100, Math.round(product.metrics.buildQuality || 80)),
      ),
    },
    specs: (product.specs.length > 0
      ? product.specs
      : [{ key: "geral", label: "Destaque", value: "Padrão", score: 85 }]
    )
      .slice(0, 20)
      .map((s) => ({
        key: String(s.key || "spec").slice(0, 64),
        label: String(s.label || "Item").slice(0, 120),
        value: String(s.value || "Sim").slice(0, 300),
        score: Math.max(0, Math.min(100, Math.round(Number(s.score) || 80))),
        ...(s.usageNote ? { usageNote: String(s.usageNote).slice(0, 400) } : {}),
      })),
    pros: (product.pros.length > 0 ? product.pros : ["Excelente custo-benefício"])
      .slice(0, 15)
      .map((p) => String(p).slice(0, 300)),
    cons: (product.cons.length > 0
      ? product.cons
      : ["Estoque sujeito a variação"]
    )
      .slice(0, 15)
      .map((c) => String(c).slice(0, 300)),
    isPublic: true,
    authorUid: authorUid.slice(0, 128),
  };

  if (
    typeof product.originalPrice === "number" &&
    product.originalPrice > 0
  ) {
    payload.originalPrice = Math.max(
      0,
      Math.min(1000000, Number(product.originalPrice)),
    );
  }

  if (product.installmentText && product.installmentText.trim().length > 0) {
    payload.installmentText = product.installmentText.trim().slice(0, 120);
  }

  return { safeId, payload };
}

export async function saveProductToCloud(product: Product): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const { safeId, payload } = sanitizeProductPayload(product, user.uid);
  const path = `products/${safeId}`;
  try {
    await setDoc(doc(db, "products", safeId), {
      ...payload,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteProductFromCloud(productId: string): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const safeId = sanitizeId(productId, 128);
  const path = `products/${safeId}`;
  try {
    await deleteDoc(doc(db, "products", safeId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function saveCategoryToCloud(category: Category): Promise<void> {
  const user = auth.currentUser;
  if (!user || category.id === "all") return;

  const safeId = sanitizeId(String(category.id), 64);
  const path = `categories/${safeId}`;
  try {
    await setDoc(doc(db, "categories", safeId), {
      id: safeId,
      label: (category.label || "Categoria").trim().slice(0, 80),
      description: (
        category.description || "Produtos selecionados pela curadoria"
      )
        .trim()
        .slice(0, 240),
      isPublic: true,
      authorUid: user.uid.slice(0, 128),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export {
  collection,
  onAuthStateChanged,
  onSnapshot,
  query,
  signInWithPopup,
  signOut,
  where,
  type User,
};
