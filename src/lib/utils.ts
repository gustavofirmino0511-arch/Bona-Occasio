import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import {
  isSafePublicHttpUrl,
  sanitizeAffiliateUrl,
  sanitizeImageUrl,
  sanitizePlainText,
} from "./security";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  const hasCents = Math.abs(value % 1) > 0.001;
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function discountPercent(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  return Math.round((1 - price / original) * 100);
}

/**
 * Garante que links externos (como links de afiliado) usem exclusivamente
 * protocolo HTTPS público seguro, bloqueando SSRF e injeções javascript: ou data:.
 */
export function sanitizeExternalUrl(rawUrl?: string): string {
  return sanitizeAffiliateUrl(rawUrl);
}

export { isSafePublicHttpUrl, sanitizeImageUrl, sanitizePlainText };


