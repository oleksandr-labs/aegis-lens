import { NextRequest, NextResponse } from "next/server";
import { ACTIVE_LOCALES, DEFAULT_LOCALE, isLocale, negotiateLocale } from "@aegis/i18n-config";

const PUBLIC_FILE = /\.(.*)$/;

/**
 * Locale routing (see TODO/urls_slugs/TODO_url_localization.md):
 * - EN (default) at root: `/`, `/map`. Internally rewritten to `/en/...`
 *   so a single `[locale]` segment handles all pages.
 * - Non-EN locales: prefix preserved (`/uk/...`).
 * - `/en/...` is not canonical — redirect to `/...`.
 * - Inactive locale prefix → redirect to EN equivalent.
 * - No auto-redirect by Accept-Language (SEO). Cookie hint instead.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/admin") || // non-locale internal surface
    pathname.startsWith("/account") || // user dashboard — own layout, no locale chrome
    pathname.startsWith("/embed") || // iframe widgets — no locale chrome
    pathname.startsWith("/.well-known") ||
    pathname === "/apple-app-site-association" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/manifest.webmanifest" ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1] ?? "";

  if (isLocale(firstSegment)) {
    if (firstSegment === DEFAULT_LOCALE) {
      const rest = pathname.slice(firstSegment.length + 1) || "/";
      return NextResponse.redirect(new URL(rest, req.url));
    }
    if (!ACTIVE_LOCALES.includes(firstSegment)) {
      const rest = pathname.slice(firstSegment.length + 1) || "/";
      return NextResponse.redirect(new URL(rest, req.url));
    }
    return NextResponse.next();
  }

  // No prefix → rewrite internally to default locale.
  const url = req.nextUrl.clone();
  url.pathname = `/${DEFAULT_LOCALE}${pathname === "/" ? "" : pathname}`;
  const res = NextResponse.rewrite(url);

  const suggested = negotiateLocale(req.headers.get("accept-language"));
  if (suggested !== DEFAULT_LOCALE) {
    res.cookies.set("aegis_locale_suggestion", suggested, {
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      path: "/",
    });
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
};
