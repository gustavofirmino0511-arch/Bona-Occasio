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
  getDoc,
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
import {
  sanitizeExternalUrl,
  sanitizeImageUrl,
  sanitizePlainText,
} from "./utils";

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
    tenantId?: boolean | string | null;
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
    await getDocFromServer(doc(db, "products", "audio-anker-soundcore-p30i"));
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
    name: sanitizePlainText(product.name || "Produto", 160) || "Produto",
    shortName:
      sanitizePlainText(product.shortName || product.name || "Produto", 80) ||
      "Produto",
    brand: sanitizePlainText(product.brand || "Marca", 60) || "Marca",
    tagline:
      sanitizePlainText(
        product.tagline || product.idealFor || "Oferta selecionada",
        400,
      ) || "Oferta selecionada",
    image: sanitizeImageUrl(product.image).slice(0, 50000),
    price: Math.max(0, Math.min(1000000, Number(product.price) || 0)),
    category: safeCategory,
    affiliateUrl: sanitizeExternalUrl(product.affiliateUrl).slice(0, 1000),
    featured: Boolean(product.featured),
    idealFor:
      sanitizePlainText(product.idealFor || "Uso geral", 300) || "Uso geral",
    highlightTitle:
      sanitizePlainText(product.highlightTitle || "Destaque", 120) ||
      "Destaque",
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
        key: sanitizePlainText(s.key || "spec", 64) || "spec",
        label: sanitizePlainText(s.label || "Item", 120) || "Item",
        value: sanitizePlainText(s.value || "Sim", 300) || "Sim",
        score: Math.max(0, Math.min(100, Math.round(Number(s.score) || 80))),
        ...(s.usageNote
          ? { usageNote: sanitizePlainText(s.usageNote, 400) }
          : {}),
      })),
    pros: (product.pros.length > 0 ? product.pros : ["Excelente custo-benefício"])
      .slice(0, 15)
      .map((p) => sanitizePlainText(p, 300) || "Ponto positivo"),
    cons: (product.cons.length > 0
      ? product.cons
      : ["Estoque sujeito a variação"]
    )
      .slice(0, 15)
      .map((c) => sanitizePlainText(c, 300) || "Ponto de atenção"),
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
    payload.installmentText = sanitizePlainText(product.installmentText, 120);
  }

  return { safeId, payload };
}

export async function saveProductToCloud(product: Product): Promise<void> {
  const user = auth.currentUser;
  if (!user) return;

  const { safeId, payload } = sanitizeProductPayload(product, user.uid);
  const path = `products/${safeId}`;
  const docRef = doc(db, "products", safeId);
  try {
    const existingSnap = await getDoc(docRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : null;
    await setDoc(docRef, {
      ...payload,
      authorUid:
        typeof existingData?.authorUid === "string"
          ? existingData.authorUid
          : payload.authorUid,
      createdAt: existingData?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
  const docRef = doc(db, "categories", safeId);
  try {
    const existingSnap = await getDoc(docRef);
    const existingData = existingSnap.exists() ? existingSnap.data() : null;
    await setDoc(docRef, {
      id: safeId,
      label: sanitizePlainText(category.label || "Categoria", 80) || "Categoria",
      description:
        sanitizePlainText(
          category.description || "Produtos selecionados pela curadoria",
          240,
        ) || "Produtos selecionados pela curadoria",
      isPublic: true,
      authorUid:
        typeof existingData?.authorUid === "string"
          ? existingData.authorUid
          : user.uid.slice(0, 128),
      createdAt: existingData?.createdAt ?? serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
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
