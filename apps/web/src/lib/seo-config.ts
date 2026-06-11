/**
 * Routes that should not be indexed by search engines.
 * Used by generateMetadata on sensitive/authenticated pages.
 */
export const NOINDEX_ROUTES = [
  "/admin",
  "/account",
  "/settings",
  "/cases",
  "/embed/builder",
  "/magic-link",
  "/forgot-password",
  "/reports/generate",
] as const;

export function shouldNoindex(pathname: string): boolean {
  return NOINDEX_ROUTES.some((r) => pathname.startsWith(r));
}
