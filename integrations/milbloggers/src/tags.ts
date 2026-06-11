/**
 * Per-account specialty tag catalog.
 *
 * Tags describe what an account is reliably good at, so the pipeline can route
 * a post to the right corroboration peers and the product can filter by focus.
 * This is editorial metadata, not an algorithmic inference.
 */

import type { SpecialtyTag, L10nText } from "./types";

export const SPECIALTY_TAGS: Record<SpecialtyTag, L10nText> = {
  frontline: {
    en: "Front-line situation reports",
    uk: "Зведення з лінії фронту",
    ru: "Сводки с линии фронта",
  },
  air_defense: {
    en: "Air-defense / missile-defense tracking",
    uk: "Протиповітряна / протиракетна оборона",
    ru: "Противовоздушная / противоракетная оборона",
  },
  drones: {
    en: "Drone / UAV operations",
    uk: "Операції з дронами / БпЛА",
    ru: "Операции с дронами / БпЛА",
  },
  geolocation: {
    en: "Geolocation / visual verification",
    uk: "Геолокація / візуальна верифікація",
    ru: "Геолокация / визуальная верификация",
  },
  equipment_id: {
    en: "Equipment identification",
    uk: "Ідентифікація техніки",
    ru: "Идентификация техники",
  },
  naval: {
    en: "Naval / maritime activity",
    uk: "Військово-морська активність",
    ru: "Военно-морская активность",
  },
  logistics: {
    en: "Logistics / supply lines",
    uk: "Логістика / лінії постачання",
    ru: "Логистика / линии снабжения",
  },
  war_crimes: {
    en: "War-crimes documentation",
    uk: "Документування воєнних злочинів",
    ru: "Документирование военных преступлений",
  },
  humanitarian: {
    en: "Humanitarian impact",
    uk: "Гуманітарні наслідки",
    ru: "Гуманитарные последствия",
  },
  cyber: {
    en: "Cyber operations",
    uk: "Кібероперації",
    ru: "Кибероперации",
  },
  propaganda_analysis: {
    en: "Propaganda / opposite-narrative analysis",
    uk: "Аналіз пропаганди / протилежного наративу",
    ru: "Анализ пропаганды / противоположного нарратива",
  },
  official: {
    en: "Official government / military statements",
    uk: "Офіційні урядові / військові заяви",
    ru: "Официальные правительственные / военные заявления",
  },
  investigative: {
    en: "Long-form investigative work",
    uk: "Журналістські розслідування",
    ru: "Журналистские расследования",
  },
};

export function tagLabel(tag: SpecialtyTag): L10nText {
  return SPECIALTY_TAGS[tag];
}

export function isSpecialtyTag(value: string): value is SpecialtyTag {
  return Object.prototype.hasOwnProperty.call(SPECIALTY_TAGS, value);
}

/** All canonical tags. */
export function allTags(): SpecialtyTag[] {
  return Object.keys(SPECIALTY_TAGS) as SpecialtyTag[];
}
