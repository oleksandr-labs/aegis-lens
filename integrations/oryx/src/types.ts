/**
 * Oryx — visually-confirmed equipment-loss dataset types.
 *
 * Oryx (https://www.oryxspioenkop.com) is a volunteer-maintained OSINT blog
 * that catalogs equipment losses in the Russo-Ukrainian war. Every entry is
 * backed by a photo/video that visually confirms the loss — this is the
 * project's strict, defining standard.
 *
 * The data is published as:
 *   - human-readable blog posts (HTML lists with thumbnail evidence links)
 *   - community-maintained Google Sheets mirrors of the same tallies
 *
 * These types model a single visually-confirmed loss entry plus the small
 * supporting enumerations. All user-facing strings carry en + uk variants.
 */

// ── Sides ─────────────────────────────────────────────────────────────────────

/** Belligerent that *lost* the equipment in this entry. */
export type OryxSide = "ukraine" | "russia";

export const ORYX_SIDE_LABELS: Record<OryxSide, { en: string; uk: string; iso2: string }> = {
  ukraine: { en: "Ukraine", uk: "Україна", iso2: "ua" },
  russia: { en: "Russia", uk: "Росія", iso2: "ru" },
};

// ── Loss status ───────────────────────────────────────────────────────────────

/**
 * Oryx classifies each loss into one of four visually-distinguishable states.
 * These map 1:1 to the tags Oryx uses in its blog entries.
 */
export type OryxLossStatus = "destroyed" | "damaged" | "abandoned" | "captured";

export const ORYX_STATUS_LABELS: Record<OryxLossStatus, { en: string; uk: string }> = {
  destroyed: { en: "Destroyed", uk: "Знищено" },
  damaged: { en: "Damaged", uk: "Пошкоджено" },
  abandoned: { en: "Abandoned", uk: "Покинуто" },
  captured: { en: "Captured", uk: "Захоплено" },
};

// ── Equipment categories (Oryx's top-level groupings) ─────────────────────────

export type OryxEquipmentCategory =
  | "tanks"
  | "armoured_fighting_vehicles"
  | "infantry_fighting_vehicles"
  | "armoured_personnel_carriers"
  | "artillery"
  | "self_propelled_artillery"
  | "multiple_rocket_launchers"
  | "anti_aircraft"
  | "surface_to_air_missile"
  | "radar"
  | "aircraft"
  | "helicopter"
  | "unmanned_aerial_vehicle"
  | "naval"
  | "engineering"
  | "logistics"
  | "command_post"
  | "infantry_equipment"
  | "other";

export const ORYX_CATEGORY_LABELS: Record<OryxEquipmentCategory, { en: string; uk: string }> = {
  tanks: { en: "Tanks", uk: "Танки" },
  armoured_fighting_vehicles: { en: "Armoured Fighting Vehicles", uk: "Броньовані бойові машини" },
  infantry_fighting_vehicles: { en: "Infantry Fighting Vehicles", uk: "Бойові машини піхоти" },
  armoured_personnel_carriers: { en: "Armoured Personnel Carriers", uk: "Бронетранспортери" },
  artillery: { en: "Towed Artillery", uk: "Буксирована артилерія" },
  self_propelled_artillery: { en: "Self-Propelled Artillery", uk: "Самохідна артилерія" },
  multiple_rocket_launchers: { en: "Multiple Rocket Launchers", uk: "Реактивні системи залпового вогню" },
  anti_aircraft: { en: "Anti-Aircraft Guns", uk: "Зенітні гармати" },
  surface_to_air_missile: { en: "Surface-to-Air Missile Systems", uk: "Зенітні ракетні комплекси" },
  radar: { en: "Radars", uk: "Радари" },
  aircraft: { en: "Aircraft", uk: "Літаки" },
  helicopter: { en: "Helicopters", uk: "Вертольоти" },
  unmanned_aerial_vehicle: { en: "Unmanned Aerial Vehicles", uk: "Безпілотні літальні апарати" },
  naval: { en: "Naval Vessels", uk: "Кораблі та катери" },
  engineering: { en: "Engineering Vehicles", uk: "Інженерна техніка" },
  logistics: { en: "Logistics & Trucks", uk: "Логістика та вантажівки" },
  command_post: { en: "Command Posts", uk: "Командні пункти" },
  infantry_equipment: { en: "Infantry Equipment", uk: "Піхотне спорядження" },
  other: { en: "Other", uk: "Інше" },
};

// ── Localised text ────────────────────────────────────────────────────────────

export interface LocalizedName {
  en: string;
  uk: string;
  /** Latin transliteration of the Ukrainian name (for slugs / search). */
  translit?: string;
}

// ── Core entry ────────────────────────────────────────────────────────────────

/**
 * A single visually-confirmed equipment-loss entry.
 *
 * One *physical* lost vehicle/system = one OryxEntry. Oryx numbers each loss
 * within a model (e.g. "3rd T-72B3 destroyed"); we keep that ordinal so two
 * entries of the same model on the same day are distinguishable.
 */
export interface OryxEntry {
  /** Stable synthetic id: `oryx-<side>-<modelSlug>-<seq>`. */
  entryId: string;

  /** Belligerent that lost this equipment. */
  side: OryxSide;

  /** Oryx top-level category. */
  category: OryxEquipmentCategory;

  /** Specific equipment model (e.g. "T-72B3", "BMP-2"). */
  model: LocalizedName;

  /** Canonical model slug used to join Oryx losses to the KG equipment Entity. */
  modelSlug: string;

  /** Visual loss classification. */
  status: OryxLossStatus;

  /**
   * Date of the confirmed loss (ISO-8601 date, `YYYY-MM-DD`). Oryx dates are
   * the date the *evidence* surfaced; they are often coarse / approximate.
   */
  date?: string;
  /** True if `date` is approximate (month-only, "around", etc.). */
  dateApproximate?: boolean;

  /**
   * Coarse, human-readable location text as published by Oryx (e.g.
   * "near Avdiivka, Donetsk Oblast"). Oryx rarely gives precise coordinates.
   */
  locationText?: LocalizedName;
  /** Best-effort ISO 3166-2 oblast code, if the location text resolves to one. */
  regionCode?: string;

  /**
   * Evidence URL — the photo/video that visually confirms the loss. This is
   * the heart of the Oryx standard and MUST be preserved in every derived
   * artifact (see attribution.ts / kg-mapping.ts / event-mapping.ts).
   */
  evidenceUrl?: string;

  /** Permalink to the Oryx blog post this entry was extracted from. */
  oryxPostUrl: string;

  /** When this entry was ingested into our system (ISO-8601). */
  ingestedAt: string;
}

/** A daily-sync snapshot of the Oryx dataset. */
export interface OryxSnapshot {
  fetchedAt: string;
  entries: OryxEntry[];
  /** Total visually-confirmed losses in this snapshot. */
  total: number;
  /** Whether this snapshot is the bundled demo fixture (no live fetch). */
  isDemo: boolean;
  /** Source URL the snapshot was derived from. */
  sourceUrl: string;
}
