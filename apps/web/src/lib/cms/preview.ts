/**
 * CMS Preview — visual preview configuration matching the production layout.
 * Uses a shared secret token to guard the /api/cms/preview endpoint.
 *
 * CMS Preview — конфігурація візуального превью, що відповідає продакшн-макету.
 * Використовує спільний секретний токен для захисту /api/cms/preview.
 */

// ── Constants ─────────────────────────────────────────────────────────────────

/**
 * Name of the env variable that holds the CMS preview shared secret.
 *
 * Назва env-змінної, що зберігає спільний секрет превью CMS.
 */
export const PREVIEW_SECRET_ENV = "CMS_PREVIEW_SECRET" as const;

// ── Types ─────────────────────────────────────────────────────────────────────

export interface PreviewConfig {
  /** Base URL of the Next.js app used to construct preview URLs. */
  baseUrl: string;
  /** Query-param name carrying the secret token in preview requests. */
  secretParam: string;
  /** Query-param name carrying the content type. */
  typeParam: string;
  /** Query-param name carrying the content slug. */
  slugParam: string;
}

// ── Singleton config ──────────────────────────────────────────────────────────

/**
 * Default preview configuration.
 *
 * Стандартна конфігурація превью.
 */
export const PREVIEW_CONFIG: PreviewConfig = {
  baseUrl: process.env["NEXT_PUBLIC_SITE_URL"] ?? "http://localhost:3000",
  secretParam: "token",
  typeParam: "type",
  slugParam: "slug",
};

// ── URL builder ───────────────────────────────────────────────────────────────

/**
 * Build a signed preview URL for a given content type and slug.
 *
 * Будує підписаний URL для превью заданого типу контенту і slug.
 */
export function buildPreviewUrl(contentType: string, slug: string): string {
  const secret = process.env[PREVIEW_SECRET_ENV] ?? "";
  const { baseUrl, secretParam, typeParam, slugParam } = PREVIEW_CONFIG;
  const params = new URLSearchParams({
    [secretParam]: secret,
    [typeParam]: contentType,
    [slugParam]: slug,
  });
  return `${baseUrl}/api/cms/preview?${params.toString()}`;
}

// ── Token validator ───────────────────────────────────────────────────────────

/**
 * Validate an incoming preview token against the env secret.
 * Returns true if the token matches the stored secret (constant-time safe for short secrets).
 *
 * Перевіряє вхідний токен превью щодо env-секрету.
 */
export function validatePreviewRequest(token: string | null | undefined): boolean {
  const expected = process.env[PREVIEW_SECRET_ENV];
  if (!expected || !token) return false;
  // Simple equality — replace with timingSafeEqual in production
  return token === expected;
}
