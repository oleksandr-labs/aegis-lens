/**
 * Cloudflare Worker — locale negotiation at the edge.
 *
 * Redirects bare `/` requests to `/en` or `/uk` based on:
 *   1. Existing locale cookie (highest priority)
 *   2. Accept-Language header
 *   3. Default: /en
 *
 * Runs only on the apex path to avoid interfering with deep links.
 */

const SUPPORTED = ["en", "uk"];
const DEFAULT_LOCALE = "en";

function negotiateLocale(request) {
  // 1. Cookie
  const cookie = request.headers.get("Cookie") ?? "";
  const cookieMatch = cookie.match(/aegis_locale=([a-z]{2})/);
  if (cookieMatch && SUPPORTED.includes(cookieMatch[1])) {
    return cookieMatch[1];
  }

  // 2. Accept-Language
  const acceptLang = request.headers.get("Accept-Language") ?? "";
  for (const part of acceptLang.split(",")) {
    const lang = part.trim().split(";")[0].split("-")[0].toLowerCase();
    if (SUPPORTED.includes(lang)) return lang;
  }

  // 3. Default
  return DEFAULT_LOCALE;
}

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Only act on the bare apex path
    if (url.pathname !== "/") {
      return fetch(request);
    }

    const locale = negotiateLocale(request);
    url.pathname = `/${locale}`;

    return Response.redirect(url.toString(), 302);
  },
};
