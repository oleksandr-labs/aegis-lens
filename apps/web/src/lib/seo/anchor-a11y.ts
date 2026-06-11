/**
 * Accessibility helpers for links — the codeable contract behind the
 * "image-alt-as-anchor" and "aria-label for icon links" anchor-text rules.
 *
 * These produce the correct accessible name + a11y props for the three link
 * shapes the site renders: text links, image links, and icon-only links.
 * Locale-aware (en+uk) so the accessible name is translated, not transliterated.
 */

import type { Locale } from "@aegis/i18n-config";

export type IconLinkProps = {
  "aria-label": string;
  /** Icon glyph/svg is decorative once the link is labelled. */
  "aria-hidden"?: undefined;
};

export type ImageLinkAlt = {
  alt: string;
};

/**
 * Resolve the accessible name a screen reader will announce for a link.
 * Mirrors the browser accessible-name algorithm (simplified):
 *   aria-label > visible text > image alt > "" (a violation).
 */
export function accessibleName(opts: {
  text?: string;
  imageAlt?: string;
  ariaLabel?: string;
}): string {
  if (opts.ariaLabel && opts.ariaLabel.trim()) return opts.ariaLabel.trim();
  if (opts.text && opts.text.trim()) return opts.text.trim();
  if (opts.imageAlt && opts.imageAlt.trim()) return opts.imageAlt.trim();
  return "";
}

/** True when a link will be announced as nameless (an a11y + SEO defect). */
export function isNameless(opts: {
  text?: string;
  imageAlt?: string;
  ariaLabel?: string;
}): boolean {
  return accessibleName(opts) === "";
}

/**
 * Build aria props for an icon-only link. `label` should be a translated,
 * descriptive phrase ("Open menu" / "Відкрити меню") — never a transliteration.
 */
export function iconLinkProps(label: string): IconLinkProps {
  const trimmed = label.trim();
  if (!trimmed) {
    throw new Error("iconLinkProps: label is required for icon-only links");
  }
  return { "aria-label": trimmed };
}

/**
 * Build the alt attribute for an image used as a link. The alt should describe
 * the link *destination* (it is the anchor), not merely the picture.
 */
export function imageLinkAlt(destinationDescription: string): ImageLinkAlt {
  const trimmed = destinationDescription.trim();
  if (!trimmed) {
    throw new Error("imageLinkAlt: description is required for linked images");
  }
  return { alt: trimmed };
}

/**
 * Standard translated labels for the recurring icon links across the app.
 * Extend as needed; keeps icon a11y centralized and locale-correct.
 */
export const ICON_LINK_LABELS: Record<string, Partial<Record<Locale, string>> & { en: string }> = {
  home: { en: "Home", uk: "Головна" },
  menu: { en: "Open menu", uk: "Відкрити меню" },
  search: { en: "Search", uk: "Пошук" },
  rss: { en: "Subscribe via RSS", uk: "Підписатися через RSS" },
  share: { en: "Share", uk: "Поділитися" },
  external: { en: "Opens in a new tab", uk: "Відкривається в новій вкладці" },
};

export function iconLabel(key: keyof typeof ICON_LINK_LABELS, locale: Locale): string {
  const entry = ICON_LINK_LABELS[key];
  return entry[locale] ?? entry.en;
}
