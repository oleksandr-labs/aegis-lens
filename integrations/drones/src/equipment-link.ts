/**
 * SEO: per-drone-model link to the equipment page.
 *
 * Maps a `DroneModel` to its canonical equipment-page slug and builds the URL
 * following the platform convention `/equipment/<slug>` (see
 * `packages/url-builder` → `urls.equipment(locale, slug)` and `equipmentOperator`).
 *
 * To avoid a hard dependency on `@aegis/types` Locale inside this integration
 * package, the builder accepts the locale as a plain string and applies the same
 * rule the url-builder uses: EN ("en") lives at root, other locales are prefixed.
 */

import { DroneModel } from "./types";

/** Canonical kebab-case equipment slug per model. */
export const MODEL_EQUIPMENT_SLUGS: Record<DroneModel, string> = {
  shahed_136: "shahed-136",
  shahed_131: "shahed-131",
  lancet_3: "lancet-3",
  lancet_1: "lancet-1",
  orlan_10: "orlan-10",
  orlan_30: "orlan-30",
  zala: "zala",
  bayraktar_tb2: "bayraktar-tb2",
  mugin_5: "mugin-5",
  fpv_kamikaze: "fpv-kamikaze",
  mavic: "dji-mavic",
  rb_341_forpost: "forpost-rb-341",
  eleron_3: "eleron-3",
  unknown: "unknown",
};

/** The equipment slug for a model, or undefined for "unknown". */
export function equipmentSlug(model: DroneModel): string | undefined {
  const slug = MODEL_EQUIPMENT_SLUGS[model];
  return slug === "unknown" ? undefined : slug;
}

/**
 * Build the equipment-page path for a drone model.
 * Mirrors `urls.equipment`: EN at root (`/equipment/<slug>`), other locales
 * prefixed (`/<locale>/equipment/<slug>`). Returns undefined for unknown models.
 */
export function equipmentLinkForModel(model: DroneModel, locale = "en"): string | undefined {
  const slug = equipmentSlug(model);
  if (!slug) return undefined;
  const path = `/equipment/${slug}`;
  return locale === "en" ? path : `/${locale}${path}`;
}
