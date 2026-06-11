/**
 * CTA configuration for Aegis Lens marketing surfaces.
 *
 * CTAs are persona-aware; the correct variant is selected at render time
 * via getCtaForPersona() using the utm_persona query parameter.
 */

export type CtaVariant =
  | "sticky-bar"
  | "inline"
  | "modal"
  | "exit-intent"
  | "hero-primary"
  | "hero-secondary";

export interface CtaConfig {
  variant: CtaVariant;
  text_en: string;
  text_uk: string;
  href: string;
  trackingEvent: string;
  /** Persona tags this CTA is relevant for. Empty array = all personas. */
  personaTags: string[];
  /** Show sticky / inline CTA only after user has scrolled this % of the page. */
  showAfterScrollPct?: number;
  /** Once dismissed, never show again in the same session. */
  singleUse: boolean;
}

/** Feature flag — "try without signup" demo embed. Off until sandbox is ready. */
export const DEMO_EMBED_ENABLED = false;

export const CTA_CONFIGS: CtaConfig[] = [
  // 1. Primary hero CTA — all personas
  {
    variant: "hero-primary",
    text_en: "Start for free",
    text_uk: "Почати безплатно",
    href: "/signup",
    trackingEvent: "cta_hero_primary_click",
    personaTags: [],
    singleUse: false,
  },

  // 2. Secondary hero — "try without signup" (gated behind DEMO_EMBED_ENABLED)
  {
    variant: "hero-secondary",
    text_en: "Try the live demo",
    text_uk: "Спробувати живе демо",
    href: DEMO_EMBED_ENABLED ? "/demo" : "/request-demo",
    trackingEvent: "cta_hero_demo_click",
    personaTags: [],
    singleUse: false,
  },

  // 3. Sticky bar — appears after 60% scroll depth
  {
    variant: "sticky-bar",
    text_en: "Get free access — no card required",
    text_uk: "Безплатний доступ — картка не потрібна",
    href: "/signup",
    trackingEvent: "cta_sticky_bar_click",
    personaTags: [],
    showAfterScrollPct: 60,
    singleUse: false,
  },

  // 4. Exit-intent modal — respectful, single use
  {
    variant: "exit-intent",
    text_en: "Before you go — get your free account",
    text_uk: "Перш ніж піти — отримайте безплатний акаунт",
    href: "/signup?source=exit-intent",
    trackingEvent: "cta_exit_intent_click",
    personaTags: [],
    singleUse: true,
  },

  // 5. Analyst-specific inline CTA
  {
    variant: "inline",
    text_en: "Request analyst access",
    text_uk: "Запросити аналітичний доступ",
    href: "/signup?persona=analyst",
    trackingEvent: "cta_inline_analyst_click",
    personaTags: ["analyst", "researcher"],
    singleUse: false,
  },

  // 6. Journalist-specific inline CTA
  {
    variant: "inline",
    text_en: "Verify your next story with Aegis Lens",
    text_uk: "Верифікуйте свій наступний матеріал з Aegis Lens",
    href: "/signup?persona=journalist",
    trackingEvent: "cta_inline_journalist_click",
    personaTags: ["journalist"],
    singleUse: false,
  },

  // 7. Government / procurement modal CTA
  {
    variant: "modal",
    text_en: "Request government briefing",
    text_uk: "Запросити урядовий брифінг",
    href: "/contact?persona=gov",
    trackingEvent: "cta_modal_gov_click",
    personaTags: ["gov", "government", "ngo"],
    singleUse: false,
  },

  // 8. Comparison page inline CTA
  {
    variant: "inline",
    text_en: "Switch to Aegis Lens today",
    text_uk: "Перейдіть на Aegis Lens вже сьогодні",
    href: "/signup?source=comparison",
    trackingEvent: "cta_inline_comparison_click",
    personaTags: ["compare", "vs"],
    singleUse: false,
  },
];

/**
 * Return the most relevant CTA for a given persona string.
 * Prefers a persona-specific match; falls back to the hero-primary CTA.
 */
export function getCtaForPersona(persona: string): CtaConfig {
  const normalised = persona.toLowerCase().trim();

  const match = CTA_CONFIGS.find(
    (cta) =>
      cta.personaTags.length > 0 &&
      cta.personaTags.some((tag) => tag === normalised),
  );

  return match ?? (CTA_CONFIGS.find((c) => c.variant === "hero-primary") as CtaConfig);
}
