/**
 * Oryx attribution (Task 10).
 *
 * Oryx is a volunteer-maintained OSINT project. Its dataset is the product of
 * thousands of hours of unpaid verification work. We cite it generously and
 * consistently EVERYWHERE Oryx data is shown or derived: equipment widgets,
 * the equipment-loss map layer, trend charts, the API route, and any export.
 *
 * This module is the single source of truth for the attribution string/links
 * so wording stays identical across surfaces.
 */

export const ORYX_HOMEPAGE = "https://www.oryxspioenkop.com";
export const ORYX_PROJECT_NAME = "Oryx";
export const ORYX_LIST_RU = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-equipment.html";
export const ORYX_LIST_UA = "https://www.oryxspioenkop.com/2022/02/attack-on-europe-documenting-ukrainian.html";

export interface OryxAttribution {
  /** Short inline credit. */
  short: { en: string; uk: string };
  /** Longer credit with the visual-verification caveat. */
  full: { en: string; uk: string };
  homepage: string;
  /** Canonical source lists. */
  lists: { russianLosses: string; ukrainianLosses: string };
}

/** Canonical attribution block. Use this wherever Oryx data is surfaced. */
export function oryxAttribution(): OryxAttribution {
  return {
    short: {
      en: "Source: Oryx (visually-confirmed losses)",
      uk: "Джерело: Oryx (візуально підтверджені втрати)",
    },
    full: {
      en: "Equipment-loss data from Oryx, a volunteer-run OSINT project that catalogs only visually-confirmed losses (each entry backed by photo/video evidence). Counts are a documented minimum, not a total.",
      uk: "Дані про втрати техніки з Oryx — волонтерського OSINT-проєкту, що фіксує лише візуально підтверджені втрати (кожен запис підкріплений фото/відео). Підрахунки є задокументованим мінімумом, а не повним числом.",
    },
    homepage: ORYX_HOMEPAGE,
    lists: { russianLosses: ORYX_LIST_RU, ukrainianLosses: ORYX_LIST_UA },
  };
}

/**
 * Build a per-item citation line including the specific evidence URL.
 * Use under individual loss entries / evidence thumbnails.
 */
export function evidenceCitation(
  evidenceUrl: string | undefined,
  oryxPostUrl: string,
  locale: "en" | "uk",
): string {
  const base =
    locale === "en"
      ? `Verified by Oryx`
      : `Перевірено Oryx`;
  const link = evidenceUrl ?? oryxPostUrl;
  return `${base} — ${link}`;
}

/**
 * Required attribution footer for any export/report that includes Oryx-derived
 * numbers. Returns plain text suitable for footnotes.
 */
export function exportAttributionFooter(locale: "en" | "uk"): string {
  const a = oryxAttribution();
  return `${a.full[locale]} ${a.homepage}`;
}
