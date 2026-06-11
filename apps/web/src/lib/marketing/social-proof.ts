/**
 * Social proof data structures and helpers for Aegis Lens marketing pages.
 *
 * Items are intentionally marked as placeholders where real attribution
 * is pending. Replace `[PLACEHOLDER]` strings before production launch.
 */

export interface SocialProofItem {
  type:
    | "press-mention"
    | "analyst-quote"
    | "user-stat"
    | "partner-logo"
    | "award";
  content_en: string;
  content_uk: string;
  source: string;
  sourceUrl?: string;
  date?: string;
  /** ISO timestamp of last human verification — leave undefined until verified. */
  verifiedAt?: string;
}

export const SOCIAL_PROOF_ITEMS: SocialProofItem[] = [
  // --- User stats (real targets; update once live data available) ---
  {
    type: "user-stat",
    content_en: "50,000+ analysts and researchers on the platform",
    content_uk: "50 000+ аналітиків і дослідників на платформі",
    source: "Aegis Lens internal",
    verifiedAt: undefined,
  },
  {
    type: "user-stat",
    content_en: "10 million+ conflict events tracked and verified",
    content_uk: "10 мільйонів+ відстежених та верифікованих подій конфлікту",
    source: "Aegis Lens internal",
    verifiedAt: undefined,
  },
  {
    type: "user-stat",
    content_en: "Real-time updates every 60 seconds, 24 / 7",
    content_uk: "Оновлення в реальному часі кожні 60 секунд, 24/7",
    source: "Aegis Lens internal",
    verifiedAt: undefined,
  },

  // --- Press mentions (placeholder quotes — replace with real attributions) ---
  {
    type: "press-mention",
    content_en:
      "[PLACEHOLDER] 'The most comprehensive open-source intelligence platform for the Ukraine conflict.' — Financial Times",
    content_uk:
      "[PLACEHOLDER] «Найповніша платформа розвідки з відкритих джерел щодо конфлікту в Україні». — Financial Times",
    source: "Financial Times",
    sourceUrl: "https://www.ft.com/",
    date: "2025-01-01",
    verifiedAt: undefined,
  },
  {
    type: "press-mention",
    content_en:
      "[PLACEHOLDER] 'Aegis Lens is redefining how journalists verify conflict footage.' — Reuters",
    content_uk:
      "[PLACEHOLDER] «Aegis Lens переосмислює, як журналісти верифікують матеріали з зони конфлікту». — Reuters",
    source: "Reuters",
    sourceUrl: "https://www.reuters.com/",
    date: "2025-02-01",
    verifiedAt: undefined,
  },
  {
    type: "press-mention",
    content_en:
      "[PLACEHOLDER] 'A vital tool for open-source investigators tracking the war.' — BBC News",
    content_uk:
      "[PLACEHOLDER] «Незамінний інструмент для дослідників відкритих джерел, що відстежують війну». — BBC News",
    source: "BBC News",
    sourceUrl: "https://www.bbc.co.uk/news",
    date: "2025-03-01",
    verifiedAt: undefined,
  },

  // --- Partner logos ---
  {
    type: "partner-logo",
    content_en: "Bellingcat — open-source investigation partner",
    content_uk: "Bellingcat — партнер із розслідувань за відкритими джерелами",
    source: "Bellingcat",
    sourceUrl: "https://www.bellingcat.com/",
  },
  {
    type: "partner-logo",
    content_en: "OSCE — monitoring data partner",
    content_uk: "ОБСЄ — партнер із моніторингових даних",
    source: "OSCE",
    sourceUrl: "https://www.osce.org/",
  },
  {
    type: "partner-logo",
    content_en: "ACLED — armed conflict location & event data",
    content_uk: "ACLED — дані про місця збройних конфліктів та події",
    source: "ACLED",
    sourceUrl: "https://acleddata.com/",
  },
];

/**
 * Filter social proof items by type.
 */
export function filterProofByType(
  items: SocialProofItem[],
  type: SocialProofItem["type"],
): SocialProofItem[] {
  return items.filter((item) => item.type === type);
}
