/**
 * Brand configuration for Aegis Lens.
 * Name and slogan are locked — do not change without brand review.
 */

export const BrandName = "Aegis Lens" as const;
export const BrandSlogan = "Intelligence at the speed of events" as const;

export interface BrandConfig {
  name: string;
  slogan_en: string;
  slogan_uk: string;
  logoVariants: string[];
  wordmarkUrl: string;
  monogramUrl: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  dangerColor: string;
  successColor: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
}

export const AEGIS_BRAND: BrandConfig = {
  name: BrandName,
  slogan_en: BrandSlogan,
  slogan_uk: "Розвідка зі швидкістю подій",
  logoVariants: ["horizontal", "stacked", "monogram", "dark", "light"],
  wordmarkUrl: "/brand/aegis-lens-wordmark.svg",
  monogramUrl: "/brand/aegis-lens-monogram.svg",
  // Deep navy — primary background / brand foundation
  primaryColor: "#0B1120",
  // Charcoal — secondary surface / card backgrounds
  secondaryColor: "#1A2332",
  // Signal accent — cyan-electric for highlights, CTAs, live indicators
  accentColor: "#00D4FF",
  dangerColor: "#FF4040",
  successColor: "#00C48C",
  fontDisplay: "Inter Display",
  fontBody: "Inter",
  fontMono: "JetBrains Mono",
};

/**
 * Historical record of name candidates considered before locking on Aegis Lens.
 * Keep for institutional memory and trademark evidence.
 */
export const NAME_CANDIDATES_CONSIDERED: string[] = [
  "Aegis Lens", // chosen
  "Sentinel Grid",
  "Northstar OSINT",
  "Helix Intelligence",
  "Vantage One",
  "Pravda Intel",
  "OSINTOS",
];

export const DOMAIN_STATUS: {
  domain: string;
  status: "registered" | "available" | "taken" | "deferred";
}[] = [
  { domain: "aegislens.io", status: "deferred" },
  { domain: "aegislens.com", status: "deferred" },
  { domain: "aegislens.ai", status: "deferred" },
  { domain: "aegis.lens", status: "deferred" },
  { domain: "sentinelgrid.io", status: "deferred" },
  { domain: "sentinelgrid.ai", status: "deferred" },
  { domain: "vantage.one", status: "deferred" },
  { domain: "helixintel.ai", status: "deferred" },
];
