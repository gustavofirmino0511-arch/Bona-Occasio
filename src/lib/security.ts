/**
 * Módulo de Segurança e Sanitização (Defesa em Profundidade)
 * Protege contra SSRF, XSS, Protocol Injection (javascript:/data:),
 * armazenamento de senhas em texto puro e payloads maliciosos.
 */

const PRIVATE_HOST_PATTERNS = [
  /^localhost$/i,
  /^127\.\d+\.\d+\.\d+$/,
  /^10\.\d+\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+$/,
  /^169\.254\.\d+\.\d+$/, // Cloud metadata (AWS/GCP/Azure) & link-local
  /^0\.0\.0\.0$/,
  /^\[?::1\]?$/,
  /^\[?fe80:/i,
  /^\[?fc00:/i,
  /^\[?fd[0-9a-f]{2}:/i,
  /\.internal$/i,
  /\.local$/i,
  /^metadata\.google\.internal$/i,
];

/**
 * Verifica se uma URL aponta para um endereço público seguro (HTTP/HTTPS),
 * bloqueando ataques de SSRF (Server-Side Request Forgery) contra redes internas,
 * localhost ou endpoints de metadados da nuvem (169.254.169.254).
 */
export function isSafePublicHttpUrl(rawUrl: string): boolean {
  if (!rawUrl || typeof rawUrl !== "string") return false;
  const trimmed = rawUrl.trim();
  if (trimmed.length < 8 || trimmed.length > 2048) return false;

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return false;
    }
    // Bloqueia credenciais embutidas na URL (ex: https://admin:pass@site.com)
    if (parsed.username || parsed.password) {
      return false;
    }

    const host = parsed.hostname.toLowerCase();
    if (!host || !host.includes(".")) {
      return false;
    }

    for (const pattern of PRIVATE_HOST_PATTERNS) {
      if (pattern.test(host)) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Garante que links externos de afiliado usem exclusivamente HTTPS público seguro,
 * bloqueando injeções javascript:, vbscript:, data:, file: ou IPs internos.
 */
export function sanitizeAffiliateUrl(rawUrl?: string): string {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "https://exemplo.com";
  }

  const trimmed = rawUrl
    .trim()
    .replace(/[\u0000-\u001F\u007F"'<>\\]/g, "");

  let candidate = trimmed;
  if (
    !/^https?:\/\//i.test(candidate) &&
    /^[a-zA-Z0-9][a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(candidate)
  ) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "https://exemplo.com";
    }
    if (!isSafePublicHttpUrl(parsed.toString())) {
      return "https://exemplo.com";
    }
    // Força upgrade para HTTPS para evitar downgrade/sniffing no redirecionamento
    parsed.protocol = "https:";
    return parsed.toString().slice(0, 1000);
  } catch {
    return "https://exemplo.com";
  }
}

/**
 * Sanitiza URLs de imagem permitindo apenas HTTPS público ou ilustrações data:image/*
 * sem scripts ou eventos embutidos (bloqueando XSS via SVG malicioso).
 */
export function sanitizeImageUrl(rawImage?: string, fallback = "https://exemplo.com/img.svg"): string {
  if (!rawImage || typeof rawImage !== "string") {
    return fallback;
  }
  const trimmed = rawImage.trim();
  if (trimmed.length < 5 || trimmed.length > 50000) {
    return fallback;
  }

  if (trimmed.startsWith("data:image/")) {
    const lower = trimmed.toLowerCase();
    // Bloqueia qualquer tentativa de injetar script ou handlers JS dentro de um SVG data URI
    if (
      lower.includes("<script") ||
      lower.includes("javascript:") ||
      lower.includes("onload=") ||
      lower.includes("onerror=") ||
      lower.includes("onclick=") ||
      lower.includes("<iframe") ||
      lower.includes("<foreignobject")
    ) {
      return fallback;
    }
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === "https:" && isSafePublicHttpUrl(parsed.toString())) {
      return parsed.toString();
    }
  } catch {
    // Continua para fallback
  }

  return fallback;
}

/**
 * Remove tags HTML/scripts perigosos e caracteres de controle invisíveis de textos,
 * preservando acentuação em português e pontuação legítima.
 */
export function sanitizePlainText(input: unknown, maxLength = 300): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .replace(/<\s*\/?\s*(script|iframe|object|embed|style|link|meta)[^>]*>/gi, "")
    .replace(/javascript\s*:/gi, "")
    .replace(/on(error|load|click|mouseover|focus)\s*=/gi, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Gera hash SHA-256 hexadecimal usando Web Crypto API (navegador ou Node 20+)
 * para nunca armazenar senhas personalizadas em texto puro no navegador.
 */
export async function hashPasswordSha256(password: string): Promise<string> {
  const normalized = password.trim();
  const encoder = new TextEncoder();
  const data = encoder.encode(`bona_occasio_salt_v2:${normalized}`);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}
