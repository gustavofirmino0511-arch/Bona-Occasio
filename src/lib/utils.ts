import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function discountPercent(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  return Math.round((1 - price / original) * 100);
}

/**
 * Garante que links externos (como links de afiliado) usem exclusivamente
 * protocolo seguro https:// ou http://, bloqueando injeções javascript: ou data:.
 */
export function sanitizeExternalUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "https://exemplo.com";
  }
  const trimmed = rawUrl.trim();
  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" || parsed.protocol === "http:") {
      return parsed.toString();
    }
  } catch {
    // Se o usuário digitou sem https:// na frente (ex: s.shopee.com.br/xyz)
    if (/^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
      return `https://${trimmed}`;
    }
  }
  return "https://exemplo.com";
}
