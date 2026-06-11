/**
 * Alt text policy for Aegis Lens.
 *
 * Defines per-image-type rules for:
 *   - Whether manual alt text is mandatory
 *   - Template for auto-generated alt text
 *   - Maximum length (JAWS/NVDA truncates at ~150 chars; screen-shot descriptions longer)
 *
 * Reference: https://www.w3.org/WAI/tutorials/images/
 */

export type ImageType =
  | "map-screenshot"
  | "event-photo"
  | "satellite"
  | "logo"
  | "decorative"
  | "chart"
  | "icon";

export interface AltTextPolicy {
  imageType: ImageType;
  /** If true, alt text must be written by a human — no auto template acceptable. */
  requiresManualAlt: boolean;
  /**
   * Template for auto-generated alt text.
   * Use {key} placeholders that are filled from the metadata object.
   * Empty string signals that this type should use alt="" (decorative).
   */
  autoAltTemplate_en: string;
  autoAltTemplate_uk: string;
  /** Recommended maximum character length. */
  maxLength: number;
}

export const ALT_TEXT_POLICIES: Record<ImageType, AltTextPolicy> = {
  "map-screenshot": {
    imageType: "map-screenshot",
    requiresManualAlt: true,
    autoAltTemplate_en:
      "Map screenshot showing {eventCount} events in {region} as of {date}.",
    autoAltTemplate_uk:
      "Знімок карти з {eventCount} подіями в регіоні {region} станом на {date}.",
    maxLength: 150,
  },
  "event-photo": {
    imageType: "event-photo",
    requiresManualAlt: true,
    autoAltTemplate_en:
      "Photo: {eventType} in {location}, {date}. Source: {source}.",
    autoAltTemplate_uk:
      "Фото: {eventType} у {location}, {date}. Джерело: {source}.",
    maxLength: 150,
  },
  "satellite": {
    imageType: "satellite",
    requiresManualAlt: true,
    autoAltTemplate_en:
      "Satellite image of {location} captured {date}. Resolution: {resolution}.",
    autoAltTemplate_uk:
      "Супутниковий знімок {location}, отриманий {date}. Роздільна здатність: {resolution}.",
    maxLength: 200,
  },
  "logo": {
    imageType: "logo",
    requiresManualAlt: false,
    autoAltTemplate_en: "{organizationName} logo",
    autoAltTemplate_uk: "Логотип {organizationName}",
    maxLength: 50,
  },
  "decorative": {
    imageType: "decorative",
    requiresManualAlt: false,
    // Decorative images must have empty alt="" — no template content
    autoAltTemplate_en: "",
    autoAltTemplate_uk: "",
    maxLength: 0,
  },
  "chart": {
    imageType: "chart",
    requiresManualAlt: true,
    autoAltTemplate_en:
      "{chartType} chart: {description}. Data range: {dateRange}.",
    autoAltTemplate_uk:
      "Діаграма {chartType}: {description}. Діапазон даних: {dateRange}.",
    maxLength: 250,
  },
  "icon": {
    imageType: "icon",
    requiresManualAlt: false,
    // Icon alt text is typically provided by the surrounding button/link label
    autoAltTemplate_en: "{iconLabel}",
    autoAltTemplate_uk: "{iconLabel}",
    maxLength: 40,
  },
};

/**
 * Generate an alt text string from a policy template and metadata.
 *
 * Returns empty string for decorative images (alt="").
 * Leaves {placeholder} tokens in place if the matching key is not in metadata,
 * so missing data is visible during review rather than silently empty.
 */
export function generateAutoAlt(
  imageType: ImageType,
  metadata: Record<string, string>,
  locale: "en" | "uk",
): string {
  const policy = ALT_TEXT_POLICIES[imageType];

  if (policy.imageType === "decorative") return "";

  const template =
    locale === "uk" ? policy.autoAltTemplate_uk : policy.autoAltTemplate_en;

  const result = template.replace(/\{(\w+)\}/g, (_, key: string) => {
    return metadata[key] ?? `{${key}}`;
  });

  return result.slice(0, policy.maxLength || result.length);
}
