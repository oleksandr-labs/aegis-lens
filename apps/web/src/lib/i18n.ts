import "server-only";
import { ACTIVE_LOCALES, DEFAULT_LOCALE, FALLBACK_CHAIN, type Locale } from "@aegis/i18n-config";

/**
 * Minimal in-house i18n. Server-only.
 *
 * Why not next-intl yet: keep deps minimal until copy volume justifies a
 * heavier library. Same API surface; can swap later.
 */

type Messages = Record<string, string>;
type Namespace = "common" | "home" | "map" | "auth" | "regions" | "errors" | "marketing";

const cache = new Map<string, Messages>();

async function load(locale: Locale, ns: Namespace): Promise<Messages> {
  const key = `${locale}:${ns}`;
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const mod = await import(`@/messages/${locale}/${ns}.json`);
    const messages = mod.default as Messages;
    cache.set(key, messages);
    return messages;
  } catch {
    // Missing file → empty; caller handles fallback.
    cache.set(key, {});
    return {};
  }
}

/**
 * Get a translator scoped to a namespace, with fallback chain applied.
 */
export async function getT(locale: Locale, ns: Namespace) {
  const chain: Locale[] = [locale, ...(FALLBACK_CHAIN[locale] ?? []), DEFAULT_LOCALE];
  const seen = new Set<Locale>();
  const ordered = chain.filter((lc) => (seen.has(lc) ? false : (seen.add(lc), true)));
  const bundles = await Promise.all(ordered.map((lc) => load(lc, ns)));

  return function t(key: string, vars?: Record<string, string | number>): string {
    for (const bundle of bundles) {
      const raw = bundle[key];
      if (raw !== undefined) return interpolate(raw, vars);
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[i18n] Missing key "${ns}:${key}" for locale "${locale}"`);
    }
    return key;
  };
}

function interpolate(s: string, vars?: Record<string, string | number>): string {
  if (!vars) return s;
  return s.replace(/\{(\w+)\}/g, (_, k) => (k in vars ? String(vars[k]) : `{${k}}`));
}

export { ACTIVE_LOCALES, DEFAULT_LOCALE };
export type { Locale };
