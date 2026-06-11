/**
 * alert_type taxonomy (task 10): air / artillery / urban combat / chemical (+ the
 * shared extras nuclear / radiological / info that the OBLASTS model carries).
 *
 * This is the canonical taxonomy table for this package: per-type severity (1–5),
 * danger 0–100, and tri-lingual (uk/en/ru) labels for alert text generation.
 * The civilian-alerts package only ships uk/en; here we ADD ru, per the TODO's
 * "UK + EN + RU" requirement.
 */

import type { AlertType } from "./types";

export interface AlertTypeInfo {
  type: AlertType;
  severity: 1 | 2 | 3 | 4 | 5;
  danger: number; // 0–100
  labelUk: string;
  labelEn: string;
  labelRu: string;
}

export const ALERT_TYPE_TAXONOMY: Record<AlertType, AlertTypeInfo> = {
  air_raid: {
    type: "air_raid", severity: 4, danger: 80,
    labelUk: "Повітряна тривога", labelEn: "Air raid alert", labelRu: "Воздушная тревога",
  },
  artillery: {
    type: "artillery", severity: 4, danger: 78,
    labelUk: "Загроза артобстрілу", labelEn: "Artillery threat", labelRu: "Угроза артобстрела",
  },
  urban_fighting: {
    type: "urban_fighting", severity: 5, danger: 92,
    labelUk: "Вуличні бої", labelEn: "Urban combat", labelRu: "Уличные бои",
  },
  chemical: {
    type: "chemical", severity: 5, danger: 95,
    labelUk: "Хімічна небезпека", labelEn: "Chemical hazard", labelRu: "Химическая опасность",
  },
  nuclear: {
    type: "nuclear", severity: 5, danger: 100,
    labelUk: "Ядерна загроза", labelEn: "Nuclear threat", labelRu: "Ядерная угроза",
  },
  radiological: {
    type: "radiological", severity: 5, danger: 95,
    labelUk: "Радіаційна небезпека", labelEn: "Radiological hazard", labelRu: "Радиационная опасность",
  },
  info: {
    type: "info", severity: 1, danger: 10,
    labelUk: "Інформаційне повідомлення", labelEn: "Information notice", labelRu: "Информационное сообщение",
  },
};

export type Locale = "uk" | "en" | "ru";

/** Localized label for an alert type. */
export function alertTypeLabel(type: AlertType, locale: Locale): string {
  const info = ALERT_TYPE_TAXONOMY[type] ?? ALERT_TYPE_TAXONOMY.info;
  return locale === "en" ? info.labelEn : locale === "ru" ? info.labelRu : info.labelUk;
}

/** Generate alert text per locale for a raise/clear of a given type + place. */
export function buildAlertText(
  type: AlertType,
  placeName: { uk: string; en: string; ru?: string },
  kind: "raise" | "clear",
  locale: Locale,
): string {
  const label = alertTypeLabel(type, locale);
  const place =
    locale === "en" ? placeName.en : locale === "ru" ? (placeName.ru ?? placeName.uk) : placeName.uk;

  if (kind === "raise") {
    if (locale === "en") return `${label} active in ${place}`;
    if (locale === "ru") return `${label} в ${place}`;
    return `${label} у ${place}`;
  }
  if (locale === "en") return `${label} all-clear in ${place}`;
  if (locale === "ru") return `Отбой: ${label.toLowerCase()} в ${place}`;
  return `Відбій: ${label.toLowerCase()} у ${place}`;
}
